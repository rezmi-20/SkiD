"use client";

import { useEffect, useState, useCallback } from "react";
import { completeJob, getWorkerJobs, startJob } from "@/lib/actions/jobs";
import { useLanguage } from "@/context/LanguageContext";

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
}

export default function GigsPage() {
  const { t } = useLanguage();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleStartJob = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      const result = await startJob(jobId);
      if (result.success) {
        setGigs((prev) =>
          prev.map((g) => (g.id === jobId ? { ...g, status: "in_progress" } : g))
        );
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error("Failed to start job", err);
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
          prev.map((g) => (g.id === jobId ? { ...g, status: "completed" } : g))
        );
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error("Failed to complete job", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter gigs by status groups
  const activeGigs = gigs.filter((g) => g.status === "in_progress");
  const acceptedGigs = gigs.filter((g) => g.status === "active" || g.status === "accepted");
  const completedGigs = gigs.filter((g) => g.status === "completed");

  const activeCount = activeGigs.length;
  const acceptedCount = acceptedGigs.length;
  const doneCount = completedGigs.length;

  return (
    <div className="space-y-8 pb-28 md:pb-10 text-on-surface">

      {/* ── Header ── */}
      <div className="flex items-start justify-between px-1">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-on-surface">{t("worker.gigs.title")}</h1>
          <p className="text-on-surface-variant text-sm font-medium opacity-60">{t("worker.gigs.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t("worker.gigs.badge_live")}</span>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t("worker.gigs.stat_active"), value: loading ? "–" : String(activeCount), color: "text-primary" },
          { label: t("worker.gigs.stat_accepted"), value: loading ? "–" : String(acceptedCount), color: "text-on-surface" },
          { label: t("worker.gigs.stat_done"), value: loading ? "–" : String(doneCount), color: "text-on-surface-variant" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-low border border-outline-variant rounded-[2rem] p-5 text-center space-y-2 shadow-sm">
            <span className={`text-3xl md:text-5xl font-black tracking-tighter ${stat.color}`}>{stat.value}</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface-container-low border border-outline-variant rounded-[2.5rem] p-8 space-y-5 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-3 w-20 bg-surface-container-high rounded-lg" />
                  <div className="h-5 w-48 bg-surface-container-high rounded-lg" />
                  <div className="h-3 w-32 bg-surface-container-high rounded-lg" />
                </div>
                <div className="h-7 w-20 bg-surface-container-high rounded-lg" />
              </div>
              <div className="h-2 bg-surface-container-high rounded-full" />
              <div className="flex gap-3">
                <div className="flex-1 h-11 bg-surface-container-high rounded-xl" />
                <div className="w-24 h-11 bg-surface-container-high rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Active Gigs (In Progress) ── */}
      {!loading && activeGigs.map((gig) => (
        <div key={gig.id} className="relative overflow-hidden bg-surface-container border border-primary/20 rounded-[2.5rem] p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-60 h-60 bg-primary/5 blur-[80px] pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">{t("worker.gigs.active_now")}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-on-surface">{gig.title}</h2>
                <p className="text-sm text-on-surface-variant font-medium opacity-60">
                  Client: {gig.client_name || "Client"} · {new Date(gig.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-black text-primary">{gig.budget ? `${gig.budget.toLocaleString()} ETB` : "—"}</p>
                <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest mt-0.5 opacity-40">{t("worker.gigs.budget")}</p>
              </div>
            </div>

            {/* Progress Bar (visual only — 50% for in_progress) */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">{t("worker.gigs.progress")}</span>
                <span className="text-[10px] font-black text-primary">50%</span>
              </div>
              <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-700"
                  style={{ width: "50%" }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleCompleteJob(gig.id)}
                disabled={actionLoading === gig.id}
                className="flex-1 h-11 bg-primary text-on-primary rounded-xl font-black text-sm tracking-tight transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading === gig.id ? (
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                )}
                {t("worker.gigs.btn_complete")}
              </button>
              <button className="px-5 h-11 bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-on-surface rounded-xl font-black text-sm transition-all active:scale-95">
                {t("worker.gigs.btn_details")}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* ── Accepted Gigs (Ready to Start) ── */}
      {!loading && acceptedGigs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-40 ml-1">{t("worker.gigs.ready_start")}</h2>
          {acceptedGigs.map((gig) => (
            <div key={gig.id} className="group bg-surface-container-low border border-outline-variant hover:border-primary/20 rounded-[1.75rem] p-5 md:p-6 transition-all duration-300 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container-high border border-outline-variant rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                  <span className="material-symbols-outlined text-on-surface-variant opacity-40 group-hover:text-primary group-hover:opacity-100 transition-all">
                    work
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">{gig.title}</h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5 opacity-60">
                    {gig.client_name || "Client"} · {new Date(gig.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-black text-on-surface">{gig.budget ? `${gig.budget.toLocaleString()} ETB` : "—"}</p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-secondary">{t("worker.gigs.stat_accepted")}</span>
                  </div>
                  <button
                    onClick={() => handleStartJob(gig.id)}
                    disabled={actionLoading === gig.id}
                    className="h-10 px-4 bg-primary text-on-primary rounded-xl font-black text-xs tracking-tight transition-all active:scale-95 shadow-md shadow-primary/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {actionLoading === gig.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    )}
                    {t("worker.gigs.btn_start")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Completed Gigs ── */}
      {!loading && completedGigs.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-40 ml-1">{t("worker.gigs.completed_section")}</h2>
          {completedGigs.map((gig) => (
            <div key={gig.id} className="group bg-surface-container-low border border-outline-variant rounded-[1.75rem] p-5 md:p-6 flex items-center gap-4 transition-all duration-300 shadow-sm opacity-60">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary opacity-60">
                  check_circle
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-on-surface truncate">{gig.title}</h3>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5 opacity-60">
                  {gig.client_name || "Client"} · {new Date(gig.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-on-surface">{gig.budget ? `${gig.budget.toLocaleString()} ETB` : "—"}</p>
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">{t("worker.gigs.stat_done")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state if no gigs ── */}
      {!loading && gigs.filter(g => ["active", "accepted", "in_progress", "completed"].includes(g.status)).length === 0 && (
        <div className="relative overflow-hidden bg-surface-container-low border border-dashed border-outline rounded-[2.5rem] py-20 flex flex-col items-center justify-center gap-6 text-center">
          <div className="w-20 h-20 bg-surface-container-high border border-outline-variant rounded-3xl flex items-center justify-center">
             <span className="material-symbols-outlined text-on-surface-variant opacity-20 text-[36px]">construction</span>
          </div>
          <div className="space-y-2">
            <p className="text-on-surface font-black text-lg">{t("worker.gigs.empty_title")}</p>
            <p className="text-on-surface-variant text-sm font-medium max-w-xs leading-relaxed opacity-60">{t("worker.gigs.empty_desc")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
