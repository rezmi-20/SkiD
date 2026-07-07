import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/config";
import { Sidebar } from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const email = (session.user as any).email ?? null;
  const adminName = String(session.user.name || email?.split("@")[0] || "Admin");
  const superAdmin = isSuperAdmin(email);

  return (
    <div className="flex h-screen overflow-hidden bg-background font-body text-on-background antialiased transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar userEmail={email} isSuperAdmin={superAdmin} />

      {/* Main Container */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <TopBar adminName={adminName} />

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
