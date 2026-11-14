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
  RiArrowRightLine,
  RiTimeLine,
  RiFlashlightFill,
  RiDropFill,
  RiPaintBrushFill,
  RiHomeGearFill,
  RiBroadcastFill,
  RiWrenchFill,
  RiCalendarCheckLine,
  RiEyeLine
} from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { Chip } from "@/components/base/badges/chip";
import { setCachedWorker } from "@/lib/workerCache";
import { cx } from "@/utils/cx";

interface WorkerCardProps {
  worker: Worker;
  className?: string;
  onPreview?: (worker: Worker) => void;
}

function getTradeIcon(skill: string) {
  const s = (skill || "").toLowerCase();
  if (s.includes("electr") || s.includes("wir")) return { icon: RiFlashlightFill, color: "text-amber-500", bg: "bg-amber-500/10" };
  if (s.includes("plumb") || s.includes("pipe")) return { icon: RiDropFill, color: "text-blue-500", bg: "bg-blue-500/10" };
  if (s.includes("paint")) return { icon: RiPaintBrushFill, color: "text-pink-500", bg: "bg-pink-500/10" };
  if (s.includes("dish") || s.includes("satell")) return { icon: RiBroadcastFill, color: "text-cyan-500", bg: "bg-cyan-500/10" };
  if (s.includes("finish") || s.includes("decor")) return { icon: RiHomeGearFill, color: "text-emerald-500", bg: "bg-emerald-500/10" };
  return { icon: RiWrenchFill, color: "text-[#45BA50]", bg: "bg-[#45BA50]/10" };
}

export default function WorkerCard({ worker, className = "", onPreview }: WorkerCardProps) {
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
  const tradeMeta = getTradeIcon(worker.skill);
  const TradeIcon = tradeMeta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cx(
        "group relative flex flex-col bg-background-secondary-default border border-border-button-default",
        "hover:border-[#45BA50]/60 rounded-3xl p-3.5 sm:p-4 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
        className
      )}
    >
      {/* ── Top Photo & Status Badges Container ── */}
      <div className="relative w-full aspect-[4/3.2] rounded-2xl overflow-hidden bg-background-tertiary-default shrink-0">
        <Link 
          href={`/client/worker/${worker.id}`}
          prefetch={true}
          onMouseEnter={primeCache}
          onTouchStart={primeCache}
          className="block w-full h-full"
        >
          <img
            src={displayPhoto}
            alt={worker.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Floating Trade Skill Pill with Icon */}
        <div className="absolute top-2.5 start-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white border border-white/15 shadow-sm">
          <TradeIcon className={cx("w-3.5 h-3.5", tradeMeta.color)} />
          <span className="text-[10px] font-black uppercase tracking-wider">{worker.skill}</span>
        </div>

        {/* Live Distance Pill */}
        {worker.distance !== "N/A" && (
          <div className="absolute top-2.5 end-2.5 px-2.5 py-1 rounded-full bg-[#134e27]/90 backdrop-blur-md text-[#a4fe47] border border-[#45BA50]/40 shadow-sm flex items-center gap-1">
            <RiMapPinLine className="w-3 h-3" />
            <span className="text-[10px] font-black">{worker.distance} km</span>
          </div>
        )}

        {/* Bottom Photo Overlay: Quick Availability Tag */}
        <div className="absolute bottom-2 start-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-medium border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-[#45BA50] animate-pulse" />
          <span>Available Today</span>
        </div>
      </div>

      {/* ── Middle Info: Name, Verified Badge & Location ── */}
      <div className="pt-3 pb-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <Link 
              href={`/client/worker/${worker.id}`}
              prefetch={true}
              onMouseEnter={primeCache}
              onTouchStart={primeCache}
              className="group/link flex items-center gap-1.5 min-w-0"
            >
              <h3 className="text-body-medium font-bold text-text-primary truncate group-hover/link:text-[#45BA50] transition-colors">
                {worker.name}
              </h3>
              {worker.isVerified && (
                <span 
                  className="shrink-0 inline-flex items-center justify-center text-[#45BA50]"
                  title={t("search.verifiedProfessional") || "Kebele & Fayda Verified Pro"}
                >
                  <RiShieldCheckFill className="w-4 h-4" />
                </span>
              )}
            </Link>

            {/* Neighborhood / Kebele */}
            <p className="text-caption-1-semibold text-text-tertiary flex items-center gap-1 mt-0.5 truncate">
              <RiMapPinLine className="w-3 h-3 text-text-placeholder shrink-0" />
              <span>Dire Dawa · {worker.district || "Kezira"}</span>
            </p>
          </div>

          {/* Rate Display */}
          <div className="text-end shrink-0">
            <p className="text-title-3-semibold font-black text-text-primary leading-tight">
              ETB {worker.hourlyRate || "450"}
            </p>
            <span className="text-[10px] text-text-tertiary font-medium">per hour</span>
          </div>
        </div>

        {/* Bio Snippet */}
        <p className="text-body-regular text-text-secondary line-clamp-2 leading-snug text-xs mt-0.5">
          {worker.bio || `Certified ${worker.skill} specialist serving residences & businesses across Dire Dawa.`}
        </p>

        {/* Skill Tags */}
        <div className="flex flex-wrap items-center gap-1 mt-1">
          {(worker.skills && worker.skills.length > 0 ? worker.skills.slice(0, 3) : [worker.skill]).map((sk) => (
            <Chip key={sk} variant="caption" color="soft" className="text-[10px] font-semibold">
              {sk}
            </Chip>
          ))}
        </div>
      </div>

      {/* ── Card Bottom: Rating, Reviews & Dual Action CTAs ── */}
      <div className="pt-3 mt-auto border-t border-separator-border flex items-center justify-between gap-2">
        {/* Rating and Reviews Counter */}
        <div className="flex items-center gap-1 text-amber-500 shrink-0">
          <RiStarFill className="w-4 h-4 fill-amber-500" />
          <span className="text-body-medium font-bold text-text-primary">
            {worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}
          </span>
          <span className="text-[11px] text-text-tertiary font-medium">
            ({worker.reviews || 0})
          </span>
        </div>

        {/* Actions Button Group */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onPreview && (
            <button
              type="button"
              onClick={() => onPreview(worker)}
              className="h-8 px-2.5 rounded-lg border border-border-button-default bg-background-tertiary-default hover:bg-background-tertiary-default/80 text-text-primary text-xs font-semibold flex items-center gap-1 transition-colors active:scale-95"
              title="Quick Preview"
            >
              <RiEyeLine className="w-3.5 h-3.5 text-text-secondary" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          )}

          <Link
            href={`/client/contract/new?workerId=${worker.id}`}
            prefetch={true}
            onMouseEnter={primeCache}
            onTouchStart={primeCache}
            className="h-8 px-3.5 rounded-lg bg-[#45BA50] hover:bg-[#3ca346] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-[0_2px_8px_rgba(69,186,80,0.3)] active:scale-95 transition-all touch-manipulation"
          >
            <span>Book Pro</span>
            <RiArrowRightLine className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
