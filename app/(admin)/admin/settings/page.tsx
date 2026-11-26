import { Suspense } from "react";
import { sql } from "@/lib/db";
import { PlatformSettingsClient } from "@/components/admin/PlatformSettingsClient";
import { requireAdminRole } from "@/lib/admin-authorization";
import { getPlatformGovernanceSettings } from "@/lib/actions/platform-settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdminRole("super_admin");

  // Fetch db statistics for System Health board + persisted governance rules
  const [
    usersCount,
    workersCount,
    clientsCount,
    jobsCount,
    paymentsCount,
    categoriesCount,
    zonesCount,
    governanceSettings,
  ] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM users`,
    sql`SELECT COUNT(*)::int AS count FROM worker_profiles`,
    sql`SELECT COUNT(*)::int AS count FROM client_profiles`,
    sql`SELECT COUNT(*)::int AS count FROM jobs`,
    sql`SELECT COUNT(*)::int AS count FROM payments`,
    sql`SELECT COUNT(*)::int AS count FROM service_categories WHERE is_active = true`,
    sql`SELECT COUNT(*)::int AS count FROM zones WHERE is_active = true`,
    getPlatformGovernanceSettings(),
  ]);

  const stats = {
    totalUsers: usersCount[0]?.count ?? 0,
    totalWorkers: workersCount[0]?.count ?? 0,
    totalClients: clientsCount[0]?.count ?? 0,
    totalJobs: jobsCount[0]?.count ?? 0,
    totalPayments: paymentsCount[0]?.count ?? 0,
    activeCategories: categoriesCount[0]?.count ?? 0,
    activeZones: zonesCount[0]?.count ?? 0,
  };

  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading platform parameters...</div>}>
      <PlatformSettingsClient stats={stats} initialGovernance={governanceSettings} />
    </Suspense>
  );
}
