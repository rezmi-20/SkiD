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
import FirstTimeOnboardingModal from "@/components/onboarding/FirstTimeOnboardingModal";
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

  // Derive localized current page title for mobile header
  const getPageTitle = () => {
    if (pathname.includes("/dashboard")) return t("nav.dashboard") || "Dashboard";
    if (pathname.includes("/search")) return t("nav.search") || "Search";
    if (pathname.includes("/gigs")) return t("nav.mygigs") || "My Gigs";
    if (pathname.includes("/jobs")) return t("nav.myjobs") || "My Jobs";
    if (pathname.includes("/community")) return t("nav.community") || "Community";
    if (pathname.includes("/messages")) return t("nav.chat") || "Messages";
    if (pathname.includes("/profile/settings")) return t("nav.admin.settings") || "Settings";
    if (pathname.includes("/profile")) return t("nav.profile") || "Profile";
    if (pathname.includes("/contract-setup")) return t("profile.menu.securityPin") || "Contract PIN";
    if (pathname.includes("/contracts")) return t("nav.contracts") || "Contracts";
    if (pathname.includes("/payments") || pathname.includes("/earnings")) return t("nav.payments") || "Payments";
    if (pathname.includes("/support")) return t("nav.support") || "Support";
    if (pathname.includes("/appeals")) return t("nav.appeals") || "Appeals";
    if (pathname.includes("/disputes")) return t("nav.disputes") || "Disputes";

    const currentCrumb = breadcrumbs[breadcrumbs.length - 1];
    return currentCrumb && currentCrumb.length > 20 ? "Details" : currentCrumb || "DireSkill";
  };
  const pageTitle = getPageTitle();

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
        <header className="sticky top-0 z-20 w-full bg-background/90 backdrop-blur-xl border-b border-border/80">
          {/* Mobile Top Navigation (< lg): Left: Logo | Center: Title | Right: NotificationBell */}
          <div className="lg:hidden flex items-center justify-between h-14 px-3 sm:px-4">
            <div className="w-10 flex items-center justify-start shrink-0">
              <Link href={`/${role}/dashboard`} className="flex items-center focus:outline-none" aria-label="DireSkill Home">
                <DireSkillLogo variant="color" iconSize={28} />
              </Link>
            </div>

            <div className="flex-1 flex items-center justify-center min-w-0 px-2 text-center">
              <span className="text-sm font-extrabold text-foreground truncate">
                {pageTitle}
              </span>
            </div>

            <div className="w-10 flex items-center justify-end shrink-0">
              <NotificationBell role={role} />
            </div>
          </div>

          {/* Desktop Top Navigation (>= lg) */}
          <div className="hidden lg:flex items-center justify-between h-16 px-6">
            {/* Left: Brand & Desktop breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <Link href={`/${role}/dashboard`} className="shrink-0 flex items-center gap-1.5 focus:outline-none">
                <DireSkillLogo variant="color" iconSize={28} />
              </Link>

              <nav className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
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

            {/* Right: Controls (Desktop Language Switcher, NotificationBell, Theme Toggle) */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-muted/80 rounded-full p-0.5 gap-0.5 border border-border/80">
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
              <div id="tour-notifications">
                <NotificationBell role={role} />
              </div>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full text-muted-foreground hover:text-foreground h-9 w-9"
                title={t("common.toggleTheme")}
              >
                {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </Button>
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
        <MobileNav role={role} />

        {/* ── First-Time User Onboarding ── */}
        <FirstTimeOnboardingModal
          userRole={role}
          userName={userEmail ? userEmail.split("@")[0] : ""}
        />
      </div>
    </div>
  );
}
