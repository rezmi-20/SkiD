import { redirect } from "next/navigation";
import { AdminEmployeeLoginForm } from "@/components/admin/AdminEmployeeLoginForm";
import { getActivationRequiredAdminPrincipal, getAdminPrincipal } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const activeAdmin = await getAdminPrincipal();
  if (activeAdmin) {
    const roleLanding =
      activeAdmin.role === "content_verification_admin"
        ? "/admin/verify"
        : activeAdmin.role === "dispute_payment_admin"
          ? "/admin/disputes"
          : activeAdmin.role === "user_support_admin"
            ? "/admin/support"
            : "/admin/dashboard";
    redirect(roleLanding);
  }

  const activationAdmin = await getActivationRequiredAdminPrincipal();
  if (activationAdmin) redirect("/admin/activate");

  return <AdminEmployeeLoginForm />;
}
