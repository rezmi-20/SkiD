import { sql } from "@/lib/db";
import { VerificationReviewTabs } from "@/components/admin/VerificationReviewTabs";
import { getClientIdentityColumns, toClientDisplayStatus } from "@/lib/client-verification";
import { maskFinLast4 } from "@/lib/fin-protection";
import { toWorkerDisplayStatus } from "@/lib/worker-verification";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { evaluateClientApprovedConsistency } from "@/lib/client-verification-consistency";

export const dynamic = "force-dynamic";

export default async function VerifyQueuePage() {
  const admin = await requireAdminPermission("verification.read");
  const canReview = hasAdminPermission(admin, "verification.review");

  const clientColumns = await getClientIdentityColumns();

  const workers = await sql`
    SELECT
      wp.user_id,
      wp.full_name,
      wp.skills,
      CASE
        WHEN wp.fayda_doc_url IS NOT NULL
         AND length(wp.fayda_doc_url) > 0
        THEN true
        ELSE false
      END AS has_document,
      wp.fin_last4,
      wp.avatar_url,
      wp.verification_status,
      wp.is_verified,
      wp.created_at,
      wp.verified_at,
      u.phone,
      u.email,
      u.is_suspended,
      va.attempt_number,
      reviewer.full_name AS reviewer_name
    FROM worker_profiles wp
    JOIN users u ON wp.user_id = u.id
    LEFT JOIN verification_attempts va
      ON va.account_user_id = wp.user_id
      AND va.account_type = 'worker'
      AND va.is_current = true
    LEFT JOIN admin_employees reviewer ON reviewer.id = va.decided_by
    ORDER BY wp.created_at DESC
  `;

  const clients = await sql.query(
    `SELECT
       u.id AS user_id,
       COALESCE(cp.full_name, u.email, 'Unknown client') AS full_name,
       COALESCE(cp.is_verified, false) AS is_verified,
       ${clientColumns.has("verification_status") ? "cp.verification_status" : "NULL AS verification_status"},
       ${clientColumns.has("fin_last4") ? "cp.fin_last4" : "NULL AS fin_last4"},
       ${clientColumns.has("fayda_doc_url") ? "cp.fayda_doc_url" : "NULL AS fayda_doc_url"},
       ${clientColumns.has("fayda_doc_url") ? `CASE
         WHEN cp.fayda_doc_url IS NOT NULL
          AND length(cp.fayda_doc_url) > 0
         THEN true
         ELSE false
       END AS has_document` : "false AS has_document"},
       ${clientColumns.has("verified_at") ? "cp.verified_at" : "NULL AS verified_at"},
       COALESCE(cp.created_at, u.created_at) AS created_at,
       u.phone,
       u.email,
       u.is_suspended,
       va.attempt_number,
       va.decided_by,
       EXISTS (
         SELECT 1
         FROM verification_events ve
         WHERE ve.account_user_id = u.id
           AND ve.account_type = 'client'
           AND ve.new_status = 'approved'
       ) AS has_approved_history,
       reviewer.full_name AS reviewer_name
     FROM users u
     LEFT JOIN client_profiles cp ON cp.user_id = u.id
     LEFT JOIN verification_attempts va
       ON va.account_user_id = u.id
       AND va.account_type = 'client'
       AND va.is_current = true
     LEFT JOIN admin_employees reviewer ON reviewer.id = va.decided_by
     WHERE u.role = 'client'
     ORDER BY COALESCE(cp.created_at, u.created_at) DESC`,
    [],
  );

  const formattedWorkers = (workers || []).map((w: any) => ({
    userId: w.user_id,
    fullName: w.full_name || "Unknown worker",
    status: toWorkerDisplayStatus(w.verification_status, w.is_verified, w.is_suspended),
    isVerified: Boolean(w.is_verified),
    isSuspended: Boolean(w.is_suspended),
    maskedFin: maskFinLast4(w.fin_last4),
    hasDocument: Boolean(w.has_document),
    attemptNumber: w.attempt_number ? Number(w.attempt_number) : null,
    createdAt: String(w.created_at),
    decidedAt: w.verified_at ? String(w.verified_at) : null,
    reviewerName: w.reviewer_name ?? null,
    phone: w.phone,
    email: w.email,
  }));

  const formattedClients = (clients || []).map((client: any) => {
    const rawStatus = toClientDisplayStatus(client.verification_status, client.is_verified);
    const consistency = evaluateClientApprovedConsistency({
      status: rawStatus,
      finLast4: client.fin_last4,
      documentRef: client.fayda_doc_url,
      verifiedAt: client.verified_at,
      reviewerId: client.decided_by,
      hasApprovedHistory: client.has_approved_history,
    });
    const invalidApproved = rawStatus === "approved" && !consistency.isValidApproved;
    return {
      userId: client.user_id,
      fullName: client.full_name || "Unknown client",
      status: invalidApproved ? "not_started" : rawStatus,
      isVerified: Boolean(client.is_verified) && !invalidApproved,
      isSuspended: Boolean(client.is_suspended),
      maskedFin: maskFinLast4(client.fin_last4),
      hasDocument: Boolean(client.has_document),
      attemptNumber: client.attempt_number ? Number(client.attempt_number) : null,
      createdAt: String(client.created_at),
      decidedAt: client.verified_at ? String(client.verified_at) : null,
      reviewerName: client.reviewer_name ?? null,
      phone: client.phone,
      email: client.email,
    };
  });

  return (
    <VerificationReviewTabs
      workers={formattedWorkers}
      clients={formattedClients}
      canOpenDetails={hasAdminPermission(admin, "verification.read")}
      canReview={canReview}
    />
  );
}
