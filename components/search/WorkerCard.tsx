"use client";

import { motion } from "framer-motion";
import { Worker } from "./types";
import { useLanguage } from "@/context/LanguageContext";

interface WorkerCardProps {
  worker: Worker;
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      whileHover={{ y: -4, borderColor: "rgba(128,128,128,0.2)" }}
      className="group relative bg-surface-container-low rounded-[1.5rem] border border-white/5 p-3.5 md:p-6 transition-all duration-300 shadow-2xl overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/2 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/5 transition-colors" />

      <div className="flex flex-row items-center sm:items-start gap-3.5 sm:gap-6 mb-4 sm:mb-6">
        <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-white/10 shadow-xl shrink-0">
          <img
            src={worker.photo}
            alt={worker.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {worker.isVerified && (
            <div className="absolute top-1 right-1 bg-primary text-black p-0.5 rounded-md shadow-lg scale-75 md:scale-100">
              <span className="material-symbols-outlined text-[8px] md:text-xs font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 sm:mb-0.5 gap-1.5 sm:gap-2">
            <h3 className="text-lg md:text-xl font-headline font-black text-on-surface tracking-tighter leading-tight truncate">
              {worker.name}
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 shrink-0">
                <span className="material-symbols-outlined text-[10px] md:text-xs text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="text-[10px] font-black text-on-surface tracking-tighter">
                  {worker.rating}
                </span>
              </div>
              <span className="text-[9px] md:text-[10px] font-bold text-on-surface-variant tracking-tighter">
                ({worker.reviews} {t("worker.reviews")})
              </span>
            </div>
          </div>
          
          <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.15em] mb-1 sm:mb-2">
            {worker.skill}
          </p>

          <div className="flex items-center gap-3 text-on-surface-variant text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">location_on</span>
              <span className="truncate">{worker.distance} KM · {worker.district}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags section */}
      <div className="hidden sm:flex flex-wrap gap-1.5 mb-6">
        {worker.skills?.slice(0, 2).map((s) => (
          <span
            key={s}
            className="px-2.5 py-1 bg-surface-container-high border border-white/5 rounded-full text-[8px] font-black text-on-surface-variant uppercase tracking-widest"
          >
            {s}
          </span>
        ))}
        {(worker.skills?.length || 0) > 2 && (
            <span className="text-[8px] font-black text-on-surface-variant/50 pt-1">+{worker.skills!.length - 2}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button className="flex items-center justify-center gap-2 bg-surface-container-high hover:bg-black/5 border border-white/5 text-on-surface text-[9px] md:text-[10px] font-black uppercase tracking-widest py-4 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all active:scale-95">
          <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
          {t("worker.message")}
        </button>
        <button className="flex items-center justify-center gap-2 bg-primary text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest py-4 sm:py-3.5 rounded-xl sm:rounded-2xl hover:bg-primary/80 active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
          {t("worker.viewProfile")}
        </button>
      </div>
    </motion.div>
  );
}
