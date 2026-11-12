"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Scale, ChevronRight, Clock, CheckCircle2, ShieldAlert, Search, X, Gavel } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface AppealItem {
  id: string;
  reference: string;
  status: string;
  appeal_type: string;
  reason?: string;
  explanation?: string;
  appellant_name?: string;
  original_employee_id?: string;
  created_at: string;
}

interface Props {
  initialAppeals: AppealItem[];
}

export function AdminAppealsClient({ initialAppeals }: Props) {
  const { t } = useLanguage();
  const [appeals] = useState<AppealItem[]>(initialAppeals);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");

  const counts = useMemo(() => {
    return {
      all: appeals.length,
      pending: appeals.filter((a) => ["appeal_requested", "appeal_under_review"].includes(a.status)).length,
      resolved: appeals.filter((a) => ["appeal_resolved", "appeal_dismissed"].includes(a.status)).length,
    };
  }, [appeals]);

  const filteredAppeals = useMemo(() => {
    const q = search.toLowerCase().trim();
    return appeals.filter((a) => {
      const isPending = ["appeal_requested", "appeal_under_review"].includes(a.status);
      const isResolved = ["appeal_resolved", "appeal_dismissed"].includes(a.status);

      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && isPending) ||
        (filter === "resolved" && isResolved);

      const matchesSearch =
        !q ||
        a.reference.toLowerCase().includes(q) ||
        (a.appellant_name && a.appellant_name.toLowerCase().includes(q)) ||
        (a.reason && a.reason.toLowerCase().includes(q)) ||
        (a.appeal_type && a.appeal_type.toLowerCase().includes(q));

      return matchesFilter && matchesSearch;
    });
  }, [appeals, search, filter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "appeal_requested":
        return {
          label: "Pending Review",
          classes: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        };
      case "appeal_under_review":
        return {
          label: "Under Review",
          classes: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        };
      case "appeal_resolved":
        return {
          label: "Resolved",
          classes: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        };
      case "appeal_dismissed":
        return {
          label: "Dismissed",
          classes: "border-border bg-secondary text-muted-foreground",
        };
      default:
        return {
          label: status.replaceAll("_", " "),
          classes: "border-border bg-secondary text-foreground",
        };
    }
  };

  return (
    <div className="space-y-6 pb-24 w-full">
      {/* 1. Header (Clean deals.tsx style: No dots, no uppercase pill badges) */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {t("admin.appeals.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.appeals.desc")}
        </p>
      </div>

      {/* 2. KPI Summary Cards (deals.tsx / forecasting.tsx pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">{t("admin.appeals.kpi.total")}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground font-mono mt-1">{counts.all}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{t("admin.appeals.kpi.pending")}</p>
          <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono mt-1">{counts.pending}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{t("admin.appeals.kpi.resolved")}</p>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono mt-1">{counts.resolved}</p>
        </div>
      </div>

      {/* 3. Floating Search & Filters (OUTSIDE table container - strictly matching deals.tsx) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.appeals.searchPlaceholder")}
              className="w-72 h-9 pl-9 pr-8 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: t("admin.appeals.filter.all"), count: counts.all },
              { id: "pending", label: t("admin.appeals.filter.pending"), count: counts.pending },
              { id: "resolved", label: t("admin.appeals.filter.resolved"), count: counts.resolved },
            ].map((tab) => {
              const isSelected = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Table Container (Isolated card, clean structure) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("admin.appeals.table.case")}
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("admin.appeals.table.appellant")}
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("admin.appeals.table.originalDispute")}
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("admin.appeals.table.status")}
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("admin.appeals.table.date")}
                </th>
                <th className="py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                  {t("admin.appeals.table.action")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAppeals.map((appeal) => {
                const badge = getStatusBadge(appeal.status);
                return (
                  <tr
                    key={appeal.id}
                    className="hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-accent">
                      {appeal.reference}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-foreground">
                      {appeal.appellant_name || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      <span className="capitalize">{String(appeal.appeal_type).replaceAll("_", " ")}</span>
                      {appeal.reason && (
                        <span className="block text-[11px] text-foreground truncate max-w-xs">
                          {String(appeal.reason).replaceAll("_", " ")}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">
                      {new Date(appeal.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/appeals/${appeal.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                      >
                        <span>{t("admin.appeals.table.action")}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {filteredAppeals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto opacity-70 mb-2" />
                    <p className="text-xs font-semibold text-foreground">{t("admin.appeals.noAppeals")}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      All platform dispute and verification decisions are currently uncontested.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
