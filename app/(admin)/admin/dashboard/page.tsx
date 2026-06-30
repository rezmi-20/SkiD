import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';
import AdminDashboardContent from "@/components/AdminDashboardContent";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await auth();
  
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  // 1. Fetch Overview Statistics
  const [
    workerCount,
    pendingVerifCount,
    activeContractCount,
    completedJobsMonthly,
    disputeCount
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int FROM worker_profiles`,
    sql`SELECT COUNT(*)::int FROM worker_profiles WHERE is_verified = false`,
    sql`SELECT COUNT(*)::int FROM jobs WHERE status = 'active'`,
    sql`SELECT COUNT(*)::int FROM jobs WHERE status = 'completed' AND updated_at >= date_trunc('month', CURRENT_DATE)`,
    sql`SELECT COUNT(*)::int FROM jobs WHERE status = 'disputed'`
  ]);

  // 2. Fetch Pending Worker Verifications (Detailed)
  const unverifiedWorkers = await sql`
    SELECT 
      wp.user_id, 
      wp.full_name, 
      wp.skills, 
      wp.fayda_doc_url, 
      wp.avatar_url,
      u.phone,
      u.email
    FROM worker_profiles wp 
    JOIN users u ON wp.user_id = u.id 
    WHERE wp.is_verified = false 
    ORDER BY wp.created_at DESC 
    LIMIT 10
  `;

  // 3. Fetch Recent Activity Feed
  // We'll combine recent user signups and job postings
  const recentUsers = await sql`
    SELECT 'user_signup' as type, email as title, created_at 
    FROM users 
    ORDER BY created_at DESC 
    LIMIT 5
  `;
  
  const recentJobs = await sql`
    SELECT 'job_posted' as type, title, created_at 
    FROM jobs 
    ORDER BY created_at DESC 
    LIMIT 5
  `;

  const activityFeed = [...recentUsers, ...recentJobs].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 10);

  const stats = {
    totalWorkers: workerCount[0].count,
    pendingVerifications: pendingVerifCount[0].count,
    activeContracts: activeContractCount[0].count,
    completedJobsThisMonth: completedJobsMonthly[0].count,
    totalDisputes: disputeCount[0].count,
  };
  const adminName = (session.user as any).name || session.user.email?.split('@')[0] || "Admin";

  return (
    <AdminDashboardContent 
      adminName={adminName}
      stats={stats}
      unverifiedWorkers={unverifiedWorkers}
      activityFeed={activityFeed}
    />
  );
}
