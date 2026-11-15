"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Worker } from "./types";
import { useLanguage } from "@/context/LanguageContext";
import { 
  RiStarFill, 
  RiCheckboxCircleFill, 
  RiBriefcaseLine,
  RiMapPinLine, 
  RiFlashlightFill,
  RiDropFill,
  RiPaintBrushFill,
  RiHomeGearFill,
  RiBroadcastFill,
  RiWrenchFill
} from "@remixicon/react";
import { setCachedWorker } from "@/lib/workerCache";
import { cx } from "@/utils/cx";

interface WorkerCardProps {
  worker: Worker;
  isSelected?: boolean;
  onSelect?: (worker: Worker) => void;
  onPreview?: (worker: Worker) => void;
  onMessage?: (worker: Worker) => void;
  variant?: "grid" | "compact";
  className?: string;
}

function getTradeMeta(skill: string) {
  const s = (skill || "").toLowerCase();
  if (s.includes("electr") || s.includes("wir")) return { icon: RiFlashlightFill, color: "text-amber-500", bg: "bg-amber-500/10", label: "Electrical" };
  if (s.includes("plumb") || s.includes("pipe")) return { icon: RiDropFill, color: "text-blue-500", bg: "bg-blue-500/10", label: "Plumber" };
  if (s.includes("paint")) return { icon: RiPaintBrushFill, color: "text-pink-500", bg: "bg-pink-500/10", label: "Painter" };
  if (s.includes("dish") || s.includes("satell")) return { icon: RiBroadcastFill, color: "text-cyan-500", bg: "bg-cyan-500/10", label: "Satellite Dish" };
  if (s.includes("finish") || s.includes("decor")) return { icon: RiHomeGearFill, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "House Finishing" };
  return { icon: RiWrenchFill, color: "text-[#45BA50]", bg: "bg-[#45BA50]/10", label: skill || "Artisan" };
}

export default function WorkerCard({
  worker,
  isSelected = false,
  onSelect,
  onPreview,
  onMessage,
  variant = "compact",
  className = "",
}: WorkerCardProps) {
  const { t } = useLanguage();
  const [imgError, setImgError] = useState(false);

  const primeCache = () => {
    setCachedWorker(String(worker.id), {
      worker: {
        id: String(worker.id),
        email: "",
        full_name: worker.name,
        bio: worker.bio,
        skills: worker.skills || [worker.skill],
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

  const tradeMeta = getTradeMeta(worker.skill);
  const TradeIcon = tradeMeta.icon;

  // Curated reliable portrait fallback
  const fallbackImg = `/images/worker_holding_card.png`;
  const displayPhoto = (!imgError && worker.photo && worker.photo !== "/default-avatar.svg")
    ? worker.photo
    : fallbackImg;

  const handleClick = () => {
    primeCache();
    onSelect?.(worker);
  };

  /* ═════════════════════════════════════════════════════════════════════
     1. TALL EDITORIAL PROFILE CARD (Search Results Grid View)
     - Increased height with generous vertical breathing room
     - Taller prominent portrait on top
     - Name + Kebele/Fayda Verified Checkmark
     - Multi-trade specialty skill pills
     - 2-line bio preview for artisan context
     - Location & hourly rate info row
     - Dual actions: Preview Profile + Book / Message
     ═════════════════════════════════════════════════════════════════════ */
  if (variant === "grid") {
    const skillsList = worker.skills && worker.skills.length > 0 ? worker.skills : [tradeMeta.label];

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => {
          primeCache();
          onPreview?.(worker);
        }}
        onMouseEnter={primeCache}
        onTouchStart={primeCache}
        className={cx(
          "group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl select-none transition-all duration-300 border cursor-pointer min-h-[385px] sm:min-h-[415px]",
          "bg-white dark:bg-zinc-900/90 hover:bg-slate-50 dark:hover:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-[#45BA50]/50 shadow-xs hover:shadow-md",
          isSelected && "ring-2 ring-[#45BA50] border-[#45BA50]",
          className
        )}
      >
        <div className="space-y-3">
          {/* Top: Large Rounded Portrait Image (Taller for editorial breathing space) */}
          <div className="relative w-full aspect-[4/3.5] sm:aspect-[4/3.3] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 border border-slate-200/60 dark:border-zinc-800/80">
            <img
              src={displayPhoto}
              alt={worker.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Trade Badge Overlay */}
            <div className="absolute top-2.5 end-2.5 px-2.5 py-1 rounded-full bg-[#09090b]/80 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <TradeIcon className={cx("w-3 h-3", tradeMeta.color)} />
              <span>{tradeMeta.label}</span>
            </div>

            {/* Price Badge Overlay (Bottom Left) */}
            <div className="absolute bottom-2.5 start-2.5 px-2.5 py-0.5 rounded-full bg-[#09090b]/80 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-[11px] font-black shadow-xs">
              <span>ETB {worker.hourlyRate || "450"}</span>
              <span className="text-zinc-400 font-normal text-[9px] ms-0.5">/hr</span>
            </div>
          </div>

          {/* Identity & Rating Row */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-[#45BA50] transition-colors">
                  {worker.name}
                </h3>
                {worker.isVerified && (
                  <span className="shrink-0 text-[#45BA50]" title="Kebele & Fayda Verified Artisan">
                    <RiCheckboxCircleFill className="w-4 h-4 fill-[#45BA50]" />
                  </span>
                )}
              </div>

              {/* Star Rating & Review count */}
              <div className="flex items-center gap-1 text-xs shrink-0 font-bold text-slate-900 dark:text-white">
                <RiStarFill className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
                <span className="text-zinc-400 font-normal text-[11px]">({worker.reviews || 12})</span>
              </div>
            </div>

            {/* Trade Specialty Skills Pills */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {skillsList.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700/60"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* 2-Line Bio Description */}
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed pt-0.5">
              {worker.bio || `Certified ${tradeMeta.label.toLowerCase()} artisan serving clients across ${worker.district || "Dire Dawa"} with milestone-protected contracts.`}
            </p>

            {/* District & Distance metadata */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 pt-0.5">
              <span className="flex items-center gap-0.5 font-medium text-slate-700 dark:text-zinc-300">
                <RiMapPinLine className="w-3 h-3 text-[#45BA50] shrink-0" />
                <span>{worker.district || "Dire Dawa"}</span>
              </span>
              <span>•</span>
              <span>{worker.distance !== "N/A" ? `${worker.distance} km away` : "Available now"}</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions Row: Preview & Book Dual Controls */}
        <div className="mt-3.5 pt-3 border-t border-slate-200/70 dark:border-zinc-800/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              primeCache();
              onPreview?.(worker);
            }}
            className="flex-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold py-2 shadow-xs transition-all active:scale-95 cursor-pointer text-center"
            title="Preview full profile"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              primeCache();
              if (onMessage) {
                onMessage(worker);
              } else {
                onSelect?.(worker);
              }
            }}
            className="flex-1 rounded-xl bg-[#45BA50] hover:bg-[#3ea847] text-white text-xs font-bold py-2 shadow-xs transition-all active:scale-95 cursor-pointer text-center"
            title="Book or message artisan"
          >
            Hire / Message
          </button>
        </div>
      </motion.div>
    );
  }

  /* ═════════════════════════════════════════════════════════════════════
     2. COMPACT ROW (For Ride-Hailing Map View / Bottom Sheet)
     - Zinc-layered palette with smooth dark mode harmony
     ═════════════════════════════════════════════════════════════════════ */
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      onMouseEnter={primeCache}
      onTouchStart={primeCache}
      className={cx(
        "group relative flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl cursor-pointer select-none transition-all duration-200 border",
        isSelected
          ? "bg-[#134e27]/10 dark:bg-[#134e27]/25 border-[#45BA50] shadow-[0_0_0_1.5px_#45BA50]"
          : "bg-white dark:bg-zinc-900/90 hover:bg-slate-50 dark:hover:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 shadow-xs",
        className
      )}
    >
      {/* Left: Compact Avatar with Trade Badge */}
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 border border-slate-200/60 dark:border-zinc-800">
        <img
          src={displayPhoto}
          alt={worker.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shadow-xs">
          <TradeIcon className={cx("w-3 h-3", tradeMeta.color)} />
        </div>
      </div>

      {/* Center: Artisan Identity, Kebele & Distance */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#45BA50] transition-colors">
            {worker.name}
          </h3>
          {worker.isVerified && (
            <span 
              className="shrink-0 text-[#45BA50]"
              title={t("search.verifiedProfessional") || "Kebele & Fayda Verified Pro"}
            >
              <RiCheckboxCircleFill className="w-3.5 h-3.5 fill-[#45BA50]" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
          <span className="flex items-center gap-0.5 text-slate-700 dark:text-zinc-300">
            <RiMapPinLine className="w-3 h-3 text-[#45BA50] shrink-0" />
            {worker.district || "Kezira"}
          </span>
          <span>•</span>
          <span>{worker.distance !== "N/A" ? `${worker.distance} km away` : "Dire Dawa"}</span>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
          {tradeMeta.label}
        </p>
      </div>

      {/* Right: Price & Status Pill */}
      <div className="text-end shrink-0 flex flex-col items-end gap-1">
        <div>
          <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
            ETB {worker.hourlyRate || "450"}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">/hr</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <RiStarFill className="w-3 h-3 fill-amber-500" />
          <span>{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
        </div>
      </div>
    </motion.div>
  );
}
