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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-[#27272a] lg:bg-[#0c0c0e] lg:dark:bg-[#0c0c0e] border border-zinc-100 dark:border-transparent lg:border-white/5 lg:dark:border-white/5 lg:hover:border-[#2dd4bf]/20 rounded-2xl lg:rounded-[2rem] p-4 lg:p-6 transition-all duration-500 shadow-sm lg:shadow-xl overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-8">
        
        {/* Top Row for Mobile, Left side for Desktop */}
        <div className="flex items-start lg:items-center gap-4 lg:gap-8">
          
          {/* Avatar */}
          <div className="relative shrink-0">
             <div className="w-14 h-14 lg:w-24 lg:h-24 rounded-full overflow-hidden border-2 lg:border-4 border-transparent lg:border-zinc-900 bg-zinc-200 dark:bg-zinc-700 lg:bg-zinc-800 shadow-sm lg:shadow-2xl flex items-center justify-center">
                {worker.photo ? (
                  <img 
                    src={worker.photo} 
                    className="w-full h-full object-cover lg:group-hover:scale-110 transition-transform duration-700" 
                    alt={worker.name} 
                  />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-zinc-400 dark:text-zinc-500 lg:w-12 lg:h-12">
                     <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
             </div>
             {worker.isVerified && (
               <div className="hidden lg:flex absolute -bottom-1 -right-1 w-8 h-8 bg-[#2dd4bf] rounded-full border-4 border-zinc-900 items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
               </div>
             )}
          </div>
          
          {/* Info */}
          <div className="flex-1 mt-0.5 lg:mt-0 flex flex-col lg:flex-row lg:items-center min-w-0">
             {/* Name & Skills */}
             <div className="flex-1 space-y-1.5 lg:space-y-4">
                <h3 className="text-[15px] lg:text-2xl font-semibold lg:font-black text-zinc-900 dark:text-white lg:tracking-tight lg:uppercase lg:group-hover:text-[#2dd4bf] transition-colors leading-tight">
                  {worker.name}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
                   {worker.skills?.slice(0, 3).map(skill => (
                     <span key={skill} className="px-2 py-0.5 lg:px-3 lg:py-1 bg-zinc-100 dark:bg-[#18181b] lg:bg-zinc-900 lg:dark:bg-zinc-900 border border-transparent lg:border-white/5 rounded-md lg:rounded-lg text-[10px] lg:text-[9px] font-medium lg:font-black text-zinc-600 dark:text-zinc-300 lg:text-zinc-500 lg:dark:text-zinc-500 uppercase lg:tracking-widest">
                        {skill}
                     </span>
                   ))}
                </div>
             </div>
             
             {/* Rating & Distance (Desktop Location - Middle Right) */}
             <div className="hidden lg:flex items-center justify-center gap-6 mt-4 lg:mt-0">
                <div className="flex items-center gap-1.5">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#f59e0b]">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                   </svg>
                   <span className="text-sm font-black text-white">{worker.rating}</span>
                </div>
                <div className="text-sm font-black text-zinc-500 uppercase tracking-widest">
                   {worker.distance === "N/A" ? "Location N/A" : `${worker.distance} KM AWAY`}
                </div>
             </div>
          </div>
        </div>

        {/* Desktop CTA (Far Right) */}
        <div className="hidden lg:block shrink-0">
           <a href={`/client/worker/${worker.id}`} className="flex items-center justify-center w-48 h-14 bg-[#2dd4bf] hover:bg-teal-300 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_10px_30px_rgba(45,212,191,0.2)] active:scale-95 no-underline">
              View Profile
           </a>
        </div>

        {/* Mobile Bottom Row (Rating, Distance, CTA) */}
        <div className="lg:hidden flex items-center justify-between mt-1 pl-[4.5rem]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" className="text-amber-500">
                 <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span className="text-[13px] font-medium text-zinc-900 dark:text-white">{worker.rating}</span>
            </div>
            <span className="text-[13px] text-zinc-500 dark:text-zinc-400">
              {worker.distance === "N/A" ? "Location N/A" : `${worker.distance} km away`}
            </span>
          </div>
          <a href={`/client/worker/${worker.id}`} className="flex items-center justify-center px-4 py-1.5 bg-[#2dd4bf] hover:bg-teal-300 text-black text-xs font-semibold rounded-full transition-all no-underline">
            View Profile
          </a>
        </div>
        
      </div>
      
      {/* Ambient Hover Glow (Desktop) */}
      <div className="hidden lg:block absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#2dd4bf]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}
