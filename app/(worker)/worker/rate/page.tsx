export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import WorkerRatingsIndexContent from "@/components/WorkerRatingsIndexContent";

export const metadata = {
  title: "Client Reviews & Ratings | DireSkill",
  description: "View your reputation score, 5-star distribution, and feedback from clients in Dire Dawa.",
};

export default async function WorkerRateIndexPage() {
  const session = await auth();
  if (!session || session.user.role !== "worker") {
    redirect("/login");
  }

  const userId = session.user.id;

  // 1. Fetch reviews received from clients
  const reviews = await sql`
    SELECT
      r.id,
      r.score,
      r.comment,
      r.created_at,
      j.id as job_id,
      j.title as job_title,
      COALESCE(cp.full_name, cu.email, 'Verified Client') as client_name,
      cp.avatar_url as client_avatar
    FROM ratings r
    JOIN jobs j ON r.job_id = j.id
    JOIN users cu ON r.rater_id = cu.id
    LEFT JOIN client_profiles cp ON cu.id = cp.user_id
    WHERE r.rated_id = ${userId}
    ORDER BY r.created_at DESC
    LIMIT 50
  `;

  // 2. Fetch completed/paid jobs waiting for the worker to rate the client
  const pendingJobs = await sql`
    SELECT
      j.id as job_id,
      j.title as job_title,
      j.budget,
      COALESCE(cp.full_name, cu.email, 'Client') as client_name,
      cp.avatar_url as client_avatar
    FROM jobs j
    JOIN users cu ON j.client_id = cu.id
    LEFT JOIN client_profiles cp ON cu.id = cp.user_id
    WHERE j.worker_id = ${userId}
      AND j.status IN ('paid', 'closed', 'completed')
      AND NOT EXISTS (
        SELECT 1 FROM ratings r WHERE r.job_id = j.id AND r.rater_id = ${userId}
      )
    ORDER BY j.created_at DESC
    LIMIT 20
  `;

  // 3. Aggregate statistics
  const statsRows = await sql`
    SELECT
      COUNT(*)::int as total_reviews,
      ROUND(AVG(score), 1)::float as avg_score,
      COUNT(CASE WHEN score = 5 THEN 1 END)::int as star_5,
      COUNT(CASE WHEN score = 4 THEN 1 END)::int as star_4,
      COUNT(CASE WHEN score = 3 THEN 1 END)::int as star_3,
      COUNT(CASE WHEN score = 2 THEN 1 END)::int as star_2,
      COUNT(CASE WHEN score = 1 THEN 1 END)::int as star_1
    FROM ratings
    WHERE rated_id = ${userId}
  `;

  const stats = statsRows[0] || {
    total_reviews: 0,
    avg_score: 5.0,
    star_5: 0,
    star_4: 0,
    star_3: 0,
    star_2: 0,
    star_1: 0,
  };

  return (
    <WorkerRatingsIndexContent
      reviews={reviews as any}
      pendingRatingJobs={pendingJobs as any}
      stats={stats as any}
    />
  );
}
