"use client";

import { motion } from "framer-motion";
import { ViewMode, SearchFilters as FilterType } from "./types";

interface SearchFiltersProps {
  filters: FilterType;
  setFilters: (f: FilterType) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  resultsCount: number;
}

const CATEGORIES = ["All", "Electrician", "Plumber", "Painter", "Satellite Dish", "House Finishing"];

export default function SearchFilters({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  resultsCount,
}: SearchFiltersProps) {
  return (
    <div className="space-y-3 md:space-y-6">
      {/* Search & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="relative flex-1 max-w-2xl group">
          <span className="material-symbols-outlined absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors text-lg md:text-xl">
            search
          </span>
          <input
            placeholder="Search by skill (plumber, electrician...)"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="w-full bg-surface-container-low border border-white/5 rounded-2xl py-2.5 md:py-4 pl-12 md:pl-14 pr-6 text-on-surface font-medium placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary/20 transition-all text-[13px] md:text-base"
          />
        </div>

        <div className="flex bg-surface-container-low border border-white/5 p-1 rounded-xl md:p-1.5 md:rounded-2xl shrink-0">
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
              viewMode === "list" ? "bg-white text-black shadow-xl" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">view_list</span>
            List
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
              viewMode === "map" ? "bg-white text-black shadow-xl" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">map</span>
            Map
          </button>
        </div>
      </div>

      {/* Category Chips and Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-6 overflow-hidden">
        <div className="flex gap-2 p-1 overflow-x-auto pb-3 sm:pb-0 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilters({ ...filters, category: cat === "All" ? "" : cat })}
              className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border transition-all whitespace-nowrap ${
                (filters.category === cat || (cat === "All" && !filters.category))
                  ? "bg-primary/20 border-primary/20 text-primary"
                  : "bg-surface-container-high border-white/5 text-on-surface-variant hover:border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                Showing {resultsCount} workers near you
            </span>
            <div className="h-4 w-px bg-white/5 hidden sm:block" />
            <button className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">tune</span>
                Filter
            </button>
        </div>
      </div>

      {/* Advanced Filters (Rating, Distance, Sort) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 pt-2 border-t border-white/5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-2">Min Rating</span>
          <select 
            value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
            className="w-full bg-surface-container-low border border-white/5 rounded-xl py-3 px-4 text-on-surface text-[11px] md:text-xs font-bold appearance-none focus:outline-none focus:border-primary/20 transition-all cursor-pointer"
          >
            <option value="0" className="bg-[#111111] text-white">Any Rating</option>
            <option value="4.0" className="bg-[#111111] text-white">4.0+ Stars</option>
            <option value="4.5" className="bg-[#111111] text-white">4.5+ Stars</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-2">Distance</span>
          <select 
            value={filters.maxDistance}
            onChange={(e) => setFilters({ ...filters, maxDistance: Number(e.target.value) })}
            className="w-full bg-surface-container-low border border-white/5 rounded-xl py-3 px-4 text-on-surface text-[11px] md:text-xs font-bold appearance-none focus:outline-none focus:border-primary/20 transition-all cursor-pointer"
          >
            <option value="100" className="bg-[#111111] text-white">Any Distance</option>
            <option value="2" className="bg-[#111111] text-white">Within 2 KM</option>
            <option value="5" className="bg-[#111111] text-white">Within 5 KM</option>
            <option value="10" className="bg-[#111111] text-white">Within 10 KM</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/60 ml-2">Sort By</span>
          <select 
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
            className="w-full bg-surface-container-low border border-white/5 rounded-xl py-3 px-4 text-on-surface text-[11px] md:text-xs font-bold appearance-none focus:outline-none focus:border-primary/20 transition-all cursor-pointer"
          >
            <option value="Nearest" className="bg-[#111111] text-white">Nearest First</option>
            <option value="Highest Rated" className="bg-[#111111] text-white">Highest Rated</option>
            <option value="Most Reviewed" className="bg-[#111111] text-white">Most Reviewed</option>
          </select>
        </label>
      </div>
    </div>
  );
}
