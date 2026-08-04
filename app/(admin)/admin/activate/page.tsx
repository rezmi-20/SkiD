import { redirect } from "next/navigation";
import { AdminActivationForm } from "@/components/admin/AdminActivationForm";
import { getActivationRequiredAdminPrincipal, getAdminPrincipal } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export default async function AdminActivatePage() {
  const activeAdmin = await getAdminPrincipal();
  if (activeAdmin) redirect("/admin/dashboard");

  const admin = await getActivationRequiredAdminPrincipal();
  if (!admin) redirect("/login?error=admin_inactive");

  return (
    <AdminActivationForm
      employeeId={admin.employeeId || "Unknown"}
      fullName={admin.fullName || admin.email?.split("@")[0] || "Administrator"}
      email={admin.email || "Unknown email"}
      role={admin.role}
      department={admin.department || "Operations"}
    />
  );
}
