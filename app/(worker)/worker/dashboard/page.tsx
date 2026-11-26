export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getPendingJobs, getWorkerJobs } from "@/lib/actions/jobs";
import { redirect } from "next/navigation";
import WorkerDashboardContent from "@/components/WorkerDashboardContent";
import { getWorkerAccessRoute, WORKER_DASHBOARD_ROUTE } from "@/lib/worker-routing";

export default async function WorkerDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "worker") {
    redirect("/login");
  }

  const profileRows = await sql`
    SELECT
      u.is_suspended,
      wp.full_name,
      wp.avatar_url,
      wp.is_verified,
      wp.verification_status,
      (
        wp.fayda_doc_url IS NOT NULL
        AND length(wp.fayda_doc_url) > 0
        AND wp.fin_last4 IS NOT NULL
        AND length(wp.fin_last4) = 4
        AND wp.fin_encrypted IS NOT NULL
        AND length(wp.fin_encrypted) > 0
      ) AS identity_complete,
      wp.district,
      wp.skills,
      wp.hourly_rate,
      wp.availability
    FROM users u
    LEFT JOIN worker_profiles wp ON wp.user_id = u.id
    WHERE u.id = ${session.user.id}
    LIMIT 1
  `;

  const worker = profileRows[0];
  const workerRoute = getWorkerAccessRoute({
    role: session.user.role,
    isSuspended: worker?.is_suspended ?? false,
    isVerified: Boolean(worker?.is_verified && worker?.identity_complete),
    verificationStatus:
      worker?.identity_complete === false && worker?.verification_status === "approved"
        ? "incomplete"
        : worker?.verification_status ?? null,
    identityComplete: worker?.identity_complete ?? null,
  });

  if (workerRoute !== WORKER_DASHBOARD_ROUTE) {
    redirect(workerRoute);
  }

  let pendingJobs: any[] = [];
  let recentJobs: any[] = [];
  let totalEarned = 0;
  let monthlyEarned = 0;
  let activeContracts: any[] = [];
  let completedJobsCount = 0;
  let unreadNotificationsCount = 0;
  let avgRating = 0;
  let reviewCount = 0;
  let latestReviews: any[] = [];

  try {
    const results = await Promise.allSettled([
      getPendingJobs(),
      getWorkerJobs(),
      sql`
        SELECT COALESCE(SUM(p.net_amount), 0)::numeric AS total_earned
        FROM payments p
        JOIN jobs j ON p.job_id = j.id
        WHERE j.worker_id = ${session.user.id} AND p.status::text IN ('released', 'paid', 'completed')
      `,
      sql`
        SELECT 
          c.id as contract_id,
          j.title as job_title,
          COALESCE(j.budget, 0)::numeric as budget,
          COALESCE(j.location, 'Dire Dawa') as location,
          j.created_at as job_created_at,
          cp.full_name as client_name,
          cp.avatar_url as client_avatar,
          j.status as job_status,
          c.status as contract_status,
          c.created_at as contract_created_at
        FROM contracts c
        JOIN jobs j ON c.job_id = j.id
        LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
        WHERE j.worker_id = ${session.user.id} AND j.status::text IN ('accepted', 'in_progress', 'active')
        ORDER BY c.created_at DESC
      `,
      sql`
        SELECT COUNT(*)::int as completed_count
        FROM jobs
        WHERE worker_id = ${session.user.id} AND status::text IN ('completed', 'paid')
      `,
      sql`
        SELECT COUNT(*)::int as unread_count
        FROM notifications
        WHERE user_id = ${session.user.id} AND is_read = false
      `,
      sql`
        SELECT COALESCE(SUM(p.net_amount), 0)::numeric AS monthly_earned
        FROM payments p
        JOIN jobs j ON p.job_id = j.id
        WHERE j.worker_id = ${session.user.id}
          AND p.created_at >= date_trunc('month', CURRENT_DATE)
          AND p.status::text IN ('released', 'paid', 'completed')
      `,
      sql`
        SELECT 
          COALESCE(ROUND(AVG(score)::numeric, 1), 0) AS avg_score,
          COUNT(*)::int AS count
        FROM ratings
        WHERE rated_id = ${session.user.id}
          AND COALESCE(is_hidden, false) = false
      `,
      sql`
        SELECT 
          r.id,
          r.score,
          r.comment,
          r.created_at,
          COALESCE(cp.full_name, 'Dire Dawa Client') as client_name,
          cp.avatar_url as client_avatar
        FROM ratings r
        LEFT JOIN client_profiles cp ON r.rater_id = cp.user_id
        WHERE r.rated_id = ${session.user.id}
          AND COALESCE(r.is_hidden, false) = false
        ORDER BY r.created_at DESC
        LIMIT 4
      `,
    ]);

    if (results[0].status === "fulfilled") pendingJobs = results[0].value as any[];
    if (results[1].status === "fulfilled") recentJobs = results[1].value as any[];
    if (results[2].status === "fulfilled") totalEarned = Number((results[2].value as any[])[0]?.total_earned || 0);
    if (results[3].status === "fulfilled") activeContracts = results[3].value as any[];
    if (results[4].status === "fulfilled") completedJobsCount = Number((results[4].value as any[])[0]?.completed_count || 0);
    if (results[5].status === "fulfilled") unreadNotificationsCount = Number((results[5].value as any[])[0]?.unread_count || 0);
    if (results[6].status === "fulfilled") monthlyEarned = Number((results[6].value as any[])[0]?.monthly_earned || 0);
    if (results[7].status === "fulfilled") {
      const ratingRow = (results[7].value as any[])[0];
      if (ratingRow) {
        reviewCount = Number(ratingRow.count || 0);
        avgRating = reviewCount > 0 ? Number(ratingRow.avg_score || 0) : 0;
      }
    }
    if (results[8].status === "fulfilled") latestReviews = results[8].value as any[];
  } catch (err) {
    console.error("[WORKER-DASHBOARD] Data load error:", err);
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const workerData = {
    fullName: worker?.full_name || session.user.name || "Professional",
    firstName: (worker?.full_name || session.user.name || "Professional").split(" ")[0],
    avatarUrl: worker?.avatar_url || session.user.image || null,
    isVerified: Boolean(worker?.is_verified && worker?.identity_complete),
    verificationStatus: worker?.verification_status || "pending",
    district: worker?.district || "Dire Dawa",
    skills: worker?.skills || [],
    hourlyRate: worker?.hourly_rate || null,
    availability: worker?.availability || "available",
    unreadNotificationsCount,
    monthlyEarned,
    avgRating,
    reviewCount,
    latestReviews,
  };

  const activeJobs = recentJobs.filter((job: any) => ["accepted", "active", "in_progress"].includes(job.status));

  const stats = {
    activeJobs: activeJobs.length,
    pendingJobs: pendingJobs.length,
    completedJobs: completedJobsCount,
    revenue: totalEarned,
  };

  return (
    <WorkerDashboardContent
      worker={workerData}
      stats={stats}
      pendingJobs={pendingJobs}
      recentJobs={recentJobs.slice(0, 10)}
      activeContracts={activeContracts}
      greeting={greeting}
    />
  );
}
