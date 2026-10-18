"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/shell/StatusBadge";
import {
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Coins,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface WorkerJobCardData {
  id: string;
  client_id?: string | null;
  title: string;
  description: string | null;
  budget: number | string | null;
  location?: string | null;
  requested_date?: string | Date | null;
  status: string;
  rejection_reason?: string | null;
  created_at: string | Date;
  client_name: string | null;
  client_avatar: string | null;
  client_location?: string | null;
  contract_id?: string | null;
}

interface JobCardProps {
  job: WorkerJobCardData;
  actions?: React.ReactNode;
  showActions?: boolean;
  onAccept?: (jobId: string) => Promise<void>;
  onReject?: (jobId: string, reason?: string) => Promise<void>;
}

function timeAgo(dateValue: string | Date, t: any) {
  const diff = Date.now() - new Date(dateValue).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return t("worker.jobs.just_now");
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateValue).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatBudget(value: number | string | null) {
  if (value === null || value === undefined) return "Negotiable";
  const amount = Number(value);
  if (Number.isNaN(amount) || amount <= 0) return "Negotiable";
  return `${amount.toLocaleString()} ETB`;
}

export default function JobCard({
  job,
  actions,
  showActions = true,
  onAccept,
  onReject,
}: JobCardProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedReasonKey, setSelectedReasonKey] = useState<string>("worker.jobs.reason_onsite");
  const [customReason, setCustomReason] = useState("");

  const handleAccept = async () => {
    if (!onAccept) return;
    setLoading("accept");
    try {
      await onAccept(job.id);
    } finally {
      setLoading(null);
    }
  };

  const handleConfirmDecline = async () => {
    if (!onReject) return;
    setLoading("reject");
    try {
      let finalReason = (t as any)(selectedReasonKey);
      if (selectedReasonKey === "worker.jobs.reason_other" && customReason.trim()) {
        finalReason = customReason.trim();
      }
      await onReject(job.id, finalReason);
      setIsDeclineModalOpen(false);
    } finally {
      setLoading(null);
    }
  };

  const initials = job.client_name
    ? job.client_name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CL";

  const declineReasons = [
    { key: "worker.jobs.reason_onsite", icon: "🏗️" },
    { key: "worker.jobs.reason_budget", icon: "💰" },
    { key: "worker.jobs.reason_location", icon: "📍" },
    { key: "worker.jobs.reason_schedule", icon: "📅" },
    { key: "worker.jobs.reason_other", icon: "✏️" },
  ];

  return (
    <>
      <article className="border border-outline-variant/60 bg-surface-container-lowest dark:bg-[#161b22] rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group">
        <div className="flex flex-col gap-5">
          {/* Top Row: Client Info & Status Badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container flex items-center justify-center shadow-xs">
                {job.client_avatar ? (
                  <img src={job.client_avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-black text-on-surface-variant">{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-on-surface truncate">
                    {job.client_name || t("worker.jobs.anonymous")}
                  </h4>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                    Client
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium opacity-65 mt-0.5">
                  <Clock className="w-3 h-3 text-on-surface-variant" />
                  <span>{timeAgo(job.created_at, t)}</span>
                  <span>•</span>
                  <span>{job.location || job.client_location || "Dire Dawa"}</span>
                </div>
              </div>
            </div>
            <StatusBadge status={job.status} />
          </div>

          {/* Job Title & Main Key Highlights */}
          <div className="space-y-3">
            <h3 className="text-lg sm:text-xl font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">
              {job.title}
            </h3>

            {/* Quick Metrics Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl bg-surface-container-low/70 dark:bg-surface-container-high/40 border border-outline-variant/40 p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Coins className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                    {t("worker.jobs.budget")}
                  </p>
                  <p className="text-xs sm:text-sm font-extrabold text-primary dark:text-[#a3e635] truncate">
                    {formatBudget(job.budget)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-surface-container-low/70 dark:bg-surface-container-high/40 border border-outline-variant/40 p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                    {t("worker.jobs.location")}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-on-surface truncate">
                    {job.location || job.client_location || "Dire Dawa"}
                  </p>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 rounded-2xl bg-surface-container-low/70 dark:bg-surface-container-high/40 border border-outline-variant/40 p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                    {t("worker.jobs.requested_date")}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-on-surface truncate">
                    {job.requested_date
                      ? new Date(job.requested_date).toLocaleDateString()
                      : t("worker.jobs.requested_asap")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Full Scope & Detailed Description Box */}
          <div className="rounded-2xl bg-surface-container-low/50 dark:bg-surface-container-high/30 border border-outline-variant/40 p-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-on-surface-variant opacity-75 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                {t("worker.jobs.full_scope")}
              </span>
              {job.description && job.description.length > 160 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 transition"
                >
                  <span>{isExpanded ? t("worker.jobs.hide_details") : t("worker.jobs.view_details")}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            <p
              className={`text-sm text-on-surface/90 leading-relaxed whitespace-pre-wrap ${
                !isExpanded && job.description && job.description.length > 160 ? "line-clamp-3" : ""
              }`}
            >
              {job.description || t("worker.jobs.no_desc")}
            </p>
          </div>

          {/* If Job was rejected, show the recorded decline reason */}
          {job.rejection_reason && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3.5 flex items-start gap-2.5 text-xs text-red-500">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] block opacity-80">
                  {t("worker.jobs.declined_reason_badge")}
                </span>
                <p className="mt-0.5 font-medium">{job.rejection_reason}</p>
              </div>
            </div>
          )}

          {/* Actions Bar (Accept / Decline / Chat) */}
          {showActions && (
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-outline-variant/40">
              {actions ?? (
                <>
                  {job.status === "pending" ? (
                    <>
                      {/* Accept Button: Vibrant Electric Lime Pill */}
                      <button
                        type="button"
                        onClick={handleAccept}
                        disabled={!onAccept || loading !== null}
                        className="w-full sm:flex-1 h-12 rounded-full bg-[#a3e635] text-[#0d1406] font-extrabold text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-[0_4px_16px_rgba(163,230,53,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading === "accept" ? (
                          <span className="h-4 w-4 rounded-full border-2 border-[#0d1406] border-t-transparent animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                        )}
                        <span>{t("worker.jobs.btn_accept")}</span>
                      </button>

                      {/* Decline Button: Opens Reasons Modal */}
                      <button
                        type="button"
                        onClick={() => setIsDeclineModalOpen(true)}
                        disabled={!onReject || loading !== null}
                        className="w-full sm:w-auto h-12 px-6 rounded-full border border-red-500/30 hover:border-red-500/60 bg-red-500/10 text-red-500 font-bold text-xs uppercase tracking-wider hover:bg-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>{t("worker.jobs.btn_decline")}</span>
                      </button>

                      {/* Chat with Client */}
                      <Link
                        href="/worker/messages"
                        className="w-full sm:w-auto h-12 px-5 rounded-full border border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95"
                      >
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span>{t("worker.jobs.chat_client")}</span>
                      </Link>
                    </>
                  ) : job.status === "accepted" ? (
                    <Link
                      href={job.contract_id ? `/contracts/${job.contract_id}` : "/worker/contracts"}
                      className="w-full h-12 rounded-full bg-primary text-primary-foreground font-extrabold text-xs uppercase tracking-wider hover:bg-primary/90 flex items-center justify-center gap-2 transition"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>View Contract</span>
                    </Link>
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>
      </article>

      {/* ── Decline Reason Modal ── */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[2.5rem] bg-surface-container-lowest dark:bg-[#161b22] border border-outline-variant/60 p-6 sm:p-7 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span>{t("worker.jobs.decline_modal_title")}</span>
                </div>
                <h3 className="text-lg font-black text-on-surface pt-1">
                  {job.title}
                </h3>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed opacity-75">
                  {t("worker.jobs.decline_modal_subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDeclineModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Reason Radio Chips */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                {t("worker.jobs.decline_reason_label")}
              </label>

              <div className="space-y-2">
                {declineReasons.map((reason) => {
                  const isSelected = selectedReasonKey === reason.key;
                  return (
                    <button
                      key={reason.key}
                      type="button"
                      onClick={() => setSelectedReasonKey(reason.key)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3 text-xs font-semibold ${
                        isSelected
                          ? "border-primary bg-primary/10 text-on-surface shadow-xs ring-1 ring-primary/40"
                          : "border-outline-variant/50 bg-surface-container-low/60 hover:bg-surface-container-high/60 text-on-surface-variant"
                      }`}
                    >
                      <span className="text-base shrink-0">{reason.icon}</span>
                      <span className="flex-1 leading-snug">{(t as any)(reason.key)}</span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? "border-primary bg-primary" : "border-outline-variant"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-on-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Optional Custom Reason Box */}
              {selectedReasonKey === "worker.jobs.reason_other" && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <textarea
                    rows={3}
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder={t("worker.jobs.custom_reason_placeholder")}
                    className="w-full rounded-2xl bg-surface-container-low border border-outline-variant/60 p-3 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-on-surface-variant/50 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeclineModalOpen(false)}
                className="flex-1 h-12 rounded-full border border-outline-variant bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface uppercase tracking-wider transition"
              >
                {t("worker.jobs.decline_cancel_btn")}
              </button>

              <button
                type="button"
                onClick={handleConfirmDecline}
                disabled={loading === "reject"}
                className="flex-1 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading === "reject" ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>{t("worker.jobs.decline_confirm_btn")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
