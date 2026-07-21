import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { toggleWorkerVerification } from "@/lib/actions/admin";
import WorkerVerificationContent from "@/components/WorkerVerificationContent";

export default async function WorkerVerificationPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/login");
  }

  const { id } = await params;

  const workers = await sql`
    SELECT wp.*, u.email, u.phone 
    FROM worker_profiles wp 
    JOIN users u ON wp.user_id = u.id 
    WHERE wp.user_id = ${id} 
    LIMIT 1
  `;

  const worker = workers[0];

  if (!worker) {
    notFound();
  }

  const handleApprove = async () => {
    "use server";
    await toggleWorkerVerification(worker.user_id, true);
    redirect("/admin/dashboard");
  };

  const handleReject = async (reason: string) => {
    "use server";
    await toggleWorkerVerification(worker.user_id, false, reason);
    redirect("/admin/dashboard");
  };

  return (
    <WorkerVerificationContent 
      worker={worker}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  );
}
