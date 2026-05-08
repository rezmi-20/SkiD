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
    <div className="bg-surface-container-lowest border border-surface-container-highest rounded-[2rem] p-6 md:p-8 space-y-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-headline-md text-on-surface">Refine Search</h3>
        <span className="text-label-sm text-on-surface-variant uppercase tracking-widest opacity-60">
          {resultsCount} Found
        </span>
      </div>

      {/* View Toggle (Mobile Only - Desktop has it in header) */}
      <div className="md:hidden flex bg-surface-container rounded-2xl p-1 border border-surface-container-highest">
         <button 
           onClick={() => setViewMode("list")}
           className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-label-md font-bold transition-all ${viewMode === "list" ? "bg-on-surface text-surface-container-lowest" : "text-on-surface-variant"}`}
         >
           <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
           List
         </button>
         <button 
           onClick={() => setViewMode("map")}
           className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-label-md font-bold transition-all ${viewMode === "map" ? "bg-on-surface text-surface-container-lowest" : "text-on-surface-variant"}`}
         >
           <span className="material-symbols-outlined text-[18px]">map</span>
           Map
         </button>
      </div>

      {/* Category Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <span className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Category</span>
           <span className="material-symbols-outlined text-outline-variant text-[20px]">category</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilters({ ...filters, category: cat === "All" ? "" : cat })}
              className={`px-4 py-2 rounded-xl text-label-sm font-bold uppercase tracking-widest transition-all shadow-sm border
                ${(filters.category === cat || (cat === "All" && !filters.category))
                  ? "bg-on-surface text-surface-container-lowest border-on-surface"
                  : "bg-surface-container-low text-on-surface-variant border-surface-container-highest hover:bg-surface-container-high hover:text-on-surface"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <span className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Minimum Rating</span>
           <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[18px] filled">star</span>
              <span className="text-label-md font-bold">{filters.minRating || 3.0}</span>
           </div>
        </div>
        <div className="relative pt-2">
           <input 
             type="range" min="3" max="5" step="0.1" 
             value={filters.minRating || 3.0}
             onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
             className="w-full h-2 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary border border-surface-container-highest"
           />
           <div className="flex justify-between mt-2 text-[10px] font-bold text-outline uppercase tracking-widest">
              <span>3.0</span>
              <span>5.0</span>
           </div>
        </div>
      </div>

      {/* Distance Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <span className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Max Distance</span>
           <div className="flex items-center gap-1 text-on-surface">
              <span className="material-symbols-outlined text-[18px]">distance</span>
              <span className="text-label-md font-bold">{filters.maxDistance}km</span>
           </div>
        </div>
        <div className="relative pt-2">
           <input 
             type="range" min="1" max="50" step="1"
             value={filters.maxDistance}
             onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
             className="w-full h-2 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary border border-surface-container-highest"
           />
           <div className="flex justify-between mt-2 text-[10px] font-bold text-outline uppercase tracking-widest">
              <span>1km</span>
              <span>50km</span>
           </div>
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-container">
        <span className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Online Only</span>
        <button className="w-12 h-6 bg-surface-container-high rounded-full relative p-1 border border-surface-container-highest transition-all">
           <div className="w-4 h-4 bg-outline-variant rounded-full shadow-sm" />
        </button>
      </div>

      {/* Clear Filters */}
      <button 
        onClick={() => setFilters({ query: "", category: "", minRating: 0, maxDistance: 100, sortBy: "Nearest" })}
        className="w-full py-3 rounded-2xl bg-surface-container text-on-surface-variant text-label-md font-bold uppercase tracking-widest hover:bg-surface-container-high hover:text-on-surface transition-all border border-surface-container-highest"
      >
        Reset Filters
      </button>
    </div>
  );
}
