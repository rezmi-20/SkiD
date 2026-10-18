"use client";

import { ViewMode, SearchFilters as FilterType } from "./types";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  SlidersHorizontal, 
  Map, 
  List, 
  Star, 
  Compass, 
  RotateCcw,
  Sparkles,
  Layers,
  X,
  ShieldCheck,
  Zap,
  Droplets,
  Paintbrush,
  Wrench,
  Tv,
  Check
} from "lucide-react";

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

const CATEGORIES = [
  { label: "All Trades", value: "", icon: Layers },
  { label: "Electrician", value: "Electrician", icon: Zap },
  { label: "Plumber", value: "Plumber", icon: Droplets },
  { label: "Painter", value: "Painter", icon: Paintbrush },
  { label: "Carpentry", value: "Carpentry", icon: Wrench },
  { label: "Satellite Dish", value: "Satellite Dish", icon: Tv },
  { label: "House Finishing", value: "House Finishing", icon: Sparkles },
];

const RATING_PRESETS = [
  { label: "Any Rating", value: 0 },
  { label: "3.5+ ★", value: 3.5 },
  { label: "4.0+ ★", value: 4.0 },
  { label: "4.5+ ★", value: 4.5 },
];

const DISTANCE_PRESETS = [5, 10, 25, 50];

export default function SearchFilters({
  filters,
  setFilters,
  viewMode,
  setViewMode,
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
    <div className={`space-y-4 ${className}`}>
      {/* ── Header Title Block ── */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#181d24] text-[#a3e635] flex items-center justify-center shrink-0 shadow-sm">
            <SlidersHorizontal size={14} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-black text-sm text-foreground">
              {t("search.refine")}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              {resultsCount} {t("search.found")} in Dire Dawa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <Badge variant="outline" className="rounded-full text-[10px] font-bold border-[#a3e635]/40 bg-[#a3e635]/10 text-emerald-600 dark:text-[#a3e635] px-2.5 py-0.5">
              {activeCount} active
            </Badge>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shrink-0"
              title="Close Filters"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <Separator className="bg-outline-variant/40" />

      {/* ── Verified Pros Only Toggle ── */}
      <div
        onClick={() => setFilters(f => ({ ...f, verifiedOnly: !f.verifiedOnly }))}
        className="flex items-center justify-between p-3 rounded-2xl border border-outline-variant/60 bg-muted/30 dark:bg-muted/10 hover:border-[#a3e635]/40 transition-all cursor-pointer active:scale-[0.99] touch-manipulation group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            filters.verifiedOnly ? "bg-[#a3e635] text-black" : "bg-[#181d24] text-muted-foreground"
          }`}>
            <ShieldCheck size={16} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground">Verified Pros Only</p>
            <p className="text-[10px] text-muted-foreground truncate">Kebele / Fayda verified ID</p>
          </div>
        </div>
        <div className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
          filters.verifiedOnly ? "bg-[#a3e635]" : "bg-muted dark:bg-zinc-700"
        }`}>
          <div className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
            filters.verifiedOnly ? "translate-x-4" : "translate-x-0"
          }`} />
        </div>
      </div>

      {/* ── Service Categories ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers size={13} className="text-[#84cc16] dark:text-[#a3e635]" /> Trade Category
          </span>
          {filters.category && (
            <button
              onClick={() => setFilters(f => ({ ...f, category: "" }))}
              className="text-[10px] text-primary hover:underline font-bold"
            >
              Clear
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
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-left transition-all touch-manipulation active:scale-95 border ${
                  isSelected
                    ? "bg-[#a3e635] text-black border-[#a3e635] shadow-sm font-black"
                    : "bg-card border-outline-variant/60 text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-black" : "text-muted-foreground"} />
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="bg-outline-variant/40" />

      {/* ── Rating Filter ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Star size={13} className="text-amber-500 fill-amber-500" /> Minimum Rating
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
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all touch-manipulation active:scale-95 border text-center ${
                  isSelected
                    ? "bg-amber-500 text-black border-amber-500 font-black shadow-sm"
                    : "bg-card border-outline-variant/60 text-foreground hover:bg-muted/50"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="bg-outline-variant/40" />

      {/* ── Distance Slider & Presets ── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Compass size={13} className="text-emerald-500" /> Max Radius
          </span>
          <Badge variant="outline" className="font-black text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">
            {filters.maxDistance || 50} km
          </Badge>
        </div>
        
        <input 
          type="range" min="1" max="50" step="1"
          value={filters.maxDistance || 50}
          onChange={(e) => setFilters(f => ({ ...f, maxDistance: parseInt(e.target.value) }))}
          className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-[#a3e635] border border-outline-variant/40"
        />

        <div className="flex items-center justify-between gap-1 pt-1">
          {DISTANCE_PRESETS.map((dist) => (
            <button
              key={dist}
              type="button"
              onClick={() => setFilters(f => ({ ...f, maxDistance: dist }))}
              className={`flex-1 py-1 rounded-full text-[10px] font-bold border transition-all active:scale-95 ${
                filters.maxDistance === dist
                  ? "bg-[#181d24] text-[#a3e635] border-[#a3e635]"
                  : "bg-card border-outline-variant/60 text-muted-foreground hover:bg-muted"
              }`}
            >
              {dist} km
            </button>
          ))}
        </div>
      </div>

      <Separator className="bg-outline-variant/40" />

      {/* ── Sort By Selection ── */}
      <div className="space-y-2">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Sort Results</p>
        <div className="grid grid-cols-3 gap-1.5">
          {(["Nearest", "Highest Rated", "Most Reviewed"] as const).map((opt) => {
            const isSelected = (filters.sortBy || "Nearest") === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setFilters(f => ({ ...f, sortBy: opt }))}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border text-center transition-all active:scale-95 truncate ${
                  isSelected
                    ? "bg-[#181d24] text-[#a3e635] border-[#a3e635] font-black"
                    : "bg-card border-outline-variant/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Footer Actions ── */}
      <div className="pt-2 flex items-center gap-2">
        <Button 
          onClick={handleReset}
          variant="outline"
          size="default"
          className="rounded-full text-xs font-bold h-11 px-4 border-outline-variant/60 hover:bg-muted"
        >
          <RotateCcw size={13} className="mr-1" />
          Reset
        </Button>

        {onApply ? (
          <Button
            onClick={onApply}
            size="default"
            className="flex-1 rounded-full bg-[#a3e635] hover:opacity-90 text-black font-black text-xs h-11 shadow-[0_4px_14px_rgba(163,230,53,0.3)] touch-manipulation active:scale-95"
          >
            Apply ({resultsCount} Pros)
          </Button>
        ) : (
          <div className="flex-1 text-right text-xs font-bold text-muted-foreground">
            {resultsCount} match{resultsCount !== 1 ? "es" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
