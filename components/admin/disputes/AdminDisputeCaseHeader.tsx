"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft, Scale, UserRound, Wrench, ShieldCheck, AlertTriangle } from "lucide-react";

interface AdminDisputeCaseHeaderProps {
  dispute: {
    id: string;
    title?: string | null;
    job_title?: string | null;
    status: string;
    category?: string | null;
    client_name?: string | null;
    worker_name?: string | null;
    assigned_admin_name?: string | null;
  };
  isDisputePaymentAdmin: boolean;
  isTerminal: boolean;
  actionError?: string | null;
}

function statusBadge(status: string) {
  if (status === "resolved") {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
  if (status === "escalated") {
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  }
  if (status === "dismissed") {
    return "bg-secondary text-muted-foreground border-border";
  }
  return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
}

export function AdminDisputeCaseHeader({
  dispute,
  isDisputePaymentAdmin,
  isTerminal,
  actionError,
}: AdminDisputeCaseHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* 1. Flush, Unboxed Header (deals.tsx style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-2">
          <Link
            href="/admin/disputes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t("admin.disputesDetail.back")}</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-foreground font-bold shadow-xs">
              <Scale className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {dispute.title || dispute.job_title}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusBadge(
                    dispute.status
                  )}`}
                >
                  {String(dispute.status).replaceAll("_", " ")}
                </span>
                <span className="font-mono text-xs text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded">
                  #{String(dispute.id).slice(0, 8)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <UserRound className="h-3 w-3 text-sky-500" />
                  <span>{t("admin.disputesDetail.client")}:</span>
                  <strong className="text-foreground">{dispute.client_name || "Client"}</strong>
                </span>
                <span className="text-border">/</span>
                <span className="flex items-center gap-1">
                  <Wrench className="h-3 w-3 text-emerald-500" />
                  <span>{t("admin.disputesDetail.worker")}:</span>
                  <strong className="text-foreground">{dispute.worker_name || "Worker"}</strong>
                </span>
                <span className="text-border">/</span>
                <span className="capitalize">{dispute.category ? dispute.category.replaceAll("_", " ") : "Breach"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Top Badges / Context */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs text-xs">
            <span className="text-muted-foreground">{t("admin.disputesDetail.mediator")}: </span>
            <span className="font-bold text-foreground">
              {dispute.assigned_admin_name || t("admin.disputesDetail.unassigned")}
            </span>
          </div>
          {!isDisputePaymentAdmin && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              {t("admin.disputesDetail.readOnlyOversight")}
            </div>
          )}
        </div>
      </div>

      {/* Action Error Banner if any */}
      {actionError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Terminal Notice */}
      {isTerminal && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{t("admin.disputesDetail.terminalNotice")}</span>
        </div>
      )}
    </div>
  );
}

