"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import WorkerCard from "@/components/search/WorkerCard";
import SearchFilters from "@/components/search/SearchFilters";
import { Worker, ViewMode, SearchFilters as FilterType } from "@/components/search/types";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { setCachedWorker } from "@/lib/workerCache";
import { 
  RiSearchLine,
  RiMapPinLine,
  RiEqualizerLine,
  RiCloseLine,
  RiCompass3Line,
  RiRestartLine,
  RiArrowRightLine,
  RiUser3Line,
  RiSearchEyeLine,
  RiListCheck2,
  RiMap2Line,
  RiStarFill,
  RiShieldCheckFill,
  RiChat1Line,
  RiEyeLine
} from "@remixicon/react";
import { cx } from "@/utils/cx";

// Dynamically import Map with no SSR
const MapComponent = dynamic(() => import("@/components/search/MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-background-secondary-default animate-pulse flex items-center justify-center border border-border-button-default">
      <div className="flex flex-col items-center gap-2 text-text-tertiary">
        <RiCompass3Line className="h-8 w-8 animate-spin text-[#45BA50]" />
        <p className="text-caption-1-semibold font-bold text-text-secondary">Loading Dire Dawa Interactive Map...</p>
      </div>
    </div>
  )
});

function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function SearchPageContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { location, loading: locLoading, accuracy, isLive, refreshLocation } = useLocation();

  const initialView = searchParams.get("view") === "map" ? "map" : "list";
  const initialCategory = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || searchParams.get("query") || "";

  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [previewWorker, setPreviewWorker] = useState<Worker | null>(null);
  const [messagingWorkerId, setMessagingWorkerId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key when filter drawer or preview modal is open
  useEffect(() => {
    if (filterDrawerOpen || previewWorker) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setFilterDrawerOpen(false);
          setPreviewWorker(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [filterDrawerOpen, previewWorker]);

  const handleStartMessage = async (worker: Worker) => {
    setMessagingWorkerId(String(worker.id));
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: worker.id }),
      });
      const data = await res.json();
      if (res.ok && data.conversationId) {
        router.push(`/client/messages/${data.conversationId}`);
        return;
      }
    } catch (err) {
      console.error("Failed to start message conversation:", err);
    } finally {
      setMessagingWorkerId(null);
    }
    router.push(`/client/messages?workerId=${worker.id}`);
  };

  // Smoothly scroll selected artisan into view in ride-hailing bottom sheet
  useEffect(() => {
    if (selectedWorker && viewMode === "map") {
      const el = document.getElementById(`artisan-sheet-row-${selectedWorker.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedWorker?.id, viewMode]);

  const [filters, setFilters] = useState<FilterType>({
    query: initialQuery,
    category: initialCategory,
    neighborhood: "All Dire Dawa",
    minRating: 0,
    maxDistance: 50,
    sortBy: "Nearest",
    verifiedOnly: false,
  });

  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 200);
    return () => clearTimeout(handler);
  }, [filters.query]);

  const activeFilterCount = useMemo(() => {
    return [
      Boolean(filters.category),
      Boolean(filters.neighborhood && filters.neighborhood !== "All Dire Dawa"),
      Boolean(filters.minRating > 0),
      Boolean(filters.maxDistance && filters.maxDistance < 50),
      Boolean(filters.verifiedOnly),
      Boolean(filters.query),
    ].filter(Boolean).length;
  }, [filters]);

  useEffect(() => {
    let isCancelled = false;

    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const queryWithNeighborhood = filters.neighborhood && filters.neighborhood !== "All Dire Dawa"
          ? `${debouncedQuery} ${filters.neighborhood}`.trim()
          : debouncedQuery;

        const params = new URLSearchParams({
          query: queryWithNeighborhood || "",
          category: filters.category === "All" ? "" : (filters.category || ""),
          minRating: filters.minRating.toString(),
          maxDistance: filters.maxDistance.toString(),
        });

        if (location && location.lat && location.lng) {
          params.append("lat", location.lat.toString());
          params.append("lng", location.lng.toString());
        }

        const res = await fetch(`/api/workers?${params.toString()}`);
        if (!res.ok) throw new Error("Could not retrieve artisans");
        const data = await res.json();
        
        if (isCancelled) return;

        if (data.workers) {
          data.workers.forEach((w: any) => {
            setCachedWorker(w.id, {
              worker: {
                id: w.id,
                email: w.email || "",
                full_name: w.full_name,
                bio: w.bio,
                skills: w.skills,
                latitude: w.latitude,
                longitude: w.longitude,
                hourly_rate: w.hourly_rate || "450",
                avatar_url: w.avatar_url,
                is_verified: w.is_verified,
                avg_rating: w.avg_rating,
                total_ratings: w.total_ratings,
                availability: w.availability || "available",
                distance: w.distance != null ? Number(w.distance).toFixed(1) : undefined,
              },
              reviews: [],
            });
          });

          let mapped: Worker[] = data.workers.map((w: any) => {
            const lat = Number(w.latitude) || 0;
            const lng = Number(w.longitude) || 0;
            
            let distDisplay = "N/A";
            if (w.distance != null) {
              distDisplay = Number(w.distance).toFixed(1);
            } else if (location && lat !== 0 && lng !== 0) {
              distDisplay = getHaversineDistanceKm(location.lat, location.lng, lat, lng).toFixed(1);
            }

            return {
              id: w.id,
              name: w.full_name,
              skill: Array.isArray(w.skills) ? w.skills[0] || "Artisan" : "Artisan",
              category: Array.isArray(w.skills) ? w.skills[0] || "" : "",
              rating: Number(w.avg_rating),
              reviews: Number(w.total_ratings),
              distance: distDisplay,
              lat,
              lng,
              photo: w.avatar_url || null,
              isVerified: w.is_verified,
              district: "Kezira",
              skills: w.skills,
              bio: w.bio,
              hourlyRate: w.hourly_rate || "450",
            };
          });

          if (filters.verifiedOnly) {
            mapped = mapped.filter(w => w.isVerified);
          }

          if (filters.sortBy === "Highest Rated") {
            mapped.sort((a, b) => b.rating - a.rating);
          } else if (filters.sortBy === "Most Reviewed") {
            mapped.sort((a, b) => b.reviews - a.reviews);
          } else if (filters.sortBy === "Nearest") {
            mapped.sort((a, b) => {
              const da = a.distance !== "N/A" && a.distance != null ? parseFloat(String(a.distance)) : 999999;
              const db = b.distance !== "N/A" && b.distance != null ? parseFloat(String(b.distance)) : 999999;
              return da - db;
            });
          }

          setWorkers(mapped);
          if (mapped.length > 0) {
            setSelectedWorker((prev) => prev ? mapped.find(m => m.id === prev.id) || null : null);
          }
          setError(null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Failed to fetch workers", err);
          setError(`Unable to connect: ${err.message}`);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchWorkers();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, filters.category, filters.neighborhood, filters.minRating, filters.maxDistance, filters.sortBy, filters.verifiedOnly, location]);

  return (
    <div className="w-full h-full flex flex-col flex-1 min-h-0 bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 transition-colors">
      
      {/* ── 1. TOP CONTROLS BAR: [Filter] + [Search Bar (~50% width)] ... [List | Map] + [GPS] ── */}
      <header className={cx(
        "px-4 sm:px-8 md:px-12 lg:px-14 xl:px-18 2xl:px-24 py-3 sm:py-3.5 items-stretch md:items-center justify-between gap-3 shrink-0 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800",
        viewMode === "map" ? "hidden lg:flex" : "flex flex-col md:flex-row"
      )}>
        
        {/* Left Side (~50% width allocated): 1. Filter Button + 2. Search Bar */}
        <div className="flex items-center gap-2.5 flex-1 md:max-w-[50%]">
          
          {/* 1. Filter Button (First) */}
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(prev => !prev)}
            className={cx(
              "h-11 px-4 rounded-full text-xs font-bold transition-all active:scale-95 shadow-xs shrink-0 flex items-center gap-2 border cursor-pointer",
              activeFilterCount > 0
                ? "bg-[#45BA50] text-white border-[#45BA50] shadow-[0_2px_10px_rgba(69,186,80,0.35)] font-black"
                : "bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800"
            )}
            title="Toggle Search Filters (Slides from Right)"
          >
            <RiEqualizerLine className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="h-4 w-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* 2. Search Bar (Takes remaining of the allocated space) */}
          <div className="flex-1 relative flex items-center h-11 px-3.5 rounded-full bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs focus-within:border-[#45BA50] transition-colors">
            <RiSearchLine className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
              placeholder="Search electricians, plumbers, Kezira, painters..."
              className="bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none flex-1 min-w-0 ms-2"
            />
            {filters.query && (
              <button
                onClick={() => setFilters(f => ({ ...f, query: "" }))}
                className="p-1 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white shrink-0 cursor-pointer"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: 3. The Switcher (List | Map) + 4. GPS Button */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
          
          {/* 3. The Switcher (List | Map) */}
          <div className="flex items-center bg-slate-100 dark:bg-zinc-900 p-1 rounded-full border border-slate-200/80 dark:border-zinc-800 shadow-xs shrink-0">
            <button 
              onClick={() => setViewMode("list")}
              className={cx(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer touch-manipulation",
                viewMode === "list"
                  ? "bg-[#45BA50] text-white shadow-xs font-black"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <RiListCheck2 className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button 
              onClick={() => setViewMode("map")}
              className={cx(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer touch-manipulation",
                viewMode === "map"
                  ? "bg-[#45BA50] text-white shadow-xs font-black"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <RiMap2Line className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
          </div>

          {/* 4. Live GPS Button */}
          <button
            type="button"
            onClick={refreshLocation}
            className="inline-flex items-center gap-1.5 px-3.5 h-11 rounded-full text-xs font-bold bg-[#134e27]/20 text-[#45BA50] border border-[#45BA50]/35 hover:bg-[#134e27]/30 active:scale-95 transition-all cursor-pointer shadow-xs"
            title="Refresh Real-Time GPS Location in Dire Dawa"
          >
            <span className={cx(
              "w-2 h-2 rounded-full",
              locLoading ? "bg-amber-400 animate-pulse" : isLive ? "bg-[#45BA50] animate-ping" : "bg-[#45BA50]"
            )} />
            <span className="hidden sm:inline">GPS (±{accuracy || 18}m)</span>
            <RiRestartLine className={cx("w-3.5 h-3.5", locLoading ? "animate-spin" : "")} />
          </button>
        </div>
      </header>

      {/* ── Error Banner if any ── */}
      {error && (
        <div className="mx-3 sm:mx-6 mt-2 p-3 rounded-2xl border border-border-error-default bg-background-secondary-default text-text-error-primary text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:opacity-75">✕</button>
        </div>
      )}

      {/* ── 2. VIEW MODE SWITCHING (Either Map or List) ── */}
      <div className="flex-1 w-full min-h-0 relative">
        <AnimatePresence mode="wait">
          {viewMode === "map" ? (
            /* ═════════════════════════════════════════════════════════════════
               MAP VIEW: RESPONSIVE SINGLE-MAP ARCHITECTURE (Zero Collision)
               - Mobile (< lg): Full-screen map with in-map floating controls
                 Bottom sheet appears ONLY AFTER clicking an artisan pin
               - Desktop (lg:): Generous margins, left collapsible filter sidebar,
                 contained map card, and spacious scrollable artisan grid below
               ═════════════════════════════════════════════════════════════════ */
            <motion.div
              key="map-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full px-0 lg:px-14 xl:px-18 2xl:px-24 py-0 lg:py-4 space-y-4 pb-28 lg:pb-12"
            >
              {/* Flex Container: Inline Left Filter Sidebar (Desktop lg:) + Main Content Area */}
              <div className="w-full flex items-start gap-4 lg:gap-6">
                
                {/* Collapsible Left Filter Sidebar (Desktop: Slides from Left, pushes content with NO OVERLAP) */}
                <AnimatePresence initial={false}>
                  {filterDrawerOpen && (
                    <motion.aside
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 290, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: "spring", damping: 28, stiffness: 300 }}
                      className="shrink-0 overflow-hidden hidden lg:block"
                    >
                      <div className="w-[290px] p-5 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs sticky top-20">
                        <SearchFilters
                          filters={filters}
                          setFilters={setFilters}
                          resultsCount={workers.length}
                          onClose={() => setFilterDrawerOpen(false)}
                          onApply={() => setFilterDrawerOpen(false)}
                        />
                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 space-y-6">
                  
                  {/* ── 1. THE SINGLE LEAFLET MAP CONTAINER (No Dual Collision) ── */}
                  <div className="w-full h-[calc(100dvh-64px)] lg:h-[500px] xl:h-[540px] lg:rounded-3xl lg:border lg:border-slate-200/80 dark:lg:border-zinc-800 overflow-hidden relative shadow-sm bg-slate-100 dark:bg-zinc-900">
                    
                    {/* Mobile Floating In-Map Header Controls (Filters, Search, List Switch, GPS) */}
                    <div className="absolute top-2.5 inset-x-2.5 z-[1000] flex flex-col gap-2 pointer-events-auto lg:hidden">
                      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/92 dark:bg-zinc-900/92 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800 shadow-lg">
                        {/* Filter Button */}
                        <button
                          type="button"
                          onClick={() => setFilterDrawerOpen(true)}
                          className={cx(
                            "h-9 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs shrink-0 flex items-center gap-1.5 border cursor-pointer",
                            activeFilterCount > 0
                              ? "bg-[#45BA50] text-white border-[#45BA50] font-black"
                              : "bg-slate-50 dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 text-slate-800 dark:text-zinc-200"
                          )}
                        >
                          <RiEqualizerLine className="w-3.5 h-3.5" />
                          <span>Filters</span>
                          {activeFilterCount > 0 && (
                            <span className="h-4 w-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                              {activeFilterCount}
                            </span>
                          )}
                        </button>

                        {/* Search Input */}
                        <div className="flex-1 relative flex items-center h-9 px-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs focus-within:border-[#45BA50]">
                          <RiSearchLine className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                          <input
                            type="text"
                            value={filters.query}
                            onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
                            placeholder="Search artisan or trade..."
                            className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none flex-1 min-w-0 ms-1.5"
                          />
                          {filters.query && (
                            <button
                              onClick={() => setFilters(f => ({ ...f, query: "" }))}
                              className="p-1 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white shrink-0 cursor-pointer"
                            >
                              <RiCloseLine className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Switch to List */}
                        <button 
                          onClick={() => setViewMode("list")}
                          className="h-9 px-3 rounded-xl text-xs font-bold bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-800 flex items-center gap-1 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all shrink-0 cursor-pointer"
                        >
                          <RiListCheck2 className="w-3.5 h-3.5" />
                          <span>List</span>
                        </button>

                        {/* GPS Button */}
                        <button
                          type="button"
                          onClick={refreshLocation}
                          className="h-9 w-9 rounded-xl text-xs font-bold bg-[#134e27]/20 text-[#45BA50] border border-[#45BA50]/35 flex items-center justify-center active:scale-95 transition-all shrink-0"
                          title="Refresh GPS"
                        >
                          <RiRestartLine className={cx("w-3.5 h-3.5", locLoading ? "animate-spin" : "")} />
                        </button>
                      </div>
                    </div>

                    {/* Exactly ONE Leaflet Map Component in the whole page */}
                    <MapComponent 
                      workers={workers} 
                      selectedWorkerId={selectedWorker?.id}
                      onSelectWorker={(w) => setSelectedWorker(w)}
                      onMapClick={() => setSelectedWorker(null)}
                      className="h-full w-full"
                    />

                    {/* Mobile Slide-from-bottom Sheet: Appears ONLY AFTER clicking an artisan pin */}
                    <AnimatePresence>
                      {selectedWorker && (
                        <motion.div
                          initial={{ y: "100%", opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: "100%", opacity: 0 }}
                          transition={{ type: "spring", damping: 28, stiffness: 300 }}
                          className="lg:hidden absolute inset-x-0 bottom-4 z-[1000] px-3 pointer-events-auto"
                        >
                          <div className="rounded-3xl bg-white/98 dark:bg-zinc-900/98 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl p-4 flex flex-col space-y-3">
                            {/* Drag Handle Notch & Close Button */}
                            <div className="flex items-center justify-between pb-1">
                              <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700 mx-auto" />
                              <button
                                type="button"
                                onClick={() => setSelectedWorker(null)}
                                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                title="Close artisan card"
                              >
                                <RiCloseLine className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Selected Artisan Compact Row */}
                            <WorkerCard
                              worker={selectedWorker}
                              variant="compact"
                              isSelected={true}
                              onSelect={() => {}}
                            />

                            {/* Action Buttons: Preview, Message, Book */}
                            <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewWorker(selectedWorker)}
                                className="h-10 px-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs cursor-pointer"
                              >
                                <RiEyeLine className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                                <span>Preview</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStartMessage(selectedWorker)}
                                className="h-10 px-3.5 rounded-xl border border-[#45BA50]/30 bg-[#134e27]/15 hover:bg-[#134e27]/25 text-[#45BA50] text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                              >
                                <RiChat1Line className="w-3.5 h-3.5" />
                                <span>Message</span>
                              </button>

                              <Link
                                href={`/client/contract/new?workerId=${selectedWorker.id}`}
                                className="flex-1 h-10 rounded-xl bg-[#45BA50] hover:bg-[#3ca346] text-white font-black text-xs inline-flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(69,186,80,0.3)] active:scale-95 transition-all"
                              >
                                <span>Book Artisan</span>
                                <RiArrowRightLine className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ── 2. DESKTOP SCROLLABLE ARTISANS FEED BELOW MAP (Web only, Generous Scroll Space) ── */}
                  <div className="hidden lg:block space-y-4">
                    {/* Header Status Row */}
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-zinc-400 px-1">
                      <span>Showing <strong className="text-slate-900 dark:text-white">{workers.length}</strong> verified pro{workers.length !== 1 ? "s" : ""} on map</span>
                      <span>Sorted by: <strong className="text-[#45BA50]">{filters.sortBy || "Nearest"}</strong></span>
                    </div>

                    {/* Responsive 4-Column Grid of Minimalist Alex Clinton Cards */}
                    {workers.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                        {workers.map((worker) => (
                          <WorkerCard
                            key={worker.id}
                            worker={worker}
                            variant="grid"
                            isSelected={selectedWorker?.id === worker.id}
                            onSelect={(w) => setSelectedWorker(w)}
                            onPreview={(w) => setPreviewWorker(w)}
                            onMessage={(w) => handleStartMessage(w)}
                          />
                        ))}
                      </div>
                    ) : (
                      !loading && (
                        <div className="rounded-3xl border border-dashed border-slate-200/80 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900/50 space-y-3">
                          <RiSearchEyeLine className="w-8 h-8 mx-auto text-[#45BA50]" />
                          <p className="text-sm font-bold text-slate-900 dark:text-white">No matching artisans found</p>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">Try resetting filters to explore all artisans in Dire Dawa.</p>
                          <button
                            onClick={() => setFilters({ query: "", category: "", neighborhood: "All Dire Dawa", minRating: 0, maxDistance: 50, sortBy: "Nearest", verifiedOnly: false })}
                            className="px-4 py-2 rounded-full text-xs font-bold bg-[#45BA50] text-white cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      )
                    )}
                  </div>

                </div>
              </div>
            </motion.div>
          ) : (
            /* ═════════════════════════════════════════════════════════════════
               LIST VIEW: CLEAN, SPACIOUS FULL-WIDTH DISCOVERY FEED
               - Generous visible space on left & right (slims down card width)
               - Filter collapses from the LEFT side, pushing content like a sidebar (NO OVERLAP)
               - 2 columns on mobile, 4 columns on desktop with sleek profile cards
               ═════════════════════════════════════════════════════════════════ */
            <motion.div
              key="list-mode"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full px-4 sm:px-8 md:px-12 lg:px-14 xl:px-18 2xl:px-24 py-4 space-y-4 pb-28 lg:pb-12"
            >
              {/* Flex Container: Inline Left Filter Sidebar (Desktop) + Results Grid */}
              <div className="w-full flex items-start gap-4 lg:gap-6">
                
                {/* Collapsible Left Filter Sidebar (Desktop: Slides from Left, pushes content with NO OVERLAP) */}
                <AnimatePresence initial={false}>
                  {filterDrawerOpen && (
                    <motion.aside
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 290, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: "spring", damping: 28, stiffness: 300 }}
                      className="shrink-0 overflow-hidden hidden lg:block"
                    >
                      <div className="w-[290px] p-5 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs sticky top-20">
                        <SearchFilters
                          filters={filters}
                          setFilters={setFilters}
                          resultsCount={workers.length}
                          onClose={() => setFilterDrawerOpen(false)}
                          onApply={() => setFilterDrawerOpen(false)}
                        />
                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>

                {/* Main Results Grid Area (Flex-1, smoothly slides & adjusts beside sidebar) */}
                <div className="flex-1 min-w-0 space-y-4">
                  {/* Header Status Row */}
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-zinc-400 px-1">
                    <span>Showing <strong className="text-slate-900 dark:text-white">{workers.length}</strong> verified pro{workers.length !== 1 ? "s" : ""} in Dire Dawa</span>
                    <span>Sorted by: <strong className="text-[#45BA50]">{filters.sortBy || "Nearest"}</strong></span>
                  </div>

                  {/* 2 Columns on Mobile, 3 on Tablet, 4 on Desktop */}
                  {workers.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                      {workers.map((worker) => (
                        <WorkerCard
                          key={worker.id}
                          worker={worker}
                          variant="grid"
                          isSelected={selectedWorker?.id === worker.id}
                          onSelect={(w) => setSelectedWorker(w)}
                          onPreview={(w) => setPreviewWorker(w)}
                          onMessage={(w) => handleStartMessage(w)}
                        />
                      ))}
                    </div>
                  ) : (
                    !loading && (
                      <div className="rounded-3xl border border-dashed border-slate-200/80 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900/50 space-y-3">
                        <RiSearchEyeLine className="w-8 h-8 mx-auto text-[#45BA50]" />
                        <p className="text-sm font-bold text-slate-900 dark:text-white">No matching artisans found</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">Try expanding your search criteria or resetting filters.</p>
                        <button
                          onClick={() => setFilters({ query: "", category: "", neighborhood: "All Dire Dawa", minRating: 0, maxDistance: 50, sortBy: "Nearest", verifiedOnly: false })}
                          className="px-4 py-2 rounded-full text-xs font-bold bg-[#45BA50] text-white cursor-pointer"
                        >
                          Reset All Filters
                        </button>
                      </div>
                    )
                  )}

                  {loading && (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-64 sm:h-72 rounded-2xl sm:rounded-3xl bg-slate-100 dark:bg-zinc-900/80 animate-pulse border border-slate-200/60 dark:border-zinc-800" />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          3. MOBILE SLIDE-OVER FILTER DRAWER (Collapsible from the Left on < lg)
          - Mounted directly in document.body via createPortal
          - Slides in and out from the LEFT side (< lg)
          ═════════════════════════════════════════════════════════════════════ */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {filterDrawerOpen && (
            <div className="lg:hidden fixed inset-0 z-[9999] flex justify-start">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setFilterDrawerOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative w-[85%] max-w-sm h-full bg-white dark:bg-zinc-900 border-r border-slate-200/80 dark:border-zinc-800 shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between"
              >
                <SearchFilters
                  filters={filters}
                  setFilters={setFilters}
                  resultsCount={workers.length}
                  onClose={() => setFilterDrawerOpen(false)}
                  onApply={() => setFilterDrawerOpen(false)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          4. ARTISAN QUICK PREVIEW MODAL (Option Preview)
          - Full pro details, Fayda verification check, bio, skills, rating
          - Direct buttons to Message, Book, or view full profile
          ═════════════════════════════════════════════════════════════════════ */}
      {mounted && typeof document !== "undefined" && previewWorker && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewWorker(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl p-5 sm:p-6 z-10 max-h-[90vh] overflow-y-auto space-y-5"
            >
              {/* Header with Close */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 shrink-0">
                    <img
                      src={previewWorker.photo || "/images/worker_holding_card.png"}
                      alt={previewWorker.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {previewWorker.name}
                      </h2>
                      {previewWorker.isVerified && (
                        <span title="Kebele & Fayda Verified">
                          <RiShieldCheckFill className="w-5 h-5 text-[#45BA50]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                      <RiMapPinLine className="w-3.5 h-3.5 text-[#45BA50]" />
                      <span>{previewWorker.district || "Kezira"}, Dire Dawa</span>
                      <span>•</span>
                      <span>{previewWorker.distance !== "N/A" ? `${previewWorker.distance} km away` : "Dire Dawa"}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewWorker(null)}
                  className="p-1.5 rounded-full text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Rate & Rating Highlights Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Hourly Rate</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">ETB {previewWorker.hourlyRate || "450"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Rating</p>
                  <p className="text-sm font-black text-amber-500 mt-0.5 flex items-center justify-center gap-0.5">
                    <RiStarFill className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{previewWorker.rating > 0 ? previewWorker.rating.toFixed(1) : "5.0"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500">Experience</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{previewWorker.reviews || 1} jobs</p>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  About Artisan
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-slate-200/60 dark:border-zinc-800">
                  {previewWorker.bio || "Certified pro specializing in residential and commercial maintenance, electrical wiring, installation, and on-demand repairs with verified Kebele registration."}
                </p>
              </div>

              {/* Verified Skills */}
              {previewWorker.skills && previewWorker.skills.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Verified Skills & Specialties
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {previewWorker.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#134e27]/15 text-[#45BA50] border border-[#45BA50]/30"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const w = previewWorker;
                    setPreviewWorker(null);
                    handleStartMessage(w);
                  }}
                  className="w-full sm:flex-1 h-11 rounded-xl border border-[#45BA50]/40 bg-[#134e27]/20 hover:bg-[#134e27]/30 text-[#45BA50] text-xs font-bold inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <RiChat1Line className="w-4 h-4" />
                  <span>Message Pro</span>
                </button>

                <Link
                  href={`/client/contract/new?workerId=${previewWorker.id}`}
                  onClick={() => setPreviewWorker(null)}
                  className="w-full sm:flex-1 h-11 rounded-xl bg-[#45BA50] hover:bg-[#3ca346] text-white text-xs font-black inline-flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(69,186,80,0.35)] transition-all cursor-pointer active:scale-95"
                >
                  <span>Book Artisan</span>
                  <RiArrowRightLine className="w-4 h-4" />
                </Link>

                <Link
                  href={`/client/worker/${previewWorker.id}`}
                  onClick={() => setPreviewWorker(null)}
                  className="w-full sm:w-auto h-11 px-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-900 dark:text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <RiUser3Line className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
                  <span>Full Profile</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="h-[600px] w-full bg-slate-100 dark:bg-zinc-900 animate-pulse rounded-3xl flex items-center justify-center border border-slate-200 dark:border-zinc-800">
        <RiCompass3Line className="h-8 w-8 animate-spin text-[#45BA50]" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
