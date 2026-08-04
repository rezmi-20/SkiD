import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryStr = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const userLat = parseFloat(searchParams.get("lat") || "");
    const userLng = parseFloat(searchParams.get("lng") || "");
    const maxDist = parseFloat(searchParams.get("maxDistance") || "100");
    const minRating = parseFloat(searchParams.get("minRating") || "0");

    const hasCoords = !isNaN(userLat) && !isNaN(userLng);
    const params: (string | number)[] = [];
    
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
        AND u.is_suspended = false
        AND wp.is_verified = true
        AND wp.verification_status = 'approved'
    `;

    // Query filtering (Name OR Skill)
    if (queryStr && queryStr.trim() !== "") {
      params.push(`%${queryStr.toLowerCase()}%`);
      query += ` AND (
        LOWER(wp.full_name) LIKE $${params.length} 
        OR EXISTS (
          SELECT 1 FROM unnest(wp.skills) s 
          WHERE LOWER(s) LIKE $${params.length}
        )
      )`;
    }

    // Category filtering (Skill specific)
    if (category && category.trim() !== "" && category !== "All") {
      params.push(`%${category.toLowerCase()}%`);
      query += ` AND EXISTS (
        SELECT 1 FROM unnest(wp.skills) s 
        WHERE LOWER(s) LIKE $${params.length}
      )`;
    }

    // Distance filtering
    if (hasCoords && maxDist < 100) {
      params.push(maxDist);
      query += ` AND wp.latitude IS NOT NULL AND wp.longitude IS NOT NULL AND ${distanceSql} <= $${params.length}`;
    }

    // Rating filter
    if (!isNaN(minRating) && minRating > 0) {
      params.push(minRating);
      query += ` AND COALESCE(wr.avg_rating, 0) >= $${params.length}`;
    }

    // Sorting
    if (hasCoords) {
      query += ` ORDER BY distance ASC NULLS LAST, avg_rating DESC LIMIT 50`;
    } else {
      query += ` ORDER BY avg_rating DESC LIMIT 50`;
    }

    const workers = await sql.query(query, params);

    return NextResponse.json({ workers });
  } catch (error) {
    console.error("[WORKERS_GET_CRITICAL_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
