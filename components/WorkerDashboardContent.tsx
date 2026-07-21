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
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface WorkerDashboardContentProps {
  worker: {
    fullName: string;
    firstName: string;
    isVerified: boolean;
    district: string;
    skills: string[];
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

const EARNINGS_DATA = [
  { month: "Jan", earnings: 0 },
  { month: "Feb", earnings: 800 },
  { month: "Mar", earnings: 2200 },
  { month: "Apr", earnings: 1500 },
  { month: "May", earnings: 3800 },
  { month: "Jun", earnings: 2900 },
  { month: "Jul", earnings: 4600 },
];

function statusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "in_progress": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "accepted":    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "completed":   return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    case "pending":     return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default:            return "bg-muted text-muted-foreground border-border";
  }
}

function EarningsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card shadow-xl px-4 py-3 text-sm">
      <p className="text-muted-foreground text-xs mb-1">{label}</p>
      <p className="font-bold text-foreground">{payload[0].value.toLocaleString()} ETB</p>
    </div>
  );
}

function PerformanceRing({ pct, label }: { pct: number; label: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={88} height={88} viewBox="0 0 88 88">
        <circle cx={44} cy={44} r={r} fill="none" stroke="var(--color-border)" strokeWidth={7} />
        <circle
          cx={44} cy={44} r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <text x={44} y={49} textAnchor="middle" fontSize="13" fontWeight="900" fill="currentColor">{pct}%</text>
      </svg>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

export default function WorkerDashboardContent({
  worker,
  stats,
  pendingJobs,
  recentJobs,
  greeting,
}: WorkerDashboardContentProps) {
  const router = useRouter();
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  const initials = worker.fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const completionRate =
    stats.completedJobs + stats.activeJobs > 0
      ? Math.round((stats.completedJobs / (stats.completedJobs + stats.activeJobs)) * 100)
      : 0;

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
    <FadeContent blur duration={0.4} className="space-y-5 max-w-full">

      {/* ROW 1 — Hero + KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Hero — dark indigo/slate */}
        <div
          className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-border min-h-[210px] flex flex-col justify-between p-7"
          style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1044 45%, #0c0a22 100%)" }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-48 h-48 bg-violet-500/8 rounded-full blur-2xl pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #818cf8 1px, transparent 1px)", backgroundSize: "28px 28px" }}
          />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-indigo-400/80 mb-3">
              <Zap size={11} className="text-indigo-400" />
              Professional Workbench
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-1">
              {greeting},<br />{worker.firstName}
            </h1>
            <p className="text-sm text-white/45 mb-6 flex items-center gap-1.5 flex-wrap">
              <MapPin size={12} className="text-indigo-400 shrink-0" />
              {worker.district}
              {worker.skills.length > 0 && <span className="text-white/30">·</span>}
              {worker.skills.slice(0, 2).join(", ")}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Button asChild size="sm" className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 gap-1.5 shadow-lg shadow-indigo-500/20">
                <Link href="/worker/jobs"><Briefcase size={14} /> Browse Jobs</Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-xl border-white/15 text-white bg-white/5 hover:bg-white/10 font-semibold px-5 gap-1.5">
                <Link href="/worker/contracts">My Contracts</Link>
              </Button>
            </div>
          </div>

          <div className="absolute top-5 right-5 flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-white/35 font-medium">Status</p>
              <p className="text-sm font-bold text-white flex items-center gap-1 justify-end">
                {worker.isVerified
                  ? <><ShieldCheck size={12} className="text-indigo-400" /> Verified</>
                  : <><Clock size={12} className="text-amber-400" /> Unverified</>
                }
              </p>
            </div>
            <Avatar className="h-10 w-10 border-2 border-indigo-500/40">
              <AvatarFallback className="bg-indigo-600 text-white font-bold text-sm">{initials}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Right KPI stack */}
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Earned</p>
              <Wallet size={14} className="text-muted-foreground" />
            </div>
            <p className="text-3xl font-black tracking-tight mt-1">
              <CountUp to={stats.revenue} duration={1.5} separator="," />
              <span className="text-sm font-semibold text-muted-foreground ml-1">ETB</span>
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
              <TrendingUp size={12} />
              <span>Across {stats.completedJobs} completed jobs</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-2"><Bell size={15} /></div>
              <p className="text-2xl font-black"><CountUp to={stats.pendingJobs} duration={1.2} /></p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Pending</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-2"><Activity size={15} /></div>
              <p className="text-2xl font-black"><CountUp to={stats.activeJobs} duration={1.2} /></p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2 — Bar Chart + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold">Earnings Overview</p>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly earnings — last 7 months</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
              <BarChart3 size={11} /> ETB
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={EARNINGS_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={<EarningsTooltip />} cursor={{ fill: "rgba(99,102,241,0.08)" }} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <Bar dataKey="earnings" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-bold">Performance</p>
            <p className="text-xs text-muted-foreground mt-0.5">Your completion &amp; response rate</p>
          </div>
          <div className="flex items-center justify-around py-2">
            <PerformanceRing pct={completionRate} label="Completion" />
            <PerformanceRing pct={100} label="Response" />
          </div>
          <div className="border-t border-border pt-3 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Quick links</p>
            {[
              { label: "My Contracts", href: "/worker/contracts", icon: <FileText size={13} /> },
              { label: "Earnings", href: "/worker/earnings", icon: <Wallet size={13} /> },
              { label: "Messages", href: "/worker/messages", icon: <MessageSquare size={13} /> },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center justify-between py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group">
                <span className="flex items-center gap-2">{l.icon}{l.label}</span>
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3 — Pending Requests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pending Requests</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold">
            <Bell size={10} /> {pendingJobs.length} new
          </span>
        </div>

        {pendingJobs.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-2.5 bg-muted/40 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span className="col-span-5">Client / Job</span>
              <span className="col-span-3">Budget</span>
              <span className="col-span-4 text-right">Action</span>
            </div>
            <div className="divide-y divide-border">
              {pendingJobs.slice(0, 6).map((job: any) => {
                const ci = (job.client_name || "C").slice(0, 2).toUpperCase();
                return (
                  <div key={job.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center px-5 py-4 hover:bg-muted/20 transition-colors">
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 border border-border shrink-0">
                        {job.client_avatar && <AvatarImage src={job.client_avatar} />}
                        <AvatarFallback className="text-[11px] font-bold bg-indigo-500/10 text-indigo-400">{ci}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{job.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{job.client_name || "Client"}</p>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <p className="text-xs font-bold">{Number(job.budget || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">ETB</p>
                    </div>
                    <div className="col-span-4 flex items-center gap-2 sm:justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-xl text-[11px] font-semibold gap-1.5 border-red-500/20 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleReject(job.id)}
                        disabled={rejecting === job.id}
                      >
                        <X size={12} /> Decline
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 rounded-xl text-[11px] font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
                        onClick={() => handleAccept(job.id)}
                        disabled={accepting === job.id}
                      >
                        <CheckCheck size={12} /> Accept
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <ChevronsUp size={22} />
            </div>
            <div>
              <p className="font-semibold text-sm">No pending requests</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">Keep your profile updated to attract more clients.</p>
            </div>
            <Button size="sm" variant="outline" className="rounded-xl gap-1.5 mt-1" asChild>
              <Link href="/worker/profile">Update Profile</Link>
            </Button>
          </div>
        )}
      </div>

      {/* ROW 4 — Job History + Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Job History</p>
            <Link href="/worker/jobs" className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {recentJobs.length > 0 ? (
              <>
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted/40 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span className="col-span-6">Job</span>
                  <span className="col-span-3">Status</span>
                  <span className="col-span-2">Budget</span>
                  <span className="col-span-1" />
                </div>
                <div className="divide-y divide-border">
                  {recentJobs.map((job: any) => (
                    <div key={job.id} className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-muted/20 transition-colors">
                      <div className="col-span-6 min-w-0">
                        <p className="text-xs font-semibold truncate">{job.title}</p>
                        <p className="text-[10px] text-muted-foreground">{job.client_name || "Client"}</p>
                      </div>
                      <div className="col-span-3">
                        <Badge variant="outline" className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusStyle(job.status)}`}>
                          {(job.status || "pending").replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-semibold">{Number(job.budget || 0).toLocaleString()}</p>
                        <p className="text-[9px] text-muted-foreground">ETB</p>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button variant="ghost" size="sm" className="h-7 w-7 rounded-lg p-0 text-indigo-400 hover:bg-indigo-500/10" asChild>
                          <Link href="/worker/jobs"><ArrowUpRight size={13} /></Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-12 gap-2 text-center">
                <Briefcase size={24} className="text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground font-medium">No job history yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Completed Jobs</p>
              <CheckCircle2 size={15} className="text-emerald-400" />
            </div>
            <p className="text-4xl font-black tracking-tight">
              <CountUp to={stats.completedJobs} duration={1.5} />
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <Star size={11} className="fill-emerald-400" /> Completion rate: {completionRate}%
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm p-5 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Your Skills</p>
            {worker.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((skill: string) => (
                  <span key={skill} className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-400">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">No skills added yet.</p>
                <Link href="/worker/profile/settings" className="text-xs font-semibold text-indigo-400 hover:underline">Add skills ?</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </FadeContent>
  );
}
