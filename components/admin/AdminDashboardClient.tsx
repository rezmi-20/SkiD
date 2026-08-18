"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CountUp from "@/components/ui/count-up";
import FadeContent from "@/components/ui/fade-content";
import { PendingVerification } from "@/components/admin/PendingVerification";
import {
  Users, Clock, FileText, Briefcase, DollarSign, Scale,
  ShieldAlert, ChevronRight, AlertTriangle, Activity,
  UserCheck, Zap, TrendingUp, ArrowUpRight, BarChart3,
  Settings, UserCog, MessageSquare,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";

interface Props {
  workerCount: number;
  pendingVerifCount: number;
  activeContractCount: number;
  completedJobsMonthly: number;
  revenueDisplay: string;
  disputeCount: number;
  activityFeed: { type: string; title: string; created_at: string }[];
  unverifiedWorkers: any[];
  verificationCapabilities: {
    canRead: boolean;
    canReview: boolean;
    canApprove: boolean;
    canReject: boolean;
  };
}

const PLATFORM_DATA = [
  { day: "Mon", jobs: 4, users: 2 },
  { day: "Tue", jobs: 7, users: 5 },
  { day: "Wed", jobs: 3, users: 3 },
  { day: "Thu", jobs: 9, users: 6 },
  { day: "Fri", jobs: 12, users: 8 },
  { day: "Sat", jobs: 8, users: 4 },
  { day: "Sun", jobs: 5, users: 3 },
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card shadow-xl px-4 py-3 text-xs">
      <p className="text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

function MetricTile({
  label, value, icon: Icon, accent, trend,
}: {
  label: string; value: string | number; icon: any; accent: string; trend?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm group hover:border-border/80 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${accent}`}>
          <Icon size={15} />
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{trend}</span>
        )}
      </div>
      <p className="text-2xl font-black tracking-tight">
        {typeof value === "number" ? <CountUp to={value} duration={1.4} /> : value}
      </p>
      <p className="text-[11px] font-semibold text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function ActivityItem({ item, idx, t }: { item: { type: string; title: string; created_at: string }; idx: number; t: (key: any) => string }) {
  const isUser = item.type === "user_signup";
  const colors = ["text-rose-400 bg-rose-500/10", "text-blue-400 bg-blue-500/10", "text-violet-400 bg-violet-500/10", "text-amber-400 bg-amber-500/10"];
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${colors[idx % colors.length]}`}>
        {isUser ? <Users size={13} /> : <Briefcase size={13} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate">{item.title}</p>
        <p className="text-[10px] text-muted-foreground">
          {isUser ? t("admin.dashboard.activity.userSignup") : t("admin.dashboard.activity.jobPosted")} ?{" "}
          {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </p>
      </div>
      <Badge variant="outline" className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${isUser ? "text-blue-400 border-blue-500/20 bg-blue-500/10" : "text-violet-400 border-violet-500/20 bg-violet-500/10"}`}>
        {isUser ? t("admin.dashboard.badge.user") : t("admin.dashboard.badge.job")}
      </Badge>
    </div>
  );
}

export function AdminDashboardClient({
  workerCount,
  pendingVerifCount,
  activeContractCount,
  completedJobsMonthly,
  revenueDisplay,
  disputeCount,
  activityFeed,
  unverifiedWorkers,
  verificationCapabilities,
}: Props) {
  const { t } = useLanguage();

  const metrics = [
    { label: t("admin.metric.totalWorkers"), value: workerCount, icon: Users, accent: "bg-blue-500/10 text-blue-400" },
    { label: t("admin.metric.pendingVerif"), value: pendingVerifCount, icon: Clock, accent: "bg-amber-500/10 text-amber-400" },
    { label: t("admin.metric.activeContracts"), value: activeContractCount, icon: FileText, accent: "bg-emerald-500/10 text-emerald-400" },
    { label: t("admin.metric.jobsMonth"), value: completedJobsMonthly, icon: Briefcase, accent: "bg-violet-500/10 text-violet-400" },
    { label: t("admin.metric.revenue"), value: revenueDisplay, icon: DollarSign, accent: "bg-green-500/10 text-green-400" },
    { label: t("admin.metric.disputes"), value: disputeCount, icon: Scale, accent: "bg-rose-500/10 text-rose-400" },
  ];

  return (
    <FadeContent blur duration={0.4} className="space-y-5 max-w-full">

      {/* ROW 1 — Command Hero + Alert panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Hero — dark blue/slate command center */}
        <div
          className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-border min-h-[210px] flex flex-col justify-between p-7"
          style={{ background: "linear-gradient(135deg, #091526 0%, #0e243f 45%, #050d18 100%)" }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{ backgroundImage: "linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
          />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-400/80 mb-3">
              <Zap size={11} className="text-blue-400" />
              {t("admin.dashboard.commandCenter")}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-1">
              {t("admin.dashboard.platformOverview")}
            </h1>
            <p className="text-sm text-white/40 mb-6 max-w-xs">
              {t("admin.dashboard.desc")}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {verificationCapabilities.canRead && (
                <Button asChild size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 gap-1.5 shadow-lg shadow-blue-500/20">
                  <Link href="/admin/verify">
                    <ShieldAlert size={14} /> {verificationCapabilities.canReview ? t("admin.dashboard.verifyWorkers") : t("admin.dashboard.viewVerification")}
                  </Link>
                </Button>
              )}
              <Button asChild size="sm" variant="outline" className="rounded-xl border-white/15 text-white bg-white/5 hover:bg-white/10 font-semibold px-5 gap-1.5">
                <Link href="/admin/users">{t("admin.dashboard.manageUsers")}</Link>
              </Button>
            </div>
          </div>

          {disputeCount > 0 && (
            <div className="absolute top-5 right-5 flex items-center gap-2 bg-rose-500/20 border border-rose-500/30 rounded-xl px-3 py-2">
              <AlertTriangle size={13} className="text-rose-300 animate-pulse" />
              <div>
                <p className="text-[10px] text-rose-300/60 font-medium">{t("admin.dashboard.openDisputes")}</p>
                <p className="text-sm font-bold text-rose-200">{disputeCount}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right — alert cards */}
        <div className="flex flex-col gap-3">
          {/* Pending verif alert */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{t("admin.dashboard.needsAttention")}</p>
              <Clock size={14} className="text-amber-400" />
            </div>
            <p className="text-3xl font-black tracking-tight mt-1">
              <CountUp to={pendingVerifCount} duration={1.5} />
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{t("admin.dashboard.workersAwaiting")}</p>
            {verificationCapabilities.canRead && (
              <Link href="/admin/verify" className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:underline">
                {verificationCapabilities.canReview ? t("admin.dashboard.reviewNow") : t("admin.dashboard.viewDetails")} <ChevronRight size={11} />
              </Link>
            )}
          </div>

          {/* Quick admin links */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t("admin.dashboard.users"), href: "/admin/users", icon: UserCog, bg: "bg-blue-500/10 text-blue-400" },
              { label: t("admin.dashboard.reports"), href: "/admin/reports", icon: BarChart3, bg: "bg-violet-500/10 text-violet-400" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-border/60 transition-colors group">
                <div className={`p-2 rounded-xl w-fit mb-2 ${item.bg}`}>
                  <item.icon size={15} />
                </div>
                <p className="text-xs font-semibold">{item.label}</p>
                <ArrowUpRight size={11} className="text-muted-foreground mt-0.5 group-hover:text-foreground transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 2 — Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <MetricTile key={m.label} label={m.label} value={m.value} icon={m.icon} accent={m.accent} />
        ))}
      </div>

      {/* ROW 3 — Platform Activity Chart + Recent feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold">{t("admin.dashboard.platformActivity")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("admin.dashboard.platformActivityDesc")}</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
              <Activity size={11} /> {t("admin.dashboard.live")}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={PLATFORM_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="jobsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-border)" }} />
              <Area type="monotone" dataKey="jobs" name={t("admin.dashboard.jobsPosted")} stroke="#3b82f6" strokeWidth={2.5} fill="url(#jobsGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="users" name={t("admin.dashboard.newUsers")} stroke="#818cf8" strokeWidth={2.5} fill="url(#usersGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex items-center gap-5 mt-3">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground"><span className="h-2 w-4 rounded-full bg-blue-500 inline-block" /> {t("admin.dashboard.jobsPosted")}</span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground"><span className="h-2 w-4 rounded-full bg-indigo-400 inline-block" /> {t("admin.dashboard.newUsers")}</span>
          </div>
        </div>

        {/* Recent activity feed */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("admin.activity.title")}</p>
            <span className="text-[10px] text-muted-foreground">{activityFeed.length} {t("admin.dashboard.events")}</span>
          </div>
          {activityFeed.length > 0 ? (
            <div className="divide-y divide-border max-h-[240px] overflow-y-auto">
              {activityFeed.map((item, idx) => (
                <ActivityItem key={idx} item={item} idx={idx} t={t} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 gap-2 text-center">
              <Activity size={22} className="text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">{t("admin.dashboard.noRecentActivity")}</p>
            </div>
          )}
        </div>
      </div>

      {/* ROW 4 — Pending verification table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("admin.dashboard.pendingWorkerVerification")}</p>
          <Link href="/admin/verify" className="text-xs text-blue-500 font-semibold hover:underline flex items-center gap-1">
            {t("admin.dashboard.viewAll")} <ChevronRight size={12} />
          </Link>
        </div>
        {verificationCapabilities.canRead && (
          <PendingVerification
            workers={unverifiedWorkers}
            canOpenDetails={verificationCapabilities.canRead}
            canReview={verificationCapabilities.canReview}
            canApprove={verificationCapabilities.canApprove}
            canReject={verificationCapabilities.canReject}
          />
        )}
      </div>

    </FadeContent>
  );
}
