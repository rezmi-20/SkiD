import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import { VerificationReviewTabs } from "@/components/admin/VerificationReviewTabs";
import { getClientIdentityColumns, toClientDisplayStatus } from "@/lib/client-verification";
import { maskFinLast4 } from "@/lib/fin-protection";
import { toWorkerDisplayStatus } from "@/lib/worker-verification";

export const dynamic = "force-dynamic";

export default async function VerifyQueuePage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const clientColumns = await getClientIdentityColumns();

  const workers = await sql`
    SELECT
      wp.user_id,
      wp.full_name,
      wp.skills,
      wp.fayda_doc_url,
      wp.avatar_url,
      wp.verification_status,
      wp.is_verified,
      wp.created_at,
      u.phone,
      u.email,
      u.is_suspended
    FROM worker_profiles wp
    JOIN users u ON wp.user_id = u.id
    ORDER BY wp.created_at DESC
  `;

  const clients = await sql.query(
    `SELECT
       cp.user_id,
       cp.full_name,
       cp.is_verified,
       ${clientColumns.has("verification_status") ? "cp.verification_status" : "NULL AS verification_status"},
       ${clientColumns.has("fin_last4") ? "cp.fin_last4" : "NULL AS fin_last4"},
       ${clientColumns.has("fayda_doc_url") ? "cp.fayda_doc_url" : "NULL AS fayda_doc_url"},
       cp.created_at,
       u.phone,
       u.email,
       u.is_suspended
     FROM client_profiles cp
     JOIN users u ON cp.user_id = u.id
     ORDER BY cp.created_at DESC`,
    [],
  );

  const formattedWorkers = (workers || []).map((w: any) => ({
    userId: w.user_id,
    fullName: w.full_name || "Unknown worker",
    status: toWorkerDisplayStatus(w.verification_status, w.is_verified, w.is_suspended),
    isVerified: Boolean(w.is_verified),
    isSuspended: Boolean(w.is_suspended),
    hasDocument: Boolean(w.fayda_doc_url),
    createdAt: String(w.created_at),
    phone: w.phone,
    email: w.email,
  }));

  const formattedClients = (clients || []).map((client: any) => ({
    userId: client.user_id,
    fullName: client.full_name || "Unknown client",
    status: toClientDisplayStatus(client.verification_status, client.is_verified),
    isVerified: Boolean(client.is_verified),
    isSuspended: Boolean(client.is_suspended),
    maskedFin: maskFinLast4(client.fin_last4),
    hasDocument: Boolean(client.fayda_doc_url),
    createdAt: String(client.created_at),
    phone: client.phone,
    email: client.email,
  }));

  return (
    <VerificationReviewTabs workers={formattedWorkers} clients={formattedClients} />
  );
}
