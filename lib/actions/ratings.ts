"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/actions/notifications";

export async function getRatingPageData(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  try {
    // Get job + both party details
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
        wp.skills
      FROM jobs j
      LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      WHERE j.id = ${jobId}
        AND (j.client_id = ${userId} OR j.worker_id = ${userId})
    `;

    if (jobs.length === 0) return null;
    const job = jobs[0];

    // Check if user already rated this job
    const existing = await sql`
      SELECT id FROM ratings WHERE job_id = ${jobId} AND rater_id = ${userId}
    `;

    // Determine who is being rated
    const role = session.user.role;
    const ratedId = role === 'client' ? job.worker_id : job.client_id;
    const ratedName = role === 'client' ? job.worker_name : job.client_name;
    const ratedAvatar = role === 'client' ? job.worker_avatar : job.client_avatar;
    const ratedVerified = role === 'client' ? job.worker_verified : job.client_verified;

    return {
      job,
      ratedId,
      ratedName,
      ratedAvatar,
      ratedVerified,
      alreadyRated: existing.length > 0,
      currentUserRole: role,
    };
  } catch (error) {
    console.error("[GET_RATING_PAGE_DATA_ERROR]", error);
    return null;
  }
}

export async function submitRating(data: {
  jobId: string;
  ratedId: string;
  score: number;
  comment?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const userId = session.user.id;

  // Only allow rating on completed jobs
  const jobs = await sql`
    SELECT status FROM jobs
    WHERE id = ${data.jobId} AND (client_id = ${userId} OR worker_id = ${userId})
  `;

  if (jobs.length === 0) return { success: false, error: "Job not found" };
  if (jobs[0].status !== 'completed') return { success: false, error: "You can only rate completed jobs." };

  // Prevent duplicate
  const existing = await sql`
    SELECT id FROM ratings WHERE job_id = ${data.jobId} AND rater_id = ${userId}
  `;
  if (existing.length > 0) return { success: false, error: "You have already submitted a review for this job." };

  try {
    await sql`
      INSERT INTO ratings (job_id, rater_id, rated_id, score, comment)
      VALUES (${data.jobId}, ${userId}, ${data.ratedId}, ${data.score}, ${data.comment ?? null})
    `;

    // Notify the rated user
    const stars = "★".repeat(data.score) + "☆".repeat(5 - data.score);
    await createNotification({
      userId: data.ratedId,
      type: "new_review",
      title: "You Received a New Review!",
      body: `${stars} — "${data.comment ? data.comment.substring(0, 60) + (data.comment.length > 60 ? '…' : '') : 'No written comment.'}"`,
      linkHref: `/worker/profile`,
    });

    revalidatePath(`/client/contracts`);
    revalidatePath(`/worker/contracts`);

    return { success: true };
  } catch (error: any) {
    if (error?.message?.includes('unique')) {
      return { success: false, error: "You have already reviewed this job." };
    }
    console.error("[SUBMIT_RATING_ERROR]", error);
    return { success: false, error: "Failed to submit review." };
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
