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
  RiInformationLine
} from "@remixicon/react";
import { setCachedWorker } from "@/lib/workerCache";
import { cx } from "@/utils/cx";

interface WorkerCardProps {
  worker: Worker;
  isSelected?: boolean;
  onSelect?: (worker: Worker) => void;
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
