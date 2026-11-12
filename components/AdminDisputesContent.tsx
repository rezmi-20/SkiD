"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Scale,
  UserRound,
  Wrench,
  ArrowRight,
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  BadgeAlert,
  Coins,
  ShieldCheck,
  Eye,
  LayoutGrid,
  Table as TableIcon,
  Columns,
  ExternalLink,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import FadeContent from "@/components/ui/fade-content";
import { DisputeReviewDrawer, DisputeQueueItem } from "./admin/disputes/DisputeReviewDrawer";
import { useLanguage } from "@/context/LanguageContext";

interface DisputeRow {
  id: string;
  job_id: string;
  title: string | null;
  job_title?: string | null;
  category: string | null;
  requested_resolution: string | null;
  description?: string | null;
  status: string;
  payment_status: string | null;
  amount?: number | string | null;
  client_name: string | null;
  worker_name: string | null;
  assigned_admin_name: string | null;
  created_at: string;
}

const CATEGORY_COLUMNS = [
  {
    id: "work_quality",
    name: "Work Quality & Defects",
    icon: Wrench,
    match: (c: string | null) => c === "work_quality" || c === "quality",
    description: "Substandard craft, material defect, or incomplete specifications",
  },
  {
    id: "payment_issue",
    name: "Milestone & Escrow",
    icon: Coins,
    match: (c: string | null) => c === "payment_issue" || c === "payment" || c === "escrow",
    description: "Escrow release dispute, unauthorized charges, or refund claims",
  },
  {
    id: "work_not_completed",
    name: "Non-Completion & Delays",
    icon: Clock,
    match: (c: string | null) => c === "work_not_completed" || c === "delay" || c === "abandonment",
    description: "Project abandonment, unexcused delays, or deadline breach",
  },
  {
    id: "contract_violation",
    name: "Contract Breach & Conduct",
    icon: Scale,
    match: (c: string | null) =>
      c === "contract_violation" || c === "misconduct" || c === "cancellation_disagreement" || c === "other" || !c,
    description: "Scope breach, safety violation, communication breakdown, misconduct",
  },
];

function statusClass(status: string) {
  if (status === "resolved") {
    return "bg-success/10 text-success border-success/20";
  }
  if (status === "escalated") {
    return "bg-destructive/10 text-destructive border-destructive/20";
  }
  if (status === "dismissed") {
    return "bg-secondary text-muted-foreground border-border";
  }
  if (status === "evidence_review") {
    return "bg-accent/10 text-accent border-accent/20";
  }
  return "bg-warning/10 text-warning border-warning/20";
}

function formatAge(value: string) {
  const hours = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 3_600_000));
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDisputesContent({ initialDisputes }: { initialDisputes: DisputeRow[] }) {
  const { t } = useLanguage();
  const [queue, setQueue] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");
  const [search, setSearch] = useState("");
  const [drawerDispute, setDrawerDispute] = useState<DisputeQueueItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const query = search.trim().toLowerCase();

  const categories = useMemo(
    () => [
      {
        id: "work_quality",
        name: t("admin.disputes.cat.quality"),
        icon: Wrench,
        match: (c: string | null) => c === "work_quality" || c === "quality",
        description: t("admin.disputes.cat.qualityDesc"),
      },
      {
        id: "payment_issue",
        name: t("admin.disputes.cat.escrow"),
        icon: Coins,
        match: (c: string | null) => c === "payment_issue" || c === "payment" || c === "escrow",
        description: t("admin.disputes.cat.escrowDesc"),
      },
      {
        id: "work_not_completed",
        name: t("admin.disputes.cat.delay"),
        icon: Clock,
        match: (c: string | null) => c === "work_not_completed" || c === "delay" || c === "abandonment",
        description: t("admin.disputes.cat.delayDesc"),
      },
      {
        id: "contract_violation",
        name: t("admin.disputes.cat.breach"),
        icon: Scale,
        match: (c: string | null) =>
          c === "contract_violation" || c === "misconduct" || c === "cancellation_disagreement" || c === "other" || !c,
        description: t("admin.disputes.cat.breachDesc"),
      },
    ],
    [t]
  );

  const counts = useMemo(() => {
    return {
      open: initialDisputes.filter((d) => d.status === "open").length,
      under_review: initialDisputes.filter((d) => d.status === "under_review").length,
      evidence_review: initialDisputes.filter((d) => d.status === "evidence_review").length,
      escalated: initialDisputes.filter((d) => d.status === "escalated").length,
      resolved: initialDisputes.filter((d) => d.status === "resolved").length,
      all: initialDisputes.length,
    };
  }, [initialDisputes]);

  const activeDisputesCount = counts.open + counts.under_review + counts.evidence_review;

  const totalDisputedEscrow = useMemo(() => {
    return initialDisputes
      .filter((d) => !["resolved", "dismissed"].includes(d.status))
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);
  }, [initialDisputes]);

  const resolvedTotal = counts.resolved;

  const filteredDisputes = useMemo(
    () =>
      initialDisputes.filter((row) => {
        const matchesQueue = queue === "all" || row.status === queue;
        const haystack = [
          row.id,
          row.title,
          row.job_title,
          row.category,
          row.status,
          row.client_name,
          row.worker_name,
          row.payment_status,
          row.assigned_admin_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return matchesQueue && (!query || haystack.includes(query));
      }),
    [initialDisputes, query, queue],
  );

  const handleOpenDrawer = (dispute: DisputeRow) => {
    setDrawerDispute(dispute);
    setIsDrawerOpen(true);
  };

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("admin.disputes.hub.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("admin.disputes.hub.desc")}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("pipeline")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === "pipeline"
                ? "bg-secondary text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{t("admin.disputes.hub.view.pipeline")}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === "table"
                ? "bg-secondary text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>{t("admin.disputes.hub.view.table")}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards (Elevated, Hairline borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("admin.disputes.kpi.active")}</p>
            <p className="text-xl font-bold text-foreground mt-1 tabular-nums">{activeDisputesCount}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t("admin.disputes.kpi.activeDesc")}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("admin.disputes.kpi.escrowHold")}</p>
            <p className="text-xl font-bold font-mono text-accent mt-1 tabular-nums">
              ETB {totalDisputedEscrow.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t("admin.disputes.kpi.escrowHoldDesc")}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("admin.disputes.kpi.escalated")}</p>
            <p className="text-xl font-bold text-foreground mt-1 tabular-nums">{counts.escalated}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t("admin.disputes.kpi.escalatedDesc")}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("admin.disputes.kpi.resolved")}</p>
            <p className="text-xl font-bold text-foreground mt-1 tabular-nums">{resolvedTotal}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t("admin.disputes.kpi.resolvedDesc")}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-success/10 text-success flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar (Uncontained) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.disputes.searchPlaceholder")}
            className="w-full h-9 pl-9 pr-8 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition"
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

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: t("admin.disputes.filter.all") },
            { id: "open", label: t("admin.disputes.filter.open") },
            { id: "under_review", label: t("admin.disputes.filter.under_review") },
            { id: "evidence_review", label: t("admin.disputes.filter.evidence_review") },
            { id: "resolved", label: t("admin.disputes.filter.resolved") },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setQueue(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                queue === item.id
                  ? "bg-accent text-accent-foreground shadow-xs font-bold"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Presentation: Pipeline Board (Inspired by pipeline.tsx) or Table View */}
      {viewMode === "pipeline" ? (
        <div className="overflow-x-auto pb-4 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[900px] xl:min-w-0">
            {categories.map((column, colIdx) => {
              const ColumnIcon = column.icon;
              const columnDisputes = filteredDisputes.filter((d) => column.match(d.category));
              const columnEscrow = columnDisputes.reduce((sum, d) => sum + Number(d.amount || 0), 0);

              return (
                <div
                  key={column.id}
                  className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between min-h-[480px] shadow-xs animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${colIdx * 100}ms`, animationFillMode: "both" }}
                >
                  <div>
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <ColumnIcon className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-foreground truncate">{column.name}</h3>
                          <p className="text-[10px] text-muted-foreground truncate">{column.description}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-secondary border border-border text-[11px] font-mono font-bold text-foreground shrink-0">
                        {columnDisputes.length}
                      </span>
                    </div>

                    {/* Escrow Subtotal for Column */}
                    <div className="flex items-center justify-between text-[11px] mb-3 px-1">
                      <span className="text-muted-foreground">{t("admin.disputes.card.protectedEscrow")}:</span>
                      <span className="font-mono font-bold text-foreground">
                        ETB {columnEscrow.toLocaleString()}
                      </span>
                    </div>

                    {/* Cards inside column */}
                    <div className="space-y-3">
                      {columnDisputes.map((dispute, cardIdx) => (
                        <div
                          key={dispute.id}
                          className="group bg-secondary/30 hover:bg-secondary/60 border border-border hover:border-accent/40 rounded-xl p-3.5 transition-all duration-200 shadow-2xs space-y-3 animate-in fade-in slide-in-from-bottom-2"
                          style={{ animationDelay: `${cardIdx * 50}ms`, animationFillMode: "both" }}
                        >
                          {/* Card Top: Case ID & Status Badge */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                              #{dispute.id.slice(0, 8)}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusClass(
                                dispute.status
                              )}`}
                            >
                              <span className="capitalize">{dispute.status.replace("_", " ")}</span>
                            </span>
                          </div>

                          {/* Card Title */}
                          <div>
                            <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-accent transition">
                              {dispute.title || dispute.job_title || "Disputed Contract Milestone"}
                            </h4>
                          </div>

                          {/* Escrow Value Badge */}
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-lg">
                            <Coins className="w-3.5 h-3.5" />
                            <span>ETB {Number(dispute.amount || 0).toLocaleString()}</span>
                          </div>

                          {/* Disputing Parties */}
                          <div className="space-y-1 text-[11px] pt-1">
                            <div className="flex items-center justify-between text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <UserRound className="w-3 h-3 text-sky-400 shrink-0" />
                                <span className="truncate max-w-[100px]">{dispute.client_name || "Client"}</span>
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {formatAge(dispute.created_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Wrench className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{dispute.worker_name || "Artisan"}</span>
                            </div>
                          </div>

                          {/* Card Actions: Slide Reviewer Drawer + Studio */}
                          <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenDrawer(dispute)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-card hover:bg-secondary text-foreground font-semibold border border-border transition shadow-2xs cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-muted-foreground" />
                              <span>{t("admin.disputes.card.review")}</span>
                            </button>

                            <Link
                              href={`/admin/disputes/${dispute.id}`}
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg text-muted-foreground hover:text-accent font-semibold transition cursor-pointer"
                            >
                              <span>{t("admin.disputes.card.studio")}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))}

                      {columnDisputes.length === 0 && (
                        <div className="py-10 text-center text-xs text-muted-foreground/60 border border-dashed border-border/70 rounded-xl">
                          {t("admin.disputes.card.emptyCategory")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-secondary/50">
                  <th className="py-3 px-4">{t("admin.disputes.table.case")}</th>
                  <th className="py-3 px-4">{t("admin.disputes.table.parties")}</th>
                  <th className="py-3 px-4">{t("admin.disputes.table.escrow")}</th>
                  <th className="py-3 px-4">{t("admin.disputes.table.status")}</th>
                  <th className="py-3 px-4">{t("admin.disputes.table.mediator")}</th>
                  <th className="py-3 px-4 text-right">{t("admin.disputes.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredDisputes.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-secondary/40 transition-colors group">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-foreground text-xs line-clamp-1">{dispute.title || "Dispute"}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">#{dispute.id.slice(0, 8)} · {formatAge(dispute.created_at)}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs">
                      <p className="text-foreground font-medium flex items-center gap-1">
                        <UserRound className="w-3 h-3 text-sky-400" />
                        <span>{dispute.client_name || "Client"}</span>
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Wrench className="w-3 h-3 text-emerald-400" />
                        <span>{dispute.worker_name || "Artisan"}</span>
                      </p>
                    </td>

                    <td className="py-3 px-4 text-xs font-mono font-bold text-foreground">
                      ETB {Number(dispute.amount || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusClass(dispute.status)}`}>
                        <span className="capitalize">{dispute.status.replace("_", " ")}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {dispute.assigned_admin_name || "Unassigned"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDrawer(dispute)}
                          className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{t("admin.disputes.card.review")}</span>
                        </button>

                        <Link
                          href={`/admin/disputes/${dispute.id}`}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-medium transition cursor-pointer"
                        >
                          <span>{t("admin.disputes.card.studio")}</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-out Review Sheet Drawer (Retained 100% per user instructions) */}
      <DisputeReviewDrawer
        dispute={drawerDispute}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </FadeContent>
  );
}
