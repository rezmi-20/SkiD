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
import { Sun, Moon, ChevronRight } from "lucide-react";
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
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  // Sidebar collapse state lives HERE so content area can react with matching margin
  const [collapsed, setCollapsed] = useState(true);
  const breadcrumbs = useBreadcrumb();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isMessagesPage = /^\/(client\/worker\/|client\/messages\/|worker\/messages\/|contracts\/)/.test(pathname);

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
        <header className="sticky top-0 z-20 w-full bg-background/90 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">

            {/* Left: Mobile logo | Desktop breadcrumb */}
            <div className="flex items-center gap-3">
              {/* Mobile logo */}
              <div className="lg:hidden">
                <DireSkillLogo variant="color" iconSize={28} />
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

            {/* Right: controls */}
            <div className="flex items-center gap-2">
              {/* Language toggle */}
              <div className="hidden sm:flex items-center bg-muted rounded-full p-0.5 gap-0.5 border border-border">
                <button
                  onClick={() => setLanguage("en")}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-semibold transition-all",
                    language === "en"
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("am")}
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-semibold transition-all",
                    language === "am"
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  አማ
                </button>
              </div>

              {/* Notification bell */}
              <NotificationBell role={role} />

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full text-muted-foreground hover:text-foreground"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
            </div>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 w-full overflow-x-hidden flex flex-col">
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
