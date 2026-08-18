"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDispute } from "@/lib/actions/disputes";
import { DISPUTE_CATEGORIES, DISPUTE_REQUESTED_RESOLUTIONS } from "@/lib/dispute-constants";

export default function DisputeCreateForm({ jobs, role }: { jobs: any[]; role: "client" | "worker" }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setMessage(null);
    const evidenceUrl = String(formData.get("evidenceUrl") || "").trim();
    startTransition(async () => {
      const result = await createDispute({
        jobId: String(formData.get("jobId") || ""),
        category: String(formData.get("category") || "") as any,
        title: String(formData.get("title") || ""),
        description: String(formData.get("description") || ""),
        requestedResolution: String(formData.get("requestedResolution") || "") as any,
        evidence: evidenceUrl
          ? [{
              url: evidenceUrl,
              fileName: String(formData.get("evidenceName") || "Evidence"),
              mimeType: String(formData.get("evidenceMime") || "image/png"),
              fileSize: Number(formData.get("evidenceSize") || 1),
            }]
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
    <form action={submit} className="space-y-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5">
      {message && <div className="rounded-lg border border-error/20 bg-error/10 p-3 text-sm font-bold text-error">{message}</div>}
      <label className="block">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest">Related job</span>
        <select name="jobId" required className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
          <option value="">Select eligible job</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id} disabled={job.has_active_dispute}>
              {job.title} · {job.status}{job.has_active_dispute ? " · active dispute exists" : ""}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-widest">Category</span>
          <select name="category" required className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
            {DISPUTE_CATEGORIES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-widest">Requested resolution</span>
          <select name="requestedResolution" required className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
            {DISPUTE_REQUESTED_RESOLUTIONS.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest">Short title</span>
        <input name="title" required maxLength={160} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
      </label>
      <label className="block">
        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest">Detailed explanation</span>
        <textarea name="description" required rows={6} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
      </label>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-widest">Evidence URL optional</span>
          <input name="evidenceUrl" placeholder="Trusted upload URL" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-widest">MIME</span>
          <select name="evidenceMime" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WEBP</option>
            <option value="application/pdf">PDF</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-widest">Bytes</span>
          <input name="evidenceSize" type="number" defaultValue={1} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        </label>
      </div>
      <input type="hidden" name="evidenceName" value="Submitted evidence" />
      <button disabled={isPending} className="h-12 rounded-lg bg-primary px-5 text-xs font-black uppercase tracking-widest text-on-primary disabled:opacity-50">
        Open Dispute
      </button>
    </form>
  );
}
