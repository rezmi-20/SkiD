"use client";

import { motion } from "framer-motion";
import { ViewMode, SearchFilters as FilterType } from "./types";
import { useLanguage } from "@/context/LanguageContext";

interface SearchFiltersProps {
  filters: FilterType;
  setFilters: (f: FilterType) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  resultsCount: number;
}

const CATEGORIES = ["All", "Electrician", "Plumber", "Painter", "Satellite Dish", "House Finishing"];
const MOBILE_CATEGORIES = ["Plumber", "Electrician", "Painter"];

export default function SearchFilters({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  resultsCount,
}: SearchFiltersProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* ── DESKTOP LAYOUT (Hidden on Mobile) ── */}
      <div className="hidden lg:block bg-[#0c0c0e] border border-white/5 rounded-[2rem] p-8 space-y-10 shadow-2xl">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Refine Your Search</h3>
        </div>

        {/* Category */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Category</span>
             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-zinc-700"><path d="M18 15l-6-6-6 6"/></svg>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, category: cat === "All" ? "" : cat })}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                  (filters.category === cat || (cat === "All" && !filters.category))
                    ? "bg-[#2dd4bf] text-black border-[#2dd4bf] shadow-[0_0_20px_rgba(45,212,191,0.2)]"
                    : "bg-zinc-900 border-white/5 text-zinc-500 hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Rating</span>
             <div className="flex items-center gap-1 text-[#2dd4bf]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span className="text-[10px] font-black tracking-widest">≥{filters.minRating || 4}</span>
             </div>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                <span>3.0</span>
                <div className="flex items-center gap-1 text-orange-400">
                   <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                   <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                   <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <span>5.0</span>
             </div>
             <input 
               type="range" min="3" max="5" step="0.1" 
               value={filters.minRating || 4}
               onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
               className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[#2dd4bf]"
             />
          </div>
        </div>

        {/* Distance */}
        <div className="space-y-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Distance</span>
          <div className="space-y-4">
             <div className="flex justify-between text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                <span>5km</span>
                <span>20km</span>
             </div>
             <input 
               type="range" min="5" max="20" 
               value={filters.maxDistance}
               onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
               className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-[#2dd4bf]"
             />
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Availability</span>
          <button className="w-12 h-6 bg-zinc-800 rounded-full relative p-1 transition-all">
             <div className="w-4 h-4 bg-zinc-600 rounded-full shadow-lg" />
          </button>
        </div>
      </div>

      {/* ── MOBILE LAYOUT (Hidden on Desktop) ── */}
      <div className="lg:hidden w-full space-y-5">
        {/* Category & Rating Labels */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[15px] font-semibold text-zinc-900 dark:text-white">Category</span>
          <span className="text-[14px] font-medium text-zinc-700 dark:text-zinc-300">Rating ≥ 4</span>
        </div>

        {/* Pills Row */}
        <div className="flex flex-wrap gap-2.5">
          {MOBILE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilters({ ...filters, category: cat })}
              className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                filters.category === cat
                  ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white border border-transparent"
                  : "bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {cat}
            </button>
          ))}
          {/* Rating Pill */}
          <button
            onClick={() => setFilters({ ...filters, minRating: filters.minRating === 4 ? 0 : 4 })}
            className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-1.5 ${
              filters.minRating >= 4
                ? "bg-[#2dd4bf] text-black border border-transparent"
                : "bg-transparent border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
               <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Rating ≥ 4
          </button>
        </div>

        {/* Distance and Availability Row */}
        <div className="flex items-center justify-between px-1 mt-6">
          <span className="text-[15px] font-semibold text-zinc-900 dark:text-white">Distance</span>
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-semibold text-zinc-900 dark:text-white">Availability</span>
            {/* Custom Toggle Switch */}
            <button className="w-11 h-6 bg-zinc-300 dark:bg-[#3f3f46] rounded-full relative p-0.5 transition-all">
               <div className="w-5 h-5 bg-zinc-500 dark:bg-[#a1a1aa] rounded-full shadow-sm" />
            </button>
          </div>
        </div>

        {/* Distance Slider */}
        <div className="space-y-2 mt-4">
          <div className="relative h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-1">
            <div 
              className="absolute left-0 top-0 h-full bg-[#2dd4bf] rounded-full" 
              style={{ width: `${((filters.maxDistance - 5) / 15) * 100}%` }}
            />
            <input 
              type="range" min="5" max="20" 
              value={filters.maxDistance}
              onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
              className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 opacity-0 cursor-pointer"
            />
            {/* Thumb indicator */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#2dd4bf] rounded-full shadow-md pointer-events-none"
              style={{ left: `calc(${((filters.maxDistance - 5) / 15) * 100}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between text-[13px] font-medium text-zinc-500 dark:text-zinc-400 px-1">
            <span>5km</span>
            <span>20km</span>
          </div>
        </div>

        {/* List / Map Toggle */}
        <div className="flex justify-end mt-4">
          <div className="flex bg-zinc-100 dark:bg-[#27272a] rounded-full p-1 border border-zinc-200 dark:border-zinc-700">
            <button 
              onClick={() => setViewMode("list")}
              className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                viewMode === "list" 
                  ? "bg-zinc-300 dark:bg-[#3f3f46] text-zinc-900 dark:text-white" 
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode("map")}
              className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                viewMode === "map" 
                  ? "bg-zinc-300 dark:bg-[#3f3f46] text-zinc-900 dark:text-white" 
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              Map
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
