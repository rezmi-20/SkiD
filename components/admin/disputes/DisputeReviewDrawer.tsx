"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  Scale,
  UserRound,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Coins,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface DisputeQueueItem {
  id: string;
  job_id: string;
  title: string | null;
  job_title?: string | null;
  category: string | null;
  requested_resolution: string | null;
  description?: string | null;
  status: string;
  payment_status: string | null;
  amount?: number | string | null;
  client_name: string | null;
  worker_name: string | null;
  assigned_admin_name: string | null;
  created_at: string;
}

interface DisputeReviewDrawerProps {
  dispute: DisputeQueueItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DisputeReviewDrawer({
  dispute,
  isOpen,
  onClose,
}: DisputeReviewDrawerProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !dispute) return null;

  const statusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return {
          icon: CheckCircle2,
          class: "bg-success/10 text-success border-success/20",
          label: "Resolved",
        };
      case "escalated":
        return {
          icon: AlertTriangle,
          class: "bg-destructive/10 text-destructive border-destructive/20",
          label: "Escalated",
        };
      case "under_review":
      case "evidence_review":
        return {
          icon: Scale,
          class: "bg-warning/10 text-warning border-warning/20",
          label: status === "evidence_review" ? "Evidence Review" : "Under Review",
        };
      default:
        return {
          icon: Clock,
          class: "bg-secondary text-muted-foreground border-border",
          label: "Open Case",
        };
    }
  };

  const statusInfo = statusBadge(dispute.status);
  const StatusIcon = statusInfo.icon;
  const numAmount = Number(dispute.amount || 0);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop spanning the full window */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-out Sheet from true right screen edge */}
      <div className="relative w-full max-w-lg bg-card border-l border-border h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header - Flush & Clean */}
        <div className="p-6 border-b border-border flex items-start justify-between gap-4 bg-secondary/20">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[11px] text-muted-foreground">
                #{dispute.id.slice(0, 8)}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.class}`}
              >
                <StatusIcon className="w-3 h-3" />
                <span>{statusInfo.label}</span>
              </span>
            </div>
            <h2 className="text-base font-bold text-foreground line-clamp-2">
              {dispute.title || dispute.job_title || "Untitled Dispute"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Unwrapped & Uncontained */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Escrow Value Highlight - Clean flush typography (No box wrapper) */}
          <div className="pb-5 border-b border-border/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground block">
                {t("admin.disputes.card.protectedEscrow")}
              </span>
              <p className="text-3xl font-bold font-mono text-accent mt-0.5">
                ETB {numAmount.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
          </div>

          {/* Disputing Parties - Clean 2-column flush layout (No nested boxes) */}
          <div className="pb-5 border-b border-border/70 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t("admin.disputes.table.parties")}
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                  <UserRound className="w-3.5 h-3.5 text-sky-400" />
                  {t("admin.disputes.client")}
                </span>
                <p className="text-sm font-bold text-foreground mt-1 truncate">
                  {dispute.client_name || "Client"}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  {t("admin.disputes.worker")}
                </span>
                <p className="text-sm font-bold text-foreground mt-1 truncate">
                  {dispute.worker_name || "Worker"}
                </p>
              </div>
            </div>
          </div>

          {/* Dispute Claim & Narrative - Clean quote styling (No nested gray card) */}
          <div className="pb-5 border-b border-border/70 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Claim & Requested Remedy
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-foreground border border-border capitalize">
                Category: {dispute.category ? dispute.category.replaceAll("_", " ") : "General breach"}
              </span>
              {dispute.requested_resolution && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-secondary text-foreground border border-border capitalize">
                  Remedy: {dispute.requested_resolution.replaceAll("_", " ")}
                </span>
              )}
            </div>

            {dispute.description && (
              <div className="pt-2">
                <span className="text-[11px] text-muted-foreground block mb-1">Initiator Statement:</span>
                <blockquote className="border-l-2 border-accent/40 pl-3 py-1 text-xs text-foreground italic leading-relaxed">
                  "{dispute.description}"
                </blockquote>
              </div>
            )}
          </div>

          {/* Operational Context - Flush key-value list (No container box) */}
          <div className="space-y-2.5 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Case Logistics
            </span>

            <div className="flex items-center justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">{t("admin.disputes.table.mediator")}:</span>
              <span className="font-semibold text-foreground">
                {dispute.assigned_admin_name || "Unassigned"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">{t("admin.disputes.kpi.escrowHold")}:</span>
              <span className="font-mono text-foreground font-semibold">
                {dispute.payment_status || "Active custody hold"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">Filing Date:</span>
              <span className="font-mono text-muted-foreground">
                {new Date(dispute.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-secondary/20 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground transition cursor-pointer"
          >
            {t("admin.disputes.drawer.close")}
          </button>
          <Link
            href={`/admin/disputes/${dispute.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <span>{t("admin.disputes.drawer.openStudio")}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
