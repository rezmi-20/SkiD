"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import MobileNav from "./MobileNav";

interface AppShellProps {
  children: React.ReactNode;
  role: "client" | "worker";
  userEmail?: string | null;
}

const CLIENT_NAV = [
  { label: "Discover", href: "/client/search" },
  { label: "My Jobs", href: "/client/dashboard" },
  { label: "Chat", href: "/client/messages" },
  { label: "Profile", href: "/client/profile" },
];

const WORKER_NAV = [
  { label: "Dashboard", href: "/worker/dashboard" },
  { label: "My Gigs", href: "/worker/gigs" },
  { label: "Earnings", href: "/worker/earnings" },
  { label: "Profile", href: "/worker/profile" },
];

export default function AppShell({ children, role, userEmail }: AppShellProps) {
  const pathname = usePathname();
  const navItems = role === "client" ? CLIENT_NAV : WORKER_NAV;

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/30">
      {/* Desktop Navigation (Hidden on Mobile) */}
      <nav className="hidden md:block border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3 group">
               <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-black group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined text-sm">bolt</span>
               </div>
               <div className="font-headline font-black text-on-surface tracking-tighter uppercase">
                 Dire <span className="text-primary italic">{role}</span>
               </div>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Authenticated As</span>
                <span className="text-xs font-bold text-on-surface">{userEmail}</span>
            </div>
            <div className="h-8 w-px bg-white/5" />
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-2 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Top Header (Minimal & App-like) */}
      <div className="md:hidden flex items-center justify-between px-6 pt-8 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center font-black text-black">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
            </div>
            <span className="text-xs font-black tracking-widest uppercase">DireSkill</span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-on-surface-variant active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-10 pb-32 md:pb-10 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Navigation */}
      <MobileNav role={role} />
    </div>
  );
}
