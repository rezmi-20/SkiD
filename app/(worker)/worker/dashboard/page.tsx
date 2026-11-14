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
    verificationStatus: worker?.identity_complete === false && worker?.verification_status === "approved" ? "incomplete" : worker?.verification_status ?? null,
    identityComplete: worker?.identity_complete ?? null,
  });

  if (workerRoute !== WORKER_DASHBOARD_ROUTE) {
    redirect(workerRoute);
  }

  let pendingJobs: any[] = [];
  let recentJobs: any[] = [];
  let totalEarned = 0;
  let activeContracts: any[] = [];
  let completedJobsCount = 0;

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
    ]);

    if (results[0].status === "fulfilled") pendingJobs = results[0].value as any[];
    if (results[1].status === "fulfilled") recentJobs = results[1].value as any[];
    if (results[2].status === "fulfilled") totalEarned = Number((results[2].value as any[])[0]?.total_earned || 0);
    if (results[3].status === "fulfilled") activeContracts = results[3].value as any[];
    if (results[4].status === "fulfilled") completedJobsCount = Number((results[4].value as any[])[0]?.completed_count || 0);
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
    district: worker?.district || "Dire Dawa",
    skills: worker?.skills || [],
    hourlyRate: worker?.hourly_rate || null,
    availability: worker?.availability || "available",
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
      recentJobs={recentJobs.slice(0, 8)}
      activeContracts={activeContracts}
      greeting={greeting}
    />
  );
}
