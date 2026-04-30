import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skill = searchParams.get("skill");
    const userLat = parseFloat(searchParams.get("lat") || "");
    const userLng = parseFloat(searchParams.get("lng") || "");
    const maxDist = parseFloat(searchParams.get("maxDistance") || "100");

    const hasCoords = !isNaN(userLat) && !isNaN(userLng);

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
    `;

    if (hasCoords) {
      query += `, (
        111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${userLat}))
         * COS(RADIANS(wp.latitude))
         * COS(RADIANS(wp.longitude) - RADIANS(${userLng}))
         + SIN(RADIANS(${userLat}))
         * SIN(RADIANS(wp.latitude)))))
      ) AS distance`;
    } else {
      query += `, 0 AS distance`;
    }

    query += `
      FROM users u
      JOIN worker_profiles wp ON u.id = wp.user_id
      LEFT JOIN ratings r ON u.id = r.rated_id
      WHERE u.role = 'worker'
    `;

    const params: (string | number)[] = [];

    if (skill) {
      params.push(`%${skill}%`);
      query += ` AND $${params.length} = ANY(wp.skills)`;
    }

    if (hasCoords && maxDist < 100) {
      query += ` AND (
        111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(${userLat}))
         * COS(RADIANS(wp.latitude))
         * COS(RADIANS(wp.longitude) - RADIANS(${userLng}))
         + SIN(RADIANS(${userLat}))
         * SIN(RADIANS(wp.latitude)))))
      ) <= ${maxDist}`;
    }

    query += ` GROUP BY u.id, wp.full_name, wp.bio, wp.skills, wp.latitude, wp.longitude, wp.hourly_rate, wp.avatar_url, wp.is_verified, wp.latitude, wp.longitude`;
    
    if (hasCoords) {
      query += ` ORDER BY distance ASC, avg_rating DESC LIMIT 50`;
    } else {
      query += ` ORDER BY avg_rating DESC LIMIT 50`;
    }

    const workers = await sql(query, params);

    return NextResponse.json({ workers });
  } catch (error) {
    console.error("[WORKERS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
