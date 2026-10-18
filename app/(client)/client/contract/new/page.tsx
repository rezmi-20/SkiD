"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createJob } from "@/lib/actions/jobs";
import { getContractSetupStatus } from "@/lib/actions/contract-setup";
import { useLanguage } from "@/context/LanguageContext";

interface WorkerInfo {
  id: string;
  full_name: string;
  avatar_url: string | null;
  skills: string[];
  hourly_rate: number | null;
  avg_rating: string | number;
}

export default function NewContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = searchParams.get("workerId");
  const { t } = useLanguage();

  const [worker, setWorker] = useState<WorkerInfo | null>(null);
  const [loadingWorker, setLoadingWorker] = useState(!!workerId);
  const [checkingSetup, setCheckingSetup] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load worker info when workerId present
  useEffect(() => {
    getContractSetupStatus(undefined, `/client/contract/new${window.location.search}`)
      .then((status) => {
        if (!status.completed) {
          router.replace(status.setupHref);
          return;
        }
        setCheckingSetup(false);
      })
      .catch(() => setCheckingSetup(false));
  }, [router]);

  // Load worker info when workerId present
  useEffect(() => {
    if (!workerId) return;
    fetch(`/api/workers/${workerId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Worker not found");
        return r.json();
      })
      .then((d) => setWorker(d.worker))
      .catch(() => setWorker(null))
      .finally(() => setLoadingWorker(false));
  }, [workerId]);

  if (checkingSetup) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError(t("contract.new.err_title_req"));
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const result = await createJob({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        budget: formData.budget ? parseInt(formData.budget, 10) : undefined,
        workerId: workerId || undefined,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/client/dashboard");
        }, 1500);
      } else {
        if (result.code === "CONTRACT_SETUP_REQUIRED") {
          router.push("/client/profile/settings?verify=1&returnTo=/client/contract/new");
          return;
        }
        setError(result.error || t("contract.new.err_unexpected"));
      }
    } catch {
      setError(t("contract.new.err_unexpected"));
    } finally {
      setSubmitting(false);
    }
  };

  const rating = worker ? Number(worker.avg_rating || 0) : 0;
  const primarySkill =
    worker?.skills && worker.skills.length > 0 ? worker.skills[0] : null;

  return (
    <div className="space-y-6 pb-28 md:pb-12 text-on-surface max-w-6xl mx-auto px-1 sm:px-2">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-on-surface">
            {t("contract.new.title")}
          </h1>
          <p className="text-on-surface-variant text-xs sm:text-sm font-medium opacity-70">
            {t("contract.new.subtitle")}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 bg-surface-container border border-outline-variant/60 px-3.5 py-1.5 rounded-full text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>
          {t("common.back")}
        </button>
      </div>

      {/* ── Responsive 2-Column Grid (Desktop: Form + Sticky Sidebar | Mobile: Stacked) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Left Column: Worker info card + Form */}
        <div className="space-y-6">
          {/* ── Worker Card (if workerId present) ── */}
          {workerId && (
            <div className="bg-[#0e141d] border border-outline-variant/60 rounded-3xl p-5 sm:p-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-60 mb-3.5">
                {t("contract.new.hiring")}
              </p>
              {loadingWorker ? (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-high animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-surface-container-high rounded-lg animate-pulse" />
                    <div className="h-3 w-24 bg-surface-container-high rounded-lg animate-pulse" />
                  </div>
                </div>
              ) : worker ? (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container border border-outline-variant/60 overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-[#a3e635]/20">
                    {worker.avatar_url ? (
                      <img
                        src={worker.avatar_url}
                        alt={worker.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant opacity-40 text-[28px]">
                        person
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-on-surface truncate">
                      {worker.full_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {primarySkill && (
                        <span className="text-xs font-semibold text-[#a3e635]">
                          {primarySkill}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="#f59e0b"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  {worker.hourly_rate && (
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-[#a3e635]">
                        {worker.hourly_rate}
                      </p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                        ETB / hr
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant opacity-60">
                  {t("contract.new.err_worker_load")}
                </p>
              )}
            </div>
          )}

          {/* ── Proposal Form ── */}
          <form onSubmit={handleSubmit} className="bg-surface-container/60 border border-outline-variant/60 rounded-3xl p-5 sm:p-7 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70 ml-1">
                {t("contract.new.job_title")} *
              </label>
              <input
                type="text"
                placeholder={t("contract.new.job_title_placeholder")}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full h-13 sm:h-14 bg-surface-container-low border border-outline-variant/60 rounded-2xl px-5 text-on-surface font-medium placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#a3e635]/60 focus:ring-2 focus:ring-[#a3e635]/20 transition-all text-sm sm:text-base"
              />
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70 ml-1">
                {t("contract.new.budget")}
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-xs uppercase tracking-wider text-[#a3e635]">
                  ETB
                </span>
                <input
                  type="number"
                  min={0}
                  placeholder={t("contract.new.budget_placeholder")}
                  value={formData.budget}
                  onChange={(e) =>
                    setFormData({ ...formData, budget: e.target.value })
                  }
                  className="w-full h-13 sm:h-14 bg-surface-container-low border border-outline-variant/60 rounded-2xl pl-16 pr-5 text-on-surface font-medium placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#a3e635]/60 focus:ring-2 focus:ring-[#a3e635]/20 transition-all text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Description / Terms */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70 ml-1">
                {t("contract.new.description")}
              </label>
              <textarea
                rows={5}
                placeholder={t("contract.new.description_placeholder")}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-2xl px-5 py-4 text-on-surface font-medium placeholder:text-on-surface-variant/40 focus:outline-none focus:border-[#a3e635]/60 focus:ring-2 focus:ring-[#a3e635]/20 transition-all resize-none text-sm sm:text-base"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl px-5 py-3.5 text-sm font-medium">
                <span className="material-symbols-outlined text-[20px]">
                  error
                </span>
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-center gap-3 bg-[#a3e635]/15 border border-[#a3e635]/30 text-[#a3e635] rounded-2xl px-5 py-3.5 text-sm font-bold">
                <span className="material-symbols-outlined text-[20px]">
                  check_circle
                </span>
                {t("contract.new.success_redirect")}
              </div>
            )}

            {/* Submit: Shopnest Pill Button */}
            <button
              type="submit"
              disabled={submitting || success}
              className="w-full h-12 md:h-14 bg-[#a3e635] text-black rounded-full font-black text-sm sm:text-base tracking-tight transition-all active:scale-[0.98] shadow-[0_4px_18px_rgba(163,230,53,0.3)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  {t("contract.new.sending")}
                </>
              ) : success ? (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    check
                  </span>
                  {t("contract.new.sent")}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    send
                  </span>
                  {t("contract.new.send_request")}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Sticky desktop sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24">
          {/* Live Estimate Card */}
          <div className="bg-[#0e141d] border border-outline-variant/60 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-on-surface-variant opacity-60">
                Proposal Summary
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#a3e635] animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">Estimated Budget</p>
              <p className="text-3xl font-black text-on-surface tracking-tight mt-0.5">
                {formData.budget ? Number(formData.budget).toLocaleString() : "0"}{" "}
                <span className="text-sm font-bold text-[#a3e635]">ETB</span>
              </p>
            </div>
            <div className="border-t border-outline-variant/40 pt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Contract Type</span>
                <span className="font-bold text-on-surface">Direct Agreement</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Signing Flow</span>
                <span className="font-bold text-[#a3e635]">Dual 6-Digit PIN</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Payment Protection</span>
                <span className="font-bold text-on-surface">Chapa Direct Verification</span>
              </div>
            </div>
          </div>

          {/* How It Works Guidance Card */}
          <div className="bg-surface-container/60 border border-outline-variant/60 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#a3e635]/15 text-[#a3e635] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">
                  verified_user
                </span>
              </div>
              <h3 className="text-sm font-bold text-on-surface">{t("contract.new.how_it_works")}</h3>
            </div>
            <div className="space-y-3 pl-1">
              {[
                t("contract.new.step1"),
                t("contract.new.step2"),
                t("contract.new.step3"),
                t("contract.new.step4"),
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-[#a3e635]/15 border border-[#a3e635]/30 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black text-[#a3e635]">
                      {i + 1}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed opacity-80">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
