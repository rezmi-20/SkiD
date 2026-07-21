"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { TranslationKey } from "@/lib/translations";
import { authClient } from "@/lib/auth/client";
import DireSkillLogo from "@/components/shell/DireSkillLogo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  FileText,
  CreditCard,
  MessageSquare,
  User,
  Users,
  Briefcase,
  Wallet,
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
        {/* ── Logo ── */}
        <div className="h-16 flex items-center px-4 shrink-0 border-b border-sidebar-border">
          <DireSkillLogo variant="color" iconSize={32} showWordmark={!collapsed} />
        </div>

        {/* ── Nav Groups ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 no-scrollbar">
          {groups.map((group, gi) => (
            <div key={group.label} className={cn("px-3", gi > 0 && "mt-2")}>
              {/* Group label — only shown expanded */}
              {!collapsed && (
                <p className="px-2 mb-1 mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {group.label}
                </p>
              )}
              {collapsed && gi > 0 && (
                <div className="my-2 border-t border-sidebar-border/50" />
              )}

              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname?.startsWith(item.href));

                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/70",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{t(item.key)}</span>}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger render={<span className="block" />}>
                        {link}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {t(item.key)}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return link;
              })}
            </div>
          ))}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* ── Footer: User + Collapse ── */}
        <div className="p-3 space-y-1 shrink-0">
          {/* User card */}
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl",
              collapsed && "justify-center"
            )}
          >
            <Avatar className="h-8 w-8 shrink-0 border border-sidebar-border">
              <AvatarImage src={avatarUrl} alt="User avatar" />
              <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {userEmail?.split("@")[0]}
                </p>
                <p className="text-[11px] text-muted-foreground capitalize">{role}</p>
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
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    authClient.signOut({
                      fetchOptions: { onSuccess: () => { window.location.href = "/login"; } },
                    })
                  }
                >
                  <LogOut size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign Out</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() =>
                authClient.signOut({
                  fetchOptions: { onSuccess: () => { window.location.href = "/login"; } },
                })
              }
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          )}

          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full text-muted-foreground hover:text-foreground",
              collapsed ? "justify-center px-2" : "justify-start gap-2"
            )}
            onClick={onToggle}
          >
            {collapsed ? (
              <ChevronRight size={16} />
            ) : (
              <>
                <ChevronLeft size={16} />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
