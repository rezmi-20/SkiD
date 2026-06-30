"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createDispute(data: {
  jobId: string;
  description: string;
  evidenceUrls?: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  try {
    // 1. Fetch job and check details
    const jobs = await sql`
      SELECT client_id, worker_id, status FROM jobs WHERE id = ${data.jobId}
    `;
    if (jobs.length === 0) throw new Error("Job not found");
    const job = jobs[0];

    // 2. Check if user is involved
    if (job.client_id !== userId && job.worker_id !== userId) {
      throw new Error("Forbidden: Not involved in this job");
    }

    // 3. Insert dispute
    const evidence = data.evidenceUrls ? data.evidenceUrls : null;
    const result = await sql`
      INSERT INTO disputes (job_id, client_id, worker_id, description, evidence_urls, status)
      VALUES (${data.jobId}, ${job.client_id}, ${job.worker_id}, ${data.description}, ${evidence}, 'open')
      RETURNING *
    `;

    // 4. Update job status to disputed
    await sql`
      UPDATE jobs SET status = 'disputed', updated_at = NOW() WHERE id = ${data.jobId}
    `;

    revalidatePath("/admin/dashboard");
    revalidatePath("/client/contracts");
    revalidatePath("/worker/contracts");

    return { success: true, dispute: result[0] };
  } catch (error: any) {
    console.error("[CREATE_DISPUTE_ERROR]", error);
    return { success: false, error: error.message || "Failed to create dispute" };
  }
}

export async function getDisputes() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  try {
    return await sql`
      SELECT 
        d.*,
        j.title as job_title,
        cp.full_name as client_name,
        wp.full_name as worker_name
      FROM disputes d
      JOIN jobs j ON d.job_id = j.id
      LEFT JOIN client_profiles cp ON d.client_id = cp.user_id
      LEFT JOIN worker_profiles wp ON d.worker_id = wp.user_id
      ORDER BY d.created_at DESC
    `;
  } catch (error) {
    console.error("[GET_DISPUTES_ERROR]", error);
    return [];
  }
}

export async function resolveDispute(
  disputeId: string,
  resolutionNotes: string,
  status: 'resolved' | 'rejected'
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const adminId = session.user.id;

  try {
    const disputes = await sql`SELECT job_id FROM disputes WHERE id = ${disputeId}`;
    if (disputes.length === 0) throw new Error("Dispute not found");
    const dispute = disputes[0];

    // Update dispute status
    await sql`
      UPDATE disputes 
      SET 
        status = ${status}, 
        resolution_notes = ${resolutionNotes}, 
        admin_id = ${adminId}, 
        resolved_at = NOW(), 
        updated_at = NOW()
      WHERE id = ${disputeId}
    `;

    // Transition job status back to active or completed
    await sql`
      UPDATE jobs SET status = 'completed', updated_at = NOW() WHERE id = ${dispute.job_id}
    `;

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/disputes");

    return { success: true };
  } catch (error: any) {
    console.error("[RESOLVE_DISPUTE_ERROR]", error);
    return { success: false, error: error.message || "Failed to resolve dispute" };
  }
}
