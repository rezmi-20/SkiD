import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skill = searchParams.get("skill");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    let query = `
      SELECT
        u.id,
        u.email,
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
      WHERE u.role = 'worker' AND wp.is_verified = true
    `;

    const params: (string | number)[] = [];

    if (skill) {
      params.push(`%${skill}%`);
      query += ` AND $${params.length} = ANY(wp.skills)`;
    }

    query += ` GROUP BY u.id, wp.full_name, wp.bio, wp.skills, wp.latitude, wp.longitude, wp.hourly_rate, wp.avatar_url, wp.is_verified`;
    query += ` ORDER BY avg_rating DESC LIMIT 50`;

    const workers = await sql(query, params);

    return NextResponse.json({ workers });
  } catch (error) {
    console.error("[WORKERS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
