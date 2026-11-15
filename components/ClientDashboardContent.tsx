"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useState, useMemo } from "react";
import CountUp from "@/components/ui/count-up";
import { cx } from "@/utils/cx";
import { Chip } from "@/components/base/badges/chip";
import {
  RiFlashlightFill,
  RiDropFill,
  RiPaintBrushFill,
  RiHomeGearFill,
  RiBroadcastFill,
  RiFireFill,
  RiHammerFill,
  RiToolsFill,
  RiEyeLine,
  RiEyeOffLine,
  RiAddLine,
  RiArrowLeftRightLine,
  RiArrowRightSLine,
  RiShieldCheckFill,
  RiFileTextLine,
  RiBriefcaseFill,
  RiBankCardLine,
  RiCheckDoubleLine,
  RiFilePaperLine,
  RiCustomerService2Line,
  RiCompass3Line,
} from "@remixicon/react";

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
  payments?: any[];
}

/* ── Top Trades Grid Data (5 Active + 3 Coming Soon in 2x4 Layout) ─── */
const TOP_TRADES = [
  {
    name: "Electrical",
    category: "electrical",
    icon: RiFlashlightFill,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    countText: "+24 Pros",
    isComingSoon: false,
  },
  {
    name: "Plumber",
    category: "plumbing",
    icon: RiDropFill,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
    countText: "+18 Pros",
    isComingSoon: false,
  },
  {
    name: "Painter",
    category: "painting",
    icon: RiPaintBrushFill,
    iconColor: "text-pink-500",
    iconBg: "bg-pink-500/10",
    countText: "+14 Pros",
    isComingSoon: false,
  },
  {
    name: "House Finishing",
    category: "house_finishing",
    icon: RiHomeGearFill,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    countText: "+19 Pros",
    isComingSoon: false,
  },
  {
    name: "Satellite Dish",
    category: "satellite_dish",
    icon: RiBroadcastFill,
    iconColor: "text-cyan-500",
    iconBg: "bg-cyan-500/10",
    countText: "+12 Pros",
    isComingSoon: false,
  },
  {
    name: "Welder",
    category: "welding",
    icon: RiFireFill,
    iconColor: "text-red-500",
    iconBg: "bg-red-500/10",
    countText: "Coming Soon",
    isComingSoon: true,
  },
  {
    name: "Carpentry",
    category: "carpentry",
    icon: RiHammerFill,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-600/10",
    countText: "Coming Soon",
    isComingSoon: true,
  },
  {
    name: "Masonry",
    category: "masonry",
    icon: RiToolsFill,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-500/10",
    countText: "Coming Soon",
    isComingSoon: true,
  },
];

/* Helper to map a contract to an authentic trade background photo */
function getContractBgImage(title?: string, skills?: string[]) {
  const text = `${title || ""} ${(skills || []).join(" ")}`.toLowerCase();
  if (
    text.includes("electr") ||
    text.includes("wir") ||
    text.includes("light") ||
    text.includes("dish") ||
    text.includes("satellite")
  ) {
    return "/images/artisan-register-hero.jpg";
  }
  if (text.includes("plumb") || text.includes("pipe") || text.includes("water") || text.includes("leak")) {
    return "/images/worker_workbench_hero.jpg";
  }
  return "/images/client_project_hero.jpg";
}

/* ── Subcomponent: Contract Card with Sixpay Sparkline Curve (Direct Routing) ── */
function ContractCard({
  contract,
  index,
  isDesktop = false,
}: {
  contract: any;
  index: number;
  isDesktop?: boolean;
}) {
  const isElectric = index % 2 === 0;
  const curveColor = contract.curveColor || (isElectric ? "#45BA50" : "#3B82F6");
  const proName = contract.worker_name || contract.proName || "Artisan Pro";
  const jobTitle = contract.job_title || contract.trade || "Contract Agreement";
  const budgetVal = contract.budgetVal || (contract.budget ? Number(contract.budget).toLocaleString() : "1,000");
  const bgImage = getContractBgImage(jobTitle, contract.worker_skills);
  const contractId = contract.contract_id || contract.id || "1";

  return (
    <Link
      href={`/contracts/${contractId}`}
      className={cx(
        "rounded-3xl p-5 bg-background-secondary-default border border-border-button-default shadow-xs",
        "flex flex-col justify-between h-[185px] cursor-pointer relative overflow-hidden select-none group transition-all",
        "hover:border-[#45BA50]/50 hover:shadow-md active:scale-[0.98]",
        isDesktop ? "w-full" : "snap-start shrink-0 w-[240px] sm:w-[260px]"
      )}
    >
      {/* Subtle authentic trade background photo overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-8 group-hover:opacity-15 transition-opacity pointer-events-none"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />

      {/* Card Top: Worker Name + Round Trade Icon Badge */}
      <div className="flex items-start justify-between relative z-10">
        <div className="min-w-0 pr-2">
          <h3 className="text-body-medium font-bold text-text-primary leading-tight truncate group-hover:text-[#45BA50] transition-colors">
            {proName}
          </h3>
          <p className="text-caption-1-semibold text-text-tertiary truncate mt-0.5">
            {jobTitle}
          </p>
        </div>

        {/* Circular Brand Icon on Top Right */}
        <div
          className={cx(
            "w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs",
            isElectric ? "bg-[#18261b] text-[#45BA50]" : "bg-blue-950 text-blue-400"
          )}
        >
          {isElectric ? (
            <RiFlashlightFill className="w-4 h-4" />
          ) : (
            <RiDropFill className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Card Middle: Value + Status Tag (ZERO ESCROW) */}
      <div className="relative z-10 mt-1">
        <p className="text-title-2-medium font-black text-text-primary dark:text-white tracking-tight flex items-baseline">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 mr-1.5">ETB</span>
          {budgetVal}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={cx(
              "text-[11px] font-bold flex items-center gap-0.5",
              isElectric ? "text-[#45BA50]" : "text-blue-500"
            )}
          >
            {contract.progress || "● Active Direct Payment"}
          </span>
        </div>
      </div>

      {/* Card Bottom: Elegant SVG Wave Sparkline */}
      <div className="absolute inset-x-0 bottom-0 h-14 pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity">
        <svg
          viewBox="0 0 240 50"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <linearGradient
              id={`sparkline-grad-${isDesktop ? "d-" : "m-"}${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={curveColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={curveColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d={`${contract.path || "M0,32 Q30,12 60,24 T120,10 T180,28 T240,16"} L240,50 L0,50 Z`}
            fill={`url(#sparkline-grad-${isDesktop ? "d-" : "m-"}${index})`}
          />
          <path
            d={contract.path || "M0,32 Q30,12 60,24 T120,10 T180,28 T240,16"}
            fill="none"
            stroke={curveColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </Link>
  );
}

/* ── Subcomponent: Top Trades 8-Item Grid ── */
function TopTradesGrid() {
  return (
    <div className="grid grid-cols-4 gap-y-5 gap-x-2 sm:gap-x-4">
      {TOP_TRADES.map((trade) => {
        const Icon = trade.icon;
        if (trade.isComingSoon) {
          return (
            <div
              key={trade.category}
              className="flex flex-col items-center text-center opacity-60 select-none"
            >
              <div
                className={cx(
                  "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xs",
                  trade.iconBg,
                  trade.iconColor
                )}
              >
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="text-caption-1-semibold font-bold text-text-primary mt-2 leading-tight truncate w-full px-0.5">
                {trade.name}
              </span>
              <span className="text-[10px] font-bold text-text-tertiary mt-0.5">
                Soon
              </span>
            </div>
          );
        }

        return (
          <Link
            key={trade.category}
            href={`/client/search?category=${trade.category}`}
            className="flex flex-col items-center text-center group active:scale-90 transition-transform touch-manipulation"
          >
            <div
              className={cx(
                "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-105",
                trade.iconBg,
                trade.iconColor
              )}
            >
              <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <span className="text-caption-1-semibold font-bold text-text-primary mt-2 leading-tight truncate w-full px-0.5">
              {trade.name}
            </span>
            <span className="text-[10px] font-bold text-[#45BA50] mt-0.5">
              {trade.countText}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default function ClientDashboardContent({
  userData,
  activeContracts = [],
  recentJobs = [],
  payments = [],
}: ClientDashboardContentProps) {
  const { t } = useLanguage();
  const [showBalance, setShowBalance] = useState(true);

  // Time Range Filter State: "all", "month", "quarter" (3 months)
  const [timeFilter, setTimeFilter] = useState<"all" | "month" | "quarter">("all");

  const filterCutoff = useMemo(() => {
    const now = new Date();
    if (timeFilter === "month") {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    if (timeFilter === "quarter") {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      return d;
    }
    return null;
  }, [timeFilter]);

  // Contracts list mapped directly from REAL database contracts
  const displayContracts = useMemo(() => {
    return activeContracts.map((c, i) => {
      const isElectric = (c.worker_skills || []).some(
        (s: string) =>
          s.toLowerCase().includes("electric") ||
          s.toLowerCase().includes("dish") ||
          s.toLowerCase().includes("satellite")
      );
      const curveColor = i % 2 === 0 ? "#45BA50" : "#3B82F6";
      const proName = c.worker_name || "Verified Artisan";
      const jobTitle = c.job_title || "Contract Agreement";
      const budgetVal = c.budget ? Number(c.budget).toLocaleString() : "1,000";
      const progressText =
        c.job_status === "paid" || c.job_status === "closed"
          ? "✓ Completed & Paid"
          : c.job_status === "disputed"
          ? "⚠ Disputed Settlement"
          : "● Active Direct Payment";

      return {
        ...c,
        id: c.contract_id || c.id || `contract-${i}`,
        trade: jobTitle,
        proName,
        job_title: jobTitle,
        worker_name: proName,
        budgetVal,
        progress: progressText,
        curveColor,
        path:
          i % 2 === 0
            ? "M0,32 Q30,12 60,24 T120,10 T180,28 T240,16"
            : "M0,28 Q40,36 80,18 T140,24 T200,8 T240,20",
      };
    });
  }, [activeContracts]);

  // Filtered Contracts according to Time Window
  const filteredContracts = useMemo(() => {
    if (!filterCutoff) return displayContracts;
    return displayContracts.filter((c) => {
      const d = c.contract_created_at ? new Date(c.contract_created_at) : null;
      return d && d >= filterCutoff;
    });
  }, [displayContracts, filterCutoff]);

  // Filtered Jobs / Recent Requests according to Time Window
  const filteredJobs = useMemo(() => {
    if (!filterCutoff) return recentJobs;
    return recentJobs.filter((j) => {
      const d = j.created_at ? new Date(j.created_at) : null;
      return d && d >= filterCutoff;
    });
  }, [recentJobs, filterCutoff]);

  // Dynamic Spend Calculation based on Time Filter
  const totalBudget = activeContracts.reduce((sum, c) => {
    const v = parseFloat(String(c.budget || "0").replace(/[^0-9.]/g, ""));
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  const displayTotal = useMemo(() => {
    if (timeFilter === "all") {
      if (userData.totalSpent && userData.totalSpent > 0) return userData.totalSpent;
      const paymentSum = (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      if (paymentSum > 0) return paymentSum;
      return totalBudget;
    }

    // Filter payments inside the date window
    const windowPayments = (payments || []).filter((p) => {
      const d = p.payment_created_at ? new Date(p.payment_created_at) : null;
      return d && filterCutoff && d >= filterCutoff;
    });

    const sum = windowPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    if (sum > 0) return sum;

    // Fallback to contracts created in that window
    return filteredContracts.reduce((s, c) => s + (Number(c.budget) || 0), 0);
  }, [timeFilter, userData.totalSpent, payments, filterCutoff, filteredContracts, totalBudget]);

  return (
    <div className="w-full max-w-lg mx-auto lg:max-w-none lg:mx-0 space-y-6 lg:space-y-8 pb-10 lg:pb-12 select-none">
      
      {/* ── 1. TOTAL SPEND HEADER ── */}
      {/* 1A. Mobile View: Exact Sixpay Visual Match with Dynamic Time Filter (< lg) */}
      <section className="lg:hidden px-1 sm:px-2 pt-1">
        {/* Total Spend Label + Currency Switch Pill */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-caption-1-semibold text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wide text-[11px]">
              {timeFilter === "all" ? "Total Spend" : timeFilter === "month" ? "Spend This Month" : "Spend Last 3 Mo"}
            </span>
            <button
              type="button"
              className="w-5 h-5 rounded-full bg-background-tertiary-default flex items-center justify-center text-text-secondary hover:text-text-primary active:scale-90 transition-transform"
              title="Currency: ETB"
            >
              <RiArrowLeftRightLine className="w-3 h-3" />
            </button>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-background-tertiary-default border border-border-button-default">
            <button
              type="button"
              onClick={() => setTimeFilter("all")}
              className={cx(
                "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                timeFilter === "all"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                  : "text-text-tertiary"
              )}
            >
              Total
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("month")}
              className={cx(
                "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                timeFilter === "month"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                  : "text-text-tertiary"
              )}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("quarter")}
              className={cx(
                "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                timeFilter === "quarter"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                  : "text-text-tertiary"
              )}
            >
              3 Mo
            </button>
          </div>
        </div>

        {/* Big Bold Spend + High-Contrast ETB + Eye Toggle + Circular Plus Action Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-title-1-medium sm:text-headline-medium text-text-primary font-black tracking-tight flex items-baseline">
              <span className="text-title-3-semibold sm:text-title-1-medium text-zinc-900 dark:text-white font-black mr-2 tracking-tight">
                ETB
              </span>
              {showBalance ? (
                <CountUp
                  to={displayTotal}
                  duration={1}
                  separator=","
                />
              ) : (
                <span>••••••••</span>
              )}
            </h1>

            {/* Eye Toggle Button */}
            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              aria-label={showBalance ? "Hide balance" : "Show balance"}
              className="p-1.5 rounded-full text-text-tertiary hover:text-text-primary active:scale-90 transition-transform cursor-pointer"
            >
              {showBalance ? (
                <RiEyeLine className="w-5 h-5" />
              ) : (
                <RiEyeOffLine className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Black/Dark Circular Plus Button */}
          <Link
            href="/client/search"
            aria-label="Find and Hire an Artisan"
            className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-md active:scale-90 hover:opacity-95 transition-all touch-manipulation shrink-0"
          >
            <RiAddLine className="w-6 h-6 stroke-[1.5]" />
          </Link>
        </div>
      </section>

      {/* 1B. Desktop View: Edge-to-Edge Widescreen Bento Banner with Date Filter (lg and up) */}
      <section className="hidden lg:grid lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Total Spend & Widescreen Stats Card (spans 8 cols) */}
        <div className="lg:col-span-8 rounded-3xl bg-background-secondary-default border border-border-button-default p-6 xl:p-8 shadow-xs flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative background gradient */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#45BA50]/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-caption-1-semibold text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-xs">
                  {timeFilter === "all" ? "Total Spend" : timeFilter === "month" ? "Spend This Month" : "Spend Last 3 Months"}
                </span>

                {/* Desktop Time Filter Segmented Control */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-background-tertiary-default/80 border border-border-button-default text-xs">
                  <button
                    type="button"
                    onClick={() => setTimeFilter("all")}
                    className={cx(
                      "px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer",
                      timeFilter === "all"
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                        : "text-text-tertiary hover:text-text-primary"
                    )}
                  >
                    All Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFilter("month")}
                    className={cx(
                      "px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer",
                      timeFilter === "month"
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                        : "text-text-tertiary hover:text-text-primary"
                    )}
                  >
                    This Month
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFilter("quarter")}
                    className={cx(
                      "px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer",
                      timeFilter === "quarter"
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                        : "text-text-tertiary hover:text-text-primary"
                    )}
                  >
                    Last 3 Months
                  </button>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#45BA50]/15 text-[#45BA50] border border-[#45BA50]/30">
                  Direct Payments
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <h1 className="text-4xl xl:text-5xl font-black text-text-primary tracking-tight flex items-baseline">
                  <span className="text-2xl xl:text-3xl text-zinc-900 dark:text-white font-black mr-2.5 tracking-tight">
                    ETB
                  </span>
                  {showBalance ? (
                    <CountUp
                      to={displayTotal}
                      duration={1}
                      separator=","
                    />
                  ) : (
                    <span>••••••••</span>
                  )}
                </h1>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-background-tertiary-default transition-colors cursor-pointer"
                  title={showBalance ? "Hide amount" : "Show amount"}
                >
                  {showBalance ? (
                    <RiEyeLine className="w-5 h-5" />
                  ) : (
                    <RiEyeOffLine className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-caption-1-semibold text-text-tertiary mt-2">
                Real direct disbursements to verified artisans across Dire Dawa.
              </p>
            </div>

            {/* Verified Status Badge */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-background-primary-default border border-border-button-default shadow-xs">
              <RiShieldCheckFill className="w-5 h-5 text-[#45BA50]" />
              <div>
                <p className="text-xs font-bold text-text-primary leading-none">Fayda ID Verified</p>
                <p className="text-[10px] text-text-tertiary mt-1">Direct Client Account</p>
              </div>
            </div>
          </div>

          {/* Metric Quick Stats row */}
          <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-border-separator-border relative z-10">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-text-tertiary">Active Contracts</p>
              <p className="text-xl font-black text-text-primary">
                {filteredContracts.length} <span className="text-xs font-semibold text-[#45BA50]">In Progress</span>
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-text-tertiary">Completed Projects</p>
              <p className="text-xl font-black text-text-primary">
                {userData.completedProjects || 0} <span className="text-xs font-semibold text-text-tertiary">Delivered</span>
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-text-tertiary">Payment Policy</p>
              <p className="text-xl font-black text-[#45BA50]">
                100% <span className="text-xs font-semibold text-text-secondary">Direct (Zero Escrow)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Launchpad (spans 4 cols) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#101b13] dark:bg-[#0c160e] text-white p-6 xl:p-8 shadow-xs flex flex-col justify-between border border-[#45BA50]/30 relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-[#45BA50] text-zinc-950 flex items-center justify-center font-bold mb-4 shadow-sm">
              <RiAddLine className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-title-2-medium font-bold text-white leading-tight">
              Hire an Artisan
            </h3>
            <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
              Find top-rated electricians, plumbers, and house finishing pros in Dire Dawa with direct payments.
            </p>
          </div>

          <div className="space-y-2.5 mt-6 relative z-10">
            <Link
              href="/client/search"
              className="w-full h-11 rounded-2xl bg-[#45BA50] hover:bg-[#3ea848] text-zinc-950 font-bold text-caption-1-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <RiAddLine className="w-4 h-4 stroke-[2]" />
              <span>Find & Hire Workers</span>
            </Link>
            <Link
              href="/client/history"
              className="w-full h-10 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center transition-colors"
            >
              <span>View Full History & Receipts</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. MOBILE SECTIONS (< lg) ── */}
      <div className="space-y-6 lg:hidden">
        {/* Mobile "My Contracts" Carousel */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1 sm:px-2">
            <h2 className="text-headline-medium font-bold text-text-primary">
              My Contracts ({filteredContracts.length})
            </h2>
            <Link
              href="/client/contracts"
              className="text-xs sm:text-sm font-bold text-[#45BA50] dark:text-[#a4fe47] hover:underline transition-colors flex items-center"
            >
              <span>View Details</span>
              <RiArrowRightSLine className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          {filteredContracts.length > 0 ? (
            <div className="flex gap-3.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-1 snap-x">
              {filteredContracts.map((contract, i) => (
                <ContractCard
                  key={contract.id || i}
                  contract={contract}
                  index={i}
                  isDesktop={false}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-background-secondary-default border border-border-button-default p-6 text-center space-y-2">
              <p className="text-body-medium font-bold text-text-primary">No contracts found</p>
              <p className="text-caption-1-semibold text-text-tertiary text-xs">
                {timeFilter === "all"
                  ? "You don't have any active contracts. Find a verified artisan to get started."
                  : "No contracts were created in this time period."}
              </p>
              <Link
                href="/client/search"
                className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl bg-[#45BA50] text-zinc-950 font-bold text-xs"
              >
                <RiAddLine className="w-4 h-4 stroke-[2]" />
                <span>Hire an Artisan</span>
              </Link>
            </div>
          )}
        </section>

        {/* Mobile "Today Top Movers" */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1 sm:px-2">
            <h2 className="text-headline-medium font-bold text-text-primary">
              Today Top Movers
            </h2>
            <Link
              href="/client/search"
              className="text-xs sm:text-sm font-bold text-[#45BA50] dark:text-[#a4fe47] hover:underline transition-colors"
            >
              See All
            </Link>
          </div>

          <div className="rounded-3xl bg-background-secondary-default border border-border-button-default p-4 sm:p-6 shadow-xs">
            <TopTradesGrid />
          </div>
        </section>

        {/* Mobile "Recent Requests" */}
        {filteredJobs.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1 sm:px-2">
              <h2 className="text-headline-medium font-bold text-text-primary">
                Recent Requests ({filteredJobs.length})
              </h2>
              <Link
                href="/client/history"
                className="text-xs sm:text-sm font-bold text-[#45BA50] dark:text-[#a4fe47] hover:underline transition-colors flex items-center gap-0.5"
              >
                <span>History</span>
                <RiArrowRightSLine className="w-4 h-4" />
              </Link>
            </div>

            <div className="rounded-3xl bg-background-secondary-default border border-border-button-default p-4 divide-y divide-border-separator-border shadow-xs">
              {filteredJobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="py-3 flex items-center justify-between gap-3 first:pt-1 last:pb-1"
                >
                  <div className="min-w-0">
                    <p className="text-body-medium font-bold text-text-primary truncate">
                      {job.title}
                    </p>
                    <p className="text-caption-1-semibold text-text-tertiary">
                      {job.created_at
                        ? new Date(job.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Recent"}
                    </p>
                  </div>
                  <Chip
                    variant="caption"
                    color={job.status === "completed" || job.status === "paid" || job.status === "closed" ? "lime" : "blue"}
                  >
                    {job.status === "completed" || job.status === "paid" || job.status === "closed" ? "Completed" : "In Progress"}
                  </Chip>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── 3. DESKTOP WIDESCREEN BENTO BODY (lg and up) ── */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Left Column (spans 8 cols): My Contracts Grid + Recent Requests Table */}
        <div className="lg:col-span-8 space-y-8">
          {/* Desktop Contracts Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-headline-medium font-bold text-text-primary">
                  My Contracts ({filteredContracts.length})
                </h2>
                <p className="text-caption-1-semibold text-text-tertiary mt-0.5">
                  Real contracts from your account with sparkline progress
                </p>
              </div>
              <Link
                href="/client/contracts"
                className="text-xs font-bold text-[#45BA50] dark:text-[#a4fe47] hover:underline transition-colors flex items-center gap-1"
              >
                <span>View All Contracts</span>
                <RiArrowRightSLine className="w-4 h-4" />
              </Link>
            </div>

            {/* Grid of Contract Cards Filling Width */}
            {filteredContracts.length > 0 ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredContracts.map((contract, i) => (
                  <ContractCard
                    key={contract.id || i}
                    contract={contract}
                    index={i}
                    isDesktop={true}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-background-secondary-default border border-border-button-default p-8 text-center space-y-2">
                <p className="text-body-medium font-bold text-text-primary">No contracts found</p>
                <p className="text-caption-1-semibold text-text-tertiary">
                  {timeFilter === "all"
                    ? "You don't have any active contracts. Find a verified artisan to get started."
                    : "No contracts were created in this time period."}
                </p>
                <Link
                  href="/client/search"
                  className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl bg-[#45BA50] text-zinc-950 font-bold text-xs"
                >
                  <RiAddLine className="w-4 h-4 stroke-[2]" />
                  <span>Hire an Artisan</span>
                </Link>
              </div>
            )}
          </section>

          {/* Desktop Expanded Recent Requests Table Card */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-headline-medium font-bold text-text-primary">
                  Recent Job Requests ({filteredJobs.length})
                </h2>
                <p className="text-caption-1-semibold text-text-tertiary mt-0.5">
                  Direct requests commissioned by your account
                </p>
              </div>
              <Link
                href="/client/history"
                className="text-xs font-bold text-[#45BA50] dark:text-[#a4fe47] hover:underline transition-colors flex items-center gap-0.5"
              >
                <span>Full History</span>
                <RiArrowRightSLine className="w-4 h-4" />
              </Link>
            </div>

            <div className="rounded-3xl bg-background-secondary-default border border-border-button-default shadow-xs overflow-hidden">
              <div className="divide-y divide-border-separator-border">
                {filteredJobs.length > 0 ? (
                  filteredJobs.slice(0, 5).map((job) => (
                    <div
                      key={job.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-background-tertiary-default/50 transition-colors"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-body-medium font-bold text-text-primary truncate">
                          {job.title}
                        </p>
                        <p className="text-caption-1-semibold text-text-tertiary flex items-center gap-2 mt-0.5">
                          <span>
                            {job.created_at
                              ? new Date(job.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Recent"}
                          </span>
                          {job.budget && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-text-secondary">
                                ETB {Number(job.budget).toLocaleString()}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Chip
                          variant="caption"
                          color={job.status === "completed" || job.status === "paid" || job.status === "closed" ? "lime" : "blue"}
                        >
                          {job.status === "completed" || job.status === "paid" || job.status === "closed" ? "Completed" : "In Progress"}
                        </Chip>
                        <Link
                          href="/client/history"
                          className="p-1.5 rounded-full hover:bg-background-tertiary-default text-text-tertiary hover:text-text-primary transition-colors"
                          title="View history & receipts"
                        >
                          <RiArrowRightSLine className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-body-medium font-bold text-text-primary">No requests found</p>
                    <p className="text-caption-1-semibold text-text-tertiary mt-1">
                      {timeFilter === "all"
                        ? "When you post a request or hire an artisan, they will appear here."
                        : "No requests found for this time period."}
                    </p>
                    <Link
                      href="/client/search"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[#45BA50] text-zinc-950 font-bold text-xs"
                    >
                      <RiAddLine className="w-4 h-4 stroke-[2]" />
                      <span>Hire an Artisan</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (spans 4 cols): Today Top Movers + Direct Payment Safety + Quick Links */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Movers 8-Trade Box */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-headline-medium font-bold text-text-primary">
                Today Top Movers
              </h2>
              <Link
                href="/client/search"
                className="text-xs font-bold text-[#45BA50] dark:text-[#a4fe47] hover:underline transition-colors"
              >
                See All
              </Link>
            </div>

            <div className="rounded-3xl bg-background-secondary-default border border-border-button-default p-5 xl:p-6 shadow-xs">
              <TopTradesGrid />
            </div>
          </section>

          {/* Desktop-Only Component: DireSkill Direct Payment & Safety Card */}
          <div className="rounded-3xl bg-background-secondary-default border border-border-button-default p-5 xl:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#18261b] text-[#45BA50] flex items-center justify-center">
                <RiShieldCheckFill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-body-medium font-bold text-text-primary">
                  Direct Payment Safety
                </h3>
                <p className="text-caption-1-semibold text-text-tertiary">
                  Zero Commission & Zero Escrow
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-2.5">
                <RiBankCardLine className="w-4 h-4 text-[#45BA50] shrink-0 mt-0.5" />
                <p className="text-caption-1-semibold text-text-secondary leading-snug">
                  <strong className="text-text-primary font-bold">100% Direct Settlement:</strong> Pay your artisan directly via Telebirr or cash upon milestone inspection.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <RiCheckDoubleLine className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-caption-1-semibold text-text-secondary leading-snug">
                  <strong className="text-text-primary font-bold">Fayda ID Verified:</strong> 100% of artisans hold verified Ethiopian National ID credentials.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <RiFilePaperLine className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-caption-1-semibold text-text-secondary leading-snug">
                  <strong className="text-text-primary font-bold">Digital Contract & QR:</strong> Legally binding scope of work generated for every project.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-border-separator-border flex items-center justify-between">
              <Link
                href="/client/support"
                className="text-xs font-bold text-[#45BA50] dark:text-[#a4fe47] hover:underline flex items-center gap-1"
              >
                <RiCustomerService2Line className="w-4 h-4" />
                <span>Dire Dawa Support 24/7</span>
              </Link>
              <Link
                href="/client/history"
                className="text-xs font-semibold text-text-tertiary hover:text-text-primary transition-colors"
              >
                Audit History
              </Link>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-3xl bg-background-secondary-default border border-border-button-default p-4 shadow-xs">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/client/search"
                className="p-3 rounded-2xl bg-background-tertiary-default/50 hover:bg-background-tertiary-default text-text-primary font-bold text-caption-1-semibold flex flex-col items-center text-center gap-1.5 transition-colors"
              >
                <RiCompass3Line className="w-5 h-5 text-[#45BA50]" />
                <span>Find Workers</span>
              </Link>
              <Link
                href="/client/history"
                className="p-3 rounded-2xl bg-background-tertiary-default/50 hover:bg-background-tertiary-default text-text-primary font-bold text-caption-1-semibold flex flex-col items-center text-center gap-1.5 transition-colors"
              >
                <RiFileTextLine className="w-5 h-5 text-blue-500" />
                <span>All Receipts</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
