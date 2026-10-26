"use client";

import { useState, useRef } from "react";
import { resubmitVerification } from "@/lib/actions/profile";
import { useLanguage } from "@/context/LanguageContext";
import { CheckCircle2, UploadCloud, FileCheck, IdCard, AlertCircle, Send, Loader2 } from "lucide-react";

export default function VerificationResubmitForm({ mode = "resubmit" }: { mode?: "complete" | "resubmit" | "reverify" }) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [finNumber, setFinNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verification documents must be stored encrypted in the database, not as
    // publicly reachable assets from the general-purpose upload endpoint.
    const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp", "application/pdf"]);
    if (!allowedTypes.has(file.type)) {
      setError(t("verification.resubmit.err_invalid_type"));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError(t("verification.resubmit.err_size"));
      return;
    }

    setError(null);
    setUploading(true);
    setFileName(file.name);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read file"));
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });
      setUploadedUrl(dataUrl);
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
      const result = await resubmitVerification(uploadedUrl, finNumber);
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
          <CheckCircle2 className="h-7 w-7 text-green-400" />
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
        <UploadCloud className="h-4 w-4 text-red-400" />
        <p className="text-xs font-black text-zinc-300 uppercase tracking-widest">
          {mode === "complete" ? t("profile.completeFayda") : mode === "reverify" ? t("verification.reverify.title") : t("verification.resubmit.title")}
        </p>
      </div>

      {/* Drop / Click Zone */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          {t("verification.resubmit.fin_label")}
        </label>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={12}
          value={finNumber}
          onChange={(event) => {
            setError(null);
            setFinNumber(event.target.value.replace(/\D/g, "").slice(0, 12));
          }}
          placeholder={t("verification.resubmit.fin_placeholder")}
          className="h-12 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 text-sm font-bold text-zinc-100 outline-none focus:border-red-400"
        />
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
            <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
            <p className="text-xs text-zinc-400">{t("verification.resubmit.uploading")}</p>
          </>
        ) : uploadedUrl ? (
          <>
            <FileCheck className="h-8 w-8 text-green-400" />
            <div className="text-center">
              <p className="text-xs font-bold text-green-400">{t("verification.resubmit.ready")}</p>
              <p className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[200px]">{fileName}</p>
            </div>
            <p className="text-[10px] text-zinc-600">{t("verification.resubmit.change")}</p>
          </>
        ) : (
          <>
            <IdCard className="h-8 w-8 text-zinc-500" />
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
        accept="image/png,image/jpeg,image/webp,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!uploadedUrl || finNumber.length !== 12 || submitting}
        className="w-full h-12 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-black text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            <span>{t("verification.resubmit.submitting")}</span>
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            <span>{mode === "complete" ? t("profile.completeFayda") : mode === "reverify" ? t("verification.reverify.btn") : t("verification.resubmit.btn")}</span>
          </>
        )}
      </button>
    </div>
  );
}
