import { NextRequest, NextResponse } from "next/server";
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
  neonUserId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      console.error("[REGISTER_VALIDATION_ERROR]", parsed.error.flatten());
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, role, fullName, phone, neonUserId } = parsed.data;

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

    // Insert user into our public schema users table with the same ID as neon_auth
    const newUser = await sql`
       INSERT INTO users (id, email, password_hash, role, phone)
       VALUES (${neonUserId}, ${email || `phone-${phone}`}, 'managed_by_neon_auth', ${role}, ${phone})
       RETURNING id, email, role`;

    const userId = newUser[0].id;

    // Insert role-specific profile
    if (role === "worker") {
      const { dateOfBirth, gender, district, skills, faydaDocUrl, bio } = parsed.data;
      const sanitizedBio = bio ? sanitizeText(bio) : null;
      const sanitizedDistrict = district ? sanitizeText(district) : null;

      if (faydaDocUrl && !isTrustedUploadReference(faydaDocUrl, { allowDataImage: true })) {
        return NextResponse.json({ error: "Invalid Fayda document reference" }, { status: 400 });
      }

      await sql`
        INSERT INTO worker_profiles (user_id, full_name, date_of_birth, gender, district, skills, fayda_doc_url, bio, verification_status)
        VALUES (
          ${userId}, 
          ${sanitizedFullName}, 
          ${dateOfBirth ? new Date(dateOfBirth) : null}, 
          ${gender ?? null}, 
          ${sanitizedDistrict}, 
          ${skills ?? null}, 
          ${faydaDocUrl ?? null}, 
          ${sanitizedBio},
          'pending'
        )`;
      if (faydaDocUrl) {
        await recordVerificationSubmission("worker", userId, faydaDocUrl, null);
      }
    } else {
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
        await recordVerificationSubmission("client", userId, submittedClientDocument, protectedClientFin.finLast4);
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
        `;
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
    console.error("[REGISTER_ERROR]", error);
    
    // Handle unique constraint violations
    if (error.code === "23505" || error.message?.includes("unique constraint")) {
      return NextResponse.json(
        { error: "Account already exists with this email or phone number." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
