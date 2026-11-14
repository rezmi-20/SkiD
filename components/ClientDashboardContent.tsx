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
  RiChat1Line,
  RiPhoneLine,
  RiCloseLine,
  RiBriefcaseFill,
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
  if (text.includes("electr") || text.includes("wir") || text.includes("light") || text.includes("dish") || text.includes("satellite")) {
    return "/images/artisan-register-hero.jpg";
  }
  if (text.includes("plumb") || text.includes("pipe") || text.includes("water") || text.includes("leak")) {
    return "/images/worker_workbench_hero.jpg";
  }
  return "/images/client_project_hero.jpg";
}

export default function ClientDashboardContent({
  userData,
  activeContracts = [],
  recentJobs = [],
}: ClientDashboardContentProps) {
  const { t } = useLanguage();
  const [showBalance, setShowBalance] = useState(true);
  const [selectedContract, setSelectedContract] = useState<any | null>(null);

  const activeCount = activeContracts.length;
  const totalBudget = activeContracts.reduce((sum, c) => {
    const v = parseFloat(String(c.budget || "0").replace(/[^0-9.]/g, ""));
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  // Real spending from PostgreSQL or calculated budget fallback
  const displayTotal = userData.totalSpent && userData.totalSpent > 0
    ? userData.totalSpent
    : (totalBudget > 0 ? totalBudget : 14250);

  // Contracts list with Sixpay sparkline curves
  const displayContracts =
    activeContracts.length > 0
      ? activeContracts.map((c, i) => ({
          ...c,
          id: c.contract_id || c.id || `contract-${i}`,
          trade: c.job_title || "Contract Agreement",
          proName: c.worker_name || "Verified Pro",
          budgetVal: c.budget ? Number(c.budget).toLocaleString() : "3,500",
          progress: "Active Direct Payment",
          curveColor: i % 2 === 0 ? "#45BA50" : "#3B82F6",
          path: i % 2 === 0
            ? "M0,32 Q30,12 60,24 T120,10 T180,28 T240,16"
            : "M0,28 Q40,36 80,18 T140,24 T200,8 T240,20",
        }))
      : [
          {
            id: "demo-1",
            job_title: "Electrical Rewiring",
            trade: "Electrical",
            worker_name: "Kassahun B.",
            worker_avatar: null,
            budget: 3500,
            status: "in_progress",
            progress: "↑ 65% In Progress",
            curveColor: "#45BA50",
            path: "M0,32 Q30,12 60,24 T120,10 T180,28 T240,16",
          },
          {
            id: "demo-2",
            job_title: "Pipe Leak Inspection",
            trade: "Plumbing",
            worker_name: "Tadesse M.",
            worker_avatar: null,
            budget: 1800,
            status: "accepted",
            progress: "● Active Direct Payment",
            curveColor: "#3B82F6",
            path: "M0,28 Q40,36 80,18 T140,24 T200,8 T240,20",
          },
        ];

  return (
    <div className="w-full max-w-lg mx-auto lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl space-y-6 pb-20 select-none">
      
      {/* ── 1. TOTAL BALANCE / SPENT SECTION (Exact Sixpay Mobile Visual Match) ── */}
      <section className="px-1 sm:px-2 pt-1">
        {/* Total Balance Label + Currency Switch Pill */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-caption-1-semibold text-text-tertiary font-medium">
            Total Balance
          </span>
          <button
            type="button"
            className="w-5 h-5 rounded-full bg-background-tertiary-default flex items-center justify-center text-text-secondary hover:text-text-primary active:scale-90 transition-transform"
            title="Currency: ETB"
          >
            <RiArrowLeftRightLine className="w-3 h-3" />
          </button>
        </div>

        {/* Big Bold Balance + Eye Toggle + Circular Plus Action Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-title-1-medium sm:text-headline-medium text-text-primary font-black tracking-tight flex items-baseline">
              <span className="text-title-3-semibold sm:text-title-1-medium text-text-secondary mr-2">
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

          {/* Black/Dark Circular Plus Button (like Sixpay image) */}
          <Link
            href="/client/search"
            aria-label="Find and Hire an Artisan"
            className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-md active:scale-90 hover:opacity-95 transition-all touch-manipulation shrink-0"
          >
            <RiAddLine className="w-6 h-6 stroke-[1.5]" />
          </Link>
        </div>
      </section>

      {/* ── 2. "MY PORTFOLIO" / ACTIVE CONTRACTS CAROUSEL (Sixpay Card Style) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1 sm:px-2">
          <h2 className="text-headline-medium font-bold text-text-primary">
            My Contracts
          </h2>
          <Link
            href="/client/contracts"
            className="text-body-medium text-text-tertiary hover:text-text-primary font-medium flex items-center transition-colors"
          >
            <span>View Details</span>
            <RiArrowRightSLine className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        {/* Horizontal Snap Scroll Container */}
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-1 snap-x">
          {displayContracts.map((contract, i) => {
            const isElectric = i % 2 === 0;
            const curveColor = contract.curveColor || (isElectric ? "#45BA50" : "#3B82F6");
            const proName = contract.worker_name || contract.proName || "Artisan Pro";
            const jobTitle = contract.job_title || contract.trade || "Contract Agreement";
            const budgetVal = contract.budget ? Number(contract.budget).toLocaleString() : (contract.budgetVal || "3,500");
            const bgImage = getContractBgImage(jobTitle, contract.worker_skills);

            return (
              <motion.div
                key={contract.id || i}
                onClick={() => setSelectedContract(contract)}
                whileTap={{ scale: 0.97 }}
                className={cx(
                  "snap-start shrink-0 w-[240px] sm:w-[260px] rounded-3xl p-4 sm:p-5",
                  "bg-background-secondary-default border border-border-button-default shadow-xs",
                  "flex flex-col justify-between h-[180px] cursor-pointer relative overflow-hidden select-none group"
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
                    <h3 className="text-body-medium font-bold text-text-primary leading-tight truncate">
                      {proName}
                    </h3>
                    <p className="text-caption-1-semibold text-text-tertiary truncate mt-0.5">
                      {jobTitle}
                    </p>
                  </div>

                  {/* Circular Brand Icon on Top Right (like BNB/eToro icon in Sixpay image) */}
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
                  <p className="text-title-2-medium font-black text-text-primary tracking-tight">
                    ETB {budgetVal}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={cx(
                        "text-[11px] font-bold flex items-center gap-0.5",
                        isElectric ? "text-[#45BA50]" : "text-blue-500"
                      )}
                    >
                      {contract.progress || (isElectric ? "↑ 65% In Progress" : "● Active Direct Payment")}
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Elegant SVG Wave Sparkline (Exact match to Sixpay image) */}
                <div className="absolute inset-x-0 bottom-0 h-14 pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity">
                  <svg
                    viewBox="0 0 240 50"
                    preserveAspectRatio="none"
                    className="w-full h-full"
                  >
                    <defs>
                      <linearGradient id={`sparkline-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={curveColor} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={curveColor} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    {/* Gradient Fill */}
                    <path
                      d={`${contract.path || "M0,32 Q30,12 60,24 T120,10 T180,28 T240,16"} L240,50 L0,50 Z`}
                      fill={`url(#sparkline-grad-${i})`}
                    />
                    {/* Stroke */}
                    <path
                      d={contract.path || "M0,32 Q30,12 60,24 T120,10 T180,28 T240,16"}
                      fill="none"
                      stroke={curveColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── 3. "TODAY TOP MOVERS" -> TOP TRADES GRID (Exact Sixpay 8-Item Box) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1 sm:px-2">
          <h2 className="text-headline-medium font-bold text-text-primary">
            Today Top Movers
          </h2>
          <Link
            href="/client/search"
            className="text-body-medium font-bold text-text-primary hover:underline transition-colors"
          >
            See All
          </Link>
        </div>

        {/* Clean Container Card with 8 Circular Items (2 rows of 4) */}
        <div className="rounded-3xl bg-background-secondary-default border border-border-button-default p-4 sm:p-6 shadow-xs">
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
                  {/* Circular Icon with Soft Tint (like Sixpay logos) */}
                  <div
                    className={cx(
                      "w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-105",
                      trade.iconBg,
                      trade.iconColor
                    )}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>

                  {/* Trade Title */}
                  <span className="text-caption-1-semibold font-bold text-text-primary mt-2 leading-tight truncate w-full px-0.5">
                    {trade.name}
                  </span>

                  {/* Subtitle Badge (like +0.70 (+0.31) in Sixpay image) */}
                  <span className="text-[10px] font-bold text-[#45BA50] mt-0.5">
                    {trade.countText}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. RECENT ACTIVITY LIST (Clean Card Rows) ── */}
      {recentJobs.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1 sm:px-2">
            <h2 className="text-headline-medium font-bold text-text-primary">
              Recent Requests
            </h2>
            <Link
              href="/client/contracts"
              className="text-body-medium text-text-tertiary hover:text-text-primary font-medium"
            >
              History
            </Link>
          </div>

          <div className="rounded-3xl bg-background-secondary-default border border-border-button-default p-4 divide-y divide-border-separator-border shadow-xs">
            {recentJobs.slice(0, 4).map((job) => (
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
                  color={job.status === "completed" ? "lime" : "blue"}
                >
                  {job.status === "completed" ? "Completed" : "In Progress"}
                </Chip>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. GESTURE-DRIVEN DETAIL BOTTOM SHEET (Charles UX Spring Physics) ── */}
      <AnimatePresence>
        {selectedContract && (
          <>
            {/* Scrim Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedContract(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />

            {/* Bottom Sheet Drawer with Drag to Dismiss */}
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
                    {selectedContract.job_title || selectedContract.trade}
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
                      {selectedContract.worker_name || selectedContract.proName || "Assigned Artisan"}
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

              {/* Agreed Contract Amount (ZERO ESCROW) */}
              <div className="flex items-center justify-between text-body-medium py-3 px-1 mb-5 border-b border-border-separator-border">
                <span className="text-text-tertiary">Agreed Contract Payment:</span>
                <span className="text-title-3-semibold font-black text-text-primary">
                  ETB {selectedContract.budget ? Number(selectedContract.budget).toLocaleString() : (selectedContract.budgetVal || "3,500")}
                </span>
              </div>

              {/* Quick Communication Actions (Thumb Zone) */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => alert("Calling artisan...")}
                  className="h-11 rounded-2xl bg-background-secondary-default hover:bg-background-secondary-hover border border-border-button-default text-text-primary font-bold text-caption-1-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
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
