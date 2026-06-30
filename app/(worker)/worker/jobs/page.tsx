"use client";

import { useEffect, useState, useCallback } from "react";
import { getWorkerJobs, acceptJob, rejectJob } from "@/lib/actions/jobs";
import JobCard from "@/components/worker/JobCard";
import { useLanguage } from "@/context/LanguageContext";

interface Job {
  id: string;
  title: string;
  description: string | null;
  budget: number | null;
  status: string;
  created_at: string;
  client_name: string | null;
  client_avatar: string | null;
  contract_id: string | null;
}

export default function WorkerJobsPage() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "accepted" } : j))
      );
    }
  };

  const handleReject = async (jobId: string) => {
    const result = await rejectJob(jobId);
    if (result.success) {
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "rejected" } : j))
      );
    }
  };

  const pendingJobs = jobs.filter((j) => j.status === "pending");
  const respondedJobs = jobs.filter(
    (j) => j.status === "accepted" || j.status === "rejected"
  );

  return (
    <div className="space-y-8 pb-28 md:pb-10 text-on-surface">
      {/* ── Header ── */}
      <div className="flex items-start justify-between px-1">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-on-surface">
            {t("worker.jobs.title")}
          </h1>
          <p className="text-on-surface-variant text-sm font-medium opacity-60">
            {t("worker.jobs.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">
            {pendingJobs.length} {t("worker.jobs.badge_new")}
          </span>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: t("worker.jobs.stat_pending"),
            value: pendingJobs.length.toString(),
            color: "text-secondary",
          },
          {
            label: t("worker.jobs.stat_accepted"),
            value: jobs
              .filter((j) => j.status === "accepted")
              .length.toString(),
            color: "text-primary",
          },
          {
            label: t("worker.jobs.stat_declined"),
            value: jobs
              .filter((j) => j.status === "rejected")
              .length.toString(),
            color: "text-on-surface-variant",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-low border border-outline-variant rounded-[2rem] p-5 text-center space-y-2 shadow-sm"
          >
            <span
              className={`text-3xl md:text-5xl font-black tracking-tighter ${stat.color}`}
            >
              {loading ? "–" : stat.value}
            </span>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Loading State ── */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-surface-container-low border border-outline-variant rounded-[2rem] p-6 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-surface-container-high" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-surface-container-high rounded-lg" />
                  <div className="h-3 w-20 bg-surface-container-high rounded-lg" />
                </div>
              </div>
              <div className="h-5 w-48 bg-surface-container-high rounded-lg" />
              <div className="h-3 w-full bg-surface-container-high rounded-lg" />
              <div className="flex gap-3">
                <div className="flex-1 h-12 bg-surface-container-high rounded-xl" />
                <div className="flex-1 h-12 bg-surface-container-high rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pending Requests ── */}
      {!loading && pendingJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-40 ml-1">
            {t("worker.jobs.awaiting")}
          </h2>
          <div className="space-y-4">
            {pendingJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Responded Jobs ── */}
      {!loading && respondedJobs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-40 ml-1">
            {t("worker.jobs.previously")}
          </h2>
          <div className="space-y-3">
            {respondedJobs.map((job) => (
              <div
                key={job.id}
                className="group bg-surface-container-low border border-outline-variant rounded-[1.75rem] p-5 md:p-6 flex items-center gap-4 transition-all duration-300 shadow-sm opacity-60"
              >
                <div className="w-12 h-12 bg-surface-container-high border border-outline-variant rounded-2xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant opacity-40">
                    {job.status === "accepted"
                      ? "check_circle"
                      : "do_not_disturb_on"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-on-surface truncate">
                    {job.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5 opacity-60">
                    {job.client_name || t("worker.jobs.anonymous")} •{" "}
                    {new Date(job.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {job.budget && (
                    <p className="text-sm font-black text-on-surface">
                      {job.budget.toLocaleString()} ETB
                    </p>
                  )}
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest ${
                      job.status === "accepted"
                        ? "text-primary"
                        : "text-red-400"
                    }`}
                  >
                    {job.status === "accepted" ? t("worker.jobs.stat_accepted") : t("worker.jobs.stat_declined")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && jobs.length === 0 && (
        <div className="relative overflow-hidden bg-surface-container-low border border-dashed border-outline rounded-[2.5rem] py-20 flex flex-col items-center justify-center gap-6 text-center">
          <div className="w-20 h-20 bg-surface-container-high border border-outline-variant rounded-3xl flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant opacity-20 text-[36px]">
              inbox
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-on-surface font-black text-lg">
              {t("worker.jobs.empty_title")}
            </p>
            <p className="text-on-surface-variant text-sm font-medium max-w-xs leading-relaxed opacity-60">
              {t("worker.jobs.empty_desc")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
