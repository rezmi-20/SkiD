"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { acceptJob, rejectJob } from "@/lib/actions/jobs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CountUp from "@/components/ui/count-up";
import { useLanguage } from "@/context/LanguageContext";
import WorkerPerformanceAnalytics from "@/components/worker/WorkerPerformanceAnalytics";
import { cx } from "@/utils/cx";
import {
  RiBriefcaseFill,
  RiBriefcaseLine,
  RiFileTextFill,
  RiFileTextLine,
  RiWallet3Fill,
  RiWallet3Line,
  RiLockPasswordFill,
  RiLockPasswordLine,
  RiChat3Fill,
  RiCustomerService2Fill,
  RiShieldCheckFill,
  RiAlertFill,
  RiMapPinFill,
  RiFlashlightFill,
  RiArrowRightUpLine,
  RiCheckDoubleLine,
  RiCloseLine,
  RiPulseFill,
  RiRadarLine,
  RiSparklingFill,
  RiStarFill,
  RiCheckboxCircleFill,
  RiCalendarCheckFill,
  RiArrowRightLine,
  RiExchangeFundsLine,
} from "@remixicon/react";

/* ── Charles UX Named Animation Tokens ───────────────────────────────── */
const SPRINGS = {
  sheet: { type: "spring", damping: 28, stiffness: 320, mass: 0.8 } as const,
  subtle: { type: "spring", damping: 24, stiffness: 260 } as const,
  fastTap: { duration: 0.1, ease: [0.32, 0.72, 0, 1] } as const,
};

/* ── Types ─────────────────────────────────────────────────────────── */
interface WorkerDashboardContentProps {
  worker: {
    fullName: string;
    firstName: string;
    avatarUrl?: string | null;
    isVerified: boolean;
    district: string;
    skills: string[];
    hourlyRate?: number | string | null;
    availability?: string;
  };
  stats: {
    activeJobs: number;
    pendingJobs: number;
    completedJobs: number;
    revenue: number;
  };
  pendingJobs: any[];
  recentJobs: any[];
  activeContracts?: any[];
  greeting: string;
}

/* ── Trade Background Mapper ─────────────────────────────────────────── */
function getTradePhoto(titleOrCategory?: string): string {
  const text = (titleOrCategory || "").toLowerCase();
  if (text.includes("electric") || text.includes("power") || text.includes("solar") || text.includes("dish") || text.includes("satellite")) {
    return "/images/artisan-register-hero.jpg";
  }
  if (text.includes("finish") || text.includes("paint") || text.includes("interior") || text.includes("tile") || text.includes("gypsum")) {
    return "/images/client_project_hero.jpg";
  }
  return "/images/worker_workbench_hero.jpg";
}

function statusBadgeStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "in_progress":
    case "active":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "accepted":
    case "signed":
      return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
    case "completed":
    case "paid":
      return "bg-[#45BA50]/20 text-[#a4fe47] border-[#45BA50]/40";
    case "pending":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    default:
      return "bg-zinc-800 text-zinc-400 border-zinc-700";
  }
}

export default function WorkerDashboardContent({
  worker,
  stats,
  pendingJobs = [],
  recentJobs = [],
  activeContracts = [],
  greeting,
}: WorkerDashboardContentProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [availability, setAvailability] = useState<string>(worker.availability || "available");
  const [toggling, setToggling] = useState(false);
  const [selectedSheetJob, setSelectedSheetJob] = useState<any | null>(null);

  const isVerified = Boolean(worker.isVerified);
  const initials = (worker.fullName || "PR")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleToggleAvailability = async () => {
    if (toggling) return;
    setToggling(true);
    const targetStatus = availability === "available" ? "offline" : "available";
    setAvailability(targetStatus);

    try {
      let lat = null;
      let lng = null;
      if (typeof window !== "undefined" && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {}
      }

      await fetch("/api/worker/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availability: targetStatus,
          latitude: lat,
          longitude: lng,
          reason: targetStatus === "offline" ? "Taking a break" : "Back on active dispatch",
        }),
      });
      router.refresh();
    } catch (e) {
      console.error(e);
      setAvailability(availability);
    } finally {
      setToggling(false);
    }
  };

  const handleAccept = async (jobId: string) => {
    setAccepting(jobId);
    const result = await acceptJob(jobId);
    if (!result.success) alert(result.error);
    else {
      setSelectedSheetJob(null);
      router.refresh();
    }
    setAccepting(null);
  };

  const handleReject = async (jobId: string) => {
    setRejecting(jobId);
    const result = await rejectJob(jobId);
    if (!result.success) alert(result.error);
    else {
      setSelectedSheetJob(null);
      router.refresh();
    }
    setRejecting(null);
  };

  return (
    <div className="w-full pb-28 lg:pb-12 space-y-6">
      
      {/* ─────────────────────────────────────────────────────────────────
          MOBILE-NATIVE APPLICATION VIEW (Appears on screens < 1024px)
          Designed with Sixpay visual hierarchy & tactile micro-interactions
          ───────────────────────────────────────────────────────────────── */}
      <div className="lg:hidden space-y-4 px-1">
        
        {/* Mobile Header: Brand + Profile & Availability Indicator */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 rounded-full border-2 border-[#45BA50]/40 shadow-sm">
              {worker.avatarUrl && <AvatarImage src={worker.avatarUrl} alt={worker.fullName} />}
              <AvatarFallback className="bg-[#181d24] text-[#a4fe47] font-black text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                {greeting},
              </p>
              <h1 className="text-base font-black text-zinc-900 dark:text-white leading-tight">
                {worker.firstName}
              </h1>
            </div>
          </div>

          {/* Verification Badge */}
          {isVerified ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#45BA50]/15 border border-[#45BA50]/30 text-[#45BA50] text-[11px] font-bold">
              <RiShieldCheckFill className="w-3.5 h-3.5" />
              <span>Verified Pro</span>
            </div>
          ) : (
            <Link
              href="/worker/profile/settings?verify=1"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-bold"
            >
              <RiAlertFill className="w-3.5 h-3.5" />
              <span>Verify ID</span>
            </Link>
          )}
        </div>

        {/* Live Availability Toggle Switch (Mobile Hero Strip) */}
        <div
          onClick={handleToggleAvailability}
          className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-3.5 flex items-center justify-between shadow-md active:scale-[0.99] transition-transform cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div
              className={cx(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                availability === "available"
                  ? "bg-[#45BA50]/20 text-[#a4fe47]"
                  : "bg-zinc-800 text-zinc-400"
              )}
            >
              {toggling ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <RiRadarLine className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">
                  {availability === "available" ? "Active Dispatch" : "Taking a Break"}
                </span>
                <span
                  className={cx(
                    "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                    availability === "available"
                      ? "bg-[#45BA50]/20 text-[#a4fe47] border-[#45BA50]/40"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  )}
                >
                  {availability === "available" ? "Online" : "Offline"}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                {availability === "available"
                  ? "Visible to Dire Dawa clients for immediate work"
                  : "Dispatch paused · Switch to online when ready"}
              </p>
            </div>
          </div>

          {/* iOS Toggle Switch */}
          <div
            className={cx(
              "w-12 h-7 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0",
              availability === "available" ? "bg-[#45BA50]" : "bg-zinc-700"
            )}
          >
            <div
              className={cx(
                "h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200",
                availability === "available" ? "translate-x-5" : "translate-x-0"
              )}
            />
          </div>
        </div>

        {/* Real Net Earnings Card (Sixpay Minimalist Vibe) */}
        <div className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-black border border-zinc-800 p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-400">
              Total Net Payouts
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#a4fe47] bg-[#45BA50]/15 px-2 py-0.5 rounded-full border border-[#45BA50]/30">
              <RiPulseFill className="w-3 h-3" />
              Direct Chapa
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2">
            <p className="text-3xl font-black text-white tracking-tight">
              <CountUp to={stats.revenue} duration={1.2} separator="," />
            </p>
            <span className="text-sm font-bold text-zinc-400">ETB</span>
          </div>

          <p className="text-xs text-zinc-400 mt-1">
            {stats.completedJobs} jobs completed · Instant Telebirr / Bank settlement
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-800/80">
            <div className="rounded-2xl bg-zinc-800/40 p-2.5">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase">Active Contracts</p>
              <p className="text-lg font-black text-white mt-0.5">{stats.activeJobs}</p>
            </div>
            <div className="rounded-2xl bg-zinc-800/40 p-2.5">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase">Pending Inquiries</p>
              <p className="text-lg font-black text-[#a4fe47] mt-0.5">{stats.pendingJobs}</p>
            </div>
          </div>
        </div>

        {/* Mobile Quick Action Buttons (Touch Carousel) */}
        <div className="overflow-x-auto no-scrollbar -mx-2 px-2 py-1">
          <div className="flex items-center gap-3 min-w-max">
            <Link
              href="/worker/jobs"
              className="flex flex-col items-center group active:scale-95 transition-transform w-15"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-[#a4fe47] flex items-center justify-center shadow-sm">
                <RiBriefcaseFill className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mt-1.5 text-center truncate w-full">
                Browse
              </span>
            </Link>

            <Link
              href="/worker/contracts"
              className="flex flex-col items-center group active:scale-95 transition-transform w-15"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-cyan-400 flex items-center justify-center shadow-sm">
                <RiFileTextFill className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mt-1.5 text-center truncate w-full">
                Contracts
              </span>
            </Link>

            <Link
              href="/worker/contract-setup"
              className="flex flex-col items-center group active:scale-95 transition-transform w-15"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center shadow-sm">
                <RiLockPasswordFill className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mt-1.5 text-center truncate w-full">
                PIN Setup
              </span>
            </Link>

            <Link
              href="/worker/earnings"
              className="flex flex-col items-center group active:scale-95 transition-transform w-15"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-[#45BA50] flex items-center justify-center shadow-sm">
                <RiWallet3Fill className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mt-1.5 text-center truncate w-full">
                Earnings
              </span>
            </Link>

            <Link
              href="/worker/messages"
              className="flex flex-col items-center group active:scale-95 transition-transform w-15"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-sky-400 flex items-center justify-center shadow-sm">
                <RiChat3Fill className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mt-1.5 text-center truncate w-full">
                Messages
              </span>
            </Link>

            <Link
              href="/worker/support"
              className="flex flex-col items-center group active:scale-95 transition-transform w-15"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-purple-400 flex items-center justify-center shadow-sm">
                <RiCustomerService2Fill className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 mt-1.5 text-center truncate w-full">
                Support
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Active Contracts Carousel with Trade Imagery */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Active Engagements
            </h2>
            <Link
              href="/worker/contracts"
              className="text-xs font-bold text-[#45BA50] flex items-center gap-1 hover:underline"
            >
              View All ({activeContracts.length})
            </Link>
          </div>

          {activeContracts.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-2 px-2 pb-1">
              {activeContracts.map((contract: any) => {
                const bgImage = getTradePhoto(contract.job_title || contract.category);
                return (
                  <Link
                    key={contract.contract_id || contract.id}
                    href={`/worker/contracts/${contract.contract_id || contract.id}`}
                    className="relative shrink-0 w-72 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 p-4 shadow-lg group active:scale-98 transition-transform"
                  >
                    {/* Trade photo backdrop */}
                    <div
                      className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-40 group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url('${bgImage}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30 pointer-events-none" />

                    <div className="relative z-10 flex flex-col justify-between h-36">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#45BA50]/20 text-[#a4fe47] border border-[#45BA50]/40">
                          {contract.contract_status || "In Progress"}
                        </span>
                        <p className="text-sm font-black text-white">
                          {Number(contract.budget || 0).toLocaleString()} ETB
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white line-clamp-1">
                          {contract.job_title}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-6 w-6 border border-white/20">
                            {contract.client_avatar && <AvatarImage src={contract.client_avatar} />}
                            <AvatarFallback className="bg-[#45BA50] text-white text-[9px] font-bold">
                              {(contract.client_name || "C").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[11px] text-zinc-300 font-medium truncate">
                            {contract.client_name || "Direct Client"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-5 text-center bg-zinc-900/40">
              <RiBriefcaseLine className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
              <p className="text-xs font-bold text-zinc-300">No active contracts right now</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Keep dispatch radar online to accept jobs from clients.
              </p>
            </div>
          )}
        </div>

        {/* Mobile Pending Job Requests (Touch Cards) */}
        {pendingJobs.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                New Job Inquiries ({pendingJobs.length})
              </h2>
            </div>

            <div className="space-y-2.5">
              {pendingJobs.slice(0, 3).map((job: any) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/95 p-3.5 space-y-3 shadow-md"
                >
                  <div
                    className="flex items-start justify-between gap-2 cursor-pointer"
                    onClick={() => setSelectedSheetJob(job)}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{job.title}</p>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {job.client_name || "Client"} · {job.district || "Dire Dawa"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-[#a4fe47]">
                        {Number(job.budget || 0).toLocaleString()} ETB
                      </p>
                      <p className="text-[9px] text-zinc-500">Agreed Budget</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-9 rounded-xl text-xs font-bold border-rose-500/30 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                      onClick={() => handleReject(job.id)}
                      disabled={rejecting === job.id}
                    >
                      <RiCloseLine className="w-3.5 h-3.5 mr-1" /> Decline
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-9 rounded-xl text-xs font-bold bg-[#45BA50] hover:bg-[#3ba344] text-white cursor-pointer"
                      onClick={() => handleAccept(job.id)}
                      disabled={accepting === job.id}
                    >
                      <RiCheckDoubleLine className="w-3.5 h-3.5 mr-1" /> Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          DESKTOP WIDESCREEN VIEW (Appears on screens >= 1024px)
          Uses all available width with rich multi-column bento modules
          ───────────────────────────────────────────────────────────────── */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-6 w-full">
        
        {/* ── LEFT MAIN STREAM (8 COLUMNS) ───────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Artisan Command Banner with Real Trade Workbench Backdrop */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-[#0c0a17] min-h-[220px] p-7 shadow-2xl flex flex-col justify-between group">
            {/* Authentic Workshop Hero Image with Vignette */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-50 group-hover:scale-102 transition-transform duration-700"
              style={{ backgroundImage: "url('/images/worker_workbench_hero.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#a4fe47] bg-[#45BA50]/20 px-3 py-1 rounded-full border border-[#45BA50]/40">
                <RiFlashlightFill className="w-3.5 h-3.5" />
                Artisan Workbench
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-semibold">{greeting},</span>
                <span className="text-xs font-black text-white">{worker.firstName}</span>
              </div>
            </div>

            <div className="relative z-10 my-4 max-w-xl">
              <h1 className="text-2xl font-black text-white tracking-tight leading-snug">
                Welcome back, {worker.fullName}
              </h1>
              <p className="text-xs text-zinc-300 mt-1.5 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 text-zinc-400">
                  <RiMapPinFill className="w-3.5 h-3.5 text-[#45BA50]" />
                  {worker.district || "Dire Dawa"}
                </span>
                <span className="text-zinc-600">·</span>
                <span>{worker.skills.slice(0, 3).join(", ") || "Trades Professional"}</span>
                {worker.hourlyRate && (
                  <>
                    <span className="text-zinc-600">·</span>
                    <span className="text-[#a4fe47] font-bold">{worker.hourlyRate} ETB/hr</span>
                  </>
                )}
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3">
              <Button asChild size="default" className="rounded-xl bg-[#45BA50] hover:bg-[#3ba344] text-white font-bold px-5 h-10 shadow-lg shadow-[#45BA50]/20">
                <Link href="/worker/jobs">
                  <RiBriefcaseFill className="w-4 h-4 mr-1.5" /> Browse Client Requests
                </Link>
              </Button>
              <Button asChild size="default" variant="outline" className="rounded-xl border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-white font-semibold px-4 h-10">
                <Link href="/worker/contracts">
                  <RiFileTextFill className="w-4 h-4 mr-1.5 text-cyan-400" /> Active Contracts
                </Link>
              </Button>
            </div>
          </div>

          {/* Active Engagements Grid with Trade Backgrounds */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white tracking-tight">
                  Active Engagements & Contracts
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Direct client contracts currently in execution across Dire Dawa
                </p>
              </div>
              <Link
                href="/worker/contracts"
                className="text-xs font-bold text-[#45BA50] hover:text-[#a4fe47] flex items-center gap-1"
              >
                All Contracts ({activeContracts.length}) <RiArrowRightLine className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeContracts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeContracts.map((contract: any) => {
                  const bgImage = getTradePhoto(contract.job_title || contract.category);
                  return (
                    <Link
                      key={contract.contract_id || contract.id}
                      href={`/worker/contracts/${contract.contract_id || contract.id}`}
                      className="group relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 p-5 shadow-md hover:border-zinc-700 transition-all flex flex-col justify-between min-h-[170px]"
                    >
                      {/* Trade photo background */}
                      <div
                        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-30 group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: `url('${bgImage}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/40 pointer-events-none" />

                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#45BA50]/20 text-[#a4fe47] border border-[#45BA50]/40">
                          {contract.contract_status || "In Progress"}
                        </span>
                        <div className="text-right">
                          <p className="text-base font-black text-white">
                            {Number(contract.budget || 0).toLocaleString()} ETB
                          </p>
                          <p className="text-[10px] text-zinc-400">Contract Payment</p>
                        </div>
                      </div>

                      <div className="relative z-10 mt-3">
                        <h3 className="text-sm font-bold text-white group-hover:text-[#a4fe47] transition-colors line-clamp-1">
                          {contract.job_title}
                        </h3>
                        <div className="flex items-center gap-2.5 mt-2.5">
                          <Avatar className="h-7 w-7 border border-white/20">
                            {contract.client_avatar && <AvatarImage src={contract.client_avatar} />}
                            <AvatarFallback className="bg-[#45BA50] text-white text-[10px] font-bold">
                              {(contract.client_name || "C").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-zinc-300 font-medium truncate">
                            {contract.client_name || "Direct Client"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-900/40">
                <RiBriefcaseLine className="w-10 h-10 mx-auto text-zinc-600 mb-2.5" />
                <h3 className="text-sm font-bold text-white">No active contracts underway</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Browse open client inquiries or keep your dispatch radar active to receive immediate requests.
                </p>
                <Button asChild size="sm" className="mt-4 rounded-xl bg-[#45BA50] hover:bg-[#3ba344] text-white font-bold">
                  <Link href="/worker/jobs">Explore Available Jobs</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Pending Job Inquiries (Desktop Radar Cards) */}
          {pendingJobs.length > 0 && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                    Pending Job Inquiries
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                      {pendingJobs.length} New
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Clients requesting your verified artisan trades in Dire Dawa
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {pendingJobs.slice(0, 4).map((job: any) => (
                  <div
                    key={job.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Avatar className="h-10 w-10 border border-zinc-700 shrink-0">
                        {job.client_avatar && <AvatarImage src={job.client_avatar} />}
                        <AvatarFallback className="bg-zinc-800 text-[#a4fe47] font-bold text-xs">
                          {(job.client_name || "C").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{job.title}</p>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">
                          {job.client_name || "Client"} · {job.district || "Dire Dawa"} · {job.created_at ? new Date(job.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-black text-[#a4fe47]">
                          {Number(job.budget || 0).toLocaleString()} ETB
                        </p>
                        <p className="text-[10px] text-zinc-500">Proposed Budget</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-bold cursor-pointer"
                          onClick={() => handleReject(job.id)}
                          disabled={rejecting === job.id}
                        >
                          <RiCloseLine className="w-3.5 h-3.5 mr-1" /> Decline
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-xl bg-[#45BA50] hover:bg-[#3ba344] text-white text-xs font-bold cursor-pointer"
                          onClick={() => handleAccept(job.id)}
                          disabled={accepting === job.id}
                        >
                          <RiCheckDoubleLine className="w-3.5 h-3.5 mr-1" /> Accept Job
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance & Revenue Analytics */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl">
            <WorkerPerformanceAnalytics stats={stats} recentJobs={recentJobs} />
          </div>

          {/* Recent Jobs History Table */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-white tracking-tight">
                  Recent Work History
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Completed and verified artisan engagements
                </p>
              </div>
              <Link
                href="/worker/jobs"
                className="text-xs font-bold text-[#45BA50] hover:text-[#a4fe47] flex items-center gap-1"
              >
                View History <RiArrowRightLine className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentJobs.length > 0 ? (
              <div className="divide-y divide-zinc-800/80">
                {recentJobs.slice(0, 5).map((job: any) => (
                  <div key={job.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{job.title}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{job.client_name || "Direct Client"}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-xs font-bold text-white">
                        {Number(job.budget || 0).toLocaleString()} ETB
                      </p>
                      <Badge variant="outline" className={cx("text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border", statusBadgeStyle(job.status))}>
                        {job.status?.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-zinc-500">
                No recent jobs completed yet.
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT WORKBENCH CONTROL DOCK (4 COLUMNS) ─────────────────── */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Dispatch Radar & Live Availability Console */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <RiRadarLine className="w-4 h-4 text-[#45BA50]" />
                Dispatch Radar
              </span>
              <span
                className={cx(
                  "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border",
                  availability === "available"
                    ? "bg-[#45BA50]/20 text-[#a4fe47] border-[#45BA50]/40"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                )}
              >
                {availability === "available" ? "Active" : "Paused"}
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              When online, your profile is prominently surfaced to Dire Dawa clients searching for active trades.
            </p>

            <Button
              onClick={handleToggleAvailability}
              className={cx(
                "w-full h-11 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-md",
                availability === "available"
                  ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                  : "bg-[#45BA50] hover:bg-[#3ba344] text-white"
              )}
            >
              {toggling ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : availability === "available" ? (
                "Pause Dispatch (Go Offline)"
              ) : (
                "Go Online (Accept Work)"
              )}
            </Button>
          </div>

          {/* Real Earnings & Direct Chapa Payout Summary */}
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Direct Earnings
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#a4fe47] bg-[#45BA50]/15 px-2 py-0.5 rounded-full border border-[#45BA50]/30">
                Chapa Instant
              </span>
            </div>

            <div>
              <p className="text-3xl font-black text-white tracking-tight">
                <CountUp to={stats.revenue} duration={1.2} separator="," />
                <span className="text-xs font-bold text-zinc-400 ml-1.5">ETB</span>
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Net earnings released directly to your account
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Completed Contracts</span>
                <span className="font-bold text-white">{stats.completedJobs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Active Work</span>
                <span className="font-bold text-[#a4fe47]">{stats.activeJobs}</span>
              </div>
            </div>

            <Button asChild size="sm" variant="outline" className="w-full rounded-xl border-zinc-700 hover:bg-zinc-800 text-white font-bold h-9">
              <Link href="/worker/earnings">View Full Ledger</Link>
            </Button>
          </div>

          {/* Active Trade Skills & Rates */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <RiStarFill className="w-4 h-4 text-amber-400" />
                Verified Trade Skills
              </span>
              <Link
                href="/worker/profile/settings"
                className="text-[11px] font-bold text-[#45BA50] hover:underline"
              >
                Edit Rates
              </Link>
            </div>

            {worker.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {worker.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-800/70 px-2.5 py-1 text-xs font-semibold text-zinc-200"
                  >
                    <RiCheckboxCircleFill className="w-3.5 h-3.5 text-[#45BA50]" />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No skills selected yet.</p>
            )}
          </div>

          {/* Quick Tools Dock */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-5 shadow-xl space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-zinc-400 block mb-2">
              Workbench Shortcuts
            </span>

            <Link
              href="/worker/jobs"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <RiBriefcaseLine className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">
                  Browse All Jobs
                </span>
              </div>
              <RiArrowRightUpLine className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white" />
            </Link>

            <Link
              href="/worker/contracts"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <RiFileTextLine className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">
                  Contract Archive
                </span>
              </div>
              <RiArrowRightUpLine className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white" />
            </Link>

            <Link
              href="/worker/contract-setup"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <RiLockPasswordLine className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">
                  Security Signature PIN
                </span>
              </div>
              <RiArrowRightUpLine className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white" />
            </Link>

            <Link
              href="/worker/community"
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <RiSparklingFill className="w-4 h-4 text-[#45BA50]" />
                <span className="text-xs font-semibold text-zinc-300 group-hover:text-white">
                  Artisan Community Feed
                </span>
              </div>
              <RiArrowRightUpLine className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white" />
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────
          BOTTOM SHEET MODAL (Charles UX Physics: Spring drag-to-dismiss)
          ───────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedSheetJob && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSheetJob(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={SPRINGS.sheet}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setSelectedSheetJob(null);
              }}
              className="relative w-full max-w-lg bg-zinc-900 border-t border-zinc-800 rounded-t-[32px] p-6 pb-10 shadow-2xl z-10 space-y-4"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 rounded-full bg-zinc-700 mx-auto -mt-2 mb-2" />

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">{selectedSheetJob.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {selectedSheetJob.client_name || "Client"} · {selectedSheetJob.district || "Dire Dawa"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-[#a4fe47]">
                    {Number(selectedSheetJob.budget || 0).toLocaleString()} ETB
                  </p>
                  <p className="text-[10px] text-zinc-500">Agreed Budget</p>
                </div>
              </div>

              {selectedSheetJob.description && (
                <div className="rounded-2xl bg-zinc-800/50 p-4 border border-zinc-800 text-xs text-zinc-300 leading-relaxed max-h-48 overflow-y-auto">
                  {selectedSheetJob.description}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  size="default"
                  variant="outline"
                  className="flex-1 h-11 rounded-2xl text-xs font-bold border-rose-500/30 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  onClick={() => handleReject(selectedSheetJob.id)}
                  disabled={rejecting === selectedSheetJob.id}
                >
                  <RiCloseLine className="w-4 h-4 mr-1.5" /> Decline Request
                </Button>
                <Button
                  size="default"
                  className="flex-1 h-11 rounded-2xl text-xs font-bold bg-[#45BA50] hover:bg-[#3ba344] text-white cursor-pointer"
                  onClick={() => handleAccept(selectedSheetJob.id)}
                  disabled={accepting === selectedSheetJob.id}
                >
                  <RiCheckDoubleLine className="w-4 h-4 mr-1.5" /> Accept & Start
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
