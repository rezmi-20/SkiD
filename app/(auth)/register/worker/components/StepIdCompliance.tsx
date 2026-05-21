"use client";

import { useLanguage } from "@/context/LanguageContext";
import { RefObject } from "react";

interface StepIdComplianceProps {
  formData: any;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function StepIdCompliance({ formData, fileInputRef, handleFileUpload }: StepIdComplianceProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`aspect-[16/10] w-full border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center p-8 transition-all cursor-pointer overflow-hidden group ${
          formData.faydaDocUrl 
            ? "border-green-400 bg-green-400/5" 
            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
        }`}
      >
        {formData.faydaDocUrl ? (
          <img src={formData.faydaDocUrl} alt="Fayda Scan" className="w-full h-full object-contain rounded-xl" />
        ) : (
          <>
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" x2="12" y1="3" y2="15"></line>
               </svg>
            </div>
            <p className="font-bold text-base text-zinc-300">{t("register.fayda.title")}</p>
            <p className="text-[11px] text-zinc-500 mt-2 font-black uppercase tracking-widest">{t("register.fayda.subtitle")}</p>
          </>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
      </div>
      <div className="p-5 bg-green-400/5 border border-green-400/10 rounded-2xl space-y-2">
         <div className="flex items-center gap-2 text-green-400 font-black text-[10px] uppercase tracking-widest">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            {t("register.fayda.secure")}
         </div>
         <p className="text-[12px] text-zinc-400 leading-relaxed font-medium">
           {t("register.fayda.desc").replace("{time}", "4 hours")}
         </p>
      </div>
    </div>
  );
}
