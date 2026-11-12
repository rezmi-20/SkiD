"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";
import DireSkillLogo from "@/components/shell/DireSkillLogo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ShieldCheck, Briefcase, UserRound, Camera,
  FileText, DollarSign, Scale, Megaphone,
  BarChart2, Gavel, ChevronLeft, ChevronRight, ChevronDown, LogOut, Crown,
  LifeBuoy, ClipboardList, AlertTriangle, FileCheck, Sun, Moon,
  Settings, FolderKanban
} from "lucide-react";
import type { AdminPermission, AdminRole } from "@/lib/admin-authorization";

interface SidebarProps {
  userEmail: string | null;
  adminName?: string;
  adminRole: AdminRole;
  permissions: AdminPermission[];
}

interface NavItem {
  href: string;
  icon: ReactNode;
  label: string;
  visible: boolean;
  dotColor?: string;
  badge?: string;
}

interface NavGroup {
  id: string;
  title: string;
  icon: ReactNode;
  items: NavItem[];
}

export function Sidebar({ userEmail, adminName, adminRole, permissions }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isSuperAdmin = adminRole === "super_admin";

  const can = (permission: AdminPermission) => permissions.includes(permission);

  // Grouped Navigation preserving all 18 categories based on platform role and functionality
  const navGroups: NavGroup[] = [
    {
      id: "overview",
      title: t("admin.sidebar.overview" as any) || "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
      items: [
        {
          href: "/admin/dashboard",
          icon: <LayoutDashboard className="w-4 h-4" />,
          label: t("admin.sidebar.dashboard" as any) || "Dashboard",
          visible: true,
          dotColor: "bg-blue-500",
        },
      ],
    },
    {
      id: "identity",
      title: t("admin.sidebar.identity" as any) || "Identity & Verification",
      icon: <ShieldCheck className="w-4 h-4" />,
      items: [
        {
          href: "/admin/verify",
          icon: <ShieldCheck className="w-4 h-4" />,
          label: t("admin.sidebar.verifyQueue" as any) || "Verification Queue",
          visible: can("verification.read"),
          dotColor: "bg-emerald-500",
        },
        {
          href: "/admin/worker-avatar-requests",
          icon: <Camera className="w-4 h-4" />,
          label: t("admin.sidebar.photoRequests" as any) || "Photo Requests",
          visible: can("verification.read"),
        },
        {
          href: "/admin/workers",
          icon: <Users className="w-4 h-4" />,
          label: t("admin.sidebar.workers" as any) || "Workers Directory",
          visible: can("verification.read"),
        },
        {
          href: "/admin/clients",
          icon: <UserRound className="w-4 h-4" />,
          label: t("admin.sidebar.clients" as any) || "Clients Directory",
          visible: can("verification.read"),
        },
      ],
    },
    {
      id: "disputes",
      title: t("admin.sidebar.disputesGroup" as any) || "Disputes & Legal",
      icon: <Scale className="w-4 h-4" />,
      items: [
        {
          href: "/admin/disputes",
          icon: <Scale className="w-4 h-4" />,
          label: t("admin.sidebar.disputes" as any) || "Disputes Adjudication",
          visible: can("disputes.read"),
          dotColor: "bg-rose-500",
        },
        {
          href: "/admin/court-evidence",
          icon: <FileCheck className="w-4 h-4" />,
          label: t("admin.sidebar.courtEvidence" as any) || "Court Evidence",
          visible: isSuperAdmin,
          badge: "Legal",
        },
        {
          href: "/admin/appeals",
          icon: <Gavel className="w-4 h-4" />,
          label: t("admin.sidebar.appeals" as any) || "Appeals",
          visible: can("appeals.read") && isSuperAdmin,
        },
        {
          href: "/admin/misconduct",
          icon: <AlertTriangle className="w-4 h-4" />,
          label: t("admin.sidebar.misconduct" as any) || "Admin Misconduct",
          visible: can("admin_misconduct.review") && isSuperAdmin,
        },
      ],
    },
    {
      id: "operations",
      title: t("admin.sidebar.operations" as any) || "Operations & Marketplace",
      icon: <FolderKanban className="w-4 h-4" />,
      items: [
        {
          href: "/admin/payments",
          icon: <DollarSign className="w-4 h-4" />,
          label: t("admin.sidebar.payments" as any) || "Payment Cases",
          visible: can("payment_cases.read"),
          dotColor: "bg-amber-500",
        },
        {
          href: "/admin/support",
          icon: <LifeBuoy className="w-4 h-4" />,
          label: t("admin.sidebar.support" as any) || "Support Tickets",
          visible: can("support.read"),
          dotColor: "bg-violet-500",
        },
        {
          href: "/admin/jobs",
          icon: <Briefcase className="w-4 h-4" />,
          label: t("admin.sidebar.jobs" as any) || "Jobs Oversight",
          visible: can("reports.read"),
        },
        {
          href: "/admin/contracts",
          icon: <FileText className="w-4 h-4" />,
          label: t("admin.sidebar.contracts" as any) || "Contracts Registry",
          visible: can("reports.read"),
        },
        {
          href: "/admin/community",
          icon: <Megaphone className="w-4 h-4" />,
          label: t("admin.sidebar.community" as any) || "Community Moderation",
          visible: can("content.read"),
        },
      ],
    },
    {
      id: "system",
      title: t("admin.sidebar.system" as any) || "System & Governance",
      icon: <Crown className="w-4 h-4" />,
      items: [
        {
          href: "/admin/reports",
          icon: <BarChart2 className="w-4 h-4" />,
          label: t("admin.sidebar.reports" as any) || "Platform Analytics",
          visible: can("reports.read"),
        },
        {
          href: "/admin/users",
          icon: <Crown className="w-4 h-4" />,
          label: t("admin.sidebar.users" as any) || "Staff & Access Roles",
          visible: can("admin_accounts.read") && isSuperAdmin,
          badge: "Full",
        },
        {
          href: "/admin/audit",
          icon: <ClipboardList className="w-4 h-4" />,
          label: t("admin.sidebar.audit" as any) || "System Audit Logs",
          visible: can("audit.read") && isSuperAdmin,
        },
        {
          href: "/admin/settings",
          icon: <Settings className="w-4 h-4" />,
          label: t("admin.sidebar.settings" as any) || "Platform Settings",
          visible: isSuperAdmin,
        },
      ],
    },
  ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    overview: true,
    identity: true,
    disputes: true,
    operations: false,
    system: false,
  });

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);

    navGroups.forEach((group) => {
      const hasActive = group.items.some(
        (item) => pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href))
      );
      if (hasActive) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    await fetch("/api/admin/sign-out", { method: "POST", credentials: "include" });
    window.location.href = "/admin/login";
  };

  const getInitials = (str: string | null) => {
    if (!str) return "AD";
    const cleaned = str.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    return cleaned.substring(0, 2).toUpperCase() || "AD";
  };

  const isDark = mounted ? theme === "dark" || theme === "grayscale" : false;

  return (
    <aside
      className={cn(
        "relative hidden lg:flex flex-col shrink-0 h-full transition-all duration-300 ease-out select-none z-30",
        "bg-sidebar border-r border-sidebar-border",
        collapsed ? "w-[68px]" : "w-[245px]"
      )}
    >
      {/* ── Brand Header (Flush Top with Top Collapse Button) ── */}
      <div
        className={cn(
          "flex items-center h-16 px-3.5 border-b border-sidebar-border",
          collapsed ? "flex-col justify-center gap-1 py-2 h-auto" : "justify-between"
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <DireSkillLogo variant="color" iconSize={26} showWordmark={!collapsed} />
        </div>

        <button
          onClick={toggleCollapse}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Navigation Links (Preserves All 18 Categories) ── */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-2">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => item.visible);
          if (visibleItems.length === 0) return null;

          const isGroupOpen = openGroups[group.id] ?? false;

          if (collapsed) {
            return (
              <div key={group.id} className="py-1 border-b border-sidebar-border/40 last:border-none space-y-1">
                {visibleItems.map(({ href, icon, label, dotColor }) => {
                  const isActive = pathname === href || (href !== "/admin/dashboard" && pathname?.startsWith(href));
                  return (
                    <Link
                      key={href}
                      href={href}
                      title={label}
                      className={cn(
                        "relative flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-200 group",
                        isActive
                          ? "bg-sidebar-accent text-accent shadow-xs"
                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      {/* Active Left Indicator Bar */}
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-accent transition-all duration-300",
                          isActive ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="transition-transform duration-200 group-hover:scale-110">
                        {icon}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          }

          if (group.id === "overview") {
            const item = visibleItems[0];
            const isActive = pathname === item.href || pathname === "/admin";
            return (
              <div key={group.id} className="px-1">
                <Link
                  href={item.href}
                  className={cn(
                    "group relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground font-semibold"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  {/* Active Left Indicator Bar */}
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-accent transition-all duration-300",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span
                    className={cn(
                      "shrink-0 transition-transform duration-200",
                      isActive ? "text-accent" : "text-muted-foreground group-hover:scale-110 group-hover:text-foreground"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate flex-1">{item.label}</span>
                </Link>
              </div>
            );
          }

          return (
            <div key={group.id} className="rounded-lg">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-left text-muted-foreground hover:text-sidebar-foreground transition-colors group cursor-pointer"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 group-hover:text-sidebar-foreground">
                  {group.title}
                </span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200 text-muted-foreground/60 group-hover:text-sidebar-foreground",
                    isGroupOpen ? "rotate-0" : "-rotate-90"
                  )}
                />
              </button>

              {isGroupOpen && (
                <div className="mt-1 space-y-0.5">
                  {visibleItems.map(({ href, icon, label, dotColor, badge }) => {
                    const isActive = pathname === href || (href !== "/admin/dashboard" && pathname?.startsWith(href));
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "group relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-foreground font-semibold"
                            : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )}
                      >
                        {/* Active Left Indicator Bar */}
                        <span
                          className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-accent transition-all duration-300",
                            isActive ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span
                          className={cn(
                            "shrink-0 transition-transform duration-200",
                            isActive ? "text-accent" : "text-muted-foreground group-hover:scale-110 group-hover:text-foreground"
                          )}
                        >
                          {icon}
                        </span>
                        <span className="truncate flex-1">{label}</span>
                        {badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom Sidebar: Admin Profile & Segmented Theme Switcher ── */}
      <div className="p-2.5 border-t border-sidebar-border bg-sidebar space-y-2">
        <div
          className={cn(
            "flex items-center gap-2 p-1.5 rounded-xl border border-sidebar-border bg-sidebar-accent/40",
            collapsed && "justify-center p-1"
          )}
        >
          <Link
            href="/admin/profile"
            className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-chart-1 text-accent-foreground flex items-center justify-center font-bold text-xs shrink-0 shadow-xs hover:opacity-90 transition"
            title="Profile"
          >
            {getInitials(userEmail || adminName || "AD")}
          </Link>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <Link href="/admin/profile" className="block group">
                <p className="text-xs font-semibold text-sidebar-foreground truncate leading-tight group-hover:text-accent">
                  {adminName || userEmail?.split("@")[0] || "Admin"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate leading-tight">
                  {userEmail || "admin@example.com"}
                </p>
              </Link>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              title={t("admin.exitSystem" as any) || "Sign Out"}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Light & Dark Mode Segmented Toggle */}
        {mounted && (
          <div
            className={cn(
              "flex items-center bg-secondary/80 rounded-lg p-0.5 border border-border/50",
              collapsed ? "justify-center" : "w-full"
            )}
          >
            {collapsed ? (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition cursor-pointer"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Moon className="w-3.5 h-3.5 text-accent" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                    !isDark
                      ? "bg-card text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sun className={cn("w-3.5 h-3.5", !isDark ? "text-amber-500" : "text-muted-foreground")} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer",
                    isDark
                      ? "bg-card text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Moon className={cn("w-3.5 h-3.5", isDark ? "text-accent" : "text-muted-foreground")} />
                  <span>Dark</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
