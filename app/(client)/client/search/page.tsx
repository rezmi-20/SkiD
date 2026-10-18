"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import WorkerCard from "@/components/search/WorkerCard";
import SearchFilters from "@/components/search/SearchFilters";
import { Worker, ViewMode, SearchFilters as FilterType } from "@/components/search/types";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { setCachedWorker } from "@/lib/workerCache";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

// Dynamically import Map with no SSR
const MapComponent = dynamic(() => import("@/components/search/MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-170px)] min-h-[580px] w-full bg-muted/40 animate-pulse rounded-3xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Compass className="h-8 w-8 animate-spin text-[#a3e635]" />
        <p className="text-xs font-bold">Loading Interactive Map of Dire Dawa...</p>
      </div>
    </div>
  )
});

const CATEGORIES = [
  { label: "All Trades", value: "" },
  { label: "⚡ Electrician", value: "Electrician" },
  { label: "💧 Plumber", value: "Plumber" },
  { label: "🎨 Painter", value: "Painter" },
  { label: "🪵 Carpentry", value: "Carpentry" },
  { label: "📡 Satellite Dish", value: "Satellite Dish" },
  { label: "✨ House Finishing", value: "House Finishing" },
];

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

  // Initialize view mode and filters from URL query parameters
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

  // Debounce search query to prevent typing lag and out-of-order race conditions
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
          // Bulk seed worker cache so any profile clicked opens with 0ms delay
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
            
            // Calculate live distance if user location is available
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
            };
          });

          // Client-side verified pro filter
          if (filters.verifiedOnly) {
            mapped = mapped.filter(w => w.isVerified);
          }

          // Client-side sorting
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
    <FadeContent blur duration={0.3} className="space-y-4 max-w-full pb-28 md:pb-8">
      {/* ── 1. PAGE HEADER (Clean without redundant explanations) ── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Real-Time GPS Status Button */}
            <button
              type="button"
              onClick={refreshLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#a3e635]/15 text-emerald-600 dark:text-[#a3e635] border border-[#a3e635]/30 hover:bg-[#a3e635]/25 active:scale-95 transition-all cursor-pointer shadow-sm"
              title="Tap to refresh live GPS location"
            >
              <span className={`w-2 h-2 rounded-full ${locLoading ? 'bg-amber-400 animate-pulse' : isLive ? 'bg-[#a3e635] animate-ping' : 'bg-emerald-500'}`} />
              <span>
                {locLoading ? "Acquiring GPS..." : isLive ? `Live GPS: Dire Dawa (±${accuracy || 20}m)` : "Dire Dawa (Cached)"}
              </span>
              <RotateCcw className={`h-3 w-3 ml-0.5 ${locLoading ? 'animate-spin' : ''}`} />
            </button>

            <span className="text-xs text-muted-foreground font-semibold">
              {workers.length} {workers.length === 1 ? "worker" : "workers"} found
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Find Verified Skilled Labor
          </h1>
        </div>

        {/* View Switcher Pill (List / Map) */}
        <div className="flex items-center bg-muted/60 dark:bg-[#181d24] p-1 rounded-full border border-outline-variant/60 shadow-sm shrink-0 self-start sm:self-center">
          <button 
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all active:scale-95 touch-manipulation ${
              viewMode === "list"
                ? "bg-[#a3e635] text-black shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List size={14} className="stroke-[2.5]" />
            <span>List View</span>
          </button>
          <button 
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all active:scale-95 touch-manipulation ${
              viewMode === "map"
                ? "bg-[#a3e635] text-black shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Map size={14} className="stroke-[2.5]" />
            <span>Map View</span>
          </button>
        </div>
      </section>

      {error && (
        <Card className="border-destructive/30 bg-destructive/10 text-destructive rounded-2xl">
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
             - Floating search bar & category chips
             - Floating "Filters" slide-over drawer trigger
             - Bottom floating selected worker card (New Sophie Bennett Card)
             ════════════════════════════════════════════════════════════════ */
          <motion.div
            key="map-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="h-[calc(100vh-170px)] min-h-[580px] w-full rounded-3xl overflow-hidden relative shadow-2xl border border-outline-variant/60"
          >
            {/* ── Floating Google Maps Search & Filter Header ── */}
            <div className="absolute top-4 inset-x-3 sm:inset-x-6 z-[1000] flex flex-col gap-2 max-w-xl mx-auto pointer-events-auto">
              {/* Floating Pill Search Bar */}
              <div className="flex items-center gap-2 bg-card/95 backdrop-blur-xl border border-outline-variant/80 rounded-full px-3 py-1.5 shadow-2xl">
                <Search className="h-4 w-4 text-muted-foreground ml-1.5 shrink-0" />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
                  placeholder="Search electricians, plumbers, Kezira..."
                  className="bg-transparent text-xs sm:text-sm font-semibold text-foreground placeholder:text-muted-foreground outline-none flex-1 min-w-0"
                />
                {filters.query && (
                  <button
                    onClick={() => setFilters(f => ({ ...f, query: "" }))}
                    className="p-1 rounded-full text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                
                {/* Floating "Filters" slide trigger button */}
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 shadow-sm shrink-0 ${
                    activeFilterCount > 0
                      ? "bg-[#a3e635] text-black shadow-[0_2px_10px_rgba(163,230,53,0.35)]"
                      : "bg-surface-container border border-outline-variant/60 text-on-surface hover:bg-surface-container-high"
                  }`}
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

              {/* Floating Horizontal Category Chips */}
              <div className="overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 flex items-center gap-1.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = (!filters.category && cat.value === "") || filters.category === cat.value;
                  return (
                    <button
                      key={cat.label}
                      onClick={() => setFilters(f => ({ ...f, category: f.category === cat.value ? "" : cat.value }))}
                      className={`rounded-full text-[11px] font-black px-3 py-1 whitespace-nowrap shadow-md backdrop-blur-md transition-all active:scale-95 shrink-0 border ${
                        isSelected
                          ? "bg-[#a3e635] text-black border-[#a3e635] shadow-[0_2px_8px_rgba(163,230,53,0.35)]"
                          : "bg-card/90 text-foreground border-outline-variant/60 hover:bg-card"
                      }`}
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

            {/* ── Floating Selected Worker Preview Card (New Sophie Bennett Card) ── */}
            <AnimatePresence>
              {selectedWorker && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-5 inset-x-3 sm:inset-x-auto sm:left-6 w-auto max-w-[260px] sm:max-w-[280px] z-[1000] pointer-events-auto"
                >
                  <div className="relative shadow-2xl rounded-[24px]">
                    {/* Close button on top right of the card */}
                    <button
                      onClick={() => setSelectedWorker(null)}
                      className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-black flex items-center justify-center text-xs shadow-md active:scale-90 transition-transform"
                      title="Close Preview"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <WorkerCard worker={selectedWorker} className="shadow-2xl border-[#a3e635]/40" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ════════════════════════════════════════════════════════════════
             LIST MODE: SHOPNEST DISCOVERY FEED
             - Search pill & filter chips
             - Desktop sticky sidebar filters + Compact Sophie Bennett Cards Grid
             - Mobile responsive list with slide-over filter drawer button
             ════════════════════════════════════════════════════════════════ */
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Top Search Box & Quick Filter Trigger Row */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  type="text"
                  placeholder="Search electricians, plumbers, Kezira, Dire Dawa..."
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  className="pl-9 pr-8 h-11 bg-card border-outline-variant/60 rounded-full text-xs sm:text-sm font-semibold touch-manipulation focus:border-[#a3e635]"
                />
                {filters.query && (
                  <button
                    onClick={() => setFilters({ ...filters, query: "" })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Mobile Filter Slide Button */}
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                className={`flex lg:hidden items-center gap-1.5 px-4 h-11 rounded-full text-xs font-black transition-all active:scale-95 shadow-sm shrink-0 ${
                  activeFilterCount > 0
                    ? "bg-[#a3e635] text-black shadow-[0_2px_10px_rgba(163,230,53,0.35)]"
                    : "bg-surface-container border border-outline-variant/60 text-on-surface hover:bg-surface-container-high"
                }`}
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

            {/* Horizontal Quick Category Chips */}
            <div className="overflow-x-auto no-scrollbar py-1 -mx-1 px-1 flex items-center gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = (!filters.category && cat.value === "") || filters.category === cat.value;
                return (
                  <button
                    key={cat.label}
                    onClick={() => setFilters(f => ({ ...f, category: f.category === cat.value ? "" : cat.value }))}
                    className={`rounded-full text-xs font-black px-4 py-2 whitespace-nowrap shadow-sm transition-all active:scale-95 shrink-0 border ${
                      isSelected
                        ? "bg-[#a3e635] text-black border-[#a3e635] shadow-[0_2px_8px_rgba(163,230,53,0.35)]"
                        : "bg-card border-outline-variant/60 text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Search & Results 2-Column Layout */}
            <div className="flex flex-col lg:flex-row gap-5 items-start">
              {/* Desktop Sticky Sidebar Filters */}
              <aside className="w-80 shrink-0 hidden lg:block sticky top-20 rounded-3xl border border-outline-variant/60 bg-card p-5 shadow-sm">
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
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-muted-foreground px-1">
                  <span>Showing {workers.length} verified pro{workers.length !== 1 ? "s" : ""}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]">Sorted by: <strong className="text-foreground">{filters.sortBy || "Nearest"}</strong></span>
                  </div>
                </div>

                {workers.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                    {workers.map((worker) => (
                      <WorkerCard key={worker.id} worker={worker} />
                    ))}
                  </div>
                ) : (
                  !loading && (
                    <div className="rounded-3xl border border-dashed border-outline-variant/60 p-12 text-center bg-card shadow-sm space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#181d24] text-[#a3e635] flex items-center justify-center mx-auto shadow-sm">
                        <SearchX size={22} className="stroke-[2.5]" />
                      </div>
                      <div className="max-w-xs mx-auto space-y-1">
                        <p className="font-black text-sm text-foreground">No matching professionals</p>
                        <p className="text-xs text-muted-foreground">
                          Try broadening your category or increasing your search radius in Dire Dawa.
                        </p>
                      </div>
                      <Button
                        onClick={() => setFilters({ query: "", category: "", minRating: 0, maxDistance: 50, sortBy: "Nearest", verifiedOnly: false })}
                        variant="outline"
                        className="rounded-full text-xs font-bold h-10 px-5 border-outline-variant/60 mt-2"
                      >
                        <RotateCcw size={13} className="mr-1.5" />
                        Reset All Filters
                      </Button>
                    </div>
                  )
                )}

                {loading && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="h-64 bg-muted/40 animate-pulse rounded-[24px] border border-outline-variant/30" />
                    ))}
                  </div>
                )}
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. SLIDE-OVER FILTER DRAWER (Triggered by "Filters" button) ─ */}
      <AnimatePresence>
        {filterDrawerOpen && (
          <div className="fixed inset-0 z-[2000] flex justify-end">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFilterDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-in drawer container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full sm:max-w-md h-full bg-card border-l border-outline-variant/60 shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between"
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
      <div className="h-[600px] w-full bg-muted/30 animate-pulse rounded-3xl flex items-center justify-center">
        <Compass className="h-8 w-8 animate-spin text-[#a3e635]" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
