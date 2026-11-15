"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDispute } from "@/lib/actions/disputes";
import { DISPUTE_CATEGORIES, DISPUTE_REQUESTED_RESOLUTIONS } from "@/lib/dispute-constants";
import {
  RiScales3Line,
  RiShieldFlashLine,
  RiAlertLine,
  RiCheckDoubleLine,
  RiArrowRightLine,
  RiFolderUploadLine,
  RiInformationLine,
} from "@remixicon/react";
import { cx } from "@/utils/cx";

const DEMO_ELIGIBLE_JOBS = [
  { id: "demo-job-1", title: "Complete Residential Rewiring - Bole", status: "completed", has_active_dispute: false },
  { id: "demo-job-2", title: "Master Bathroom Plumbing & Drain Fixtures - Piassa", status: "in_progress", has_active_dispute: false },
  { id: "demo-job-3", title: "Commercial Satellite Dish & LNB Alignment - Kazanchis", status: "completed", has_active_dispute: false },
];

export default function DisputeCreateForm({
  jobs = [],
  role,
  initialJobId,
}: {
  jobs: any[];
  role: "client" | "worker";
  initialJobId?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDemo = jobs.length === 0;
  const activeJobs = isDemo ? DEMO_ELIGIBLE_JOBS : jobs;

  function submit(formData: FormData) {
    setMessage(null);
    const selectedJob = String(formData.get("jobId") || "");

    // If using sample demo jobs, navigate directly to interactive demo dispute review
    if (selectedJob.startsWith("demo-job") || isDemo) {
      startTransition(async () => {
        await new Promise((r) => setTimeout(r, 600));
        router.push(`/${role}/disputes/demo`);
      });
      return;
    }

    const evidenceUrl = String(formData.get("evidenceUrl") || "").trim();
    startTransition(async () => {
      const result = await createDispute({
        jobId: selectedJob,
        category: String(formData.get("category") || "") as any,
        title: String(formData.get("title") || ""),
        description: String(formData.get("description") || ""),
        requestedResolution: String(formData.get("requestedResolution") || "") as any,
        evidence: evidenceUrl
          ? [
              {
                url: evidenceUrl,
                fileName: String(formData.get("evidenceName") || "Evidence"),
                mimeType: String(formData.get("evidenceMime") || "image/png"),
                fileSize: Number(formData.get("evidenceSize") || 1),
              },
            ]
          : [],
      });
      if (result.success && result.disputeId) {
        router.push(`/${role}/disputes/${result.disputeId}`);
        return;
      }
      setMessage(result.error || "Could not create dispute.");
    });
  }

  return (
    <div className="space-y-4">
      {isDemo && (
        <div className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-3.5 flex items-center justify-between gap-3 text-caption-1-semibold text-text-primary">
          <div className="flex items-center gap-2">
            <RiInformationLine className="size-4 text-accent-600 shrink-0" />
            <span>
              Showing preview eligible jobs. Submitting will open the interactive dispute inspection view.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-600 text-white shrink-0">
            Preview Mode
          </span>
        </div>
      )}

      <form
        action={submit}
        className="space-y-6 rounded-3xl border border-border-button-default bg-background-primary-default p-6 sm:p-8 shadow-xs"
      >
        {message && (
          <div className="flex items-start gap-3 rounded-2xl border border-chart-5/30 bg-chart-5/10 p-4 text-caption-1-semibold text-chart-5">
            <RiAlertLine className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Submission Notice</p>
              <p className="text-body-2-regular mt-0.5">{message}</p>
            </div>
          </div>
        )}

        {/* Milestone Protection Informational Strip */}
        <div className="flex items-start gap-3 rounded-2xl border border-chart-4/30 bg-chart-4/10 p-4 text-text-primary">
          <RiShieldFlashLine className="size-5 text-chart-4 shrink-0 mt-0.5" />
          <div className="space-y-1 text-caption-1-semibold">
            <p className="font-bold">Milestone Protection Safe Harbour</p>
            <p className="text-body-2-regular text-text-secondary leading-relaxed">
              Opening a dispute case immediately halts milestone payout releases without penalty. Both client and worker can submit photos, message logs, and technical receipts for independent mediation.
            </p>
          </div>
        </div>

        {/* Eligible Job Select */}
        <div className="space-y-1.5">
          <label className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-secondary">
            Related Job or Contract *
          </label>
          <select
            name="jobId"
            required
            defaultValue={initialJobId || activeJobs[0]?.id || ""}
            className="w-full rounded-xl border border-border-button-default bg-background-secondary-default p-3.5 text-body-medium text-text-primary focus:border-accent-500 focus:outline-none transition-colors"
          >
            <option value="">Select contract or job</option>
            {activeJobs.map((job) => (
              <option key={job.id} value={job.id} disabled={job.has_active_dispute}>
                {job.title} · Status: {job.status}
                {job.has_active_dispute ? " (Active dispute already in progress)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Category & Requested Resolution */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-secondary">
              Dispute Category *
            </label>
            <select
              name="category"
              required
              className="w-full rounded-xl border border-border-button-default bg-background-secondary-default p-3.5 text-body-medium text-text-primary focus:border-accent-500 focus:outline-none transition-colors"
            >
              {DISPUTE_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-secondary">
              Requested Resolution *
            </label>
            <select
              name="requestedResolution"
              required
              className="w-full rounded-xl border border-border-button-default bg-background-secondary-default p-3.5 text-body-medium text-text-primary focus:border-accent-500 focus:outline-none transition-colors"
            >
              {DISPUTE_REQUESTED_RESOLUTIONS.map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Short Summary Title */}
        <div className="space-y-1.5">
          <label className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-secondary">
            Case Summary Title *
          </label>
          <input
            name="title"
            required
            maxLength={160}
            placeholder="e.g. Incomplete installation of bathroom fixtures and drain leakage"
            className="w-full rounded-xl border border-border-button-default bg-background-secondary-default px-4 py-3 text-body-medium text-text-primary placeholder:text-text-placeholder focus:border-accent-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-1.5">
          <label className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-secondary">
            Factual Description & Timeline *
          </label>
          <textarea
            name="description"
            required
            rows={5}
            placeholder="Describe what occurred, dates, contract deliverables missed, and any prior communication with the other party..."
            className="w-full rounded-xl border border-border-button-default bg-background-secondary-default p-4 text-body-medium text-text-primary placeholder:text-text-placeholder focus:border-accent-500 focus:outline-none transition-colors leading-relaxed"
          />
        </div>

        {/* Evidence Attachments */}
        <div className="space-y-3 rounded-2xl border border-border-button-default bg-background-secondary-default p-5">
          <div className="flex items-center gap-2">
            <RiFolderUploadLine className="size-4 text-accent-600" />
            <span className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-primary">
              Initial Evidence Attachment (Optional)
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold uppercase text-text-tertiary">Evidence URL</label>
              <input
                name="evidenceUrl"
                placeholder="https://... (or image URL)"
                className="w-full rounded-xl border border-border-button-default bg-background-primary-default px-3 py-2.5 text-caption-1-semibold text-text-primary placeholder:text-text-placeholder focus:border-accent-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-text-tertiary">Format</label>
              <select
                name="evidenceMime"
                className="w-full rounded-xl border border-border-button-default bg-background-primary-default px-3 py-2.5 text-caption-1-semibold text-text-primary focus:border-accent-500 focus:outline-none"
              >
                <option value="image/png">PNG Photo</option>
                <option value="image/jpeg">JPEG Photo</option>
                <option value="image/webp">WEBP Image</option>
                <option value="application/pdf">PDF Contract / Doc</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-text-tertiary">Approx Size</label>
              <input
                name="evidenceSize"
                type="number"
                defaultValue={1500000}
                className="w-full rounded-xl border border-border-button-default bg-background-primary-default px-3 py-2.5 text-caption-1-semibold text-text-primary focus:border-accent-500 focus:outline-none"
              />
            </div>
          </div>
          <input type="hidden" name="evidenceName" value="Initial Dispute Evidence" />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-border-button-default px-5 py-3 text-caption-1-semibold font-bold text-text-secondary hover:text-text-primary transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-6 py-3 text-caption-1-semibold font-bold uppercase tracking-wider text-white shadow-xs hover:bg-accent-700 active:scale-98 transition disabled:opacity-50"
          >
            <RiScales3Line className="size-4" />
            <span>{isPending ? "Recording on Ledger..." : "Open Dispute Case"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
