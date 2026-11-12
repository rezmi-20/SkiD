import { getActivationRequiredAdminPrincipal, getAdminPrincipal } from "@/lib/admin-authorization";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { AdminUnauthorizedNoticeModal } from "@/components/admin/modals/AdminUnauthorizedNoticeModal";

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
        <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#090D16] font-['Inter',system-ui,sans-serif] text-slate-800 dark:text-slate-100 antialiased">
          {children}
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#090D16] font-['Inter',system-ui,sans-serif] text-slate-800 dark:text-slate-100 antialiased">
        {children}
      </div>
    );
  }

  const email = admin.email ?? null;
  const adminName = String(admin.fullName || admin.employeeId || "Admin");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground antialiased selection:bg-blue-500 selection:text-white font-['Inter',system-ui,sans-serif]">
      {/* ── Flush Left Navigation Sidebar (180px, Collapsible to 64px) ── */}
      <Sidebar
        userEmail={email}
        adminName={adminName}
        adminRole={admin.role}
        permissions={admin.permissions}
      />

      {/* ── Main Full-Window Workspace (100% Edge-to-Edge) ── */}
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        {/* Integrated Top Navigation */}
        <TopBar adminName={adminName} adminRole={admin.role} />

        {/* Dynamic Scrollable Workspace */}
        <main className="flex-1 w-full overflow-y-auto no-scrollbar p-4 sm:p-6 bg-background">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Friendly Unauthorized Action Modal */}
      <AdminUnauthorizedNoticeModal />
    </div>
  );
}
