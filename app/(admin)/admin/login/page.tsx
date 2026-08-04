import { redirect } from "next/navigation";
import { AdminEmployeeLoginForm } from "@/components/admin/AdminEmployeeLoginForm";
import { getActivationRequiredAdminPrincipal, getAdminPrincipal } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const activeAdmin = await getAdminPrincipal();
  if (activeAdmin) redirect("/admin/dashboard");

  const activationAdmin = await getActivationRequiredAdminPrincipal();
  if (activationAdmin) redirect("/admin/activate");

  return <AdminEmployeeLoginForm />;
}
