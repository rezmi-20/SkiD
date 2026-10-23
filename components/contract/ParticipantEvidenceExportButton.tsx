"use client";

import React, { useState, useTransition } from "react";
import { Scale, Download, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { requestParticipantEvidencePackage } from "@/lib/actions/participant-evidence";

interface Props {
  contractId: string;
  variant?: "card" | "compact";
}

export default function ParticipantEvidenceExportButton({ contractId, variant = "card" }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successUrl, setSuccessUrl] = useState<string | null>(null);

  const handleExport = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await requestParticipantEvidencePackage(contractId);
        if (!res.success) {
          setError(res.error || "Failed to generate evidence package.");
          return;
        }

        if (res.downloadUrl) {
          setSuccessUrl(res.downloadUrl);
          // Trigger direct download
          const link = document.createElement("a");
          link.href = res.downloadUrl;
          link.download = `DireSkill-Evidence-${contractId.slice(0, 8)}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while exporting evidence.");
      }
    });
  };

  if (variant === "compact") {
    return (
      <div className="space-y-1.5">
        <button
          onClick={handleExport}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition shadow-sm cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
          ) : (
            <Scale className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
          )}
          <span>{isPending ? "Generating..." : "Export Legal Evidence"}</span>
        </button>
        {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-red-500/20 dark:border-red-500/30 bg-gradient-to-br from-red-50/50 via-white to-white dark:from-red-950/20 dark:via-[#0e141d] dark:to-[#0e141d] p-5 shadow-sm space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20">
          <Scale className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            Legal & Court Proceedings
          </p>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Certified Evidentiary Dossier
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            Download a certified, tamper-evident legal package under Ethiopian Labour Proclamation No. 1156/2019 including signed terms, Chapa payment receipts, dispute claims, and audit history.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successUrl && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4" />
            Evidence package generated and downloaded!
          </span>
          <a
            href={successUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline text-xs"
          >
            Download again
          </a>
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={isPending}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Compiling Certified Legal Dossier...</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span>Export Official Legal Evidence PDF</span>
          </>
        )}
      </button>
    </div>
  );
}
