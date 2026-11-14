"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { TranslationKey } from "@/lib/translations";
import { authClient } from "@/lib/auth/client";
import { handleAppSignOut } from "@/lib/auth/sign-out-client";
import DireSkillLogo from "@/components/shell/DireSkillLogo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  FileText,
  CreditCard,
  MessageSquare,
  Scale,
  User,
  Users,
  Briefcase,
  Wallet,
  LifeBuoy,
  Gavel,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  key: TranslationKey;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const CLIENT_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [
      { key: "nav.dashboard", label: "Dashboard", href: "/client/dashboard", icon: <LayoutDashboard size={18} /> },
      { key: "nav.discover", label: "Find Workers", href: "/client/search", icon: <Search size={18} /> },
    ],
  },
  {
    label: "Workspace",
    items: [
      { key: "nav.contracts", label: "Contracts", href: "/client/contracts", icon: <FileText size={18} /> },
      { key: "nav.payments", label: "Payments", href: "/client/payments", icon: <CreditCard size={18} /> },
      { key: "nav.disputes", label: "Disputes", href: "/client/disputes", icon: <Scale size={18} /> },
      { key: "nav.appeals" as any, label: "Appeals", href: "/client/appeals", icon: <Gavel size={18} /> },
      { key: "nav.support", label: "Support", href: "/client/support", icon: <LifeBuoy size={18} /> },
      { key: "nav.chat", label: "Messages", href: "/client/messages", icon: <MessageSquare size={18} /> },
      { key: "nav.feed", label: "Community", href: "/client/community", icon: <Users size={18} /> },
    ],
  },
  {
    label: "Account",
    items: [
      { key: "nav.profile", label: "Profile", href: "/client/profile", icon: <User size={18} /> },
    ],
  },
];

const WORKER_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [
      { key: "nav.dashboard", label: "Dashboard", href: "/worker/dashboard", icon: <LayoutDashboard size={18} /> },
      { key: "nav.mygigs", label: "My Gigs", href: "/worker/gigs", icon: <Briefcase size={18} /> },
    ],
  },
  {
    label: "Workspace",
    items: [
      { key: "nav.contracts", label: "Contracts", href: "/worker/contracts", icon: <FileText size={18} /> },
      { key: "nav.earnings", label: "Earnings", href: "/worker/earnings", icon: <Wallet size={18} /> },
      { key: "nav.disputes", label: "Disputes", href: "/worker/disputes", icon: <Scale size={18} /> },
      { key: "nav.appeals" as any, label: "Appeals", href: "/worker/appeals", icon: <Gavel size={18} /> },
      { key: "nav.support", label: "Support", href: "/worker/support", icon: <LifeBuoy size={18} /> },
      { key: "nav.chat", label: "Messages", href: "/worker/messages", icon: <MessageSquare size={18} /> },
      { key: "nav.feed", label: "Community", href: "/worker/community", icon: <Users size={18} /> },
    ],
  },
  {
    label: "Account",
    items: [
      { key: "nav.profile", label: "Profile", href: "/worker/profile", icon: <User size={18} /> },
    ],
  },
];

interface SidebarProps {
  role: "client" | "worker";
  userEmail?: string | null;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ role, userEmail, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/messages/unread-count");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data.count === "number") {
            setUnreadCount(data.count);
          }
        }
      } catch {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 4000);
    const handleUpdate = () => fetchUnread();
    window.addEventListener("messages:refresh", handleUpdate);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener("messages:refresh", handleUpdate);
    };
  }, []);

  const groups = role === "client" ? CLIENT_GROUPS : WORKER_GROUPS;
  const { data: session } = authClient.useSession();
  const avatarUrl = session?.user?.image || "/default-avatar.svg";
  const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : "??";

  return (
    <TooltipProvider>
      {/* Fixed sidebar — always full viewport height */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-30",
          "border-r border-sidebar-border bg-sidebar",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        {/* ── Brand Header (Flush Top with Top Collapse Button matching Admin Sidebar) ── */}
        <div
          className={cn(
            "flex items-center h-16 px-3.5 border-b border-sidebar-border shrink-0 select-none",
            collapsed ? "flex-col justify-center gap-1 py-2 h-auto" : "justify-between"
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <DireSkillLogo variant="color" iconSize={26} showWordmark={!collapsed} />
          </div>

          <button
            onClick={onToggle}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* ── Nav Groups ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 no-scrollbar space-y-3">
          {groups.map((group, gi) => (
            <div key={group.label} className={cn("space-y-1", gi > 0 && "pt-1")}>
              {/* Group label — only shown expanded */}
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {group.label}
                </p>
              )}
              {collapsed && gi > 0 && (
                <div className="my-2 border-t border-sidebar-border/40" />
              )}

              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== `/${role}/dashboard` && pathname?.startsWith(item.href));
                const isMessagesItem = item.href.includes("messages");

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger render={<span className="block" />}>
                        <Link
                          id={`tour-sidebar-${String(item.key).replace("nav.", "")}`}
                          href={item.href}
                          className={cn(
                            "relative flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-all duration-200 group",
                            isActive
                              ? "bg-slate-900/[0.08] dark:bg-white/[0.08] text-[#45BA50] shadow-xs"
                              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.04]"
                          )}
                        >
                          {/* Active Left Indicator Bar */}
                          <span
                            className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#45BA50] transition-all duration-300",
                              isActive ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className={cn("transition-transform duration-200 group-hover:scale-110 [&>svg]:w-5 [&>svg]:h-5", isActive ? "text-[#45BA50]" : "")}>
                            {item.icon}
                          </span>
                          {isMessagesItem && unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-sidebar" />
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium text-xs">
                        {t(item.key)}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    id={`tour-sidebar-${String(item.key).replace("nav.", "")}`}
                    href={item.href}
                    className={cn(
                      "group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-slate-900/[0.08] dark:bg-white/[0.08] text-sidebar-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.04]"
                    )}
                  >
                    {/* Active Left Indicator Bar */}
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#45BA50] transition-all duration-300",
                        isActive ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span
                      className={cn(
                        "shrink-0 transition-transform duration-200 [&>svg]:w-5 [&>svg]:h-5",
                        isActive ? "text-[#45BA50]" : "text-muted-foreground group-hover:scale-110 group-hover:text-foreground"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate flex-1">{t(item.key)}</span>
                    {isMessagesItem && unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* ── Footer: User + Sign Out ── */}
        <div className="p-3 space-y-1.5 shrink-0 select-none">
          {/* User profile card */}
          <div
            className={cn(
              "flex items-center gap-3 px-2 py-2 rounded-xl bg-slate-900/[0.03] dark:bg-white/[0.03] border border-sidebar-border/60",
              collapsed && "justify-center px-1"
            )}
          >
            <Avatar className="h-8 w-8 shrink-0 border border-sidebar-border">
              <AvatarImage src={avatarUrl} alt="User avatar" />
              <AvatarFallback className="text-xs font-bold bg-[#45BA50] text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">
                  {userEmail?.split("@")[0] || "User"}
                </p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#45BA50]/15 text-[#45BA50] capitalize">
                  {role}
                </span>
              </div>
            )}
          </div>

          {/* Sign out */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger render={<span className="contents" />}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  onClick={() => handleAppSignOut()}
                  title={t("common.signout")}
                  aria-label={t("common.signout")}
                >
                  <LogOut size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{t("common.signout")}</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs font-medium cursor-pointer"
              onClick={() => handleAppSignOut()}
            >
              <LogOut size={15} />
              {t("common.signout") || "Sign Out"}
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
