"use client";

import { ViewMode, SearchFilters as FilterType } from "./types";
import { useLanguage } from "@/context/LanguageContext";
import { Chip } from "@/components/base/badges/chip";
import { Counter } from "@/components/base/badges/counter";
import { Button } from "@/components/base/buttons/button";
import { Switch } from "@/components/base/switch/switch";
import { 
  RiEqualizerLine,
  RiStarFill,
  RiCompassLine,
  RiRestartLine,
  RiCloseLine,
  RiShieldCheckFill,
  RiFlashlightFill,
  RiDropFill,
  RiPaintBrushFill,
  RiBroadcastFill,
  RiHomeGearFill,
  RiAppsLine,
  RiMapPinLine,
  RiMoneyDollarCircleLine
} from "@remixicon/react";
import { cx } from "@/utils/cx";

interface SearchFiltersProps {
  filters: FilterType;
  setFilters: (f: FilterType | ((prev: FilterType) => FilterType)) => void;
  viewMode?: ViewMode;
  setViewMode?: (v: ViewMode) => void;
  resultsCount: number;
  onClose?: () => void;
  onApply?: () => void;
  className?: string;
  isDrawer?: boolean;
}

// 5 Active Trades strictly (No coming soon trades)
const CATEGORIES = [
  { label: "All Trades", value: "", icon: RiAppsLine, color: "text-text-primary" },
  { label: "Electrical", value: "electrical", icon: RiFlashlightFill, color: "text-amber-500" },
  { label: "Plumber", value: "plumbing", icon: RiDropFill, color: "text-blue-500" },
  { label: "Painter", value: "painting", icon: RiPaintBrushFill, color: "text-pink-500" },
  { label: "House Finishing", value: "house_finishing", icon: RiHomeGearFill, color: "text-emerald-500" },
  { label: "Satellite Dish", value: "satellite_dish", icon: RiBroadcastFill, color: "text-cyan-500" },
];

const RATING_PRESETS = [
  { label: "Any Rating", value: 0 },
  { label: "3.5+ ★", value: 3.5 },
  { label: "4.0+ ★", value: 4.0 },
  { label: "4.5+ ★", value: 4.5 },
];

const DISTANCE_PRESETS = [5, 10, 25, 50];

const KEBELES = [
  "All Dire Dawa",
  "Kezira",
  "Sabian",
  "Megala",
  "Gende Kore",
  "Addis Ketema"
];

export default function SearchFilters({
  filters,
  setFilters,
  resultsCount,
  onClose,
  onApply,
  className = "",
  isDrawer = false,
}: SearchFiltersProps) {
  const { t } = useLanguage();

  const handleReset = () => {
    setFilters({
      query: "",
      category: "",
      minRating: 0,
      maxDistance: 50,
      sortBy: "Nearest",
      verifiedOnly: false,
    });
  };

  const activeCount = [
    Boolean(filters.category),
    Boolean(filters.minRating > 0),
    Boolean(filters.maxDistance && filters.maxDistance < 50),
    Boolean(filters.verifiedOnly),
    Boolean(filters.query),
  ].filter(Boolean).length;

  return (
    <div className={cx("space-y-4 select-none", className)}>
      {/* ── Header Title Block ── */}
      <div className="flex items-center justify-between pb-2 border-b border-separator-border">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#134e27] text-[#a4fe47] flex items-center justify-center shrink-0 border border-[#45BA50]/30 shadow-xs">
            <RiEqualizerLine className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-body-medium font-bold text-text-primary leading-tight">
              {t("search.refine") || "Filter Artisans"}
            </h3>
            <p className="text-caption-1-semibold text-text-tertiary">
              {resultsCount} {t("search.found") || "pros"} matching criteria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#134e27] text-[#a4fe47] border border-[#45BA50]/30">
              {activeCount} active
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg bg-background-tertiary-default text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors shrink-0"
              title="Close Filters"
            >
              <RiCloseLine className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Verified Pros Toggle (Using BoardUI Switch) ── */}
      <div className="flex items-center justify-between p-3 rounded-2xl border border-border-button-default bg-background-primary-default hover:border-[#45BA50]/40 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className={cx(
            "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 transition-colors",
            filters.verifiedOnly ? "bg-[#45BA50] text-white" : "bg-background-tertiary-default text-text-tertiary"
          )}>
            <RiShieldCheckFill className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-body-medium font-bold text-text-primary leading-tight">Verified Artisans Only</p>
            <p className="text-caption-1-semibold text-text-tertiary truncate">Kebele & Fayda ID verified</p>
          </div>
        </div>

        <Switch
          isSelected={Boolean(filters.verifiedOnly)}
          onChange={(checked) => setFilters(f => ({ ...f, verifiedOnly: checked }))}
          aria-label="Toggle Verified Artisans Only"
        />
      </div>

      {/* ── 5 Active Trades Selector ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-caption-1-semibold text-text-tertiary font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <RiAppsLine className="w-3.5 h-3.5 text-[#45BA50]" /> Active Trade
          </span>
          {filters.category && (
            <button
              onClick={() => setFilters(f => ({ ...f, category: "" }))}
              className="text-[10px] text-[#45BA50] hover:underline font-bold"
            >
              Reset
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = (!filters.category && cat.value === "") || filters.category === cat.value;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setFilters(f => ({ ...f, category: cat.value }))}
                className={cx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-caption-1-semibold font-bold text-start transition-all active:scale-95 border",
                  isSelected
                    ? "bg-[#45BA50] text-white border-[#45BA50] shadow-sm font-black"
                    : "bg-background-primary-default border-border-button-default text-text-primary hover:bg-background-tertiary-default"
                )}
              >
                <Icon className={cx("w-4 h-4 shrink-0", isSelected ? "text-white" : cat.color)} />
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Minimum Rating Filter ── */}
      <div className="space-y-2 pt-1 border-t border-separator-border">
        <div className="flex items-center justify-between text-caption-1-semibold text-text-tertiary font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <RiStarFill className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Minimum Rating
          </span>
          <span className="font-black text-amber-500 text-xs">
            {filters.minRating > 0 ? `${filters.minRating.toFixed(1)} ★` : "Any"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {RATING_PRESETS.map((preset) => {
            const isSelected = (filters.minRating || 0) === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => setFilters(f => ({ ...f, minRating: preset.value }))}
                className={cx(
                  "px-3 py-1.5 rounded-lg text-caption-1-semibold font-bold transition-all active:scale-95 border text-center",
                  isSelected
                    ? "bg-amber-500 text-black border-amber-500 font-black shadow-xs"
                    : "bg-background-primary-default border-border-button-default text-text-primary hover:bg-background-tertiary-default"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Distance Radius Slider ── */}
      <div className="space-y-2 pt-1 border-t border-separator-border">
        <div className="flex items-center justify-between text-caption-1-semibold text-text-tertiary font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <RiCompassLine className="w-3.5 h-3.5 text-[#45BA50]" /> Maximum Distance
          </span>
          <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-[#134e27] text-[#a4fe47] border border-[#45BA50]/30">
            {filters.maxDistance || 50} km
          </span>
        </div>
        
        <input 
          type="range" min="1" max="50" step="1"
          value={filters.maxDistance || 50}
          onChange={(e) => setFilters(f => ({ ...f, maxDistance: parseInt(e.target.value) }))}
          className="w-full h-1.5 bg-background-tertiary-default rounded-full appearance-none cursor-pointer accent-[#45BA50] border border-border-button-default"
        />

        <div className="flex items-center justify-between gap-1 pt-0.5">
          {DISTANCE_PRESETS.map((dist) => (
            <button
              key={dist}
              type="button"
              onClick={() => setFilters(f => ({ ...f, maxDistance: dist }))}
              className={cx(
                "flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-95",
                filters.maxDistance === dist
                  ? "bg-[#134e27] text-[#a4fe47] border-[#45BA50]"
                  : "bg-background-primary-default border-border-button-default text-text-tertiary hover:bg-background-tertiary-default"
              )}
            >
              {dist} km
            </button>
          ))}
        </div>
      </div>

      {/* ── Sort By Selection ── */}
      <div className="space-y-2 pt-1 border-t border-separator-border">
        <p className="text-caption-1-semibold text-text-tertiary font-bold uppercase tracking-wider">Sort Results</p>
        <div className="grid grid-cols-3 gap-1.5">
          {(["Nearest", "Highest Rated", "Most Reviewed"] as const).map((opt) => {
            const isSelected = (filters.sortBy || "Nearest") === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setFilters(f => ({ ...f, sortBy: opt }))}
                className={cx(
                  "py-1.5 px-2 rounded-lg text-[10px] font-bold border text-center transition-all active:scale-95 truncate",
                  isSelected
                    ? "bg-[#134e27] text-[#a4fe47] border-[#45BA50] font-black"
                    : "bg-background-primary-default border-border-button-default text-text-secondary hover:bg-background-tertiary-default"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Footer Actions (BoardUI Button) ── */}
      <div className="pt-2 border-t border-separator-border flex items-center gap-2">
        <button
          onClick={handleReset}
          className="h-10 px-3.5 rounded-lg border border-border-button-default bg-background-primary-default hover:bg-background-tertiary-default text-text-primary text-xs font-bold inline-flex items-center gap-1.5 transition-colors active:scale-95"
        >
          <RiRestartLine className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        {onApply ? (
          <button
            onClick={onApply}
            className="flex-1 h-10 px-4 rounded-lg bg-[#45BA50] hover:bg-[#3ca346] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(69,186,80,0.3)] active:scale-95 transition-all"
          >
            Apply ({resultsCount} Pros)
          </button>
        ) : (
          <div className="flex-1 text-end text-caption-1-semibold text-text-tertiary">
            {resultsCount} matching pros
          </div>
        )}
      </div>
    </div>
  );
}
