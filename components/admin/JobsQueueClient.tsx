"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Search,
  Briefcase,
  Calendar,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  Table as TableIcon,
  Columns,
  Coins,
  Building2,
  User,
  Wrench,
  ChevronRight,
  ExternalLink,
  MoreHorizontal,
  TrendingUp,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FadeContent from "@/components/ui/fade-content";
import { useLanguage } from "@/context/LanguageContext";

export interface JobData {
  id: string;
  title: string;
  clientName: string;
  workerName: string | null;
  budget: number | null;
  status: string;
  createdAt: string;
}

interface Props {
  initialJobs: JobData[];
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatAge(dateStr: string) {
  if (!dateStr) return "";
  const hours = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 3_600_000));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function statusBadge(status: string) {
  switch (status) {
    case "completed":
      return {
        label: "Completed",
        color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
        icon: CheckCircle2,
      };
    case "active":
    case "in_progress":
      return {
        label: "In Progress",
        color: "text-accent border-accent/30 bg-accent/10",
        icon: TrendingUp,
      };
    case "pending":
      return {
        label: "Pending",
        color: "text-amber-500 border-amber-500/30 bg-amber-500/10",
        icon: Clock,
      };
    case "disputed":
      return {
        label: "Disputed",
        color: "text-rose-500 border-rose-500/30 bg-rose-500/10",
        icon: AlertTriangle,
      };
    default:
      return {
        label: status.replaceAll("_", " "),
        color: "text-muted-foreground border-border bg-secondary",
        icon: Clock,
      };
  }
}

export function JobsQueueClient({ initialJobs }: Props) {
  const { t } = useLanguage();
  const [jobs] = useState<JobData[]>(initialJobs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");
  const [selectedJob, setSelectedJob] = useState<JobData | null>(null);

  const counts = useMemo(() => {
    return {
      all: jobs.length,
      pending: jobs.filter((j) => j.status === "pending").length,
      in_progress: jobs.filter((j) => j.status === "in_progress" || j.status === "active").length,
      completed: jobs.filter((j) => j.status === "completed").length,
      disputed: jobs.filter((j) => j.status === "disputed").length,
    };
  }, [jobs]);

  const totalValue = useMemo(() => {
    return jobs.reduce((acc, j) => acc + (Number(j.budget) || 0), 0);
  }, [jobs]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return jobs.filter((j) => {
      const matchesSearch =
        !query ||
        j.title.toLowerCase().includes(query) ||
        j.clientName.toLowerCase().includes(query) ||
        (j.workerName && j.workerName.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all" ||
        j.status === statusFilter ||
        (statusFilter === "in_progress" && (j.status === "active" || j.status === "in_progress"));

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  // Group into 4 Pipeline Stages (Inspired by pipeline.tsx)
  const pipelineStages = useMemo(() => {
    return [
      {
        id: "pending",
        name: t("admin.jobs.stage.pending"),
        jobs: filtered.filter((j) => j.status === "pending"),
        color: "amber",
      },
      {
        id: "in_progress",
        name: t("admin.jobs.stage.active"),
        jobs: filtered.filter((j) => j.status === "active" || j.status === "in_progress"),
        color: "accent",
      },
      {
        id: "completed",
        name: t("admin.jobs.stage.completed"),
        jobs: filtered.filter((j) => j.status === "completed"),
        color: "emerald",
      },
      {
        id: "disputed",
        name: t("admin.jobs.stage.disputed"),
        jobs: filtered.filter((j) => j.status === "disputed" || j.status === "rejected"),
        color: "rose",
      },
    ];
  }, [filtered, t]);

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full pb-16">
      {/* ── 1. Unboxed Header Controls (Deals & Forecasting style) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("admin.jobs.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("admin.jobs.desc")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-secondary p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("pipeline")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                viewMode === "pipeline"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{t("admin.jobs.view.pipeline")}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-card text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{t("admin.jobs.view.table")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Top KPI Summary Cards (deals.tsx & forecasting.tsx exact style) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("admin.jobs.kpi.total")}</p>
              <p className="text-2xl font-bold font-mono text-foreground mt-0.5">{jobs.length}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Dire Dawa marketplace</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-chart-1/10 text-chart-1 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("admin.jobs.kpi.active")}</p>
              <p className="text-2xl font-bold font-mono text-foreground mt-0.5">{counts.in_progress}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">In-progress execution</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("admin.jobs.kpi.completed")}</p>
              <p className="text-2xl font-bold font-mono text-emerald-500 mt-0.5">{counts.completed}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">100% Milestone release</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("admin.jobs.kpi.disputed")}</p>
              <p className="text-2xl font-bold font-mono text-rose-500 mt-0.5">{counts.disputed}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Mediation attention</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. Filters and Search Row (deals.tsx exact implementation) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 w-full">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("admin.jobs.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-8 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-all duration-200"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All", count: counts.all },
              { id: "pending", label: "Pending", count: counts.pending },
              { id: "in_progress", label: "Active", count: counts.in_progress },
              { id: "completed", label: "Completed", count: counts.completed },
              { id: "disputed", label: "Disputed", count: counts.disputed },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5",
                  statusFilter === f.id
                    ? "bg-accent text-accent-foreground font-bold shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                <span>{f.label}</span>
                <span className="font-mono text-[10px] opacity-80">({f.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. View Mode: PIPELINE KANBAN (Inspired by pipeline.tsx) ── */}
      {viewMode === "pipeline" && (
        <div className="overflow-x-auto pb-4 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[900px] xl:min-w-0">
            {pipelineStages.map((stage) => {
              const stageTotal = stage.jobs.reduce((acc, j) => acc + (Number(j.budget) || 0), 0);
              return (
                <div key={stage.id} className="space-y-3">
                  {/* Stage Header */}
                  <div className="flex items-center justify-between pb-1 border-b border-border">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {stage.name}
                    </h3>
                    <span className="text-xs font-mono font-bold text-muted-foreground px-2 py-0.5 rounded bg-secondary">
                      {stage.jobs.length}
                    </span>
                  </div>

                {/* Stage Cards */}
                <div className="space-y-3">
                  {stage.jobs.map((job) => {
                    const status = statusBadge(job.status);
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className="group bg-card border border-border rounded-xl p-4 hover:border-accent/50 cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md animate-in fade-in"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                            {job.title}
                          </h4>
                          <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                            #{job.id.slice(0, 6)}
                          </span>
                        </div>

                        {/* Budget */}
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground mb-3">
                          <Coins className="w-3.5 h-3.5 text-accent" />
                          <span>{job.budget ? `ETB ${Number(job.budget).toLocaleString()}` : "Budget Pending"}</span>
                        </div>

                        {/* Parties */}
                        <div className="space-y-1.5 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 truncate">
                              <User className="w-3 h-3 text-sky-400" />
                              <strong className="text-foreground">{job.clientName}</strong>
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 truncate">
                              <Wrench className="w-3 h-3 text-emerald-400" />
                              <span>{job.workerName || "Unassigned"}</span>
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {formatAge(job.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {stage.jobs.length === 0 && (
                    <div className="py-8 text-center border border-dashed border-border/80 rounded-xl">
                      <p className="text-xs text-muted-foreground">{t("admin.jobs.stage.empty")}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* ── 5. View Mode: DATA TABLE (Inspired by deals.tsx) ── */}
      {viewMode === "table" && (
        <Card className="border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-secondary/30">
                  <th className="py-3 px-4">{t("admin.jobs.table.title")}</th>
                  <th className="py-3 px-4">{t("admin.jobs.table.client")}</th>
                  <th className="py-3 px-4">{t("admin.jobs.table.worker")}</th>
                  <th className="py-3 px-4">{t("admin.jobs.table.budget")}</th>
                  <th className="py-3 px-4">{t("admin.jobs.table.status")}</th>
                  <th className="py-3 px-4 text-right">{t("admin.jobs.table.date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((j) => {
                  const status = statusBadge(j.status);
                  const StatusIcon = status.icon;
                  return (
                    <tr
                      key={j.id}
                      onClick={() => setSelectedJob(j)}
                      className="hover:bg-secondary/30 transition-colors cursor-pointer group"
                    >
                      {/* Job Title */}
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <p className="font-semibold text-foreground text-xs truncate max-w-xs group-hover:text-accent transition-colors">
                          {j.title}
                        </p>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          #{j.id.slice(0, 8)}
                        </span>
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4 text-foreground font-medium">
                        {j.clientName}
                      </td>

                      {/* Worker */}
                      <td className="py-3.5 px-4 text-foreground font-medium">
                        {j.workerName || <span className="text-muted-foreground italic">Unassigned</span>}
                      </td>

                      {/* Budget */}
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-foreground">
                        {j.budget ? `ETB ${Number(j.budget).toLocaleString()}` : "Negotiable"}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className={cn("text-[11px] font-semibold flex items-center gap-1 w-fit", status.color)}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{status.label}</span>
                        </Badge>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right text-muted-foreground font-mono text-[11px]">
                        {formatDate(j.createdAt)}
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted-foreground">
                      <Briefcase className="mx-auto h-8 w-8 opacity-30 mb-2" />
                      <p className="text-xs font-semibold text-foreground">
                        {t("admin.jobs.noJobs")}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Slide-out Job Details Drawer (Unboxed Clean Design) ── */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setSelectedJob(null)}
          />
          <div className="relative w-full max-w-md bg-card border-l border-border h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                    Job #{selectedJob.id.slice(0, 8)}
                  </span>
                  <Badge variant="outline" className={cn("text-[10px] font-bold uppercase", statusBadge(selectedJob.status).color)}>
                    {statusBadge(selectedJob.status).label}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-foreground line-clamp-2 leading-snug">
                  {selectedJob.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body - Unwrapped & Clean */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* If disputed, prominent arbitration alert with direct action */}
              {(selectedJob.status === "disputed" || selectedJob.status === "rejected") && (
                <div className="py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      {t("admin.jobs.drawer.activeDispute")}
                    </span>
                    <Badge variant="outline" className="border-rose-500/30 text-rose-500 text-[10px] font-bold uppercase">
                      {t("admin.jobs.drawer.actionRequired")}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 leading-relaxed">
                    {t("admin.jobs.drawer.disputeNotice")}
                  </p>
                  <Link
                    href="/admin/disputes"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-300 hover:underline pt-1"
                  >
                    <span>{t("admin.jobs.drawer.openDispute")}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Clean Unboxed Agreed Budget Hero */}
              <div className="flex items-baseline justify-between pb-4 border-b border-border">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t("admin.jobs.drawer.escrowValue")}
                  </span>
                  <p className="text-3xl font-bold font-mono text-foreground mt-1">
                    {selectedJob.budget ? `ETB ${Number(selectedJob.budget).toLocaleString()}` : "Negotiable"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground">{t("admin.jobs.drawer.custodyStatus")}</span>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {selectedJob.status === "completed" ? t("admin.jobs.drawer.released") : t("admin.jobs.drawer.held")}
                  </p>
                </div>
              </div>

              {/* Clean Engagement Parties (NO individual nested boxes) */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  {t("admin.jobs.drawer.parties")}
                </span>

                <div className="divide-y divide-border/60">
                  {/* Client Row */}
                  <div className="py-2.5 flex items-center justify-between first:pt-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold text-xs shrink-0">
                        C
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-xs">{selectedJob.clientName}</p>
                        <p className="text-[10px] text-muted-foreground">{t("admin.jobs.drawer.client")}</p>
                      </div>
                    </div>
                    <Link
                      href="/admin/clients"
                      className="text-xs text-accent hover:underline font-semibold"
                    >
                      {t("admin.jobs.drawer.viewProfile")}
                    </Link>
                  </div>

                  {/* Worker Row */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
                        W
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-xs">
                          {selectedJob.workerName || t("admin.jobs.drawer.unassigned")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{t("admin.jobs.drawer.worker")}</p>
                      </div>
                    </div>
                    {selectedJob.workerName && (
                      <Link
                        href="/admin/workers"
                        className="text-xs text-accent hover:underline font-semibold"
                      >
                        {t("admin.jobs.drawer.viewProfile")}
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Clean Timeline Metadata */}
              <div className="space-y-2.5 pt-4 border-t border-border text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  {t("admin.jobs.drawer.chronology")}
                </span>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">{t("admin.jobs.drawer.orderDate")}:</span>
                  <span className="font-mono text-foreground">{formatDate(selectedJob.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">{t("admin.jobs.drawer.age")}:</span>
                  <span className="font-mono text-foreground">{formatAge(selectedJob.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">{t("admin.jobs.drawer.contract")}:</span>
                  <Link
                    href="/admin/contracts"
                    className="text-accent hover:underline font-semibold"
                  >
                    {t("admin.jobs.drawer.viewContract")}
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedJob(null)}
                className="text-xs cursor-pointer"
              >
                {t("admin.jobs.drawer.close")}
              </Button>
              {selectedJob.status === "disputed" && (
                <Link
                  href="/admin/disputes"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{t("admin.jobs.drawer.arbitrate")}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </FadeContent>
  );
}
