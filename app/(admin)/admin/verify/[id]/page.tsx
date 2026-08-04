import { sql } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { updateWorkerVerificationStatus } from "@/lib/actions/admin";
import WorkerVerificationContent from "@/components/WorkerVerificationContent";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { ensureCurrentVerificationAttempt, getVerificationHistory } from "@/lib/verification-operations";

export default async function WorkerVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPermission("verification.read");
  const capabilities = {
    canReview: hasAdminPermission(admin, "verification.review"),
    canApprove: hasAdminPermission(admin, "verification.approve"),
    canReject: hasAdminPermission(admin, "verification.reject"),
    canRequestResubmission: hasAdminPermission(admin, "verification.request_resubmission"),
  };

  const { id } = await params;

  const workers = await sql`
    SELECT
      wp.user_id,
      wp.full_name,
      wp.district,
      wp.skills,
      wp.fayda_doc_url,
      wp.fin_last4,
      wp.verification_status,
      wp.verification_reason,
      wp.verified_at,
      wp.is_verified,
      u.email,
      u.phone,
      u.is_suspended,
      reviewer.work_email AS reviewer_email
    FROM worker_profiles wp 
    JOIN users u ON wp.user_id = u.id 
    LEFT JOIN verification_attempts va
      ON va.account_user_id = wp.user_id
      AND va.account_type = 'worker'
      AND va.is_current = true
    LEFT JOIN admin_employees reviewer ON reviewer.id = va.decided_by
    WHERE wp.user_id = ${id} 
    LIMIT 1
  `;

  const worker = workers[0];

  if (!worker) {
    notFound();
  }

  const maskedFin = worker.fin_last4 ? `********${worker.fin_last4}` : null;
  const attempt = await ensureCurrentVerificationAttempt("worker", worker.user_id);
  const history = await getVerificationHistory("worker", worker.user_id);

  const handleApprove = async () => {
    "use server";
    const result = await updateWorkerVerificationStatus(worker.user_id, "approved", undefined, attempt?.id ?? null);
    if (!result.success) throw new Error(result.error || "Failed to approve worker.");
    redirect("/admin/verify");
  };

  const handleReject = async (reason: string) => {
    "use server";
    const result = await updateWorkerVerificationStatus(worker.user_id, "rejected", reason, attempt?.id ?? null);
    if (!result.success) throw new Error(result.error || "Failed to reject worker.");
    redirect("/admin/verify");
  };

  const handleRevoke = async (reason: string) => {
    "use server";
    const result = await updateWorkerVerificationStatus(worker.user_id, "revoked", reason, attempt?.id ?? null);
    if (!result.success) throw new Error(result.error || "Failed to revoke worker verification.");
    redirect("/admin/verify");
  };

  const handlePending = async (reason: string) => {
    "use server";
    const result = await updateWorkerVerificationStatus(worker.user_id, "pending", reason, attempt?.id ?? null);
    if (!result.success) throw new Error(result.error || "Failed to mark worker pending.");
    redirect("/admin/verify");
  };

  return (
    <WorkerVerificationContent 
      worker={{ ...worker, masked_fin: maskedFin }}
      attempt={attempt ? {
        id: String(attempt.id),
        attemptNumber: Number(attempt.attempt_number || attempt.attemptNumber || 1),
        status: String(attempt.status || "pending"),
        submittedAt: String(attempt.submitted_at || attempt.submittedAt || worker.created_at),
      } : null}
      history={(history || []).map((event: any) => ({
        id: String(event.id),
        action: String(event.action),
        oldStatus: event.old_status ?? null,
        newStatus: String(event.new_status),
        reason: event.reason ?? null,
        attemptNumber: event.attempt_number ?? null,
        adminEmployeeId: event.admin_employee_id ?? null,
        adminName: event.admin_name ?? null,
        adminRole: event.admin_role ?? null,
        createdAt: String(event.created_at),
      }))}
      capabilities={capabilities}
      onApprove={handleApprove}
      onReject={handleReject}
      onRevoke={handleRevoke}
      onPending={handlePending}
    />
  );
}
