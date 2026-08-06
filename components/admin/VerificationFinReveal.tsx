"use client";

import { useEffect, useState } from "react";
import type { VerificationAccountType } from "@/lib/verification-operations";

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

  useEffect(() => {
    if (!revealedFin) return undefined;
    const timer = window.setTimeout(() => setRevealedFin(null), 60000);
    return () => {
      window.clearTimeout(timer);
      setRevealedFin(null);
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

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-30 mb-1">
        Fayda FIN
      </p>
      <p className="font-mono font-bold text-on-surface leading-tight break-all select-none">
        {revealedFin || maskedFin || "Not recorded"}
      </p>
      {canReveal && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-on-surface-variant">
            Sensitive identity data. Reveal only while comparing the FIN against the protected Fayda document.
          </p>
          {revealedFin ? (
            <button
              type="button"
              onClick={() => setRevealedFin(null)}
              className="rounded-lg border border-outline-variant px-3 py-2 text-[10px] font-black uppercase tracking-widest text-on-surface"
            >
              Hide FIN
            </button>
          ) : (
            <button
              type="button"
              onClick={revealFin}
              disabled={isLoading || !attemptId}
              className="rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLoading ? "Authorizing" : "Reveal FIN for verification"}
            </button>
          )}
          {error && <p className="text-xs font-semibold text-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
