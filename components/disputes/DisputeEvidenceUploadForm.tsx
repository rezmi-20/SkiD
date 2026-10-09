"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  disputeId: string;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string; status?: number } | void>;
};

export default function DisputeEvidenceUploadForm({ disputeId, action }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"file" | "url">("file");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form values
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceName, setEvidenceName] = useState("");
  const [evidenceMime, setEvidenceMime] = useState("image/png");
  const [evidenceSize, setEvidenceSize] = useState(1024);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setError("File exceeds maximum allowed size of 8 MB.");
      return;
    }

    const mime = file.type || "application/octet-stream";
    const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (!allowed.includes(mime)) {
      setError("Supported file types are PNG, JPEG, WebP, and PDF.");
      return;
    }

    setEvidenceName(file.name);
    setEvidenceMime(mime);
    setEvidenceSize(file.size);

    // If it's an image, upload via /api/upload
    if (file.type.startsWith("image/")) {
      setUploading(true);
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json();
        if (res.ok && data.url) {
          setEvidenceUrl(data.url);
          setSuccess("Image uploaded to secure storage. Ready to attach.");
        } else {
          setError(data.error || "Storage upload failed. You can switch to URL mode to provide a link.");
          setMode("url");
        }
      } catch {
        setError("Failed to upload file. Please check connection or provide a document link.");
        setMode("url");
      } finally {
        setUploading(false);
      }
    } else {
      // PDF or non-image
      setSuccess("Document selected. If secure upload is external, confirm or provide the document URL.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (!evidenceUrl.trim()) {
      setError("Evidence storage URL is required.");
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
      setEvidenceUrl("");
      setEvidenceName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 px-4 text-xs font-black uppercase tracking-widest text-primary transition-colors hover:bg-primary/20"
        >
          + Upload Additional Evidence
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-surface-container-low p-4">
      <div className="flex items-center justify-between border-b border-outline-variant/50 pb-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-on-surface">Upload Dispute Evidence</h3>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            Attach photos, receipts, or documents supporting your claim (PNG, JPG, WebP, PDF up to 8MB).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setError(null);
            setSuccess(null);
          }}
          className="text-xs font-bold text-on-surface-variant hover:text-on-surface"
        >
          Cancel
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            mode === "file" ? "bg-surface-container-highest text-on-surface" : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            mode === "url" ? "bg-surface-container-highest text-on-surface" : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          Storage URL
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-error/30 bg-error/10 p-3 text-xs font-bold text-error">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        {mode === "file" ? (
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
              Select Document or Photo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
              onChange={handleFileChange}
              disabled={uploading || submitting}
              className="mt-1 block w-full text-xs text-on-surface-variant file:mr-3 file:rounded-lg file:border-0 file:bg-surface-container-highest file:px-3 file:py-2 file:text-xs file:font-bold file:text-on-surface hover:file:bg-primary hover:file:text-on-primary"
            />
            {uploading && <p className="mt-1 text-xs text-primary animate-pulse">Uploading file to secure storage...</p>}
          </div>
        ) : null}

        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
            Evidence Title / Description
          </label>
          <input
            type="text"
            required
            maxLength={120}
            value={evidenceName}
            onChange={(e) => setEvidenceName(e.target.value)}
            placeholder="e.g. Work site photos, completion receipt, repair invoice"
            disabled={submitting}
            className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container p-2.5 text-xs text-on-surface"
          />
        </div>

        {mode === "url" && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
                Trusted Storage URL
              </label>
              <input
                type="url"
                required
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                disabled={submitting}
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container p-2.5 text-xs text-on-surface"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
                File Type
              </label>
              <select
                value={evidenceMime}
                onChange={(e) => setEvidenceMime(e.target.value)}
                disabled={submitting}
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container p-2.5 text-xs text-on-surface"
              >
                <option value="image/png">PNG Image</option>
                <option value="image/jpeg">JPEG Image</option>
                <option value="image/webp">WEBP Image</option>
                <option value="application/pdf">PDF Document</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={uploading || submitting || (!evidenceUrl && mode === "file")}
            className="h-10 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Attaching..." : "Attach Evidence"}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={submitting}
            className="h-10 rounded-lg border border-outline-variant px-4 text-xs font-bold text-on-surface-variant hover:bg-surface-container"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
