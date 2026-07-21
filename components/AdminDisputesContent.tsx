"use client";

import { useState, useTransition } from "react";
import { Scale, Clock, CheckCircle2, AlertCircle, FileText, Image, MessageSquare, ShieldAlert, X } from "lucide-react";
import { resolveDispute } from "@/lib/actions/disputes";
import { useLanguage } from "@/context/LanguageContext";
import FadeContent from "@/components/ui/fade-content";

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

function statusClass(status: string) {
  switch (status) {
    case "open":
      return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    case "resolved":
      return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    case "rejected":
      return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
    default:
      return "bg-surface-container-high text-on-surface-variant border border-outline-variant/40";
  }
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
    <FadeContent blur duration={0.4} className="space-y-5 pb-10 max-w-full">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low px-6 py-5 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 dark:text-blue-400">
          {t("admin.portal" as any)}
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold text-on-surface tracking-tight">
          {t("admin.disputes.title" as any)}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant opacity-70">
          {t("admin.disputes.desc" as any)}
        </p>
      </div>

      <div className="flex justify-between items-center px-1">
        <h2 className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">
          {t("admin.disputes.total" as any)}
        </h2>
        <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full border border-outline-variant/30">
          {disputes.length} {t("admin.disputes.total" as any) === "Disputes Total" ? "Disputes" : "Disputes"}
        </span>
      </div>

      <div className="grid gap-4">
        {disputes.length === 0 ? (
          <div className="p-20 bg-surface-container-lowest border border-outline-variant border-dashed rounded-2xl text-center text-on-surface-variant space-y-3 shadow-sm transition-colors duration-300">
            <div className="w-16 h-16 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto text-blue-500/60">
              <Scale className="w-8 h-8" />
            </div>
            <p className="text-sm font-black text-on-surface uppercase tracking-wider">{t("admin.disputes.empty" as any)}</p>
          </div>
        ) : (
          disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="p-5 bg-surface-container-lowest border border-outline-variant rounded-2xl space-y-4 hover:border-blue-500/30 transition-all duration-200 shadow-sm group"
            >
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-on-surface leading-snug group-hover:text-blue-500 transition-colors">
                    {dispute.job_title}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-1.5 font-semibold">
                    {t("admin.disputes.client" as any)}: <span className="font-bold text-on-surface">{dispute.client_name}</span> &bull;{" "}
                    {t("admin.disputes.worker" as any)}: <span className="font-bold text-on-surface">{dispute.worker_name}</span>
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${statusClass(dispute.status)}`}
                >
                  {dispute.status === "open" 
                    ? t("verification.status.pending" as any) 
                    : dispute.status === "resolved" 
                    ? t("verification.status.approved" as any) 
                    : t("verification.status.rejected" as any)}
                </span>
              </div>

              <div className="flex gap-2 bg-surface-container-low/40 p-3.5 rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant leading-relaxed">
                <MessageSquare className="w-4 h-4 text-on-surface-variant opacity-60 shrink-0 mt-0.5" />
                <p className="font-semibold">{dispute.description}</p>
              </div>

              {dispute.evidence_urls && dispute.evidence_urls.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-50 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {t("admin.disputes.evidence" as any)}
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {dispute.evidence_urls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-lg border border-outline-variant/40 text-[10px] font-black uppercase tracking-wider text-blue-500 hover:text-blue-600 hover:border-blue-500/30 transition-all"
                      >
                        <Image className="w-3.5 h-3.5" />
                        {t("admin.disputes.evidenceNum" as any).replace("{num}", String(i + 1))}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {dispute.resolution_notes && (
                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t("admin.disputes.resNote" as any)}
                  </span>
                  <p className="text-xs text-emerald-500/90 leading-relaxed font-semibold">
                    {dispute.resolution_notes}
                  </p>
                </div>
              )}

              {dispute.status === "open" && !selectedDispute && (
                <button
                  onClick={() => setSelectedDispute(dispute)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-sm"
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
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-5 shadow-2xl relative transition-colors duration-300">
            <button
              onClick={() => {
                setSelectedDispute(null);
                setNotes("");
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-500">
                <ShieldAlert className="w-3.5 h-3.5" />
                Arbitration Case
              </span>
              <h3 className="text-lg font-extrabold text-on-surface mt-1.5">
                {t("admin.disputes.modalTitle" as any)}
              </h3>
              <p className="text-xs text-on-surface-variant font-semibold mt-1 opacity-70">
                {t("admin.disputes.modalSub" as any).replace("{title}", selectedDispute.job_title)}
              </p>
            </div>

            <textarea
              required
              rows={4}
              placeholder={t("admin.disputes.modalPlaceholder" as any)}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3.5 bg-surface-container border border-outline-variant/60 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-xs text-on-surface font-semibold transition-all placeholder:text-on-surface-variant/40 resize-none"
            />

            <div className="flex gap-2.5">
              <button
                disabled={isPending || !notes}
                onClick={() => handleResolve("resolved")}
                className="flex-1 h-10 bg-blue-500 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl disabled:opacity-50 transition-all active:scale-95"
              >
                {t("admin.disputes.btnResolve" as any)}
              </button>
              <button
                disabled={isPending || !notes}
                onClick={() => handleResolve("rejected")}
                className="flex-1 h-10 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-black uppercase tracking-wider border border-outline-variant/60 rounded-xl disabled:opacity-50 transition-all active:scale-95"
              >
                {t("admin.disputes.btnDismiss" as any)}
              </button>
            </div>
          </div>
        </div>
      )}
    </FadeContent>
  );
}
