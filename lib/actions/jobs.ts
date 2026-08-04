"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";
import { ensureContractSetupComplete } from "./contract-setup";
import { assertAllowedJobTransition, isJobStatus, type JobActorRole } from "@/lib/job-workflow";
import { assertActiveVerifiedWorker } from "@/lib/identity-lifecycle";

export interface CreateJobInput {
  title: string;
  description?: string;
  budget?: number;
  workerId?: string;
  location?: string;
  requestedDate?: string;
}

type JobActionResult =
  | { success: true; job?: any; jobId?: string; contract?: any; contractId?: string }
  | { success: false; error: string; code?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INVALID_STATE" | "CONTRACT_SETUP_REQUIRED" | "UNKNOWN" };

const OPEN_INVITATION_STATUSES = [
  "pending",
  "accepted",
  "active",
  "in_progress",
  "completion_requested",
  "completed",
  "payment_pending",
  "paid",
];

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

  if (session.user.role !== "client") {
    return { success: false, error: "Only clients can create hiring requests", code: "FORBIDDEN" };
  }

  const setup = await ensureContractSetupComplete("/client/contract/new");
  if (!setup.completed) {
    return {
      success: false,
      error: setup.error || "Complete Contract Setup before creating a hiring request.",
      code: "CONTRACT_SETUP_REQUIRED",
    };
  }

  try {
    if (data.workerId) {
      const workerRows = await sql`
        SELECT u.id
        FROM users u
        JOIN worker_profiles wp ON u.id = wp.user_id
        WHERE u.id = ${data.workerId}
          AND u.role = 'worker'
          AND u.is_suspended = false
          AND wp.is_verified = true
          AND wp.verification_status = 'approved'
        LIMIT 1
      `;

      if (workerRows.length === 0) {
        return { success: false, error: "Worker not found or unavailable", code: "NOT_FOUND" };
      }

      const duplicateRows = await sql`
        SELECT id, status
        FROM jobs
        WHERE client_id = ${session.user.id}
          AND worker_id = ${data.workerId}
          AND status = ANY(${OPEN_INVITATION_STATUSES}::job_status[])
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (duplicateRows.length > 0) {
        return {
          success: false,
          error: `You already have an active hiring workflow with this worker (${duplicateRows[0].status}).`,
          code: "INVALID_STATE",
        };
      }
    }

    const jobRows = await sql`
      INSERT INTO jobs (client_id, worker_id, title, description, budget, location, requested_date, status)
      VALUES (
        ${session.user.id},
        ${data.workerId || null},
        ${data.title},
        ${data.description || null},
        ${data.budget || null},
        ${data.location || null},
        ${data.requestedDate ? new Date(data.requestedDate) : null},
        'pending'
      )
      RETURNING id, title, worker_id, client_id
    `;
    
    if (jobRows.length === 0) {
      return { success: false, error: "Failed to insert job" };
    }
    
    const job = jobRows[0];

    if (job.worker_id) {
      const clientRows = await sql`
        SELECT full_name
        FROM client_profiles
        WHERE user_id = ${session.user.id}
        LIMIT 1
      `;
      const clientName = clientRows[0]?.full_name || "A client";

      await createNotification({
        userId: job.worker_id,
        type: "job_request",
        title: "Hiring Invitation",
        body: `${clientName} wants to hire you for "${job.title}". Accepting creates a contract draft for review.`,
        linkHref: `/worker/jobs`
      });
    }

    await logAuditAction(session.user.id, "hiring_invitation_sent", {
      jobId: job.id,
      workerId: job.worker_id,
    });

    return { success: true, jobId: job.id };
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

  const workerAccess = await assertActiveVerifiedWorker(session.user.id);
  if (!workerAccess.allowed) {
    throw new Error(workerAccess.error || "Forbidden");
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
        j.location,
        j.requested_date,
        cp.full_name as client_name,
        cp.avatar_url as client_avatar,
        COALESCE(j.location, 'Dire Dawa') as client_location,
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

  if (session.user.role !== "worker") {
    throw new Error("Forbidden");
  }

  const workerAccess = await assertActiveVerifiedWorker(session.user.id);
  if (!workerAccess.allowed) {
    return [];
  }

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

  const workerAccess = await assertActiveVerifiedWorker(session.user.id);
  if (!workerAccess.allowed) {
    return { success: false, error: workerAccess.error || "Forbidden", code: "FORBIDDEN" };
  }

  const setup = await ensureContractSetupComplete("/worker/jobs");
  if (!setup.completed) {
    return {
      success: false,
      error: setup.error || "Complete Contract Setup before accepting hiring invitations.",
      code: "CONTRACT_SETUP_REQUIRED",
    };
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

    const [updatedRows, insertedContractRows] = await sql.transaction([
      sql`
        UPDATE jobs 
        SET status = 'accepted', updated_at = NOW() 
        WHERE id = ${jobId}
          AND worker_id = ${session.user.id}
          AND status = 'pending'
        RETURNING *
      `,
      sql`
        INSERT INTO contracts (job_id, terms, status)
        VALUES (${jobId}, ${job.description || "Standard DireSkill Service Terms"}, 'DRAFT')
        ON CONFLICT (job_id) DO NOTHING
        RETURNING id, job_id, terms, status, client_signed_at, worker_signed_at, signed_at, created_at
      `,
    ]);

    if (updatedRows.length === 0) {
      return {
        success: false,
        error: "Cannot accept this job because it was already changed",
        code: "INVALID_STATE",
      };
    }

    const contractRows = insertedContractRows.length > 0
      ? insertedContractRows
      : await sql`
          SELECT id, job_id, terms, status, client_signed_at, worker_signed_at, signed_at, created_at
          FROM contracts
          WHERE job_id = ${jobId}
          ORDER BY created_at ASC
          LIMIT 1
        `;

    const updatedJob = updatedRows[0];
    const contract = contractRows[0];

    await logAuditAction(session.user.id, "hiring_invitation_accepted", {
      jobId,
      contractId: contract.id,
      clientId: job.client_id,
      workerId: job.worker_id,
    });

    await createNotification({
      userId: job.client_id,
      type: "job_accepted",
      title: "Hiring Invitation Accepted",
      body: `Your hiring invitation for "${job.title}" was accepted. A contract draft is ready to fill in.`,
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

export async function rejectJob(jobId: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  if (session.user.role !== "worker") {
    return { success: false, error: "Forbidden" };
  }

  const workerAccess = await assertActiveVerifiedWorker(session.user.id);
  if (!workerAccess.allowed) {
    return { success: false, error: workerAccess.error || "Forbidden" };
  }

  try {
    const rejectionReason = typeof reason === "string" ? reason.trim().slice(0, 1000) : null;
    const updatedRows = await sql`
      UPDATE jobs 
      SET status = 'rejected',
          rejection_reason = ${rejectionReason},
          updated_at = NOW() 
      WHERE id = ${jobId}
        AND worker_id = ${session.user.id}
        AND status = 'pending'
      RETURNING client_id, title
    `;

    if (updatedRows.length === 0) {
      return { success: false, error: "Job not found or cannot be rejected now" };
    }

    const job = updatedRows[0];
    if (job.client_id) {
      await createNotification({
        userId: job.client_id,
        type: "job_rejected",
        title: "Job Declined",
        body: rejectionReason || `The worker declined your job request: "${job.title}".`,
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

  const workerAccess = await assertActiveVerifiedWorker(session.user.id);
  if (!workerAccess.allowed) {
    return { success: false, error: workerAccess.error || "Forbidden", code: "FORBIDDEN" };
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

  const workerAccess = await assertActiveVerifiedWorker(session.user.id);
  if (!workerAccess.allowed) {
    return { success: false, error: workerAccess.error || "Forbidden", code: "FORBIDDEN" };
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
      SET status = 'completion_requested', updated_at = NOW()
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
      type: "completion_requested",
      title: "Completion Requested",
      body: `The worker marked "${job.title}" as ready for your completion review.`,
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

export async function confirmJobCompletion(jobId: string): Promise<JobActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  if (session.user.role !== "client") {
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
    if (job.client_id !== session.user.id) {
      return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
    }

    if (job.status !== "completion_requested") {
      return {
        success: false,
        error: `Cannot confirm completion while job is in ${job.status} state`,
        code: "INVALID_STATE",
      };
    }

    const updatedRows = await sql`
      UPDATE jobs
      SET status = 'completed', updated_at = NOW()
      WHERE id = ${jobId}
        AND client_id = ${session.user.id}
        AND status = 'completion_requested'
      RETURNING *
    `;

    if (updatedRows.length === 0) {
      return { success: false, error: "Cannot confirm completion because the job changed", code: "INVALID_STATE" };
    }

    await logAuditAction(session.user.id, "job_completion_confirmed", { jobId });

    if (job.worker_id) {
      await createNotification({
        userId: job.worker_id,
        type: "completion_accepted",
        title: "Completion Confirmed",
        body: `The client confirmed completion for "${job.title}". Payment can now begin.`,
        linkHref: "/worker/earnings",
      });
    }

    revalidatePath("/client/contracts");
    revalidatePath("/client/dashboard");
    revalidatePath("/worker/contracts");
    revalidatePath("/worker/gigs");

    return { success: true, job: updatedRows[0] };
  } catch (error) {
    console.error("[CONFIRM_JOB_COMPLETION_ERROR]", error);
    return { success: false, error: "Failed to confirm completion", code: "UNKNOWN" };
  }
}

export async function rejectJobCompletion(jobId: string, reason?: string): Promise<JobActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  if (session.user.role !== "client") {
    return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
  }

  const rejectionReason = typeof reason === "string" ? reason.trim().slice(0, 1000) : null;

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
    if (job.client_id !== session.user.id) {
      return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
    }

    if (job.status !== "completion_requested") {
      return {
        success: false,
        error: `Cannot reject completion while job is in ${job.status} state`,
        code: "INVALID_STATE",
      };
    }

    const updatedRows = await sql`
      UPDATE jobs
      SET status = 'in_progress',
          completion_rejection_reason = ${rejectionReason},
          updated_at = NOW()
      WHERE id = ${jobId}
        AND client_id = ${session.user.id}
        AND status = 'completion_requested'
      RETURNING *
    `;

    if (updatedRows.length === 0) {
      return { success: false, error: "Cannot reject completion because the job changed", code: "INVALID_STATE" };
    }

    await logAuditAction(session.user.id, "job_completion_rejected", { jobId, reason: rejectionReason });

    if (job.worker_id) {
      await createNotification({
        userId: job.worker_id,
        type: "completion_rejected",
        title: "Completion Needs More Work",
        body: rejectionReason || `The client rejected completion for "${job.title}".`,
        linkHref: "/worker/gigs",
      });
    }

    revalidatePath("/client/contracts");
    revalidatePath("/worker/gigs");

    return { success: true, job: updatedRows[0] };
  } catch (error) {
    console.error("[REJECT_JOB_COMPLETION_ERROR]", error);
    return { success: false, error: "Failed to reject completion", code: "UNKNOWN" };
  }
}

export async function updateJobStatus(jobId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  if (!isJobStatus(status)) {
    return { success: false, error: "Invalid job status" };
  }

  try {
    const jobRows = await sql`SELECT client_id, worker_id, title, status FROM jobs WHERE id = ${jobId} LIMIT 1`;
    if (jobRows.length === 0) return { success: false, error: "Job not found" };
    
    const job = jobRows[0];
    const role = session.user.role as JobActorRole;

    if (!["client", "worker", "admin"].includes(role)) {
      return { success: false, error: "Forbidden" };
    }

    if (role === "admin") {
      return { success: false, error: "Forbidden" };
    }

    if (role === "client" && job.client_id !== session.user.id) {
      return { success: false, error: "Forbidden" };
    }

    if (role === "worker" && job.worker_id !== session.user.id) {
      return { success: false, error: "Forbidden" };
    }

    if (role === "worker") {
      const workerAccess = await assertActiveVerifiedWorker(session.user.id);
      if (!workerAccess.allowed) {
        return { success: false, error: workerAccess.error || "Forbidden" };
      }
    }

    const transition = assertAllowedJobTransition(job.status, status, role);
    if (!transition.allowed) {
      return { success: false, error: transition.error || "This status transition is not allowed" };
    }

    const updatedRows = await sql`
      UPDATE jobs 
      SET status = ${status}, updated_at = NOW() 
      WHERE id = ${jobId}
        AND status = ${job.status}
      RETURNING id
    `;

    if (updatedRows.length === 0) {
      return { success: false, error: "Cannot update job because its status changed" };
    }

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
    if (notifyId) {
      await createNotification({
        userId: notifyId,
        type: "job_status_update",
        title: "Job Status Changed",
        body: `The status of "${job.title}" has been updated to "${status}".`,
        linkHref: session.user.role === 'worker' ? `/client/dashboard` : `/worker/gigs`
      });
    }

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

