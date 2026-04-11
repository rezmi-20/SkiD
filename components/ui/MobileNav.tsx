"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface NavItem {
  label: string;
  icon: string;
  href: string;
}

const CLIENT_NAV: NavItem[] = [
  { label: "Discover", icon: "search", href: "/client/search" },
  { label: "My Jobs", icon: "work_outline", href: "/client/dashboard" },
  { label: "Chat", icon: "chat_bubble", href: "/client/messages" },
  { label: "Profile", icon: "person", href: "/client/profile" },
];

const WORKER_NAV: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", href: "/worker/dashboard" },
  { label: "My Gigs", icon: "handyman", href: "/worker/gigs" },
  { label: "Earnings", icon: "payments", href: "/worker/earnings" },
  { label: "Profile", icon: "person", href: "/worker/profile" },
];

export default function MobileNav({ role }: { role: "client" | "worker" }) {
  const pathname = usePathname();
  const navItems = role === "client" ? CLIENT_NAV : WORKER_NAV;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Frosted Glass Background */}
      <div className="absolute inset-0 bg-surface-container-high/80 backdrop-blur-2xl border-t border-white/5" />
      
      {/* Navigation Tabs */}
      <div className="relative max-w-md mx-auto px-6 h-20 flex items-center justify-between pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-1 min-w-[64px] transition-colors"
            >
              <div className={`relative p-2 rounded-xl transition-all ${isActive ? 'text-primary scale-110' : 'text-on-surface-variant hover:text-on-surface'}`}>
                <span 
                  className="material-symbols-outlined text-[24px]" 
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-primary opacity-100' : 'text-on-surface-variant/40 opacity-0'} transition-all`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
