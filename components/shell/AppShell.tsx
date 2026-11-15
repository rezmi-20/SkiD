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
  const [collapsed, setCollapsed] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(true);
  const breadcrumbs = useBreadcrumb();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smart auto-hiding header: hides when scrolling down, reappears when scrolling back up
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 15) {
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY + 6) {
        // Scrolling down -> hide header
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY - 6) {
        // Scrolling back up (swiping down) -> reveal header
        setHeaderVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  const isFullBleedPage = /^\/(client\/worker\/|client\/messages(\/|$)|worker\/messages(\/|$)|contracts\/|client\/search(\/|$))/.test(pathname);

  // Derive localized current page title for mobile header
  const getPageTitle = () => {
    if (pathname.includes("/notifications")) return "Notification";
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

        {/* ── Auto-Hiding Top Header (Hides when scrolling down, reappears when scrolling back up) ── */}
        <header
          className={cn(
            "sticky top-0 z-30 w-full bg-background/95 backdrop-blur-xl border-b border-border/80 transition-transform duration-300 ease-in-out will-change-transform",
            headerVisible ? "translate-y-0" : "-translate-y-full"
          )}
        >
          {/* Mobile Top Navigation (< lg): Left: Logo | Center: Redesigned Bold Title | Right: NotificationBell */}
          <div className="lg:hidden flex items-center justify-between h-14 px-3 sm:px-4">
            <div className="w-10 flex items-center justify-start shrink-0">
              <DireSkillLogo variant="color" iconSize={28} href={`/${role}/dashboard`} showWordmark={false} />
            </div>

            <div className="flex-1 flex items-center justify-center min-w-0 px-2 text-center">
              <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight truncate">
                {pageTitle}
              </h1>
            </div>

            <div className="w-10 flex items-center justify-end shrink-0">
              <NotificationBell role={role} />
            </div>
          </div>

          {/* Desktop Top Navigation (>= lg) */}
          <div className="hidden lg:flex items-center justify-between h-16 px-6">
            {/* Left: Brand & Desktop Title / Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 flex items-center">
                <DireSkillLogo variant="color" iconSize={28} href={`/${role}/dashboard`} showWordmark={false} />
              </div>

              <div className="flex items-center gap-2.5 ml-2">
                <h1 className="text-xl font-black text-foreground tracking-tight">
                  {pageTitle}
                </h1>
                {breadcrumbs.length > 1 && (
                  <nav className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ChevronRight size={13} className="text-border" />
                    <span>{breadcrumbs[breadcrumbs.length - 1]}</span>
                  </nav>
                )}
              </div>
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
          {isFullBleedPage ? (
            <div className="w-full flex-1 flex flex-col">
              {children}
            </div>
          ) : (
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 md:py-8">
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
