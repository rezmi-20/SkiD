import { redirect } from "next/navigation";
import { AdminProfileForm } from "@/components/admin/AdminProfileForm";
import { getAdminProfile } from "@/lib/actions/admin-account";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const profile = await getAdminProfile();
  if (!profile) redirect("/admin/login?error=admin_inactive");
  return <AdminProfileForm profile={profile as any} />;
}
