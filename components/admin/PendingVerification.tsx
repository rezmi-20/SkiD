"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, ExternalLink, Clock } from "lucide-react";
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
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-on-surface tracking-tight">
            {t("admin.pendingVerif.title" as any)}
          </h3>
          {visibleWorkers.length > 0 && (
            <span className="badge-warning">{visibleWorkers.length} {t("verification.status.pending" as any)}</span>
          )}
        </div>
        <Link
          href="/admin/verify"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          {t("admin.dashboard.viewAll" as any)} <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Empty State */}
      {visibleWorkers.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-3 text-on-surface-variant">
          <CheckCircle className="w-10 h-10 text-primary" />
          <p className="text-sm font-semibold text-on-surface">{t("admin.pendingVerif.empty" as any)}</p>
          <p className="text-xs text-on-surface-variant">{t("admin.verification.noPending" as any)}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container/50">
                <th className="text-left px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  {t("admin.workers" as any)}
                </th>
                <th className="text-left px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hidden md:table-cell">
                  {t("worker.skills" as any) ?? "Skills"}
                </th>
                <th className="text-left px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  {t("admin.verification.submitted" as any)}
                </th>
                <th className="text-left px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  {t("verification.status.pending" as any)}
                </th>
                <th className="text-right px-4 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  {t("admin.verification.actions" as any)}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {visibleWorkers.map((worker) => (
                <tr
                  key={worker.user_id}
                  className="hover:bg-surface-container transition-colors duration-150"
                >
                  <td className="px-4 py-2.5">
                    <div>
                      <p className="font-semibold text-on-surface text-sm">
                        {worker.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-on-surface-variant">{worker.phone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(worker.skills || []).slice(0, 2).map((s) => (
                        <span key={s} className="badge-info">{s}</span>
                      ))}
                      {(worker.skills || []).length > 2 && (
                        <span className="text-[10px] text-on-surface-variant">+{worker.skills.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-on-surface-variant flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(worker.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="badge-warning">⚠ {toWorkerDisplayStatus(worker.verification_status, worker.is_verified, worker.is_suspended)}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      {worker.has_document && canOpenDetails && (
                        <Link
                          href={`/admin/verify/${worker.user_id}`}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-surface-container text-on-surface-variant hover:bg-surface-container-high font-semibold transition-colors border border-outline-variant"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {canReview ? t("admin.action.review" as any) : t("admin.dashboard.viewDetails" as any)}
                        </Link>
                      )}
                      {canApprove && (
                        <button
                          disabled={isPending}
                          onClick={() => handleAction(worker.user_id, true)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 font-bold transition-colors disabled:opacity-50 border border-green-200"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t("admin.action.verify" as any)}
                        </button>
                      )}
                      {canReject && (
                        <button
                          disabled={isPending}
                          onClick={() => handleAction(worker.user_id, false)}
                          className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-bold transition-colors disabled:opacity-50 border border-red-200"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {t("admin.action.reject" as any)}
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
