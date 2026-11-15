"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWorkerJobs, acceptJob, rejectJob } from "@/lib/actions/jobs";
import JobCard from "@/components/worker/JobCard";
import { useLanguage } from "@/context/LanguageContext";
import {
  RiBriefcaseLine,
  RiTimeLine,
  RiCheckDoubleLine,
  RiCloseLine,
  RiSparklingFill,
  RiInboxLine,
} from "@remixicon/react";

interface Job {
  id: string;
  client_id?: string | null;
  title: string;
  description: string | null;
  budget: number | null;
  location?: string | null;
  requested_date?: string | null;
  status: string;
  rejection_reason?: string | null;
  created_at: string;
  client_name: string | null;
  client_avatar: string | null;
  contract_id: string | null;
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

export default function WorkerJobsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "active" | "accepted" | "done">("all");

  const fetchJobs = useCallback(async () => {
    try {
      const data = await getWorkerJobs();
      setJobs(data as Job[]);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleAccept = async (jobId: string) => {
    const result = await acceptJob(jobId);
    if (result.success) {
      await fetchJobs();
    } else if (result.code === "CONTRACT_SETUP_REQUIRED") {
      router.push("/worker/contract-setup");
    }
  };

  const handleReject = async (jobId: string, reason?: string) => {
    const result = await rejectJob(jobId, reason);
    if (result.success) {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "rejected", rejection_reason: reason || null } : j))
      );
    }
  };

  const pendingJobs = jobs.filter((j) => j.status === "pending");
  const activeJobs = jobs.filter((j) => j.status === "in_progress");
  const acceptedJobs = jobs.filter((j) => j.status === "accepted" || j.status === "active");
  const doneJobs = jobs.filter((j) =>
    ["completion_requested", "completed", "payment_pending", "paid", "closed"].includes(j.status)
  );

  const filteredJobs =
    filterTab === "pending"
      ? pendingJobs
      : filterTab === "active"
      ? activeJobs
      : filterTab === "accepted"
      ? acceptedJobs
      : filterTab === "done"
      ? doneJobs
      : [...pendingJobs, ...jobs.filter((j) => j.status !== "pending")];

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 md:space-y-8 font-['Inter',system-ui,sans-serif] text-zinc-900 dark:text-zinc-100 pb-28 md:pb-12">
      
      {/* ── Top Header Card (with Topographic Contour Aesthetic & Embedded Counters) ── */}
      <div className="relative rounded-[2rem] bg-[#111216] dark:bg-zinc-950 text-white p-6 sm:p-8 overflow-hidden border border-zinc-800 shadow-md space-y-6">
        <TopographicContourSvg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 text-white" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              {t("worker.jobs.title") || "Direct Job Inquiries"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed">
              {t("worker.jobs.subtitle") || "Review client invitations, evaluate contract budgets, and accept offers."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {pendingJobs.length > 0 && (
              <div className="relative z-10 flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-full text-emerald-300 text-xs font-bold shrink-0">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{pendingJobs.length} {t("worker.jobs.badge_new") || "Awaiting Decision"}</span>
              </div>
            )}
            <Link
              href="/worker/gigs"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 px-5 text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <RiBriefcaseLine className="size-4" />
              <span>My Gigs & Contracts</span>
            </Link>
          </div>
        </div>

        {/* ── Embedded Counters: Active, Accepted, Done Inside Direct Job Inquiries Card ── */}
        <div className="relative z-10 grid grid-cols-3 gap-3 pt-2 border-t border-zinc-800/80">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center backdrop-blur-xs">
            <p className="text-2xl sm:text-3xl font-black text-emerald-400">
              {loading ? "–" : activeJobs.length}
            </p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
              Active
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center backdrop-blur-xs">
            <p className="text-2xl sm:text-3xl font-black text-white">
              {loading ? "–" : acceptedJobs.length}
            </p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
              Accepted
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-3 sm:p-4 text-center backdrop-blur-xs">
            <p className="text-2xl sm:text-3xl font-black text-zinc-300">
              {loading ? "–" : doneJobs.length}
            </p>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
              Done
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs (Exact Match with /worker/gigs) ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: "all", label: "All Inquiries", count: jobs.length },
          { key: "pending", label: "Awaiting Decision", count: pendingJobs.length },
          { key: "active", label: "Active", count: activeJobs.length },
          { key: "accepted", label: "Accepted", count: acceptedJobs.length },
          { key: "done", label: "Done", count: doneJobs.length },
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

      {/* ── Job Cards Grid (Matches Pinterest/Stripe Card Layout) ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[2.25rem] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 space-y-4 animate-pulse min-h-[260px]"
            >
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
      ) : filteredJobs.length === 0 ? (
        <div className="rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 p-16 flex flex-col items-center justify-center gap-4 text-center shadow-sm">
          <div className="size-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
            <RiInboxLine className="size-8" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-zinc-900 dark:text-white">
              {t("worker.jobs.empty_title") || "No Job Inquiries In This View"}
            </p>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
              {t("worker.jobs.empty_desc") || "Client job inquiries and offers matching this status will appear here."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              showActions={job.status === "pending"}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

    </div>
  );
}
