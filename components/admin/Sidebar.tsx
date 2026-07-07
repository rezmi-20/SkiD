"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  LayoutDashboard, Users, ShieldCheck, Briefcase,
  FileText, DollarSign, Scale, Megaphone,
  BarChart2, Settings, ChevronLeft, ChevronRight, LogOut, Crown,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";

interface SidebarProps {
  userEmail: string | null;
  isSuperAdmin?: boolean;
}

export function Sidebar({ userEmail, isSuperAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      localStorage.setItem("admin-sidebar-collapsed", String(!c));
      return !c;
    });
  };

  const handleLogout = async () => {
    try { await authClient.signOut(); } catch (_) {}
    await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
    window.location.href = "/login?logout=1";
  };

  const navItems = [
    { href: "/admin/dashboard",  icon: <LayoutDashboard className="w-5 h-5" />, labelKey: "admin.dashboard", superOnly: false },
    { href: "/admin/workers",    icon: <Users className="w-5 h-5" />,            labelKey: "admin.workers",   superOnly: false },
    { href: "/admin/verify",     icon: <ShieldCheck className="w-5 h-5" />,      labelKey: "admin.verify",    superOnly: false },
    { href: "/admin/jobs",       icon: <Briefcase className="w-5 h-5" />,        labelKey: "admin.jobs",      superOnly: false },
    { href: "/admin/contracts",  icon: <FileText className="w-5 h-5" />,         labelKey: "admin.contracts", superOnly: false },
    { href: "/admin/payments",   icon: <DollarSign className="w-5 h-5" />,       labelKey: "admin.payments",  superOnly: false },
    { href: "/admin/disputes",   icon: <Scale className="w-5 h-5" />,            labelKey: "admin.disputes",  superOnly: false },
    { href: "/admin/community",  icon: <Megaphone className="w-5 h-5" />,        labelKey: "admin.community", superOnly: false },
    { href: "/admin/reports",    icon: <BarChart2 className="w-5 h-5" />,        labelKey: "admin.reports",   superOnly: false },
    { href: "/admin/settings",   icon: <Settings className="w-5 h-5" />,         labelKey: "admin.settings",  superOnly: false },
    // ─ Super Admin only ─
    { href: "/admin/users",      icon: <Crown className="w-5 h-5" />,            labelKey: "admin.users",     superOnly: true  },
  ] as const;

  const visibleItems = navItems.filter((item) => !item.superOnly || isSuperAdmin);

  return (
    <aside
      className={`relative hidden lg:flex flex-col shrink-0 border-r transition-all duration-300 ease-in-out
        bg-surface-container-low border-outline-variant
        ${collapsed ? "w-[68px]" : "w-[220px]"}`}
    >
      {/* Brand */}
      <div className={`flex items-center gap-2 px-4 h-[60px] border-b border-outline-variant ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span className="text-on-primary font-black text-sm">D</span>
        </div>
        {!collapsed && (
          <span className="font-black text-sm uppercase tracking-widest text-on-surface truncate">
            DireAdmin
          </span>
        )}
      </div>

      {/* Super Admin Banner (only when not collapsed) */}
      {isSuperAdmin && !collapsed && (
        <div className="mx-2 mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-400/20 to-orange-400/10 border border-amber-300/40 rounded-lg">
          <Crown className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider truncate">
            Super Admin
          </span>
        </div>
      )}
      {isSuperAdmin && collapsed && (
        <div className="mt-2 flex justify-center">
          <Crown className="w-4 h-4 text-amber-500" />
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 px-2">
        {/* Separator before super admin section */}
        {visibleItems.map(({ href, icon, labelKey, superOnly }) => {
          const isActive = pathname?.startsWith(href);
          return (
            <div key={href}>
              {superOnly && !collapsed && (
                <div className="px-3 pt-3 pb-1">
                  <div className="h-px bg-outline-variant" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-amber-500 mt-2 flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5" />
                    Super Admin
                  </p>
                </div>
              )}
              {superOnly && collapsed && (
                <div className="py-1.5 flex justify-center">
                  <div className="w-8 h-px bg-outline-variant" />
                </div>
              )}
              <Link
                href={href}
                title={t(labelKey as any)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 group
                  ${isActive
                    ? superOnly
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                      : "bg-primary text-on-primary"
                    : superOnly
                      ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-900/20"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }
                  ${collapsed ? "justify-center" : ""}`}
              >
                <span className="shrink-0">{icon}</span>
                {!collapsed && (
                  <span className="truncate">{t(labelKey as any)}</span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer — user + logout */}
      <div className={`border-t border-outline-variant p-3 space-y-1 ${collapsed ? "flex flex-col items-center" : ""}`}>
        {!collapsed && (
          <div className="px-2 py-1.5 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-xs font-bold text-on-surface truncate">{userEmail ?? "Admin"}</p>
              {isSuperAdmin && (
                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                  Owner
                </span>
              )}
            </div>
            <p className="text-[10px] text-on-surface-variant font-medium">{t("admin.portal")}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={t("admin.exitSystem" as any)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold
            text-error hover:bg-error-container hover:text-on-error-container transition-all duration-150
            ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && t("admin.exitSystem" as any)}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggle}
        className="absolute -right-3.5 top-[72px] w-7 h-7 rounded-full border border-outline-variant
          bg-surface-container flex items-center justify-center
          text-on-surface-variant hover:bg-surface-container-high transition-all shadow-sm z-10"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
