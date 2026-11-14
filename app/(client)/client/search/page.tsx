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
import { 
  RiSearchLine,
  RiMapPinLine,
  RiListCheck2,
  RiMap2Line,
  RiAlertLine,
  RiSearchEyeLine,
  RiEqualizerLine,
  RiCloseLine,
  RiCompass3Line,
  RiRestartLine,
  RiFlashlightFill,
  RiDropFill,
  RiPaintBrushFill,
  RiHomeGearFill,
  RiBroadcastFill,
  RiAppsLine,
  RiShieldCheckFill,
  RiStarFill,
  RiChat1Line,
  RiArrowRightLine
} from "@remixicon/react";
import { Chip } from "@/components/base/badges/chip";
import FadeContent from "@/components/ui/fade-content";
import { cx } from "@/utils/cx";

// Dynamically import Map with no SSR
const MapComponent = dynamic(() => import("@/components/search/MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-170px)] min-h-[580px] w-full bg-background-secondary-default animate-pulse rounded-3xl flex items-center justify-center border border-border-button-default">
      <div className="flex flex-col items-center gap-2 text-text-tertiary">
        <RiCompass3Line className="h-8 w-8 animate-spin text-[#45BA50]" />
        <p className="text-body-medium font-bold text-text-secondary">Loading Dire Dawa Interactive Map...</p>
      </div>
    </div>
  )
});

// Strictly 5 Active Trades (No Coming Soon trades on search)
const CATEGORIES = [
  { label: "All Trades", value: "", icon: RiAppsLine, color: "text-text-primary" },
  { label: "Electrical", value: "electrical", icon: RiFlashlightFill, color: "text-amber-500" },
  { label: "Plumber", value: "plumbing", icon: RiDropFill, color: "text-blue-500" },
  { label: "Painter", value: "painting", icon: RiPaintBrushFill, color: "text-pink-500" },
  { label: "House Finishing", value: "house_finishing", icon: RiHomeGearFill, color: "text-emerald-500" },
  { label: "Satellite Dish", value: "satellite_dish", icon: RiBroadcastFill, color: "text-cyan-500" },
];

const DIRE_DAWA_NEIGHBORHOODS = [
  "All Dire Dawa",
  "Kezira",
  "Sabian",
  "Megala",
  "Gende Kore",
  "Addis Ketema",
  "Taiwan"
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
  const [previewWorker, setPreviewWorker] = useState<Worker | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("All Dire Dawa");

  const [filters, setFilters] = useState<FilterType>({
    query: initialQuery,
    category: initialCategory,
    minRating: 0,
    maxDistance: 50,
    sortBy: "Nearest",
    verifiedOnly: false,
  });

  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 220);
    return () => clearTimeout(handler);
  }, [filters.query]);

  const activeFilterCount = useMemo(() => {
    return [
      Boolean(filters.category),
      Boolean(filters.minRating > 0),
      Boolean(filters.maxDistance && filters.maxDistance < 50),
      Boolean(filters.verifiedOnly),
      Boolean(filters.query),
      Boolean(selectedNeighborhood !== "All Dire Dawa"),
    ].filter(Boolean).length;
  }, [filters, selectedNeighborhood]);

  useEffect(() => {
    let isCancelled = false;

    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const queryWithNeighborhood = selectedNeighborhood !== "All Dire Dawa"
          ? `${debouncedQuery} ${selectedNeighborhood}`.trim()
          : debouncedQuery;

        const params = new URLSearchParams({
          query: queryWithNeighborhood || "",
          category: filters.category === "All" ? "" : (filters.category || ""),
          minRating: filters.minRating.toString(),
          maxDistance: filters.maxDistance.toString(),
        });

        if (location) {
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
  }, [debouncedQuery, filters.category, filters.minRating, filters.maxDistance, filters.sortBy, filters.verifiedOnly, selectedNeighborhood, location]);

  return (
    <FadeContent blur duration={0.3} className="space-y-4 w-full max-w-full pb-28 lg:pb-12">
      {/* ── 1. PAGE HEADER: Title, Proximity GPS, and View Toggle ── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Real-Time GPS Proximity Badge */}
            <button
              type="button"
              onClick={refreshLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#134e27]/25 text-[#45BA50] border border-[#45BA50]/35 hover:bg-[#134e27]/35 active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Tap to refresh live GPS position in Dire Dawa"
            >
              <span className={cx(
                "w-2 h-2 rounded-full",
                locLoading ? "bg-amber-400 animate-pulse" : isLive ? "bg-[#45BA50] animate-ping" : "bg-[#45BA50]"
              )} />
              <span>
                {locLoading ? "Acquiring GPS..." : isLive ? `Live GPS: Dire Dawa (±${accuracy || 18}m)` : "Dire Dawa (Active)"}
              </span>
              <RiRestartLine className={cx("w-3 h-3 ms-0.5", locLoading ? "animate-spin" : "")} />
            </button>

            <span className="text-caption-1-semibold text-text-tertiary">
              {workers.length} verified {workers.length === 1 ? "artisan" : "artisans"} available
            </span>
          </div>

          <h1 className="text-title-1-medium font-black text-text-primary tracking-tight">
            Find Verified Skilled Labor
          </h1>
        </div>

        {/* View Switcher Pill (List View / Map View) */}
        <div className="flex items-center bg-background-secondary-default p-1 rounded-2xl border border-border-button-default shadow-xs shrink-0 self-start sm:self-center">
          <button 
            onClick={() => setViewMode("list")}
            className={cx(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 touch-manipulation",
              viewMode === "list"
                ? "bg-[#45BA50] text-white shadow-xs font-black"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            <RiListCheck2 className="w-4 h-4" />
            <span>List View</span>
          </button>
          <button 
            onClick={() => setViewMode("map")}
            className={cx(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 touch-manipulation",
              viewMode === "map"
                ? "bg-[#45BA50] text-white shadow-xs font-black"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            <RiMap2Line className="w-4 h-4" />
            <span>Map View</span>
          </button>
        </div>
      </section>

      {error && (
        <div className="p-3.5 rounded-2xl border border-border-error-default bg-background-secondary-default text-text-error-primary flex items-center gap-2.5 text-xs font-semibold">
          <RiAlertLine className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 2. VIEW MODE TOGGLE LAYOUT ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {viewMode === "map" ? (
          /* ════════════════════════════════════════════════════════════════
             MAP MODE: GOOGLE MAPS STYLE EXPERIENCE
             ════════════════════════════════════════════════════════════════ */
          <motion.div
            key="map-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="h-[calc(100vh-170px)] min-h-[580px] w-full rounded-3xl overflow-hidden relative shadow-2xl border border-border-button-default"
          >
            {/* ── Floating Header Controls ── */}
            <div className="absolute top-4 inset-x-3 sm:inset-x-6 z-[1000] flex flex-col gap-2 max-w-xl mx-auto pointer-events-auto">
              {/* Floating Pill Search Bar */}
              <div className="flex items-center gap-2 bg-background-secondary-default/95 backdrop-blur-xl border border-border-button-default rounded-full px-3 py-1.5 shadow-2xl">
                <RiSearchLine className="w-4 h-4 text-text-tertiary ms-1.5 shrink-0" />
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
                    <RiCloseLine className="w-3.5 h-3.5" />
                  </button>
                )}
                
                {/* Floating "Filters" slide trigger button */}
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(true)}
                  className={cx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-xs shrink-0",
                    activeFilterCount > 0
                      ? "bg-[#45BA50] text-white shadow-[0_2px_10px_rgba(69,186,80,0.35)]"
                      : "bg-background-tertiary-default border border-border-button-default text-text-primary hover:bg-background-tertiary-default/80"
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
              </div>

              {/* Floating Active Trade Chips */}
              <div className="overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 flex items-center gap-1.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = isCategorySelected(cat.value, filters.category);
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.label}
                      onClick={() => setFilters(f => ({ ...f, category: isSelected && cat.value !== "" ? "" : cat.value }))}
                      className={cx(
                        "rounded-full text-[11px] font-bold px-3 py-1.5 whitespace-nowrap shadow-md backdrop-blur-md transition-all active:scale-95 shrink-0 border flex items-center gap-1.5",
                        isSelected
                          ? "bg-[#45BA50] text-white border-[#45BA50] shadow-[0_2px_8px_rgba(69,186,80,0.35)]"
                          : "bg-background-secondary-default/95 text-text-primary border-border-button-default hover:bg-background-secondary-default"
                      )}
                    >
                      <Icon className={cx("w-3.5 h-3.5", isSelected ? "text-white" : cat.color)} />
                      <span>{cat.label}</span>
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

            {/* ── Bottom Floating Worker Preview Card ── */}
            <AnimatePresence>
              {selectedWorker && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 30, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-5 inset-x-3 sm:inset-x-auto sm:left-6 w-auto max-w-[320px] z-[1000] pointer-events-auto"
                >
                  <div className="relative shadow-2xl rounded-3xl">
                    <button
                      onClick={() => setSelectedWorker(null)}
                      className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full bg-black/75 backdrop-blur-md text-white hover:bg-black flex items-center justify-center text-xs shadow-md active:scale-90 transition-transform"
                      title="Close Preview"
                    >
                      <RiCloseLine className="w-4 h-4" />
                    </button>
                    <WorkerCard 
                      worker={selectedWorker} 
                      className="shadow-2xl border-[#45BA50]/50" 
                      onPreview={(w) => setPreviewWorker(w)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ════════════════════════════════════════════════════════════════
             LIST MODE: WIDESCREEN DISCOVERY FEED
             ════════════════════════════════════════════════════════════════ */
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 w-full"
          >
            {/* ── Search Input & Quick Controls Bar ── */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <RiSearchLine className="absolute start-3.5 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4 pointer-events-none" />
                <input 
                  type="text"
                  placeholder="Search electricians, plumbers, Kezira, Dire Dawa..."
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  className="w-full ps-10 pe-9 h-11 bg-background-secondary-default border border-border-button-default rounded-full text-body-medium text-text-primary placeholder:text-text-placeholder outline-none focus:border-[#45BA50] transition-colors"
                />
                {filters.query && (
                  <button
                    onClick={() => setFilters({ ...filters, query: "" })}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-0.5"
                  >
                    <RiCloseLine className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Slide Button */}
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                className={cx(
                  "flex lg:hidden items-center gap-1.5 px-4 h-11 rounded-full text-xs font-bold transition-all active:scale-95 shadow-xs shrink-0 border",
                  activeFilterCount > 0
                    ? "bg-[#45BA50] text-white border-[#45BA50] shadow-[0_2px_10px_rgba(69,186,80,0.35)]"
                    : "bg-background-secondary-default border-border-button-default text-text-primary hover:bg-background-tertiary-default"
                )}
              >
                <RiEqualizerLine className="w-4 h-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="h-4 w-4 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* ── Dire Dawa Neighborhood Selector Pills ── */}
            <div className="overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-text-tertiary flex items-center gap-1 shrink-0 pe-1">
                <RiMapPinLine className="w-3.5 h-3.5 text-[#45BA50]" /> Kebele:
              </span>
              {DIRE_DAWA_NEIGHBORHOODS.map((nh) => {
                const isSelected = selectedNeighborhood === nh;
                return (
                  <button
                    key={nh}
                    onClick={() => setSelectedNeighborhood(nh)}
                    className={cx(
                      "rounded-lg text-[11px] font-bold px-2.5 py-1 whitespace-nowrap transition-all active:scale-95 shrink-0 border",
                      isSelected
                        ? "bg-[#134e27] text-[#a4fe47] border-[#45BA50] font-black shadow-xs"
                        : "bg-background-secondary-default border-border-button-default text-text-secondary hover:bg-background-tertiary-default"
                    )}
                  >
                    {nh}
                  </button>
                );
              })}
            </div>

            {/* ── 5 Active Trades Horizontal Bar ── */}
            <div className="overflow-x-auto no-scrollbar py-1 -mx-1 px-1 flex items-center gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = isCategorySelected(cat.value, filters.category);
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.label}
                    onClick={() => setFilters(f => ({ ...f, category: isSelected && cat.value !== "" ? "" : cat.value }))}
                    className={cx(
                      "rounded-full text-body-medium font-bold px-4 py-2 whitespace-nowrap shadow-xs transition-all active:scale-95 shrink-0 border flex items-center gap-2",
                      isSelected
                        ? "bg-[#45BA50] text-white border-[#45BA50] shadow-[0_2px_8px_rgba(69,186,80,0.35)]"
                        : "bg-background-secondary-default border-border-button-default text-text-primary hover:bg-background-tertiary-default"
                    )}
                  >
                    <Icon className={cx("w-4 h-4", isSelected ? "text-white" : cat.color)} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ── 2-Column Responsive Layout (Sidebar + Grid) ── */}
            <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
              {/* Desktop Sticky Sidebar */}
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
                <div className="flex items-center justify-between mb-3 text-caption-1-semibold text-text-tertiary px-1">
                  <span>Showing {workers.length} verified pro{workers.length !== 1 ? "s" : ""}</span>
                  <div className="flex items-center gap-2">
                    <span>Sorted by: <strong className="text-text-primary">{filters.sortBy || "Nearest"}</strong></span>
                  </div>
                </div>

                {workers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {workers.map((worker) => (
                      <WorkerCard 
                        key={worker.id} 
                        worker={worker} 
                        onPreview={(w) => setPreviewWorker(w)}
                      />
                    ))}
                  </div>
                ) : (
                  !loading && (
                    <div className="rounded-3xl border border-dashed border-border-button-default p-12 text-center bg-background-secondary-default shadow-xs space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#134e27] text-[#a4fe47] flex items-center justify-center mx-auto shadow-xs border border-[#45BA50]/30">
                        <RiSearchEyeLine className="w-6 h-6" />
                      </div>
                      <div className="max-w-xs mx-auto space-y-1">
                        <p className="text-title-3-semibold font-black text-text-primary">No matching artisans</p>
                        <p className="text-caption-1-semibold text-text-secondary">
                          Try selecting another trade or expanding your search distance in Dire Dawa.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedNeighborhood("All Dire Dawa");
                          setFilters({ query: "", category: "", minRating: 0, maxDistance: 50, sortBy: "Nearest", verifiedOnly: false });
                        }}
                        className="rounded-full text-xs font-bold h-10 px-5 border border-border-button-default mt-2 text-text-primary hover:bg-background-tertiary-default inline-flex items-center gap-1.5 transition-colors"
                      >
                        <RiRestartLine className="w-3.5 h-3.5" />
                        <span>Reset All Filters</span>
                      </button>
                    </div>
                  )
                )}

                {loading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="h-72 bg-background-secondary-default/50 animate-pulse rounded-3xl border border-border-button-default" />
                    ))}
                  </div>
                )}
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. QUICK PREVIEW MODAL / DRAWER (Enhanced UX) ── */}
      <AnimatePresence>
        {previewWorker && (
          <div className="fixed inset-0 z-[2050] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewWorker(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative w-full max-w-lg bg-background-secondary-default border border-border-button-default rounded-3xl shadow-2xl p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-background-tertiary-default shrink-0">
                    <img 
                      src={previewWorker.photo || "/default-avatar.svg"} 
                      alt={previewWorker.name}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-title-3-semibold font-black text-text-primary">{previewWorker.name}</h2>
                      {previewWorker.isVerified && (
                        <RiShieldCheckFill className="w-4 h-4 text-[#45BA50]" />
                      )}
                    </div>
                    <p className="text-caption-1-semibold text-text-tertiary flex items-center gap-1">
                      <RiMapPinLine className="w-3.5 h-3.5 text-[#45BA50]" />
                      <span>Dire Dawa · {previewWorker.district || "Kezira"}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewWorker(null)}
                  className="h-8 w-8 rounded-lg bg-background-tertiary-default text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              </div>

              {/* Rates and Stats Row */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-background-primary-default border border-border-button-default text-center">
                <div>
                  <p className="text-[10px] text-text-tertiary uppercase font-bold">Hourly Rate</p>
                  <p className="text-body-medium font-black text-text-primary mt-0.5">ETB {previewWorker.hourlyRate || "450"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-text-tertiary uppercase font-bold">Rating</p>
                  <p className="text-body-medium font-black text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                    <RiStarFill className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{previewWorker.rating > 0 ? previewWorker.rating.toFixed(1) : "5.0"}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-tertiary uppercase font-bold">Reviews</p>
                  <p className="text-body-medium font-black text-text-primary mt-0.5">{previewWorker.reviews || 0} jobs</p>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <p className="text-caption-1-semibold text-text-tertiary font-bold uppercase tracking-wider">About Artisan</p>
                <p className="text-body-regular text-text-secondary text-xs leading-relaxed">
                  {previewWorker.bio || `${previewWorker.name} is a certified ${previewWorker.skill} professional operating in Dire Dawa with verified Fayda ID and credentials.`}
                </p>
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <p className="text-caption-1-semibold text-text-tertiary font-bold uppercase tracking-wider">Verified Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(previewWorker.skills && previewWorker.skills.length > 0 ? previewWorker.skills : [previewWorker.skill]).map((sk) => (
                    <Chip key={sk} variant="caption" color="soft" className="text-xs">
                      {sk}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href={`/client/worker/${previewWorker.id}`}
                  className="flex-1 h-11 rounded-xl border border-border-button-default bg-background-primary-default hover:bg-background-tertiary-default text-text-primary text-xs font-bold inline-flex items-center justify-center transition-colors"
                >
                  Full Profile
                </Link>
                <Link
                  href={`/client/contract/new?workerId=${previewWorker.id}`}
                  className="flex-1 h-11 rounded-xl bg-[#45BA50] hover:bg-[#3ca346] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(69,186,80,0.3)] transition-all active:scale-95"
                >
                  <span>Book Artisan</span>
                  <RiArrowRightLine className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── 4. SLIDE-OVER FILTER DRAWER (Mobile) ───────────────────────── */}
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
        <RiCompass3Line className="h-8 w-8 animate-spin text-[#45BA50]" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
