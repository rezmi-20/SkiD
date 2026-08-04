"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, ShieldCheck, ShieldAlert, CheckCircle, XCircle, ExternalLink, Award } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toggleWorkerVerification } from "@/lib/actions/admin";
import FadeContent from "@/components/ui/fade-content";
import { toWorkerDisplayStatus } from "@/lib/worker-verification";

interface WorkerData {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  skills: string[] | null;
  district: string | null;
  experienceYears: number | null;
  verificationStatus?: string | null;
  isVerified: boolean;
  isSuspended?: boolean | null;
  faydaDocUrl: string | null;
  createdAt: string;
}

interface Props {
  initialWorkers: WorkerData[];
  verificationCapabilities: {
    canReview: boolean;
    canApprove: boolean;
    canReject: boolean;
  };
}

export function WorkersManagementClient({ initialWorkers, verificationCapabilities }: Props) {
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
          prev.map((w) =>
            w.userId === userId
              ? {
                  ...w,
                  isVerified: nextStatus,
                  isSuspended: false,
                  verificationStatus: nextStatus ? "approved" : "rejected",
                }
              : w,
          )
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
      (statusFilter === "verified" && toWorkerDisplayStatus(w.verificationStatus, w.isVerified, w.isSuspended) === "approved") ||
      (statusFilter === "pending" && toWorkerDisplayStatus(w.verificationStatus, w.isVerified, w.isSuspended) !== "approved");

    return matchesSearch && matchesStatus;
  });

  const displayStatus = (worker: WorkerData) =>
    toWorkerDisplayStatus(worker.verificationStatus, worker.isVerified, worker.isSuspended);

  return (
    <FadeContent blur duration={0.4} className="space-y-5 pb-10 max-w-full">
      {/* Header Banner */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low px-6 py-5 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 dark:text-blue-400">
          {t("admin.portal" as any)}
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold text-on-surface tracking-tight">
          {t("admin.workers.title" as any)}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant opacity-70">
          {t("admin.workers.desc" as any)}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant transition-colors duration-300">
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-on-surface-variant opacity-60" />
          <input
            type="text"
            placeholder={t("admin.workers.searchPlaceholder" as any)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-surface-container rounded-xl p-1 border border-outline-variant">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "all"
                ? "bg-on-surface text-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t("admin.workers.filterAll" as any)}
          </button>
          <button
            onClick={() => setStatusFilter("verified")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === "verified"
                ? "bg-on-surface text-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t("admin.workers.filterVerified" as any)}
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden transition-colors duration-300 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant space-y-3">
            <div className="w-16 h-16 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8 text-blue-500/60" />
            </div>
            <p className="text-sm font-black text-on-surface uppercase tracking-wider">{t("admin.workers.noWorkers" as any)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low/50">
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.workers.table.name" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.workers.table.skills" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.workers.table.district" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60 hidden md:table-cell">
                    {t("admin.workers.table.experience" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.workers.table.verification" as any)}
                  </th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.workers.table.actions" as any)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filtered.map((w) => (
                  <tr
                    key={w.userId}
                    className="hover:bg-surface-container/50 transition-colors duration-150 group"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-on-surface text-sm group-hover:text-blue-500 transition-colors">{w.fullName}</p>
                        <p className="text-xs text-on-surface-variant opacity-60">{w.email}</p>
                        {w.phone && (
                          <p className="text-[10px] text-on-surface-variant/50 font-mono mt-1">{w.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {w.skills && w.skills.length > 0 ? (
                          w.skills.map((s) => (
                            <span key={s} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded text-[10px] font-black uppercase tracking-tight">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-on-surface-variant/45">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-on-surface">
                        {w.district || "Dire Dawa"}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface">
                        <Award className="w-4 h-4 text-blue-500" />
                        {w.experienceYears ?? 0} {t("admin.workers.table.years" as any)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider rounded-full px-2.5 py-0.5 border ${
                          displayStatus(w) === "approved"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : displayStatus(w) === "suspended" || displayStatus(w) === "revoked"
                              ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        {displayStatus(w) === "approved" ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {t("verification.status.approved" as any)}
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5" />
                            {displayStatus(w)}
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {w.faydaDocUrl && (
                          <Link
                            href={`/admin/verify/${w.userId}`}
                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-semibold transition-all border border-outline-variant active:scale-95"
                          >
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                            {verificationCapabilities.canReview ? t("admin.action.review" as any) : "View details"}
                          </Link>
                        )}
                        {((displayStatus(w) === "approved" && verificationCapabilities.canReject) ||
                          (displayStatus(w) !== "approved" && verificationCapabilities.canApprove)) && (
                          <button
                            disabled={isPending}
                            onClick={() => handleToggleVerify(w.userId, displayStatus(w) === "approved")}
                            className={`inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-xl font-bold transition-all disabled:opacity-50 border active:scale-95 duration-200 ${
                              displayStatus(w) === "approved"
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20"
                            }`}
                          >
                            {displayStatus(w) === "approved" ? (
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
                        )}
                      </div>
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
