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
    
    console.log("[WORKERS_GET] Start", { skill, userLat, userLng, hasCoords });

    let distanceSql = "0";
    if (hasCoords) {
      params.push(userLat, userLng);
      // Using a slightly more robust formula to avoid ACOS domain errors
      distanceSql = `(
        6371 * ACOS(
          GREATEST(-1.0, LEAST(1.0, 
            COS(RADIANS($1)) * COS(RADIANS(wp.latitude)) * COS(RADIANS(wp.longitude) - RADIANS($2)) + 
            SIN(RADIANS($1)) * SIN(RADIANS(wp.latitude))
          ))
        )
      )`;
    }

    let query = `
      WITH worker_ratings AS (
        SELECT 
          rated_id, 
          AVG(score) as avg_rating, 
          COUNT(id) as total_ratings 
        FROM ratings 
        GROUP BY rated_id
      )
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
        COALESCE(wr.avg_rating, 0) as avg_rating,
        COALESCE(wr.total_ratings, 0) as total_ratings,
        ${distanceSql} as distance
      FROM users u
      JOIN worker_profiles wp ON u.id = wp.user_id
      LEFT JOIN worker_ratings wr ON u.id = wr.rated_id
      WHERE u.role = 'worker'
    `;

    // Skill filtering
    if (skill && skill.trim() !== "") {
      params.push(`%${skill.toLowerCase()}%`);
      query += ` AND EXISTS (
        SELECT 1 FROM unnest(wp.skills) s 
        WHERE LOWER(s) LIKE $${params.length}
      )`;
    }

    // Distance filtering
    if (hasCoords && maxDist < 100) {
      query += ` AND (wp.latitude IS NULL OR ${distanceSql} <= ${maxDist})`;
    }

    // Sorting
    if (hasCoords) {
      query += ` ORDER BY distance ASC NULLS LAST, avg_rating DESC LIMIT 50`;
    } else {
      query += ` ORDER BY avg_rating DESC LIMIT 50`;
    }

    console.log("[WORKERS_GET] Executing Query");
    const workers = await sql(query, params);
    console.log(`[WORKERS_GET] Success: ${workers.length} found`);

    return NextResponse.json({ workers });
  } catch (error) {
    console.error("[WORKERS_GET_CRITICAL_ERROR]", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "SQL execution failed",
      stack: process.env.NODE_ENV === 'development' ? (error as any).stack : undefined
    }, { status: 500 });
  }
}
