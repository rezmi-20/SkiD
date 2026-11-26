"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
  RiBookmarkLine,
  RiBookmarkFill,
  RiCheckLine,
  RiCloseLine,
  RiMapPin2Line,
  RiCalendarLine,
  RiShieldCheckFill,
  RiMessage3Line,
  RiFileTextLine,
  RiBuilding2Line,
  RiCoinsLine,
  RiEditLine,
} from "@remixicon/react";

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

function formatDate(dateValue: string | Date | null | undefined) {
  if (!dateValue) return "Flexible Schedule";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Flexible Schedule";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [selectedReasonKey, setSelectedReasonKey] = useState<string>("worker.jobs.reason_onsite");
  const [customReason, setCustomReason] = useState("");

  const handleAccept = async () => {
    if (!onAccept) return;
    setLoading("accept");
    try {
      await onAccept(job.id);
      setIsDetailsOpen(false);
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
      setIsDetailsOpen(false);
    } finally {
      setLoading(null);
    }
  };

  const clientName = job.client_name || "Dire Dawa Client";
  const initials = clientName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const declineReasons = [
    { key: "worker.jobs.reason_onsite", Icon: RiBuilding2Line },
    { key: "worker.jobs.reason_budget", Icon: RiCoinsLine },
    { key: "worker.jobs.reason_location", Icon: RiMapPin2Line },
    { key: "worker.jobs.reason_schedule", Icon: RiCalendarLine },
    { key: "worker.jobs.reason_other", Icon: RiEditLine },
  ];

  return (
    <>
      {/* ── Main Job Request Card (Matches Attached Pinterest/Stripe Screenshot) ── */}
      <article className="rounded-[2.25rem] border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[270px] group">
        
        <div className="space-y-3.5">
          {/* Top Row: Circular Client Brand Avatar + Company Name + Bookmark Button */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-11 sm:size-12 rounded-full border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {job.client_avatar ? (
                  <img src={job.client_avatar} alt="" className="size-full object-cover" />
                ) : (
                  <div className="size-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-extrabold text-sm flex items-center justify-center">
                    {initials}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                  {clientName}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    <RiShieldCheckFill className="size-3" />
                    Verified Client
                  </span>
                  {job.status === "in_progress" && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  )}
                  {(job.status === "accepted" || job.status === "active") && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded-full">
                      <span className="size-1.5 rounded-full bg-blue-500" />
                      Accepted
                    </span>
                  )}
                  {["completion_requested", "completed", "payment_pending", "paid", "closed"].includes(job.status) && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                      <span className="size-1.5 rounded-full bg-zinc-400" />
                      Done
                    </span>
                  )}
                  {job.status === "rejected" && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-rose-500 font-bold uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded-full">
                      Declined
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bookmark Icon Button with Spring Micro-interaction */}
            <button
              type="button"
              onClick={() => setIsBookmarked(!isBookmarked)}
              aria-label={isBookmarked ? "Remove Bookmark" : "Save Job"}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition active:scale-90 cursor-pointer shrink-0"
            >
              {isBookmarked ? (
                <RiBookmarkFill className="size-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <RiBookmarkLine className="size-5" />
              )}
            </button>
          </div>

          {/* Title and Rate Row */}
          <div className="flex items-baseline justify-between gap-3 pt-1">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-white truncate flex-1">
              {job.title}
            </h3>
            <span className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white shrink-0">
              {formatBudget(job.budget)}
            </span>
          </div>

          {/* Description Snippet (2-line clamped) */}
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {job.description || "Client requested professional artisan milestone execution in Dire Dawa under DireSkill Milestone Protection."}
          </p>
        </div>

        {/* Bottom Row: Date & Location on Left + Solid Dark Pill 'Details' Button on Right */}
        <div className="flex items-end justify-between gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80 mt-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-zinc-900 dark:text-white">
              {formatDate(job.requested_date || job.created_at)}
            </p>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5 flex items-center gap-1">
              <RiMapPin2Line className="size-3 shrink-0" />
              <span>{job.location || job.client_location || "Dire Dawa, Ethiopia"}</span>
            </p>
          </div>

          {/* Details Action Pill (Matches screenshot) */}
          <button
            type="button"
            onClick={() => setIsDetailsOpen(true)}
            className="rounded-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 px-5 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Details
          </button>
        </div>

      </article>

      {/* ── Stageshow Interactive Modal Drawer (Opens on 'Details') ── */}
      <AnimatePresence>
        {isDetailsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="w-full max-w-lg rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="absolute top-6 right-6 size-9 rounded-full bg-slate-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <RiCloseLine className="size-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 pr-8">
                <div className="size-12 rounded-full border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                  {job.client_avatar ? (
                    <img src={job.client_avatar} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="size-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center">
                      {initials}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {clientName}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Status:{" "}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {job.status === "in_progress"
                        ? "Active"
                        : job.status === "accepted" || job.status === "active"
                        ? "Accepted"
                        : ["completion_requested", "completed", "payment_pending", "paid", "closed"].includes(job.status)
                        ? "Done"
                        : job.status === "rejected"
                        ? "Declined"
                        : "Pending"}
                    </span>{" "}
                    • {formatDate(job.created_at)}
                  </p>
                </div>
              </div>

              {/* Title & Budget Card */}
              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4 space-y-1.5 border border-slate-100 dark:border-zinc-800">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  {job.title}
                </p>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-zinc-500">Milestone Compensation</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatBudget(job.budget)}
                  </span>
                </div>
              </div>

              {/* Scope of Work */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <RiFileTextLine className="size-4 text-emerald-500" />
                  Scope of Work & Requirements
                </span>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto pr-2">
                  {job.description || "No additional description provided. Contact the client directly through DireSkill messaging for specific material arrangements."}
                </p>
              </div>

              {/* Location & Schedule Strip */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                  <span className="text-zinc-400 text-[10px] block">Location</span>
                  <span className="font-semibold text-zinc-900 dark:text-white truncate block mt-0.5">
                    {job.location || "Dire Dawa, ET"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800">
                  <span className="text-zinc-400 text-[10px] block">Requested Timeline</span>
                  <span className="font-semibold text-zinc-900 dark:text-white truncate block mt-0.5">
                    {formatDate(job.requested_date)}
                  </span>
                </div>
              </div>

              {/* Milestone Protection Trust Note */}
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                <RiShieldCheckFill className="size-5 shrink-0 text-emerald-500" />
                <span>Protected by DireSkill Direct Settlement: Funds are guaranteed upon client confirmation without escrow delay.</span>
              </div>

              {/* Action Buttons */}
              {showActions && job.status === "pending" && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDeclineModalOpen(true)}
                    disabled={loading !== null}
                    className="flex-1 py-3 rounded-full border border-slate-200 dark:border-zinc-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    Decline Request
                  </button>

                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={loading !== null}
                    className="flex-1 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading === "accept" ? (
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RiCheckLine className="size-4" />
                    )}
                    <span>Accept Job</span>
                  </button>
                </div>
              )}

              {job.contract_id && (
                <Link
                  href={`/worker/contracts/${job.contract_id}`}
                  className="w-full py-3 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold flex items-center justify-center gap-2 transition hover:opacity-90"
                >
                  <span>View Contract Details</span>
                </Link>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Decline Reasons Sub-Modal ── */}
      <AnimatePresence>
        {isDeclineModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-[2.25rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-7 shadow-2xl space-y-4"
            >
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Decline Job Request
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Please select a reason to let the client know why you are unable to take this job.
              </p>

              <div className="space-y-2">
                {declineReasons.map((reason) => {
                  const ReasonIcon = reason.Icon;
                  return (
                  <button
                    key={reason.key}
                    type="button"
                    onClick={() => setSelectedReasonKey(reason.key)}
                    className={`w-full p-3 rounded-xl border text-xs font-medium text-left flex items-center gap-2.5 transition cursor-pointer ${
                      selectedReasonKey === reason.key
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
                        : "border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <ReasonIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{(t as any)(reason.key) || reason.key}</span>
                  </button>
                  );
                })}
              </div>

              {selectedReasonKey === "worker.jobs.reason_other" && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Provide brief details..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                />
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeclineModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDecline}
                  disabled={loading === "reject"}
                  className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading === "reject" ? (
                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Confirm Decline</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
