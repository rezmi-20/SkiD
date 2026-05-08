import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import AdminDashboardContent from "@/components/AdminDashboardContent";

export default async function AdminDashboardPage() {
  const session = await auth();
  
  // Aggregate basic stats
  const userCount = await sql`SELECT COUNT(*) FROM users`;
  const workerCount = await sql`SELECT COUNT(*) FROM worker_profiles`;
  const pendingGigs = await sql`SELECT COUNT(*) FROM jobs WHERE status = 'pending'`;
  const unverifiedWorkers = await sql`SELECT wp.*, u.email 
                                      FROM worker_profiles wp 
                                      JOIN users u ON wp.user_id = u.id 
                                      WHERE wp.is_verified = false 
                                      LIMIT 10`;

  const stats = {
    totalUsers: Number(userCount[0].count),
    totalWorkers: Number(workerCount[0].count),
    pendingGigs: Number(pendingGigs[0].count),
    platformVolume: 0
  };

  return (
    <AdminDashboardContent 
      stats={stats}
      unverifiedWorkers={unverifiedWorkers}
    />
  );
}
