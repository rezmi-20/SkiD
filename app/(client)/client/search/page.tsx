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
            setSelectedWorker((prev) => prev ? mapped.find(m => m.id === prev.id) || mapped[0] : mapped[0]);
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
    <div className="w-full h-full flex flex-col flex-1 min-h-0">
      
      {/* ── 1. TOP CONTROLS BAR: [Filter] + [Search Bar (~50% width)] ... [List | Map] + [GPS] ── */}
      <header className="px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0 bg-background-primary-default/80 backdrop-blur-md border-b border-separator-border/60">
        
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
                : "bg-background-secondary-default border-border-button-default text-text-primary hover:bg-background-tertiary-default"
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
          <div className="flex-1 relative flex items-center h-11 px-3.5 rounded-full bg-background-secondary-default border border-border-button-default shadow-xs focus-within:border-[#45BA50] transition-colors">
            <RiSearchLine className="w-4 h-4 text-text-tertiary shrink-0" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
              placeholder="Search electricians, plumbers, Kezira, painters..."
              className="bg-transparent text-xs sm:text-sm font-semibold text-text-primary placeholder:text-text-placeholder outline-none flex-1 min-w-0 ms-2"
            />
            {filters.query && (
              <button
                onClick={() => setFilters(f => ({ ...f, query: "" }))}
                className="p-1 text-text-tertiary hover:text-text-primary shrink-0 cursor-pointer"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: 3. The Switcher (List | Map) + 4. GPS Button */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
          
          {/* 3. The Switcher (List | Map) */}
          <div className="flex items-center bg-background-secondary-default p-1 rounded-full border border-border-button-default shadow-xs shrink-0">
            <button 
              onClick={() => setViewMode("list")}
              className={cx(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer touch-manipulation",
                viewMode === "list"
                  ? "bg-[#45BA50] text-white shadow-xs font-black"
                  : "text-text-secondary hover:text-text-primary"
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
                  : "text-text-secondary hover:text-text-primary"
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
               MAP VIEW: UBER / RIDE-HAILING LAYOUT (1:1 with Attached Photo)
               - Full-page interactive Map
               - Bottom sliding sheet ("Choose an Artisan") matching the photo!
               ═════════════════════════════════════════════════════════════════ */
            <motion.div
              key="map-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-[calc(100dvh-130px)] lg:h-[calc(100dvh-140px)] min-h-[500px] relative overflow-hidden"
            >
              {/* The Single Leaflet Interactive Map */}
              <MapComponent 
                workers={workers} 
                selectedWorkerId={selectedWorker?.id}
                onSelectWorker={(w) => setSelectedWorker(w)}
                className="h-full w-full"
              />

              {/* ── SLIDING BOTTOM SHEET (Direct 1:1 with Attached Photo) ── */}
              <div className="absolute inset-x-0 bottom-16 sm:bottom-18 lg:bottom-4 z-[1000] max-w-xl mx-auto px-3 sm:px-4 pointer-events-auto">
                <div className="rounded-3xl bg-background-primary-default/98 dark:bg-[#12171e]/98 backdrop-blur-xl border border-border-button-default shadow-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
                  
                  {/* Drag Handle Notch */}
                  <div 
                    onClick={() => setFilterDrawerOpen(true)}
                    className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto cursor-pointer hover:bg-[#45BA50] transition-colors" 
                  />

                  {/* Sheet Header Row */}
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h2 className="text-body-medium font-black text-text-primary tracking-tight">
                        Choose an Artisan
                      </h2>
                      <p className="text-[11px] text-text-tertiary">
                        {workers.length} verified pros nearby in Dire Dawa
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFilterDrawerOpen(true)}
                      className="text-[11px] font-bold text-[#45BA50] hover:underline"
                    >
                      Change Filters &rarr;
                    </button>
                  </div>

                  {/* Compact Artisan Cards List (Exact "Sky Premium / Sky Comfort" style) */}
                  <div className="space-y-2 max-h-[28vh] sm:max-h-[32vh] overflow-y-auto no-scrollbar">
                    {workers.length > 0 ? (
                      workers.map((worker) => (
                        <div key={worker.id} id={`artisan-sheet-row-${worker.id}`}>
                          <WorkerCard
                            worker={worker}
                            variant="compact"
                            isSelected={selectedWorker?.id === worker.id}
                            onSelect={(w) => setSelectedWorker(w)}
                          />
                        </div>
                      ))
                    ) : (
                      !loading && (
                        <div className="p-4 text-center rounded-2xl bg-background-secondary-default border border-dashed border-border-button-default">
                          <p className="text-xs font-bold text-text-primary">No matching artisans on map</p>
                          <button
                            onClick={() => setFilters({ query: "", category: "", neighborhood: "All Dire Dawa", minRating: 0, maxDistance: 50, sortBy: "Nearest", verifiedOnly: false })}
                            className="mt-2 px-3 py-1 rounded-lg text-xs font-bold bg-[#45BA50] text-white"
                          >
                            Reset Filters
                          </button>
                        </div>
                      )
                    )}

                    {loading && (
                      <div className="space-y-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-16 rounded-2xl bg-background-secondary-default animate-pulse border border-border-button-default" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sticky Bottom Booking Pill Button (Like Image 2 "Choose Sky Economy") */}
                  {selectedWorker && (
                    <div className="pt-2 border-t border-separator-border flex items-center gap-2">
                      <Link
                        href={`/client/contract/new?workerId=${selectedWorker.id}`}
                        className="flex-1 h-12 rounded-full bg-[#134e27] hover:bg-[#134e27]/90 text-[#a4fe47] font-black text-xs inline-flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(19,78,39,0.4)] active:scale-[0.98] transition-all border border-[#45BA50]/40"
                      >
                        <span>Book {selectedWorker.name}</span>
                        <span className="text-[10px] text-white/80">• ETB {selectedWorker.hourlyRate || "450"}/hr</span>
                        <RiArrowRightLine className="w-4 h-4 text-[#a4fe47]" />
                      </Link>

                      <Link
                        href={`/client/worker/${selectedWorker.id}`}
                        className="h-12 w-12 rounded-full bg-background-secondary-default border border-border-button-default hover:bg-background-tertiary-default flex items-center justify-center text-text-primary shadow-xs shrink-0 active:scale-95 transition-transform"
                        title="View Full Profile"
                      >
                        <RiUser3Line className="w-5 h-5 text-text-secondary" />
                      </Link>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          ) : (
            /* ═════════════════════════════════════════════════════════════════
               LIST VIEW: CLEAN, SPACIOUS FULL-WIDTH DISCOVERY FEED
               - Little space on left and right without container trapping
               - 4 columns per row on desktop
               - Taller profile cards with direct Preview and Message options
               ═════════════════════════════════════════════════════════════════ */
            <motion.div
              key="list-mode"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full px-4 sm:px-6 lg:px-8 py-4 space-y-4 pb-28 lg:pb-12"
            >
              {/* Header Status Row */}
              <div className="flex items-center justify-between text-caption-1-semibold text-text-tertiary px-1">
                <span>Showing <strong className="text-text-primary">{workers.length}</strong> verified pro{workers.length !== 1 ? "s" : ""} in Dire Dawa</span>
                <span>Sorted by: <strong className="text-[#45BA50]">{filters.sortBy || "Nearest"}</strong></span>
              </div>

              {/* 4-Column Grid of Taller Profile Cards with Preview & Message Options */}
              {workers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-5">
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
                  <div className="rounded-3xl border border-dashed border-border-button-default p-12 text-center bg-background-secondary-default space-y-3">
                    <RiSearchEyeLine className="w-8 h-8 mx-auto text-[#45BA50]" />
                    <p className="text-body-medium font-bold text-text-primary">No matching artisans found</p>
                    <p className="text-caption-1-semibold text-text-tertiary">Try expanding your search criteria or resetting filters.</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-80 rounded-3xl bg-background-secondary-default animate-pulse border border-border-button-default" />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          3. FULL-SCREEN SLIDE-OVER FILTER DRAWER (Collapsible to the Right)
          - Mounted directly in document.body via createPortal
          - Contains Kebele Neighborhoods, Active Trades, Verified Toggle, Sliders
          ═════════════════════════════════════════════════════════════════════ */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {filterDrawerOpen && (
            <div className="fixed inset-0 z-[9999] flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setFilterDrawerOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative w-full sm:max-w-md h-full bg-background-primary-default border-l border-border-button-default shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between"
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
              className="relative w-full max-w-lg bg-background-primary-default rounded-3xl border border-border-button-default shadow-2xl p-5 sm:p-6 z-10 max-h-[90vh] overflow-y-auto space-y-5"
            >
              {/* Header with Close */}
              <div className="flex items-start justify-between pb-3 border-b border-separator-border/60">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-background-tertiary-default border border-border-button-default shrink-0">
                    <img
                      src={previewWorker.photo || "/default-avatar.svg"}
                      alt={previewWorker.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-title-3-semibold font-black text-text-primary">
                        {previewWorker.name}
                      </h2>
                      {previewWorker.isVerified && (
                        <span title="Kebele & Fayda Verified">
                          <RiShieldCheckFill className="w-5 h-5 text-[#45BA50]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1">
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
                  className="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-background-tertiary-default transition-colors cursor-pointer"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>

              {/* Rate & Rating Highlights Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-background-secondary-default border border-border-button-default text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary">Hourly Rate</p>
                  <p className="text-body-medium font-black text-text-primary mt-0.5">ETB {previewWorker.hourlyRate || "450"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary">Rating</p>
                  <p className="text-body-medium font-black text-amber-500 mt-0.5 flex items-center justify-center gap-0.5">
                    <RiStarFill className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{previewWorker.rating > 0 ? previewWorker.rating.toFixed(1) : "5.0"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary">Experience</p>
                  <p className="text-body-medium font-black text-text-primary mt-0.5">{previewWorker.reviews || 1} jobs</p>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-1.5">
                <h4 className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-tertiary text-[11px]">
                  About Artisan
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed bg-background-secondary-default/50 p-3.5 rounded-2xl border border-separator-border/60">
                  {previewWorker.bio || "Certified pro specializing in residential and commercial maintenance, electrical wiring, installation, and on-demand repairs with verified Kebele registration."}
                </p>
              </div>

              {/* Verified Skills */}
              {previewWorker.skills && previewWorker.skills.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-tertiary text-[11px]">
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
              <div className="pt-3 border-t border-separator-border/60 flex flex-col sm:flex-row items-center gap-2.5">
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
                  className="w-full sm:w-auto h-11 px-4 rounded-xl border border-border-button-default bg-background-secondary-default hover:bg-background-tertiary-default text-text-primary text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <RiUser3Line className="w-4 h-4 text-text-secondary" />
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
      <div className="h-[600px] w-full bg-background-secondary-default/40 animate-pulse rounded-3xl flex items-center justify-center border border-border-button-default">
        <RiCompass3Line className="h-8 w-8 animate-spin text-[#45BA50]" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
