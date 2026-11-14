"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CountUp from "@/components/ui/count-up";
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
  ChevronRight,
  Wrench,
  Paintbrush,
  Plug,
  Droplets,
  BarChart2,
  ShieldCheck,
  MapPin,
  Headphones,
  KeyRound,
  Sparkles,
  Check,
  ArrowRight,
  ShieldAlert,
  Phone,
  X,
  FileText,
  Lock,
} from "lucide-react";
import ClientPerformanceAnalytics from "@/components/client/ClientPerformanceAnalytics";
import { cx } from "@/utils/cx";

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
    desc: "Wiring, breaker repair & fixtures",
  },
  {
    label: "Plumbing",
    category: "plumbing",
    icon: <Droplets className="h-5 w-5" />,
    color: "from-blue-500/20 to-blue-500/5",
    iconBg: "bg-blue-500/15 text-blue-500",
    desc: "Pipes, leaks, drainage & pump fixes",
  },
  {
    label: "Painting",
    category: "painting",
    icon: <Paintbrush className="h-5 w-5" />,
    color: "from-pink-500/20 to-pink-500/5",
    iconBg: "bg-pink-500/15 text-pink-500",
    desc: "Interior & exterior coats & plaster",
  },
  {
    label: "Carpentry",
    category: "carpentry",
    icon: <Wrench className="h-5 w-5" />,
    color: "from-emerald-500/20 to-emerald-500/5",
    iconBg: "bg-emerald-500/15 text-[#45BA50]",
    desc: "Doors, cabinets, locks & woodwork",
  },
] as const;

/* ── Status styling ─────────────────────────────────────────────────── */
function statusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "in_progress":
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
    case "accepted":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "completed":
    case "paid":
      return "bg-primary/15 text-primary-600 dark:text-[#a4fe47] border-primary/30";
    case "pending":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "disputed":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    case "posted":
      return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function statusLabel(status?: string) {
  switch (status?.toLowerCase()) {
    case "in_progress":
      return "In Progress";
    case "accepted":
      return "Accepted";
    case "completed":
      return "Completed";
    case "paid":
      return "Paid";
    case "disputed":
      return "Disputed";
    case "pending":
      return "Pending";
    case "posted":
      return "Posted";
    default:
      return status || "Active";
  }
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

  const totalBudget = activeContracts.reduce((sum, c) => {
    const v = parseFloat(String(c.budget || "0").replace(/[^0-9.]/g, ""));
    return sum + (isNaN(v) ? 0 : v);
  }, 0);
  const uniqueWorkers = new Set(
    activeContracts.map((c) => c.worker_name || c.partner_name).filter(Boolean)
  ).size;
  const initials = userData.fullName ? userData.fullName.slice(0, 2).toUpperCase() : "CL";

  const clientStats = {
    totalSpent: totalBudget,
    activeHires: activeCount,
    completedProjects: recentJobs.filter((j) => j.status === "completed").length,
    disputesCount: 0,
  };

  const isVerified = Boolean(userData.identityVerified);
  const hasJobs = recentJobs.length > 0;
  const hasContracts = activeContracts.length > 0;
  const completedStepsCount = (isVerified ? 1 : 0) + (hasContracts ? 2 : hasJobs ? 1 : 0);

  return (
    <div className="w-full max-w-full pb-16 space-y-4 sm:space-y-6">
      {/* ── 0. IDENTITY VERIFICATION CALLOUT ── */}
      {!isVerified && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                {t("clientDashboard.identityCalloutTitle")}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-snug">
                {t("clientDashboard.identityCalloutDesc")}
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            className="rounded-full font-black bg-[#a4fe47] text-black hover:opacity-90 shadow-sm shrink-0 h-9 sm:h-10 px-4 text-xs touch-manipulation active:scale-[0.97]"
          >
            <Link href="/client/profile/settings?verify=1&returnTo=/client/dashboard">
              {t("worker.dashboard.submitId")}
            </Link>
          </Button>
        </motion.div>
      )}

      {/* ── 1. ACTIVE LIVE WORK HERO (Focal Object — Stageshow) ── */}
      {primaryContract ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setSelectedContract(primaryContract)}
          className={cx(
            "relative overflow-hidden rounded-3xl border border-emerald-500/30 shadow-lg p-5 sm:p-6 text-white cursor-pointer select-none",
            "bg-gradient-to-br from-[#0c130e] via-[#101b13] to-[#142318]",
            "active:scale-[0.99] transition-transform duration-100"
          )}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#45BA50]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Status Bar with Live Beacon */}
          <div className="flex items-center justify-between gap-2 mb-3.5 relative z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#45BA50]/20 text-[#a4fe47] text-[11px] sm:text-xs font-black uppercase tracking-wider border border-[#45BA50]/30 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#a4fe47] animate-pulse" />
                Live Job In Progress
              </span>
            </div>
            <span className="text-[11px] text-white/60 font-medium">
              Contract #{String(primaryContract.contract_id || primaryContract.id).slice(0, 8)}
            </span>
          </div>

          {/* Artisan & Job Title */}
          <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight truncate">
                {primaryContract.job_title}
              </h2>
              <p className="text-xs sm:text-sm text-white/70 mt-1 flex items-center gap-1.5">
                <span>Assigned Artisan:</span>
                <strong className="text-white font-bold">
                  {primaryContract.worker_name || primaryContract.partner_name || "Verified Pro"}
                </strong>
                <ShieldCheck className="h-3.5 w-3.5 text-[#45BA50]" />
              </p>
            </div>

            {/* Artisan Avatar */}
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-[#45BA50]/40 shrink-0 shadow-md">
              {(primaryContract.worker_avatar || primaryContract.partner_avatar) && (
                <AvatarImage src={primaryContract.worker_avatar || primaryContract.partner_avatar} />
              )}
              <AvatarFallback className="bg-[#18261b] text-[#a4fe47] font-black text-sm">
                {(primaryContract.worker_name || "WP").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative z-10 mb-4">
            <div className="flex items-center justify-between text-[11px] text-white/60 mb-1.5">
              <span>Escrow Protected</span>
              <span className="font-bold text-[#a4fe47]">
                {primaryContract.budget ? `${Number(primaryContract.budget).toLocaleString()} ETB` : "Agreed"}
              </span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "65%" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full bg-gradient-to-r from-[#45BA50] to-[#a4fe47] rounded-full"
              />
            </div>
          </div>

          {/* Quick 1-Tap Thumb Action Bar (Fitts's Law) */}
          <div className="flex items-center gap-2 pt-1 relative z-10">
            <Link
              href={`/contracts/${primaryContract.contract_id || primaryContract.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.96] text-xs font-bold text-white transition touch-manipulation"
            >
              <FileText className="h-4 w-4 text-[#a4fe47]" /> Contract Info
            </Link>
            <Link
              href="/client/messages"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#a4fe47] hover:bg-[#92ec38] active:scale-[0.96] text-xs font-black text-[#0c1407] transition touch-manipulation shadow-sm"
            >
              <MessageSquare className="h-4 w-4" /> Message Artisan
            </Link>
          </div>
        </motion.div>
      ) : (
        /* If No Active Contract: Inviting Hero Card */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cx(
            "relative overflow-hidden rounded-3xl border border-border/70 p-6 sm:p-7 shadow-sm group",
            "bg-gradient-to-br from-card via-card to-muted/40"
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2 max-w-lg">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#45BA50]/15 text-[#2d7f35] dark:text-[#a4fe47] text-xs font-black uppercase tracking-wider">
                <Zap className="h-3.5 w-3.5 text-[#45BA50]" />
                Dire Dawa Verified Hub
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {userData.greeting}, {userData.firstName || "Client"} 👋
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Need an electrician, plumber, or painter today? Hire Fayda-verified artisans backed by contract security and escrow guarantee.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
              <Button
                asChild
                className="rounded-full bg-[#a4fe47] hover:bg-[#92ec38] text-black font-black text-xs h-11 px-6 shadow-sm active:scale-[0.97] transition"
              >
                <Link href="/client/search">
                  <Search className="h-4 w-4 mr-1.5 stroke-[2.5]" /> Find an Artisan
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-border text-foreground font-bold text-xs h-11 px-5 active:scale-[0.97] transition"
              >
                <Link href="/client/search?view=map">
                  <MapPin className="h-4 w-4 mr-1.5 text-emerald-500" /> Map Search
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 2. QUICK ACTIONS 4-GRID APP DOCK (Mobile-App Touch Architecture) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <Link
          href="/client/search"
          className={cx(
            "p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 text-start shadow-2xs",
            "active:scale-[0.96] hover:border-[#45BA50]/50 transition-all duration-100 flex flex-col justify-between h-28 touch-manipulation group"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl bg-[#45BA50]/15 text-[#45BA50] dark:text-[#a4fe47] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Instant
            </span>
          </div>
          <div>
            <span className="text-xs sm:text-sm font-extrabold text-foreground block leading-tight">
              Book Artisan
            </span>
            <span className="text-[10px] text-muted-foreground">Nearby verified</span>
          </div>
        </Link>

        <Link
          href="/client/contracts"
          className={cx(
            "p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 text-start shadow-2xs",
            "active:scale-[0.96] hover:border-blue-500/50 transition-all duration-100 flex flex-col justify-between h-28 touch-manipulation group"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5 stroke-[2]" />
            </div>
            {activeCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500">
                {activeCount} Active
              </span>
            )}
          </div>
          <div>
            <span className="text-xs sm:text-sm font-extrabold text-foreground block leading-tight">
              My Contracts
            </span>
            <span className="text-[10px] text-muted-foreground">Legal & QR proof</span>
          </div>
        </Link>

        <Link
          href="/client/payments"
          className={cx(
            "p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 text-start shadow-2xs",
            "active:scale-[0.96] hover:border-indigo-500/50 transition-all duration-100 flex flex-col justify-between h-28 touch-manipulation group"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500">
              Chapa
            </span>
          </div>
          <div>
            <span className="text-xs sm:text-sm font-extrabold text-foreground block leading-tight">
              Escrow & Pay
            </span>
            <span className="text-[10px] text-muted-foreground">Telebirr / CBE</span>
          </div>
        </Link>

        <Link
          href="/client/support"
          className={cx(
            "p-3.5 sm:p-4 rounded-2xl bg-card border border-border/80 text-start shadow-2xs",
            "active:scale-[0.96] hover:border-purple-500/50 transition-all duration-100 flex flex-col justify-between h-28 touch-manipulation group"
          )}
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Headphones className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500">
              24/7
            </span>
          </div>
          <div>
            <span className="text-xs sm:text-sm font-extrabold text-foreground block leading-tight">
              Live Support
            </span>
            <span className="text-[10px] text-muted-foreground">Instant resolution</span>
          </div>
        </Link>
      </div>

      {/* ── 3. BENTO STATS SUMMARY (BoardUI Tokens) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Active Escrow Budget */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Active Escrow</p>
            <Lock className="h-4 w-4 text-[#45BA50]" />
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight text-[#2d7f35] dark:text-[#a4fe47]">
            <CountUp to={totalBudget} duration={1.2} separator="," />
            <span className="text-xs font-bold text-muted-foreground ml-1.5">ETB</span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-[#45BA50]" />
            <span>Held securely until completion</span>
          </p>
        </div>

        {/* Active Contracts Count */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Contracts</p>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-foreground">
            <CountUp to={activeCount} duration={1} />
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">In active progress</p>
        </div>

        {/* Hired Workers Count */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Artisans</p>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-foreground">
            <CountUp to={uniqueWorkers} duration={1} />
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Commissioned pros</p>
        </div>
      </div>

      {/* ── 4. POPULAR TRADE CATEGORIES (Horizontal App Carousel) ── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Find Trades in Dire Dawa
          </p>
          <Link
            href="/client/search"
            className="text-xs text-[#2d7f35] dark:text-[#a4fe47] font-bold flex items-center gap-0.5 hover:underline"
          >
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SERVICES.map((svc) => (
            <Link
              key={svc.category}
              href={`/client/search?category=${svc.category}`}
              className={cx(
                "flex items-center gap-3 p-3.5 rounded-2xl border border-border/80 bg-card",
                "hover:border-[#45BA50]/50 active:scale-95 transition-all touch-manipulation group shadow-2xs"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-muted text-[#45BA50] dark:text-[#a4fe47] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
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

      {/* ── 5. ACTIVE CONTRACTS LIST (Stacked Cards with Tap-To-Sheet) ── */}
      <div className="rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xs p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Work Agreements</p>
            <h3 className="text-xs sm:text-sm text-foreground font-bold mt-0.5">
              {activeCount > 0 ? `${activeCount} contract${activeCount > 1 ? "s" : ""} in progress` : "No ongoing contracts"}
            </h3>
          </div>
          <Link
            href="/client/contracts"
            className="text-xs text-[#2d7f35] dark:text-[#a4fe47] font-bold flex items-center gap-1 hover:underline"
          >
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {activeCount > 0 ? (
          <div className="space-y-3">
            {activeContracts.slice(0, 4).map((contract) => {
              const wi = (contract.worker_name || contract.partner_name || "W").slice(0, 2).toUpperCase();
              const contractId = contract.id || contract.contract_id;
              return (
                <div
                  key={contractId}
                  onClick={() => setSelectedContract(contract)}
                  className={cx(
                    "rounded-2xl border border-border/70 bg-muted/20 hover:bg-muted/40 p-3.5 sm:p-4 space-y-3",
                    "cursor-pointer active:scale-[0.98] transition-all touch-manipulation"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border border-border shrink-0 ring-1 ring-[#45BA50]/30">
                        {(contract.worker_avatar || contract.partner_avatar) && (
                          <AvatarImage src={contract.worker_avatar || contract.partner_avatar} />
                        )}
                        <AvatarFallback className="text-xs font-bold bg-muted">{wi}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{contract.job_title}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {contract.worker_name || contract.partner_name || "Assigned Pro"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${statusStyle(contract.job_status)}`}
                    >
                      {statusLabel(contract.job_status)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground">Budget: </span>
                      <span className="font-black text-[#2d7f35] dark:text-[#a4fe47]">
                        {contract.budget ? `${Number(contract.budget).toLocaleString()} ETB` : "—"}
                      </span>
                    </div>
                    <span className="text-xs text-[#2d7f35] dark:text-[#a4fe47] font-bold inline-flex items-center gap-0.5">
                      View Details <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 p-8 flex flex-col items-center justify-center text-center gap-2.5 bg-muted/10">
            <div className="h-12 w-12 rounded-full bg-muted text-[#45BA50] flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">No active work contracts</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
                Hire an electrician, plumber, or painter to start your digital contract with QR verification.
              </p>
            </div>
            <Button
              size="default"
              className="rounded-full bg-[#a4fe47] text-black hover:bg-[#92ec38] gap-1.5 mt-2 h-10 px-5 font-black touch-manipulation active:scale-95"
              asChild
            >
              <Link href="/client/search">
                <Plus className="h-4 w-4 stroke-[2.5]" /> Find a Pro Now
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── 6. PERFORMANCE & SPENDING ANALYTICS ── */}
      <ClientPerformanceAnalytics stats={clientStats} />

      {/* ── 7. RECENT REQUESTS & ACTIVITY ── */}
      {recentJobs.length > 0 && (
        <div className="rounded-3xl border border-border/80 bg-card text-card-foreground shadow-2xs p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Recent Job Posts</p>
            <span className="text-[11px] font-bold text-muted-foreground">{recentJobs.length} posted</span>
          </div>

          <div className="divide-y divide-border/60">
            {recentJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{job.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(job.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`rounded-full text-[9px] font-bold uppercase px-2.5 py-0.5 border shrink-0 ${statusStyle(job.status)}`}
                >
                  {statusLabel(job.status)}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 8. CHARLES UX INTERACTIVE BOTTOM SHEET DRAWER (Gesture-Driven) ── */}
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

            {/* Spring Sheet with Drag to Dismiss */}
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
              className="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto bg-card border-t border-border rounded-t-[32px] p-6 shadow-2xl pb-10"
            >
              {/* Drag Handle Indicator */}
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-5" />

              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#2d7f35] dark:text-[#a4fe47]">
                    Contract Agreement
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-foreground leading-tight truncate">
                    {selectedContract.job_title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground active:scale-90 transition shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Worker detail in Sheet */}
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-11 w-11 border border-border shrink-0 ring-2 ring-[#45BA50]/30">
                    {(selectedContract.worker_avatar || selectedContract.partner_avatar) && (
                      <AvatarImage src={selectedContract.worker_avatar || selectedContract.partner_avatar} />
                    )}
                    <AvatarFallback className="font-bold">
                      {(selectedContract.worker_name || "W").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {selectedContract.worker_name || selectedContract.partner_name || "Assigned Pro"}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-[#45BA50]" />
                      <span>Fayda Verified Artisan</span>
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${statusStyle(selectedContract.job_status)}`}
                >
                  {statusLabel(selectedContract.job_status)}
                </Badge>
              </div>

              {/* Escrow Guarantee Info */}
              <div className="flex items-center justify-between text-xs py-2 px-1 mb-5 border-b border-border/60">
                <span className="text-muted-foreground">Contract Budget:</span>
                <span className="font-black text-sm text-[#2d7f35] dark:text-[#a4fe47]">
                  {selectedContract.budget ? `${Number(selectedContract.budget).toLocaleString()} ETB` : "Agreed"}
                </span>
              </div>

              {/* Sheet Actions */}
              <div className="space-y-2">
                <Button
                  asChild
                  className="w-full h-12 rounded-2xl bg-[#a4fe47] hover:bg-[#92ec38] text-black font-black text-xs shadow-sm active:scale-[0.98] transition"
                >
                  <Link href={`/contracts/${selectedContract.contract_id || selectedContract.id}`}>
                    <FileText className="h-4 w-4 mr-2" /> View Full Legal Contract & Evidence PDF
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full h-11 rounded-2xl border-border text-foreground font-bold text-xs active:scale-[0.98] transition"
                >
                  <Link href="/client/messages">
                    <MessageSquare className="h-4 w-4 mr-2" /> Open Direct Chat
                  </Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
