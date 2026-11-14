export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import ClientDashboardContent from "@/components/ClientDashboardContent";
import { getClientIdentityStatus } from "@/lib/client-verification";

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let profileRows: any[] = [];
  let identityStatus = { status: "unverified", isVerified: false, hasFin: false };
  let totalSpent = 0;
  let activeContractRows: any[] = [];
  let jobRows: any[] = [];
  let paymentRows: any[] = [];
  let completedProjects = 0;

  try {
    const results = await Promise.allSettled([
      // 1. Client profile
      sql`
        SELECT full_name, avatar_url
        FROM client_profiles
        WHERE user_id = ${session.user.id}
        LIMIT 1
      `,
      // 2. Identity status
      getClientIdentityStatus(session.user.id),
      // 3. Real total spent from released/paid payments
      sql`
        SELECT COALESCE(SUM(p.amount), 0)::numeric AS total_spent
        FROM payments p
        JOIN jobs j ON p.job_id = j.id
        WHERE j.client_id = ${session.user.id} AND p.status::text IN ('released', 'paid', 'completed')
      `,
      // 4. Real contracts (all contracts for this client)
      sql`
        SELECT 
          c.id as contract_id,
          COALESCE(c.job_title, j.title, 'Contract Agreement') as job_title,
          COALESCE(c.payment_amount, j.budget, 0)::numeric as budget,
          COALESCE(wp.full_name, 'Verified Artisan') as worker_name,
          wp.avatar_url as worker_avatar,
          wp.skills as worker_skills,
          wp.district as worker_district,
          j.status as job_status,
          c.status as contract_status,
          c.created_at as contract_created_at
        FROM contracts c
        JOIN jobs j ON c.job_id = j.id
        LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
        WHERE j.client_id = ${session.user.id}
        ORDER BY c.created_at DESC
      `,
      // 5. Recent jobs
      sql`
        SELECT id, title, budget, status, created_at, description
        FROM jobs
        WHERE client_id = ${session.user.id}
        ORDER BY created_at DESC
        LIMIT 10
      `,
      // 6. Completed count
      sql`
        SELECT COUNT(*)::int as completed_count
        FROM jobs
        WHERE client_id = ${session.user.id} AND status::text IN ('completed', 'paid', 'closed')
      `,
      // 7. Real payments with timestamps for date filtering
      sql`
        SELECT 
          p.id,
          p.amount::numeric as amount,
          p.status as payment_status,
          p.created_at as payment_created_at,
          j.title as job_title,
          j.id as job_id,
          wp.full_name as worker_name
        FROM payments p
        JOIN jobs j ON p.job_id = j.id
        LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
        WHERE j.client_id = ${session.user.id} AND p.status::text IN ('released', 'paid', 'completed')
        ORDER BY p.created_at DESC
      `,
    ]);

    if (results[0].status === "fulfilled") profileRows = results[0].value as any[];
    if (results[1].status === "fulfilled") identityStatus = results[1].value as any;
    if (results[2].status === "fulfilled") totalSpent = Number((results[2].value as any[])[0]?.total_spent || 0);
    if (results[3].status === "fulfilled") activeContractRows = results[3].value as any[];
    if (results[4].status === "fulfilled") jobRows = results[4].value as any[];
    if (results[5].status === "fulfilled") completedProjects = Number((results[5].value as any[])[0]?.completed_count || 0);
    if (results[6].status === "fulfilled") paymentRows = results[6].value as any[];
  } catch (error) {
    console.error("[CLIENT-DASHBOARD] Data load error:", error);
  }

  const fullName = profileRows[0]?.full_name || session.user.name || "Client";
  const firstName = fullName.split(' ')[0];
  const avatarUrl = profileRows[0]?.avatar_url || session.user.image;

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
    verificationStatus: identityStatus.status,
  };

  return (
    <ClientDashboardContent 
      userData={userData}
      activeContracts={activeContractRows}
      recentJobs={jobRows}
      payments={paymentRows}
    />
  );
}
