"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { acceptJob, rejectJob } from "@/lib/actions/jobs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CountUp from "@/components/ui/count-up";
import FadeContent from "@/components/ui/fade-content";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  ChevronRight,
  Star,
  Zap,
  TrendingUp,
  Activity,
  ShieldCheck,
  MapPin,
  Bell,
  ChevronsUp,
  CheckCheck,
  X,
  BarChart3,
  FileText,
  MessageSquare,
  KeyRound,
  Headphones,
  Sparkles,
  Check,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import WorkerPerformanceAnalytics from "@/components/worker/WorkerPerformanceAnalytics";

interface WorkerDashboardContentProps {
  worker: {
    fullName: string;
    firstName: string;
    isVerified: boolean;
    district: string;
    skills: string[];
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
  greeting: string;
}

function statusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "in_progress": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "accepted":    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "completed":   return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    case "pending":     return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default:            return "bg-muted text-muted-foreground border-border";
  }
}

export default function WorkerDashboardContent({
  worker,
  stats,
  pendingJobs = [],
  recentJobs = [],
  greeting,
}: WorkerDashboardContentProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [availability, setAvailability] = useState<string>(worker.availability || "available");
  const [toggling, setToggling] = useState(false);

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
          reason: targetStatus === "offline" ? "Taking a break / Emergency" : "Back online",
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

  const initials = worker.fullName
    ? worker.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "PR";

  const completionRate =
    stats.completedJobs + stats.activeJobs > 0
      ? Math.round((stats.completedJobs / (stats.completedJobs + stats.activeJobs)) * 100)
      : 0;

  // Onboarding completion (out of 4)
  const isVerified = Boolean(worker.isVerified);
  const hasSkills = worker.skills.length > 0;
  const hasJobs = stats.activeJobs > 0 || stats.completedJobs > 0;
  const completedStepsCount = (isVerified ? 1 : 0) + (hasSkills ? 1 : 0) + (hasJobs ? 2 : 1);

  const handleAccept = async (jobId: string) => {
    setAccepting(jobId);
    const result = await acceptJob(jobId);
    if (!result.success) alert(result.error);
    else router.refresh();
    setAccepting(null);
  };

  const handleReject = async (jobId: string) => {
    setRejecting(jobId);
    const result = await rejectJob(jobId);
    if (!result.success) alert(result.error);
    else router.refresh();
    setRejecting(null);
  };

  return (
    <FadeContent blur duration={0.2} className="space-y-4 max-w-full pb-8">
      {/* ── 0. PROFILE-CONSISTENT LIVE ONLINE / OFFLINE TOGGLE SWITCH (Matches Profile Settings) ── */}
      <div
        onClick={handleToggleAvailability}
        className="rounded-[1.75rem] bg-[#f1f3f6] dark:bg-[#151a21] border border-outline-variant/30 p-3.5 sm:p-4 flex items-center justify-between shadow-sm cursor-pointer active:scale-[0.99] transition-all touch-manipulation group"
        title="Toggle online availability"
      >
        <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
          availability === "available" ? "bg-[#181d24] text-[#a4fe47]" : "bg-[#181d24] text-white"
        }`}>
          {toggling ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : availability === "available" ? (
            <Zap className="h-4 w-4 stroke-[2.2] fill-current" />
          ) : (
            <Clock className="h-4 w-4 stroke-[2]" />
          )}
        </div>
        <div className="flex-1 min-w-0 ml-3.5">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-bold text-foreground truncate">
              {availability === "available" ? t("worker.dashboard.status.online") : t("worker.dashboard.status.offline")}
            </p>
            <span className={`text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-full border ${
              availability === "available"
                ? "border-[#22c55e]/40 text-[#22c55e] bg-[#22c55e]/10"
                : "border-muted-foreground/30 text-muted-foreground bg-muted"
            }`}>
              {availability === "available" ? t("worker.dashboard.status.ready") : t("worker.dashboard.status.break")}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {availability === "available"
              ? t("worker.dashboard.status.visible")
              : t("worker.dashboard.status.paused")}
          </p>
        </div>
        {/* iOS-style toggle pill exactly matching profile */}
        <div
          className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 ml-3 ${
            availability === "available" ? "bg-[#a4fe47]" : "bg-[#d1d5db] dark:bg-gray-700"
          }`}
        >
          <div
            className={`h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
              availability === "available" ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
      </div>

      {/* ── 0. UNVERIFIED CALLOUT BANNER (Mobile Optimized) ─────────── */}
      {!isVerified && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{t("worker.dashboard.verifyRequiredTitle")}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {t("worker.dashboard.verifyRequiredDesc")}
              </p>
            </div>
          </div>
          <Button asChild size="default" className="rounded-xl font-semibold shrink-0 h-11 w-full sm:w-auto touch-manipulation bg-amber-600 hover:bg-amber-500 text-white">
            <Link href="/worker/profile/settings?verify=1">
              {t("worker.dashboard.submitId")}
            </Link>
          </Button>
        </div>
      )}

      {/* ── 1. THUMB-FRIENDLY QUICK ACTION CAROUSEL ─────────────────── */}
      {/* Mobile view (< 640px): 6 distinct circular icon buttons in a single touch-friendly scroll row */}
      <div className="sm:hidden overflow-x-auto no-scrollbar -mx-4 px-4 py-2">
        <div className="flex items-start gap-4 min-w-max">
          <Link
            href="/worker/jobs"
            className="flex flex-col items-center group active:scale-90 transition-transform touch-manipulation w-14"
          >
            <div className="w-12 h-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-indigo-400 border border-outline-variant/60 flex items-center justify-center shadow-sm group-hover:border-indigo-500/50">
              <Briefcase className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1.5 text-center leading-tight truncate w-full">
              {t("worker.dashboard.quick.browse")}
            </span>
          </Link>

          <Link
            href="/worker/contracts"
            className="flex flex-col items-center group active:scale-90 transition-transform touch-manipulation w-14"
          >
            <div className="w-12 h-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-emerald-400 border border-outline-variant/60 flex items-center justify-center shadow-sm group-hover:border-emerald-500/50">
              <FileText className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1.5 text-center leading-tight truncate w-full">
              {t("worker.dashboard.quick.contracts")}
            </span>
          </Link>

          <Link
            href="/worker/contract-setup"
            className="flex flex-col items-center group active:scale-90 transition-transform touch-manipulation w-14"
          >
            <div className="w-12 h-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-amber-400 border border-outline-variant/60 flex items-center justify-center shadow-sm group-hover:border-amber-500/50">
              <KeyRound className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1.5 text-center leading-tight truncate w-full">
              {t("worker.dashboard.quick.pin")}
            </span>
          </Link>

          <Link
            href="/worker/earnings"
            className="flex flex-col items-center group active:scale-90 transition-transform touch-manipulation w-14"
          >
            <div className="w-12 h-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-[#a3e635] border border-outline-variant/60 flex items-center justify-center shadow-sm group-hover:border-[#a3e635]/50">
              <Wallet className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1.5 text-center leading-tight truncate w-full">
              {t("worker.dashboard.quick.earnings")}
            </span>
          </Link>

          <Link
            href="/worker/messages"
            className="flex flex-col items-center group active:scale-90 transition-transform touch-manipulation w-14"
          >
            <div className="w-12 h-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-sky-400 border border-outline-variant/60 flex items-center justify-center shadow-sm group-hover:border-sky-500/50">
              <MessageSquare className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1.5 text-center leading-tight truncate w-full">
              {t("worker.dashboard.quick.messages")}
            </span>
          </Link>

          <Link
            href="/worker/support"
            className="flex flex-col items-center group active:scale-90 transition-transform touch-manipulation w-14"
          >
            <div className="w-12 h-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-violet-400 border border-outline-variant/60 flex items-center justify-center shadow-sm group-hover:border-violet-500/50">
              <Headphones className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1.5 text-center leading-tight truncate w-full">
              {t("worker.dashboard.quick.support")}
            </span>
          </Link>
        </div>
      </div>

      {/* Desktop view (>= 640px): Horizontal pill carousel */}
      <div className="hidden sm:block overflow-x-auto no-scrollbar -mx-2 px-2 py-1">
        <div className="flex items-center gap-2.5 min-w-max">
          <Link
            href="/worker/jobs"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 active:scale-95 transition-transform touch-manipulation"
          >
            <Briefcase className="h-4 w-4" />
            <span>{t("worker.dashboard.quick.browse")}</span>
          </Link>

          <Link
            href="/worker/contracts"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:border-indigo-500/40 active:scale-95 transition-all touch-manipulation"
          >
            <FileText className="h-4 w-4 text-emerald-400" />
            <span>{t("worker.dashboard.quick.contracts")}</span>
          </Link>

          <Link
            href="/worker/contract-setup"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:border-indigo-500/40 active:scale-95 transition-all touch-manipulation"
          >
            <KeyRound className="h-4 w-4 text-amber-400" />
            <span>{t("worker.dashboard.quick.pin")}</span>
          </Link>

          <Link
            href="/worker/earnings"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:border-indigo-500/40 active:scale-95 transition-all touch-manipulation"
          >
            <Wallet className="h-4 w-4 text-indigo-400" />
            <span>{t("worker.dashboard.quick.earnings")}</span>
          </Link>

          <Link
            href="/worker/messages"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:border-indigo-500/40 active:scale-95 transition-all touch-manipulation"
          >
            <MessageSquare className="h-4 w-4 text-sky-400" />
            <span>{t("worker.dashboard.quick.messages")}</span>
          </Link>

          <Link
            href="/worker/support"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:border-indigo-500/40 active:scale-95 transition-all touch-manipulation"
          >
            <Headphones className="h-4 w-4 text-violet-400" />
            <span>{t("worker.dashboard.quick.support")}</span>
          </Link>
        </div>
      </div>

      {/* ── 2. HERO + KPI PANEL ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Hero Card */}
        <div
          className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-amber-500/20 min-h-[200px] flex flex-col justify-between p-5 sm:p-7 shadow-xl group"
          style={{ background: "#0c0a17" }}
        >
          {/* Artisan Trades Workbench High-Visibility Hero Image */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-85 transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: "url('/images/worker_workbench_hero.jpg')" }}
          />
          {/* Vignette overlay: deep on left for text legibility, revealing tools on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a17]/95 via-[#0c0a17]/70 to-[#0c0a17]/25 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a17]/80 via-transparent to-black/30 pointer-events-none" />

          {/* Top worker identity strip */}
          <div className="flex items-center justify-between z-10 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-400/90">
              <Zap className="h-3 w-3 text-indigo-400" />
              {t("worker.dashboard.workbench")}
            </span>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[11px] text-white/50">{greeting}</p>
                <p className="text-xs font-bold text-white leading-none">{worker.firstName}</p>
              </div>
              <Avatar className="h-8 w-8 border border-indigo-500/40">
                <AvatarFallback className="bg-indigo-600 text-white font-bold text-xs">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="relative z-10 my-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              {t("worker.dashboard.welcome")}, {worker.firstName}
            </h1>
            <p className="text-xs text-white/60 mt-1 max-w-md leading-relaxed flex items-center gap-1.5 flex-wrap">
              <MapPin className="h-3 w-3 text-indigo-400 shrink-0" />
              <span>{worker.district || "Dire Dawa"}</span>
              {worker.skills.length > 0 && <span className="text-white/30">·</span>}
              <span>{worker.skills.slice(0, 3).join(", ") || "Trades Pro"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 z-10 pt-2 flex-wrap">
            <Button asChild size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 h-10 touch-manipulation">
              <Link href="/worker/jobs">
                <Briefcase className="h-3.5 w-3.5 mr-1.5" /> {t("worker.dashboard.browseJobs")}
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-xl border-white/20 text-white bg-white/5 hover:bg-white/10 font-semibold px-4 h-10 touch-manipulation">
              <Link href="/worker/contracts">
                {t("worker.dashboard.myContracts")}
              </Link>
            </Button>
          </div>
        </div>

        {/* Total Earned & KPI Stack */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          <div className="col-span-2 lg:col-span-1 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("worker.dashboard.totalPayouts")}</p>
              <Wallet className="h-4 w-4 text-indigo-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              <CountUp to={stats.revenue} duration={1.2} separator="," />
              <span className="text-xs font-semibold text-muted-foreground ml-1.5">ETB</span>
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{stats.completedJobs} completed · {t("worker.dashboard.directPayout")}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-1.5">
              <Bell className="h-4 w-4" />
            </div>
            <p className="text-xl font-black"><CountUp to={stats.pendingJobs} duration={1} /></p>
            <p className="text-[11px] text-muted-foreground font-medium">{t("worker.dashboard.pendingRequests")}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-1.5">
              <Activity className="h-4 w-4" />
            </div>
            <p className="text-xl font-black"><CountUp to={stats.activeJobs} duration={1} /></p>
            <p className="text-[11px] text-muted-foreground font-medium">{t("worker.dashboard.activeJobs")}</p>
          </div>
        </div>
      </div>

      {/* ── 3. WORKER ONBOARDING TRACKER (Feature Discovery) ────────── */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">Pro Setup Checklist</p>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {completedStepsCount} of 4 steps ready
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mb-4">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${Math.max(25, (completedStepsCount / 4) * 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Step 1: Verification */}
          <Link
            href="/worker/profile/settings?verify=1"
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all touch-manipulation ${
              isVerified ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/20 hover:border-indigo-500/40"
            }`}
          >
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isVerified ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground font-bold text-xs"
            }`}>
              {isVerified ? <Check className="h-4 w-4" /> : "1"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground flex items-center gap-1">
                Fayda / Kebele ID {isVerified && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {isVerified ? "Verified pro status active" : "Submit National / Kebele ID"}
              </p>
            </div>
          </Link>

          {/* Step 2: Contract PIN */}
          <Link
            href="/worker/contract-setup"
            className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:border-indigo-500/40 transition-all touch-manipulation"
          >
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              <KeyRound className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">Set Contract PIN</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                6-digit electronic signature PIN
              </p>
            </div>
          </Link>

          {/* Step 3: Skills & Hourly Rate */}
          <Link
            href="/worker/profile"
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all touch-manipulation ${
              hasSkills ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/20 hover:border-indigo-500/40"
            }`}
          >
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              hasSkills ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground font-bold text-xs"
            }`}>
              {hasSkills ? <Check className="h-4 w-4" /> : "3"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">Trade Skills & Rate</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {hasSkills ? `${worker.skills.length} skills listed` : "Set hourly rate & trades"}
              </p>
            </div>
          </Link>

          {/* Step 4: Chapa Direct Payouts */}
          <Link
            href="/worker/earnings"
            className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:border-indigo-500/40 transition-all touch-manipulation"
          >
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">Direct Telebirr / Bank</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                Zero escrow delays on completion
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── 4. MODERN PERFORMANCE & EARNINGS ANALYTICS ─────────────── */}
      <WorkerPerformanceAnalytics stats={stats} recentJobs={recentJobs} />

      {/* ── 5. PENDING JOB REQUESTS (Mobile Touch Cards) ─────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Inquiries</p>
            {pendingJobs.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold">
                <Bell className="h-3 w-3" /> {pendingJobs.length} new
              </span>
            )}
          </div>
        </div>

        {pendingJobs.length > 0 ? (
          <div className="space-y-3">
            {pendingJobs.slice(0, 6).map((job: any) => {
              const ci = (job.client_name || "C").slice(0, 2).toUpperCase();
              return (
                <div key={job.id} className="rounded-xl border border-border bg-muted/15 p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-9 w-9 border border-border shrink-0">
                        {job.client_avatar && <AvatarImage src={job.client_avatar} />}
                        <AvatarFallback className="text-xs font-bold bg-indigo-500/10 text-indigo-400">{ci}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{job.title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{job.client_name || "Client Inquiry"}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-extrabold text-foreground">{Number(job.budget || 0).toLocaleString()} ETB</p>
                      <p className="text-[9px] text-muted-foreground">Proposed Budget</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                    <Button
                      size="default"
                      variant="outline"
                      className="flex-1 h-10 rounded-xl text-xs font-bold gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10 touch-manipulation"
                      onClick={() => handleReject(job.id)}
                      disabled={rejecting === job.id}
                    >
                      <X className="h-3.5 w-3.5" /> Decline
                    </Button>
                    <Button
                      size="default"
                      className="flex-1 h-10 rounded-xl text-xs font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white touch-manipulation"
                      onClick={() => handleAccept(job.id)}
                      disabled={accepting === job.id}
                    >
                      <CheckCheck className="h-3.5 w-3.5" /> Accept Job
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 flex flex-col items-center justify-center text-center gap-2.5">
            <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <ChevronsUp className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">No pending job inquiries</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
                Keep your profile and skills updated so clients searching for trades in your district can reach you.
              </p>
            </div>
            <Button size="default" variant="outline" className="rounded-xl gap-1.5 mt-2 h-10 font-bold touch-manipulation" asChild>
              <Link href="/worker/profile">Update Profile & Skills</Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── 6. RECENT JOBS & SKILLS ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Jobs</p>
            <Link href="/worker/jobs" className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentJobs.length > 0 ? (
            <div className="divide-y divide-border">
              {recentJobs.slice(0, 5).map((job: any) => (
                <div key={job.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{job.title}</p>
                    <p className="text-[10px] text-muted-foreground">{job.client_name || "Client"}</p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-bold text-foreground">{Number(job.budget || 0).toLocaleString()} ETB</p>
                    </div>
                    <Badge variant="outline" className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusStyle(job.status)}`}>
                      {(job.status || "pending").replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">No recent jobs completed yet</p>
            </div>
          )}
        </div>

        {/* Worker Skills */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Trade Skills</p>
              <Star className="h-4 w-4 text-amber-400" />
            </div>

            {worker.skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 my-2">
                {worker.skills.map((skill: string) => (
                  <span key={skill} className="inline-flex items-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-400">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground my-2">No skills selected yet.</p>
            )}
          </div>

          <div className="pt-2">
            <Button asChild size="default" variant="outline" className="rounded-xl w-full h-10 text-xs font-bold touch-manipulation">
              <Link href="/worker/profile/settings">Edit Skills & Rates</Link>
            </Button>
          </div>
        </div>
      </div>
    </FadeContent>
  );
}
