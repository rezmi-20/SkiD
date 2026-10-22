"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";
import MobileNav from "@/components/shell/MobileNav";
import Sidebar from "@/components/shell/Sidebar";
import NotificationBell from "@/components/shell/NotificationBell";
import DireSkillLogo from "@/components/shell/DireSkillLogo";
import ContractSetupPrompt from "@/components/ContractSetupPrompt";
import Link from "next/link";
import { Sun, Moon, ChevronRight, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  role: "client" | "worker";
  userEmail?: string | null;
  contractSetupComplete?: boolean;
  contractSetupHref?: string;
}

// Build breadcrumb label from the current path segment
function useBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg) =>
    seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export default function AppShell({
  children,
  role,
  userEmail,
  contractSetupComplete = true,
  contractSetupHref,
}: AppShellProps) {
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  // Sidebar collapse state lives HERE so content area can react with matching margin
  const [collapsed, setCollapsed] = useState(true);
  const breadcrumbs = useBreadcrumb();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isMessagesPage = /^\/(client\/worker\/|client\/messages(\/|$)|worker\/messages(\/|$)|contracts\/)/.test(pathname);

  // Derive current page title for mobile header
  const currentCrumb = breadcrumbs[breadcrumbs.length - 1];
  const pageTitle =
    breadcrumbs.length > 1
      ? currentCrumb && currentCrumb.length > 22
        ? "Details"
        : currentCrumb || "DireSkill"
      : "DireSkill";

  // sidebar widths kept in sync with Sidebar.tsx
  const sidebarW = collapsed ? "lg:ml-[68px]" : "lg:ml-64";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ContractSetupPrompt
        completed={contractSetupComplete}
        setupHref={contractSetupHref || (role === "worker" ? "/worker/contract-setup" : "/client/contract-setup")}
      />

      {/* ── Fixed Sidebar (desktop only) ── */}
      <Sidebar
        role={role}
        userEmail={userEmail}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />

      {/* ── Content area shifts right to make room for fixed sidebar ── */}
      <div className={cn("flex flex-col min-h-screen transition-all duration-300", sidebarW)}>

        {/* ── Sticky Top Header ── */}
        <header className={cn("sticky top-0 z-20 w-full bg-background/90 backdrop-blur-xl border-b border-border/80", isMessagesPage && "hidden md:block")}>
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-6">

            {/* Left: Mobile Brand & Page Context | Desktop breadcrumb */}
            <div className="flex items-center gap-2.5 min-w-0">
              <Link href={`/${role}/dashboard`} className="shrink-0 flex items-center gap-1.5 focus:outline-none">
                <DireSkillLogo variant="color" iconSize={26} />
              </Link>

              {/* Mobile Page Title Indicator */}
              <div className="flex items-center gap-2 min-w-0 lg:hidden">
                <span className="h-4 w-px bg-border/80 shrink-0" />
                <span className="text-xs sm:text-sm font-extrabold text-foreground truncate max-w-[120px] xs:max-w-[170px]">
                  {pageTitle}
                </span>
              </div>

              {/* Desktop breadcrumb */}
              <nav className="hidden lg:flex items-center gap-1 text-sm text-muted-foreground">
                {breadcrumbs.map((crumb, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <ChevronRight size={14} className="text-border" />}
                    <span
                      className={cn(
                        i === breadcrumbs.length - 1
                          ? "font-semibold text-foreground"
                          : "hover:text-foreground transition-colors cursor-pointer"
                      )}
                    >
                      {crumb}
                    </span>
                  </span>
                ))}
              </nav>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Language toggle: Compact cycle button on mobile (<640px), 3-pill on desktop (>=640px) */}
              <button
                onClick={() => {
                  const nextLang = language === "en" ? "am" : language === "am" ? "om" : "en";
                  setLanguage(nextLang);
                }}
                className="sm:hidden flex items-center justify-center px-2.5 h-8 rounded-full bg-muted/80 border border-border/80 text-[11px] font-bold text-foreground active:scale-95 transition-all"
                title="Change language"
              >
                <span>{language === "en" ? "EN" : language === "am" ? "አማ" : "OM"}</span>
              </button>

              <div className="hidden sm:flex items-center bg-muted/80 rounded-full p-0.5 gap-0.5 border border-border/80">
                <button
                  onClick={() => setLanguage("en")}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-bold transition-all",
                    language === "en"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("am")}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-bold transition-all",
                    language === "am"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  አማ
                </button>
                <button
                  onClick={() => setLanguage("om")}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-bold transition-all",
                    language === "om"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  OM
                </button>
              </div>

              {/* Notification bell */}
              <NotificationBell role={role} />

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full text-muted-foreground hover:text-foreground h-8 w-8 sm:h-9 sm:w-9"
                title={t("common.toggleTheme")}
              >
                {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </Button>

              {/* Mobile settings button */}
              <Link
                href={role === "worker" ? "/worker/profile/settings" : "/client/profile/settings"}
                className="lg:hidden flex items-center justify-center h-8 w-8 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-white hover:text-[#a3e635] shadow-xs border border-white/10 active:scale-90 transition-all shrink-0"
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={15} className="stroke-[2]" />
              </Link>
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 w-full overflow-x-clip flex flex-col">
          {isMessagesPage ? (
            <div className="w-full flex-1 flex flex-col">
              {children}
            </div>
          ) : (
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full">
              {children}
            </div>
          )}
        </main>

        {/* ── Mobile Bottom Nav ── */}
        {!isMessagesPage && <MobileNav role={role} />}
      </div>
    </div>
  );
}
