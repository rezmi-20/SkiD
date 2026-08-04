export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import ClientDashboardContent from "@/components/ClientDashboardContent";
import { getClientIdentityStatus } from "@/lib/client-verification";

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  
  const [profileRows, identityStatus] = await Promise.all([
    sql`
    SELECT full_name, avatar_url
    FROM client_profiles
    WHERE user_id = ${session.user.id}
  `,
    getClientIdentityStatus(session.user.id),
  ]);
  const jobRows = await sql`SELECT * FROM jobs WHERE client_id = ${session.user.id} ORDER BY created_at DESC LIMIT 5`;
  
  const activeContractRows = await sql`
    SELECT 
        c.id as contract_id,
        j.title as job_title,
        wp.full_name as worker_name,
        wp.avatar_url as worker_avatar,
        j.status as job_status,
        c.created_at as contract_created_at
    FROM contracts c
    JOIN jobs j ON c.job_id = j.id
    JOIN worker_profiles wp ON j.worker_id = wp.user_id
    WHERE j.client_id = ${session.user.id} AND j.status IN ('accepted', 'in_progress')
    ORDER BY c.created_at DESC
  `;
  
  const fullName = profileRows[0]?.full_name || "Client";
  const firstName = fullName.split(' ')[0];
  const avatarUrl = profileRows[0]?.avatar_url;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const userData = {
    fullName,
    firstName,
    avatarUrl,
    greeting,
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
