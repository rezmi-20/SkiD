"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupportTicket } from "@/lib/actions/support";
import { SUPPORT_CATEGORIES, SUPPORT_PRIORITIES } from "@/lib/support-constants";
import {
  RiCustomerService2Line,
  RiFolderUploadLine,
  RiCloseLine,
  RiFileTextLine,
  RiCheckDoubleLine,
  RiAlertLine,
  RiSendPlane2Fill,
  RiInformationLine,
} from "@remixicon/react";
import { cx } from "@/utils/cx";

interface SupportCreateFormProps {
  role: "client" | "worker";
  jobs: Array<{ id: string; title: string; status: string }>;
  contracts: Array<{ id: string; status: string; payment_amount: number; job_title: string }>;
}

const DEMO_JOBS = [
  { id: "demo-job-1", title: "Commercial Satellite Dish Alignment", status: "completed" },
  { id: "demo-job-2", title: "Master Bathroom Plumbing & Drain Fixtures", status: "in_progress" },
];

const DEMO_CONTRACTS = [
  { id: "demo-contract-1", status: "active", payment_amount: 4000, job_title: "Commercial Satellite Dish Alignment" },
];

export default function SupportCreateForm({ role, jobs = [], contracts = [] }: SupportCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isDemo = jobs.length === 0 && contracts.length === 0;
  const activeJobs = isDemo ? DEMO_JOBS : jobs;
  const activeContracts = isDemo ? DEMO_CONTRACTS : contracts;

  // Form fields
  const [category, setCategory] = useState<string>("payment_inquiry");
  const [priority, setPriority] = useState<string>("normal");
  const [subject, setSubject] = useState<string>("Telebirr Milestone Settlement Confirmation Delay");
  const [description, setDescription] = useState<string>(
    "Initiated milestone payment via Telebirr SuperApp at 2:15 PM today, but the transaction ledger status still indicates awaiting gateway verification. Transaction reference TB-994812."
  );
  const [relatedType, setRelatedType] = useState<"none" | "job" | "contract">("contract");
  const [selectedJobId, setSelectedJobId] = useState<string>(activeJobs[0]?.id || "");
  const [selectedContractId, setSelectedContractId] = useState<string>(activeContracts[0]?.id || "");

  // Attachment state
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{
    url: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  } | null>({
    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    fileName: "telebirr_sms_receipt_tb994812.png",
    mimeType: "image/png",
    fileSize: 420000,
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/private-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "File upload failed.");
      }

      const data = await res.json();
      setAttachment({
        url: data.url,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
      });
    } catch (err: any) {
      setError(err.message || "Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError("Please enter a subject for your ticket.");
      return;
    }
    if (!description.trim()) {
      setError("Please provide a detailed description.");
      return;
    }

    if (isDemo || selectedContractId.startsWith("demo-")) {
      startTransition(async () => {
        await new Promise((r) => setTimeout(r, 600));
        router.push(`/${role}/support/demo`);
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await createSupportTicket({
          category: category as any,
          priority: priority as any,
          subject: subject.trim(),
          description: description.trim(),
          relatedJobId: relatedType === "job" ? selectedJobId || null : null,
          relatedContractId: relatedType === "contract" ? selectedContractId || null : null,
          relatedPaymentId: null,
          attachment: attachment
            ? {
                url: attachment.url,
                fileName: attachment.fileName,
                mimeType: attachment.mimeType,
                fileSize: attachment.fileSize,
              }
            : null,
        });

        if (!result.success) {
          setError(result.error || "Could not submit support ticket.");
          return;
        }

        router.push(`/${role}/support/${result.ticketId}`);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {isDemo && (
        <div className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-3.5 flex items-center justify-between gap-3 text-caption-1-semibold text-text-primary">
          <div className="flex items-center gap-2">
            <RiInformationLine className="size-4 text-accent-600 shrink-0" />
            <span>
              Preview Mode: Submitting will open the interactive support ticket desk demo.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-600 text-white shrink-0">
            Preview Active
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 sm:p-8 space-y-6 shadow-xs"
      >
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-chart-5/30 bg-chart-5/10 p-4 text-caption-1-semibold text-chart-5">
            <RiAlertLine className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Category & Priority Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-secondary">
              Ticket Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-border-button-default bg-background-secondary-default p-3.5 text-body-medium text-text-primary focus:border-accent-500 focus:outline-none transition-colors"
            >
              {SUPPORT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-secondary">
              Urgency Level *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-2xl border border-border-button-default bg-background-secondary-default p-3.5 text-body-medium text-text-primary focus:border-accent-500 focus:outline-none transition-colors"
            >
              {SUPPORT_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.replaceAll("_", " ").toUpperCase()} Priority
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-secondary">
            Subject *
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Issue releasing milestone payment via Telebirr"
            className="w-full rounded-2xl border border-border-button-default bg-background-secondary-default px-4 py-3.5 text-body-medium text-text-primary placeholder:text-text-placeholder focus:border-accent-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-secondary">
            Detailed Explanation *
          </label>
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please detail what happened, timestamps, payment references, or error messages..."
            className="w-full rounded-2xl border border-border-button-default bg-background-secondary-default p-4 text-body-medium text-text-primary placeholder:text-text-placeholder focus:border-accent-500 focus:outline-none transition-colors leading-relaxed"
          />
        </div>

        {/* Link to Related Record */}
        <div className="space-y-3 rounded-2xl border border-border-button-default bg-background-secondary-default p-5">
          <span className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-primary">
            Link to Related Job or Contract (Optional)
          </span>

          <div className="flex flex-wrap gap-4 text-caption-1-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="relatedType"
                checked={relatedType === "none"}
                onChange={() => setRelatedType("none")}
                className="accent-accent-600"
              />
              <span>General Platform Inquiry</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="relatedType"
                checked={relatedType === "contract"}
                onChange={() => setRelatedType("contract")}
                className="accent-accent-600"
              />
              <span>Linked Contract ({activeContracts.length})</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="relatedType"
                checked={relatedType === "job"}
                onChange={() => setRelatedType("job")}
                className="accent-accent-600"
              />
              <span>Linked Job ({activeJobs.length})</span>
            </label>
          </div>

          {relatedType === "contract" && (
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="w-full rounded-xl border border-border-button-default bg-background-primary-default p-3 text-caption-1-semibold text-text-primary focus:border-accent-500 focus:outline-none"
            >
              {activeContracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.job_title} · Status: {c.status} ({Number(c.payment_amount).toLocaleString()} ETB)
                </option>
              ))}
            </select>
          )}

          {relatedType === "job" && (
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full rounded-xl border border-border-button-default bg-background-primary-default p-3 text-caption-1-semibold text-text-primary focus:border-accent-500 focus:outline-none"
            >
              {activeJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} · Status: {j.status}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Attachment Upload */}
        <div className="space-y-2">
          <label className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-secondary">
            Attached Evidence Screenshot or Receipt (Optional)
          </label>

          {attachment ? (
            <div className="flex items-center justify-between rounded-2xl border border-accent-500/30 bg-accent-500/10 p-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-xl bg-accent-500/20 text-accent-700 dark:text-accent-300 flex items-center justify-center shrink-0">
                  <RiFileTextLine className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-caption-1-semibold font-bold text-text-primary truncate">
                    {attachment.fileName}
                  </p>
                  <p className="text-[11px] text-text-tertiary">
                    {(attachment.fileSize / 1024).toFixed(0)} KB · {attachment.mimeType}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="size-8 rounded-full flex items-center justify-center text-text-tertiary hover:text-chart-5 hover:bg-background-primary-default transition"
              >
                <RiCloseLine className="size-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border-button-default p-6 text-center cursor-pointer hover:border-accent-500 transition bg-background-secondary-default">
              {uploading ? (
                <div className="size-5 rounded-full border-2 border-accent-600 border-t-transparent animate-spin" />
              ) : (
                <>
                  <RiFolderUploadLine className="size-6 text-text-tertiary" />
                  <span className="text-caption-1-semibold text-text-primary font-bold">
                    Click to attach payment receipt or screenshot
                  </span>
                  <span className="text-[11px] text-text-tertiary">PNG, JPEG, WebP, or PDF up to 10MB</span>
                </>
              )}
              <input
                type="file"
                disabled={uploading}
                onChange={handleFileUpload}
                accept="image/png,image/jpeg,image/webp,application/pdf"
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Buttons */}
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
            disabled={isPending || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-6 py-3 text-caption-1-semibold font-bold uppercase tracking-wider text-white shadow-xs hover:bg-accent-700 active:scale-98 transition disabled:opacity-50"
          >
            <RiSendPlane2Fill className="size-4" />
            <span>{isPending ? "Submitting Request..." : "Submit Support Ticket"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
