import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/config";
import { getAllUsers } from "@/lib/actions/super-admin";
import { SuperAdminUsersClient } from "@/components/admin/SuperAdminUsersClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "User Management | DireSkill Super Admin",
  description: "Manage all platform accounts — clients, workers, and admins.",
};

export default async function UsersPage() {
  const session = await auth();

  // Only the super admin email can access this page
  if (!session?.user || !isSuperAdmin((session.user as any).email)) {
    redirect("/admin/dashboard");
  }

  const users = await getAllUsers();

  return <SuperAdminUsersClient initialUsers={users} />;
}
