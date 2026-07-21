"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/actions/notifications";
import { sanitizeText } from "@/lib/sanitize";

type RatingActionResult =
  | { success: true }
  | {
      success: false;
      error: string;
      code?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INVALID_STATE" | "DUPLICATE" | "UNKNOWN";
    };

const RATEABLE_JOB_STATUSES = ["paid", "closed"] as const;

function isRateableJobStatus(status: string | null | undefined) {
  return RATEABLE_JOB_STATUSES.includes(status as (typeof RATEABLE_JOB_STATUSES)[number]);
}

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

export async function getRatingPageData(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const role = session.user.role;

  if (role !== "client" && role !== "worker") return null;

  try {
    const jobs = await sql`
      SELECT
        j.id as job_id,
        j.title as job_title,
        j.status,
        j.client_id,
        j.worker_id,
        cp.full_name as client_name,
        cp.avatar_url as client_avatar,
        cp.is_verified as client_verified,
        wp.full_name as worker_name,
        wp.avatar_url as worker_avatar,
        wp.is_verified as worker_verified,
        wp.skills,
        p.status as payment_status
      FROM jobs j
      LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      LEFT JOIN payments p ON p.job_id = j.id AND p.status = 'released'
      WHERE j.id = ${jobId}
        AND (j.client_id = ${userId} OR j.worker_id = ${userId})
      ORDER BY p.created_at DESC NULLS LAST
      LIMIT 1
    `;

    if (jobs.length === 0) return null;
    const job = jobs[0];

    const isClient = role === "client" && job.client_id === userId;
    const isWorker = role === "worker" && job.worker_id === userId;
    if (!isClient && !isWorker) return null;

    const existing = await sql`
      SELECT id FROM ratings
      WHERE job_id = ${jobId} AND rater_id = ${userId}
      LIMIT 1
    `;

    return {
      job,
      ratedId: isClient ? job.worker_id : job.client_id,
      ratedName: isClient ? job.worker_name : job.client_name,
      ratedAvatar: isClient ? job.worker_avatar : job.client_avatar,
      ratedVerified: isClient ? job.worker_verified : job.client_verified,
      alreadyRated: existing.length > 0,
      currentUserRole: role,
      canRate: isRateableJobStatus(job.status) && job.payment_status === "released",
    };
  } catch (error) {
    console.error("[GET_RATING_PAGE_DATA_ERROR]", error);
    return null;
  }
}

export async function rateWorker(jobId: string, rating: number, reviewText?: string): Promise<RatingActionResult> {
  return rateForRole(jobId, rating, reviewText, "client");
}

export async function rateClient(jobId: string, rating: number, reviewText?: string): Promise<RatingActionResult> {
  return rateForRole(jobId, rating, reviewText, "worker");
}

export async function submitRating(data: {
  jobId: string;
  ratedId?: string;
  score: number;
  comment?: string;
}) {
  const session = await auth();

  if (session?.user?.role === "client") {
    return rateWorker(data.jobId, data.score, data.comment);
  }

  if (session?.user?.role === "worker") {
    return rateClient(data.jobId, data.score, data.comment);
  }

  return { success: false, error: "You don't have permission", code: "FORBIDDEN" as const };
}

async function rateForRole(
  jobId: string,
  rating: number,
  reviewText: string | undefined,
  role: "client" | "worker"
): Promise<RatingActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  if (session.user.role !== role) {
    return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
  }

  const score = Number(rating);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return { success: false, error: "Rating must be between 1 and 5", code: "INVALID_STATE" };
  }

  try {
    const jobs = await sql`
      SELECT
        j.id,
        j.title,
        j.status,
        j.client_id,
        j.worker_id,
        p.status as payment_status
      FROM jobs j
      LEFT JOIN payments p ON p.job_id = j.id AND p.status = 'released'
      WHERE j.id = ${jobId}
      ORDER BY p.created_at DESC NULLS LAST
      LIMIT 1
    `;

    if (jobs.length === 0) {
      return { success: false, error: "Job not found", code: "NOT_FOUND" };
    }

    const job = jobs[0];
    const isClientRatingWorker = role === "client";

    if (isClientRatingWorker && job.client_id !== session.user.id) {
      return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
    }

    if (!isClientRatingWorker && job.worker_id !== session.user.id) {
      return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
    }

    if (!isRateableJobStatus(job.status) || job.payment_status !== "released") {
      return {
        success: false,
        error: "Reviews are available after the job has been paid.",
        code: "INVALID_STATE",
      };
    }

    const existing = await sql`
      SELECT id FROM ratings
      WHERE job_id = ${jobId} AND rater_id = ${session.user.id}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return { success: false, error: "You have already submitted a review for this job.", code: "DUPLICATE" };
    }

    const ratedId = isClientRatingWorker ? job.worker_id : job.client_id;
    if (!ratedId) {
      return { success: false, error: "The other party could not be found.", code: "INVALID_STATE" };
    }

    await sql`
      INSERT INTO ratings (job_id, rater_id, rated_id, score, comment)
      VALUES (${jobId}, ${session.user.id}, ${ratedId}, ${score}, ${sanitizeText(reviewText || "") || null})
    `;

    const submittedDirections = await sql`
      SELECT COUNT(*)::int as count
      FROM ratings
      WHERE job_id = ${jobId}
        AND (
          (rater_id = ${job.client_id} AND rated_id = ${job.worker_id})
          OR (rater_id = ${job.worker_id} AND rated_id = ${job.client_id})
        )
    `;

    if (Number(submittedDirections[0]?.count || 0) >= 2) {
      await sql`
        UPDATE jobs
        SET status = 'closed', updated_at = NOW()
        WHERE id = ${jobId} AND status = 'paid'
      `;
    }

    await logAuditAction(session.user.id, "rating_submitted", {
      jobId,
      ratedId,
      score,
      ratedRole: isClientRatingWorker ? "worker" : "client",
    });

    await createNotification({
      userId: ratedId,
      type: "new_review",
      title: "New Review Received",
      body: `You received a ${score}-star review for "${job.title}".`,
      linkHref: isClientRatingWorker ? "/worker/profile" : "/client/profile",
    });

    revalidatePath("/client/contracts");
    revalidatePath("/worker/contracts");
    revalidatePath("/client/dashboard");
    revalidatePath("/worker/dashboard");
    revalidatePath(`/client/worker/${job.worker_id}`);

    return { success: true };
  } catch (error: any) {
    if (error?.message?.includes("unique")) {
      return { success: false, error: "You have already reviewed this job.", code: "DUPLICATE" };
    }

    console.error("[SUBMIT_RATING_ERROR]", error);
    return { success: false, error: "Failed to submit review.", code: "UNKNOWN" };
  }
}

export async function getWorkerRatings(workerId: string) {
  try {
    const rows = await sql`
      SELECT
        r.*,
        cp.full_name as reviewer_name,
        cp.avatar_url as reviewer_avatar,
        cp.is_verified as reviewer_verified,
        j.title as job_title
      FROM ratings r
      JOIN jobs j ON r.job_id = j.id
      LEFT JOIN client_profiles cp ON r.rater_id = cp.user_id
      WHERE r.rated_id = ${workerId} AND r.is_flagged = false
      ORDER BY r.created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error("[GET_WORKER_RATINGS_ERROR]", error);
    return [];
  }
}
