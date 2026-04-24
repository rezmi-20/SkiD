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
    <div className="space-y-3 md:space-y-6">
      {/* Search & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="relative flex-1 max-w-2xl group">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-400 transition-colors">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            placeholder={t("search.placeholder")}
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-2.5 md:py-4 pl-12 md:pl-14 pr-6 text-white font-medium placeholder:text-zinc-600 focus:outline-none focus:border-green-400/30 transition-all text-[13px] md:text-base"
          />
        </div>

        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl md:p-1.5 md:rounded-2xl shrink-0">
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
              viewMode === "list" ? "bg-green-400 text-black shadow-xl" : "text-zinc-400 hover:text-white"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            {t("search.view.list")}
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
              viewMode === "map" ? "bg-green-400 text-black shadow-xl" : "text-zinc-400 hover:text-white"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
              <line x1="8" y1="2" x2="8" y2="18"></line>
              <line x1="16" y1="6" x2="16" y2="22"></line>
            </svg>
            {t("search.view.map")}
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
                  ? "bg-green-400/20 border-green-400/30 text-green-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {t("search.showing").replace("{count}", resultsCount.toString())}
            </span>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <button className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-green-400 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                {t("search.filter")}
            </button>
        </div>
      </div>

      {/* Advanced Filters (Rating, Distance, Sort) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 pt-2 border-t border-zinc-800/50">
        <label className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">{t("search.minRating")}</span>
          <select 
            value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white text-[11px] md:text-xs font-bold appearance-none focus:outline-none focus:border-green-400/30 transition-all cursor-pointer"
          >
            <option value="0" className="bg-[#111111] text-white">Any Rating</option>
            <option value="4.0" className="bg-[#111111] text-white">4.0+ Stars</option>
            <option value="4.5" className="bg-[#111111] text-white">4.5+ Stars</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">{t("search.distance")}</span>
          <select 
            value={filters.maxDistance}
            onChange={(e) => setFilters({ ...filters, maxDistance: Number(e.target.value) })}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white text-[11px] md:text-xs font-bold appearance-none focus:outline-none focus:border-green-400/30 transition-all cursor-pointer"
          >
            <option value="100" className="bg-[#111111] text-white">Any Distance</option>
            <option value="2" className="bg-[#111111] text-white">Within 2 KM</option>
            <option value="5" className="bg-[#111111] text-white">Within 5 KM</option>
            <option value="10" className="bg-[#111111] text-white">Within 10 KM</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">{t("search.sortBy")}</span>
          <select 
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-white text-[11px] md:text-xs font-bold appearance-none focus:outline-none focus:border-green-400/30 transition-all cursor-pointer"
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
