"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { LogOut, Calendar, Sun, Moon, UserCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/lib/translations";
import type { AdminRole } from "@/lib/admin-authorization";

interface TopBarProps {
  adminName: string;
  adminRole: AdminRole;
}

const LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "am", label: "አማ" },
  { code: "om", label: "OM" },
];

export function TopBar({ adminName, adminRole }: TopBarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setMounted(true);
    setCurrentTime(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    );
  }, []);

  const getTitle = () => {
    if (!pathname) return t("admin.dashboard" as any);
    if (pathname.includes("/admin/dashboard")) return t("admin.dashboard" as any);
    if (pathname.includes("/admin/workers"))   return t("admin.workers" as any);
    if (pathname.includes("/admin/verify"))    return t("nav.admin.verify" as any);
    if (pathname.includes("/admin/jobs"))      return t("admin.jobs" as any);
    if (pathname.includes("/admin/contracts")) return t("admin.contracts" as any);
    if (pathname.includes("/admin/payments"))  return t("admin.payments" as any);
    if (pathname.includes("/admin/disputes"))  return t("admin.disputes" as any);
    if (pathname.includes("/admin/community")) return t("admin.community" as any);
    if (pathname.includes("/admin/reports"))   return t("admin.reports" as any);
    if (pathname.includes("/admin/settings"))  return t("admin.settings" as any);
    return t("admin.portal" as any);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/sign-out", { method: "POST", credentials: "include" });
    window.location.href = "/admin/login";
  };

  const isDark = mounted ? (theme === "dark" || theme === "grayscale") : false;

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-lowest/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 transition-colors duration-300">
      {/* Left — page title */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
            {t("admin.portal" as any)}
          </span>
          {mounted && (
            <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider hidden sm:flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {currentTime}
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold tracking-tight text-on-surface mt-1 truncate">
          {getTitle()}
        </h2>
      </div>

      {/* Right — controls */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Language Switcher */}
        <div className="hidden sm:flex bg-surface-container rounded-full p-1 border border-outline-variant">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-200 ${
                language === code
                  ? "bg-on-surface text-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Admin name */}
        <div className="text-right hidden md:block">
          <p className="text-xs font-semibold text-on-surface">{adminName}</p>
          <p className="text-[10px] text-on-surface-variant font-medium">
            {adminRole.replaceAll("_", " ")}
          </p>
        </div>

        <Link
          href="/admin/profile"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container px-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95"
        >
          <UserCircle className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Profile</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-error/30 bg-error-container/20 px-3 text-xs font-bold uppercase tracking-wider text-error hover:bg-error hover:text-on-primary transition-all active:scale-95 duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{t("admin.exitSystem" as any)}</span>
        </button>
      </div>
    </header>
  );
}
