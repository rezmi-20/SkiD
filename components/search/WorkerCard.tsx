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
      whileHover={{ y: -4, borderColor: "var(--primary-accent)" }}
      className="group relative bg-surface rounded-[2rem] border border-border/10 p-3.5 md:p-6 transition-all duration-500 shadow-2xl overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-green-400/10 transition-colors" />

      <div className="flex flex-row items-center sm:items-start gap-3.5 sm:gap-6 mb-4 sm:mb-6">
        <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full p-[3px] bg-gradient-to-tr from-green-400 via-green-400/20 to-surface shadow-xl shrink-0">
          <div className="w-full h-full bg-background rounded-full overflow-hidden border-[3px] border-background relative">
            <img
              src={worker.photo}
              alt={worker.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          {worker.isVerified && (
            <div className="absolute top-1 right-1 bg-green-400 text-black p-[3px] rounded-full shadow-lg scale-75 md:scale-100 border-2 border-background z-10">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 sm:mb-0.5 gap-1 sm:gap-2">
            <h3 className="text-base sm:text-lg md:text-xl font-headline font-black text-text-high tracking-tighter leading-tight break-words uppercase">
              {worker.name}
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-background px-2 py-0.5 rounded-lg border border-border/20 shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <span className="text-[10px] font-black text-text-high tracking-tighter">
                  {worker.rating}
                </span>
              </div>
              <span className="text-[9px] md:text-[10px] font-bold text-text-med tracking-tighter shrink-0">
                ({worker.reviews})
              </span>
            </div>
          </div>
          
          <p className="text-[9px] md:text-[10px] font-black text-green-400 uppercase tracking-[0.15em] mb-1 sm:mb-2 italic">
            {worker.skill}
          </p>

          <div className="flex items-center gap-3 text-text-med text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-zinc-500">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
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
            className="px-2.5 py-1 bg-background border border-border/10 rounded-full text-[8px] font-black text-text-med uppercase tracking-widest"
          >
            {s}
          </span>
        ))}
        {(worker.skills?.length || 0) > 2 && (
            <span className="text-[8px] font-black text-text-med/50 pt-1">+{worker.skills!.length - 2}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button className="flex items-center justify-center gap-2 bg-background hover:bg-surface border border-border/20 text-text-high text-[9px] md:text-[10px] font-black uppercase tracking-widest py-4 sm:py-3.5 rounded-full transition-all active:scale-95">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          {t("worker.message").split(' ')[0]}
        </button>
        <button className="flex items-center justify-center gap-2 bg-green-400 text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest py-4 sm:py-3.5 rounded-full hover:bg-green-300 active:scale-95 transition-all shadow-[0_5px_15px_rgba(74,222,128,0.25)]">
          {t("worker.viewProfile").split(' ')[0]}
        </button>
      </div>
    </motion.div>

  );
}
