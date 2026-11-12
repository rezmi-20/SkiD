"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  ShieldCheck,
  Search,
  RotateCcw,
  Calendar,
  Layers,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AuditEntry {
  id: string;
  created_at: unknown;
  actor_name?: string | null;
  actor_employee_id?: string | null;
  actor_type?: string | null;
  actor_role?: string | null;
  action: string;
  module?: string | null;
  target_id?: string | null;
  target_type?: string | null;
  reason?: string | null;
  ip_address?: string | null;
}

interface AdminAuditClientProps {
  entries: AuditEntry[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  params: {
    q?: string;
    module?: string;
    from?: string;
    to?: string;
    highRisk?: string;
  };
}

function formatDate(value: unknown) {
  if (!value) return "Not recorded";
  return new Date(String(value)).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActorBadge(role: string = "") {
  switch (role) {
    case "super_admin":
      return "border-purple-200/50 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300";
    case "dispute_payment_admin":
      return "border-blue-200/50 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";
    case "content_verification_admin":
      return "border-emerald-200/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "user_support_admin":
      return "border-amber-200/50 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    case "system":
      return "border-slate-200/50 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "border-slate-200/50 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
  }
}

export function AdminAuditClient({
  entries,
  totalCount,
  totalPages,
  currentPage,
  params,
}: AdminAuditClientProps) {
  const { t } = useLanguage();

  const hasActiveFilters = Boolean(
    params.q || params.module || params.from || params.to || params.highRisk === "1"
  );

  return (
    <div className="space-y-6 w-full pb-24">
      {/* 1. Header (deals.tsx style: Clean h1 + p, no dots, no pill badges) */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {t("admin.audit.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.audit.desc")}
        </p>
      </div>

      {/* 2. Quick Stat Cards (deals.tsx metric cards style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t("admin.audit.kpi.total")}
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
              {totalCount.toLocaleString()}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t("admin.audit.table.module")}
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
              {params.module ? params.module.toUpperCase() : t("admin.audit.allModules")}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t("admin.audit.table.timestamp")}
            </p>
            <p className="text-base font-semibold text-foreground mt-1">
              {entries.length > 0 ? formatDate(entries[0].created_at) : "—"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. Floating Filter Bar (deals.tsx pattern - floating above table, never in table container) */}
      <form
        method="GET"
        className="p-4 bg-card border border-border rounded-xl shadow-xs space-y-3"
      >
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-6 items-end">
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("admin.audit.search")}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                name="q"
                defaultValue={params.q || ""}
                placeholder={t("admin.audit.search")}
                className="w-full rounded-lg border border-border bg-secondary pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("admin.audit.module")}
            </label>
            <select
              name="module"
              defaultValue={params.module || ""}
              className="w-full rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
            >
              <option value="">{t("admin.audit.allModules")}</option>
              <option value="verification">Verification</option>
              <option value="disputes">Disputes</option>
              <option value="governance">Governance</option>
              <option value="support">Support</option>
              <option value="admin_accounts">Admin Accounts</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("admin.audit.fromDate")}
            </label>
            <input
              type="date"
              name="from"
              defaultValue={params.from || ""}
              className="w-full rounded-lg border border-border bg-secondary px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("admin.audit.toDate")}
            </label>
            <input
              type="date"
              name="to"
              defaultValue={params.to || ""}
              className="w-full rounded-lg border border-border bg-secondary px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-accent text-accent-foreground hover:opacity-90 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              {t("admin.audit.filterBtn")}
            </button>
            {hasActiveFilters && (
              <Link
                href="/admin/audit"
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground bg-secondary transition-colors"
                title={t("admin.audit.resetBtn")}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </form>

      {/* 4. Standalone Data Table Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary/50">
                <th className="px-4 py-3">{t("admin.audit.table.timestamp")}</th>
                <th className="px-4 py-3">{t("admin.audit.table.actor")}</th>
                <th className="px-4 py-3">{t("admin.audit.table.action")}</th>
                <th className="px-4 py-3">{t("admin.audit.table.target")}</th>
                <th className="px-4 py-3">{t("admin.audit.table.details")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-muted-foreground">
                    <p className="font-semibold text-foreground">{t("admin.audit.noLogs")}</p>
                    <p className="text-xs mt-0.5 text-muted-foreground">{t("admin.audit.noLogsDesc")}</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const roleBadge = getActorBadge(entry.actor_role || "");
                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {formatDate(entry.created_at)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">
                            {entry.actor_name || entry.actor_employee_id || entry.actor_type || "System"}
                          </p>
                          <span
                            className={`inline-block rounded-md border px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${roleBadge}`}
                          >
                            {String(entry.actor_role || entry.actor_type || "system").replaceAll("_", " ")}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground uppercase tracking-tight text-[11px]">
                            {String(entry.action).replaceAll("_", " ")}
                          </p>
                          <span className="font-mono text-[10px] text-muted-foreground uppercase">
                            {entry.module || "General"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] font-semibold text-foreground">
                            {entry.target_id ? `#${String(entry.target_id).slice(0, 8)}` : "—"}
                          </span>
                          {entry.target_type && (
                            <p className="text-[10px] text-muted-foreground capitalize">{entry.target_type}</p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 max-w-xs">
                        <div className="space-y-0.5">
                          {entry.reason && (
                            <p className="text-foreground italic truncate max-w-xs">
                              "{entry.reason}"
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            IP: {entry.ip_address || t("admin.audit.internal")}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3.5 border-t border-border text-xs bg-secondary/30">
            <span className="text-muted-foreground">
              {t("admin.audit.page")} {currentPage} {t("admin.audit.of")} {totalPages}
            </span>
            <div className="flex items-center gap-1">
              {currentPage > 1 && (
                <Link
                  href={`/admin/audit?page=${currentPage - 1}`}
                  className="px-2.5 py-1 rounded-lg border border-border text-foreground hover:bg-secondary bg-card inline-flex items-center gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  {t("admin.audit.previous")}
                </Link>
              )}
              {currentPage < totalPages && (
                <Link
                  href={`/admin/audit?page=${currentPage + 1}`}
                  className="px-2.5 py-1 rounded-lg border border-border text-foreground hover:bg-secondary bg-card inline-flex items-center gap-1"
                >
                  {t("admin.audit.next")}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
