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
    
    let distanceSql = "NULL";
    if (hasCoords) {
      params.push(userLat, userLng);
      // Robust spherical distance calculation handling fallback Dire Dawa coordinates (9.5931, 41.8661)
      distanceSql = `(
        6371 * ACOS(
          GREATEST(-1.0, LEAST(1.0, 
            COS(RADIANS($1)) * COS(RADIANS(COALESCE(wp.latitude, 9.5931))) * COS(RADIANS(COALESCE(wp.longitude, 41.8661)) - RADIANS($2)) + 
            SIN(RADIANS($1)) * SIN(RADIANS(COALESCE(wp.latitude, 9.5931)))
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
        COALESCE(wp.latitude, 9.5931) as latitude,
        COALESCE(wp.longitude, 41.8661) as longitude,
        wp.hourly_rate,
        wp.avatar_url,
        wp.is_verified,
        COALESCE(wp.availability, 'available') as availability,
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
        AND wp.fayda_doc_url IS NOT NULL
        AND length(wp.fayda_doc_url) > 0
        AND wp.fin_last4 IS NOT NULL
        AND length(wp.fin_last4) = 4
        AND wp.fin_encrypted IS NOT NULL
        AND length(wp.fin_encrypted) > 0
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

    // Distance filtering: only apply distance threshold if distance filter is explicitly < 50
    if (hasCoords && maxDist < 50) {
      params.push(maxDist);
      query += ` AND ${distanceSql} <= $${params.length}`;
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

    const workers = typeof sql.query === "function" 
      ? await sql.query(query, params) 
      : await sql(query, params);

    return NextResponse.json({ workers });
  } catch (error: any) {
    console.error("[WORKERS_GET_CRITICAL_ERROR]", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
