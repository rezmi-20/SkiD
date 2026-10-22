"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Worker } from "./types";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { Star, Check, ArrowRight, MapPin, Wrench } from "lucide-react";
import { setCachedWorker } from "@/lib/workerCache";

interface WorkerCardProps {
  worker: Worker;
  className?: string;
  onClose?: () => void;
}

export default function WorkerCard({ worker, className = "", onClose }: WorkerCardProps) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  // Helper to prime worker cache for instant 0ms transition
  const primeCache = () => {
    setCachedWorker(String(worker.id), {
      worker: {
        id: String(worker.id),
        email: "",
        full_name: worker.name,
        bio: worker.bio,
        skills: [worker.skill],
        latitude: worker.lat,
        longitude: worker.lng,
        hourly_rate: String(worker.hourlyRate || "450"),
        avatar_url: worker.photo || "",
        is_verified: worker.isVerified,
        avg_rating: worker.rating,
        total_ratings: worker.reviews,
        availability: "available",
      },
      reviews: [],
    });
  };

  // Use initials as the public placeholder so stock portraits cannot be mistaken for the worker.
  const fallbackImg = `/default-avatar.svg`;
  
  const displayPhoto = imgError ? fallbackImg : (worker.photo || fallbackImg);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`group relative flex flex-col bg-card dark:bg-[#181d24]/90 border border-outline-variant/60 hover:border-[#a3e635]/60 rounded-[24px] p-2.5 sm:p-3 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* ── Clickable Top Photo & Info Area ── */}
      <Link 
        href={`/client/worker/${worker.id}`}
        prefetch={true}
        onMouseEnter={primeCache}
        onTouchStart={primeCache}
        onClick={primeCache}
        className="block group-hover:opacity-95 transition-opacity"
      >
        {/* ── Top Photo Container ── */}
        <div className="relative w-full aspect-[4/3.8] rounded-[18px] overflow-hidden bg-muted/60 dark:bg-black/40 shrink-0">
          <img
            src={displayPhoto}
            alt={worker.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Floating Trade Skill Pill on Photo */}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-sm">
            <span>{worker.skill}</span>
          </div>

          {/* Floating Distance Badge on Photo if available */}
          {worker.distance !== "N/A" && (
            <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black bg-[#a3e635] text-black shadow-sm">
              {worker.distance} km
            </div>
          )}
        </div>

        {/* ── Middle Info: Name, Verified Badge & Description ── */}
        <div className="pt-2.5 pb-1 px-1 flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-black text-sm text-foreground truncate group-hover:text-[#84cc16] dark:group-hover:text-[#a3e635] transition-colors">
              {worker.name}
            </h3>
            {worker.isVerified && (
              <span 
                className="shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#22c55e] text-white shadow-sm"
                title={t("search.verifiedProfessional") || "Verified Professional"}
              >
                <Check className="w-2.5 h-2.5 stroke-[3.5]" />
              </span>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 leading-snug">
            {worker.bio || `${worker.skill} professional in Dire Dawa.`}
          </p>
        </div>
      </Link>

      {/* ── Bottom Row: Rating / Distance & Action Pill Button ── */}
      <div className="pt-2.5 mt-auto border-t border-outline-variant/40 flex items-center justify-between gap-1.5 px-1">
        {/* Rating and Reviews count */}
        <div className="flex items-center gap-1 text-[11px] font-black text-amber-500 shrink-0">
          <Star className="w-3.5 h-3.5 fill-amber-500 stroke-none" />
          <span>{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
          <span className="text-[10px] text-muted-foreground font-semibold">({worker.reviews || 0})</span>
        </div>

        {/* Action Pill Button (Shopnest Style) */}
        <Link
          href={`/client/worker/${worker.id}`}
          prefetch={true}
          onMouseEnter={primeCache}
          onTouchStart={primeCache}
          onClick={primeCache}
          className="rounded-full bg-[#a3e635] text-black font-black text-xs h-7 sm:h-8 px-3.5 inline-flex items-center justify-center gap-1 hover:opacity-90 active:scale-95 transition-all shadow-sm shrink-0 touch-manipulation"
        >
          <span>Hire</span>
          <ArrowRight className="w-3 h-3 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
