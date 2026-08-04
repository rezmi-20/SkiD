import { getAllUsers } from "@/lib/actions/super-admin";
import { SuperAdminUsersClient } from "@/components/admin/SuperAdminUsersClient";
import { requireAdminPermission } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Management | DireSkill Super Admin",
  description: "Manage all platform accounts — clients, workers, and admins.",
};

export default async function UsersPage() {
  await requireAdminPermission("admin_accounts.read");
  const users = await getAllUsers();

  return <SuperAdminUsersClient initialUsers={users} />;
}
