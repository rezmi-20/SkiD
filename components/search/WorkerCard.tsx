"use client";

import { motion } from "framer-motion";
import { Worker } from "./types";

interface WorkerCardProps {
  worker: Worker;
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: "rgba(255, 255, 255, 0.15)" }}
      className="group relative bg-surface-container-low rounded-[2rem] border border-white/5 p-4 md:p-6 transition-all duration-300 shadow-2xl overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/5 transition-colors" />

      <div className="flex flex-col sm:flex-row items-start sm:items-start gap-4 sm:gap-6 mb-6">
        <div className="relative w-full sm:w-24 h-48 sm:h-24 rounded-2xl overflow-hidden border border-white/10 shadow-xl shrink-0">
          <img
            src={worker.photo}
            alt={worker.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {worker.isVerified && (
            <div className="absolute top-1.5 right-1.5 bg-primary text-black p-0.5 rounded-md shadow-lg scale-75 md:scale-100">
              <span className="material-symbols-outlined text-[10px] md:text-xs font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-1 gap-2">
            <h3 className="text-lg md:text-xl font-headline font-black text-on-surface tracking-tighter leading-tight">
              {worker.name}
            </h3>
            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/5 shrink-0">
              <span className="material-symbols-outlined text-[10px] md:text-xs text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="text-[10px] font-black text-on-surface tracking-tighter">
                {worker.rating}
              </span>
            </div>
          </div>
          
          <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
            {worker.skill}
          </p>

          <div className="flex items-center gap-4 text-on-surface-variant text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              <span className="truncate">{worker.district} · {worker.distance} KM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tags section - Hidden on very small screens or made more compact */}
      <div className="flex flex-wrap gap-1.5 mb-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 bg-surface-container-high hover:bg-white/5 border border-white/5 text-on-surface text-[10px] font-black uppercase tracking-widest py-3.5 rounded-2xl transition-all active:scale-95">
          <span className="material-symbols-outlined text-sm">chat_bubble</span>
          Chat
        </button>
        <button className="flex items-center justify-center gap-2 bg-white text-black text-[10px] font-black uppercase tracking-widest py-3.5 rounded-2xl hover:bg-white/90 active:scale-95 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.05)]">
          Profile
        </button>
      </div>
    </motion.div>
  );
}
