import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ratingSchema = z.object({
  jobId: z.string().uuid(),
  ratedId: z.string().uuid(),
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

    // Verify job belongs to user
    const jobs = await sql`SELECT id FROM jobs WHERE id = ${jobId} AND (client_id = ${session.user.id} OR worker_id = ${session.user.id})`;
    if (jobs.length === 0) return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });

    await sql`
      INSERT INTO ratings (job_id, rater_id, rated_id, score, comment)
       VALUES (${jobId}, ${session.user.id}, ${ratedId}, ${score}, ${comment ?? null})`;

    return NextResponse.json({ message: "Rating submitted successfully" }, { status: 201 });
  } catch (error) {
    console.error("[RATING_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
