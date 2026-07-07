import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import { ContractsOversightClient } from "@/components/admin/ContractsOversightClient";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  // Fetch all contracts along with client & worker names and job titles
  const contractsData = await sql`
    SELECT
      c.id,
      c.pdf_url AS "pdfUrl",
      c.client_signed_at AS "clientSignedAt",
      c.worker_signed_at AS "workerSignedAt",
      c.signed_at AS "signedAt",
      j.title AS "jobTitle",
      cp.full_name AS "clientName",
      wp.full_name AS "workerName"
    FROM contracts c
    JOIN jobs j ON c.job_id = j.id
    JOIN client_profiles cp ON j.client_id = cp.user_id
    JOIN worker_profiles wp ON j.worker_id = wp.user_id
    ORDER BY c.created_at DESC
  `;

  // Format datetimes to string
  const formattedContracts = (contractsData || []).map((c: any) => ({
    id: c.id,
    jobTitle: c.jobTitle,
    clientName: c.clientName,
    workerName: c.workerName,
    clientSignedAt: c.clientSignedAt ? String(c.clientSignedAt) : null,
    workerSignedAt: c.workerSignedAt ? String(c.workerSignedAt) : null,
    signedAt: c.signedAt ? String(c.signedAt) : null,
    pdfUrl: c.pdfUrl,
  }));

  return <ContractsOversightClient initialContracts={formattedContracts} />;
}
