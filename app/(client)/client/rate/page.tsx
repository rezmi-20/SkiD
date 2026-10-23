export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import ClientRatingsIndexContent from "@/components/ClientRatingsIndexContent";

export const metadata = {
  title: "Professional Ratings & Feedback | DireSkill",
  description: "View ratings and feedback given to verified artisans in Dire Dawa.",
};

export default async function ClientRateIndexPage() {
  const session = await auth();
  if (!session || session.user.role !== "client") {
    redirect("/login");
  }

  const userId = session.user.id;

  // 1. Fetch reviews given by this client to workers
  const reviews = await sql`
    SELECT
      r.id,
      r.score,
      r.comment,
      r.created_at,
      j.id as job_id,
      j.title as job_title,
      COALESCE(wp.full_name, wu.email, 'Assigned Pro') as worker_name,
      wp.avatar_url as worker_avatar
    FROM ratings r
    JOIN jobs j ON r.job_id = j.id
    JOIN users wu ON r.rated_id = wu.id
    LEFT JOIN worker_profiles wp ON wu.id = wp.user_id
    WHERE r.rater_id = ${userId}
    ORDER BY r.created_at DESC
    LIMIT 50
  `;

  // 2. Fetch completed/paid jobs waiting for the client to rate the worker
  const pendingJobs = await sql`
    SELECT
      j.id as job_id,
      j.title as job_title,
      j.budget,
      COALESCE(wp.full_name, wu.email, 'Assigned Pro') as worker_name,
      wp.avatar_url as worker_avatar
    FROM jobs j
    JOIN users wu ON j.worker_id = wu.id
    LEFT JOIN worker_profiles wp ON wu.id = wp.user_id
    WHERE j.client_id = ${userId}
      AND j.status IN ('paid', 'closed', 'completed')
      AND NOT EXISTS (
        SELECT 1 FROM ratings r WHERE r.job_id = j.id AND r.rater_id = ${userId}
      )
    ORDER BY j.created_at DESC
    LIMIT 20
  `;

  // 3. Stats for given ratings
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
    WHERE rater_id = ${userId}
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
    <ClientRatingsIndexContent
      reviews={reviews as any}
      pendingRatingJobs={pendingJobs as any}
      stats={stats as any}
    />
  );
}
