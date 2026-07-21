import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { sanitizeText } from "@/lib/sanitize";

const ratingSchema = z.object({
  jobId: z.string().uuid(),
  ratedId: z.string().uuid().optional(),
  score: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = ratingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { jobId, ratedId, score, comment } = parsed.data;

    const jobs = await sql`
      SELECT
        j.id,
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
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobs[0];
    const isClient = session.user.id === job.client_id;
    const isWorker = session.user.id === job.worker_id;

    if (!isClient && !isWorker) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!["paid", "closed"].includes(job.status) || job.payment_status !== "released") {
      return NextResponse.json(
        { error: "Ratings are available only after the job is paid." },
        { status: 409 }
      );
    }

    const expectedRatedId = isClient ? job.worker_id : job.client_id;
    if (!expectedRatedId) {
      return NextResponse.json({ error: "The other party could not be found." }, { status: 409 });
    }

    if (expectedRatedId === session.user.id || ratedId === session.user.id) {
      return NextResponse.json({ error: "Self-rating is not allowed." }, { status: 400 });
    }

    if (ratedId && ratedId !== expectedRatedId) {
      return NextResponse.json({ error: "Invalid rating target for this job." }, { status: 403 });
    }

    const existing = await sql`
      SELECT id FROM ratings
      WHERE job_id = ${jobId}
        AND rater_id = ${session.user.id}
        AND rated_id = ${expectedRatedId}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: "You have already rated this job." }, { status: 409 });
    }

    await sql`
      INSERT INTO ratings (job_id, rater_id, rated_id, score, comment)
       VALUES (${jobId}, ${session.user.id}, ${expectedRatedId}, ${score}, ${sanitizeText(comment || "") || null})`;

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

    return NextResponse.json({ message: "Rating submitted successfully" }, { status: 201 });
  } catch (error) {
    console.error("[RATING_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
