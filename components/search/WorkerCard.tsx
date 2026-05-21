"use client";

import { motion } from "framer-motion";
import { Worker } from "./types";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

interface WorkerCardProps {
  worker: Worker;
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-surface-container-lowest border border-surface-container-highest rounded-2xl md:rounded-[2rem] p-4 md:p-6 transition-all duration-300 shadow-sm hover:shadow-md hover:border-primary/20 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 justify-between">
        
        {/* Main Info Section */}
        <div className="flex items-start md:items-center gap-4 md:gap-6 flex-grow min-w-0">
          
          {/* Avatar with Status */}
          <div className="relative shrink-0">
             <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-[2rem] overflow-hidden border-2 border-surface bg-surface-container-high shadow-sm flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                {worker.photo ? (
                  <img 
                    src={worker.photo} 
                    className="w-full h-full object-cover" 
                    alt={worker.name} 
                  />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-[32px] md:text-[48px]">person</span>
                )}
             </div>
             {worker.isVerified && (
               <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-primary text-on-primary rounded-full border-2 md:border-4 border-surface-container-lowest flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[14px] md:text-[18px] filled">verified</span>
               </div>
             )}
          </div>
          
          {/* Metadata */}
          <div className="flex-grow min-w-0 space-y-1.5 md:space-y-3">
             <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                   <h3 className="text-headline-md md:text-headline-lg text-on-surface truncate group-hover:text-primary transition-colors">
                     {worker.name}
                   </h3>
                </div>
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[14px] text-primary filled">star</span>
                      <span className="text-label-sm font-bold text-primary">{worker.rating}</span>
                   </div>
                   <span className="text-label-sm text-on-surface-variant uppercase tracking-widest opacity-60">
                      {worker.distance === "N/A" ? "Location N/A" : `${worker.distance} km away`}
                   </span>
                </div>
             </div>

             <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                {worker.skills?.slice(0, 3).map(skill => (
                  <span key={skill} className="px-3 py-1 bg-surface-container-low border border-surface-container-highest rounded-lg text-label-sm text-on-surface-variant uppercase tracking-widest group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/10 transition-all">
                     {skill}
                  </span>
                ))}
             </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 md:pl-4 border-t md:border-t-0 md:border-l border-surface-container-highest pt-4 md:pt-0">
           <Link 
             href={`/client/worker/${worker.id}`} 
             className="flex items-center justify-center w-full md:w-48 h-12 md:h-14 bg-on-surface text-surface-container-lowest text-label-md font-bold uppercase tracking-widest rounded-2xl transition-all hover:bg-primary shadow-sm hover:shadow-lg active:scale-[0.98] group/btn"
           >
              <span>View Profile</span>
              <span className="material-symbols-outlined ml-2 text-[20px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
           </Link>
        </div>
      </div>
    </motion.div>
  );
}
