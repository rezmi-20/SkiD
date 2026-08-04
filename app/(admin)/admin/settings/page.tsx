import { sql } from "@/lib/db";
import { PlatformSettingsClient } from "@/components/admin/PlatformSettingsClient";
import { requireAnyAdminPermission } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAnyAdminPermission(["audit.read", "appeals.read", "support.read"]);

  // Fetch db statistics for System Health board
  const [
    usersCount,
    workersCount,
    clientsCount,
    jobsCount,
    paymentsCount,
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM users`,
    sql`SELECT COUNT(*)::int AS count FROM worker_profiles`,
    sql`SELECT COUNT(*)::int AS count FROM client_profiles`,
    sql`SELECT COUNT(*)::int AS count FROM jobs`,
    sql`SELECT COUNT(*)::int AS count FROM payments`,
  ]);

  const stats = {
    totalUsers: usersCount[0]?.count ?? 0,
    totalWorkers: workersCount[0]?.count ?? 0,
    totalClients: clientsCount[0]?.count ?? 0,
    totalJobs: jobsCount[0]?.count ?? 0,
    totalPayments: paymentsCount[0]?.count ?? 0,
  };

  return <PlatformSettingsClient stats={stats} />;
}
