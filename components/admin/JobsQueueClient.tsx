"use client";

import { useState } from "react";
import { Search, Briefcase, Calendar } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import FadeContent from "@/components/ui/fade-content";

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
      return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    case "active":
    case "in_progress":
      return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
    case "pending":
      return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    case "disputed":
    case "rejected":
    case "cancelled":
      return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
    default:
      return "bg-surface-container-high text-on-surface-variant border border-outline-variant/40";
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
    <FadeContent blur duration={0.4} className="space-y-5 pb-10 max-w-full">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low px-6 py-5 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 dark:text-blue-400">
          {t("admin.portal" as any)}
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold text-on-surface tracking-tight">
          {t("admin.jobs.title" as any)}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant opacity-70">
          {t("admin.jobs.desc" as any)}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-on-surface-variant opacity-60" />
            <input
              type="text"
              placeholder={t("admin.jobs.searchPlaceholder" as any)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>
          
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider shrink-0 bg-surface-container px-3.5 py-1.5 rounded-full border border-outline-variant/40">
            {t("admin.jobs.total" as any)}: {filtered.length}
          </span>
        </div>

        {/* Status filters scrollbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar border-t border-outline-variant/40 pt-3">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 transition-all border ${
                statusFilter === status
                  ? "bg-on-surface text-surface border-on-surface shadow-sm"
                  : "bg-surface-container text-on-surface-variant border-outline-variant/40 hover:text-on-surface"
              }`}
            >
              {status === "all" ? t("admin.workers.filterAll" as any) : status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden transition-colors duration-300 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant space-y-3">
            <div className="w-16 h-16 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8 text-blue-500/60" />
            </div>
            <p className="text-sm font-black text-on-surface uppercase tracking-wider">{t("admin.jobs.noJobs" as any)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low/50">
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.jobs.table.title" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.jobs.table.client" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.jobs.table.worker" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.jobs.table.budget" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.jobs.table.status" as any)}
                  </th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.jobs.table.date" as any)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filtered.map((j) => (
                  <tr
                    key={j.id}
                    className="hover:bg-surface-container/50 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4 font-bold text-on-surface group-hover:text-blue-500 transition-colors">{j.title}</td>
                    <td className="px-5 py-4 text-on-surface-variant font-semibold">{j.clientName}</td>
                    <td className="px-5 py-4 text-on-surface-variant font-semibold">
                    {j.workerName || <span className="text-xs text-on-surface-variant/40 italic">{t("admin.verification.unassigned" as any)}</span>}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-on-surface">
                      {j.budget ? `${j.budget.toLocaleString()} ETB` : "Negotiable"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${statusClass(j.status)}`}>
                        {j.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-xs text-on-surface-variant font-semibold flex items-center justify-end gap-1.5">
                        <Calendar className="w-3.5 h-3.5 opacity-60" />
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
    </FadeContent>
  );
}
