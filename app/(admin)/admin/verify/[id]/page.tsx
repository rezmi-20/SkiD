import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { updateWorkerVerificationStatus } from "@/lib/actions/admin";
import WorkerVerificationContent from "@/components/WorkerVerificationContent";

export default async function WorkerVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/login");
  }

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
      wp.is_verified,
      u.email,
      u.phone,
      u.is_suspended
    FROM worker_profiles wp 
    JOIN users u ON wp.user_id = u.id 
    WHERE wp.user_id = ${id} 
    LIMIT 1
  `;

  const worker = workers[0];

  if (!worker) {
    notFound();
  }

  const maskedFin = worker.fin_last4 ? `********${worker.fin_last4}` : null;

  const handleApprove = async () => {
    "use server";
    const result = await updateWorkerVerificationStatus(worker.user_id, "approved");
    if (!result.success) throw new Error(result.error || "Failed to approve worker.");
    redirect("/admin/verify");
  };

  const handleReject = async (reason: string) => {
    "use server";
    const result = await updateWorkerVerificationStatus(worker.user_id, "rejected", reason);
    if (!result.success) throw new Error(result.error || "Failed to reject worker.");
    redirect("/admin/verify");
  };

  const handleRevoke = async (reason: string) => {
    "use server";
    const result = await updateWorkerVerificationStatus(worker.user_id, "revoked", reason);
    if (!result.success) throw new Error(result.error || "Failed to revoke worker verification.");
    redirect("/admin/verify");
  };

  const handlePending = async () => {
    "use server";
    const result = await updateWorkerVerificationStatus(worker.user_id, "pending");
    if (!result.success) throw new Error(result.error || "Failed to mark worker pending.");
    redirect("/admin/verify");
  };

  return (
    <WorkerVerificationContent 
    worker={{ ...worker, masked_fin: maskedFin }}
      onApprove={handleApprove}
      onReject={handleReject}
      onRevoke={handleRevoke}
      onPending={handlePending}
    />
  );
}
