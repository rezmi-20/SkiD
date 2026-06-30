"use client";

import { useState, useRef } from "react";
import { resubmitVerification } from "@/lib/actions/profile";
import { useLanguage } from "@/context/LanguageContext";

export default function VerificationResubmitForm() {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accept images and PDFs
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError(t("verification.resubmit.err_invalid_type"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t("verification.resubmit.err_size"));
      return;
    }

    setError(null);
    setUploading(true);
    setFileName(file.name);

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (res.ok && data.url) {
        setUploadedUrl(data.url);
      } else {
        setError(data.error || t("verification.resubmit.err_upload_fail"));
        setFileName(null);
      }
    } catch {
      setError(t("verification.resubmit.err_conn"));
      setFileName(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedUrl) {
      setError(t("verification.resubmit.err_no_doc"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await resubmitVerification(uploadedUrl);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || t("verification.resubmit.err_sub_fail"));
      }
    } catch {
      setError(t("contract.new.err_unexpected"));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
        <div className="w-12 h-12 bg-green-400/20 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-green-400 text-[28px]">check_circle</span>
        </div>
        <div>
          <p className="text-green-400 font-black text-sm">{t("verification.resubmit.success_title")}</p>
          <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
            {t("verification.resubmit.success_desc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-red-400 text-[18px]">upload_file</span>
        <p className="text-xs font-black text-zinc-300 uppercase tracking-widest">
          {t("verification.resubmit.title")}
        </p>
      </div>

      {/* Drop / Click Zone */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`w-full border border-dashed rounded-2xl p-5 flex flex-col items-center gap-3 transition-all ${
          uploadedUrl
            ? "border-green-500/40 bg-green-500/5"
            : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-900"
        } disabled:opacity-60`}
      >
        {uploading ? (
          <>
            <div className="w-8 h-8 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-400">{t("verification.resubmit.uploading")}</p>
          </>
        ) : uploadedUrl ? (
          <>
            <span className="material-symbols-outlined text-green-400 text-[32px]">task</span>
            <div className="text-center">
              <p className="text-xs font-bold text-green-400">{t("verification.resubmit.ready")}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[200px]">{fileName}</p>
            </div>
            <p className="text-[10px] text-zinc-600">{t("verification.resubmit.change")}</p>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-zinc-500 text-[32px]">id_card</span>
            <div className="text-center">
              <p className="text-xs font-bold text-zinc-300">{t("verification.resubmit.upload_prompt")}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">{t("verification.resubmit.file_specs")}</p>
            </div>
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!uploadedUrl || submitting}
        className="w-full h-12 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-black text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t("verification.resubmit.submitting")}
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">send</span>
            {t("verification.resubmit.btn")}
          </>
        )}
      </button>
    </div>
  );
}
