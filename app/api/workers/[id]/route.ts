import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rows = await sql`
      SELECT
        u.id,
        wp.full_name,
        wp.bio,
        wp.skills,
        wp.latitude,
        wp.longitude,
        wp.hourly_rate,
        wp.avatar_url,
        wp.is_verified,
        COALESCE(AVG(r.score), 0) AS avg_rating,
        COUNT(r.id) AS total_ratings
      FROM users u
      JOIN worker_profiles wp ON u.id = wp.user_id
      LEFT JOIN ratings r ON u.id = r.rated_id
      WHERE u.id = ${id}
        AND u.role = 'worker'
        AND u.is_suspended = false
        AND wp.is_verified = true
        AND wp.verification_status = 'approved'
      GROUP BY u.id, wp.full_name, wp.bio, wp.skills, wp.latitude, wp.longitude, wp.hourly_rate, wp.avatar_url, wp.is_verified`;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const reviews = await sql`
       SELECT
         r.score,
         r.comment,
         r.created_at,
         COALESCE(cp.full_name, 'Verified client') as reviewer_name,
         cp.avatar_url as reviewer_avatar
       FROM ratings r
       JOIN jobs j ON r.job_id = j.id
       LEFT JOIN client_profiles cp ON r.rater_id = cp.user_id
       WHERE r.rated_id = ${id}
         AND r.is_flagged = false
         AND j.status IN ('paid', 'closed')
       ORDER BY r.created_at DESC LIMIT 20`;

    return NextResponse.json({ worker: rows[0], reviews });
  } catch (error) {
    console.error("[WORKER_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
