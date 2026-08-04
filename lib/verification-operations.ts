"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { createNotification } from "@/lib/actions/notifications";
import {
  hasAdminPermission,
  requireAdminPermission,
  type AdminPermission,
  type AdminPrincipal,
} from "@/lib/admin-authorization";

export type VerificationAccountType = "worker" | "client";
export type VerificationDecisionStatus = "approved" | "rejected" | "resubmission_requested" | "suspended" | "revoked";

type ProfileSnapshot = {
  accountUserId: string;
  accountType: VerificationAccountType;
  fullName: string | null;
  oldStatus: string;
  isVerified: boolean;
  isSuspended: boolean;
  finLast4: string | null;
  finEncrypted?: string | null;
  documentRef: string | null;
};

function documentFingerprint(value: unknown) {
  const ref = typeof value === "string" ? value.trim() : "";
  if (!ref) return null;
  return crypto.createHash("sha256").update(ref).digest("hex");
}

function cleanReason(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 1000) : "";
}

function requiredPermissionForDecision(status: string): AdminPermission {
  if (status === "approved") return "verification.approve";
  if (status === "rejected") return "verification.reject";
  if (status === "resubmission_requested" || status === "pending") return "verification.request_resubmission";
  return "verification.review";
}

function canActOnVerification(admin: Pick<AdminPrincipal, "role" | "status"> | null | undefined) {
  return (
    hasAdminPermission(admin, "verification.review") &&
    hasAdminPermission(admin, "verification.approve") &&
    hasAdminPermission(admin, "verification.reject") &&
    hasAdminPermission(admin, "verification.request_resubmission")
  );
}

async function getProfileSnapshot(accountType: VerificationAccountType, accountUserId: string): Promise<ProfileSnapshot | null> {
  if (accountType === "worker") {
    const rows = await sql`
      SELECT
        wp.user_id,
        wp.full_name,
        wp.is_verified,
        wp.verification_status,
        wp.fin_last4,
        wp.fin_encrypted,
        wp.fayda_doc_url,
        u.is_suspended
      FROM worker_profiles wp
      JOIN users u ON u.id = wp.user_id
      WHERE wp.user_id = ${accountUserId}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      accountUserId,
      accountType,
      fullName: row.full_name ?? null,
      oldStatus: row.is_suspended ? "suspended" : row.verification_status || (row.is_verified ? "approved" : "pending"),
      isVerified: Boolean(row.is_verified),
      isSuspended: Boolean(row.is_suspended),
      finLast4: row.fin_last4 ?? null,
      finEncrypted: row.fin_encrypted ?? null,
      documentRef: row.fayda_doc_url ?? null,
    };
  }

  const rows = await sql`
    SELECT
      cp.user_id,
      cp.full_name,
      cp.is_verified,
      cp.verification_status,
      cp.fin_last4,
      cp.fin_encrypted,
      cp.fayda_doc_url,
      u.is_suspended
    FROM client_profiles cp
    JOIN users u ON u.id = cp.user_id
    WHERE cp.user_id = ${accountUserId}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    accountUserId,
    accountType,
    fullName: row.full_name ?? null,
    oldStatus: row.is_suspended ? "suspended" : row.verification_status || (row.is_verified ? "approved" : "not_started"),
    isVerified: Boolean(row.is_verified),
    isSuspended: Boolean(row.is_suspended),
    finLast4: row.fin_last4 ?? null,
    finEncrypted: row.fin_encrypted ?? null,
    documentRef: row.fayda_doc_url ?? null,
  };
}

export async function getCurrentVerificationAttempt(accountType: VerificationAccountType, accountUserId: string) {
  const rows = await sql`
    SELECT *
    FROM verification_attempts
    WHERE account_user_id = ${accountUserId}
      AND account_type = ${accountType}
      AND is_current = true
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function ensureCurrentVerificationAttempt(accountType: VerificationAccountType, accountUserId: string) {
  const existing = await getCurrentVerificationAttempt(accountType, accountUserId);
  if (existing) return existing;

  const snapshot = await getProfileSnapshot(accountType, accountUserId);
  if (!snapshot) return null;

  const rows = await sql`
    INSERT INTO verification_attempts (
      account_user_id,
      account_type,
      attempt_number,
      status,
      document_reference,
      document_fingerprint,
      fin_last4,
      is_current,
      submitted_at
    )
    VALUES (
      ${accountUserId},
      ${accountType},
      1,
      ${snapshot.oldStatus === "not_started" ? "pending" : snapshot.oldStatus},
      ${snapshot.documentRef ? `${accountType}:${accountUserId}:profile-document` : null},
      ${documentFingerprint(snapshot.documentRef)},
      ${snapshot.finLast4},
      true,
      NOW()
    )
    ON CONFLICT (account_user_id, account_type, attempt_number) DO UPDATE
    SET is_current = true
    RETURNING *
  `;
  return rows[0] ?? null;
}

export async function recordVerificationSubmission(accountType: VerificationAccountType, accountUserId: string, documentRef: string | null, finLast4: string | null) {
  const fingerprint = documentFingerprint(documentRef);
  const rows = await sql`
    WITH previous AS (
      UPDATE verification_attempts
      SET is_current = false
      WHERE account_user_id = ${accountUserId}
        AND account_type = ${accountType}
        AND is_current = true
      RETURNING attempt_number
    ),
    next_number AS (
      SELECT COALESCE(MAX(attempt_number), 0) + 1 AS n
      FROM verification_attempts
      WHERE account_user_id = ${accountUserId}
        AND account_type = ${accountType}
    ),
    inserted AS (
      INSERT INTO verification_attempts (
        account_user_id,
        account_type,
        attempt_number,
        status,
        document_reference,
        document_fingerprint,
        fin_last4,
        is_current,
        submitted_at
      )
      SELECT
        ${accountUserId},
        ${accountType},
        n,
        'pending',
        ${documentRef ? `${accountType}:${accountUserId}:attempt-document` : null},
        ${fingerprint},
        ${finLast4},
        true,
        NOW()
      FROM next_number
      RETURNING *
    )
    INSERT INTO verification_events (
      attempt_id,
      account_user_id,
      account_type,
      old_status,
      new_status,
      action,
      attempt_number,
      document_fingerprint
    )
    SELECT
      id,
      account_user_id,
      account_type,
      NULL,
      status,
      'submitted',
      attempt_number,
      document_fingerprint
    FROM inserted
    RETURNING attempt_id
  `;
  return rows[0] ?? null;
}

export async function getVerificationHistory(accountType: VerificationAccountType, accountUserId: string) {
  return sql`
    SELECT
      ve.id,
      ve.action,
      ve.old_status,
      ve.new_status,
      ve.reason,
      ve.attempt_number,
      ve.document_fingerprint,
      ve.created_at,
      ae.admin_employee_id,
      ae.full_name AS admin_name,
      ve.admin_role
    FROM verification_events ve
    LEFT JOIN admin_employees ae ON ae.id = ve.admin_employee_id
    WHERE ve.account_user_id = ${accountUserId}
      AND ve.account_type = ${accountType}
    ORDER BY ve.created_at DESC
  `;
}

export async function decideVerificationCase(
  accountType: VerificationAccountType,
  accountUserId: string,
  nextStatus: VerificationDecisionStatus,
  reason?: string,
  expectedAttemptId?: string | null,
) {
  const admin = await requireAdminPermission(requiredPermissionForDecision(nextStatus));
  if (!canActOnVerification(admin)) {
    return { success: false, status: 403, error: "Only content and verification administrators may make verification decisions." };
  }
  if (admin.id === accountUserId) {
    return { success: false, status: 403, error: "Administrators cannot review their own verification case." };
  }

  const normalizedReason = cleanReason(reason);
  if ((nextStatus === "rejected" || nextStatus === "resubmission_requested" || nextStatus === "suspended" || nextStatus === "revoked") && !normalizedReason) {
    return { success: false, status: 400, error: "A clear reason is required for this verification decision." };
  }

  const snapshot = await getProfileSnapshot(accountType, accountUserId);
  if (!snapshot) return { success: false, status: 404, error: `${accountType === "worker" ? "Worker" : "Client"} not found.` };
  if (snapshot.isSuspended || snapshot.oldStatus === "suspended" || snapshot.oldStatus === "revoked") {
    return { success: false, status: 409, error: "Suspended or revoked verification cases cannot be overwritten here." };
  }

  const attempt = await ensureCurrentVerificationAttempt(accountType, accountUserId);
  if (!attempt) return { success: false, status: 404, error: "Verification attempt not found." };
  if (expectedAttemptId && attempt.id !== expectedAttemptId) {
    return { success: false, status: 409, error: "This verification attempt is stale. Reload the case and try again." };
  }
  if (attempt.status !== "pending") {
    return { success: false, status: 409, error: "This verification attempt has already been decided." };
  }
  if (!["pending", "rejected", "resubmission_requested"].includes(snapshot.oldStatus)) {
    return { success: false, status: 409, error: "This verification case is not pending review." };
  }
  if (!snapshot.finLast4 || !snapshot.finEncrypted || !snapshot.documentRef) {
    return { success: false, status: 400, error: "Current FIN metadata and verification document are required before approval or rejection." };
  }

  const isApproved = nextStatus === "approved";
  const profileTable = accountType === "worker" ? "worker_profiles" : "client_profiles";
  const updateRows = await sql.query(
    `UPDATE ${profileTable}
     SET
       is_verified = $1,
       verification_status = $2,
       verification_reason = $3,
       verified_by = $4,
       verified_at = CASE WHEN $1 THEN NOW() ELSE NULL END
     WHERE user_id = $5
       AND COALESCE(verification_status, CASE WHEN is_verified THEN 'approved' ELSE 'pending' END) = $6
     RETURNING user_id`,
    [isApproved, nextStatus, isApproved ? null : normalizedReason, null, accountUserId, snapshot.oldStatus],
  );
  if (updateRows.length === 0) {
    return { success: false, status: 409, error: "This verification case changed while you were reviewing it." };
  }

  const attemptRows = await sql`
    UPDATE verification_attempts
    SET status = ${nextStatus},
        decided_at = NOW(),
        decided_by = ${admin.id}
    WHERE id = ${attempt.id}
      AND status = 'pending'
      AND is_current = true
    RETURNING id
  `;
  if (attemptRows.length === 0) {
    return { success: false, status: 409, error: "This verification attempt has already been decided." };
  }

  await sql`
    INSERT INTO verification_events (
      attempt_id,
      account_user_id,
      account_type,
      old_status,
      new_status,
      action,
      admin_employee_id,
      admin_role,
      reason,
      attempt_number,
      document_fingerprint
    )
    VALUES (
      ${attempt.id},
      ${accountUserId},
      ${accountType},
      ${snapshot.oldStatus},
      ${nextStatus},
      ${nextStatus},
      ${admin.id},
      ${admin.role},
      ${isApproved ? null : normalizedReason},
      ${Number(attempt.attempt_number || attempt.attemptNumber || 1)},
      ${attempt.document_fingerprint ?? attempt.documentFingerprint ?? documentFingerprint(snapshot.documentRef)}
    )
  `;

  await sql`
    INSERT INTO audit_logs (admin_employee_id, action, details)
    VALUES (
      ${admin.id},
      ${accountType === "worker" ? "worker_verification_status_changed" : "client_verification_status_changed"},
      ${JSON.stringify({
        adminId: admin.id,
        userId: accountUserId,
        oldStatus: snapshot.oldStatus,
        newStatus: nextStatus,
        reason: isApproved ? null : normalizedReason,
        attemptId: attempt.id,
        attemptNumber: Number(attempt.attempt_number || attempt.attemptNumber || 1),
        timestamp: new Date().toISOString(),
      })}
    )
  `.catch(() => undefined);

  try {
    await createNotification({
      userId: accountUserId,
      type: isApproved ? "fayda_approved" : nextStatus === "rejected" ? "fayda_rejected" : "identity_verification_required",
      title: isApproved
        ? "Verification Approved"
        : nextStatus === "rejected"
          ? "Verification Rejected"
          : "Verification Needs More Information",
      body: isApproved
        ? accountType === "worker"
          ? "Your Fayda verification was approved. You can now receive hiring requests."
          : "Your Fayda verification was approved. You can now access contracts."
        : normalizedReason,
      linkHref: accountType === "worker" ? "/worker/pending-verification" : "/client/profile/settings?verify=1",
    });
  } catch {
    // createNotification already guards failures; keep decision transaction result intact.
  }

  revalidatePath("/admin/verify");
  revalidatePath(accountType === "worker" ? `/admin/verify/${accountUserId}` : `/admin/clients/${accountUserId}/verify`);
  revalidatePath(accountType === "worker" ? "/admin/workers" : "/admin/users");
  revalidatePath(accountType === "worker" ? "/worker/pending-verification" : "/client/profile/settings");

  return { success: true, status: 200 };
}

export async function recordVerificationDocumentView(accountType: VerificationAccountType, accountUserId: string, admin: AdminPrincipal) {
  const attempt = await ensureCurrentVerificationAttempt(accountType, accountUserId);
  await sql`
    INSERT INTO verification_events (
      attempt_id,
      account_user_id,
      account_type,
      old_status,
      new_status,
      action,
      admin_employee_id,
      admin_role,
      attempt_number,
      document_fingerprint
    )
    VALUES (
      ${attempt?.id ?? null},
      ${accountUserId},
      ${accountType},
      ${attempt?.status ?? null},
      ${attempt?.status ?? "pending"},
      'viewed_document',
      ${admin.id},
      ${admin.role},
      ${attempt ? Number(attempt.attempt_number || attempt.attemptNumber || 1) : null},
      ${attempt?.document_fingerprint ?? attempt?.documentFingerprint ?? null}
    )
  `;
}
