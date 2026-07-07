"use client";

import { useState, useTransition } from "react";
import { resolveDispute } from "@/lib/actions/disputes";
import { useLanguage } from "@/context/LanguageContext";

interface Dispute {
  id: string;
  job_id: string;
  client_id: string;
  worker_id: string;
  description: string;
  evidence_urls: string[] | null;
  status: string;
  resolution_notes: string | null;
  created_at: string;
  job_title: string;
  client_name: string;
  worker_name: string;
}

interface AdminDisputesContentProps {
  initialDisputes: Dispute[];
}

export default function AdminDisputesContent({ initialDisputes }: AdminDisputesContentProps) {
  const { t } = useLanguage();
  const [disputes, setDisputes] = useState<Dispute[]>(initialDisputes);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleResolve = (status: "resolved" | "rejected") => {
    if (!selectedDispute) return;
    startTransition(async () => {
      try {
        const res = await resolveDispute(selectedDispute.id, notes, status);
        if (res.success) {
          setDisputes((prev) =>
            prev.map((d) =>
              d.id === selectedDispute.id ? { ...d, status, resolution_notes: notes } : d
            )
          );
          setSelectedDispute(null);
          setNotes("");
        } else {
          alert("Failed to resolve dispute");
        }
      } catch (err) {
        console.error(err);
        alert("Error resolving dispute");
      }
    });
  };

  return (
    <div className="space-y-5 text-on-surface font-body animate-in fade-in slide-in-from-bottom-3 duration-500 pb-10">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4 transition-colors duration-300">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {t("admin.portal" as any)}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-on-surface tracking-tight">
          {t("admin.disputes.title" as any)}
        </h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">
          {t("admin.disputes.desc" as any)}
        </p>
      </div>

      <div className="flex justify-between items-center px-1">
        <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">
          {t("admin.disputes.total" as any)}
        </h2>
        <span className="badge-info">
          {disputes.length} {t("admin.disputes.total" as any) === "Disputes Total" ? "Disputes" : ""}
        </span>
      </div>

      <div className="grid gap-3">
        {disputes.length === 0 ? (
          <div className="p-12 bg-surface-container-lowest border border-outline-variant rounded-lg text-center text-on-surface-variant shadow-sm transition-colors duration-300">
            {t("admin.disputes.empty" as any)}
          </div>
        ) : (
          disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="p-5 bg-surface-container-lowest border border-outline-variant rounded-lg space-y-3.5 hover:bg-surface-container-low transition-all duration-200 shadow-sm"
            >
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <h3 className="font-bold text-base text-on-surface leading-snug">{dispute.job_title}</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {t("admin.disputes.client" as any)}: <span className="font-semibold text-on-surface">{dispute.client_name}</span> &bull;{" "}
                    {t("admin.disputes.worker" as any)}: <span className="font-semibold text-on-surface">{dispute.worker_name}</span>
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full border ${
                    dispute.status === "open"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                      : dispute.status === "resolved"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {dispute.status === "open" ? t("verification.status.pending" as any) : dispute.status === "resolved" ? t("verification.status.approved" as any) : t("verification.status.rejected" as any)}
                </span>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container/50 p-3 rounded-lg border border-outline-variant transition-colors">
                {dispute.description}
              </p>

              {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    {t("admin.disputes.evidence" as any)}
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {dispute.evidence_urls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        {t("admin.disputes.evidenceNum" as any).replace("{num}", String(i + 1))}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {dispute.resolution_notes && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">
                    {t("admin.disputes.resNote" as any)}
                  </span>
                  <p className="text-xs text-green-800 leading-relaxed font-medium">
                    {dispute.resolution_notes}
                  </p>
                </div>
              )}

              {dispute.status === "open" && !selectedDispute && (
                <button
                  onClick={() => setSelectedDispute(dispute)}
                  className="px-4 py-1.5 bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs rounded-lg transition-all active:scale-95 shadow-sm"
                >
                  {t("admin.disputes.btnArbitrate" as any)}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Arbitration Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-6 space-y-4 shadow-2xl relative transition-colors duration-300">
            <div>
              <h3 className="text-base font-bold text-on-surface">
                {t("admin.disputes.modalTitle" as any)}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {t("admin.disputes.modalSub" as any).replace("{title}", selectedDispute.job_title)}
              </p>
            </div>

            <textarea
              required
              rows={4}
              placeholder={t("admin.disputes.modalPlaceholder" as any)}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-surface-container border border-outline-variant rounded-lg outline-none focus:border-primary text-xs text-on-surface transition-all placeholder:text-on-surface-variant/40"
            />

            <div className="flex gap-2">
              <button
                disabled={isPending || !notes}
                onClick={() => handleResolve("resolved")}
                className="flex-1 h-9 bg-primary text-on-primary text-xs font-bold rounded-lg disabled:opacity-50 transition-all active:scale-95"
              >
                {t("admin.disputes.btnResolve" as any)}
              </button>
              <button
                disabled={isPending || !notes}
                onClick={() => handleResolve("rejected")}
                className="flex-1 h-9 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold border border-outline-variant rounded-lg disabled:opacity-50 transition-all active:scale-95"
              >
                {t("admin.disputes.btnDismiss" as any)}
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedDispute(null);
                setNotes("");
              }}
              className="w-full h-8 text-on-surface-variant hover:text-on-surface text-xs font-bold rounded-lg transition-all"
            >
              {t("admin.disputes.btnCancel" as any)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
