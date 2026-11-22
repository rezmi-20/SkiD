"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth/client";
import { handleAppSignOut } from "@/lib/auth/sign-out-client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Settings,
  FileCheck,
  Wrench,
  Star,
  FileText,
  CreditCard,
  ShieldCheck,
  Moon,
  Headphones,
  Scale,
  LogOut,
  ArrowRight,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WorkerTradeHeroBanner from "@/components/worker/WorkerTradeHeroBanner";

interface ProfileContentProps {
  user: {
    name: string;
    email: string;
    role: "client" | "worker";
    initials: string;
    avatarUrl?: string | null;
    is_verified?: boolean;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    district?: string;
    verificationStatus?: string;
    maskedFin?: string | null;
    bio?: string | null;
  };
  stats?: {
    label: string;
    value: string;
  }[];
  menuGroups?: any[];
  skills?: string[];
}

export default function ProfileContent({ user, stats = [], skills = [] }: ProfileContentProps) {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDarkMode = theme === "dark";
  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const isWorker = user.role === "worker";
  const contractsHref = isWorker ? "/worker/contracts" : "/client/contracts";
  const ongoingJobsHref = isWorker ? "/worker/jobs" : "/client/contracts";
  const ratingsHref = isWorker ? "/worker/rate" : "/client/rate";
  const paymentsHref = isWorker ? "/worker/earnings" : "/client/payments";
  const settingsHref = isWorker ? "/worker/profile/settings" : "/client/profile/settings";
  const securityHref = isWorker ? "/worker/contract-setup" : "/client/contract-setup";
  const supportHref = isWorker ? "/worker/support" : "/client/support";
  const disputesHref = isWorker ? "/worker/disputes" : "/client/disputes";

  const handleSignOut = () => {
    handleAppSignOut();
  };

  return (
    <div className="w-full max-w-md md:max-w-4xl mx-auto px-0 sm:px-6 pb-10 sm:pb-14 animate-in fade-in duration-300">
      
      {/* ── COVER PROFILE HERO (Full-bleed flush on mobile, rounded card on desktop) ── */}
      <div className="mb-6 pt-0">
        <WorkerTradeHeroBanner
          user={user}
          skills={skills}
          bio={user.bio}
          totalJobs={stats[0]?.value || "0"}
        />
      </div>

      <div className="space-y-6 px-3.5 sm:px-0">
          
          {/* 1. "Work & Contracts" Domain Capsule */}
          <div>
            <h3 className="text-sm font-black text-foreground tracking-tight mb-2.5">
              {t("profile.hub.workContracts")}
            </h3>

            {/* Sleek Dark Capsule Card matching screenshot */}
            <div className="rounded-[2rem] bg-slate-950 dark:bg-zinc-900 text-white p-5 shadow-xl flex items-center justify-around border border-slate-800/80 dark:border-zinc-800">
              {/* Item 1: Active Contracts */}
              <Link
                href={contractsHref}
                className="flex flex-col items-center group transition-transform active:scale-95 touch-manipulation"
              >
                <div className="relative">
                  <FileCheck className="h-6 w-6 text-white stroke-[1.75]" />
                  <span className="absolute -top-1.5 -right-2 bg-[#ef4444] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                    {stats[0]?.value || "1"}
                  </span>
                </div>
                <span className="text-xs font-bold text-white/90 mt-2 text-center">
                  {t("profile.hub.activeContracts")}
                </span>
                <span className="text-[10px] text-white/50">{t("profile.hub.signedLive")}</span>
              </Link>

              {/* Item 2: Ongoing Milestones / In Progress */}
              <Link
                href={ongoingJobsHref}
                className="flex flex-col items-center group transition-transform active:scale-95 touch-manipulation"
              >
                <div className="relative">
                  <Wrench className="h-6 w-6 text-white stroke-[1.75]" />
                  <span className="absolute -top-1.5 -right-2 bg-[#ef4444] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow-sm">
                    {stats[1]?.value ? "1" : "1"}
                  </span>
                </div>
                <span className="text-xs font-bold text-white/90 mt-2 text-center">
                  {t("profile.hub.inProgress")}
                </span>
                <span className="text-[10px] text-white/50">{t("profile.hub.onSiteWork")}</span>
              </Link>

              {/* Item 3: Ratings & Reviews */}
              <Link
                href={ratingsHref}
                className="flex flex-col items-center group transition-transform active:scale-95 touch-manipulation"
              >
                <Star className="h-6 w-6 text-[#a4fe47] stroke-[1.75] fill-[#a4fe47]/20" />
                <span className="text-xs font-bold text-white/90 mt-2 text-center">
                  {t("profile.hub.jobRatings")}
                </span>
                <span className="text-[10px] text-white/50">{t("profile.hub.score")}</span>
              </Link>
            </div>
          </div>

          {/* 2. "General" Section (Clean interactive pill rows) */}
          <div>
            <h3 className="text-sm font-black text-foreground tracking-tight mb-2.5">
              {t("profile.section.general")}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Row 1: My Contracts */}
              <Link
                href={contractsHref}
                className="rounded-[1.75rem] bg-slate-100/90 dark:bg-zinc-900/90 hover:bg-slate-200/70 dark:hover:bg-zinc-800/80 p-3.5 sm:p-4 flex items-center justify-between shadow-sm hover:border-primary/30 border border-slate-200/70 dark:border-zinc-800 active:scale-[0.99] transition-all touch-manipulation group"
              >
                <div className="h-11 w-11 rounded-full bg-slate-900 dark:bg-zinc-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">{t("profile.menu.myContracts")}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{t("profile.menu.myContractsDesc")}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
              </Link>

              {/* Row 2: Payments & Invoices (Chapa) */}
              <Link
                href={paymentsHref}
                className="rounded-[1.75rem] bg-slate-100/90 dark:bg-zinc-900/90 hover:bg-slate-200/70 dark:hover:bg-zinc-800/80 p-3.5 sm:p-4 flex items-center justify-between shadow-sm hover:border-primary/30 border border-slate-200/70 dark:border-zinc-800 active:scale-[0.99] transition-all touch-manipulation group"
              >
                <div className="h-11 w-11 rounded-full bg-slate-900 dark:bg-zinc-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <CreditCard className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">{t("profile.menu.billing")}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{t("profile.menu.billingDesc")}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
              </Link>

              {/* Row 3: Security & Contract PIN */}
              <Link
                href={securityHref}
                className="rounded-[1.75rem] bg-slate-100/90 dark:bg-zinc-900/90 hover:bg-slate-200/70 dark:hover:bg-zinc-800/80 p-3.5 sm:p-4 flex items-center justify-between shadow-sm hover:border-primary/30 border border-slate-200/70 dark:border-zinc-800 active:scale-[0.99] transition-all touch-manipulation group"
              >
                <div className="h-11 w-11 rounded-full bg-slate-900 dark:bg-zinc-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">{t("profile.menu.securityPin")}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{t("profile.menu.securityPinDesc")}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
              </Link>

              {/* Row 4: Account & Profile Settings */}
              <Link
                href={settingsHref}
                className="rounded-[1.75rem] bg-slate-100/90 dark:bg-zinc-900/90 hover:bg-slate-200/70 dark:hover:bg-zinc-800/80 p-3.5 sm:p-4 flex items-center justify-between shadow-sm hover:border-primary/30 border border-slate-200/70 dark:border-zinc-800 active:scale-[0.99] transition-all touch-manipulation group"
              >
                <div className="h-11 w-11 rounded-full bg-slate-900 dark:bg-zinc-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Settings className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">Profile & Account Settings</p>
                  <p className="text-[10px] text-muted-foreground truncate">Personal information, security & preferences</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
              </Link>

              {/* Row 4: Dark Theme (Interactive Toggle Switch) */}
              <div
                onClick={toggleTheme}
                className="rounded-[1.75rem] bg-slate-100/90 dark:bg-zinc-900/90 hover:bg-slate-200/70 dark:hover:bg-zinc-800/80 p-3.5 sm:p-4 flex items-center justify-between shadow-sm cursor-pointer active:scale-[0.99] transition-all touch-manipulation group border border-slate-200/70 dark:border-zinc-800"
              >
                <div className="h-11 w-11 rounded-full bg-slate-900 dark:bg-zinc-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Moon className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">{t("profile.menu.darkTheme")}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{isDarkMode ? t("profile.menu.darkThemeActive") : t("profile.menu.lightThemeActive")}</p>
                </div>
                {/* iOS-style toggle pill */}
                <div
                  className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 ${
                    isDarkMode ? "bg-[#a4fe47]" : "bg-[#d1d5db]"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                      isDarkMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {/* Row 5: Contact Us & Live Support */}
              <Link
                href={supportHref}
                className="rounded-[1.75rem] bg-slate-100/90 dark:bg-zinc-900/90 hover:bg-slate-200/70 dark:hover:bg-zinc-800/80 p-3.5 sm:p-4 flex items-center justify-between shadow-sm hover:border-primary/30 border border-slate-200/70 dark:border-zinc-800 active:scale-[0.99] transition-all touch-manipulation group"
              >
                <div className="h-11 w-11 rounded-full bg-slate-900 dark:bg-zinc-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Headphones className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">{t("profile.menu.support")}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{t("profile.menu.supportDesc")}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
              </Link>

              {/* Row 6: Disputes & Appeals */}
              <Link
                href={disputesHref}
                className="rounded-[1.75rem] bg-slate-100/90 dark:bg-zinc-900/90 hover:bg-slate-200/70 dark:hover:bg-zinc-800/80 p-3.5 sm:p-4 flex items-center justify-between shadow-sm hover:border-primary/30 border border-slate-200/70 dark:border-zinc-800 active:scale-[0.99] transition-all touch-manipulation group"
              >
                <div className="h-11 w-11 rounded-full bg-slate-900 dark:bg-zinc-800 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Scale className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground truncate">{t("profile.menu.disputes")}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{t("profile.menu.disputesDesc")}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground/70 shrink-0" />
              </Link>

              {/* Row 7: Logout (Burgundy Crimson Accent #731b1e) */}
              <button
                onClick={handleSignOut}
                type="button"
                className="sm:col-span-2 rounded-[1.75rem] bg-[#731b1e]/10 dark:bg-[#731b1e]/20 border border-[#731b1e]/20 p-3.5 sm:p-4 flex items-center justify-between shadow-sm active:scale-[0.99] transition-all touch-manipulation text-left group"
              >
                <div className="h-11 w-11 rounded-full bg-[#731b1e] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <LogOut className="h-4 w-4 stroke-[2]" />
                </div>
                <div className="flex-1 min-w-0 ml-3.5">
                  <p className="text-xs sm:text-sm font-bold text-[#731b1e] dark:text-[#ff8589]">{t("profile.signOut")}</p>
                  <p className="text-[10px] text-muted-foreground">{t("profile.menu.logoutDesc")}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#731b1e] dark:text-[#ff8589] shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
