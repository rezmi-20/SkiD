"use client";

import { useLanguage } from "@/context/LanguageContext";
import { RefObject } from "react";

interface StepIdComplianceProps {
  formData: any;
  fileInputRef: RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void | Promise<void>;
  handleFileDrop: (file: File) => void | Promise<void>;
  isProcessing?: boolean;
  fileName?: string;
}

export default function StepIdCompliance({
  formData,
  fileInputRef,
  handleFileUpload,
  handleFileDrop,
  isProcessing,
  fileName,
}: StepIdComplianceProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFileDrop(file);
        }}
        className={`aspect-[16/10] w-full border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center p-8 transition-all overflow-hidden group ${
          formData.faydaDocUrl
            ? "border-green-400 bg-green-400/5"
            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-600"
        }`}
      >
        {formData.faydaDocUrl ? (
          <img src={formData.faydaDocUrl} alt="Fayda Upload" className="w-full h-full object-contain rounded-xl" />
        ) : (
          <>
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" x2="12" y1="3" y2="15"></line>
               </svg>
            </div>
            <p className="font-bold text-base text-zinc-300">Upload your Fayda document</p>
            <p className="text-[11px] text-zinc-500 mt-2 font-black uppercase tracking-widest">Choose a file or drag it here</p>
          </>
        )}
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="px-5 h-11 rounded-2xl bg-green-400 text-black font-black text-[11px] uppercase tracking-widest disabled:opacity-60"
          >
            {isProcessing ? "Preparing..." : formData.faydaDocUrl ? "Replace File" : "Choose File"}
          </button>
          {formData.faydaDocUrl ? (
            <span className="text-[11px] text-green-300 font-semibold">{fileName || "Document attached"}</span>
          ) : (
            <span className="text-[11px] text-zinc-500 font-semibold">PNG, JPG, or WEBP under 10 MB</span>
          )}
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleFileUpload} />
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
