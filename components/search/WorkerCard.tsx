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
     1. MINIMALIST EDITORIAL PROFILE CARD (Direct 1:1 with Alex Clinton Reference Photo)
     - Prominent rounded portrait on top
     - Clean Name + Green Verified Checkmark
     - 1-line clean subtitle
     - Bottom row: Stats (Rating, Jobs) + Pill Button [Preview +]
     - Full data accessible on click via Quick Preview modal
     ═════════════════════════════════════════════════════════════════════ */
  if (variant === "grid") {
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
          "group relative flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl select-none transition-all duration-300 border cursor-pointer min-h-[295px] sm:min-h-[305px]",
          "bg-background-secondary-default hover:bg-background-tertiary-default/60 border-border-button-default hover:border-[#45BA50]/50 shadow-xs hover:shadow-md",
          isSelected && "ring-2 ring-[#45BA50] border-[#45BA50]",
          className
        )}
      >
        <div>
          {/* Top: Large Rounded Portrait Image (Taller on mobile for better breathing space) */}
          <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-background-tertiary-default shrink-0 border border-border-button-default/50">
            <img
              src={displayPhoto}
              alt={worker.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Subtle Trade Badge Overlay */}
            <div className="absolute top-2 end-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[9px] sm:text-[10px] font-bold flex items-center gap-1 shadow-xs">
              <TradeIcon className={cx("w-2.5 h-2.5 sm:w-3 sm:h-3", tradeMeta.color)} />
              <span>{tradeMeta.label}</span>
            </div>
          </div>

          {/* Middle: Name + Green Verified Badge & Clean 1-Line Subtitle */}
          <div className="mt-2.5 sm:mt-3 space-y-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-xs sm:text-body-medium font-bold text-text-primary truncate group-hover:text-[#45BA50] transition-colors">
                {worker.name}
              </h3>
              {worker.isVerified && (
                <span className="shrink-0 text-[#45BA50]" title="Kebele & Fayda Verified Artisan">
                  <RiCheckboxCircleFill className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#45BA50]" />
                </span>
              )}
            </div>

            <p className="text-[10px] sm:text-xs text-text-tertiary line-clamp-1 leading-relaxed">
              {worker.bio || `Certified ${tradeMeta.label.toLowerCase()} pro in ${worker.district || "Dire Dawa"}.`}
            </p>
          </div>
        </div>

        {/* Bottom Row: Stats (Left) + Pill Button (Right) matching Reference Photo */}
        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-separator-border/60 flex items-center justify-between gap-1.5">
          {/* Left Stats: Rating & Completed Jobs */}
          <div className="flex items-center gap-2 sm:gap-2.5 text-[10px] sm:text-xs text-text-tertiary">
            <span className="flex items-center gap-0.5 sm:gap-1 font-bold text-text-primary">
              <RiStarFill className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-500" />
              <span>{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
            </span>
            <span className="flex items-center gap-0.5 sm:gap-1 font-medium text-text-secondary">
              <RiBriefcaseLine className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-text-tertiary" />
              <span>{worker.reviews || 12}</span>
            </span>
          </div>

          {/* Right Action: Pill Button [Preview +] */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              primeCache();
              onPreview?.(worker);
            }}
            className="rounded-full border border-border-button-default bg-background-primary-default hover:bg-[#134e27]/10 hover:border-[#45BA50] hover:text-[#45BA50] text-text-primary text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
            title="Preview full profile"
          >
            <span>Preview</span>
            <span className="text-[#45BA50] font-black">+</span>
          </button>
        </div>
      </motion.div>
    );
  }

  /* ═════════════════════════════════════════════════════════════════════
     2. COMPACT ROW (For Ride-Hailing Map View / Bottom Sheet)
     - Clean compact row with quick action triggers
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
          : "bg-background-secondary-default hover:bg-background-tertiary-default border-border-button-default shadow-xs",
        className
      )}
    >
      {/* Left: Compact Avatar with Trade Badge */}
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-background-tertiary-default shrink-0 border border-border-button-default">
        <img
          src={displayPhoto}
          alt={worker.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background-primary-default border border-border-button-default flex items-center justify-center shadow-xs">
          <TradeIcon className={cx("w-3 h-3", tradeMeta.color)} />
        </div>
      </div>

      {/* Center: Artisan Identity, Kebele & Distance */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className="text-body-medium font-bold text-text-primary truncate group-hover:text-[#45BA50] transition-colors">
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

        <div className="flex items-center gap-1.5 text-caption-1-semibold text-text-tertiary mt-0.5 truncate">
          <span className="flex items-center gap-0.5 text-text-secondary">
            <RiMapPinLine className="w-3 h-3 text-[#45BA50] shrink-0" />
            {worker.district || "Kezira"}
          </span>
          <span>•</span>
          <span>{worker.distance !== "N/A" ? `${worker.distance} km away` : "Dire Dawa"}</span>
        </div>

        <p className="text-[11px] text-text-tertiary truncate mt-0.5">
          {tradeMeta.label}
        </p>
      </div>

      {/* Right: Price & Status Pill */}
      <div className="text-end shrink-0 flex flex-col items-end gap-1">
        <div>
          <p className="text-body-medium font-black text-text-primary leading-tight">
            ETB {worker.hourlyRate || "450"}
          </p>
          <span className="text-[10px] text-text-tertiary font-medium">/hr</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <RiStarFill className="w-3 h-3 fill-amber-500" />
          <span>{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
        </div>
      </div>
    </motion.div>
  );
}
