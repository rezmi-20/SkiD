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
      className="group relative bg-surface-container-low rounded-[2rem] border border-white/5 p-6 transition-all duration-300 shadow-2xl overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/2 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/5 transition-colors" />

      <div className="flex items-start gap-6 mb-6">
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-xl shrink-0">
          <img
            src={worker.photo}
            alt={worker.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {worker.isVerified && (
            <div className="absolute top-2 right-2 bg-primary text-black p-1 rounded-full shadow-lg">
              <span className="material-symbols-outlined text-xs font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-xl font-headline font-black text-on-surface tracking-tighter truncate">
              {worker.name}
            </h3>
            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
              <span className="material-symbols-outlined text-xs text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="text-[10px] font-black text-on-surface tracking-tighter">
                {worker.rating}
              </span>
            </div>
          </div>
          
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">
            {worker.skill}
          </p>

          <div className="flex items-center gap-4 text-on-surface-variant text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">location_on</span>
              <span>{worker.distance} KM · {worker.district}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {worker.skills?.slice(0, 3).map((s) => (
          <span
            key={s}
            className="px-3 py-1 bg-surface-container-high border border-white/5 rounded-full text-[9px] font-black text-on-surface-variant uppercase tracking-widest"
          >
            {s}
          </span>
        ))}
        {(worker.skills?.length || 0) > 3 && (
            <span className="text-[9px] font-black text-on-surface-variant/50 pt-1.5">+{worker.skills!.length - 3} more</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 bg-surface-container-high hover:bg-white/5 border border-white/5 text-on-surface text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl transition-all active:scale-95">
          <span className="material-symbols-outlined text-sm">chat_bubble</span>
          Message
        </button>
        <button className="flex items-center justify-center gap-2 bg-white text-black text-[10px] font-black uppercase tracking-widest py-3.5 rounded-xl hover:bg-white/90 active:scale-95 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.05)]">
          View Profile
        </button>
      </div>
    </motion.div>
  );
}
