"use client";

import { useState } from "react";
import Link from "next/link";
import {
  WORKER_TRADE_BANNERS,
  ALL_TRADE_BANNERS,
  WorkerTradeKey,
  TradeBannerMeta,
  resolveTradeBanner,
} from "@/lib/trade-banners";
import {
  RiSettings4Line,
  RiPieChartLine,
  RiShareForwardLine,
  RiSparklingFill,
  RiCameraLine,
  RiCheckLine,
  RiCloseLine,
  RiShieldCheckFill,
} from "@remixicon/react";

interface WorkerTradeHeroBannerProps {
  user: {
    name: string;
    email: string;
    role: "client" | "worker";
    initials: string;
    avatarUrl?: string | null;
    is_verified?: boolean;
    dateOfBirth?: string;
  };
  skills?: string[] | string | null;
  bio?: string | null;
  totalJobs?: number | string;
  initialTradeKey?: WorkerTradeKey;
  onTradeChange?: (trade: TradeBannerMeta) => void;
  className?: string;
}

export default function WorkerTradeHeroBanner({
  user,
  skills,
  bio,
  totalJobs = "0",
  initialTradeKey,
  onTradeChange,
  className = "",
}: WorkerTradeHeroBannerProps) {
  const defaultMeta = initialTradeKey
    ? WORKER_TRADE_BANNERS[initialTradeKey]
    : resolveTradeBanner(skills, bio);

  const [activeTrade, setActiveTrade] = useState<TradeBannerMeta>(defaultMeta);
  const [showTradeMenu, setShowTradeMenu] = useState(false);

  const handleSelectTrade = (trade: TradeBannerMeta) => {
    setActiveTrade(trade);
    setShowTradeMenu(false);
    if (onTradeChange) {
      onTradeChange(trade);
    }
  };

  const isWorker = user.role === "worker";
  const settingsHref = isWorker ? "/worker/profile/settings" : "/client/profile/settings";
  const statsHref = isWorker ? "/worker/earnings" : "/client/dashboard";

  return (
    <div className={`w-full font-['Inter',system-ui,sans-serif] ${className}`}>
      {/* ── 1. CLEAN COVER HERO BANNER (Full-bleed trade hero, pure image, rounded corners) ── */}
      <div className="relative w-full h-52 sm:h-64 md:h-72 rounded-[2.5rem] overflow-hidden bg-background-secondary-default shadow-xl border border-border-button-default">
        {/* Pure High-Resolution Cover Image - NO text overlaid */}
        <img
          src={activeTrade.bannerUrl}
          alt={activeTrade.alt}
          className="w-full h-full object-cover select-none"
        />

        {/* Minimal Subtle Edge Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35 pointer-events-none" />

        {/* Top-Right Change Cover Photo Button (Discrete & Clean) */}
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={() => setShowTradeMenu((prev) => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-lg active:scale-95 transition-all cursor-pointer"
            title="Change trade cover hero"
          >
            <RiCameraLine className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Change Cover</span>
          </button>
        </div>

        {/* Dropdown to change trade banner */}
        {showTradeMenu && (
          <div className="absolute top-14 right-4 z-30 w-64 bg-background-primary-default/95 backdrop-blur-xl border border-border-button-default rounded-2xl p-2 shadow-2xl text-text-primary space-y-1 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-text-tertiary border-b border-separator-border">
              <span>Select Trade Cover</span>
              <button
                type="button"
                onClick={() => setShowTradeMenu(false)}
                className="text-text-tertiary hover:text-text-primary"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            </div>
            {ALL_TRADE_BANNERS.map((trade) => {
              const isSelected = activeTrade.key === trade.key;
              return (
                <button
                  key={trade.key}
                  type="button"
                  onClick={() => handleSelectTrade(trade)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-accent-500/15 text-accent-700 dark:text-accent-300 font-bold"
                      : "text-text-secondary hover:bg-background-secondary-default hover:text-text-primary"
                  }`}
                >
                  <span className="truncate">{trade.shortTitle}</span>
                  {isSelected && <RiCheckLine className="w-4 h-4 text-accent-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 2. AVATAR & OVERLAPPING ACTION CONTROLS (Settings Cog - Avatar - Earnings Chart) ── */}
      <div className="relative -mt-14 sm:-mt-16 flex items-center justify-center gap-4 sm:gap-6 z-20 px-4">
        {/* Left Floating Circular Button: Settings Gear */}
        <Link
          href={settingsHref}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-background-primary-default hover:bg-background-secondary-default text-text-primary flex items-center justify-center shadow-xl border border-border-button-default active:scale-90 transition-all shrink-0 cursor-pointer"
          title="Account Settings"
          aria-label="Account Settings"
        >
          <RiSettings4Line className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" />
        </Link>

        {/* Center: Circular Profile Avatar with Share/Upload Action Icon */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-background bg-background-secondary-default shadow-2xl overflow-hidden flex items-center justify-center">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl sm:text-3xl font-black text-text-primary">
                {user.initials}
              </span>
            )}
          </div>

          {/* Small Share Badge on Avatar bottom-right */}
          <Link
            href={settingsHref}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-background-secondary-default hover:bg-background-tertiary-default text-text-primary flex items-center justify-center border-2 border-background shadow-md active:scale-90 transition-all cursor-pointer"
            title="Edit profile photo"
          >
            <RiShareForwardLine className="w-4 h-4 text-text-secondary" />
          </Link>
        </div>

        {/* Right Floating Circular Button: Pie Chart / Earnings Stats */}
        <Link
          href={statsHref}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-background-primary-default hover:bg-background-secondary-default text-text-primary flex items-center justify-center shadow-xl border border-border-button-default active:scale-90 transition-all shrink-0 cursor-pointer"
          title="Earnings & Analytics"
          aria-label="Earnings & Analytics"
        >
          <RiPieChartLine className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" />
        </Link>
      </div>

      {/* ── 3. CLEAN IDENTITY BLOCK (Trade Pill Badge, Big Bold Name, Fayda Verification) ── */}
      <div className="flex flex-col items-center text-center mt-3.5 space-y-1.5 px-4 mb-2">
        {/* Trade Role Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-accent-500/30 bg-accent-500/10 text-accent-700 dark:text-accent-300 text-xs font-bold uppercase tracking-wider">
          <RiSparklingFill className="w-3.5 h-3.5 text-accent-600 shrink-0" />
          <span>{activeTrade.shortTitle || "DireSkill Certified"}</span>
        </div>

        {/* Big Bold Clean Name */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
          {user.name}
        </h1>

        {/* ── Total Jobs Counter (Only Total Jobs kept; followers, likes, follow button, and chat removed) ── */}
        <div className="flex flex-col items-center justify-center pt-2">
          <span className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            {totalJobs}
          </span>
          <span className="text-[11px] font-bold text-text-secondary">
            Total Jobs
          </span>
        </div>

        {user.is_verified && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
            <RiShieldCheckFill className="size-3.5" />
            <span>Fayda Biometric Verified</span>
          </div>
        )}
      </div>
    </div>
  );
}
