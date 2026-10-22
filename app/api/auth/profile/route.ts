import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { sql } from "@/lib/db";
import { sanitizeText } from "@/lib/sanitize";
import { isTrustedUploadReference } from "@/lib/security";
import { createNotification } from "@/lib/actions/notifications";
import { protectFin, validateFin } from "@/lib/fin-protection";
import { getClientIdentityColumns, validateClientIdentityDocument } from "@/lib/client-verification";
import { recordVerificationSubmission } from "@/lib/verification-operations";

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const registerSchema = z.object({
  email: z.string().email().nullable().or(z.literal("")).optional(),
  password: passwordSchema,
  role: z.enum(["client", "worker"]),
  fullName: z.string().min(2),
  phone: z.string().min(9).regex(/^\+?[0-9\-() ]{9,16}$/, 'Invalid phone number format'),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  district: z.string().optional(),
  skills: z.array(z.string()).optional(),
  faydaDocUrl: z.string().optional(),
  faydaDocDataUrl: z.string().optional(),
  faydaFinNumber: z.string().optional(),
  bio: z.string().optional(),
  neonUserId: z.string().uuid().optional(),
});

const MAX_CERTIFICATES = 5;
const MAX_CERTIFICATE_SIZE = 1024 * 1024;
const MAX_CERTIFICATES_TOTAL = 2 * 1024 * 1024;
const MAX_PROFILE_PHOTO_SIZE = 250 * 1024;
const CERTIFICATE_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const PROFILE_PHOTO_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function toDataUrl(file: File) {
  return `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    let profilePhoto: File | null = null;
    let certificateFiles: File[] = [];
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await req.formData();
      const payload = form.get("payload");
      if (typeof payload !== "string") {
        return NextResponse.json({ error: "Registration details are missing." }, { status: 400 });
      }
      body = JSON.parse(payload);
      const photoEntry = form.get("profilePhoto");
      profilePhoto = photoEntry instanceof File ? photoEntry : null;
      certificateFiles = form.getAll("trainingCertificates").filter((entry): entry is File => entry instanceof File);
    } else {
      body = await req.json();
    }
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      console.error("[REGISTER_VALIDATION_ERROR]", parsed.error.flatten());
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, role, fullName, phone, neonUserId } = parsed.data;
    const phoneDigits = phone.replace(/\D/g, "");
    const normalizedPhone = phoneDigits.length === 10 && phoneDigits.startsWith("0") ? phoneDigits.slice(1) : phoneDigits;
    if (!/^\d{9}$/.test(normalizedPhone)) {
      return NextResponse.json({ error: "Enter a valid 9-digit phone number without the +251 country code." }, { status: 400 });
    }

    let profilePhotoDataUrl: string | null = null;
    const certificateDataUrls: Array<{ name: string; mimeType: string; dataUrl: string; size: number }> = [];
    if (role === "worker") {
      const faydaDocUrl = parsed.data.faydaDocUrl;
      if (!faydaDocUrl) {
        return NextResponse.json({ error: "A Fayda ID document is required for worker registration." }, { status: 400 });
      }
      if (!isTrustedUploadReference(faydaDocUrl, { allowDataImage: true })) {
        return NextResponse.json({ error: "Invalid Fayda document reference" }, { status: 400 });
      }
      if (!profilePhoto || !PROFILE_PHOTO_MIME_TYPES.has(profilePhoto.type) || profilePhoto.size === 0 || profilePhoto.size > MAX_PROFILE_PHOTO_SIZE) {
        return NextResponse.json({ error: "A valid profile photo under 250 KB is required." }, { status: 400 });
      }
      if (certificateFiles.length < 1 || certificateFiles.length > MAX_CERTIFICATES) {
        return NextResponse.json({ error: "Upload between 1 and 5 learning certificates." }, { status: 400 });
      }
      let certificatesSize = 0;
      for (const file of certificateFiles) {
        if (!CERTIFICATE_MIME_TYPES.has(file.type) || file.size === 0 || file.size > MAX_CERTIFICATE_SIZE) {
          return NextResponse.json({ error: "Each certificate must be a PDF, JPG, PNG, or WEBP file no larger than 1 MB." }, { status: 400 });
        }
        certificatesSize += file.size;
        certificateDataUrls.push({
          name: file.name.replace(/[\\/\0-\x1f]/g, "_").slice(0, 180) || "certificate",
          mimeType: file.type,
          dataUrl: await toDataUrl(file),
          size: file.size,
        });
      }
      if (certificatesSize > MAX_CERTIFICATES_TOTAL) {
        return NextResponse.json({ error: "All certificates together must be no larger than 2 MB." }, { status: 400 });
      }
      profilePhotoDataUrl = await toDataUrl(profilePhoto);
    }

    if (!neonUserId) {
      return NextResponse.json({ error: "Missing Neon User ID" }, { status: 400 });
    }

    const sanitizedFullName = sanitizeText(fullName);
    let protectedClientFin: ReturnType<typeof protectFin> | null = null;
    let submittedClientDocument: string | null = null;
    const clientColumns = role === "client" ? await getClientIdentityColumns() : null;

    if (role === "client") {
      const { faydaFinNumber, faydaDocDataUrl } = parsed.data;
      const hasFin = typeof faydaFinNumber === "string" && faydaFinNumber.trim().length > 0;
      const hasDoc = typeof faydaDocDataUrl === "string" && faydaDocDataUrl.trim().length > 0;

      if (hasFin !== hasDoc) {
        return NextResponse.json(
          { error: "Submit both your 12-digit FIN and Fayda ID image together, or skip verification for now." },
          { status: 400 }
        );
      }

      if (hasFin && hasDoc) {
        const normalizedFin = validateFin(faydaFinNumber);
        if (!normalizedFin) {
          return NextResponse.json({ error: "FIN must be exactly 12 digits." }, { status: 400 });
        }

        const docValidation = validateClientIdentityDocument(faydaDocDataUrl);
        if (!docValidation.ok) {
          return NextResponse.json({ error: docValidation.error }, { status: 400 });
        }

        protectedClientFin = protectFin(normalizedFin, neonUserId, "profile");
        submittedClientDocument = faydaDocDataUrl;
      }
    }

    // Neon Auth creates the identity first. Reuse its matching local row so a
    // retry can finish profile creation after a transient database/API failure.
    const normalizedEmail = (email || `phone-${normalizedPhone}`).trim().toLowerCase();
    const existingUsers = await sql`
      SELECT id, role
      FROM users
      WHERE id = ${neonUserId}
         OR lower(email) = ${normalizedEmail}
      ORDER BY (id = ${neonUserId}) DESC
      LIMIT 1
    `;
    let userId: string;
    if (existingUsers[0]) {
      if (existingUsers[0].id !== neonUserId || existingUsers[0].role !== role) {
        return NextResponse.json({ error: "An account already exists with this email or phone number." }, { status: 409 });
      }
      userId = existingUsers[0].id;
    } else {
      const newUser = await sql`
        INSERT INTO users (id, email, password_hash, role, phone)
        VALUES (${neonUserId}, ${normalizedEmail}, 'managed_by_neon_auth', ${role}, ${normalizedPhone})
        RETURNING id
      `;
      userId = newUser[0].id;
    }

    // Insert role-specific profile
    if (role === "worker") {
      const { dateOfBirth, gender, district, skills, faydaDocUrl, bio } = parsed.data;
      const sanitizedBio = bio ? sanitizeText(bio) : null;
      const sanitizedDistrict = district ? sanitizeText(district) : null;

      if (!profilePhotoDataUrl || certificateDataUrls.length === 0) {
        return NextResponse.json({ error: "Worker profile photo and learning certificates are required." }, { status: 400 });
      }
      const existingProfile = await sql`SELECT user_id FROM worker_profiles WHERE user_id = ${userId} LIMIT 1`;
      if (existingProfile[0]) {
        await sql`
          UPDATE worker_profiles
          SET full_name = ${sanitizedFullName}, date_of_birth = ${dateOfBirth ? new Date(dateOfBirth) : null},
              gender = ${gender ?? null}, district = ${sanitizedDistrict}, skills = ${skills ?? null},
              fayda_doc_url = ${faydaDocUrl ?? null}, avatar_url = ${profilePhotoDataUrl}, bio = ${sanitizedBio}
          WHERE user_id = ${userId}
        `;
      } else {
        await sql`
          INSERT INTO worker_profiles (user_id, full_name, date_of_birth, gender, district, skills, fayda_doc_url, avatar_url, bio, verification_status)
          VALUES (${userId}, ${sanitizedFullName}, ${dateOfBirth ? new Date(dateOfBirth) : null}, ${gender ?? null}, ${sanitizedDistrict}, ${skills ?? null}, ${faydaDocUrl ?? null}, ${profilePhotoDataUrl}, ${sanitizedBio}, 'pending')
        `;
      }
      await sql`DELETE FROM worker_training_certificates WHERE worker_user_id = ${userId}`;
      for (const certificate of certificateDataUrls) {
        await sql`
          INSERT INTO worker_training_certificates (worker_user_id, file_name, mime_type, file_size, document_data_url)
          VALUES (${userId}, ${certificate.name}, ${certificate.mimeType}, ${certificate.size}, ${certificate.dataUrl})
        `;
      }
      if (faydaDocUrl) {
        await recordVerificationSubmission("worker", userId, faydaDocUrl, null).catch((error) => {
          console.error("[REGISTER_VERIFICATION_SUBMISSION_ERROR]", error);
        });
      }
    } else {
      const existingProfile = await sql`SELECT user_id FROM client_profiles WHERE user_id = ${userId} LIMIT 1`;
      if (existingProfile[0]) {
        if (protectedClientFin && submittedClientDocument) {
          await sql`
            UPDATE client_profiles
            SET fayda_doc_url = ${submittedClientDocument},
                fin_encrypted = ${protectedClientFin.finEncrypted},
                fin_encryption_key_id = ${protectedClientFin.finEncryptionKeyId},
                fin_fingerprint = ${protectedClientFin.finFingerprint},
                fin_last4 = ${protectedClientFin.finLast4},
                verification_status = 'pending',
                is_verified = false
            WHERE user_id = ${userId}
          `;
          await recordVerificationSubmission("client", userId, submittedClientDocument, protectedClientFin.finLast4).catch((error) => {
            console.error("[REGISTER_VERIFICATION_SUBMISSION_ERROR]", error);
          });
        }
        return NextResponse.json({ message: "Registration successful", userId }, { status: 200 });
      }
      if (protectedClientFin) {
        if (clientColumns?.has("verification_status")) {
          await sql`
            INSERT INTO client_profiles (
              user_id,
              full_name,
              fayda_doc_url,
              fin_encrypted,
              fin_encryption_key_id,
              fin_fingerprint,
              fin_last4,
              verification_status,
              is_verified
            )
            VALUES (
              ${userId},
              ${sanitizedFullName},
              ${submittedClientDocument},
              ${protectedClientFin.finEncrypted},
              ${protectedClientFin.finEncryptionKeyId},
              ${protectedClientFin.finFingerprint},
              ${protectedClientFin.finLast4},
              'pending',
              false
            )
          `;
        } else {
          await sql`
            INSERT INTO client_profiles (
              user_id,
              full_name,
              fayda_doc_url,
              fin_encrypted,
              fin_encryption_key_id,
              fin_fingerprint,
              fin_last4,
              is_verified
            )
            VALUES (
              ${userId},
              ${sanitizedFullName},
              ${submittedClientDocument},
              ${protectedClientFin.finEncrypted},
              ${protectedClientFin.finEncryptionKeyId},
              ${protectedClientFin.finFingerprint},
              ${protectedClientFin.finLast4},
              false
            )
          `;
        }
      } else {
        await sql`
          INSERT INTO client_profiles (user_id, full_name, verification_status, is_verified)
          VALUES (${userId}, ${sanitizedFullName}, 'not_started', false)
        `;
      }

      if (protectedClientFin) {
        await recordVerificationSubmission("client", userId, submittedClientDocument, protectedClientFin.finLast4).catch((error) => {
          console.error("[REGISTER_VERIFICATION_SUBMISSION_ERROR]", error);
        });
        await sql`
          INSERT INTO audit_logs (user_id, action, details)
          VALUES (
            ${userId},
            'client_verification_submitted',
            ${JSON.stringify({
              userId,
              status: "pending",
              source: "registration",
              timestamp: new Date().toISOString(),
            })}
          )
        `.catch((error: unknown) => console.error("[REGISTER_AUDIT_LOG_ERROR]", error));
      }
      await createNotification({
        userId,
        type: "identity_verification_required",
        title: "Complete Fayda Verification",
        body: "Complete Fayda identity verification before creating or signing legally binding contracts.",
        linkHref: "/client/profile/settings?verify=1",
      });
    }

    return NextResponse.json(
      { message: "Registration successful", userId },
      { status: 201 }
    );
  } catch (error: any) {
    const incidentId = randomUUID();
    console.error("[REGISTER_ERROR]", incidentId, error);
    
    // Handle unique constraint violations
    if (error.code === "23505" || error.message?.includes("unique constraint")) {
      return NextResponse.json(
        { error: "Account already exists with this email or phone number." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      error: `Your login account was created, but profile setup could not finish. Retry this form to continue with the same account. Reference: ${incidentId}`,
    }, { status: 500 });
  }
}
