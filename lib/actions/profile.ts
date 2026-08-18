"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isTrustedUploadReference } from "@/lib/security";
import { maskFinLast4, protectFin, validateFin } from "@/lib/fin-protection";
import { getClientIdentityColumns, getClientIdentityStatus, toClientDisplayStatus, validateClientIdentityDocument } from "@/lib/client-verification";
import { recordVerificationSubmission } from "@/lib/verification-operations";

function maskDeprecatedIdentity(value: unknown) {
  const fan = String(value || "").trim();
  if (!fan) return null;
  if (fan.length <= 6) return `${fan.slice(0, 2)}••${fan.slice(-2)}`;
  return `${fan.slice(0, 6)}••••••••${fan.slice(-2)}`;
}

export async function getProfileData() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  const role = (session.user as any).role;

  try {
    const userRows = await sql`SELECT email, phone, is_suspended FROM users WHERE id = ${userId}`;
    const user = userRows[0];

    let profile;
    if (role === "worker") {
      const rows = await sql`SELECT * FROM worker_profiles WHERE user_id = ${userId}`;
      profile = rows[0];
    } else {
      const rows = await sql`SELECT * FROM client_profiles WHERE user_id = ${userId}`;
      profile = rows[0];
    }

    const clientIdentity = role === "client" ? await getClientIdentityStatus(userId) : null;
    const safeProfile = profile
      ? {
          ...profile,
          verification_status: clientIdentity?.status ?? profile.verification_status,
          is_verified: clientIdentity?.isVerified ?? profile.is_verified,
          fayda_fan_number: undefined,
          fin_encrypted: undefined,
          fin_fingerprint: undefined,
          fin_encryption_key_id: undefined,
          fayda_doc_url: undefined,
          masked_fin: maskFinLast4(profile.fin_last4),
          has_fin: Boolean(profile.fin_last4),
          has_fayda_doc: Boolean(profile.fayda_doc_url),
        }
      : profile;

    return {
      ...user,
      ...safeProfile,
      role
    };
  } catch (error) {
    console.error("[GET_PROFILE_ERROR]", error);
    return null;
  }
}

export async function updateProfile(data: any) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const isAdmin = session.user.role === "admin";
  const targetUserId = (isAdmin && data.userId) ? data.userId : session.user.id;

  let targetRole = (session.user as any).role;
    if (isAdmin && data.userId) {
      const roleRows = await sql`SELECT role FROM users WHERE id = ${targetUserId}`;
      if (roleRows && roleRows[0]) {
        targetRole = roleRows[0].role;
      }
    }
    const clientColumns = targetRole === "client" ? await getClientIdentityColumns() : null;

  try {
    // 1. Fetch current verification status
    let currentProfile;
    if (targetRole === "worker") {
      const rows = await sql`SELECT is_verified, full_name, avatar_url FROM worker_profiles WHERE user_id = ${targetUserId}`;
      currentProfile = rows[0];
    } else {
      const rows = await sql`
        SELECT is_verified, full_name, avatar_url, verification_status
        FROM client_profiles
        WHERE user_id = ${targetUserId}
      `;
      currentProfile = rows[0];
    }

    const clientIdentity = targetRole === "client" ? await getClientIdentityStatus(targetUserId) : null;
    const isVerified = targetRole === "client" ? Boolean(clientIdentity?.isVerified) : Boolean(currentProfile?.is_verified);
    const currentVerificationStatus = clientIdentity?.status ?? toClientDisplayStatus(currentProfile?.verification_status, currentProfile?.is_verified);
    const submittedFin = data.faydaFinNumber ?? data.fin;
    const submittedClientDoc = data.faydaDocDataUrl ?? data.faydaDocUrl;
    const hasSubmittedFin = typeof submittedFin === "string" && submittedFin.trim().length > 0;
    const hasSubmittedClientDoc = typeof submittedClientDoc === "string" && submittedClientDoc.trim().length > 0;

    if (targetRole === "client" && (hasSubmittedFin || hasSubmittedClientDoc) && !(hasSubmittedFin && hasSubmittedClientDoc)) {
      return { success: false, error: "Submit both your 12-digit FIN and Fayda ID image together." };
    }

    if (targetRole === "client" && hasSubmittedFin && hasSubmittedClientDoc) {
      if (currentVerificationStatus === "pending") {
        return { success: false, error: "A verification request is already pending." };
      }
      if (currentVerificationStatus === "approved") {
        return { success: false, error: "Your Fayda identity is already verified." };
      }
      if (currentVerificationStatus === "suspended") {
        return { success: false, error: "This account cannot submit Fayda verification while identity access is restricted." };
      }
    }

    if (targetRole === "client" && hasSubmittedClientDoc) {
      const docValidation = validateClientIdentityDocument(submittedClientDoc);
      if (!docValidation.ok) {
        return { success: false, error: docValidation.error };
      }
    }

    const normalizedFin = hasSubmittedFin ? validateFin(submittedFin) : null;

    if (hasSubmittedFin && !normalizedFin) {
      return { success: false, error: "FIN must be exactly 12 digits." };
    }

    const protectedFin = normalizedFin ? protectFin(normalizedFin, targetUserId, "profile") : null;

    // 2. Update Users table (email/phone always editable for now, or follow system rules)
    if (data.email || data.phone) {
        await sql`
          UPDATE users 
          SET 
            email = COALESCE(${data.email}, email),
            phone = COALESCE(${data.phone}, phone)
          WHERE id = ${targetUserId}
        `;
    }

    // 3. Update Profile tables
    if (targetRole === "worker") {
      await sql`
        UPDATE worker_profiles 
        SET 
          full_name = ${isVerified ? currentProfile.full_name : data.fullName},
          avatar_url = ${isVerified ? currentProfile.avatar_url : data.avatarUrl},
          bio = ${data.bio},
          skills = ${data.skills},
          gender = ${data.gender},
          date_of_birth = ${data.dateOfBirth},
          district = ${data.district},
          hourly_rate = ${data.hourlyRate},
          fin_encrypted = COALESCE(${protectedFin?.finEncrypted ?? null}, fin_encrypted),
          fin_encryption_key_id = COALESCE(${protectedFin?.finEncryptionKeyId ?? null}, fin_encryption_key_id),
          fin_fingerprint = COALESCE(${protectedFin?.finFingerprint ?? null}, fin_fingerprint),
          fin_last4 = COALESCE(${protectedFin?.finLast4 ?? null}, fin_last4),
          verification_status = CASE WHEN ${Boolean(protectedFin)} THEN 'pending' ELSE verification_status END,
          is_verified = CASE WHEN ${Boolean(protectedFin)} THEN false ELSE is_verified END
        WHERE user_id = ${targetUserId}
      `;
    } else {
      if (clientColumns?.has("verification_status")) {
        await sql`
          UPDATE client_profiles
          SET
            full_name = ${isVerified ? currentProfile.full_name : data.fullName},
            avatar_url = ${isVerified ? currentProfile.avatar_url : data.avatarUrl},
            fin_encrypted = COALESCE(${protectedFin?.finEncrypted ?? null}, fin_encrypted),
            fin_encryption_key_id = COALESCE(${protectedFin?.finEncryptionKeyId ?? null}, fin_encryption_key_id),
            fin_fingerprint = COALESCE(${protectedFin?.finFingerprint ?? null}, fin_fingerprint),
            fin_last4 = COALESCE(${protectedFin?.finLast4 ?? null}, fin_last4),
            fayda_doc_url = COALESCE(${hasSubmittedClientDoc ? submittedClientDoc : null}, fayda_doc_url),
            verification_status = CASE WHEN ${Boolean(protectedFin)} THEN 'pending' ELSE verification_status END,
            is_verified = CASE WHEN ${Boolean(protectedFin)} THEN false ELSE is_verified END
          WHERE user_id = ${targetUserId}
        `;
      } else {
        await sql`
          UPDATE client_profiles
          SET
            full_name = ${isVerified ? currentProfile.full_name : data.fullName},
            avatar_url = ${isVerified ? currentProfile.avatar_url : data.avatarUrl},
            fin_encrypted = COALESCE(${protectedFin?.finEncrypted ?? null}, fin_encrypted),
            fin_encryption_key_id = COALESCE(${protectedFin?.finEncryptionKeyId ?? null}, fin_encryption_key_id),
            fin_fingerprint = COALESCE(${protectedFin?.finFingerprint ?? null}, fin_fingerprint),
            fin_last4 = COALESCE(${protectedFin?.finLast4 ?? null}, fin_last4),
            fayda_doc_url = COALESCE(${hasSubmittedClientDoc ? submittedClientDoc : null}, fayda_doc_url),
            is_verified = CASE WHEN ${Boolean(protectedFin)} THEN false ELSE is_verified END
          WHERE user_id = ${targetUserId}
        `;
      }

      if (protectedFin) {
        await recordVerificationSubmission("client", targetUserId, hasSubmittedClientDoc ? submittedClientDoc : null, protectedFin.finLast4);
        await sql`
          INSERT INTO audit_logs (user_id, action, details)
          VALUES (
            ${session.user.id},
            'client_verification_submitted',
            ${JSON.stringify({
              userId: targetUserId,
              oldStatus: currentVerificationStatus,
              newStatus: "pending",
              source: "profile_settings",
              timestamp: new Date().toISOString(),
            })}
          )
        `;
      }
    }

    revalidatePath(`/${targetRole}/profile`);
    revalidatePath(`/${targetRole}/profile/settings`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[UPDATE_PROFILE_ERROR]", message);
    if (
      message.includes("FIN encryption key is not configured") ||
      message.includes("FIN_HMAC_KEY is not configured") ||
      message.includes("FIN_ENCRYPTION_KEY")
    ) {
      return {
        success: false,
        error: "Fayda verification security keys are not configured for this local environment.",
      };
    }
    return { success: false, error: "Failed to update profile" };
  }
}

export async function resubmitVerification(faydaDocUrl: string, faydaFinNumber?: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "worker") {
    return { success: false, error: "Unauthorized" };
  }

  if (!isTrustedUploadReference(faydaDocUrl, { allowDataImage: true })) {
    return { success: false, error: "Invalid Fayda document reference" };
  }

  const normalizedFin = validateFin(faydaFinNumber);
  if (!normalizedFin) {
    return { success: false, error: "FIN must be exactly 12 digits." };
  }

  try {
    const currentRows = await sql`
      SELECT
        wp.verification_status,
        wp.is_verified,
        u.is_suspended,
        EXISTS (
          SELECT 1
          FROM verification_attempts va
          WHERE va.account_user_id = wp.user_id
            AND va.account_type = 'worker'
            AND va.is_current = true
            AND va.status = 'pending'
        ) AS has_pending_attempt
      FROM worker_profiles wp
      JOIN users u ON u.id = wp.user_id
      WHERE wp.user_id = ${session.user.id}
      LIMIT 1
    `;
    const current = currentRows[0];
    if (!current) {
      return { success: false, error: "Worker profile not found." };
    }

    const currentStatus = current.is_suspended
      ? "suspended"
      : String(current.verification_status || (current.is_verified ? "approved" : "pending"));
    if (currentStatus === "suspended") {
      return { success: false, error: "This account cannot submit Fayda verification while suspended." };
    }
    if (currentStatus === "approved") {
      return { success: false, error: "Your Fayda identity is already verified." };
    }
    if (currentStatus === "pending" || current.has_pending_attempt) {
      return { success: false, error: "A verification request is already pending." };
    }
    if (currentStatus !== "rejected" && currentStatus !== "revoked") {
      return { success: false, error: "Only rejected or revoked verification cases can be resubmitted here." };
    }

    const protectedFin = protectFin(normalizedFin, session.user.id, "profile");
    const updated = await sql`
      UPDATE worker_profiles 
      SET 
        fayda_doc_url = ${faydaDocUrl}, 
        fin_encrypted = ${protectedFin.finEncrypted},
        fin_encryption_key_id = ${protectedFin.finEncryptionKeyId},
        fin_fingerprint = ${protectedFin.finFingerprint},
        fin_last4 = ${protectedFin.finLast4},
        verification_status = 'pending',
        is_verified = false
      WHERE user_id = ${session.user.id}
        AND verification_status IN ('rejected', 'revoked')
        AND NOT EXISTS (
          SELECT 1
          FROM verification_attempts va
          WHERE va.account_user_id = ${session.user.id}
            AND va.account_type = 'worker'
            AND va.is_current = true
            AND va.status = 'pending'
        )
      RETURNING user_id
    `;
    if (updated.length === 0) {
      return { success: false, error: "This verification case changed. Reload and try again." };
    }
    const submission = await recordVerificationSubmission("worker", session.user.id, faydaDocUrl, protectedFin.finLast4);
    if (!submission) {
      return { success: false, error: "A verification request is already pending." };
    }

    revalidatePath("/worker/pending-verification");
    return { success: true };
  } catch (error) {
    console.error("[RESUBMIT_VERIFICATION_ERROR]", error instanceof Error ? error.message : "Unknown error");
    return { success: false, error: "Failed to resubmit verification document" };
  }
}

