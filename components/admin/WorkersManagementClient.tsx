"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, ShieldCheck, ShieldAlert, CheckCircle, XCircle, ExternalLink, Award } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toggleWorkerVerification } from "@/lib/actions/admin";

interface WorkerData {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  skills: string[] | null;
  district: string | null;
  experienceYears: number | null;
  isVerified: boolean;
  faydaDocUrl: string | null;
  createdAt: string;
}

interface Props {
  initialWorkers: WorkerData[];
}

export function WorkersManagementClient({ initialWorkers }: Props) {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState<WorkerData[]>(initialWorkers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "pending">("all");
  const [isPending, startTransition] = useTransition();

  const handleToggleVerify = (userId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    startTransition(async () => {
      const res = await toggleWorkerVerification(userId, nextStatus);
      if (res.success) {
        setWorkers((prev) =>
          prev.map((w) => (w.userId === userId ? { ...w, isVerified: nextStatus } : w))
        );
      } else {
        alert(res.error || "Failed to update verification status.");
      }
    });
  };

  const filtered = workers.filter((w) => {
    const query = search.toLowerCase();
    const matchesSearch =
      w.fullName.toLowerCase().includes(query) ||
      w.email.toLowerCase().includes(query) ||
      (w.phone && w.phone.includes(query)) ||
      (w.skills && w.skills.some((s) => s.toLowerCase().includes(query)));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && w.isVerified) ||
      (statusFilter === "pending" && !w.isVerified);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-10">
      {/* Header Banner */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4 transition-colors duration-300">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {t("admin.portal" as any)}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-on-surface tracking-tight">
          {t("admin.workers.title" as any)}
        </h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">
          {t("admin.workers.desc" as any)}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant transition-colors duration-300">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder={t("admin.workers.searchPlaceholder" as any)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container pl-9 pr-4 py-2 rounded-lg border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-surface-container rounded-lg p-1 border border-outline-variant">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              statusFilter === "all"
                ? "bg-on-surface text-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t("admin.workers.filterAll" as any)}
          </button>
          <button
            onClick={() => setStatusFilter("verified")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              statusFilter === "verified"
                ? "bg-on-surface text-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t("admin.workers.filterVerified" as any)}
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              statusFilter === "pending"
                ? "bg-on-surface text-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t("admin.workers.filterPending" as any)}
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden transition-colors duration-300 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant">
            <ShieldAlert className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-2" />
            <p className="text-sm font-semibold">{t("admin.workers.noWorkers" as any)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container/50">
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.workers.table.name" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.workers.table.skills" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.workers.table.district" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hidden md:table-cell">
                    {t("admin.workers.table.experience" as any)}
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.workers.table.verification" as any)}
                  </th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {t("admin.workers.table.actions" as any)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filtered.map((w) => (
                  <tr
                    key={w.userId}
                    className="hover:bg-surface-container transition-colors duration-150"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-on-surface text-sm">{w.fullName}</p>
                        <p className="text-xs text-on-surface-variant">{w.email}</p>
                        {w.phone && (
                          <p className="text-[11px] text-on-surface-variant/80 font-mono mt-0.5">{w.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {w.skills && w.skills.length > 0 ? (
                          w.skills.map((s) => (
                            <span key={s} className="badge-info text-[10px]">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-on-surface-variant">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-on-surface">
                        {w.district || "Dire Dawa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface">
                        <Award className="w-3.5 h-3.5 text-primary" />
                        {w.experienceYears ?? 0} {t("admin.workers.table.years" as any)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold rounded-full px-2.5 py-0.5 ${
                          w.isVerified
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {w.isVerified ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {t("verification.status.approved" as any)}
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            {t("verification.status.pending" as any)}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {w.faydaDocUrl && (
                          <Link
                            href={`/admin/verify/${w.userId}`}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-surface-container text-on-surface-variant hover:bg-surface-container-high font-semibold transition-all border border-outline-variant"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {t("admin.action.review" as any)}
                          </Link>
                        )}
                        <button
                          disabled={isPending}
                          onClick={() => handleToggleVerify(w.userId, w.isVerified)}
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded font-bold transition-all disabled:opacity-50 border ${
                            w.isVerified
                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          {w.isVerified ? (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              {t("admin.action.reject" as any)}
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              {t("admin.action.verify" as any)}
                            </>
                          )}
                        </button>
                      </div>
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
