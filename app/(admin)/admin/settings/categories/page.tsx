import { requireAdminRole } from "@/lib/admin-authorization";
import { getServiceCategoriesAdmin } from "@/lib/actions/master-data";
import { CategoriesManagerClient } from "@/components/admin/settings/CategoriesManagerClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Service Categories | DireSkill Admin",
  description: "Manage DireSkill skilled trade categories.",
};

export default async function AdminCategoriesSettingsPage() {
  await requireAdminRole("super_admin");
  const categories = await getServiceCategoriesAdmin();
  return <CategoriesManagerClient initialCategories={categories} />;
}
