"use client";

import { useEffect, useState } from "react";
import type { VerificationAccountType } from "@/lib/verification-operations";
import { Eye, EyeOff, KeyRound, Copy, Check, Loader2, ShieldAlert } from "lucide-react";

interface VerificationFinRevealProps {
  accountType: VerificationAccountType;
  accountUserId: string;
  attemptId?: string | null;
  maskedFin?: string | null;
  canReveal: boolean;
}

export default function VerificationFinReveal({
  accountType,
  accountUserId,
  attemptId,
  maskedFin,
  canReveal,
}: VerificationFinRevealProps) {
  const [revealedFin, setRevealedFin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!revealedFin) return undefined;
    setTimeLeft(60);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRevealedFin(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [revealedFin]);

  const revealFin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/verification/${accountType}/${accountUserId}/reveal-fin`, {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expectedAttemptId: attemptId ?? null,
          reason: "Active verification review FIN comparison",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success || typeof data.fin !== "string") {
        setError(typeof data.error === "string" ? data.error : "FIN could not be revealed.");
        setRevealedFin(null);
        return;
      }
      setRevealedFin(data.fin);
    } catch {
      setError("FIN could not be revealed.");
      setRevealedFin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!revealedFin) return;
    navigator.clipboard.writeText(revealedFin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-slate-50/70 dark:bg-slate-900/60 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <KeyRound className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Fayda FIN Identity</span>
        </div>
        {revealedFin && (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Expires in {timeLeft}s
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
        <p className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-widest select-none truncate">
          {revealedFin || maskedFin || "Not recorded"}
        </p>

        {revealedFin ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              title="Copy FIN"
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setRevealedFin(null)}
              title="Hide FIN"
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <EyeOff className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : canReveal ? (
          <button
            type="button"
            onClick={revealFin}
            disabled={isLoading || !attemptId}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 disabled:opacity-40 transition"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
            <span>Reveal</span>
          </button>
        ) : null}
      </div>

      {canReveal && !revealedFin && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          Click Reveal to verify full FIN against document. Authorized for active reviews only.
        </p>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-rose-500 text-[11px] font-medium">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
