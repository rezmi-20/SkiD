export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import ClientDashboardContent from "@/components/ClientDashboardContent";
import { getClientIdentityStatus } from "@/lib/client-verification";

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  
  const [profileRows, identityStatus, totalSpentRes, activeContractRows, jobRows, completedCountRes] = await Promise.all([
    sql`
      SELECT full_name, avatar_url
      FROM client_profiles
      WHERE user_id = ${session.user.id}
    `,
    getClientIdentityStatus(session.user.id),
    sql`
      SELECT COALESCE(SUM(p.amount), 0)::numeric AS total_spent
      FROM payments p
      JOIN jobs j ON p.job_id = j.id
      WHERE j.client_id = ${session.user.id} AND p.status IN ('released', 'successful', 'completed', 'paid')
    `,
    sql`
      SELECT 
          c.id as contract_id,
          COALESCE(c.job_title, j.title) as job_title,
          COALESCE(c.payment_amount, j.budget, 0)::numeric as budget,
          wp.full_name as worker_name,
          wp.avatar_url as worker_avatar,
          wp.skills as worker_skills,
          wp.district as worker_district,
          j.status as job_status,
          c.status as contract_status,
          c.created_at as contract_created_at
      FROM contracts c
      JOIN jobs j ON c.job_id = j.id
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      WHERE j.client_id = ${session.user.id} AND j.status IN ('accepted', 'in_progress', 'signed')
      ORDER BY c.created_at DESC
    `,
    sql`
      SELECT id, title, budget, status, created_at
      FROM jobs
      WHERE client_id = ${session.user.id}
      ORDER BY created_at DESC
      LIMIT 6
    `,
    sql`
      SELECT COUNT(*)::int as completed_count
      FROM jobs
      WHERE client_id = ${session.user.id} AND status IN ('completed', 'paid')
    `,
  ]);
  
  const fullName = profileRows[0]?.full_name || "Client";
  const firstName = fullName.split(' ')[0];
  const avatarUrl = profileRows[0]?.avatar_url;
  const totalSpent = Number(totalSpentRes[0]?.total_spent || 0);
  const completedProjects = Number(completedCountRes[0]?.completed_count || 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const userData = {
    fullName,
    firstName,
    avatarUrl,
    greeting,
    totalSpent,
    completedProjects,
    identityVerified: identityStatus.status === "approved" && identityStatus.isVerified && identityStatus.hasFin,
    verificationStatus: identityStatus.status
  };

  return (
    <ClientDashboardContent 
      userData={userData}
      activeContracts={activeContractRows}
      recentJobs={jobRows}
    />
  );
}
