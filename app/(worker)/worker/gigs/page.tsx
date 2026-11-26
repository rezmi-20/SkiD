"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { completeJob, getWorkerJobs, startJob } from "@/lib/actions/jobs";
import { useLanguage } from "@/context/LanguageContext";
import { useFeedback } from "@/components/ui/feedback";
import {
  RiBriefcaseLine,
  RiPlayFill,
  RiCheckDoubleFill,
  RiTimeLine,
  RiMapPin2Line,
  RiShieldCheckFill,
  RiBookmarkLine,
  RiBookmarkFill,
  RiCloseLine,
  RiFileTextLine,
  RiInboxLine,
  RiMessage3Line,
} from "@remixicon/react";

interface Gig {
  id: string;
  title: string;
  description: string | null;
  budget: number | null;
  status: string;
  created_at: string;
  client_name: string | null;
  client_avatar: string | null;
  contract_id: string | null;
  completion_rejection_reason?: string | null;
  location?: string | null;
}

/* ── draw-svg Skill: Topographic Contour Vector Background Texture ─────────── */
function TopographicContourSvg({ className = "absolute inset-0 w-full h-full pointer-events-none opacity-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none" aria-hidden="true">
      <path d="M-50 120 C 150 70, 260 170, 460 120 C 660 70, 760 150, 900 90" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.45" />
      <path d="M-50 150 C 120 100, 230 200, 430 150 C 630 100, 730 180, 900 120" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
      <path d="M-50 90 C 180 40, 290 140, 490 90 C 690 40, 790 120, 900 60" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.25" />
    </svg>
  );
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

function formatBudget(value: number | null | undefined) {
  if (value === null || value === undefined || value <= 0) return "Negotiable";
  return `${Number(value).toLocaleString()} ETB`;
}

export default function GigsPage() {
  const { t } = useLanguage();
  const { toast } = useFeedback();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "accepted" | "completed">("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [selectedGigDetails, setSelectedGigDetails] = useState<Gig | null>(null);

  const fetchGigs = useCallback(async () => {
    try {
      const data = await getWorkerJobs();
      setGigs(data as Gig[]);
    } catch (err) {
      console.error("Failed to load gigs", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStartJob = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const result = await startJob(jobId);
      if (result.success) {
        setGigs((prev) =>
          prev.map((g) => (g.id === jobId ? { ...g, status: "in_progress" } : g))
        );
        setSelectedGigDetails(null);
        toast.success("Job marked as in progress.");
      } else {
        toast.error(result.error || "Unable to start job.");
      }
    } catch (err) {
      console.error("Failed to start job", err);
      toast.error("Unable to start job right now.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const result = await completeJob(jobId);
      if (result.success) {
        setGigs((prev) =>
          prev.map((g) => (g.id === jobId ? { ...g, status: "completion_requested" } : g))
        );
        setSelectedGigDetails(null);
        toast.success("Completion request sent to client.");
      } else {
        toast.error(result.error || "Unable to request job completion.");
      }
    } catch (err) {
      console.error("Failed to complete job", err);
      toast.error("Unable to request job completion right now.");
    } finally {
      setActionLoading(null);
    }
  };

  // Status groups
  const activeGigs = gigs.filter((g) => g.status === "in_progress");
  const acceptedGigs = gigs.filter((g) => g.status === "active" || g.status === "accepted");
  const completedGigs = gigs.filter((g) =>
    ["completion_requested", "completed", "payment_pending", "paid", "closed"].includes(g.status)
  );
  const pendingRequests = gigs.filter((g) => g.status === "pending");

  const filteredGigs =
    filterTab === "active"
      ? activeGigs
      : filterTab === "accepted"
      ? acceptedGigs
      : filterTab === "completed"
      ? completedGigs
      : gigs;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 md:space-y-8 font-['Inter',system-ui,sans-serif] text-zinc-900 dark:text-zinc-100 pb-28 md:pb-12">
      
      {/* ── Top Header Card (with Topographic Contour Aesthetic & Embedded Counters) ── */}
      <div className="relative rounded-[2rem] bg-[#111216] dark:bg-zinc-950 text-white p-6 sm:p-8 overflow-hidden border border-zinc-800 shadow-md space-y-6">
        <TopographicContourSvg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 text-white" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              {t("worker.gigs.title") || "My Gigs & Contracts"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed">
              {t("worker.gigs.subtitle") || "Track active milestones, initiate scheduled jobs, and request client completion."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/worker/jobs"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 px-5 text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <RiInboxLine className="size-4" />
              <span>Job Inquiries</span>
              {pendingRequests.length > 0 && (
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] text-white font-bold ml-1">
                  {pendingRequests.length}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ── Embedded Counters: Active, Accepted, Done Inside My Gigs Card ── */}
        <div className="relative z-10 grid grid-cols-3 gap-3 pt-2 border-t border-zinc-800/80">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center backdrop-blur-xs">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">
              {loading ? "–" : activeGigs.length}
            </p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
              Active
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center backdrop-blur-xs">
            <p className="text-2xl sm:text-3xl font-black text-white">
              {loading ? "–" : acceptedGigs.length}
            </p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
              Accepted
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center backdrop-blur-xs">
            <p className="text-2xl sm:text-3xl font-black text-zinc-300">
              {loading ? "–" : completedGigs.length}
            </p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
              Done
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: "all", label: "All Gigs", count: gigs.length },
          { key: "active", label: "Active", count: activeGigs.length },
          { key: "accepted", label: "Accepted", count: acceptedGigs.length },
          { key: "completed", label: "Done", count: completedGigs.length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterTab(tab.key as any)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterTab === tab.key
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-zinc-800"
            }`}
          >
            {tab.label} <span className="opacity-60 ml-1">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* ── Gigs Cards Grid (Matches Pinterest/Stripe Card Layout) ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[2.25rem] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 space-y-4 animate-pulse min-h-[260px]">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              </div>
              <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              <div className="h-10 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full ml-auto" />
            </div>
          ))}
        </div>
      ) : filteredGigs.length === 0 ? (
        <div className="rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 p-16 text-center space-y-3 shadow-sm">
          <div className="size-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <RiBriefcaseLine className="size-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">
            No gigs in this view
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Jobs accepted from clients in Dire Dawa will appear here for progress execution.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredGigs.map((gig) => {
            const isBookmarked = bookmarkedIds.has(gig.id);
            const isInProgress = gig.status === "in_progress";
            const isAccepted = gig.status === "active" || gig.status === "accepted";
            const isDone = ["completion_requested", "completed", "payment_pending", "paid", "closed"].includes(gig.status);
            const clientName = gig.client_name || "Dire Dawa Client";
            const initials = clientName.split(" ").filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "CL";

            return (
              <article
                key={gig.id}
                className="rounded-[2.25rem] border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[270px] group"
              >
                <div className="space-y-3.5">
                  {/* Top Row: Client Brand Avatar + Company Name + Bookmark Button */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-11 sm:size-12 rounded-full border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        {gig.client_avatar ? (
                          <img src={gig.client_avatar} alt="" className="size-full object-cover" />
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
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                            isInProgress
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isAccepted
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-zinc-400"
                          }`}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {isInProgress ? "Active" : isAccepted ? "Accepted" : "Done"}
                        </span>
                      </div>
                    </div>

                    {/* Bookmark Icon Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(gig.id, e)}
                      aria-label="Bookmark Gig"
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
                      {gig.title}
                    </h3>
                    <span className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white shrink-0">
                      {formatBudget(gig.budget)}
                    </span>
                  </div>

                  {/* Description Snippet (2-line clamped) */}
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {gig.description || "Active milestone execution in Dire Dawa governed under DireSkill Milestone Protection."}
                  </p>
                </div>

                {/* Bottom Row: Date & Location on Left + Solid Dark Pill 'Details' Button on Right */}
                <div className="flex items-end justify-between gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/80 mt-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                      {formatDate(gig.created_at)}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5 flex items-center gap-1">
                      <RiMapPin2Line className="size-3 shrink-0" />
                      <span>{gig.location || "Dire Dawa, Ethiopia"}</span>
                    </p>
                  </div>

                  {/* Details Action Pill */}
                  <button
                    type="button"
                    onClick={() => setSelectedGigDetails(gig)}
                    className="rounded-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 px-5 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    Details
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Stageshow Interactive Modal Drawer for Gig Details ── */}
      <AnimatePresence>
        {selectedGigDetails && (
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
                onClick={() => setSelectedGigDetails(null)}
                className="absolute top-6 right-6 size-9 rounded-full bg-slate-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <RiCloseLine className="size-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 pr-8">
                <div className="size-12 rounded-full border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                  {selectedGigDetails.client_avatar ? (
                    <img src={selectedGigDetails.client_avatar} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="size-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center">
                      CL
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {selectedGigDetails.client_name || "Dire Dawa Client"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Status:{" "}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedGigDetails.status === "in_progress"
                        ? "Active"
                        : selectedGigDetails.status === "accepted" || selectedGigDetails.status === "active"
                        ? "Accepted"
                        : ["completion_requested", "completed", "payment_pending", "paid", "closed"].includes(selectedGigDetails.status)
                        ? "Done"
                        : selectedGigDetails.status.replace("_", " ")}
                    </span>
                  </p>
                </div>
              </div>

              {/* Title & Budget Card */}
              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 p-4 space-y-1.5 border border-slate-100 dark:border-zinc-800">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  {selectedGigDetails.title}
                </p>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-zinc-500">Contract Value</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatBudget(selectedGigDetails.budget)}
                  </span>
                </div>
              </div>

              {/* Scope of Work */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <RiFileTextLine className="size-4 text-emerald-500" />
                  Scope of Work & Agreement
                </span>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto pr-2">
                  {selectedGigDetails.description || "Milestone execution governed by DireSkill Milestone Protection terms in Dire Dawa."}
                </p>
              </div>

              {/* Revision note if any */}
              {selectedGigDetails.completion_rejection_reason && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs space-y-1 text-amber-700 dark:text-amber-300">
                  <p className="font-bold uppercase tracking-wider text-[10px]">
                    Client Revision Request
                  </p>
                  <p className="italic">&ldquo;{selectedGigDetails.completion_rejection_reason}&rdquo;</p>
                </div>
              )}

              {/* Direct Actions */}
              <div className="flex flex-col gap-2.5 pt-2">
                {selectedGigDetails.status === "in_progress" && (
                  <button
                    type="button"
                    onClick={() => handleCompleteJob(selectedGigDetails.id)}
                    disabled={actionLoading === selectedGigDetails.id}
                    className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading === selectedGigDetails.id ? (
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RiCheckDoubleFill className="size-4" />
                    )}
                    <span>Request Milestone Completion</span>
                  </button>
                )}

                {(selectedGigDetails.status === "active" || selectedGigDetails.status === "accepted") && (
                  <button
                    type="button"
                    onClick={() => handleStartJob(selectedGigDetails.id)}
                    disabled={actionLoading === selectedGigDetails.id}
                    className="w-full py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading === selectedGigDetails.id ? (
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RiPlayFill className="size-4" />
                    )}
                    <span>Start Working</span>
                  </button>
                )}

                {selectedGigDetails.contract_id && (
                  <Link
                    href={`/worker/contracts/${selectedGigDetails.contract_id}`}
                    className="w-full py-3 rounded-full border border-slate-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                  >
                    <span>View Contract Document</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
