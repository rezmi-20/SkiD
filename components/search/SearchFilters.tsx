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
    <div className="space-y-8">
      {/* Search & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-2xl group">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            type="text"
            placeholder="Search by skill or name..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="w-full bg-surface-container-low border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-on-surface font-medium placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/30 transition-all"
          />
        </div>

        <div className="flex bg-surface-container-low border border-white/5 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              viewMode === "list" ? "bg-white text-black shadow-xl" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">view_list</span>
            List
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              viewMode === "map" ? "bg-white text-black shadow-xl" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">map</span>
            Map
          </button>
        </div>
      </div>

      {/* Category Chips and Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 overflow-hidden">
        <div className="flex gap-2.5 overflow-x-auto pb-4 sm:pb-0 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
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
                {resultsCount} Results Found
            </span>
            <div className="h-4 w-px bg-white/5" />
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">tune</span>
                Filter
            </button>
        </div>
      </div>
    </div>
  );
}
