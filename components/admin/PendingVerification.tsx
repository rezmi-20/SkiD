"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ExternalLink, Clock, ShieldCheck, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toggleWorkerVerification } from "@/lib/actions/admin";
import { toWorkerDisplayStatus } from "@/lib/worker-verification";

interface Worker {
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  skills: string[];
  has_document?: boolean;
  created_at?: string;
  verification_status?: string | null;
  is_verified?: boolean;
  is_suspended?: boolean | null;
  identity_complete?: boolean | null;
}

interface PendingVerificationProps {
  workers: Worker[];
  onAction?: (userId: string, approved: boolean) => void;
  canOpenDetails?: boolean;
  canReview?: boolean;
  canApprove?: boolean;
  canReject?: boolean;
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function PendingVerification({
  workers,
  onAction,
  canOpenDetails = true,
  canReview = true,
  canApprove = true,
  canReject = true,
}: PendingVerificationProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [visibleWorkers, setVisibleWorkers] = useState(workers);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setVisibleWorkers(workers);
  }, [workers]);

  const handleAction = (userId: string, approve: boolean) => {
    const reason = approve ? undefined : window.prompt(t("admin.verification.rejectReasonPrompt" as any)) || undefined;
    startTransition(async () => {
      const result = await toggleWorkerVerification(userId, approve, reason);
      if (result.success) {
        setVisibleWorkers((prev) => prev.filter((worker) => worker.user_id !== userId));
        onAction?.(userId, approve);
        router.refresh();
      } else {
        alert(result.error || t("admin.verification.updateFailed" as any));
      }
    });
  };

  return (
    <div className="w-full">
      {/* Empty State */}
      {visibleWorkers.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {t("admin.pendingVerif.empty" as any) || "All Workers Verified"}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {t("admin.verification.noPending" as any) || "No pending submissions in the queue."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/[0.04] dark:border-white/[0.05] text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                <th className="py-2.5 px-3">{t("admin.workers" as any) || "Worker"}</th>
                <th className="py-2.5 px-3 hidden md:table-cell">{t("worker.skills" as any) || "Specialty"}</th>
                <th className="py-2.5 px-3">{t("admin.verification.submitted" as any) || "Submitted"}</th>
                <th className="py-2.5 px-3">{t("verification.status.pending" as any) || "Status"}</th>
                <th className="py-2.5 px-3 text-right">{t("admin.verification.actions" as any) || "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03] dark:divide-white/[0.04]">
              {visibleWorkers.map((worker) => (
                <tr
                  key={worker.user_id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-xs shrink-0">
                        {worker.full_name?.charAt(0) || <User size={13} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs truncate">
                          {worker.full_name || "Unknown Worker"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{worker.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(worker.skills || []).slice(0, 2).map((s) => (
                        <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {s}
                        </span>
                      ))}
                      {(worker.skills || []).length > 2 && (
                        <span className="text-[10px] text-slate-400">+{worker.skills.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {timeAgo(worker.created_at)}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      {toWorkerDisplayStatus(worker.verification_status, worker.is_verified, worker.is_suspended)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {worker.has_document && canOpenDetails && (
                        <Link
                          href={`/admin/verify/${worker.user_id}`}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{canReview ? "Review" : "View"}</span>
                        </Link>
                      )}
                      {canApprove && (
                        <button
                          disabled={isPending || worker.identity_complete === false}
                          onClick={() => handleAction(worker.user_id, true)}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold transition disabled:opacity-50 border border-emerald-200/50"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verify</span>
                        </button>
                      )}
                      {canReject && (
                        <button
                          disabled={isPending}
                          onClick={() => handleAction(worker.user_id, false)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 font-semibold transition disabled:opacity-50 border border-rose-200/50"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>Reject</span>
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
  );
}
