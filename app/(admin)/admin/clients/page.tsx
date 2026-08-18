import { sql } from "@/lib/db";
import { ClientsManagementClient } from "@/components/admin/ClientsManagementClient";
import { getClientIdentityColumns, toClientDisplayStatus } from "@/lib/client-verification";
import { maskFinLast4 } from "@/lib/fin-protection";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { evaluateClientApprovedConsistency } from "@/lib/client-verification-consistency";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const admin = await requireAdminPermission("verification.read");
  const columns = await getClientIdentityColumns();

  const clients = await sql.query(
    `SELECT
       u.id AS user_id,
       u.email,
       u.phone,
       u.is_suspended,
       u.created_at,
       cp.user_id AS profile_user_id,
       COALESCE(cp.full_name, u.email, 'Unknown client') AS full_name,
       COALESCE(cp.is_verified, false) AS is_verified,
       ${columns.has("verification_status") ? "cp.verification_status" : "NULL AS verification_status"},
       ${columns.has("fin_last4") ? "cp.fin_last4" : "NULL AS fin_last4"},
       ${columns.has("fayda_doc_url") ? `CASE
         WHEN cp.fayda_doc_url IS NOT NULL
          AND length(cp.fayda_doc_url) > 0
         THEN true
         ELSE false
       END AS has_document` : "false AS has_document"},
       ${columns.has("fayda_doc_url") ? "cp.fayda_doc_url" : "NULL AS fayda_doc_url"},
       ${columns.has("verified_at") ? "cp.verified_at" : "NULL AS verified_at"},
       va.decided_by,
       EXISTS (
         SELECT 1
         FROM verification_events ve
         WHERE ve.account_user_id = u.id
           AND ve.account_type = 'client'
           AND ve.new_status = 'approved'
       ) AS has_approved_history,
       reminder.last_reminder_at,
       COALESCE(reminder.reminder_count, 0) AS reminder_count
     FROM users u
     LEFT JOIN client_profiles cp ON cp.user_id = u.id
     LEFT JOIN verification_attempts va
       ON va.account_user_id = u.id
       AND va.account_type = 'client'
       AND va.is_current = true
     LEFT JOIN LATERAL (
       SELECT MAX(created_at) AS last_reminder_at, COUNT(*) AS reminder_count
       FROM notifications n
       WHERE n.user_id = u.id
         AND n.type = 'identity_verification_required'
         AND n.link_href = '/client/profile/settings?verify=1'
     ) reminder ON true
     WHERE u.role = 'client'
     ORDER BY COALESCE(cp.created_at, u.created_at) DESC`,
    [],
  );

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
    const isInvalidApproved = rawStatus === "approved" && !consistency.isValidApproved;
    return {
      userId: client.user_id,
      fullName: client.full_name || "Unknown client",
      email: client.email,
      phone: client.phone,
      verificationStatus: isInvalidApproved ? "not_started" : rawStatus,
      isVerified: Boolean(client.is_verified) && !isInvalidApproved,
      isSuspended: Boolean(client.is_suspended),
      hasDocument: Boolean(client.has_document),
      maskedFin: maskFinLast4(client.fin_last4),
      hasProfile: Boolean(client.profile_user_id),
      createdAt: String(client.created_at),
      lastReminderAt: client.last_reminder_at ? String(client.last_reminder_at) : null,
      reminderCount: Number(client.reminder_count || 0),
      invalidApprovedReasons: consistency.missing,
    };
  });

  return (
    <ClientsManagementClient
      initialClients={formattedClients}
      canOpenDetails={hasAdminPermission(admin, "verification.read")}
      canReview={hasAdminPermission(admin, "verification.review")}
      canSuspendAccount={hasAdminPermission(admin, "admin_accounts.suspend")}
      canReactivateAccount={hasAdminPermission(admin, "admin_accounts.reactivate")}
    />
  );
}
