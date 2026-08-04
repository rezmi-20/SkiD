import { getActivationRequiredAdminPrincipal, getAdminPrincipal } from "@/lib/admin-authorization";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminPrincipal();
  if (!admin) {
    const activationAdmin = await getActivationRequiredAdminPrincipal();
    if (activationAdmin) {
      return (
        <div className="min-h-screen bg-background font-body text-on-background antialiased">
          {children}
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-background font-body text-on-background antialiased">
        {children}
      </div>
    );
  }

  const email = admin.email ?? null;
  const adminName = String(admin.fullName || admin.employeeId || "Admin");

  return (
    <div className="flex h-screen overflow-hidden bg-background font-body text-on-background antialiased transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar userEmail={email} adminRole={admin.role} permissions={admin.permissions} />

      {/* Main Container */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <TopBar adminName={adminName} adminRole={admin.role} />

        {/* Dynamic Inner Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
