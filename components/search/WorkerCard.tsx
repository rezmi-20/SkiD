"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Worker } from "./types";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { 
  RiStarFill, 
  RiShieldCheckFill, 
  RiMapPinLine, 
  RiFlashlightFill,
  RiDropFill,
  RiPaintBrushFill,
  RiHomeGearFill,
  RiBroadcastFill,
  RiWrenchFill,
  RiArrowRightLine,
  RiEyeLine,
  RiChat1Line
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

  const fallbackImg = `/default-avatar.svg`;
  const displayPhoto = imgError ? fallbackImg : (worker.photo || fallbackImg);
  const tradeMeta = getTradeMeta(worker.skill);
  const TradeIcon = tradeMeta.icon;

  const handleClick = () => {
    primeCache();
    onSelect?.(worker);
  };

  /* ═════════════════════════════════════════════════════════════════════
     1. TALL PROFILE CARD (For 4-Column Responsive List Grid)
     - Added height for pro photo, details, bio, skills
     - Direct Preview, Message, and Book buttons
     ═════════════════════════════════════════════════════════════════════ */
  if (variant === "grid") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onMouseEnter={primeCache}
        onTouchStart={primeCache}
        className={cx(
          "group relative flex flex-col justify-between p-4 sm:p-5 rounded-3xl select-none transition-all duration-200 border",
          "bg-background-secondary-default hover:bg-background-tertiary-default/50 border-border-button-default hover:border-[#45BA50]/50 shadow-xs hover:shadow-md",
          "min-h-[350px] w-full",
          isSelected && "ring-2 ring-[#45BA50] border-[#45BA50]",
          className
        )}
      >
        <div>
          {/* Top Row: Avatar with Trade Icon + Price & Rating */}
          <div className="flex items-start justify-between gap-3 mb-3.5">
            {/* Avatar */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-background-tertiary-default shrink-0 border border-border-button-default shadow-xs">
              <img
                src={displayPhoto}
                alt={worker.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background-primary-default border border-border-button-default flex items-center justify-center shadow-xs">
                <TradeIcon className={cx("w-3.5 h-3.5", tradeMeta.color)} />
              </div>
            </div>

            {/* Price & Rating */}
            <div className="text-end flex flex-col items-end gap-1">
              <div>
                <p className="text-title-3-semibold font-black text-text-primary leading-tight">
                  ETB {worker.hourlyRate || "450"}
                </p>
                <span className="text-[10px] text-text-tertiary font-medium">/hr</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <RiStarFill className="w-3 h-3 fill-amber-500" />
                <span>{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
                <span className="text-text-tertiary font-normal">({worker.reviews || 1})</span>
              </div>
            </div>
          </div>

          {/* Pro Identity & Verification Check */}
          <div className="space-y-1 mb-2.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-body-medium font-bold text-text-primary truncate group-hover:text-[#45BA50] transition-colors">
                {worker.name}
              </h3>
              {worker.isVerified && (
                <span 
                  className="shrink-0 text-[#45BA50]"
                  title={t("search.verifiedProfessional") || "Kebele & Fayda National ID Verified"}
                >
                  <RiShieldCheckFill className="w-4 h-4" />
                </span>
              )}
            </div>

            {/* Trade & Kebele Location */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-tertiary">
              <span className={cx("px-2 py-0.5 rounded-md text-[11px] font-bold", tradeMeta.bg, tradeMeta.color)}>
                {tradeMeta.label}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-0.5 text-text-secondary text-[11px] font-semibold">
                <RiMapPinLine className="w-3 h-3 text-[#45BA50]" />
                {worker.district || "Kezira"}
              </span>
              <span>•</span>
              <span className="text-[11px]">{worker.distance !== "N/A" ? `${worker.distance} km` : "Dire Dawa"}</span>
            </div>
          </div>

          {/* Bio Snippet */}
          <p className="text-caption-1-semibold text-text-tertiary line-clamp-2 text-xs leading-relaxed mb-3">
            {worker.bio || `Certified and experienced ${tradeMeta.label.toLowerCase()} pro serving Dire Dawa with high customer satisfaction.`}
          </p>

          {/* Verified Skills Tags */}
          {worker.skills && worker.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {worker.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-background-primary-default border border-border-button-default text-[10px] font-medium text-text-secondary">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom Actions Row: Preview & Message Options ── */}
        <div className="pt-3 border-t border-separator-border/60 space-y-2 mt-auto">
          <div className="flex items-center gap-2">
            {/* Option: Preview */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                primeCache();
                onPreview?.(worker);
              }}
              className="flex-1 h-9 rounded-xl border border-border-button-default bg-background-primary-default hover:bg-background-tertiary-default text-text-primary text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
              title="Quick Preview Profile"
            >
              <RiEyeLine className="w-3.5 h-3.5 text-text-secondary" />
              <span>Preview</span>
            </button>

            {/* Option: Message */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                primeCache();
                onMessage?.(worker);
              }}
              className="flex-1 h-9 rounded-xl border border-[#45BA50]/30 bg-[#134e27]/15 hover:bg-[#134e27]/25 text-[#45BA50] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
              title="Send Direct Message"
            >
              <RiChat1Line className="w-3.5 h-3.5" />
              <span>Message</span>
            </button>
          </div>

          {/* Direct Booking CTA Button */}
          <Link
            href={`/client/contract/new?workerId=${worker.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-10 rounded-xl bg-[#45BA50] hover:bg-[#3ca346] text-white text-xs font-black inline-flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(69,186,80,0.3)] transition-all cursor-pointer active:scale-95"
          >
            <span>Book Artisan</span>
            <RiArrowRightLine className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>
    );
  }

  /* ═════════════════════════════════════════════════════════════════════
     2. COMPACT ROW (For Ride-Hailing Map Bottom Sheet)
     - Preserves the Image 2 Uber/Sky Comfort style row for Map View
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
              <RiShieldCheckFill className="w-3.5 h-3.5" />
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
