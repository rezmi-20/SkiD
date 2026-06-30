"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

export interface CreateJobInput {
  title: string;
  description?: string;
  budget?: number;
  workerId?: string;
}

type JobActionResult =
  | { success: true; job?: any; contract?: any; contractId?: string }
  | { success: false; error: string; code?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INVALID_STATE" | "UNKNOWN" };

async function logAuditAction(userId: string, action: string, details: Record<string, unknown>) {
  try {
    await sql`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (${userId}, ${action}, ${JSON.stringify(details)})
    `;
  } catch (error) {
    console.warn("[AUDIT_LOG_SKIPPED]", action, error);
  }
}

export async function createJob(data: CreateJobInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 1. Insert job into the jobs table with status 'pending'
    const jobRows = await sql`
      INSERT INTO jobs (client_id, worker_id, title, description, budget, status)
      VALUES (${session.user.id}, ${data.workerId || null}, ${data.title}, ${data.description || null}, ${data.budget || null}, 'pending')
      RETURNING id, title, worker_id
    `;
    
    if (jobRows.length === 0) {
      return { success: false, error: "Failed to insert job" };
    }
    
    const job = jobRows[0];

    // 2. Insert corresponding contract request (default terms match description)
    const contractRows = await sql`
      INSERT INTO contracts (job_id, terms, client_signed_at)
      VALUES (${job.id}, ${data.description || 'Standard DireSkill Service Terms'}, NOW())
      RETURNING id
    `;
    
    if (contractRows.length === 0) {
      return { success: false, error: "Failed to insert contract" };
    }
    
    const contractId = contractRows[0].id;

    // 3. Notify worker if direct hire request
    if (job.worker_id) {
      await createNotification({
        userId: job.worker_id,
        type: "job_request",
        title: "New Job Request",
        body: `You have a new job request: "${job.title}".`,
        linkHref: `/worker/jobs`
      });
    }

    return { success: true, jobId: job.id, contractId };
  } catch (error) {
    console.error("[CREATE_JOB_ERROR]", error);
    return { success: false, error: "Failed to create job request" };
  }
}


export async function getPendingJobs() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "worker") {
    throw new Error("Forbidden");
  }

  try {
    return await sql`
      SELECT
        j.id,
        j.title,
        j.description,
        j.budget,
        j.status,
        j.created_at,
        j.updated_at,
        j.client_id,
        cp.full_name as client_name,
        cp.avatar_url as client_avatar,
        'Dire Dawa'::text as client_location,
        c.id as contract_id
      FROM jobs j
      LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
      LEFT JOIN contracts c ON j.id = c.job_id
      WHERE j.worker_id = ${session.user.id}
        AND j.status = 'pending'
      ORDER BY j.created_at DESC
    `;
  } catch (error) {
    console.error("[GET_PENDING_JOBS_ERROR]", error);
    return [];
  }
}
export async function getWorkerJobs() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    // Fetch worker jobs, join client profiles and contracts
    return await sql`
      SELECT 
        j.*,
        cp.full_name as client_name,
        cp.avatar_url as client_avatar,
        c.id as contract_id
      FROM jobs j
      LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
      LEFT JOIN contracts c ON j.id = c.job_id
      WHERE j.worker_id = ${session.user.id}
      ORDER BY j.created_at DESC
    `;
  } catch (error) {
    console.error("[GET_WORKER_JOBS_ERROR]", error);
    return [];
  }
}

export async function acceptJob(jobId: string): Promise<JobActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  if (session.user.role !== "worker") {
    return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
  }

  try {
    const jobRows = await sql`
      SELECT id, client_id, worker_id, title, description, budget, status
      FROM jobs
      WHERE id = ${jobId}
      LIMIT 1
    `;

    if (jobRows.length === 0) {
      return { success: false, error: "Job not found", code: "NOT_FOUND" };
    }

    const job = jobRows[0];

    if (job.worker_id !== session.user.id) {
      return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
    }

    if (job.status !== "pending") {
      return {
        success: false,
        error: `Cannot accept this job while it is in ${job.status} state`,
        code: "INVALID_STATE",
      };
    }

    const updatedRows = await sql`
      UPDATE jobs 
      SET status = 'accepted', updated_at = NOW() 
      WHERE id = ${jobId}
        AND worker_id = ${session.user.id}
        AND status = 'pending'
      RETURNING *
    `;

    if (updatedRows.length === 0) {
      return {
        success: false,
        error: "Cannot accept this job because it was already changed",
        code: "INVALID_STATE",
      };
    }

    let contractRows = await sql`
      SELECT id, job_id, terms, client_signed_at, worker_signed_at, signed_at, created_at
      FROM contracts
      WHERE job_id = ${jobId}
      ORDER BY created_at ASC
      LIMIT 1
    `;

    if (contractRows.length === 0) {
      contractRows = await sql`
        INSERT INTO contracts (job_id, terms, client_signed_at)
        VALUES (${jobId}, ${job.description || "Standard DireSkill Service Terms"}, NOW())
        RETURNING id, job_id, terms, client_signed_at, worker_signed_at, signed_at, created_at
      `;
    }

    const updatedJob = updatedRows[0];
    const contract = contractRows[0];

    await logAuditAction(session.user.id, "job_accepted", {
      jobId,
      contractId: contract.id,
      clientId: job.client_id,
      workerId: job.worker_id,
    });

    await createNotification({
      userId: job.client_id,
      type: "job_accepted",
      title: "Job Accepted",
      body: `Your job request "${job.title}" has been accepted.`,
      linkHref: `/contracts/${contract.id}`,
    });

    revalidatePath("/worker/dashboard");
    revalidatePath("/worker/jobs");
    revalidatePath("/worker/gigs");
    revalidatePath("/worker/contracts");
    revalidatePath("/client/dashboard");
    revalidatePath("/client/contracts");
    revalidatePath(`/contracts/${contract.id}`);

    return { success: true, job: updatedJob, contract, contractId: contract.id };
  } catch (error) {
    console.error("[ACCEPT_JOB_ERROR]", error);
    return { success: false, error: "Failed to accept job", code: "UNKNOWN" };
  }
}

export async function rejectJob(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    // Update status to 'rejected'
    await sql`
      UPDATE jobs 
      SET status = 'rejected', updated_at = NOW() 
      WHERE id = ${jobId} AND worker_id = ${session.user.id}
    `;

    // Notify client
    const jobRows = await sql`SELECT client_id, title FROM jobs WHERE id = ${jobId}`;
    if (jobRows.length > 0) {
      await createNotification({
        userId: jobRows[0].client_id,
        type: "job_rejected",
        title: "Job Declined",
        body: `The worker declined your job request: "${jobRows[0].title}".`,
        linkHref: "/client/dashboard"
      });
    }

    revalidatePath("/worker/jobs");
    return { success: true };
  } catch (error) {
    console.error("[REJECT_JOB_ERROR]", error);
    return { success: false, error: "Failed to reject job" };
  }
}

export async function startJob(jobId: string): Promise<JobActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  if (session.user.role !== "worker") {
    return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
  }

  try {
    const rows = await sql`
      SELECT id, client_id, worker_id, title, status
      FROM jobs
      WHERE id = ${jobId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return { success: false, error: "Job not found", code: "NOT_FOUND" };
    }

    const job = rows[0];
    if (job.worker_id !== session.user.id) {
      return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
    }

    if (job.status !== "active") {
      return {
        success: false,
        error: `Cannot start this job while it is in ${job.status} state`,
        code: "INVALID_STATE",
      };
    }

    const updatedRows = await sql`
      UPDATE jobs
      SET status = 'in_progress', updated_at = NOW()
      WHERE id = ${jobId}
        AND worker_id = ${session.user.id}
        AND status = 'active'
      RETURNING *
    `;

    if (updatedRows.length === 0) {
      return { success: false, error: "Cannot start this job because it was already changed", code: "INVALID_STATE" };
    }

    await logAuditAction(session.user.id, "job_started", { jobId });

    await createNotification({
      userId: job.client_id,
      type: "job_status_update",
      title: "Job Started",
      body: `The worker has started "${job.title}".`,
      linkHref: "/client/dashboard",
    });

    revalidatePath("/worker/gigs");
    revalidatePath("/worker/dashboard");
    revalidatePath("/client/dashboard");

    return { success: true, job: updatedRows[0] };
  } catch (error) {
    console.error("[START_JOB_ERROR]", error);
    return { success: false, error: "Failed to start job", code: "UNKNOWN" };
  }
}

export async function completeJob(jobId: string): Promise<JobActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  if (session.user.role !== "worker") {
    return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
  }

  try {
    const rows = await sql`
      SELECT id, client_id, worker_id, title, status
      FROM jobs
      WHERE id = ${jobId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return { success: false, error: "Job not found", code: "NOT_FOUND" };
    }

    const job = rows[0];
    if (job.worker_id !== session.user.id) {
      return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
    }

    if (job.status !== "in_progress") {
      return {
        success: false,
        error: `Cannot complete this job while it is in ${job.status} state`,
        code: "INVALID_STATE",
      };
    }

    const updatedRows = await sql`
      UPDATE jobs
      SET status = 'completed', updated_at = NOW()
      WHERE id = ${jobId}
        AND worker_id = ${session.user.id}
        AND status = 'in_progress'
      RETURNING *
    `;

    if (updatedRows.length === 0) {
      return { success: false, error: "Cannot complete this job because it was already changed", code: "INVALID_STATE" };
    }

    await logAuditAction(session.user.id, "job_completed", { jobId });

    await createNotification({
      userId: job.client_id,
      type: "contract_completed",
      title: "Job Completed",
      body: `The worker marked "${job.title}" as complete. Please review and complete payment.`,
      linkHref: "/client/contracts",
    });

    revalidatePath("/worker/gigs");
    revalidatePath("/worker/dashboard");
    revalidatePath("/worker/contracts");
    revalidatePath("/client/dashboard");
    revalidatePath("/client/contracts");

    return { success: true, job: updatedRows[0] };
  } catch (error) {
    console.error("[COMPLETE_JOB_ERROR]", error);
    return { success: false, error: "Failed to complete job", code: "UNKNOWN" };
  }
}

export async function updateJobStatus(jobId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    // Verify ownership
    const jobRows = await sql`SELECT client_id, worker_id, title FROM jobs WHERE id = ${jobId}`;
    if (jobRows.length === 0) return { success: false, error: "Job not found" };
    
    const job = jobRows[0];
    if (job.worker_id !== session.user.id && job.client_id !== session.user.id) {
      return { success: false, error: "Forbidden" };
    }

    // Update status
    await sql`
      UPDATE jobs 
      SET status = ${status}, updated_at = NOW() 
      WHERE id = ${jobId}
    `;

    // Log update or audit trace if necessary
    try {
      await sql`
        INSERT INTO audit_logs (user_id, action, details)
        VALUES (${session.user.id}, 'job_status_update', ${JSON.stringify({ jobId, status })})
      `;
    } catch (auditErr) {
      console.warn("Audit logging skipped", auditErr);
    }

    // Notify other party
    const notifyId = session.user.id === job.worker_id ? job.client_id : job.worker_id;
    await createNotification({
      userId: notifyId,
      type: "job_status_update",
      title: "Job Status Changed",
      body: `The status of "${job.title}" has been updated to "${status}".`,
      linkHref: session.user.role === 'worker' ? `/client/dashboard` : `/worker/gigs`
    });

    revalidatePath("/worker/gigs");
    revalidatePath("/client/dashboard");
    
    const contractRows = await sql`SELECT id FROM contracts WHERE job_id = ${jobId}`;
    if (contractRows.length > 0) {
      revalidatePath(`/contracts/${contractRows[0].id}`);
    }

    return { success: true };
  } catch (error) {
    console.error("[UPDATE_JOB_STATUS_ERROR]", error);
    return { success: false, error: "Failed to update job status" };
  }
}

