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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="group relative bg-[#0c0c0e] border border-white/5 hover:border-green-400/20 rounded-[2rem] p-6 transition-all duration-500 shadow-xl overflow-hidden"
    >
      <div className="flex flex-col md:flex-row items-center gap-8">
        
        {/* Avatar */}
        <div className="relative shrink-0">
           <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-900 bg-zinc-800 shadow-2xl">
              <img 
                src={worker.photo} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={worker.name} 
              />
           </div>
           {worker.isVerified && (
             <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-400 rounded-full border-4 border-zinc-900 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
             </div>
           )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4 text-center md:text-left">
           <div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase group-hover:text-green-400 transition-colors">
                {worker.name}
              </h3>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                 {worker.skills?.slice(0, 3).map(skill => (
                   <span key={skill} className="px-3 py-1 bg-zinc-900 border border-white/5 rounded-lg text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                      {skill}
                   </span>
                 ))}
              </div>
           </div>

           <div className="flex items-center justify-center md:justify-start gap-6">
              <div className="flex items-center gap-1.5">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-orange-400">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                 </svg>
                 <span className="text-sm font-black text-white">{worker.rating}</span>
              </div>
              <div className="text-sm font-black text-zinc-500 uppercase tracking-widest">
                 {worker.distance} KM AWAY
              </div>
           </div>
        </div>

        {/* CTA */}
        <div className="shrink-0 w-full md:w-auto">
           <button className="w-full md:w-48 h-14 bg-green-400 hover:bg-green-300 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_10px_30px_rgba(74,222,128,0.2)] active:scale-95">
              View Profile
           </button>
        </div>
      </div>

      {/* Ambient Hover Glow */}
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-green-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
