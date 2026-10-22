"use client";

import { useLanguage } from "@/context/LanguageContext";

interface StepReviewProps {
  formData: any;
  profilePhotoPreview: string;
  trainingCertificates: File[];
}

export default function StepReview({ formData, profilePhotoPreview, trainingCertificates }: StepReviewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {/* Identity & Location Summary Card */}
      <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3.5">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1 min-w-0">
            <p className="font-bold text-base text-white truncate">{formData.fullName}</p>
            <p className="text-xs text-green-400 font-bold">+251 {formData.phone}</p>
            {formData.email && <p className="text-[11px] text-zinc-400 truncate">{formData.email}</p>}
          </div>
          {formData.location && (
            <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-300 shrink-0">
              {formData.location}
            </div>
          )}
        </div>

        {/* Selected trade skills chips */}
        {formData.skills && formData.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-800/60">
            {formData.skills.map((s: string) => (
              <span key={s} className="px-2.5 py-0.5 rounded-md bg-zinc-800/80 text-[11px] font-medium text-zinc-300 border border-zinc-700/50">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Profile Photo & Certificates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3.5">
          {profilePhotoPreview ? (
            <img src={profilePhotoPreview} alt="Your profile photo" className="h-12 w-12 rounded-full object-cover border border-green-400/40 shrink-0" />
          ) : (
            <div className="h-12 w-12 rounded-full bg-zinc-800 text-xs text-zinc-500 font-bold flex items-center justify-center shrink-0">Photo</div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">Profile Photo</p>
            <p className="text-[11px] text-zinc-400 truncate">Vetted for face match</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3.5">
          <div className="h-12 w-12 rounded-xl bg-zinc-800 text-green-400 font-bold text-base flex items-center justify-center shrink-0 border border-zinc-700">
            {trainingCertificates.length}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white">Certificates</p>
            <p className="text-[11px] text-zinc-400 truncate">{trainingCertificates.length} file{trainingCertificates.length !== 1 ? "s" : ""} attached</p>
          </div>
        </div>
      </div>

      {/* Fayda ID Document Preview */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center relative">
        {formData.faydaDocUrl ? (
          <img src={formData.faydaDocUrl} alt="ID Upload" className="w-full h-full object-contain" />
        ) : (
          <div className="text-zinc-600 text-xs font-bold">{t("register.review.noFayda")}</div>
        )}
        {formData.faydaFinNumber && (
          <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-zinc-800 text-[11px] font-mono font-bold text-zinc-300">
            FIN: {"********"}{String(formData.faydaFinNumber).slice(-4)}
          </div>
        )}
      </div>

      {/* Certification Checkbox */}
      <label className="flex items-start gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl cursor-pointer group hover:bg-zinc-800/40 transition-all">
        <input type="checkbox" required className="mt-0.5 accent-green-400 w-4 h-4 rounded shrink-0 cursor-pointer" />
        <span className="text-xs font-medium text-zinc-300 leading-relaxed select-none">
          {t("register.review.certify")}
        </span>
      </label>
    </div>
  );
}
