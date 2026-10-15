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
    case "in_progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "accepted":    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "completed":   return "bg-primary/10 text-primary border-primary/20";
    case "pending":     return "bg-amber-500/10 text-amber-500 border-amber-500/20";
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

  const activeCount   = activeContracts.length;
  const totalBudget   = activeContracts.reduce((sum, c) => {
    const v = parseFloat(String(c.budget || "0").replace(/[^0-9.]/g, ""));
    return sum + (isNaN(v) ? 0 : v);
  }, 0);
  const uniqueWorkers = new Set(activeContracts.map((c) => c.worker_name || c.partner_name).filter(Boolean)).size;
  const initials      = userData.fullName ? userData.fullName.slice(0, 2).toUpperCase() : "CL";

  // Calculate onboarding progress (out of 4 steps)
  const isVerified = Boolean(userData.identityVerified);
  const hasJobs = recentJobs.length > 0;
  const hasContracts = activeContracts.length > 0;
  // Step 1: ID Verified, Step 2: Contract PIN configured (estimated/prompted), Step 3: Browse/Post, Step 4: Pay
  const completedStepsCount = (isVerified ? 1 : 0) + (hasContracts ? 2 : hasJobs ? 1 : 0);

  const statusLabel = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "in_progress": return "In Progress";
      case "accepted": return "Accepted";
      case "completed": return "Completed";
      case "pending": return "Pending";
      case "posted": return "Posted";
      default: return status || "Active";
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
              <p className="text-sm font-bold text-foreground">Complete Your Identity Verification</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Fayda or Kebele ID verification protects you and allows seamless electronic contract signing.
              </p>
            </div>
          </div>
          <Button asChild size="default" className="rounded-xl font-semibold shrink-0 h-11 w-full sm:w-auto touch-manipulation">
            <Link href="/client/profile/settings?verify=1&returnTo=/client/dashboard">
              Verify ID Now
            </Link>
          </Button>
        </div>
      )}

      {/* ── 1. THUMB-FRIENDLY QUICK ACTION CAROUSEL (Mobile First) ────── */}
      <div className="overflow-x-auto no-scrollbar -mx-2 px-2 py-1">
        <div className="flex items-center gap-2.5 min-w-max">
          <Link
            href="/client/search"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm shadow-primary/20 active:scale-95 transition-transform touch-manipulation"
          >
            <Plus className="h-4 w-4" />
            <span>Find & Hire Pro</span>
          </Link>

          <Link
            href="/client/search?view=map"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:border-primary/40 active:scale-95 transition-all touch-manipulation"
          >
            <MapPin className="h-4 w-4 text-emerald-500" />
            <span>Map Search</span>
          </Link>

          <Link
            href="/client/contract-setup"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:border-primary/40 active:scale-95 transition-all touch-manipulation"
          >
            <KeyRound className="h-4 w-4 text-amber-500" />
            <span>Contract PIN</span>
          </Link>

          <Link
            href="/client/payments"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:border-primary/40 active:scale-95 transition-all touch-manipulation"
          >
            <CreditCard className="h-4 w-4 text-indigo-500" />
            <span>Direct Payments</span>
          </Link>

          <Link
            href="/client/messages"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:border-primary/40 active:scale-95 transition-all touch-manipulation"
          >
            <MessageSquare className="h-4 w-4 text-sky-500" />
            <span>Messages</span>
          </Link>

          <Link
            href="/client/support"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:border-primary/40 active:scale-95 transition-all touch-manipulation"
          >
            <Headphones className="h-4 w-4 text-violet-500" />
            <span>Live Support</span>
          </Link>
        </div>
      </div>

      {/* ── 2. HERO + KEY STATS (Mobile Stack) ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Hero Card */}
        <div
          className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-border min-h-[190px] flex flex-col justify-between p-5 sm:p-7"
          style={{
            background: "linear-gradient(135deg, #0d1f14 0%, #0a2818 45%, #051a0e 100%)",
          }}
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-40 h-40 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />

          {/* Top greeting on mobile */}
          <div className="flex items-center justify-between z-10 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary/90">
              <Zap className="h-3 w-3 text-primary" />
              Client Command Hub
            </span>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[11px] text-white/50">{userData.greeting}</p>
                <p className="text-xs font-bold text-white leading-none">{userData.firstName || "Client"}</p>
              </div>
              <Avatar className="h-8 w-8 border border-primary/40">
                {userData.avatarUrl && <AvatarImage src={userData.avatarUrl} alt={userData.fullName} />}
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="relative z-10 my-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
              Hire Verified Skilled Professionals
            </h1>
            <p className="text-xs text-white/60 mt-1 max-w-md leading-relaxed">
              Find electricians, plumbers, and painters across Addis Ababa with 2-party digital contracts and instant Chapa payments.
            </p>
          </div>

          <div className="flex items-center gap-2.5 z-10 pt-2 flex-wrap">
            <Button asChild size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 h-10 touch-manipulation">
              <Link href="/client/search">
                <Search className="h-3.5 w-3.5 mr-1.5" /> Find Pro Near You
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-xl border-white/20 text-white bg-white/5 hover:bg-white/10 font-semibold px-4 h-10 touch-manipulation">
              <Link href="/client/contracts">
                My Contracts
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          {/* Total Budget Card */}
          <div className="col-span-2 lg:col-span-1 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Budget</p>
              <BarChart2 className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              <CountUp to={totalBudget} duration={1.2} separator="," />
              <span className="text-xs font-semibold text-muted-foreground ml-1.5">ETB</span>
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{activeCount} active digital contract{activeCount !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Quick Counter Cards (2 cols on all devices) */}
          <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
            <div className="p-2 rounded-xl bg-primary/10 text-primary w-fit mb-1.5">
              <Briefcase className="h-4 w-4" />
            </div>
            <p className="text-xl font-black"><CountUp to={activeCount} duration={1} /></p>
            <p className="text-[11px] text-muted-foreground font-medium">Active Contracts</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 w-fit mb-1.5">
              <Users className="h-4 w-4" />
            </div>
            <p className="text-xl font-black"><CountUp to={uniqueWorkers} duration={1} /></p>
            <p className="text-[11px] text-muted-foreground font-medium">Hired Workers</p>
          </div>
        </div>
      </div>

      {/* ── 3. FIRST-TIME USER ONBOARDING TRACKER (Feature Discovery) ─ */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">Getting Started Guide</p>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {completedStepsCount} of 4 completed
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mb-4">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max(25, (completedStepsCount / 4) * 100)}%` }}
          />
        </div>

        {/* 4 Interactive Step Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Step 1: Verification */}
          <Link
            href="/client/profile/settings?verify=1"
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all touch-manipulation ${
              isVerified ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/20 hover:border-primary/40"
            }`}
          >
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isVerified ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground font-bold text-xs"
            }`}>
              {isVerified ? <Check className="h-4 w-4" /> : "1"}
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
            className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:border-primary/40 transition-all touch-manipulation"
          >
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
              <KeyRound className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">Set Contract PIN</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                6-digit electronic signing PIN
              </p>
            </div>
          </Link>

          {/* Step 3: Browse Map & Hire */}
          <Link
            href="/client/search"
            className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:border-primary/40 transition-all touch-manipulation"
          >
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
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
            className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:border-primary/40 transition-all touch-manipulation"
          >
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
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
              className={`flex items-center gap-3 p-3 rounded-2xl border border-border bg-gradient-to-br ${svc.color} hover:border-primary/30 active:scale-95 transition-all touch-manipulation`}
            >
              <div className={`p-2.5 rounded-xl ${svc.iconBg} shrink-0`}>
                {svc.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{svc.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{svc.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 5. HUB AND SPOKE OVERVIEW CARDS (Mobile-First 2-Col Grid) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Spoke 1: Pro Discovery & Map */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Interactive Map Discovery</p>
                  <p className="text-xs text-muted-foreground">Find vetted workers closest to your location</p>
                </div>
              </div>
            </div>

            <div className="relative my-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Electrician in Bole, Addis Ababa..."
                className="pl-9 h-11 rounded-xl bg-background border-border text-xs touch-manipulation"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button asChild size="default" className="rounded-xl flex-1 h-10 text-xs font-bold touch-manipulation">
              <Link href={`/client/search?q=${encodeURIComponent(searchQuery)}`}>
                Search Workers
              </Link>
            </Button>
            <Button asChild size="default" variant="outline" className="rounded-xl h-10 text-xs font-semibold touch-manipulation">
              <Link href="/client/search?view=map">
                Open Map
              </Link>
            </Button>
          </div>
        </div>

        {/* Spoke 2: Smart Digital Contracts */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Digital Contracts Hub</p>
                  <p className="text-xs text-muted-foreground">2-party signed electronic agreements with audit hash</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/20 bg-primary/5">
                {activeCount} Active
              </Badge>
            </div>

            <div className="bg-muted/30 rounded-xl p-3 border border-border/60 my-2 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Contract Security PIN:</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <KeyRound className="h-3 w-3 text-amber-500" /> Configured
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tamper Protection:</span>
                <span className="font-semibold text-emerald-500">SHA-256 + QR Verified</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button asChild size="default" variant="outline" className="rounded-xl flex-1 h-10 text-xs font-bold touch-manipulation">
              <Link href="/client/contracts">
                View All Contracts
              </Link>
            </Button>
            <Button asChild size="default" variant="ghost" className="rounded-xl h-10 text-xs font-semibold text-primary touch-manipulation">
              <Link href="/client/contract-setup">
                PIN Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Spoke 3: Chapa Direct Payments & Invoices */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Direct Billing (Chapa)</p>
                  <p className="text-xs text-muted-foreground">Direct non-escrow payment to workers with receipts</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold text-emerald-500 border-emerald-500/20 bg-emerald-500/5">
                Telebirr / CBE
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground my-2 leading-relaxed">
              Payments go directly from your mobile wallet or bank to the skilled worker upon milestone completion. Download verified receipts anytime.
            </p>
          </div>

          <div className="pt-1">
            <Button asChild size="default" className="rounded-xl w-full h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white touch-manipulation">
              <Link href="/client/payments">
                Manage Invoices & Receipts
              </Link>
            </Button>
          </div>
        </div>

        {/* Spoke 4: Real-Time Chat & Support */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500">
                  <Headphones className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Support & Direct Chat</p>
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
            <Button asChild size="default" variant="outline" className="rounded-xl flex-1 h-10 text-xs font-bold touch-manipulation">
              <Link href="/client/support">
                <Headphones className="h-3.5 w-3.5 mr-1.5" /> Support Tickets
              </Link>
            </Button>
            <Button asChild size="default" variant="outline" className="rounded-xl flex-1 h-10 text-xs font-bold touch-manipulation">
              <Link href="/client/messages">
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Messages
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ── 6. ACTIVE CONTRACTS (Mobile Card List + Desktop Table) ────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Work Agreements</p>
            <p className="text-xs text-foreground font-semibold mt-0.5">
              {activeCount > 0 ? `${activeCount} contract${activeCount > 1 ? "s" : ""} in progress` : "No ongoing contracts"}
            </p>
          </div>
          <Link href="/client/contracts" className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
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
                  <div key={contractId} className="rounded-xl border border-border bg-muted/15 p-3.5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-9 w-9 border border-border shrink-0">
                          {(contract.worker_avatar || contract.partner_avatar) && (
                            <AvatarImage src={contract.worker_avatar || contract.partner_avatar} />
                          )}
                          <AvatarFallback className="text-xs font-bold bg-muted">{wi}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{contract.job_title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{contract.worker_name || contract.partner_name || "Assigned Pro"}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${statusStyle(contract.job_status)}`}>
                        {statusLabel(contract.job_status)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground">Budget: </span>
                        <span className="font-extrabold text-foreground">{contract.budget ? `${Number(contract.budget).toLocaleString()} ETB` : "—"}</span>
                      </div>
                      <Button asChild size="sm" className="rounded-xl h-9 px-3.5 text-xs font-bold touch-manipulation">
                        <Link href={`/contracts/${contractId}`}>
                          View Details <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW (>= 640px): Clean Table Layout */}
            <div className="hidden sm:block rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted/40 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span className="col-span-5">Worker / Job</span>
                <span className="col-span-3">Status</span>
                <span className="col-span-2">Budget</span>
                <span className="col-span-2 text-right">Action</span>
              </div>
              <div className="divide-y divide-border">
                {activeContracts.slice(0, 5).map((contract) => {
                  const wi = (contract.worker_name || contract.partner_name || "W").slice(0, 2).toUpperCase();
                  const contractId = contract.id || contract.contract_id;
                  return (
                    <div key={contractId} className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-muted/20 transition-colors">
                      <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-8 w-8 border border-border shrink-0">
                          {(contract.worker_avatar || contract.partner_avatar) && (
                            <AvatarImage src={contract.worker_avatar || contract.partner_avatar} />
                          )}
                          <AvatarFallback className="text-[10px] font-bold bg-muted">{wi}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{contract.job_title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{contract.worker_name || contract.partner_name}</p>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <Badge variant="outline" className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusStyle(contract.job_status)}`}>
                          {statusLabel(contract.job_status)}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-semibold">{contract.budget ? `${Number(contract.budget).toLocaleString()}` : "—"}</p>
                        <p className="text-[9px] text-muted-foreground">ETB</p>
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <Button variant="ghost" size="sm" className="h-8 text-xs rounded-lg px-2 text-primary hover:bg-primary/10" asChild>
                          <Link href={`/contracts/${contractId}`}>
                            Open <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 flex flex-col items-center justify-center text-center gap-2.5">
            <div className="h-11 w-11 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">No active work contracts</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
                When you hire an electrician, plumber, or painter, your digital contract with QR verification will show here.
              </p>
            </div>
            <Button size="default" className="rounded-xl gap-1.5 mt-2 h-10 font-bold touch-manipulation" asChild>
              <Link href="/client/search">
                <Plus className="h-4 w-4" /> Find a Pro Now
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* ── 7. RECENT REQUESTS & ACTIVITY ───────────────────────────── */}
      {recentJobs.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Job Posts</p>
            <span className="text-[11px] text-muted-foreground">{recentJobs.length} posted</span>
          </div>

          <div className="divide-y divide-border">
            {recentJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{job.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(job.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <Badge variant="outline" className={`rounded-full text-[9px] font-bold uppercase px-2 py-0.5 border shrink-0 ${statusStyle(job.status)}`}>
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
