"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  X,
  ExternalLink,
  ShieldCheck,
  User,
  Wrench,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  MapPin,
  Calendar,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeContent from "@/components/ui/fade-content";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ContractDetailDrawer, ContractDrawerItem } from "./contracts/ContractDetailDrawer";
import { AdminUnauthorizedNoticeModal, UnauthorizedNoticeData } from "@/components/admin/modals/AdminUnauthorizedNoticeModal";

export interface ContractData {
  id: string;
  jobTitle: string;
  clientName: string;
  workerName: string;
  clientSignedAt: string | null;
  workerSignedAt: string | null;
  signedAt: string | null;
  pdfUrl: string | null;
  amount?: number;
  status?: string | null;
  termsStatus?: string | null;
  workLocation?: string | null;
  createdAt?: string | null;
}

interface Props {
  initialContracts: ContractData[];
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ContractsOversightClient({ initialContracts }: Props) {
  const { t } = useLanguage();
  const [contracts] = useState<ContractData[]>(initialContracts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "executed" | "pending">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [drawerContract, setDrawerContract] = useState<ContractDrawerItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [authNotice, setAuthNotice] = useState<UnauthorizedNoticeData | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadContract = async (contractId: string, jobTitle?: string) => {
    setDownloadingId(contractId);
    try {
      const res = await fetch(`/api/contracts/${contractId}/pdf`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        let errorMsg = "You do not have administrative clearance to export this contract PDF, or the contract is awaiting required signatures.";
        try {
          const json = await res.json();
          if (json.message) errorMsg = json.message;
          else if (json.error) errorMsg = json.error;
        } catch {
          // fallback
        }

        setAuthNotice({
          isOpen: true,
          title: res.status === 401 ? "Authentication Required" : res.status === 403 ? "Access Restricted" : "Contract Notice",
          message: errorMsg,
          contractId,
        });
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeTitle = (jobTitle || "contract").toLowerCase().replace(/[^a-z0-9_-]/g, "_");
      a.download = `DireSkill_Contract_${safeTitle}_${contractId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setAuthNotice({
        isOpen: true,
        title: "Network or Access Error",
        message: err?.message || "Failed to establish a secure connection to fetch the contract document.",
        contractId,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const counts = useMemo(() => {
    return {
      all: contracts.length,
      executed: contracts.filter((c) => Boolean(c.signedAt)).length,
      pending: contracts.filter((c) => !c.signedAt).length,
    };
  }, [contracts]);

  const totalEscrow = useMemo(() => {
    return contracts.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  }, [contracts]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return contracts.filter((c) => {
      const isExecuted = Boolean(c.signedAt);
      const matchesFilter =
        filter === "all" ||
        (filter === "executed" && isExecuted) ||
        (filter === "pending" && !isExecuted);

      const matchesSearch =
        !query ||
        c.jobTitle.toLowerCase().includes(query) ||
        c.clientName.toLowerCase().includes(query) ||
        c.workerName.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [contracts, search, filter]);

  const handleOpenDrawer = (c: ContractData) => {
    setDrawerContract(c);
    setIsDrawerOpen(true);
  };

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full">
      {/* 1. Flush, Unboxed Header (deals.tsx style: No dots, no uppercase pill badges) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("admin.contracts.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("admin.contracts.desc")}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === "grid"
                ? "bg-secondary text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t("admin.contracts.view.agreements")}</span>
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
            <span>{t("admin.contracts.view.table")}</span>
          </button>
        </div>
      </div>

      {/* ── 2. 4 KPI Summary Cards (deals.tsx & forecasting.tsx exact pattern) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("admin.contracts.kpi.total")}</p>
                <p className="text-2xl font-bold font-mono text-foreground mt-1">{counts.all}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("admin.contracts.kpi.totalDesc")}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("admin.contracts.kpi.executed")}</p>
                <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{counts.executed}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("admin.contracts.kpi.executedDesc")}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("admin.contracts.kpi.pending")}</p>
                <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{counts.pending}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("admin.contracts.kpi.pendingDesc")}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("admin.contracts.kpi.escrow")}</p>
                <p className="text-2xl font-bold font-mono text-foreground mt-1">ETB {totalEscrow.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("admin.contracts.kpi.escrowDesc")}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-secondary text-foreground flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Floating Search & Filter Toolbar (OUTSIDE cards/tables - strictly matching deals.tsx) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.contracts.searchPlaceholder")}
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

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: "all", label: t("admin.contracts.filter.all"), count: counts.all },
            { id: "executed", label: t("admin.contracts.filter.executed"), count: counts.executed },
            { id: "pending", label: t("admin.contracts.filter.pending"), count: counts.pending },
          ].map((item) => {
            const isSelected = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id as typeof filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-accent text-accent-foreground font-bold shadow-xs"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isSelected
                      ? "bg-accent-foreground/20 text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Agreement Cards Grid vs Table View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((c) => {
            const isExecuted = Boolean(c.signedAt);
            const clientSigned = Boolean(c.clientSignedAt);
            const workerSigned = Boolean(c.workerSignedAt);

            return (
              <div
                key={c.id}
                className="rounded-xl border border-border bg-card p-5 space-y-4 hover:border-accent/40 transition-all duration-200 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top row: Job title & Escrow amount */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                          #{c.id.slice(0, 8)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isExecuted
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {isExecuted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          <span>
                            {isExecuted ? t("admin.contracts.drawer.executed") : t("admin.contracts.drawer.awaiting")}
                          </span>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground line-clamp-1">{c.jobTitle}</h3>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-base text-foreground">
                        ETB {Number(c.amount || 0).toLocaleString()}
                      </p>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {c.status ? c.status.toLowerCase() : t("admin.contracts.active")}
                      </span>
                    </div>
                  </div>

                  {/* Bipartite Signature Rows - Clean Unboxed Design (NO pulsing dots) */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      {t("admin.contracts.signingStatus")}
                    </span>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-secondary/50 border border-border/60">
                        <div className="flex items-center gap-2 truncate">
                          <User className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span className="truncate text-xs font-medium text-foreground">{c.clientName}</span>
                          <span className="text-[10px] text-muted-foreground">({t("admin.contracts.drawer.employer")})</span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            clientSigned
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {clientSigned ? t("admin.contracts.signed") : t("admin.contracts.pending")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-secondary/50 border border-border/60">
                        <div className="flex items-center gap-2 truncate">
                          <Wrench className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate text-xs font-medium text-foreground">{c.workerName}</span>
                          <span className="text-[10px] text-muted-foreground">({t("admin.contracts.drawer.artisan")})</span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            workerSigned
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {workerSigned ? t("admin.contracts.signed") : t("admin.contracts.pending")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Metadata */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>{c.workLocation || "Dire Dawa, ET"}</span>
                    </span>
                    {c.signedAt && (
                      <span className="font-mono text-[11px]">
                        {t("admin.contracts.table.signed")}: {formatDate(c.signedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDrawer(c)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold border border-border transition cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-muted-foreground" />
                    <span>{t("admin.contracts.quickInspect")}</span>
                  </button>

                  <button
                    type="button"
                    disabled={downloadingId === c.id}
                    onClick={() => handleDownloadContract(c.id, c.jobTitle)}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-semibold border border-accent/20 transition cursor-pointer disabled:opacity-50"
                  >
                    <Download className={cn("w-3.5 h-3.5", downloadingId === c.id && "animate-spin")} />
                    <span>{downloadingId === c.id ? t("admin.contracts.drawer.verifyingAccess") : t("admin.contracts.downloadPdf")}</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground rounded-xl border border-dashed border-border bg-card">
              <FileText className="mx-auto h-8 w-8 opacity-30 mb-2" />
              <p className="text-xs font-semibold text-foreground">
                {t("admin.contracts.noContracts")}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                  <th className="py-3 px-4">{t("admin.contracts.table.job")}</th>
                  <th className="py-3 px-4">{t("admin.contracts.table.client")}</th>
                  <th className="py-3 px-4">{t("admin.contracts.table.worker")}</th>
                  <th className="py-3 px-4">{t("admin.contracts.kpi.escrow")}</th>
                  <th className="py-3 px-4">{t("admin.contracts.table.status")}</th>
                  <th className="py-3 px-4 text-right">{t("admin.contracts.table.pdf")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => {
                  const isExecuted = Boolean(c.signedAt);
                  const clientSigned = Boolean(c.clientSignedAt);
                  const workerSigned = Boolean(c.workerSignedAt);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-secondary/30 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground text-xs line-clamp-1">{c.jobTitle}</p>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            #{c.id.slice(0, 8)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-medium">{c.clientName}</span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                              clientSigned
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {clientSigned ? t("admin.contracts.signed") : t("admin.contracts.pending")}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-medium">{c.workerName}</span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                              workerSigned
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {workerSigned ? t("admin.contracts.signed") : t("admin.contracts.pending")}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        ETB {Number(c.amount || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isExecuted
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }`}
                        >
                          <span>{isExecuted ? t("admin.contracts.signed") : t("admin.contracts.pending")}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(c)}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold border border-border transition cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-muted-foreground" />
                            <span>{t("admin.contracts.quickInspect")}</span>
                          </button>

                          <button
                            type="button"
                            disabled={downloadingId === c.id}
                            onClick={() => handleDownloadContract(c.id, c.jobTitle)}
                            className="p-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 transition cursor-pointer disabled:opacity-50"
                            title={t("admin.contracts.downloadPdf")}
                          >
                            <Download className={cn("w-3.5 h-3.5", downloadingId === c.id && "animate-spin")} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-muted-foreground">
                      <FileText className="mx-auto h-8 w-8 opacity-30 mb-2" />
                      <p className="text-xs font-semibold text-foreground">
                        {t("admin.contracts.noContracts")}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-out Review Sheet Drawer */}
      <ContractDetailDrawer
        contract={drawerContract}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onDownloadPdf={handleDownloadContract}
        isDownloading={Boolean(drawerContract && downloadingId === drawerContract.id)}
      />

      {/* Unauthorized / Access Notice Popup Dialog Modal */}
      <AdminUnauthorizedNoticeModal
        notice={authNotice}
        onClose={() => setAuthNotice(null)}
      />
    </FadeContent>
  );
}
