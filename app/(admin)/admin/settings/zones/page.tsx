import { requireAdminRole } from "@/lib/admin-authorization";
import { getZonesAdmin } from "@/lib/actions/master-data";
import { ZonesManagerClient } from "@/components/admin/settings/ZonesManagerClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dire Dawa Zones | DireSkill Admin",
  description: "Manage Dire Dawa neighborhood zones for geolocation and worker discovery.",
};

export default async function AdminZonesSettingsPage() {
  await requireAdminRole("super_admin");
  const zones = await getZonesAdmin();
  return <ZonesManagerClient initialZones={zones} />;
}
