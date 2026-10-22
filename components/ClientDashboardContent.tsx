"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CountUp from "@/components/ui/count-up";
import FadeContent from "@/components/ui/fade-content";
import {
  Search,
  Briefcase,
  CreditCard,
  MessageSquare,
  Plus,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  Users,
  Activity,
  ChevronRight,
  Wrench,
  Paintbrush,
  Plug,
  Droplets,
  MoreHorizontal,
  BarChart2,
  ShieldCheck,
  MapPin,
  Headphones,
  KeyRound,
  Sparkles,
  Check,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────── */
interface ClientDashboardContentProps {
  userData: {
    fullName: string;
    firstName: string;
    avatarUrl: string | null;
    greeting: string;
    identityVerified?: boolean;
    verificationStatus?: string;
  };
  activeContracts: any[];
  recentJobs: any[];
}

/* ── Service category cards ─────────────────────────────────────────── */
const SERVICES = [
  {
    label: "Electrical",
    category: "electrical",
    icon: <Plug className="h-5 w-5" />,
    color: "from-amber-500/20 to-amber-500/5",
    iconBg: "bg-amber-500/15 text-amber-500",
    desc: "Wiring, fixtures, repair",
  },
  {
    label: "Plumbing",
    category: "plumbing",
    icon: <Droplets className="h-5 w-5" />,
    color: "from-blue-500/20 to-blue-500/5",
    iconBg: "bg-blue-500/15 text-blue-500",
    desc: "Pipes, leaks, drainage",
  },
  {
    label: "Painting",
    category: "painting",
    icon: <Paintbrush className="h-5 w-5" />,
    color: "from-pink-500/20 to-pink-500/5",
    iconBg: "bg-pink-500/15 text-pink-500",
    desc: "Interior & exterior coats",
  },
  {
    label: "Carpentry",
    category: "carpentry",
    icon: <Wrench className="h-5 w-5" />,
    color: "from-emerald-500/20 to-emerald-500/5",
    iconBg: "bg-emerald-500/15 text-emerald-500",
    desc: "Doors, cabinets, framing",
  },
] as const;

/* ── Status styling ─────────────────────────────────────────────────── */
function statusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "in_progress": return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
    case "accepted":    return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "completed":
    case "paid":        return "bg-primary/15 text-primary-600 dark:text-[#a3e635] border-primary/30";
    case "pending":     return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "disputed":    return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    case "posted":      return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
    default:            return "bg-muted text-muted-foreground border-border";
  }
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function ClientDashboardContent({
  userData,
  activeContracts = [],
  recentJobs = [],
}: ClientDashboardContentProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const activeCount = activeContracts.length;

  const totalBudget = activeContracts.reduce((sum, c) => {
    const v = parseFloat(String(c.budget || "0").replace(/[^0-9.]/g, ""));
    return sum + (isNaN(v) ? 0 : v);
  }, 0);
  const uniqueWorkers = new Set(activeContracts.map((c) => c.worker_name || c.partner_name).filter(Boolean)).size;
  const initials      = userData.fullName ? userData.fullName.slice(0, 2).toUpperCase() : "CL";

  // Calculate onboarding progress (out of 4 steps)
  const isVerified = Boolean(userData.identityVerified);
  const hasJobs = recentJobs.length > 0;
  const hasContracts = activeContracts.length > 0;
  // Step 1: ID Verified, Step 2: Contract PIN configured, Step 3: Browse/Post, Step 4: Pay
  const completedStepsCount = (isVerified ? 1 : 0) + (hasContracts ? 2 : hasJobs ? 1 : 0);

  const statusLabel = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "in_progress": return "In Progress";
      case "accepted":    return "Accepted";
      case "completed":   return "Completed";
      case "paid":        return "Paid";
      case "disputed":    return "Disputed";
      case "pending":     return "Pending";
      case "posted":      return "Posted";
      default:            return status || "Active";
    }
  };

  return (
    <FadeContent blur duration={0.3} className="space-y-4 max-w-full pb-8">
      {/* ── 0. IDENTITY VERIFICATION CALLOUT (Mobile-Optimized) ──────── */}
      {!isVerified && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{t("clientDashboard.identityCalloutTitle")}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {t("clientDashboard.identityCalloutDesc")}
              </p>
            </div>
          </div>
          <Button asChild size="default" className="rounded-full font-black bg-[#a3e635] text-black hover:opacity-90 shadow-[0_4px_14px_rgba(163,230,53,0.3)] shrink-0 h-11 w-full sm:w-auto touch-manipulation">
            <Link href="/client/profile/settings?verify=1&returnTo=/client/dashboard">
              {t("worker.dashboard.submitId")}
            </Link>
          </Button>
        </div>
      )}

      {/* ── 1. QUICK ACTIONS: CIRCULAR ON MOBILE (Image 1 style) / PILLS ON DESKTOP ── */}
      {/* Mobile view (< 640px): Circular icon buttons like the setting icon with labels */}
      {/* Mobile view (< 640px): Circular icon carousel */}
      <div className="sm:hidden overflow-x-auto no-scrollbar -mx-2 px-3 py-2">
        <div className="flex items-start gap-4 min-w-max">
          <Link
            href="/client/search"
            className="flex flex-col items-center group active:scale-90 transition-transform touch-manipulation w-14"
          >
            <div className="w-12 h-12 rounded-full bg-[#a3e635] text-black flex items-center justify-center shadow-[0_4px_14px_rgba(163,230,53,0.35)]">
              <Plus className="h-5 w-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1.5 text-center leading-tight truncate w-full">
              {t("clientDashboard.findHirePro")}
            </span>
          </Link>

          <Link
            href="/client/search?view=map"
            className="flex flex-col items-center group active:scale-90 transition-transform touch-manipulation w-14"
          >
            <div className="w-12 h-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-emerald-400 border border-outline-variant/60 flex items-center justify-center shadow-sm">
              <MapPin className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1.5 text-center leading-tight truncate w-full">
              {t("clientDashboard.mapSearch")}
            </span>
          </Link>

          <Link
            href="/client/contract-setup"
            className="flex flex-col items-center group active:scale-90 transition-transform touch-manipulation w-14"
          >
            <div className="w-12 h-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-amber-400 border border-outline-variant/60 flex items-center justify-center shadow-sm">
              <KeyRound className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1.5 text-center leading-tight truncate w-full">
              {t("clientDashboard.contractPin")}
            </span>
          </Link>

          <Link
            href="/client/payments"
            className="flex flex-col items-center group active:scale-90 transition-transform touch-manipulation w-14"
          >
            <div className="w-12 h-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-indigo-400 border border-outline-variant/60 flex items-center justify-center shadow-sm">
              <CreditCard className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1.5 text-center leading-tight truncate w-full">
              {t("nav.payments")}
            </span>
          </Link>

          <Link
            href="/client/messages"
            className="flex flex-col items-center group active:scale-90 transition-transform touch-manipulation w-14"
          >
            <div className="w-12 h-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-sky-400 border border-outline-variant/60 flex items-center justify-center shadow-sm">
              <MessageSquare className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1.5 text-center leading-tight truncate w-full">
              {t("nav.chat")}
            </span>
          </Link>

          <Link
            href="/client/support"
            className="flex flex-col items-center group active:scale-90 transition-transform touch-manipulation w-14"
          >
            <div className="w-12 h-12 rounded-full bg-[#181d24] dark:bg-[#1e2329] text-violet-400 border border-outline-variant/60 flex items-center justify-center shadow-sm">
              <Headphones className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1.5 text-center leading-tight truncate w-full">
              {t("clientDashboard.liveSupport")}
            </span>
          </Link>
        </div>
      </div>

      {/* Desktop view (>= 640px): Horizontal pill carousel */}
      <div className="hidden sm:block overflow-x-auto no-scrollbar -mx-2 px-2 py-1">
        <div className="flex items-center gap-2.5 min-w-max">
          <Link
            href="/client/search"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#a3e635] text-black text-xs font-black shadow-[0_4px_16px_rgba(163,230,53,0.3)] hover:opacity-95 active:scale-95 transition-all touch-manipulation"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>{t("clientDashboard.findHirePro")}</span>
          </Link>

          <Link
            href="/client/search?view=map"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border/70 text-foreground text-xs font-bold hover:bg-muted active:scale-95 transition-all touch-manipulation shadow-xs"
          >
            <MapPin className="h-4 w-4 text-emerald-500" />
            <span>{t("clientDashboard.mapSearch")}</span>
          </Link>

          <Link
            href="/client/contract-setup"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border/70 text-foreground text-xs font-bold hover:bg-muted active:scale-95 transition-all touch-manipulation shadow-xs"
          >
            <KeyRound className="h-4 w-4 text-amber-500" />
            <span>{t("clientDashboard.contractPin")}</span>
          </Link>

          <Link
            href="/client/payments"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border/70 text-foreground text-xs font-bold hover:bg-muted active:scale-95 transition-all touch-manipulation shadow-xs"
          >
            <CreditCard className="h-4 w-4 text-indigo-500" />
            <span>{t("clientDashboard.directPayments")}</span>
          </Link>

          <Link
            href="/client/messages"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border/70 text-foreground text-xs font-bold hover:bg-muted active:scale-95 transition-all touch-manipulation shadow-xs"
          >
            <MessageSquare className="h-4 w-4 text-sky-500" />
            <span>{t("nav.chat")}</span>
          </Link>

          <Link
            href="/client/support"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border/70 text-foreground text-xs font-bold hover:bg-muted active:scale-95 transition-all touch-manipulation shadow-xs"
          >
            <Headphones className="h-4 w-4 text-violet-500" />
            <span>{t("clientDashboard.liveSupport")}</span>
          </Link>
        </div>
      </div>

      {/* ── 2. HERO + KEY STATS (Mobile Stack) ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Hero Card */}
        <div
          className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-border/70 min-h-[210px] flex flex-col justify-between p-6 sm:p-7 shadow-xl"
          style={{
            background: "radial-gradient(ellipse at top left, #121c17 0%, #0a1410 50%, #060b09 100%)",
          }}
        >
          {/* Dire Dawa Contextual Backdrop with Dark Editorial Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-20 dark:opacity-15 mix-blend-luminosity"
            style={{ backgroundImage: "url('/images/diredawa_banner.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060b09]/95 via-[#060b09]/80 to-[#060b09]/60 pointer-events-none" />

          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#a3e635]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-40 h-40 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />

          {/* Top greeting on mobile */}
          <div className="flex items-center justify-between z-10 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#a3e635]">
              <Zap className="h-3 w-3 text-[#a3e635]" />
              {t("clientDashboard.commandHub")}
            </span>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[11px] text-white/50">{userData.greeting}</p>
                <p className="text-xs font-bold text-white leading-none">{userData.firstName || "Client"}</p>
              </div>
              <Avatar className="h-8 w-8 border border-[#a3e635]/40">
                {userData.avatarUrl && <AvatarImage src={userData.avatarUrl} alt={userData.fullName} />}
                <AvatarFallback className="bg-[#a3e635] text-black font-bold text-xs">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="relative z-10 my-2">
            <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
              {t("clientDashboard.heroTitle")}
            </h1>
            <p className="text-xs text-white/60 mt-1 max-w-md leading-relaxed">
              {t("clientDashboard.heroSubtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2.5 z-10 pt-2 flex-wrap">
            <Link
              href="/client/search"
              className="rounded-full bg-[#a3e635] hover:opacity-95 text-black font-black text-xs px-5 h-11 flex items-center shadow-[0_4px_16px_rgba(163,230,53,0.3)] active:scale-[0.98] transition-all touch-manipulation"
            >
              <Search className="h-3.5 w-3.5 mr-1.5 stroke-[2.5]" /> {t("clientDashboard.findProNear")}
            </Link>
            <Link
              href="/client/contracts"
              className="rounded-full border border-white/20 text-white bg-white/5 hover:bg-white/10 font-bold text-xs px-5 h-11 flex items-center active:scale-[0.98] transition-all touch-manipulation"
            >
              {t("profile.menu.myContracts")}
            </Link>
          </div>
        </div>

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          {/* Total Budget Card - Theme Aware */}
          <div className="col-span-2 lg:col-span-1 rounded-3xl border border-border/70 bg-card text-card-foreground dark:bg-[#0e141d] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Budget</p>
              <BarChart2 className="h-4 w-4 text-[#84cc16] dark:text-[#a3e635]" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-[#84cc16] dark:text-[#a3e635]">
              <CountUp to={totalBudget} duration={1.2} separator="," />
              <span className="text-xs font-bold text-muted-foreground ml-1.5">ETB</span>
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{activeCount} active digital contract{activeCount !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Quick Counter Cards (2 cols on all devices) */}
          <div className="rounded-3xl border border-border/70 bg-card text-card-foreground dark:bg-[#0e141d] p-4 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[#a3e635]/15 text-emerald-600 dark:text-[#a3e635] flex items-center justify-center mb-2">
              <Briefcase className="h-4 w-4" />
            </div>
            <p className="text-xl font-black text-foreground"><CountUp to={activeCount} duration={1} /></p>
            <p className="text-[11px] text-muted-foreground font-medium">Active Contracts</p>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card text-card-foreground dark:bg-[#0e141d] p-4 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-2">
              <Users className="h-4 w-4" />
            </div>
            <p className="text-xl font-black text-foreground"><CountUp to={uniqueWorkers} duration={1} /></p>
            <p className="text-[11px] text-muted-foreground font-medium">Hired Workers</p>
          </div>
        </div>
      </div>

      {/* ── 3. FIRST-TIME USER ONBOARDING TRACKER (Feature Discovery) ─ */}
      <div className="rounded-3xl border border-outline-variant/60 bg-card text-card-foreground dark:bg-[#0e141d] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#84cc16] dark:text-[#a3e635]" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Getting Started Guide</p>
          </div>
          <span className="text-[11px] font-bold text-[#84cc16] dark:text-[#a3e635]">
            {completedStepsCount} of 4 completed
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-muted dark:bg-surface-container overflow-hidden mb-4">
          <div
            className="h-full bg-[#a3e635] transition-all duration-500 shadow-[0_0_8px_rgba(163,230,53,0.4)]"
            style={{ width: `${Math.max(25, (completedStepsCount / 4) * 100)}%` }}
          />
        </div>

        {/* 4 Interactive Step Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Step 1: Verification */}
          <Link
            href="/client/profile/settings?verify=1"
            className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all touch-manipulation active:scale-[0.98] ${
              isVerified ? "border-[#a3e635]/40 bg-[#a3e635]/10" : "border-outline-variant/60 bg-muted/30 hover:bg-muted/50 dark:bg-surface-container/60 hover:border-[#a3e635]/40"
            }`}
          >
            <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              isVerified ? "bg-[#a3e635] text-black" : "bg-muted text-muted-foreground font-bold text-xs"
            }`}>
              {isVerified ? <Check className="h-4 w-4 stroke-[2.5]" /> : "1"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground flex items-center gap-1">
                Verify Identity {isVerified && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {isVerified ? "Fayda ID approved" : "Upload Kebele / Fayda ID"}
              </p>
            </div>
          </Link>

          {/* Step 2: Contract PIN */}
          <Link
            href="/client/contract-setup"
            className="flex items-start gap-3 p-3.5 rounded-2xl border border-outline-variant/60 bg-muted/30 hover:bg-muted/50 dark:bg-surface-container/60 hover:border-[#a3e635]/40 transition-all touch-manipulation active:scale-[0.98]"
          >
            <div className="h-7 w-7 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              <KeyRound className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">Set Contract PIN</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                4-digit electronic signing PIN
              </p>
            </div>
          </Link>

          {/* Step 3: Browse Map & Hire */}
          <Link
            href="/client/search"
            className="flex items-start gap-3 p-3.5 rounded-2xl border border-outline-variant/60 bg-muted/30 hover:bg-muted/50 dark:bg-surface-container/60 hover:border-[#a3e635]/40 transition-all touch-manipulation active:scale-[0.98]"
          >
            <div className="h-7 w-7 rounded-full bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              <Search className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">Discover Skilled Pros</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                Map view or trade categories
              </p>
            </div>
          </Link>

          {/* Step 4: Chapa Direct Payment */}
          <Link
            href="/client/payments"
            className="flex items-start gap-3 p-3.5 rounded-2xl border border-outline-variant/60 bg-muted/30 hover:bg-muted/50 dark:bg-surface-container/60 hover:border-[#a3e635]/40 transition-all touch-manipulation active:scale-[0.98]"
          >
            <div className="h-7 w-7 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              <CreditCard className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">Direct Chapa Billing</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                Telebirr / CBE Birr receipt proof
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── 4. POPULAR TRADE CATEGORIES (Mobile Horizontal Chips) ───── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Find Trades Near You</p>
          <Link href="/client/search" className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SERVICES.map((svc) => (
            <Link
              key={svc.category}
              href={`/client/search?category=${svc.category}`}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-outline-variant/60 bg-card hover:border-[#a3e635]/60 hover:shadow-md active:scale-95 transition-all touch-manipulation group"
            >
              <div className="w-11 h-11 rounded-full bg-[#12161f] dark:bg-[#181d24] text-[#a3e635] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                {svc.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-foreground truncate">{svc.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{svc.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 5. HUB AND SPOKE OVERVIEW CARDS (Mobile-First 2-Col Grid) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Spoke 1: Pro Discovery & Map */}
        <div className="rounded-3xl border border-outline-variant/60 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#12161f] dark:bg-[#181d24] text-[#a3e635] flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground">Interactive Map Discovery</p>
                  <p className="text-xs text-muted-foreground">Find vetted workers closest to your location</p>
                </div>
              </div>
            </div>

            <div className="relative my-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Electrician in Kezira, Dire Dawa..."
                className="pl-9 h-11 rounded-full bg-background border-outline-variant/60 text-xs touch-manipulation"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href={`/client/search?q=${encodeURIComponent(searchQuery)}`}
              className="rounded-full bg-[#a3e635] text-black font-extrabold flex-1 h-10 text-xs flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-sm touch-manipulation"
            >
              Search Workers
            </Link>
            <Link
              href="/client/search?view=map"
              className="rounded-full border border-outline-variant text-on-surface font-bold h-10 px-4 text-xs flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all touch-manipulation"
            >
              Open Map
            </Link>
          </div>
        </div>

        {/* Spoke 2: Smart Digital Contracts */}
        <div className="rounded-3xl border border-outline-variant/60 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#12161f] dark:bg-[#181d24] text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground">Digital Contracts Hub</p>
                  <p className="text-xs text-muted-foreground">2-party signed electronic agreements with audit hash</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 dark:text-[#a3e635] border-emerald-500/30 bg-emerald-500/10 rounded-full">
                {activeCount} Active
              </Badge>
            </div>

            <div className="bg-muted/40 dark:bg-muted/20 rounded-2xl p-3 border border-border/60 my-2 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Contract Security PIN:</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <KeyRound className="h-3 w-3 text-amber-500" /> Configured
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tamper Protection:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">SHA-256 + QR Verified</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/client/contracts"
              className="rounded-full bg-[#a3e635] text-black font-extrabold flex-1 h-10 text-xs flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-sm touch-manipulation"
            >
              View All Contracts
            </Link>
            <Link
              href="/client/contract-setup"
              className="rounded-full border border-outline-variant text-on-surface font-bold h-10 px-4 text-xs flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all touch-manipulation"
            >
              PIN Settings
            </Link>
          </div>
        </div>

        {/* Spoke 3: Chapa Direct Payments & Invoices */}
        <div className="rounded-3xl border border-outline-variant/60 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#12161f] dark:bg-[#181d24] text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground">Direct Billing (Chapa)</p>
                  <p className="text-xs text-muted-foreground">Direct non-escrow payment to workers with receipts</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/5 rounded-full">
                Telebirr / CBE
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground my-2 leading-relaxed">
              Payments go directly from your mobile wallet or bank to the skilled worker upon milestone completion. Download verified receipts anytime.
            </p>
          </div>

          <div className="pt-1">
            <Link
              href="/client/payments"
              className="rounded-full bg-[#a3e635] text-black font-extrabold w-full h-10 text-xs flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-sm touch-manipulation"
            >
              Manage Invoices & Receipts
            </Link>
          </div>
        </div>

        {/* Spoke 4: Real-Time Chat & Support */}
        <div className="rounded-3xl border border-outline-variant/60 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#12161f] dark:bg-[#181d24] text-violet-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Headphones className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-foreground">Support & Direct Chat</p>
                  <p className="text-xs text-muted-foreground">Instant resolution with live audio chime updates</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>

            <p className="text-xs text-muted-foreground my-2 leading-relaxed">
              Have questions about a contract or need assistance? Open a support ticket with our team or chat with your hired workers in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href="/client/support"
              className="rounded-full border border-outline-variant text-on-surface font-bold flex-1 h-10 text-xs flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all touch-manipulation"
            >
              <Headphones className="h-3.5 w-3.5 mr-1.5" /> Support Tickets
            </Link>
            <Link
              href="/client/messages"
              className="rounded-full border border-outline-variant text-on-surface font-bold flex-1 h-10 text-xs flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all touch-manipulation"
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Messages
            </Link>
          </div>
        </div>
      </div>

      {/* ── 6. ACTIVE CONTRACTS (Theme-Aware: Mobile Card List + Desktop Table) ─ */}
      <div className="rounded-3xl border border-outline-variant/60 bg-card text-card-foreground dark:bg-[#0e141d] shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Work Agreements</p>
            <p className="text-xs text-foreground font-semibold mt-0.5">
              {activeCount > 0 ? `${activeCount} contract${activeCount > 1 ? "s" : ""} in progress` : "No ongoing contracts"}
            </p>
          </div>
          <Link href="/client/contracts" className="text-xs text-[#84cc16] dark:text-[#a3e635] font-bold flex items-center gap-1 hover:underline">
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {activeCount > 0 ? (
          <div>
            {/* MOBILE VIEW (< 640px): Stacked Cards with 44px+ touch targets */}
            <div className="sm:hidden space-y-3">
              {activeContracts.slice(0, 4).map((contract) => {
                const wi = (contract.worker_name || contract.partner_name || "W").slice(0, 2).toUpperCase();
                const contractId = contract.id || contract.contract_id;
                return (
                  <div key={contractId} className="rounded-2xl border border-outline-variant/60 bg-muted/30 dark:bg-surface-container/60 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-10 w-10 border border-outline-variant/60 shrink-0 ring-2 ring-[#a3e635]/15">
                          {(contract.worker_avatar || contract.partner_avatar) && (
                            <AvatarImage src={contract.worker_avatar || contract.partner_avatar} />
                          )}
                          <AvatarFallback className="text-xs font-bold bg-muted dark:bg-surface-container">{wi}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{contract.job_title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{contract.worker_name || contract.partner_name || "Assigned Pro"}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${statusStyle(contract.job_status)}`}>
                        {statusLabel(contract.job_status)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/40 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Budget: </span>
                        <span className="font-extrabold text-[#84cc16] dark:text-[#a3e635]">{contract.budget ? `${Number(contract.budget).toLocaleString()} ETB` : "—"}</span>
                      </div>
                      <Link
                        href={`/contracts/${contractId}`}
                        className="rounded-full bg-[#a3e635] text-black h-9 px-4 text-xs font-black inline-flex items-center shadow-sm hover:opacity-90 active:scale-95 transition-all touch-manipulation"
                      >
                        View Details <ArrowRight className="h-3 w-3 ml-1 stroke-[2.5]" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW (>= 640px): Clean Table Layout */}
            <div className="hidden sm:block rounded-2xl border border-outline-variant/60 overflow-hidden bg-muted/20 dark:bg-surface-container/40">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/40 dark:bg-surface-container-high border-b border-outline-variant/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span className="col-span-5">Worker / Job</span>
                <span className="col-span-3">Status</span>
                <span className="col-span-2">Budget</span>
                <span className="col-span-2 text-right">Action</span>
              </div>
              <div className="divide-y divide-outline-variant/40">
                {activeContracts.slice(0, 5).map((contract) => {
                  const wi = (contract.worker_name || contract.partner_name || "W").slice(0, 2).toUpperCase();
                  const contractId = contract.id || contract.contract_id;
                  return (
                    <div key={contractId} className="grid grid-cols-12 gap-2 items-center px-4 py-3.5 hover:bg-muted/30 dark:hover:bg-surface-container/60 transition-colors">
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 border border-outline-variant/60 shrink-0 ring-1 ring-[#a3e635]/20">
                          {(contract.worker_avatar || contract.partner_avatar) && (
                            <AvatarImage src={contract.worker_avatar || contract.partner_avatar} />
                          )}
                          <AvatarFallback className="text-[10px] font-bold bg-muted dark:bg-surface-container">{wi}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-foreground">{contract.job_title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{contract.worker_name || contract.partner_name}</p>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <Badge variant="outline" className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${statusStyle(contract.job_status)}`}>
                          {statusLabel(contract.job_status)}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-black text-[#84cc16] dark:text-[#a3e635]">{contract.budget ? `${Number(contract.budget).toLocaleString()}` : "—"}</p>
                        <p className="text-[9px] text-muted-foreground">ETB</p>
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Link
                          href={`/contracts/${contractId}`}
                          className="h-8 text-xs font-black rounded-full px-3 text-[#84cc16] dark:text-[#a3e635] hover:bg-[#a3e635]/10 inline-flex items-center transition-colors"
                        >
                          Open <ArrowUpRight className="h-3.5 w-3.5 ml-1 stroke-[2.5]" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-outline-variant/60 p-8 flex flex-col items-center justify-center text-center gap-2.5 bg-muted/20 dark:bg-surface-container/30">
            <div className="h-12 w-12 rounded-full bg-[#181d24] text-[#a3e635] flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">No active work contracts</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
                When you hire an electrician, plumber, or painter, your digital contract with QR verification will show here.
              </p>
            </div>
            <Button size="default" className="rounded-full bg-[#a3e635] text-black hover:opacity-90 shadow-[0_4px_14px_rgba(163,230,53,0.3)] gap-1.5 mt-2 h-11 px-6 font-black touch-manipulation" asChild>
              <Link href="/client/search">
                <Plus className="h-4 w-4 stroke-[2.5]" /> Find a Pro Now
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── 7. RECENT REQUESTS & ACTIVITY (Theme-Aware) ─────────────── */}
      {recentJobs.length > 0 && (
        <div className="rounded-3xl border border-outline-variant/60 bg-card text-card-foreground dark:bg-[#0e141d] shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Job Posts</p>
            <span className="text-[11px] font-bold text-muted-foreground">{recentJobs.length} posted</span>
          </div>

          <div className="divide-y divide-outline-variant/40">
            {recentJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{job.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(job.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <Badge variant="outline" className={`rounded-full text-[9px] font-bold uppercase px-2.5 py-0.5 border shrink-0 ${statusStyle(job.status)}`}>
                  {statusLabel(job.status)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </FadeContent>
  );
}
