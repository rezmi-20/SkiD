"use client";

import { useLanguage } from "@/context/LanguageContext";

interface StepReviewProps {
  formData: any;
}

export default function StepReview({ formData }: StepReviewProps) {
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
      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
         {formData.faydaDocUrl ? (
           <img src={formData.faydaDocUrl} alt="ID Check" className="w-full h-full object-contain" />
         ) : (
           <div className="text-zinc-700 text-xs font-bold">{t("register.fayda.no_scan")}</div>
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
