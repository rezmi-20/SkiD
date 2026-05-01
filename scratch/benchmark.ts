import { sql } from "../lib/db";
import "dotenv/config";

async function benchmark() {
  const start = Date.now();
  try {
    console.log("Running search query benchmark...");
    const res = await sql`
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
        COALESCE(wr.total_ratings, 0) as total_ratings
      FROM users u
      JOIN worker_profiles wp ON u.id = wp.user_id
      LEFT JOIN worker_ratings wr ON u.id = wr.rated_id
      WHERE u.role = 'worker'
      LIMIT 50
    `;
    console.log(`Query took ${Date.now() - start}ms. Found ${res.length} workers.`);
  } catch (err) {
    console.error("Benchmark failed:", err);
  }
}

benchmark();
