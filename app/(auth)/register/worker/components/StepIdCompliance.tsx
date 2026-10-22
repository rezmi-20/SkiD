"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Dispatch, RefObject, SetStateAction } from "react";

interface StepIdComplianceProps {
  formData: any;
  setFormData: Dispatch<SetStateAction<any>>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  handleFileDrop: (file: File) => void | Promise<void>;
  isProcessing?: boolean;
  fileName?: string;
  profilePhotoPreview: string;
  onProfilePhoto: (file?: File) => void;
  trainingCertificates: File[];
  onTrainingCertificates: (files: FileList | null) => void;
  onRemoveCertificate?: (index: number) => void;
}

export default function StepIdCompliance({
  formData,
  setFormData,
  fileInputRef,
  handleFileUpload,
  handleFileDrop,
  isProcessing,
  fileName,
  profilePhotoPreview,
  onProfilePhoto,
  trainingCertificates,
  onTrainingCertificates,
  onRemoveCertificate,
}: StepIdComplianceProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      {/* Fayda FIN */}
      <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div>
          <h2 className="text-sm font-bold text-white">Fayda FIN <span className="text-red-400">*</span></h2>
          <p className="mt-1 text-xs leading-5 text-zinc-400">Enter the 12 digits shown on your Fayda ID. Your full FIN is encrypted and only available to authorized reviewers during an active verification review.</p>
        </div>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={12}
          required
          value={formData.faydaFinNumber || ""}
          onChange={(event) => {
            const faydaFinNumber = event.target.value.replace(/\D/g, "").slice(0, 12);
            setFormData((current: any) => ({ ...current, faydaFinNumber }));
          }}
          aria-label="12-digit Fayda FIN"
          placeholder="12-digit FIN"
          className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 text-sm font-semibold tracking-[0.18em] text-white outline-none transition focus:border-green-400 focus:ring-1 focus:ring-green-400 shadow-inner"
        />
      </section>

      {/* Profile Photo */}
      <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div>
          <h2 className="text-sm font-bold text-white">Your profile photo <span className="text-red-400">*</span></h2>
          <p className="mt-1 text-xs leading-5 text-zinc-400">Upload a clear, recent photo of your own uncovered face in good lighting. It must look like your Fayda ID photo so an admin can compare them. Clients see it only after you accept their hiring request.</p>
        </div>
        <div className="flex items-center gap-4">
          {profilePhotoPreview ? (
            <img src={profilePhotoPreview} alt="Profile photo preview" className="h-16 w-16 rounded-full border border-green-400/50 object-cover shrink-0" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-500 font-bold shrink-0">Photo</div>
          )}
          <div className="flex flex-col gap-1.5 min-w-0">
            <label className="inline-flex cursor-pointer rounded-xl bg-green-400 px-4 py-2.5 text-xs font-bold text-black hover:bg-green-500 transition-colors active:scale-95 w-max">
              {profilePhotoPreview ? "Replace photo" : "Choose photo"}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { onProfilePhoto(event.target.files?.[0]); event.target.value = ""; }} />
            </label>
            <span className="text-[11px] text-zinc-500">JPG, PNG, WEBP · compressed to 250 KB</span>
          </div>
        </div>
      </section>

      {/* Certificates */}
      <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <div>
          <h2 className="text-sm font-bold text-white">Learning certificates <span className="text-red-400">*</span></h2>
          <p className="mt-1 text-xs leading-5 text-zinc-400">Upload certificates for your training or trade qualifications. Add up to 5 files; each file can be up to 1 MB.</p>
        </div>
        <label className="inline-flex cursor-pointer rounded-xl border border-dashed border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:border-green-400/60 hover:text-white transition-all active:scale-95">
          + Add certificate
          <input type="file" multiple accept="application/pdf,image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { onTrainingCertificates(event.target.files); event.target.value = ""; }} />
        </label>
        {trainingCertificates.length > 0 && (
          <ul className="space-y-2 pt-1">
            {trainingCertificates.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-xs">
                <span className="flex items-center gap-2 truncate text-zinc-300">
                  <span className="text-green-400 font-bold">✓</span>
                  <span className="truncate">{file.name}</span>
                </span>
                {onRemoveCertificate && (
                  <button
                    type="button"
                    onClick={() => onRemoveCertificate(index)}
                    className="h-6 w-6 rounded-full bg-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 flex items-center justify-center shrink-0 transition-colors"
                    title="Remove certificate"
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Fayda ID Card Upload Dropzone */}
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFileDrop(file);
        }}
        className={`aspect-[16/10] w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all overflow-hidden group ${
          formData.faydaDocUrl
            ? "border-green-400/70 bg-green-400/5"
            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
        }`}
      >
        {formData.faydaDocUrl ? (
          <img src={formData.faydaDocUrl} alt="Fayda Upload" className="w-full h-full object-contain rounded-xl" />
        ) : (
          <>
            <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" x2="12" y1="3" y2="15"></line>
               </svg>
            </div>
            <p className="font-bold text-sm text-zinc-200">{t("register.fayda.uploadDocument")}</p>
            <p className="text-[11px] text-zinc-500 mt-1.5 font-bold uppercase tracking-wider">{t("register.fayda.chooseDrag")}</p>
          </>
        )}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 h-10 rounded-xl bg-green-400 text-black font-bold text-xs active:scale-95 transition-all disabled:opacity-60 shadow-sm"
          >
            {isProcessing ? t("register.fayda.preparing") : formData.faydaDocUrl ? t("register.fayda.replaceFile") : t("register.fayda.chooseFile")}
          </button>
          {formData.faydaDocUrl ? (
            <span className="text-[11px] text-green-300 font-semibold">{fileName || t("register.fayda.documentAttached")}</span>
          ) : (
            <span className="text-[11px] text-zinc-500 font-semibold">{t("register.fayda.fileSpecs")}</span>
          )}
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleFileUpload} />
      </div>

      {/* Security Note */}
      <div className="p-4 bg-green-400/5 border border-green-400/10 rounded-2xl space-y-1.5">
         <div className="flex items-center gap-2 text-green-400 font-bold text-[11px] uppercase tracking-wider">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
           {t("register.fayda.secure")}
         </div>
         <p className="text-xs text-zinc-400 leading-relaxed font-normal">
           {t("register.fayda.desc").replace("{time}", "4 hours")}
         </p>
      </div>
    </div>
  );
}
