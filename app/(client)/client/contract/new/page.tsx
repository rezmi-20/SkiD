"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createJob } from "@/lib/actions/jobs";
import { getContractSetupStatus } from "@/lib/actions/contract-setup";
import { useLanguage } from "@/context/LanguageContext";
import {
  RiArrowLeftLine,
  RiBriefcaseLine,
  RiShieldCheckFill,
  RiStarFill,
  RiUserLine,
  RiCoinsLine,
  RiFileTextLine,
  RiSendPlane2Fill,
  RiCheckDoubleLine,
  RiInformationLine,
  RiLock2Line,
} from "@remixicon/react";
import { cx } from "@/utils/cx";

interface WorkerInfo {
  id: string;
  full_name: string;
  avatar_url: string | null;
  skills: string[];
  hourly_rate: number | null;
  avg_rating: string | number;
}

const DEMO_WORKER: WorkerInfo = {
  id: "demo-worker",
  full_name: "Tadesse Hailu",
  avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  skills: ["Commercial Satellite Alignment", "Coaxial Telemetry", "Cabling"],
  hourly_rate: 450,
  avg_rating: 4.9,
};

export default function NewContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workerId = searchParams.get("workerId") || "demo-worker";
  const isDemo = searchParams.get("demo") === "1" || workerId === "demo-worker";
  const { t } = useLanguage();

  const [worker, setWorker] = useState<WorkerInfo | null>(DEMO_WORKER);
  const [loadingWorker, setLoadingWorker] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(!isDemo);

  const [formData, setFormData] = useState({
    title: "Commercial Satellite Dish & LNB Alignment",
    description:
      "Mount heavy-duty parabolic dish on residential roof, align dual Ku-band LNBs, certify transponder signal strength, and install weather-sealed RG6 coaxial cables.",
    budget: "4000",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Setup verification check (bypassed in preview demo mode)
  useEffect(() => {
    if (isDemo) {
      setCheckingSetup(false);
      return;
    }

    getContractSetupStatus(undefined, `/client/contract/new${window.location.search}`)
      .then((status) => {
        if (!status.completed) {
          router.replace(status.setupHref);
          return;
        }
        setCheckingSetup(false);
      })
      .catch(() => setCheckingSetup(false));
  }, [router, isDemo]);

  // Load worker info
  useEffect(() => {
    if (!workerId || workerId === "demo-worker") {
      setWorker(DEMO_WORKER);
      return;
    }
    setLoadingWorker(true);
    fetch(`/api/workers/${workerId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Worker not found");
        return r.json();
      })
      .then((d) => setWorker(d.worker || DEMO_WORKER))
      .catch(() => setWorker(DEMO_WORKER))
      .finally(() => setLoadingWorker(false));
  }, [workerId]);

  if (checkingSetup) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-8 rounded-full border-4 border-accent-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Please enter a job title.");
      return;
    }
    setSubmitting(true);
    setError(null);

    // If demo mode, simulate success and redirect to demo contract
    if (isDemo || workerId === "demo-worker") {
      await new Promise((r) => setTimeout(r, 700));
      setSuccess(true);
      setTimeout(() => {
        router.push("/client/contracts/demo");
      }, 1200);
      return;
    }

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
        setError(result.error || "Failed to create contract proposal.");
      }
    } catch {
      setError("Unexpected error creating contract.");
    } finally {
      setSubmitting(false);
    }
  };

  const rating = worker ? Number(worker.avg_rating || 0) : 5.0;
  const primarySkill = worker?.skills && worker.skills.length > 0 ? worker.skills[0] : "Certified Trade Pro";

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24 text-text-primary px-2">
      {/* ── Demo Notice Bar ── */}
      {isDemo && (
        <div className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-3.5 flex items-center justify-between gap-3 text-caption-1-semibold">
          <div className="flex items-center gap-2">
            <RiInformationLine className="size-4 text-accent-600 shrink-0" />
            <span>Preview Mode: Testing direct contract proposal and milestone creation flow.</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-600 text-white shrink-0">
            Preview Active
          </span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-title-1-medium text-text-primary tracking-tight">
            Create Work Contract Proposal
          </h1>
          <p className="text-body-medium text-text-secondary">
            Draft contract deliverables, agree on budget, and lock funds under DireSkill Milestone Protection.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 rounded-full border border-border-button-default bg-background-secondary-default px-4 py-2 text-caption-1-semibold text-text-secondary hover:text-text-primary transition active:scale-95"
        >
          <RiArrowLeftLine className="size-4" />
          <span>Back</span>
        </button>
      </div>

      {/* ── Main Layout: Form + Sticky Summary ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Left: Worker Card + Form */}
        <div className="space-y-6">
          {/* Worker Card */}
          {worker && (
            <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-5 sm:p-6 shadow-xs space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-tertiary">
                Target Professional
              </span>
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-background-secondary-default border border-border-button-default overflow-hidden flex items-center justify-center shrink-0">
                  {worker.avatar_url ? (
                    <img src={worker.avatar_url} alt={worker.full_name} className="size-full object-cover" />
                  ) : (
                    <RiUserLine className="size-6 text-text-tertiary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-title-3-semibold text-text-primary truncate">{worker.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-caption-1-semibold text-accent-600">{primarySkill}</span>
                    <span className="flex items-center gap-1 text-caption-2 text-text-secondary">
                      <RiStarFill className="size-3.5 text-chart-4" />
                      {rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                {worker.hourly_rate && (
                  <div className="text-end shrink-0">
                    <p className="text-title-3-semibold text-accent-600">{worker.hourly_rate} ETB</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Per hour</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Proposal Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 sm:p-8 space-y-5 shadow-xs"
          >
            {/* Job Title */}
            <div className="space-y-1.5">
              <label className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-secondary">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Master Bathroom Plumbing & Fixtures Installation"
                className="w-full rounded-2xl border border-border-button-default bg-background-secondary-default px-4 py-3.5 text-body-medium text-text-primary placeholder:text-text-placeholder focus:border-accent-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <label className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-secondary">
                Milestone Budget (ETB) *
              </label>
              <div className="relative">
                <span className="absolute start-4 top-1/2 -translate-y-1/2 text-caption-1-semibold font-bold text-accent-600">
                  ETB
                </span>
                <input
                  type="number"
                  min={0}
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="e.g. 4000"
                  className="w-full rounded-2xl border border-border-button-default bg-background-secondary-default ps-14 pe-4 py-3.5 text-body-medium text-text-primary placeholder:text-text-placeholder focus:border-accent-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Terms Description */}
            <div className="space-y-1.5">
              <label className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-secondary">
                Scope of Work & Acceptance Terms *
              </label>
              <textarea
                rows={5}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe specific milestones, materials needed, required tools, and site address..."
                className="w-full rounded-2xl border border-border-button-default bg-background-secondary-default p-4 text-body-medium text-text-primary placeholder:text-text-placeholder focus:border-accent-500 focus:outline-none transition-colors leading-relaxed"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-2xl border border-chart-5/30 bg-chart-5/10 p-4 text-caption-1-semibold text-chart-5">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 rounded-2xl border border-accent-500/30 bg-accent-500/10 p-4 text-caption-1-semibold text-accent-700 dark:text-accent-300">
                <RiCheckDoubleLine className="size-5" />
                <span>Proposal successfully created! Redirecting to contract review...</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || success}
              className="w-full rounded-full bg-accent-600 py-4 text-caption-1-semibold font-bold uppercase tracking-wider text-white shadow-xs hover:bg-accent-700 active:scale-98 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Submitting Proposal...</span>
                </>
              ) : success ? (
                <>
                  <RiCheckDoubleLine className="size-5" />
                  <span>Proposal Dispatched</span>
                </>
              ) : (
                <>
                  <RiSendPlane2Fill className="size-5" />
                  <span>Send Contract Proposal</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Summary Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-tertiary">
                Proposal Summary
              </span>
              <span className="size-2 rounded-full bg-accent-500 animate-pulse" />
            </div>

            <div>
              <p className="text-caption-2 text-text-secondary">Estimated Total</p>
              <p className="text-title-1-medium text-text-primary tracking-tight mt-0.5">
                {formData.budget ? Number(formData.budget).toLocaleString() : "0"}{" "}
                <span className="text-title-3-semibold text-accent-600">ETB</span>
              </p>
            </div>

            <div className="border-t border-separator-border pt-3 space-y-2 text-caption-2">
              <div className="flex justify-between items-center text-text-secondary">
                <span>Contract Type</span>
                <span className="font-bold text-text-primary">Direct Milestone Agreement</span>
              </div>
              <div className="flex justify-between items-center text-text-secondary">
                <span>Signing Authentication</span>
                <span className="font-bold text-accent-600">Fayda Biometric PIN</span>
              </div>
              <div className="flex justify-between items-center text-text-secondary">
                <span>Dispute Protection</span>
                <span className="font-bold text-text-primary">Milestone Lock</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-accent-600">
              <RiShieldCheckFill className="size-5" />
              <h3 className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-primary">
                DireSkill Protection
              </h3>
            </div>
            <p className="text-caption-2 text-text-secondary leading-relaxed">
              Funds are never released without your explicit approval. Workers inspect deliverables and sign with their private biometric PIN.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
