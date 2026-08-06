"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { createNotification } from "@/lib/actions/notifications";
import {
  getAdminPrincipal,
  hasAdminPermission,
  requireAdminPermission,
  type AdminPermission,
  type AdminPrincipal,
} from "@/lib/admin-authorization";
import { decryptFin } from "@/lib/fin-protection";

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
  finEncryptionKeyId?: string | null;
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
        wp.fin_encryption_key_id,
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
      finEncryptionKeyId: row.fin_encryption_key_id ?? null,
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
      cp.fin_encryption_key_id,
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
    finEncryptionKeyId: row.fin_encryption_key_id ?? null,
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
  const snapshot = await getProfileSnapshot(accountType, accountUserId);
  if (!snapshot) return existing ?? null;

  if (existing) {
    if (existing.status === "pending" || snapshot.oldStatus !== "pending") return existing;

    const fingerprint = documentFingerprint(snapshot.documentRef);
    await sql`
      WITH previous AS (
        UPDATE verification_attempts
        SET is_current = false
        WHERE id = ${existing.id}
          AND is_current = true
          AND status <> 'pending'
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
          ${snapshot.documentRef ? `${accountType}:${accountUserId}:attempt-document` : null},
          ${fingerprint},
          ${snapshot.finLast4},
          true,
          NOW()
        FROM next_number
        WHERE EXISTS (SELECT 1 FROM previous)
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
        ${String(existing.status || "decided")},
        status,
        'submitted',
        attempt_number,
        document_fingerprint
      FROM inserted
    `;

    return (await getCurrentVerificationAttempt(accountType, accountUserId)) ?? existing;
  }

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

async function auditVerificationFinReveal(input: {
  admin: AdminPrincipal;
  accountType: VerificationAccountType;
  accountUserId: string;
  attemptId: string | null;
  attemptNumber: number | null;
  context: string;
  success: boolean;
  failureReason?: string;
}) {
  await sql`
    INSERT INTO audit_logs (admin_employee_id, action, details)
    VALUES (
      ${input.admin.id},
      ${"verification_fin_revealed"},
      ${JSON.stringify({
        adminId: input.admin.id,
        adminEmployeeId: input.admin.employeeId ?? null,
        adminRole: input.admin.role,
        targetUserId: input.accountUserId,
        accountType: input.accountType,
        attemptId: input.attemptId,
        attemptNumber: input.attemptNumber,
        action: "verification_fin_revealed",
        context: input.context,
        success: input.success,
        failureReason: input.failureReason ?? null,
        timestamp: new Date().toISOString(),
      })}
    )
  `;
}

export async function revealVerificationFin(
  accountType: VerificationAccountType,
  accountUserId: string,
  expectedAttemptId?: string | null,
  context?: string,
) {
  const admin = await getAdminPrincipal();
  if (!admin) {
    return { success: false, status: 401, error: "Active administrator access is required." };
  }

  const authorizedAdmin = admin;
  const normalizedContext = cleanReason(context) || "Active verification review FIN comparison";
  let attemptId: string | null = null;
  let attemptNumber: number | null = null;

  async function deny(status: number, error: string) {
    await auditVerificationFinReveal({
      admin: authorizedAdmin,
      accountType,
      accountUserId,
      attemptId,
      attemptNumber,
      context: normalizedContext,
      success: false,
      failureReason: error,
    }).catch(() => undefined);
    return { success: false, status, error };
  }

  if (accountType !== "worker" && accountType !== "client") {
    return deny(400, "Invalid verification account type.");
  }
  if (!hasAdminPermission(authorizedAdmin, "verification.review") || authorizedAdmin.role !== "content_verification_admin") {
    return deny(403, "Only content verification administrators may reveal FIN during active review.");
  }
  if (authorizedAdmin.id === accountUserId) {
    return deny(403, "Administrators cannot review their own verification case.");
  }

  const snapshot = await getProfileSnapshot(accountType, accountUserId);
  if (!snapshot) {
    return deny(404, `${accountType === "worker" ? "Worker" : "Client"} not found.`);
  }
  if (snapshot.isSuspended || snapshot.oldStatus === "suspended" || snapshot.oldStatus === "revoked") {
    return deny(409, "Suspended or revoked verification cases cannot reveal FIN here.");
  }

  const attempt = await getCurrentVerificationAttempt(accountType, accountUserId);
  if (!attempt) {
    return deny(404, "Current verification attempt not found.");
  }
  attemptId = String(attempt.id);
  attemptNumber = Number(attempt.attempt_number || attempt.attemptNumber || 1);

  if (expectedAttemptId && attemptId !== expectedAttemptId) {
    return deny(409, "This verification attempt is stale. Reload the case and try again.");
  }
  if (!["pending", "rejected", "resubmission_requested"].includes(snapshot.oldStatus)) {
    return deny(409, "This verification case is not in an active reviewable state.");
  }
  const activeReviewStatus = attempt.status === "pending" || snapshot.oldStatus === "pending";
  if (!activeReviewStatus) {
    return deny(409, "FIN can only be revealed for an active pending review.");
  }
  if (!snapshot.finLast4 || !snapshot.finEncrypted || !snapshot.finEncryptionKeyId || !snapshot.documentRef) {
    return deny(400, "Current FIN metadata and verification document are required before reveal.");
  }

  let fin: string;
  try {
    fin = decryptFin({
      finEncrypted: snapshot.finEncrypted,
      finEncryptionKeyId: snapshot.finEncryptionKeyId,
      userId: accountUserId,
      scope: "profile",
    });
  } catch {
    return deny(500, "FIN could not be decrypted for this review.");
  }

  await auditVerificationFinReveal({
    admin: authorizedAdmin,
    accountType,
    accountUserId,
    attemptId,
    attemptNumber,
    context: normalizedContext,
    success: true,
  });

  return { success: true, status: 200, fin };
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
  if (expectedAttemptId && String(attempt.id) !== expectedAttemptId) {
    const expectedRows = await sql`
      SELECT id, status, is_current
      FROM verification_attempts
      WHERE id = ${expectedAttemptId}
        AND account_user_id = ${accountUserId}
        AND account_type = ${accountType}
      LIMIT 1
    `;
    const expectedAttempt = expectedRows[0] ?? null;
    const repairedPendingAttempt = Boolean(
      expectedAttempt &&
        expectedAttempt.is_current === false &&
        expectedAttempt.status !== "pending" &&
        attempt.status === "pending" &&
        snapshot.oldStatus === "pending",
    );
    if (!repairedPendingAttempt) {
      return { success: false, status: 409, error: "This verification attempt is stale. Reload the case and try again." };
    }
  }
  if (attempt.status !== "pending") {
    return { success: false, status: 409, error: "This verification attempt has already been decided." };
  }
  if (!["pending", "rejected", "resubmission_requested"].includes(snapshot.oldStatus)) {
    return { success: false, status: 409, error: "This verification case is not pending review." };
  }
  if (nextStatus === "approved" && (!snapshot.finLast4 || !snapshot.finEncrypted || !snapshot.documentRef)) {
    return { success: false, status: 400, error: "Current FIN metadata and verification document are required before approval." };
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
