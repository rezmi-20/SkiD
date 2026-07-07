import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  // ── Live Metrics ────────────────────────────────────────────────────
  const [
    workerCount,
    pendingVerifCount,
    activeContractCount,
    completedJobsMonthly,
    disputeCount,
    revenueResult,
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM worker_profiles`,
    sql`SELECT COUNT(*)::int AS count FROM worker_profiles WHERE is_verified = false`,
    sql`SELECT COUNT(*)::int AS count FROM jobs WHERE status = 'active'`,
    sql`SELECT COUNT(*)::int AS count FROM jobs WHERE status = 'completed' AND updated_at >= date_trunc('month', CURRENT_DATE)`,
    sql`SELECT COUNT(*)::int AS count FROM jobs WHERE status = 'disputed'`,
    sql`SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total FROM payments WHERE status = 'released'`,
  ]);

  const totalRevenue = Number(revenueResult[0]?.total ?? 0);
  const revenueDisplay =
    totalRevenue >= 1000
      ? `ETB ${(totalRevenue / 1000).toFixed(1)}K`
      : `ETB ${totalRevenue.toFixed(0)}`;

  // ── Pending Workers ─────────────────────────────────────────────────
  const unverifiedWorkers = await sql`
    SELECT
      wp.user_id,
      wp.full_name,
      wp.skills,
      wp.fayda_doc_url,
      wp.avatar_url,
      wp.created_at,
      u.phone,
      u.email
    FROM worker_profiles wp
    JOIN users u ON wp.user_id = u.id
    WHERE wp.is_verified = false
    ORDER BY wp.created_at DESC
    LIMIT 10
  `;

  // ── Activity Feed ───────────────────────────────────────────────────
  const recentUsers = await sql`
    SELECT 'user_signup' AS type, email AS title, created_at
    FROM users
    ORDER BY created_at DESC
    LIMIT 5
  `;

  const recentJobs = await sql`
    SELECT 'job_posted' AS type, title, created_at
    FROM jobs
    ORDER BY created_at DESC
    LIMIT 5
  `;

  const activityFeed = [...recentUsers, ...recentJobs]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((item) => ({
      type: item.type as string,
      title: item.title as string,
      created_at: String(item.created_at),
    }));

  return (
    <AdminDashboardClient
      workerCount={workerCount[0]?.count ?? 0}
      pendingVerifCount={pendingVerifCount[0]?.count ?? 0}
      activeContractCount={activeContractCount[0]?.count ?? 0}
      completedJobsMonthly={completedJobsMonthly[0]?.count ?? 0}
      revenueDisplay={revenueDisplay}
      disputeCount={disputeCount[0]?.count ?? 0}
      activityFeed={activityFeed}
      unverifiedWorkers={unverifiedWorkers as any[]}
    />
  );
}
