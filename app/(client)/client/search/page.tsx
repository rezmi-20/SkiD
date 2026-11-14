"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import WorkerCard from "@/components/search/WorkerCard";
import SearchFilters from "@/components/search/SearchFilters";
import { Worker, ViewMode, SearchFilters as FilterType } from "@/components/search/types";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { setCachedWorker } from "@/lib/workerCache";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Map, 
  List, 
  AlertCircle, 
  SearchX, 
  SlidersHorizontal, 
  X, 
  Compass, 
  RotateCcw
} from "lucide-react";
import FadeContent from "@/components/ui/fade-content";
import { cx } from "@/utils/cx";

// Dynamically import Map with no SSR
const MapComponent = dynamic(() => import("@/components/search/MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-170px)] min-h-[580px] w-full bg-background-secondary-default animate-pulse rounded-3xl flex items-center justify-center border border-border-button-default">
      <div className="flex flex-col items-center gap-2 text-text-tertiary">
        <Compass className="h-8 w-8 animate-spin text-[#45BA50]" />
        <p className="text-xs font-bold text-text-secondary">Loading Interactive Map of Dire Dawa...</p>
      </div>
    </div>
  )
});

// Strictly 5 Active Trades in DireSkill (NO Coming Soon trades on search)
const CATEGORIES = [
  { label: "All Trades", value: "" },
  { label: "⚡ Electrical", value: "electrical" },
  { label: "💧 Plumber", value: "plumbing" },
  { label: "🎨 Painter", value: "painting" },
  { label: "✨ House Finishing", value: "house_finishing" },
  { label: "📡 Satellite Dish", value: "satellite_dish" },
];

function isCategorySelected(catVal: string, filterVal: string) {
  if (!filterVal && catVal === "") return true;
  if (!filterVal || !catVal) return false;
  const f = filterVal.toLowerCase().replace(/_/g, " ");
  const c = catVal.toLowerCase().replace(/_/g, " ");
  return f.includes(c) || c.includes(f);
}

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
  const searchParams = useSearchParams();
  const { location, loading: locLoading, accuracy, isLive, refreshLocation } = useLocation();

  const initialView = searchParams.get("view") === "map" ? "map" : "list";
  const initialCategory = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || searchParams.get("query") || "";

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

  const [filters, setFilters] = useState<FilterType>({
    query: initialQuery,
    category: initialCategory,
    minRating: 0,
    maxDistance: 50,
    sortBy: "Nearest",
    verifiedOnly: false,
  });

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 250);
    return () => clearTimeout(handler);
  }, [filters.query]);

  // Calculate number of active filters
  const activeFilterCount = useMemo(() => {
    return [
      Boolean(filters.category),
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
        const params = new URLSearchParams({
          query: debouncedQuery || "",
          category: filters.category === "All" ? "" : (filters.category || ""),
          minRating: filters.minRating.toString(),
          maxDistance: filters.maxDistance.toString(),
        });

        if (location) {
          params.append("lat", location.lat.toString());
          params.append("lng", location.lng.toString());
        }

        const res = await fetch(`/api/workers?${params.toString()}`);
        if (!res.ok) throw new Error("Could not retrieve workers");
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
              skill: Array.isArray(w.skills) ? w.skills[0] || "Professional" : "Professional",
              category: Array.isArray(w.skills) ? w.skills[0] || "" : "",
              rating: Number(w.avg_rating),
              reviews: Number(w.total_ratings),
              distance: distDisplay,
              lat,
              lng,
              photo: w.avatar_url || null,
              isVerified: w.is_verified,
              district: "Dire Dawa",
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
          setError(null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Failed to fetch workers", err);
          setError(`Fetch failed: ${err.message}.`);
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
  }, [debouncedQuery, filters.category, filters.minRating, filters.maxDistance, filters.sortBy, filters.verifiedOnly, location]);

  return (
    <FadeContent blur duration={0.3} className="space-y-4 w-full max-w-full pb-28 lg:pb-12">
      {/* ── 1. PAGE HEADER (Clean Brand Title & View Toggle) ── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Real-Time GPS Status Button */}
            <button
              type="button"
              onClick={refreshLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#134e27]/20 text-[#45BA50] border border-[#45BA50]/30 hover:bg-[#134e27]/30 active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Tap to refresh live GPS location"
            >
              <span className={cx(
                "w-2 h-2 rounded-full",
                locLoading ? "bg-amber-400 animate-pulse" : isLive ? "bg-[#45BA50] animate-ping" : "bg-[#45BA50]"
              )} />
              <span>
                {locLoading ? "Acquiring GPS..." : isLive ? `Live GPS: Dire Dawa (±${accuracy || 20}m)` : "Dire Dawa (Cached)"}
              </span>
              <RotateCcw className={cx("h-3 w-3 ml-0.5", locLoading ? "animate-spin" : "")} />
            </button>

            <span className="text-xs text-text-tertiary font-semibold">
              {workers.length} verified {workers.length === 1 ? "artisan" : "artisans"} found
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
            Find Verified Skilled Labor
          </h1>
        </div>

        {/* View Switcher Pill (List / Map) */}
        <div className="flex items-center bg-background-secondary-default p-1 rounded-full border border-border-button-default shadow-xs shrink-0 self-start sm:self-center">
          <button 
            onClick={() => setViewMode("list")}
            className={cx(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all active:scale-95 touch-manipulation",
              viewMode === "list"
                ? "bg-[#45BA50] text-white shadow-xs"
                : "text-text-tertiary hover:text-text-primary"
            )}
          >
            <List size={14} className="stroke-[2.5]" />
            <span>List View</span>
          </button>
          <button 
            onClick={() => setViewMode("map")}
            className={cx(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all active:scale-95 touch-manipulation",
              viewMode === "map"
                ? "bg-[#45BA50] text-white shadow-xs"
                : "text-text-tertiary hover:text-text-primary"
            )}
          >
            <Map size={14} className="stroke-[2.5]" />
            <span>Map View</span>
          </button>
        </div>
      </section>

      {error && (
        <Card className="border-border-error-default bg-background-secondary-default text-text-error-primary rounded-2xl">
          <CardContent className="p-3.5 flex items-center gap-2.5 text-xs font-semibold">
            <AlertCircle size={16} />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {/* ── 2. VIEW MODE TOGGLE LAYOUT ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {viewMode === "map" ? (
          /* ════════════════════════════════════════════════════════════════
             MAP MODE: GOOGLE MAPS EXPERIENCE
             - Full-bleed interactive map
             - Floating search bar & active trade chips
             - Floating "Filters" slide-over drawer trigger
             - Bottom floating selected worker card
             ════════════════════════════════════════════════════════════════ */
          <motion.div
            key="map-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="h-[calc(100vh-170px)] min-h-[580px] w-full rounded-3xl overflow-hidden relative shadow-2xl border border-border-button-default"
          >
            {/* ── Floating Map Search & Filter Header ── */}
            <div className="absolute top-4 inset-x-3 sm:inset-x-6 z-[1000] flex flex-col gap-2 max-w-xl mx-auto pointer-events-auto">
              {/* Floating Pill Search Bar */}
              <div className="flex items-center gap-2 bg-background-secondary-default/95 backdrop-blur-xl border border-border-button-default rounded-full px-3 py-1.5 shadow-2xl">
                <Search className="h-4 w-4 text-text-tertiary ml-1.5 shrink-0" />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
                  placeholder="Search electricians, plumbers, Kezira..."
                  className="bg-transparent text-xs sm:text-sm font-semibold text-text-primary placeholder:text-text-placeholder outline-none flex-1 min-w-0"
                />
                {filters.query && (
                  <button
                    onClick={() => setFilters(f => ({ ...f, query: "" }))}
                    className="p-1 rounded-full text-text-tertiary hover:text-text-primary shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                
                {/* Floating "Filters" slide trigger button */}
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(true)}
                  className={cx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-xs shrink-0",
                    activeFilterCount > 0
                      ? "bg-[#45BA50] text-white shadow-[0_2px_10px_rgba(69,186,80,0.35)]"
                      : "bg-background-tertiary-default border border-border-button-default text-text-primary hover:bg-background-tertiary-default/80"
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="h-4 w-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Floating Horizontal Active Category Chips (No Coming Soon Trades) */}
              <div className="overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 flex items-center gap-1.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = isCategorySelected(cat.value, filters.category);
                  return (
                    <button
                      key={cat.label}
                      onClick={() => setFilters(f => ({ ...f, category: isSelected && cat.value !== "" ? "" : cat.value }))}
                      className={cx(
                        "rounded-full text-[11px] font-black px-3.5 py-1.5 whitespace-nowrap shadow-md backdrop-blur-md transition-all active:scale-95 shrink-0 border",
                        isSelected
                          ? "bg-[#45BA50] text-white border-[#45BA50] shadow-[0_2px_8px_rgba(69,186,80,0.35)]"
                          : "bg-background-secondary-default/90 text-text-primary border-border-button-default hover:bg-background-secondary-default"
                      )}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Leaflet Interactive Map ── */}
            <MapComponent 
              workers={workers} 
              selectedWorkerId={selectedWorker?.id}
              onSelectWorker={(w) => setSelectedWorker(w)}
              className="h-full w-full"
            />

            {/* ── Floating Selected Worker Preview Card ── */}
            <AnimatePresence>
              {selectedWorker && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-5 inset-x-3 sm:inset-x-auto sm:left-6 w-auto max-w-[280px] z-[1000] pointer-events-auto"
                >
                  <div className="relative shadow-2xl rounded-[24px]">
                    <button
                      onClick={() => setSelectedWorker(null)}
                      className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-black flex items-center justify-center text-xs shadow-md active:scale-90 transition-transform"
                      title="Close Preview"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <WorkerCard worker={selectedWorker} className="shadow-2xl border-[#45BA50]/50" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ════════════════════════════════════════════════════════════════
             LIST MODE: WIDESCREEN DISCOVERY FEED
             - Search pill & active trade chips
             - Desktop sticky sidebar filters + Responsive Artisan Grid
             - Mobile responsive list with slide-over filter drawer button
             ════════════════════════════════════════════════════════════════ */
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 w-full"
          >
            {/* Top Search Box & Quick Filter Trigger Row */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary h-4 w-4" />
                <Input 
                  type="text"
                  placeholder="Search electricians, plumbers, Kezira, Dire Dawa..."
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  className="pl-9 pr-8 h-11 bg-background-secondary-default border-border-button-default rounded-full text-xs sm:text-sm font-semibold touch-manipulation focus-visible:ring-[#45BA50]"
                />
                {filters.query && (
                  <button
                    onClick={() => setFilters({ ...filters, query: "" })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Mobile Filter Slide Button */}
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                className={cx(
                  "flex lg:hidden items-center gap-1.5 px-4 h-11 rounded-full text-xs font-black transition-all active:scale-95 shadow-xs shrink-0",
                  activeFilterCount > 0
                    ? "bg-[#45BA50] text-white shadow-[0_2px_10px_rgba(69,186,80,0.35)]"
                    : "bg-background-secondary-default border border-border-button-default text-text-primary hover:bg-background-tertiary-default"
                )}
              >
                <SlidersHorizontal size={14} className="stroke-[2.5]" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="h-4 w-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Horizontal Quick Category Chips (Strictly Active Trades Only) */}
            <div className="overflow-x-auto no-scrollbar py-1 -mx-1 px-1 flex items-center gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = isCategorySelected(cat.value, filters.category);
                return (
                  <button
                    key={cat.label}
                    onClick={() => setFilters(f => ({ ...f, category: isSelected && cat.value !== "" ? "" : cat.value }))}
                    className={cx(
                      "rounded-full text-xs font-black px-4 py-2 whitespace-nowrap shadow-xs transition-all active:scale-95 shrink-0 border",
                      isSelected
                        ? "bg-[#45BA50] text-white border-[#45BA50] shadow-[0_2px_8px_rgba(69,186,80,0.35)]"
                        : "bg-background-secondary-default border-border-button-default text-text-primary hover:bg-background-tertiary-default"
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search & Results 2-Column Responsive Layout */}
            <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
              {/* Desktop Sticky Sidebar Filters */}
              <aside className="w-72 xl:w-80 shrink-0 hidden lg:block sticky top-20 rounded-3xl border border-border-button-default bg-background-secondary-default p-5 shadow-xs">
                <SearchFilters 
                  filters={filters} 
                  setFilters={setFilters} 
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  resultsCount={workers.length}
                />
              </aside>

              {/* Main Worker Cards Feed */}
              <main className="flex-grow w-full min-w-0">
                {/* Results Header Status */}
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-text-tertiary px-1">
                  <span>Showing {workers.length} verified pro{workers.length !== 1 ? "s" : ""}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]">Sorted by: <strong className="text-text-primary">{filters.sortBy || "Nearest"}</strong></span>
                  </div>
                </div>

                {workers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-4">
                    {workers.map((worker) => (
                      <WorkerCard key={worker.id} worker={worker} />
                    ))}
                  </div>
                ) : (
                  !loading && (
                    <div className="rounded-3xl border border-dashed border-border-button-default p-12 text-center bg-background-secondary-default shadow-xs space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#134e27] text-[#a4fe47] flex items-center justify-center mx-auto shadow-xs border border-[#45BA50]/30">
                        <SearchX size={22} className="stroke-[2.5]" />
                      </div>
                      <div className="max-w-xs mx-auto space-y-1">
                        <p className="font-black text-sm text-text-primary">No matching professionals</p>
                        <p className="text-xs text-text-secondary">
                          Try broadening your trade category or increasing your search radius in Dire Dawa.
                        </p>
                      </div>
                      <Button
                        onClick={() => setFilters({ query: "", category: "", minRating: 0, maxDistance: 50, sortBy: "Nearest", verifiedOnly: false })}
                        variant="outline"
                        className="rounded-full text-xs font-bold h-10 px-5 border-border-button-default mt-2 text-text-primary hover:bg-background-tertiary-default"
                      >
                        <RotateCcw size={13} className="mr-1.5" />
                        Reset All Filters
                      </Button>
                    </div>
                  )
                )}

                {loading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-4">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="h-64 bg-background-secondary-default/50 animate-pulse rounded-[24px] border border-border-button-default" />
                    ))}
                  </div>
                )}
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. SLIDE-OVER FILTER DRAWER (Mobile) ───────────────────────── */}
      <AnimatePresence>
        {filterDrawerOpen && (
          <div className="fixed inset-0 z-[2000] flex justify-end">
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
              className="relative w-full sm:max-w-md h-full bg-background-secondary-default border-l border-border-button-default shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between"
            >
              <SearchFilters
                filters={filters}
                setFilters={setFilters}
                viewMode={viewMode}
                setViewMode={setViewMode}
                resultsCount={workers.length}
                onClose={() => setFilterDrawerOpen(false)}
                onApply={() => setFilterDrawerOpen(false)}
                isDrawer
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FadeContent>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="h-[600px] w-full bg-background-secondary-default/40 animate-pulse rounded-3xl flex items-center justify-center border border-border-button-default">
        <Compass className="h-8 w-8 animate-spin text-[#45BA50]" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
