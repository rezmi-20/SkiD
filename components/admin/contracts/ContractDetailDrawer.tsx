"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  User,
  Wrench,
  CheckCircle2,
  Clock,
  Download,
  PenTool,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface ContractDrawerItem {
  id: string;
  jobTitle: string;
  clientName: string;
  workerName: string;
  clientSignedAt: string | null;
  workerSignedAt: string | null;
  signedAt: string | null;
  pdfUrl: string | null;
  amount?: number | null;
  status?: string | null;
  termsStatus?: string | null;
  workLocation?: string | null;
  createdAt?: string | null;
}

interface ContractDetailDrawerProps {
  contract: ContractDrawerItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf?: (contractId: string, jobTitle?: string) => void;
  isDownloading?: boolean;
}

export function ContractDetailDrawer({
  contract,
  isOpen,
  onClose,
  onDownloadPdf,
  isDownloading,
}: ContractDetailDrawerProps) {
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
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !contract || !mounted) return null;

  const isExecuted = Boolean(contract.signedAt);
  const clientSigned = Boolean(contract.clientSignedAt);
  const workerSigned = Boolean(contract.workerSignedAt);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-out Sheet - Unboxed Clean Design */}
      <div className="relative w-full max-w-lg bg-card border-l border-border h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                {t("admin.contracts.drawer.contract")} #{contract.id.slice(0, 8)}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  isExecuted
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                }`}
              >
                {isExecuted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                <span>
                  {isExecuted ? t("admin.contracts.drawer.executed") : t("admin.contracts.drawer.awaiting")}
                </span>
              </span>
            </div>
            <h2 className="text-base font-bold text-foreground line-clamp-1">
              {contract.jobTitle || "Job Agreement"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Unwrapped & Clean Layout */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Escrow Value Hero */}
          <div className="flex items-baseline justify-between pb-4 border-b border-border">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                {t("admin.contracts.drawer.escrowHero")}
              </span>
              <p className="text-3xl font-bold font-mono text-foreground mt-1">
                ETB {Number(contract.amount || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-muted-foreground">{t("admin.contracts.drawer.custodyStatus")}</span>
              <p className="text-xs font-bold text-foreground mt-0.5">
                {isExecuted ? t("admin.contracts.drawer.committed") : t("admin.contracts.drawer.draft")}
              </p>
            </div>
          </div>

          {/* Bipartite Digital Signatures - Unboxed List */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <PenTool className="w-4 h-4 text-accent" />
              <span>{t("admin.contracts.drawer.bipartiteSignatures")}</span>
            </span>

            <div className="divide-y divide-border/60">
              {/* Client Signature Row */}
              <div className="py-3 flex flex-col gap-1 first:pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-500" />
                    <span className="font-semibold text-foreground text-xs">{contract.clientName}</span>
                    <span className="text-[10px] text-muted-foreground">({t("admin.contracts.drawer.employer")})</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      clientSigned ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {clientSigned ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{clientSigned ? t("admin.contracts.drawer.verifiedSigned") : t("admin.contracts.drawer.pendingSignature")}</span>
                  </span>
                </div>
                {contract.clientSignedAt ? (
                  <p className="text-[11px] font-mono text-muted-foreground pl-6">
                    Signed: {new Date(contract.clientSignedAt).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground pl-6 italic">
                    {t("admin.contracts.drawer.clientFaydaPrompt")}
                  </p>
                )}
              </div>

              {/* Artisan Signature Row */}
              <div className="py-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-foreground text-xs">{contract.workerName}</span>
                    <span className="text-[10px] text-muted-foreground">({t("admin.contracts.drawer.artisan")})</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      workerSigned ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {workerSigned ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{workerSigned ? t("admin.contracts.drawer.verifiedSigned") : t("admin.contracts.drawer.pendingSignature")}</span>
                  </span>
                </div>
                {contract.workerSignedAt ? (
                  <p className="text-[11px] font-mono text-muted-foreground pl-6">
                    Signed: {new Date(contract.workerSignedAt).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground pl-6 italic">
                    {t("admin.contracts.drawer.workerFaydaPrompt")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Operational Details - Unboxed Key-Value List */}
          <div className="space-y-3 pt-2 border-t border-border">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              {t("admin.contracts.drawer.metadata")}
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">{t("admin.contracts.drawer.termsAgreement")}:</span>
                <span className="font-semibold text-foreground capitalize">
                  {contract.termsStatus || t("admin.contracts.drawer.standardPlatformTerms")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">{t("admin.contracts.drawer.workLocation")}:</span>
                <span className="font-medium text-foreground">
                  {contract.workLocation || "Dire Dawa Administration"}
                </span>
              </div>
              {contract.createdAt && (
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">{t("admin.contracts.drawer.initiated")}:</span>
                  <span className="font-mono text-muted-foreground">
                    {new Date(contract.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {contract.signedAt && (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">{t("admin.contracts.drawer.fullExecution")}:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {new Date(contract.signedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-semibold text-foreground transition cursor-pointer"
          >
            {t("admin.contracts.drawer.close")}
          </button>

          <button
            type="button"
            disabled={isDownloading}
            onClick={() => onDownloadPdf && onDownloadPdf(contract.id, contract.jobTitle)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>
              {isDownloading ? t("admin.contracts.drawer.verifyingAccess") : t("admin.contracts.drawer.downloadPdf")}
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
