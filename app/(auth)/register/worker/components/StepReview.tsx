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
    <div className="space-y-6">
      <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-[24px] space-y-4">
         <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="font-bold text-lg text-white">{formData.fullName}</p>
              <p className="text-[13px] text-green-400 font-bold">+251 {formData.phone}</p>
            </div>
            <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400">
               {formData.location}
            </div>
         </div>
         <div className="flex flex-wrap gap-1.5">
            {formData.skills.map((s: string) => (
               <span key={s} className="text-[11px] font-medium text-zinc-500">• {s}</span>
            ))}
         </div>
      </div>
      <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
        {profilePhotoPreview && <img src={profilePhotoPreview} alt="Your profile photo" className="h-16 w-16 rounded-full object-cover" />}
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">Profile photo</p>
          <p className="text-xs text-zinc-400">Admins will compare your face visually with the Fayda ID.</p>
        </div>
      </div>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
        <p className="mb-2 text-sm font-bold text-white">Learning certificates ({trainingCertificates.length})</p>
        <ul className="space-y-1 text-xs text-zinc-400">{trainingCertificates.map((file, index) => <li key={`${file.name}-${index}`}>{file.name}</li>)}</ul>
      </div>
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
         {formData.faydaDocUrl ? (
           <img src={formData.faydaDocUrl} alt="ID Upload" className="w-full h-full object-contain" />
         ) : (
           <div className="text-zinc-700 text-xs font-bold">{t("register.review.noFayda")}</div>
         )}
      </div>
      <label className="flex items-start gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl cursor-pointer group hover:bg-zinc-800/50 transition-all">
          <input type="checkbox" required className="mt-1 accent-green-400 w-4 h-4" />
          <span className="text-[12px] font-medium text-zinc-400 leading-relaxed">
              {t("register.review.certify")}
          </span>
      </label>
    </div>
  );
}
