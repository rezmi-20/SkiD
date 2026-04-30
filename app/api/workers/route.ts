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
    const params: (string | number)[] = [];
    
    console.log("[WORKERS_GET] Params:", { skill, userLat, userLng, maxDist, hasCoords });

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
      params.push(userLat, userLng);
      const latIdx = params.length - 1;
      const lngIdx = params.length;
      query += `, (
        111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS($${latIdx}))
         * COS(RADIANS(wp.latitude))
         * COS(RADIANS(wp.longitude) - RADIANS($${lngIdx}))
         + SIN(RADIANS($${latIdx}))
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

    // Case-insensitive skill matching
    if (skill && skill.trim() !== "") {
      params.push(skill.toLowerCase());
      query += ` AND EXISTS (
        SELECT 1 FROM unnest(wp.skills) s 
        WHERE LOWER(s) LIKE '%' || $${params.length} || '%'
      )`;
    }

    // Distance filter
    if (hasCoords && maxDist < 100) {
      // Re-use the lat/lng params
      const latIdx = 1;
      const lngIdx = 2;
      query += ` AND (
        wp.latitude IS NULL OR (
          111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS($${latIdx}))
           * COS(RADIANS(wp.latitude))
           * COS(RADIANS(wp.longitude) - RADIANS($${lngIdx}))
           + SIN(RADIANS($${latIdx}))
           * SIN(RADIANS(wp.latitude)))))
        ) <= ${maxDist}
      )`;
    }

    query += ` GROUP BY u.id, u.email, wp.full_name, wp.bio, wp.skills, wp.latitude, wp.longitude, wp.hourly_rate, wp.avatar_url, wp.is_verified`;
    
    if (hasCoords) {
      query += ` ORDER BY distance ASC NULLS LAST, avg_rating DESC LIMIT 50`;
    } else {
      query += ` ORDER BY avg_rating DESC LIMIT 50`;
    }

    const workers = await sql(query, params);
    console.log(`[WORKERS_GET] Found ${workers.length} workers`);

    return NextResponse.json({ workers });
  } catch (error) {
    console.error("[WORKERS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
