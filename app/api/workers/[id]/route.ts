import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid worker ID" }, { status: 400 });
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    // Execute worker profile and reviews concurrently for instant response
    const [rows, reviews] = await Promise.all([
      sql`
        SELECT
          u.id,
          wp.full_name,
          wp.bio,
          wp.skills,
          CASE WHEN u.id = ${session?.user?.id ?? null} OR EXISTS (
            SELECT 1 FROM jobs location_job
            WHERE location_job.worker_id = u.id
              AND location_job.client_id = ${session?.user?.id ?? null}
              AND location_job.status IN ('accepted', 'active', 'in_progress', 'completion_requested', 'completed', 'payment_pending', 'paid', 'closed')
          ) THEN wp.latitude ELSE ROUND(wp.latitude::numeric, 2)::double precision END AS latitude,
          CASE WHEN u.id = ${session?.user?.id ?? null} OR EXISTS (
            SELECT 1 FROM jobs location_job
            WHERE location_job.worker_id = u.id
              AND location_job.client_id = ${session?.user?.id ?? null}
              AND location_job.status IN ('accepted', 'active', 'in_progress', 'completion_requested', 'completed', 'payment_pending', 'paid', 'closed')
          ) THEN wp.longitude ELSE ROUND(wp.longitude::numeric, 2)::double precision END AS longitude,
          wp.hourly_rate,
          MAX(CASE WHEN u.id = ${session?.user?.id ?? null} OR EXISTS (
            SELECT 1 FROM jobs accepted_job
            WHERE accepted_job.worker_id = u.id
              AND accepted_job.client_id = ${session?.user?.id ?? null}
              AND accepted_job.status IN ('accepted', 'active', 'in_progress', 'completion_requested', 'completed', 'payment_pending', 'paid', 'closed')
          ) THEN wp.avatar_url ELSE NULL END) AS avatar_url,
          wp.is_verified,
          COALESCE(AVG(r.score), 0) AS avg_rating,
          COUNT(r.id) AS total_ratings
        FROM users u
        JOIN worker_profiles wp ON u.id = wp.user_id
        LEFT JOIN ratings r ON u.id = r.rated_id
        WHERE (u.id = ${id} OR wp.id = ${id})
          AND u.role = 'worker'
          AND u.is_suspended = false
          AND wp.is_verified = true
          AND wp.verification_status = 'approved'
          AND wp.fayda_doc_url IS NOT NULL
          AND length(wp.fayda_doc_url) > 0
          AND wp.fin_last4 IS NOT NULL
          AND length(wp.fin_last4) = 4
          AND wp.fin_encrypted IS NOT NULL
          AND length(wp.fin_encrypted) > 0
        GROUP BY u.id, wp.full_name, wp.bio, wp.skills, wp.latitude, wp.longitude, wp.hourly_rate, wp.is_verified
        LIMIT 1`,
      sql`
        SELECT
          r.score,
          r.comment,
          r.created_at,
          'Verified Client' as reviewer_name,
          NULL::text as reviewer_avatar
        FROM ratings r
        JOIN jobs j ON r.job_id = j.id
        LEFT JOIN client_profiles cp ON r.rater_id = cp.user_id
        WHERE r.rated_id = ${id}
          AND r.is_flagged = false
          AND j.status IN ('paid', 'closed')
        ORDER BY r.created_at DESC LIMIT 20`,
    ]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    return NextResponse.json(
      { worker: rows[0], reviews },
      {
        headers: {
          "Cache-Control": "private, max-age=15, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("[WORKER_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
