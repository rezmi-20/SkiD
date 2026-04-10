import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background font-body">
      <aside className="w-64 border-r border-white/5 bg-surface-container-low hidden md:block">
        <div className="p-6 font-headline font-black text-primary italic text-xl border-b border-white/5">
          DIRE ADMIN
        </div>
        <nav className="p-4 space-y-2">
          <div className="text-xs font-bold text-outline-variant uppercase tracking-widest px-2 mb-4">Management</div>
          <a href="/admin/dashboard" className="block px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">Dashboard</a>
          <a href="/admin/workers" className="block px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">Verify Workers</a>
          <a href="/admin/disputes" className="block px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">Disputes</a>
        </nav>
      </aside>
      <div className="flex-grow flex flex-col">
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-black/50 backdrop-blur-md">
          <div className="text-on-surface-variant font-medium">Platform Overview</div>
          <div className="text-sm font-bold text-primary">{session.user.email} (Admin)</div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
