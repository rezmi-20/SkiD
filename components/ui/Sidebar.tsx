"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { TranslationKey } from "@/lib/translations";
import { signOut } from "next-auth/react";

interface NavItem {
  key: TranslationKey;
  href: string;
  icon: string;
}

const CLIENT_NAV: NavItem[] = [
  { key: "nav.home", href: "/client/dashboard", icon: "grid_view" },
  { key: "nav.feed", href: "/community/feed", icon: "forum" },
  { key: "nav.discover", href: "/client/search", icon: "search" },
  { key: "nav.contracts", href: "/client/contracts", icon: "description" },
  { key: "nav.chat", href: "/client/messages", icon: "chat_bubble" },
  { key: "nav.profile", href: "/client/profile", icon: "person" },
];

const WORKER_NAV: NavItem[] = [
  { key: "nav.home", href: "/worker/dashboard", icon: "grid_view" },
  { key: "nav.feed", href: "/community/feed", icon: "forum" },
  { key: "nav.mygigs", href: "/worker/gigs", icon: "construction" },
  { key: "nav.contracts", href: "/worker/contracts", icon: "description" },
  { key: "nav.chat", href: "/worker/messages", icon: "chat_bubble" },
  { key: "nav.profile", href: "/worker/profile", icon: "person" },
];

export default function Sidebar({ role, userEmail }: { role: "client" | "worker", userEmail?: string | null }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();
  const navItems = role === "client" ? CLIENT_NAV : WORKER_NAV;

  return (
    <aside 
      className={`
        hidden lg:flex flex-col sticky top-0 h-screen transition-all duration-500 ease-in-out border-r border-surface-container-highest bg-surface-container-lowest
        ${isCollapsed ? "w-20" : "w-72"}
      `}
    >
      {/* ── Logo Area ── */}
      <div className="h-20 flex items-center px-6 gap-4">
        <div className="w-10 h-10 bg-on-surface rounded-xl flex items-center justify-center shrink-0 shadow-lg">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-surface-container-lowest">
              <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
              <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
           </svg>
        </div>
        {!isCollapsed && (
          <span className="text-xl font-headline font-bold tracking-tighter text-on-surface uppercase animate-in fade-in slide-in-from-left-2 duration-500">
            Dire<span className="text-primary italic">Skill</span>
          </span>
        )}
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-grow px-3 py-6 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all relative
                ${isActive 
                  ? "bg-primary text-on-primary shadow-md shadow-primary/20" 
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"}
              `}
            >
              <span className={`material-symbols-outlined text-[24px] ${isActive ? "filled" : ""}`}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="text-sm font-bold tracking-tight animate-in fade-in slide-in-from-left-2 duration-300 uppercase tracking-widest">
                  {t(item.key)}
                </span>
              )}
              
              {isCollapsed && isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer / Profile ── */}
      <div className="p-4 space-y-4">
        {/* Collapse Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container transition-all text-on-surface-variant"
        >
          <span className="material-symbols-outlined">
            {isCollapsed ? "side_navigation" : "menu_open"}
          </span>
          {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest">Collapse</span>}
        </button>

        {/* Profile Card */}
        <div className={`
          bg-surface-container rounded-2xl p-4 transition-all
          ${isCollapsed ? "px-2" : "px-4"}
        `}>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-on-surface-variant/10 flex items-center justify-center shrink-0">
               <span className="material-symbols-outlined text-on-surface-variant">person</span>
             </div>
             {!isCollapsed && (
               <div className="flex-grow min-w-0 animate-in fade-in slide-in-from-left-2">
                 <p className="text-xs font-bold text-on-surface truncate">{userEmail?.split('@')[0]}</p>
                 <p className="text-[10px] font-bold text-on-surface-variant uppercase opacity-60">{role}</p>
               </div>
             )}
          </div>
          
          {!isCollapsed && (
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-error/10 text-error hover:bg-error hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
