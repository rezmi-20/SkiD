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

export default function SearchFilters({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  resultsCount,
}: SearchFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-[#0c0c0e] border border-white/5 rounded-[2rem] p-8 space-y-10 shadow-2xl">
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
                  ? "bg-green-400 text-black border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.2)]"
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
           <div className="flex items-center gap-1 text-green-400">
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
             className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-green-400"
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
             className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-green-400"
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
  );
}
