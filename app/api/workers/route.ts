import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const queryStr = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const userLat = parseFloat(searchParams.get("lat") || "");
    const userLng = parseFloat(searchParams.get("lng") || "");
    const maxDist = parseFloat(searchParams.get("maxDistance") || "100");
    const minRating = parseFloat(searchParams.get("minRating") || "0");

    const hasCoords = !isNaN(userLat) && !isNaN(userLng);
    const params: (string | number | null)[] = [];
    
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
        CASE WHEN u.id = $VIEWER_ID$ OR EXISTS (
          SELECT 1 FROM jobs location_job
          WHERE location_job.worker_id = u.id
            AND location_job.client_id = $VIEWER_ID$
            AND location_job.status IN ('accepted', 'active', 'in_progress', 'completion_requested', 'completed', 'payment_pending', 'paid', 'closed')
        ) THEN COALESCE(wp.latitude, 9.5931)
        ELSE ROUND(COALESCE(wp.latitude, 9.5931)::numeric, 2)::double precision END as latitude,
        CASE WHEN u.id = $VIEWER_ID$ OR EXISTS (
          SELECT 1 FROM jobs location_job
          WHERE location_job.worker_id = u.id
            AND location_job.client_id = $VIEWER_ID$
            AND location_job.status IN ('accepted', 'active', 'in_progress', 'completion_requested', 'completed', 'payment_pending', 'paid', 'closed')
        ) THEN COALESCE(wp.longitude, 41.8661)
        ELSE ROUND(COALESCE(wp.longitude, 41.8661)::numeric, 2)::double precision END as longitude,
        wp.hourly_rate,
        __WORKER_AVATAR_VISIBILITY__,
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

    const viewerIdParam = params.push(session?.user?.id ?? null);
    query = query.replaceAll("$VIEWER_ID$", `$${viewerIdParam}`);
    query = query.replace(
      "__WORKER_AVATAR_VISIBILITY__",
      `CASE WHEN u.id = $${viewerIdParam} OR EXISTS (
        SELECT 1 FROM jobs accepted_job
        WHERE accepted_job.worker_id = u.id
          AND accepted_job.client_id = $${viewerIdParam}
          AND accepted_job.status IN ('accepted', 'active', 'in_progress', 'completion_requested', 'completed', 'payment_pending', 'paid', 'closed')
      ) THEN wp.avatar_url ELSE NULL END AS avatar_url`,
    );

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
    console.error("[WORKERS_GET_CRITICAL_ERROR]", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ error: "Unable to load workers." }, { status: 500 });
  }
}
