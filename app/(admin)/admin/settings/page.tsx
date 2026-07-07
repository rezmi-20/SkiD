import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import { PlatformSettingsClient } from "@/components/admin/PlatformSettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

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
