import { sql } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { updateWorkerVerificationStatus } from "@/lib/actions/admin";
import WorkerVerificationContent from "@/components/WorkerVerificationContent";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { ensureCurrentVerificationAttempt, getVerificationHistory } from "@/lib/verification-operations";
import { hasCompleteWorkerIdentity, toWorkerDisplayStatus } from "@/lib/worker-verification";

export default async function WorkerVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPermission("verification.read");
  const capabilities = {
    canReview: hasAdminPermission(admin, "verification.review"),
    canApprove: hasAdminPermission(admin, "verification.approve"),
    canReject: hasAdminPermission(admin, "verification.reject"),
    canRequestResubmission: hasAdminPermission(admin, "verification.request_resubmission"),
    canRevoke: hasAdminPermission(admin, "verification.revoke"),
  };

  const { id } = await params;

  const workers = await sql`
    SELECT
      wp.user_id,
      wp.full_name,
      wp.district,
      wp.skills,
      wp.avatar_url,
      wp.fayda_doc_url,
      wp.fin_last4,
      wp.fin_encrypted,
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

  const certificates = await sql`
    SELECT id, file_name, mime_type, file_size
    FROM worker_training_certificates
    WHERE worker_user_id = ${id}
    ORDER BY created_at ASC
  `;

  const maskedFin = worker.fin_last4 ? `********${worker.fin_last4}` : null;
  const identityComplete = hasCompleteWorkerIdentity({
    documentRef: worker.fayda_doc_url,
    finLast4: worker.fin_last4,
    finEncrypted: worker.fin_encrypted,
  });
  const displayStatus = toWorkerDisplayStatus(worker.verification_status, worker.is_verified, worker.is_suspended, identityComplete);
  const attempt = await ensureCurrentVerificationAttempt("worker", worker.user_id);
  const history = await getVerificationHistory("worker", worker.user_id);
  const canRevealDocument = Boolean(
    capabilities.canReview &&
      admin.role === "content_verification_admin" &&
      attempt?.id &&
      attempt.status === "pending" &&
      displayStatus === "pending" &&
      !worker.is_suspended &&
      !worker.is_verified &&
      !(history || []).some((event: any) => event.action === "viewed_document" && event.reason === "one-time Fayda document reveal"),
  );

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
      worker={{
        ...worker,
        fayda_doc_url: "",
        fin_encrypted: undefined,
        fin_encryption_key_id: undefined,
        fin_fingerprint: undefined,
        fin_last4: undefined,
        masked_fin: maskedFin,
        training_certificates: certificates.map((certificate: any) => ({
          id: String(certificate.id),
          file_name: String(certificate.file_name),
          mime_type: String(certificate.mime_type),
          file_size: Number(certificate.file_size),
        })),
        identity_complete: identityComplete,
        verification_status: displayStatus,
        is_verified: Boolean(worker.is_verified && identityComplete),
      }}
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
      verificationDocument={{
        attemptId: attempt?.id ? String(attempt.id) : null,
        canReveal: canRevealDocument,
        available: Boolean(worker.fayda_doc_url),
        revealUsed: Boolean((history || []).some((event: any) => event.action === "viewed_document" && event.reason === "one-time Fayda document reveal")),
      }}
      onApprove={handleApprove}
      onReject={handleReject}
      onRevoke={handleRevoke}
      onPending={handlePending}
    />
  );
}
