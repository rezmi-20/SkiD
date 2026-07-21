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
  CheckCircle,
  ArrowUpRight,
  Zap,
  Users,
  Activity,
  ChevronRight,
  Calendar,
  Wrench,
  Paintbrush,
  Plug,
  Droplets,
  MoreHorizontal,
  Star,
  BarChart2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

/* ── Types ─────────────────────────────────────────────────────────── */
interface ClientDashboardContentProps {
  userData: {
    fullName: string;
    firstName: string;
    avatarUrl: string | null;
    greeting: string;
  };
  activeContracts: any[];
  recentJobs: any[];
}

/* ── Chart data (replace with real DB queries) ──────────────────────── */
const ACTIVITY_DATA = [
  { month: "Jan", value: 0 },
  { month: "Feb", value: 1200 },
  { month: "Mar", value: 900 },
  { month: "Apr", value: 3400 },
  { month: "May", value: 2800 },
  { month: "Jun", value: 5800 },
  { month: "Jul", value: 4900 },
];

/* ── Service category cards ─────────────────────────────────────────── */
const SERVICES = [
  {
    label: "Electrical",
    icon: <Plug size={20} />,
    color: "from-amber-500/20 to-amber-500/5",
    iconBg: "bg-amber-500/15 text-amber-500",
    count: "142 pros",
  },
  {
    label: "Plumbing",
    icon: <Droplets size={20} />,
    color: "from-blue-500/20 to-blue-500/5",
    iconBg: "bg-blue-500/15 text-blue-500",
    count: "98 pros",
  },
  {
    label: "Painting",
    icon: <Paintbrush size={20} />,
    color: "from-pink-500/20 to-pink-500/5",
    iconBg: "bg-pink-500/15 text-pink-500",
    count: "76 pros",
  },
  {
    label: "Carpentry",
    icon: <Wrench size={20} />,
    color: "from-emerald-500/20 to-emerald-500/5",
    iconBg: "bg-emerald-500/15 text-emerald-500",
    count: "54 pros",
  },
  {
    label: "All Services",
    icon: <MoreHorizontal size={20} />,
    color: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/15 text-primary",
    count: "View all",
  },
];

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

/* ── Custom tooltip ─────────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card shadow-xl px-4 py-3 text-sm">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      <p className="font-bold text-foreground">{payload[0].value.toLocaleString()} ETB</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function ClientDashboardContent({
  userData,
  activeContracts = [],
  recentJobs = [],
}: ClientDashboardContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const activeCount      = activeContracts.length;
  const totalBudget      = activeContracts.reduce((sum, c) => {
    const v = parseFloat(String(c.budget || "0").replace(/[^0-9.]/g, ""));
    return sum + (isNaN(v) ? 0 : v);
  }, 0);
  const uniqueWorkers    = new Set(activeContracts.map((c) => c.worker_name || c.partner_name).filter(Boolean)).size;
  const initials         = userData.fullName ? userData.fullName.slice(0, 2).toUpperCase() : "DS";

  return (
    <FadeContent blur duration={0.4} className="space-y-5 max-w-full">

      {/* ══ ROW 1 — Hero + Stats Panel ════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Hero Card — dark gradient, spans 2 cols */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-border min-h-[210px] flex flex-col justify-between p-7"
          style={{
            background: "linear-gradient(135deg, #0d1f14 0%, #0a2818 40%, #051a0e 100%)",
          }}
        >
          {/* Glow blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-24 w-40 h-40 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />
          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary/80 mb-3">
              <Zap size={11} className="text-primary" />
              DireSkill Platform
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-1">
              Hire Verified<br />Professionals
            </h1>
            <p className="text-sm text-white/50 mb-6 max-w-xs">
              Post a job, get matched with Fayda-verified workers in Dire Dawa. Fast, safe, contract-backed.
            </p>
            <div className="flex items-center gap-3">
              <Button asChild size="sm" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 gap-1.5 shadow-lg shadow-primary/20">
                <Link href="/client/search"><Plus size={14} /> Post a Job</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-xl border-white/20 text-white bg-white/5 hover:bg-white/10 font-semibold px-5 gap-1.5">
                <Link href="/client/contracts">View Contracts</Link>
              </Button>
            </div>
          </div>

          {/* Greeting tag top-right */}
          <div className="absolute top-5 right-5 flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-white/40 font-medium">{userData.greeting}</p>
              <p className="text-sm font-bold text-white">{userData.firstName}</p>
            </div>
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-primary/40">
                {userData.avatarUrl && <AvatarImage src={userData.avatarUrl} alt={userData.fullName} />}
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">{initials}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#0d1f14]" />
            </div>
          </div>
        </div>

        {/* Stats Panel — right col */}
        <div className="flex flex-col gap-3">
          {/* Total spending */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Budget</p>
              <BarChart2 size={14} className="text-muted-foreground" />
            </div>
            <p className="text-3xl font-black tracking-tight mt-1">
              <CountUp to={totalBudget} duration={1.5} separator="," />
              <span className="text-sm font-semibold text-muted-foreground ml-1">ETB</span>
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
              <TrendingUp size={12} />
              <span>Across {activeCount} active contracts</span>
            </div>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="p-2 rounded-xl bg-primary/10 text-primary w-fit mb-2">
                <Briefcase size={15} />
              </div>
              <p className="text-2xl font-black"><CountUp to={activeCount} duration={1.2} /></p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Contracts</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 w-fit mb-2">
                <Users size={15} />
              </div>
              <p className="text-2xl font-black"><CountUp to={uniqueWorkers} duration={1.2} /></p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Workers</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ ROW 2 — Service Categories (horizontal scroll) ════════════ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Browse Services</p>
          <Link href="/client/search" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
            See All <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SERVICES.map((svc) => (
            <Link
              key={svc.label}
              href={svc.label === "All Services" ? "/client/search" : `/client/search?category=${svc.label.toLowerCase()}`}
              className={`group flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-gradient-to-b ${svc.color} p-4 text-center hover:border-primary/30 hover:shadow-md transition-all`}
            >
              <div className={`p-3 rounded-xl ${svc.iconBg} group-hover:scale-110 transition-transform`}>
                {svc.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{svc.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{svc.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ══ ROW 3 — Chart + Search ════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold">Spending Overview</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total for the last 7 months</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              <Activity size={11} /> Live
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ACTIVITY_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#areaGrad)" dot={false} activeDot={{ r: 5, fill: "var(--color-primary)", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Search + Find Pro */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-bold">Find a Professional</p>
            <p className="text-xs text-muted-foreground mt-0.5">Search 370+ verified workers</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Electrician…"
              className="pl-9 h-10 rounded-xl bg-background border-border text-sm"
            />
          </div>
          <Button size="sm" className="rounded-xl h-10 font-semibold gap-2" asChild>
            <Link href={`/client/search?q=${encodeURIComponent(searchQuery)}`}>
              <Search size={14} /> Search Workers
            </Link>
          </Button>

          <div className="border-t border-border pt-4 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Quick links</p>
            {[
              { label: "My Contracts", href: "/client/contracts", icon: <Briefcase size={13} /> },
              { label: "Payments", href: "/client/payments", icon: <CreditCard size={13} /> },
              { label: "Messages", href: "/client/messages", icon: <MessageSquare size={13} /> },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center justify-between py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group">
                <span className="flex items-center gap-2">{l.icon}{l.label}</span>
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ROW 4 — Active Contracts table + Activity feed ════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Contracts — table style, 3 cols */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Contracts</p>
            <Link href="/client/contracts" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {activeCount > 0 ? (
              <>
                {/* Table header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted/40 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span className="col-span-5">Worker / Job</span>
                  <span className="col-span-3">Status</span>
                  <span className="col-span-2">Budget</span>
                  <span className="col-span-2 text-right">Action</span>
                </div>
                <div className="divide-y divide-border">
                  {activeContracts.slice(0, 5).map((contract) => {
                    const wi = (contract.worker_name || contract.partner_name || "W").slice(0, 2).toUpperCase();
                    return (
                      <div key={contract.id || contract.contract_id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-muted/20 transition-colors">
                        <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                          <Avatar className="h-8 w-8 border border-border shrink-0">
                            {(contract.worker_avatar || contract.partner_avatar) && <AvatarImage src={contract.worker_avatar || contract.partner_avatar} />}
                            <AvatarFallback className="text-[10px] font-bold bg-muted">{wi}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate">{contract.job_title}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{contract.worker_name || contract.partner_name}</p>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <Badge variant="outline" className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusStyle(contract.job_status)}`}>
                            {contract.job_status?.replace("_", " ") || "Active"}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs font-semibold">{contract.budget ? `${contract.budget}` : "—"}</p>
                          <p className="text-[9px] text-muted-foreground">ETB</p>
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg px-2 text-primary hover:bg-primary/10" asChild>
                            <Link href={`/contracts/${contract.id || contract.contract_id}`}><ArrowUpRight size={13} /></Link>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-14 gap-3 text-center">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                  <Briefcase size={22} />
                </div>
                <div>
                  <p className="font-semibold text-sm">No active contracts</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Post a job to get started.</p>
                </div>
                <Button size="sm" className="rounded-xl gap-1.5 mt-1" asChild>
                  <Link href="/client/search"><Plus size={14} /> Find a Pro</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Activity feed — 2 cols */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">History</p>
            <span className="text-[10px] text-muted-foreground">{recentJobs.length} requests</span>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {recentJobs.length > 0 ? (
              <div className="divide-y divide-border">
                {recentJobs.slice(0, 7).map((job, idx) => {
                  const colors = ["text-primary bg-primary/10", "text-indigo-500 bg-indigo-500/10", "text-amber-500 bg-amber-500/10", "text-pink-500 bg-pink-500/10"];
                  return (
                    <div key={job.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${colors[idx % colors.length]}`}>
                        <Clock size={13} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{job.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(job.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <Badge variant="outline" className={`rounded-full text-[9px] font-bold uppercase px-1.5 py-0 border shrink-0 ${statusStyle(job.status)}`}>
                        {job.status || "Posted"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center gap-2 text-center">
                <Activity size={24} className="text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground font-medium">No history yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </FadeContent>
  );
}
