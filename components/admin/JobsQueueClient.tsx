"use client";

import { useState } from "react";
import { Search, Briefcase, Calendar } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface JobData {
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
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusClass(status: string) {
  switch (status) {
    case "completed":
      return "badge-success";
    case "active":
    case "in_progress":
      return "badge-info";
    case "pending":
      return "badge-warning";
    case "disputed":
    case "rejected":
    case "cancelled":
      return "badge-danger";
    default:
      return "bg-surface-container-high text-on-surface-variant";
  }
}

export function JobsQueueClient({ initialJobs }: Props) {
  const { t } = useLanguage();
  const [jobs] = useState<JobData[]>(initialJobs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = jobs.filter((j) => {
    const query = search.toLowerCase();
    const matchesSearch =
      j.title.toLowerCase().includes(query) ||
      j.clientName.toLowerCase().includes(query) ||
      (j.workerName && j.workerName.toLowerCase().includes(query));

    const matchesStatus = statusFilter === "all" || j.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statuses = ["all", "pending", "active", "in_progress", "completed", "disputed", "cancelled"];

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-10">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4 transition-colors duration-300">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {t("admin.portal" as any)}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-on-surface tracking-tight">
          {t("admin.jobs.title" as any)}
        </h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">
          {t("admin.jobs.desc" as any)}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder={t("admin.jobs.searchPlaceholder" as any)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container pl-9 pr-4 py-2 rounded-lg border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-all"
            />
          </div>
          
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider shrink-0">
            {t("admin.jobs.total" as any)}: {filtered.length}
          </span>
        </div>

        {/* Status filters scrollbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar border-t border-outline-variant/60 pt-3">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                statusFilter === status
                  ? "bg-on-surface text-surface shadow-sm"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {status === "all" ? t("admin.workers.filterAll" as any) : status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden transition-colors duration-300 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant">
            <Briefcase className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-2" />
            <p className="text-sm font-semibold">{t("admin.jobs.noJobs" as any)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/50">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.jobs.table.title" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.jobs.table.client" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.jobs.table.worker" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.jobs.table.budget" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.jobs.table.status" as any)}
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.jobs.table.date" as any)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((j) => (
                  <tr
                    key={j.id}
                    className="hover:bg-surface-container transition-colors duration-150"
                  >
                    <td className="px-4 py-3 font-bold text-on-surface">{j.title}</td>
                    <td className="px-4 py-3 text-on-surface-variant font-medium">{j.clientName}</td>
                    <td className="px-4 py-3 text-on-surface-variant font-medium">
                      {j.workerName || <span className="text-xs text-on-surface-variant/50 italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-on-surface">
                      {j.budget ? `${j.budget.toLocaleString()} ETB` : "Negotiable"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusClass(j.status)}`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-on-surface-variant font-medium flex items-center justify-end gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(j.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
