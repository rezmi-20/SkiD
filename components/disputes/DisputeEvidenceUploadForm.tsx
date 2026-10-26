"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Plus,
} from "lucide-react";

type Props = {
  disputeId: string;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string; status?: number } | void>;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DisputeEvidenceUploadForm({ disputeId, action }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [uploadingCategory, setUploadingCategory] = useState<"photo" | "video" | "pdf" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form values
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceName, setEvidenceName] = useState("");
  const [evidenceMime, setEvidenceMime] = useState("image/png");
  const [evidenceSize, setEvidenceSize] = useState(1024);
  const [selectedCategory, setSelectedCategory] = useState<"photo" | "video" | "pdf">("photo");

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setEvidenceUrl("");
    setEvidenceName("");
    setError(null);
    setSuccess(null);
    setUploadingCategory(null);
    if (photoInputRef.current) photoInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const handleFileSelect = async (category: "photo" | "video" | "pdf", file?: File) => {
    if (!file) return;
    setError(null);
    setSuccess(null);

    const mime = file.type || "application/octet-stream";

    if (category === "photo") {
      if (!mime.startsWith("image/")) {
        setError("Please choose a valid photo (PNG, JPG, WebP).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("Photo must be under 10 MB.");
        return;
      }
    } else if (category === "video") {
      if (!mime.startsWith("video/")) {
        setError("Please choose a valid video clip (MP4, WebM, MOV).");
        return;
      }
      if (file.size > 35 * 1024 * 1024) {
        setError("Video must be under 35 MB.");
        return;
      }
    } else if (category === "pdf") {
      if (mime !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setError("Please choose a valid PDF document.");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError("PDF document must be under 20 MB.");
        return;
      }
    }

    const cleanedName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    setEvidenceName(cleanedName);
    setEvidenceMime(category === "pdf" ? "application/pdf" : mime);
    setEvidenceSize(file.size);
    setSelectedCategory(category);

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
        setEvidenceUrl(data.url);
        setSuccess(`Evidence ${category} file uploaded and ready to attach.`);
      } else {
        setError(data.error || "Upload storage failed. Please try again.");
      }
    } catch {
      setError("Network timeout during upload. Please try again.");
    } finally {
      setUploadingCategory(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (!evidenceUrl.trim()) {
      setError("Please choose and upload a photo, video, or PDF file first.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("disputeId", disputeId);
      formData.append("evidenceUrl", evidenceUrl.trim());
      formData.append("fileName", evidenceName.trim() || "Uploaded Evidence");
      formData.append("mimeType", evidenceMime);
      formData.append("fileSize", String(evidenceSize));

      const result = await action(formData);
      if (result && !result.success) {
        setError(result.error || "Failed to attach evidence.");
        setSubmitting(false);
        return;
      }

      setSuccess("Evidence attached successfully!");
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
        router.refresh();
      }, 700);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          resetForm();
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-bold text-foreground hover:bg-accent/60 transition-colors shadow-xs"
      >
        <Plus className="h-3.5 w-3.5 text-primary" />
        Upload Evidence (Photo, Video, or PDF)
      </button>
    );
  }

  return (
    <div className="rounded-md border border-border/80 bg-card p-4 space-y-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Attach Dispute Evidence
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Choose from 3 evidence formats: Photo, Video, or PDF document.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            resetForm();
          }}
          className="text-muted-foreground hover:text-foreground p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/25 bg-destructive/10 p-2.5 text-xs text-destructive font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* 3 Upload Cards */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {/* 1. Photo */}
        <div className="rounded-md border border-border/90 bg-muted/20 p-3 flex flex-col justify-between space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-emerald-500/10 p-1.5 text-emerald-700 dark:text-emerald-300">
              <ImageIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Photo</p>
              <p className="text-[10px] text-muted-foreground">PNG, JPG (&lt;10MB)</p>
            </div>
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => handleFileSelect("photo", e.target.files?.[0])}
            disabled={uploadingCategory !== null || submitting}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={uploadingCategory !== null || submitting}
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
                Choose Photo
              </>
            )}
          </button>
        </div>

        {/* 2. Video */}
        <div className="rounded-md border border-border/90 bg-muted/20 p-3 flex flex-col justify-between space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-blue-500/10 p-1.5 text-blue-700 dark:text-blue-300">
              <Film className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Video</p>
              <p className="text-[10px] text-muted-foreground">MP4, MOV (&lt;35MB)</p>
            </div>
          </div>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/ogg"
            onChange={(e) => handleFileSelect("video", e.target.files?.[0])}
            disabled={uploadingCategory !== null || submitting}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploadingCategory !== null || submitting}
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
                Choose Video
              </>
            )}
          </button>
        </div>

        {/* 3. PDF Document */}
        <div className="rounded-md border border-border/90 bg-muted/20 p-3 flex flex-col justify-between space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-amber-500/10 p-1.5 text-amber-700 dark:text-amber-300">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Document</p>
              <p className="text-[10px] text-muted-foreground">PDF (&lt;20MB)</p>
            </div>
          </div>
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => handleFileSelect("pdf", e.target.files?.[0])}
            disabled={uploadingCategory !== null || submitting}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            disabled={uploadingCategory !== null || submitting}
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
                Choose PDF
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        {evidenceUrl && (
          <div className="rounded-md bg-muted/40 p-3 border border-border/70 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Selected File Ready:</span>
              <span className="text-muted-foreground">{formatBytes(evidenceSize)}</span>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Evidence Title / Label
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={evidenceName}
                onChange={(e) => setEvidenceName(e.target.value)}
                placeholder="e.g. Workmanship defect photo, signed agreement, site recording"
                disabled={submitting}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={uploadingCategory !== null || submitting || !evidenceUrl}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none transition-opacity shadow-xs"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Attaching to Case...
              </>
            ) : (
              "Attach Evidence"
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
            disabled={submitting}
            className="h-9 rounded-md border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
