import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import { JobsQueueClient } from "@/components/admin/JobsQueueClient";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  // Fetch all jobs with client & worker names
  const jobsData = await sql`
    SELECT
      j.id,
      j.title,
      j.status,
      j.budget,
      j.created_at AS "createdAt",
      cp.full_name AS "clientName",
      wp.full_name AS "workerName"
    FROM jobs j
    JOIN client_profiles cp ON j.client_id = cp.user_id
    LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
    ORDER BY j.created_at DESC
  `;

  // Map to matching schema types
  const formattedJobs = (jobsData || []).map((j: any) => ({
    id: j.id,
    title: j.title,
    clientName: j.clientName,
    workerName: j.workerName,
    budget: j.budget,
    status: j.status,
    createdAt: String(j.createdAt),
  }));

  return <JobsQueueClient initialJobs={formattedJobs} />;
}
