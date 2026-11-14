"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "@/components/ui/count-up";
import { cx } from "@/utils/cx";
import { Chip } from "@/components/base/badges/chip";
import {
  RiFlashlightFill,
  RiDropFill,
  RiPaintBrushFill,
  RiHammerFill,
  RiToolsFill,
  RiFireFill,
  RiBroadcastFill,
  RiHomeGearFill,
  RiAddLine,
  RiArrowRightSLine,
  RiShieldCheckFill,
  RiFileTextLine,
  RiChat1Line,
  RiPhoneLine,
  RiCloseLine,
  RiBriefcaseFill,
  RiSearchLine,
  RiMapPinLine,
  RiCheckLine,
  RiCalendarCheckLine,
  RiWallet3Fill,
  RiAlertFill,
} from "@remixicon/react";
import ClientPerformanceAnalytics from "@/components/client/ClientPerformanceAnalytics";

/* ── Charles UX Named Animation Tokens ───────────────────────────────── */
const SPRINGS = {
  sheet: { type: "spring", damping: 28, stiffness: 320, mass: 0.8 } as const,
  stagger: 0.04,
  fastTap: { duration: 0.1, ease: [0.32, 0.72, 0, 1] } as const,
};

/* ── Types ─────────────────────────────────────────────────────────── */
interface ClientDashboardContentProps {
  userData: {
    fullName: string;
    firstName: string;
    avatarUrl: string | null;
    greeting: string;
    totalSpent?: number;
    completedProjects?: number;
    identityVerified?: boolean;
    verificationStatus?: string;
  };
  activeContracts: any[];
  recentJobs: any[];
}

/* ── Top Trades Specification (5 Active + Coming Soon) ─────────────── */
const TOP_TRADES = [
  {
    name: "Electrical",
    category: "electrical",
    icon: RiFlashlightFill,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/15",
    countText: "24 Pros",
    isComingSoon: false,
  },
  {
    name: "Plumber",
    category: "plumbing",
    icon: RiDropFill,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/15",
    countText: "18 Pros",
    isComingSoon: false,
  },
  {
    name: "Painter",
    category: "painting",
    icon: RiPaintBrushFill,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/15",
    countText: "14 Pros",
    isComingSoon: false,
  },
  {
    name: "House Finishing",
    category: "house_finishing",
    icon: RiHomeGearFill,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/15",
    countText: "19 Pros",
    isComingSoon: false,
  },
  {
    name: "Satellite Dish",
    category: "satellite_dish",
    icon: RiBroadcastFill,
    iconColor: "text-cyan-500",
    iconBg: "bg-cyan-500/15",
    countText: "12 Pros",
    isComingSoon: false,
  },
  {
    name: "Welder",
    category: "welding",
    icon: RiFireFill,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/15",
    countText: "Coming Soon",
    isComingSoon: true,
  },
  {
    name: "Carpentry",
    category: "carpentry",
    icon: RiHammerFill,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-600/15",
    countText: "Coming Soon",
    isComingSoon: true,
  },
  {
    name: "Masonry",
    category: "masonry",
    icon: RiToolsFill,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/15",
    countText: "Coming Soon",
    isComingSoon: true,
  },
];

/* Helper to map a contract to an authentic trade background photo */
function getContractBgImage(title?: string, skills?: string[]) {
  const text = `${title || ""} ${(skills || []).join(" ")}`.toLowerCase();
  if (text.includes("electr") || text.includes("wir") || text.includes("light")) {
    return "/images/artisan-register-hero.jpg";
  }
  if (text.includes("plumb") || text.includes("pipe") || text.includes("water") || text.includes("leak")) {
    return "/images/worker_workbench_hero.jpg";
  }
  if (text.includes("paint") || text.includes("finish") || text.includes("carpenter") || text.includes("door")) {
    return "/images/artisan-login-hero.jpg";
  }
  return "/images/client_project_hero.jpg";
}

export default function ClientDashboardContent({
  userData,
  activeContracts = [],
  recentJobs = [],
}: ClientDashboardContentProps) {
  const { t } = useLanguage();
  const [selectedContract, setSelectedContract] = useState<any | null>(null);

  const activeCount = activeContracts.length;
  const primaryContract = activeContracts[0] || null;
  const realTotalSpent = Number(userData.totalSpent || 0);
  const completedProjectsCount = Number(userData.completedProjects || recentJobs.filter((j) => j.status === "completed").length);
  const isVerified = Boolean(userData.identityVerified);

  const clientStats = {
    totalSpent: realTotalSpent,
    activeHires: activeCount,
    completedProjects: completedProjectsCount,
    disputesCount: 0,
  };

  return (
    <div className="w-full space-y-6 pb-20 select-none">
      
      {/* ── 0. IDENTITY VERIFICATION CALLOUT (If unverified) ───────── */}
      {!isVerified && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <RiAlertFill className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-text-primary">
                {t("clientDashboard.identityCalloutTitle") || "Fayda ID Verification Recommended"}
              </p>
              <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5 leading-snug">
                {t("clientDashboard.identityCalloutDesc") || "Verify your national Fayda ID to unlock official verified contracts."}
              </p>
            </div>
          </div>
          <Link
            href="/client/profile/settings?verify=1&returnTo=/client/dashboard"
            className="rounded-full font-black bg-[#45BA50] hover:bg-[#3ea848] text-white shadow-sm shrink-0 h-9 sm:h-10 px-4 text-xs inline-flex items-center justify-center active:scale-95 transition-transform"
          >
            {t("worker.dashboard.submitId") || "Verify Fayda ID"}
          </Link>
        </motion.div>
      )}

      {/* ── 1. MAIN WIDE BENTO GRID (Responsive: Full width on desktop, app card on mobile) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* ── LEFT / MAIN COLUMN (lg:col-span-8) ── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Contract Showcase Hero (with trade-specific background image) */}
          {primaryContract ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedContract(primaryContract)}
              className={cx(
                "relative overflow-hidden rounded-3xl border border-border-button-default shadow-md p-5 sm:p-7 text-white cursor-pointer select-none",
                "min-h-[220px] sm:min-h-[240px] flex flex-col justify-between group active:scale-[0.99] transition-transform"
              )}
            >
              {/* Trade-Related Background Image with Vignette Overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-85 transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('${getContractBgImage(primaryContract.job_title, primaryContract.worker_skills)}')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

              {/* Top Row: Live Status Pill & Contract Ref */}
              <div className="flex items-center justify-between gap-2 relative z-10 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#45BA50]/30 text-[#a4fe47] text-caption-1-semibold font-black uppercase tracking-wider border border-[#45BA50]/40 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-[#a4fe47] animate-pulse" />
                  Active Contract Work
                </span>
                <span className="text-[11px] text-white/70 font-medium">
                  ID: #{String(primaryContract.contract_id || primaryContract.id).slice(0, 8)}
                </span>
              </div>

              {/* Middle Row: Title, Artisan, and Budget */}
              <div className="flex items-start justify-between gap-4 relative z-10 my-2">
                <div className="min-w-0">
                  <h2 className="text-title-2-medium sm:text-title-1-medium font-black text-white leading-tight truncate">
                    {primaryContract.job_title}
                  </h2>
                  <p className="text-body-medium text-white/80 mt-1 flex items-center gap-1.5">
                    <span>Artisan:</span>
                    <strong className="text-white font-bold">
                      {primaryContract.worker_name || "Verified Pro"}
                    </strong>
                    <RiShieldCheckFill className="w-4 h-4 text-[#45BA50]" />
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-white/70 uppercase block font-semibold">Agreed Budget</span>
                  <span className="text-title-2-medium sm:text-title-1-medium font-black text-[#a4fe47]">
                    ETB {primaryContract.budget ? Number(primaryContract.budget).toLocaleString() : "Agreed"}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Stepper Progress & Quick Actions */}
              <div className="relative z-10 pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-white/80 font-medium">
                  <RiCalendarCheckLine className="w-4 h-4 text-[#45BA50]" />
                  <span>Work in progress backed by digital contract</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/contracts/${primaryContract.contract_id || primaryContract.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-white/15 hover:bg-white/20 active:scale-95 text-xs font-bold text-white transition touch-manipulation backdrop-blur-md"
                  >
                    <RiFileTextLine className="w-4 h-4 text-[#a4fe47]" /> View Contract
                  </Link>
                  <Link
                    href="/client/messages"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-[#45BA50] hover:bg-[#3ea848] active:scale-95 text-xs font-black text-white transition touch-manipulation shadow-sm"
                  >
                    <RiChat1Line className="w-4 h-4" /> Direct Chat
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Inviting Empty State Showcase Hero */
            <div
              className={cx(
                "relative overflow-hidden rounded-3xl border border-border-button-default shadow-xs p-6 sm:p-8",
                "bg-gradient-to-br from-background-secondary-default to-background-tertiary-default"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                <div className="space-y-2 max-w-lg">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#45BA50]/15 text-[#45BA50] text-caption-1-semibold font-black uppercase tracking-wider">
                    <RiShieldCheckFill className="w-4 h-4" />
                    Verified Local Artisans
                  </span>
                  <h1 className="text-title-2-medium sm:text-title-1-medium font-black text-text-primary tracking-tight">
                    {userData.greeting}, {userData.firstName || "Client"} 👋
                  </h1>
                  <p className="text-body-medium text-text-secondary leading-relaxed">
                    Hire electricians, plumbers, painters, and satellite technicians in Dire Dawa backed by digital contracts and verified credentials.
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
                  <Link
                    href="/client/search"
                    className="rounded-full bg-[#45BA50] hover:bg-[#3ea848] text-white font-bold text-body-medium h-11 px-6 flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                  >
                    <RiSearchLine className="w-4 h-4 mr-2" /> Find an Artisan
                  </Link>
                  <Link
                    href="/client/search?view=map"
                    className="rounded-full bg-background-primary-default border border-border-button-default text-text-primary font-bold text-body-medium h-11 px-5 flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <RiMapPinLine className="w-4 h-4 mr-2 text-emerald-500" /> Map Search
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Real Metrics Bento Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Total Spent */}
            <div className="rounded-2xl border border-border-button-default bg-background-secondary-default p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-caption-1-semibold text-text-tertiary font-bold uppercase tracking-wider">
                  Total Spent
                </span>
                <RiWallet3Fill className="w-4 h-4 text-[#45BA50]" />
              </div>
              <p className="text-title-2-medium sm:text-title-1-medium font-black text-text-primary tracking-tight mt-1">
                <CountUp to={realTotalSpent} duration={1} separator="," />
                <span className="text-caption-1-semibold font-bold text-text-tertiary ml-1.5">ETB</span>
              </p>
              <p className="text-[11px] text-text-tertiary mt-1">Direct completed jobs</p>
            </div>

            {/* Active Contracts */}
            <div className="rounded-2xl border border-border-button-default bg-background-secondary-default p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-caption-1-semibold text-text-tertiary font-bold uppercase tracking-wider">
                  Active Work
                </span>
                <RiBriefcaseFill className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-title-2-medium sm:text-title-1-medium font-black text-text-primary tracking-tight mt-1">
                <CountUp to={activeCount} duration={1} />
              </p>
              <p className="text-[11px] text-text-tertiary mt-1">Contracts in progress</p>
            </div>

            {/* Completed Projects */}
            <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border-button-default bg-background-secondary-default p-4 sm:p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-caption-1-semibold text-text-tertiary font-bold uppercase tracking-wider">
                  Completed
                </span>
                <RiCheckLine className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-title-2-medium sm:text-title-1-medium font-black text-text-primary tracking-tight mt-1">
                <CountUp to={completedProjectsCount} duration={1} />
              </p>
              <p className="text-[11px] text-text-tertiary mt-1">Delivered & verified</p>
            </div>
          </div>

          {/* Active Work Agreements Detailed Section */}
          <div className="rounded-3xl border border-border-button-default bg-background-secondary-default p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-headline-medium font-bold text-text-primary">
                  Work Agreements
                </h3>
                <p className="text-caption-1-semibold text-text-tertiary mt-0.5">
                  {activeCount > 0 ? `${activeCount} contract${activeCount > 1 ? "s" : ""} active` : "No ongoing contracts"}
                </p>
              </div>
              <Link
                href="/client/contracts"
                className="text-body-medium text-[#45BA50] hover:underline font-bold flex items-center gap-0.5"
              >
                <span>View All</span>
                <RiArrowRightSLine className="w-4 h-4" />
              </Link>
            </div>

            {activeCount > 0 ? (
              <div className="space-y-3">
                {activeContracts.slice(0, 5).map((contract) => {
                  const contractId = contract.contract_id || contract.id;
                  const bgImage = getContractBgImage(contract.job_title, contract.worker_skills);

                  return (
                    <div
                      key={contractId}
                      onClick={() => setSelectedContract(contract)}
                      className={cx(
                        "relative overflow-hidden rounded-2xl border border-border-button-default p-4 shadow-2xs",
                        "hover:border-[#45BA50]/50 transition-all cursor-pointer active:scale-[0.99] group"
                      )}
                    >
                      {/* Background photo preview on hover/desktop */}
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity pointer-events-none"
                        style={{ backgroundImage: `url('${bgImage}')` }}
                      />

                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-body-medium font-bold text-text-primary truncate">
                            {contract.job_title}
                          </h4>
                          <p className="text-caption-1-semibold text-text-secondary mt-0.5 flex items-center gap-1.5">
                            <span>Artisan: {contract.worker_name || "Verified Pro"}</span>
                            <span className="text-text-tertiary">•</span>
                            <span className="text-[#45BA50] font-semibold">
                              {contract.budget ? `${Number(contract.budget).toLocaleString()} ETB` : "Agreed"}
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <Chip variant="caption" color="lime">
                            In Progress
                          </Chip>
                          <Link
                            href={`/contracts/${contractId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-caption-1-semibold font-bold text-[#45BA50] hover:underline inline-flex items-center gap-1"
                          >
                            Details <RiArrowRightSLine className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border-button-default p-8 flex flex-col items-center justify-center text-center gap-2 bg-background-tertiary-default/50">
                <RiBriefcaseFill className="w-8 h-8 text-text-tertiary" />
                <p className="text-body-medium font-bold text-text-primary">No active work contracts</p>
                <p className="text-caption-1-semibold text-text-tertiary max-w-sm">
                  Start a new project with an electrician, plumber, or painter to initiate a digital contract.
                </p>
                <Link
                  href="/client/search"
                  className="mt-2 rounded-full bg-[#45BA50] text-white px-5 py-2 text-caption-1-semibold font-bold active:scale-95 transition-transform"
                >
                  Find a Pro Now
                </Link>
              </div>
            )}
          </div>

          {/* Performance & Commissioning Analytics */}
          <div className="rounded-3xl border border-border-button-default bg-background-secondary-default p-5 sm:p-6 shadow-2xs">
            <ClientPerformanceAnalytics stats={clientStats} />
          </div>
        </div>

        {/* ── RIGHT COLUMN (lg:col-span-4) Desktop-Exclusive Bento Panels ── */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top Trades Grid (5 Active + Coming Soon) */}
          <div className="rounded-3xl border border-border-button-default bg-background-secondary-default p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-headline-medium font-bold text-text-primary">
                  Top Trades
                </h3>
                <p className="text-caption-1-semibold text-text-tertiary">
                  Verified pros in Dire Dawa
                </p>
              </div>
              <Link
                href="/client/search"
                className="text-caption-1-semibold font-bold text-[#45BA50] hover:underline"
              >
                See All
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {TOP_TRADES.map((trade) => {
                const Icon = trade.icon;
                if (trade.isComingSoon) {
                  return (
                    <div
                      key={trade.category}
                      className="p-3 rounded-2xl border border-border-button-default bg-background-primary-default opacity-60 flex flex-col justify-between h-24 select-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className={cx("w-8 h-8 rounded-full flex items-center justify-center", trade.iconBg, trade.iconColor)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-background-tertiary-default text-text-tertiary">
                          Soon
                        </span>
                      </div>
                      <div>
                        <span className="text-caption-1-semibold font-bold text-text-primary block truncate">
                          {trade.name}
                        </span>
                        <span className="text-[10px] text-text-tertiary block">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={trade.category}
                    href={`/client/search?category=${trade.category}`}
                    className={cx(
                      "p-3 rounded-2xl border border-border-button-default bg-background-primary-default flex flex-col justify-between h-24 shadow-2xs",
                      "hover:border-[#45BA50]/60 active:scale-95 transition-all group touch-manipulation"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className={cx("w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform", trade.iconBg, trade.iconColor)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-[#45BA50]">
                        {trade.countText}
                      </span>
                    </div>
                    <div>
                      <span className="text-caption-1-semibold font-bold text-text-primary block truncate">
                        {trade.name}
                      </span>
                      <span className="text-[10px] text-text-tertiary block">
                        Verified
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Commissioning Actions Card */}
          <div className="rounded-3xl border border-border-button-default bg-background-secondary-default p-5 shadow-2xs space-y-3">
            <h4 className="text-body-medium font-bold text-text-primary">
              Quick Actions
            </h4>
            <div className="space-y-2">
              <Link
                href="/client/search"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-background-primary-default border border-border-button-default hover:border-[#45BA50]/50 transition-all text-start group active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#45BA50]/15 text-[#45BA50] flex items-center justify-center">
                    <RiAddLine className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <p className="text-caption-1-semibold font-bold text-text-primary">Find a Pro</p>
                    <p className="text-[10px] text-text-tertiary">Direct artisan hire</p>
                  </div>
                </div>
                <RiArrowRightSLine className="w-4 h-4 text-text-tertiary group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/client/payments"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-background-primary-default border border-border-button-default hover:border-[#45BA50]/50 transition-all text-start group active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/15 text-blue-500 flex items-center justify-center">
                    <RiWallet3Fill className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-caption-1-semibold font-bold text-text-primary">Payments & Billing</p>
                    <p className="text-[10px] text-text-tertiary">Chapa / Telebirr receipts</p>
                  </div>
                </div>
                <RiArrowRightSLine className="w-4 h-4 text-text-tertiary group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/client/community"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-background-primary-default border border-border-button-default hover:border-[#45BA50]/50 transition-all text-start group active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/15 text-purple-500 flex items-center justify-center">
                    <RiChat1Line className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-caption-1-semibold font-bold text-text-primary">Community Feed</p>
                    <p className="text-[10px] text-text-tertiary">Dire Dawa tips & discussions</p>
                  </div>
                </div>
                <RiArrowRightSLine className="w-4 h-4 text-text-tertiary group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Recent Job Activity */}
          {recentJobs.length > 0 && (
            <div className="rounded-3xl border border-border-button-default bg-background-secondary-default p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-body-medium font-bold text-text-primary">Recent Posts</h4>
                <span className="text-[11px] text-text-tertiary">{recentJobs.length} total</span>
              </div>
              <div className="divide-y divide-border-separator-border">
                {recentJobs.slice(0, 4).map((job) => (
                  <div key={job.id} className="py-2.5 flex items-center justify-between gap-2 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-caption-1-semibold font-bold text-text-primary truncate">{job.title}</p>
                      <p className="text-[10px] text-text-tertiary">
                        {new Date(job.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <Chip variant="caption" color={job.status === "completed" ? "lime" : "blue"}>
                      {job.status === "completed" ? "Done" : "Active"}
                    </Chip>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. GESTURE-DRIVEN DETAIL BOTTOM SHEET (Charles UX Spring Physics) ── */}
      <AnimatePresence>
        {selectedContract && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContract(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={SPRINGS.sheet}
              drag="y"
              dragConstraints={{ top: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setSelectedContract(null);
              }}
              className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto bg-background-primary-default border-t border-border-button-default rounded-t-[36px] p-6 shadow-2xl pb-10"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-background-tertiary-default rounded-full mx-auto mb-5" />

              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <span className="text-caption-1-semibold font-black text-[#45BA50] uppercase tracking-wider">
                    Contract Agreement
                  </span>
                  <h3 className="text-title-2-medium font-bold text-text-primary leading-tight truncate">
                    {selectedContract.job_title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedContract(null)}
                  className="p-1.5 rounded-full bg-background-secondary-default text-text-secondary hover:text-text-primary active:scale-90 transition-transform shrink-0"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Worker Detail inside Sheet */}
              <div className="p-4 rounded-2xl bg-background-secondary-default border border-border-button-default flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[#18261b] text-[#45BA50] flex items-center justify-center font-bold text-sm shrink-0">
                    <RiBriefcaseFill className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-body-medium font-bold text-text-primary truncate">
                      {selectedContract.worker_name || selectedContract.partner_name || "Assigned Artisan"}
                    </p>
                    <p className="text-caption-1-semibold text-text-tertiary flex items-center gap-1">
                      <RiShieldCheckFill className="w-3.5 h-3.5 text-[#45BA50]" />
                      <span>Fayda ID Verified</span>
                    </p>
                  </div>
                </div>

                <Chip variant="caption" color="lime">
                  In Progress
                </Chip>
              </div>

              {/* Agreed Contract Amount */}
              <div className="flex items-center justify-between text-body-medium py-3 px-1 mb-5 border-b border-border-separator-border">
                <span className="text-text-tertiary">Agreed Contract Payment:</span>
                <span className="text-title-3-semibold font-black text-text-primary">
                  ETB {selectedContract.budget ? Number(selectedContract.budget).toLocaleString() : "Agreed"}
                </span>
              </div>

              {/* Quick Communication Actions (Thumb Zone) */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => alert("Calling artisan...")}
                  className="h-11 rounded-2xl bg-background-secondary-default hover:bg-background-secondary-hover border border-border-button-default text-text-primary font-bold text-caption-1-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <RiPhoneLine className="w-4 h-4 text-[#45BA50]" />
                  <span>Call Artisan</span>
                </button>

                <Link
                  href="/client/messages"
                  className="h-11 rounded-2xl bg-background-secondary-default hover:bg-background-secondary-hover border border-border-button-default text-text-primary font-bold text-caption-1-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <RiChat1Line className="w-4 h-4 text-blue-500" />
                  <span>Message</span>
                </Link>
              </div>

              {/* Primary Contract Action */}
              <Link
                href={`/contracts/${selectedContract.contract_id || selectedContract.id || "1"}`}
                className="w-full h-12 rounded-2xl bg-[#45BA50] hover:bg-[#3ea848] text-white font-bold text-body-medium flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
              >
                <RiFileTextLine className="w-5 h-5" />
                <span>Open Full Legal Contract & QR</span>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
