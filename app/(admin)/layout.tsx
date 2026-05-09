import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "grid_view" },
    { label: "Workers", href: "/admin/workers", icon: "engineering" },
    { label: "Contracts", href: "/admin/contracts", icon: "description" },
    { label: "Disputes", href: "/admin/disputes", icon: "gavel" },
    { label: "Reports", href: "/admin/reports", icon: "bar_chart" },
    { label: "Settings", href: "/admin/settings", icon: "settings" },
  ];

  return (
    <div className="flex min-h-screen bg-background font-body text-on-background selection:bg-primary/30">
      
      {/* ── Desktop Sidebar ── */}
      <aside className="w-72 border-r border-white/5 bg-surface-container-lowest hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-on-surface rounded-xl flex items-center justify-center shadow-lg">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-surface-container-lowest">
                <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
                <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
             </svg>
          </div>
          <span className="text-xl font-black tracking-tighter text-on-surface uppercase">
            Dire<span className="text-primary italic">Admin</span>
          </span>
        </div>

        <nav className="flex-grow px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
          <div className="px-4 mb-4">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-30">Management Hub</p>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-4 py-4 rounded-2xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all group"
            >
              <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-surface-container rounded-3xl p-5 border border-white/5 space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary text-[20px]">security</span>
                </div>
                <div className="min-w-0">
                   <p className="text-[10px] font-black text-on-surface truncate uppercase tracking-widest">{session.user.email?.split('@')[0]}</p>
                   <p className="text-[9px] font-black text-primary uppercase tracking-tighter">System Root</p>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Mobile Header (Hidden on LG) */}
        <header className="lg:hidden h-20 border-b border-white/5 px-6 flex items-center justify-between bg-surface-container-lowest/80 backdrop-blur-xl sticky top-0 z-50">
           <span className="text-lg font-black tracking-tighter text-on-surface uppercase">
            Dire<span className="text-primary italic">Admin</span>
           </span>
           <button className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined">menu</span>
           </button>
        </header>

        <main className="p-6 md:p-12 lg:p-16 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
