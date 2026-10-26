"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAppeal } from "@/lib/actions/governance";
import { APPEAL_REASONS, APPEAL_TYPES, GOVERNANCE_APPEAL_WINDOW_DAYS } from "@/lib/governance-constants";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Scale,
  ExternalLink,
  Info,
  FileText,
  Film,
  Image as ImageIcon,
  X,
  Upload,
  Plus,
} from "lucide-react";

export interface EligibleDispute {
  id: string;
  title: string;
  final_decision: string;
  resolved_at: string | Date;
  existingAppealId?: string | null;
  existingAppealReference?: string | null;
  existingAppealStatus?: string | null;
}

interface AttachedFile {
  url: string;
  name: string;
  size: number;
  mime: string;
}

const REASON_LABELS: Record<string, { title: string; hint: string }> = {
  new_evidence: {
    title: "New Evidence Not Previously Considered",
    hint: "Critical documentation, photos, or message receipts not previously provided during the initial review.",
  },
  procedural_error: {
    title: "Procedural or Protocol Error",
    hint: "Platform dispute resolution guidelines or standard verification steps were not followed correctly.",
  },
  incorrect_fact: {
    title: "Incorrect Finding of Fact",
    hint: "The decision was based on material factual errors or misinterpretation of work records.",
  },
  decision_inconsistent_with_record: {
    title: "Outcome Inconsistent with Contract Terms",
    hint: "The ruling directly contradicts signed contract deliverables, milestone terms, or platform escrow rules.",
  },
  other: {
    title: "Other Substantive Grounds",
    hint: "Extenuating platform governance circumstances requiring independent Super Admin review.",
  },
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AppealForm({
  role,
  defaultTargetId = "",
  defaultAppealType = "dispute_resolution",
  eligibleDisputes = [],
}: {
  role: "client" | "worker";
  defaultTargetId?: string;
  defaultAppealType?: string;
  eligibleDisputes?: EligibleDispute[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [appealType, setAppealType] = useState<string>(
    defaultAppealType === "dispute_decision" ? "dispute_resolution" : defaultAppealType
  );
  const [targetId, setTargetId] = useState<string>(defaultTargetId);
  const [reason, setReason] = useState<string>(APPEAL_REASONS[0]);
  const [explanation, setExplanation] = useState<string>("");

  // 3 Distinct Evidence Categories
  const [photoFiles, setPhotoFiles] = useState<AttachedFile[]>([]);
  const [videoFiles, setVideoFiles] = useState<AttachedFile[]>([]);
  const [pdfFiles, setPdfFiles] = useState<AttachedFile[]>([]);

  const [uploadingCategory, setUploadingCategory] = useState<"photo" | "video" | "pdf" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionStep, setSubmissionStep] = useState<string>("");

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Check details for selected dispute
  const selectedDispute = eligibleDisputes.find((d) => d.id === targetId);
  const isSelectedExpired = selectedDispute
    ? Date.now() - new Date(selectedDispute.resolved_at).getTime() > GOVERNANCE_APPEAL_WINDOW_DAYS * 864e5
    : false;
  const hasExistingAppeal = Boolean(selectedDispute?.existingAppealId);

  const charCount = explanation.trim().length;
  const isExplanationValid = charCount >= 25;

  const totalEvidenceCount = photoFiles.length + videoFiles.length + pdfFiles.length;

  const handleFileUpload = async (category: "photo" | "video" | "pdf", file?: File) => {
    if (!file) return;
    setUploadError(null);

    const mime = file.type || "application/octet-stream";

    if (category === "photo") {
      if (!mime.startsWith("image/")) {
        setUploadError("Please select an image file (PNG, JPG, WebP).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("Photo must be under 10 MB.");
        return;
      }
    } else if (category === "video") {
      if (!mime.startsWith("video/")) {
        setUploadError("Please select a video file (MP4, WebM, MOV).");
        return;
      }
      if (file.size > 35 * 1024 * 1024) {
        setUploadError("Video must be under 35 MB.");
        return;
      }
    } else if (category === "pdf") {
      if (mime !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setUploadError("Please select a valid PDF document.");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setUploadError("PDF document must be under 20 MB.");
        return;
      }
    }

    setUploadingCategory(category);
    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/private-upload", {
        method: "POST",
        body,
        signal: AbortSignal.timeout(15000),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        const item: AttachedFile = {
          url: data.url,
          name: file.name,
          size: file.size,
          mime,
        };
        if (category === "photo") setPhotoFiles((prev) => [...prev, item]);
        if (category === "video") setVideoFiles((prev) => [...prev, item]);
        if (category === "pdf") setPdfFiles((prev) => [...prev, item]);
      } else {
        setUploadError(data.error || "Upload failed. Please try again.");
      }
    } catch {
      setUploadError("Network connection error. Upload failed.");
    } finally {
      setUploadingCategory(null);
      if (photoInputRef.current) photoInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const removeFile = (category: "photo" | "video" | "pdf", index: number) => {
    if (category === "photo") setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    if (category === "video") setVideoFiles((prev) => prev.filter((_, i) => i !== index));
    if (category === "pdf") setPdfFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (uploadingCategory !== null) {
      setErrorMessage("Please wait for your evidence file to finish uploading before submitting.");
      return;
    }

    const trimmedTargetId = targetId.trim();
    if (!trimmedTargetId) {
      setErrorMessage("Please select or specify the decision ID you wish to appeal.");
      return;
    }

    if (hasExistingAppeal) {
      setErrorMessage("An active appeal is already in review for this dispute. Multiple appeals on the same case are not permitted.");
      return;
    }

    if (!isExplanationValid) {
      setErrorMessage(`Explanation must be at least 25 characters long (currently ${charCount} / 25 characters). Please add more context.`);
      return;
    }

    setSubmissionStep("Assembling evidence package...");
    startTransition(async () => {
      try {
        const allRefs = [
          ...photoFiles.map((f) => f.url),
          ...videoFiles.map((f) => f.url),
          ...pdfFiles.map((f) => f.url),
        ];

        setSubmissionStep("Recording appeal on governance ledger...");
        const result = await createAppeal({
          appealType: appealType as any,
          targetId: trimmedTargetId,
          reason: reason as any,
          explanation: explanation.trim(),
          evidenceReferences: allRefs,
        });

        if (!result.success) {
          setSubmissionStep("");
          setErrorMessage(result.error || "Failed to submit appeal.");
          return;
        }

        setSubmissionStep("Finalized. Loading your appeal record...");
        window.location.href = `/${role}/appeals/${result.appealId}`;
      } catch (err: any) {
        setSubmissionStep("");
        setErrorMessage(err?.message || "An unexpected error occurred while submitting your appeal.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20">
      {/* Breadcrumb Navigation */}
      <Link
        href={`/${role}/appeals`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to appeals
      </Link>

      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary tracking-wide uppercase">
          <Scale className="h-3 w-3" />
          Governance Review Process
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Request Independent Review
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If you believe a dispute outcome or account decision was determined in error or without complete facts, you can request an independent Super Admin governance review within {GOVERNANCE_APPEAL_WINDOW_DAYS} days.
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-md border border-destructive/25 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Appeal Submission Issue</p>
            <p className="text-foreground/90 font-normal leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="rounded-md border border-border/80 bg-card p-6 shadow-2xs space-y-6">
        {/* Appeal Type */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Appeal Category
          </label>
          <select
            value={appealType}
            onChange={(e) => setAppealType(e.target.value)}
            disabled={isPending}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          >
            {APPEAL_TYPES.map((value) => (
              <option key={value} value={value}>
                {value === "dispute_resolution"
                  ? "Dispute Resolution Decision"
                  : "Worker Verification / Identity Action"}
              </option>
            ))}
          </select>
        </div>

        {/* Target Decision Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Target Decision or Case
          </label>

          {eligibleDisputes.length > 0 && (
            <select
              value={eligibleDisputes.some((d) => d.id === targetId) ? targetId : ""}
              onChange={(e) => {
                if (e.target.value) setTargetId(e.target.value);
              }}
              disabled={isPending}
              className="w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            >
              <option value="">Choose from your recent resolved disputes...</option>
              {eligibleDisputes.map((d) => {
                const expired =
                  Date.now() - new Date(d.resolved_at).getTime() > GOVERNANCE_APPEAL_WINDOW_DAYS * 864e5;
                const statusTag = d.existingAppealId
                  ? " [Appeal Already in Review]"
                  : expired
                  ? " [Window Expired]"
                  : " [Eligible]";
                return (
                  <option key={d.id} value={d.id}>
                    Case #{String(d.id).slice(0, 8)} · {d.title || "Dispute"} ({d.final_decision}){statusTag}
                  </option>
                );
              })}
            </select>
          )}

          <input
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            disabled={isPending}
            required
            placeholder="e.g. 21794c27-b73b-41a0-b8e4-cd504202a662"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />

          {/* Active Appeal Callout */}
          {hasExistingAppeal && (
            <div className="flex items-start gap-2.5 rounded-md border border-blue-500/25 bg-blue-500/10 p-3 text-xs text-blue-900 dark:text-blue-200">
              <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-bold">
                  Active Appeal Already Submitted ({selectedDispute?.existingAppealReference || "In Review"})
                </p>
                <p className="text-[11px] leading-relaxed opacity-90">
                  This decision already has an appeal under governance review. You cannot file a duplicate appeal for the same case.
                </p>
                <Link
                  href={`/${role}/appeals/${selectedDispute?.existingAppealId}`}
                  className="inline-flex items-center gap-1 font-bold text-blue-700 dark:text-blue-300 hover:underline pt-0.5"
                >
                  View Existing Appeal Details
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Window Expired Notice */}
          {!hasExistingAppeal && isSelectedExpired && (
            <p className="text-xs font-semibold text-destructive">
              Notice: The {GOVERNANCE_APPEAL_WINDOW_DAYS}-day governance appeal window for this decision has passed.
            </p>
          )}

          <p className="text-[11px] text-muted-foreground">
            The unique identifier of the dispute resolution or account action being appealed.
          </p>
        </div>

        {/* Primary Grounds */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Primary Grounds for Appeal
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isPending}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          >
            {APPEAL_REASONS.map((value) => (
              <option key={value} value={value}>
                {REASON_LABELS[value]?.title || value.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          {REASON_LABELS[reason] && (
            <p className="text-[11px] text-muted-foreground italic">
              {REASON_LABELS[reason].hint}
            </p>
          )}
        </div>

        {/* Detailed Explanation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Detailed Explanation & Justification
            </label>
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                isExplanationValid ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
              }`}
            >
              {isExplanationValid && <CheckCircle2 className="h-3 w-3" />}
              {charCount} / 25 min chars
            </span>
          </div>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            disabled={isPending}
            required
            minLength={25}
            rows={4}
            placeholder="Explain specifically what facts were overlooked, what changed, or why the prior outcome was inconsistent with contract terms or platform policies..."
            className="w-full rounded-md border border-input bg-background p-3 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-colors leading-relaxed"
          />
        </div>

        {/* 3 DEDICATED EVIDENCE UPLOAD CARDS */}
        <div className="space-y-3 pt-1 border-t border-border/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                Supporting Evidence Files ({totalEvidenceCount})
              </p>
              <p className="text-[11px] text-muted-foreground">
                Upload photos, video recordings, or PDF documents to substantiate your appeal.
              </p>
            </div>
            {totalEvidenceCount > 0 && (
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                {totalEvidenceCount} attached
              </span>
            )}
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/25 bg-destructive/10 p-2.5 text-xs text-destructive font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* 3 Upload Cards Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Card 1: Photo Evidence */}
            <div className="rounded-md border border-border/90 bg-muted/20 p-3.5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-emerald-500/10 p-1.5 text-emerald-700 dark:text-emerald-300">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Photos</p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG, WebP (&lt;10MB)</p>
                  </div>
                </div>

                {/* Uploaded photos list */}
                {photoFiles.length > 0 && (
                  <div className="space-y-1 pt-1.5">
                    {photoFiles.map((file, idx) => (
                      <div
                        key={`${file.url}-${idx}`}
                        className="flex items-center justify-between gap-1 rounded-sm bg-background/80 px-2 py-1 text-[11px] border border-border/60"
                      >
                        <span className="truncate font-medium text-foreground">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile("photo", idx)}
                          disabled={isPending}
                          className="text-muted-foreground hover:text-destructive p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) => handleFileUpload("photo", e.target.files?.[0])}
                  disabled={uploadingCategory !== null || isPending}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingCategory !== null || isPending}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-accent/60 transition-colors disabled:opacity-50"
                >
                  {uploadingCategory === "photo" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      Add Photo
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 2: Video Evidence */}
            <div className="rounded-md border border-border/90 bg-muted/20 p-3.5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-blue-500/10 p-1.5 text-blue-700 dark:text-blue-300">
                    <Film className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Videos</p>
                    <p className="text-[10px] text-muted-foreground">MP4, WebM, MOV (&lt;35MB)</p>
                  </div>
                </div>

                {/* Uploaded videos list */}
                {videoFiles.length > 0 && (
                  <div className="space-y-1 pt-1.5">
                    {videoFiles.map((file, idx) => (
                      <div
                        key={`${file.url}-${idx}`}
                        className="flex items-center justify-between gap-1 rounded-sm bg-background/80 px-2 py-1 text-[11px] border border-border/60"
                      >
                        <span className="truncate font-medium text-foreground">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile("video", idx)}
                          disabled={isPending}
                          className="text-muted-foreground hover:text-destructive p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/ogg"
                  onChange={(e) => handleFileUpload("video", e.target.files?.[0])}
                  disabled={uploadingCategory !== null || isPending}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingCategory !== null || isPending}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-accent/60 transition-colors disabled:opacity-50"
                >
                  {uploadingCategory === "video" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      Add Video
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Card 3: PDF Document Evidence */}
            <div className="rounded-md border border-border/90 bg-muted/20 p-3.5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-amber-500/10 p-1.5 text-amber-700 dark:text-amber-300">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Documents</p>
                    <p className="text-[10px] text-muted-foreground">PDF Files (&lt;20MB)</p>
                  </div>
                </div>

                {/* Uploaded PDF list */}
                {pdfFiles.length > 0 && (
                  <div className="space-y-1 pt-1.5">
                    {pdfFiles.map((file, idx) => (
                      <div
                        key={`${file.url}-${idx}`}
                        className="flex items-center justify-between gap-1 rounded-sm bg-background/80 px-2 py-1 text-[11px] border border-border/60"
                      >
                        <span className="truncate font-medium text-foreground">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile("pdf", idx)}
                          disabled={isPending}
                          className="text-muted-foreground hover:text-destructive p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => handleFileUpload("pdf", e.target.files?.[0])}
                  disabled={uploadingCategory !== null || isPending}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={uploadingCategory !== null || isPending}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-accent/60 transition-colors disabled:opacity-50"
                >
                  {uploadingCategory === "pdf" ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      Add PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity shadow-xs cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {submissionStep || "Submitting Appeal..."}
              </>
            ) : (
              "Submit Governance Appeal"
            )}
          </button>
          {!isPending && (
            <Link
              href={`/${role}/appeals`}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border px-4 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
          )}
          {isPending && submissionStep && (
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 animate-pulse">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
              {submissionStep}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
