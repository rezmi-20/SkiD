"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { TranslationKey } from "@/lib/translations";

interface NavItem {
  key: TranslationKey;
  href: string;
  icon: (isActive: boolean) => React.ReactNode;
}

const Icons = {
  Discover: (isActive: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  ),
  MyJobs: (isActive: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  Chat: (isActive: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  Profile: (isActive: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Dashboard: (isActive: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  ),
  Gigs: (isActive: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
  ),
  Earnings: (isActive: boolean) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  ),
};

const CLIENT_NAV: NavItem[] = [
  { key: "nav.discover", href: "/client/search", icon: Icons.Discover },
  { key: "nav.myjobs", href: "/client/dashboard", icon: Icons.MyJobs },
  { key: "nav.chat", href: "/client/messages", icon: Icons.Chat },
  { key: "nav.profile", href: "/client/profile", icon: Icons.Profile },
];

const WORKER_NAV: NavItem[] = [
  { key: "nav.dashboard", href: "/worker/dashboard", icon: Icons.Dashboard },
  { key: "nav.mygigs", href: "/worker/gigs", icon: Icons.Gigs },
  { key: "nav.earnings", href: "/worker/earnings", icon: Icons.Earnings },
  { key: "nav.profile", href: "/worker/profile", icon: Icons.Profile },
];

export default function MobileNav({ role }: { role: "client" | "worker" }) {
  const pathname = usePathname();
  const navItems = role === "client" ? CLIENT_NAV : WORKER_NAV;
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-6 left-6 right-6 z-[100] md:hidden">
      <div className="bg-surface/90 backdrop-blur-2xl border border-border/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (isActive ? (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 bg-green-400 px-6 py-3.5 rounded-[2rem] transition-all duration-500 shadow-[0_10px_20px_rgba(74,222,128,0.2)]"
              >
                <div className="text-black">
                   {item.icon(true)}
                </div>
                <span className="text-black text-xs font-black uppercase tracking-widest">
                  {t(item.key).split(' ')[0]}
                </span>
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="p-4 text-text-med hover:text-white transition-all duration-300"
              >
                {item.icon(false)}
              </Link>
            ));
          })}
        </div>
      </div>
    </nav>
  );
}
