"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSupportTicket } from "@/lib/actions/support";
import { SUPPORT_CATEGORIES, SUPPORT_PRIORITIES } from "@/lib/support-constants";
import { Upload, X, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface SupportCreateFormProps {
  role: "client" | "worker";
  jobs: Array<{ id: string; title: string; status: string }>;
  contracts: Array<{ id: string; status: string; payment_amount: number; job_title: string }>;
}

export default function SupportCreateForm({ role, jobs, contracts }: SupportCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [category, setCategory] = useState<string>("account_access");
  const [priority, setPriority] = useState<string>("normal");
  const [subject, setSubject] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [relatedType, setRelatedType] = useState<"none" | "job" | "contract">("none");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [selectedContractId, setSelectedContractId] = useState<string>("");

  // Attachment state
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<{
    url: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  } | null>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
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
      // Reset input so same file can be re-selected if removed
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

        if (!result.success || !result.ticketId) {
          setError(result.error || "Failed to create support ticket.");
          return;
        }

        router.push(`/${role}/support/${result.ticketId}`);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs">
      {/* Privacy Warning */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-amber-700 dark:text-amber-300">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <p className="font-medium leading-relaxed">
          <strong className="font-bold">Privacy notice:</strong> Do not include passwords, verification codes, full national ID (FIN), or payment card/bank credentials.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm font-semibold text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category & Priority Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full rounded-xl border border-border/70 bg-background/60 p-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {SUPPORT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground">
            Priority / Urgency <span className="text-red-500">*</span>
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
            className="w-full rounded-xl border border-border/70 bg-background/60 p-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="low">Low (General inquiry, no time pressure)</option>
            <option value="normal">Normal (Standard assistance)</option>
            <option value="high">High (Active job or payment issue)</option>
            <option value="urgent">Urgent (Immediate safety or dispute risk)</option>
          </select>
        </div>
      </div>

      {/* Subject */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-foreground">
            Subject <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] font-medium text-muted-foreground">{subject.length}/180</span>
        </div>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={180}
          required
          placeholder="Brief summary of your question or issue"
          className="w-full rounded-xl border border-border/70 bg-background/60 p-3 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground">
          Detailed Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          required
          placeholder="Please describe your issue in detail. If related to a specific action, describe what happened and when."
          className="w-full rounded-xl border border-border/70 bg-background/60 p-3 text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Related Record Picker */}
      <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4">
        <span className="block text-xs font-bold uppercase tracking-wider text-foreground">
          Link to Related Record (Optional)
        </span>
        <div className="flex flex-wrap gap-4 text-xs font-semibold">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="relatedType"
              checked={relatedType === "none"}
              onChange={() => setRelatedType("none")}
              className="accent-primary"
            />
            General Inquiry (None)
          </label>
          {jobs.length > 0 && (
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="relatedType"
                checked={relatedType === "job"}
                onChange={() => setRelatedType("job")}
                className="accent-primary"
              />
              Related Job ({jobs.length})
            </label>
          )}
          {contracts.length > 0 && (
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="relatedType"
                checked={relatedType === "contract"}
                onChange={() => setRelatedType("contract")}
                className="accent-primary"
              />
              Related Contract ({contracts.length})
            </label>
          )}
        </div>

        {relatedType === "job" && (
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full rounded-xl border border-border/70 bg-background p-2.5 text-xs font-medium text-foreground outline-none"
          >
            <option value="">Select a job</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} · Status: {job.status}
              </option>
            ))}
          </select>
        )}

        {relatedType === "contract" && (
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="w-full rounded-xl border border-border/70 bg-background p-2.5 text-xs font-medium text-foreground outline-none"
          >
            <option value="">Select a contract</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.job_title} · Status: {c.status} (ETB {Number(c.payment_amount).toLocaleString()})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* File Attachment */}
      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-foreground">
          Attachment (Optional)
        </label>
        {attachment ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="truncate">
                <p className="truncate text-xs font-bold text-foreground">{attachment.fileName}</p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {(attachment.fileSize / 1024).toFixed(1)} KB · {attachment.mimeType}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="p-1 rounded-md text-muted-foreground hover:text-red-500 transition"
              title="Remove attachment"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <label className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/80 p-5 text-center cursor-pointer hover:border-primary transition bg-muted/20 hover:bg-muted/40">
              {uploading ? (
                <div className="w-full space-y-2 py-3 animate-pulse text-center">
                  <div className="h-2.5 w-48 mx-auto bg-primary/40 rounded-full" />
                  <span className="text-xs font-bold text-primary block">Uploading attachment to secure storage...</span>
                </div>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">
                    Click or drag file to attach (Screenshots, PDF, Documents)
                  </span>
                  <span className="text-[11px] text-muted-foreground">PNG, JPEG, WebP, or PDF up to 10MB</span>
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
          </div>
        )}
      </div>

      {/* Submit button */}
      <div className="pt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-border/80 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || uploading}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition disabled:opacity-50"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary-foreground animate-ping" />
              <span>Submitting Ticket...</span>
            </div>
          ) : (
            <span>Submit Ticket</span>
          )}
        </button>
      </div>
    </form>
  );
}
