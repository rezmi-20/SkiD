"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import WorkerCard from "@/components/search/WorkerCard";
import SearchFilters from "@/components/search/SearchFilters";
import { Worker, SearchFilters as FilterType } from "@/components/search/types";
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
  RiSearchEyeLine
} from "@remixicon/react";
import FadeContent from "@/components/ui/fade-content";
import { cx } from "@/utils/cx";

// Dynamically import Map with no SSR
const MapComponent = dynamic(() => import("@/components/search/MapComponent"), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-background-secondary-default animate-pulse flex items-center justify-center border border-border-button-default">
      <div className="flex flex-col items-center gap-2 text-text-tertiary">
        <RiCompass3Line className="h-8 w-8 animate-spin text-[#45BA50]" />
        <p className="text-caption-1-semibold font-bold text-text-secondary">Loading Dire Dawa Live Map...</p>
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
  const searchParams = useSearchParams();
  const { location, loading: locLoading, accuracy, isLive, refreshLocation } = useLocation();

  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initialCategory = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || searchParams.get("query") || "";

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);

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
    <FadeContent blur duration={0.25} className="w-full max-w-full pb-20 lg:pb-6">
      
      {/* ── Client Render Switch: Only ONE MapComponent is ever mounted in DOM ── */}
      {mounted && !isDesktop && (
        /* ═════════════════════════════════════════════════════════════════════
            MOBILE VIEW (< lg): RIDE-HAILING APPS EXPERIENCE (Like Image 2)
            - Top: Live interactive Map with floating search & location button
            - Bottom: Clean sliding bottom sheet with compact artisan list & CTA
            ═════════════════════════════════════════════════════════════════════ */
        <div className="w-full relative min-h-[calc(100vh-140px)] flex flex-col">
          
          {/* Top Half: Live Interactive Map of Dire Dawa */}
          <div className="h-[42vh] min-h-[270px] w-full relative rounded-b-3xl overflow-hidden border-b border-border-button-default shadow-md">
            {/* Floating Top Search & Filter Bar on Map */}
            <div className="absolute top-3 inset-x-3 z-[1000] flex items-center gap-2 pointer-events-auto">
              <div className="flex-1 flex items-center gap-2 h-11 px-3.5 rounded-full bg-background-primary-default/95 backdrop-blur-xl border border-border-button-default shadow-xl">
                <RiSearchLine className="w-4 h-4 text-text-tertiary shrink-0" />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
                  placeholder="Search Kezira, painters, electricians..."
                  className="bg-transparent text-xs font-semibold text-text-primary placeholder:text-text-placeholder outline-none flex-1 min-w-0"
                />
                {filters.query && (
                  <button
                    onClick={() => setFilters(f => ({ ...f, query: "" }))}
                    className="p-1 text-text-tertiary hover:text-text-primary shrink-0"
                  >
                    <RiCloseLine className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dedicated Slide-in Filters Button */}
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(true)}
                className={cx(
                  "h-11 px-3.5 rounded-full text-xs font-bold transition-all active:scale-95 shadow-xl shrink-0 flex items-center gap-1.5 border",
                  activeFilterCount > 0
                    ? "bg-[#45BA50] text-white border-[#45BA50] shadow-[0_2px_10px_rgba(69,186,80,0.35)]"
                    : "bg-background-primary-default/95 backdrop-blur-xl border-border-button-default text-text-primary"
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

            {/* Single Mobile Leaflet Map */}
            <MapComponent 
              workers={workers} 
              selectedWorkerId={selectedWorker?.id}
              onSelectWorker={(w) => setSelectedWorker(w)}
              className="h-full w-full"
            />
          </div>

          {/* Bottom Half: Clean Bottom Sheet (Direct Uber / Sky Style) */}
          <div className="flex-1 bg-background-primary-default -mt-5 rounded-t-[32px] border-t border-border-button-default shadow-2xl relative z-10 px-4 pt-3 pb-24 flex flex-col justify-between">
            <div>
              {/* Grab Notch Handle */}
              <div 
                onClick={() => setFilterDrawerOpen(true)}
                className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mb-3 cursor-pointer" 
              />

              {/* Sheet Title Row */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-separator-border">
                <div>
                  <h2 className="text-body-medium font-black text-text-primary tracking-tight">
                    Choose an Artisan
                  </h2>
                  <p className="text-[11px] text-text-tertiary">
                    {workers.length} verified pros nearby in Dire Dawa
                  </p>
                </div>

                {/* Live GPS Proximity Button */}
                <button
                  type="button"
                  onClick={refreshLocation}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#134e27]/20 text-[#45BA50] border border-[#45BA50]/30 active:scale-95 transition-transform"
                  title="Refresh GPS Location"
                >
                  <span className={cx(
                    "w-1.5 h-1.5 rounded-full",
                    locLoading ? "bg-amber-400 animate-pulse" : isLive ? "bg-[#45BA50] animate-ping" : "bg-[#45BA50]"
                  )} />
                  <span>±{accuracy || 20}m GPS</span>
                  <RiRestartLine className={cx("w-2.5 h-2.5 ms-0.5", locLoading ? "animate-spin" : "")} />
                </button>
              </div>

              {/* Compact Artisan Cards List (Image 2 Sky Comfort/Sky Premium Style) */}
              <div className="space-y-2 max-h-[38vh] overflow-y-auto no-scrollbar">
                {workers.length > 0 ? (
                  workers.map((worker) => (
                    <WorkerCard
                      key={worker.id}
                      worker={worker}
                      isSelected={selectedWorker?.id === worker.id}
                      onSelect={(w) => setSelectedWorker(w)}
                    />
                  ))
                ) : (
                  !loading && (
                    <div className="p-6 text-center rounded-2xl bg-background-secondary-default border border-dashed border-border-button-default space-y-2">
                      <p className="text-xs font-bold text-text-primary">No matching artisans found</p>
                      <p className="text-[10px] text-text-tertiary">Try resetting filters to show all verified pros in Dire Dawa.</p>
                      <button
                        onClick={() => setFilters({ query: "", category: "", neighborhood: "All Dire Dawa", minRating: 0, maxDistance: 50, sortBy: "Nearest", verifiedOnly: false })}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-[#45BA50] text-white"
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
            </div>

            {/* Sticky Bottom Full-Width Booking Pill Button */}
            {selectedWorker && (
              <div className="pt-3 border-t border-separator-border flex items-center gap-2 mt-2">
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
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          DESKTOP VIEW (lg:): ELEGANT SPLIT-SCREEN LAYOUT
          - Left Column (42%): Search bar, filter drawer trigger, artisan list
          - Right Column (58%): Full-height sticky interactive map of Dire Dawa
          ═════════════════════════════════════════════════════════════════════ */}
      {mounted && isDesktop && (
        <div className="grid grid-cols-12 gap-6 items-start w-full">
          
          {/* Left Column (5 cols / ~42%): Clean Artisan Selection Panel */}
          <div className="col-span-5 flex flex-col h-[calc(100vh-100px)] justify-between bg-background-primary-default p-1">
            <div className="space-y-3">
              {/* Clean Top Search & Controls Row */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 h-11 px-3.5 rounded-full bg-background-secondary-default border border-border-button-default shadow-xs focus-within:border-[#45BA50] transition-colors">
                  <RiSearchLine className="w-4 h-4 text-text-tertiary shrink-0" />
                  <input
                    type="text"
                    value={filters.query}
                    onChange={(e) => setFilters(f => ({ ...f, query: e.target.value }))}
                    placeholder="Search electricians, plumbers, Kezira..."
                    className="bg-transparent text-xs font-semibold text-text-primary placeholder:text-text-placeholder outline-none flex-1 min-w-0"
                  />
                  {filters.query && (
                    <button
                      onClick={() => setFilters(f => ({ ...f, query: "" }))}
                      className="p-1 text-text-tertiary hover:text-text-primary"
                    >
                      <RiCloseLine className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dedicated Slide-in Filters Trigger Button */}
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(true)}
                  className={cx(
                    "h-11 px-4 rounded-full text-xs font-bold transition-all active:scale-95 shadow-xs shrink-0 flex items-center gap-1.5 border",
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

              {/* Results Status Header */}
              <div className="flex items-center justify-between text-caption-1-semibold text-text-tertiary px-1">
                <span>{workers.length} verified artisans in Dire Dawa</span>
                <button
                  type="button"
                  onClick={refreshLocation}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#45BA50] hover:underline"
                >
                  <span>Live GPS (±{accuracy || 18}m)</span>
                  <RiRestartLine className={cx("w-3 h-3", locLoading ? "animate-spin" : "")} />
                </button>
              </div>

              {/* Scrollable Compact Artisan Cards List */}
              <div className="space-y-2.5 overflow-y-auto no-scrollbar max-h-[calc(100vh-270px)] pr-1">
                {workers.length > 0 ? (
                  workers.map((worker) => (
                    <WorkerCard
                      key={worker.id}
                      worker={worker}
                      isSelected={selectedWorker?.id === worker.id}
                      onSelect={(w) => setSelectedWorker(w)}
                    />
                  ))
                ) : (
                  !loading && (
                    <div className="rounded-3xl border border-dashed border-border-button-default p-10 text-center bg-background-secondary-default space-y-3">
                      <RiSearchEyeLine className="w-8 h-8 mx-auto text-[#45BA50]" />
                      <p className="text-body-medium font-bold text-text-primary">No matching artisans found</p>
                      <p className="text-caption-1-semibold text-text-tertiary">Try expanding your search criteria or resetting filters.</p>
                      <button
                        onClick={() => setFilters({ query: "", category: "", neighborhood: "All Dire Dawa", minRating: 0, maxDistance: 50, sortBy: "Nearest", verifiedOnly: false })}
                        className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#45BA50] text-white"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )
                )}

                {loading && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 rounded-2xl bg-background-secondary-default animate-pulse border border-border-button-default" />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Desktop Selected Artisan CTA Banner */}
            {selectedWorker && (
              <div className="p-3.5 rounded-2xl bg-background-secondary-default border border-border-button-default shadow-xs flex items-center justify-between gap-3 mt-3">
                <div className="min-w-0">
                  <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">Selected Pro</p>
                  <p className="text-body-medium font-black text-text-primary truncate">{selectedWorker.name}</p>
                  <p className="text-caption-1-semibold text-[#45BA50] font-bold">ETB {selectedWorker.hourlyRate || "450"}/hr</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/client/worker/${selectedWorker.id}`}
                    className="h-10 px-3 rounded-xl border border-border-button-default bg-background-primary-default hover:bg-background-tertiary-default text-text-primary text-xs font-bold inline-flex items-center justify-center transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    href={`/client/contract/new?workerId=${selectedWorker.id}`}
                    className="h-10 px-4 rounded-xl bg-[#45BA50] hover:bg-[#3ca346] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-[0_4px_14px_rgba(69,186,80,0.3)] active:scale-95 transition-all"
                  >
                    <span>Book Artisan</span>
                    <RiArrowRightLine className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (7 cols / ~58%): Sticky Full-Height Interactive Map */}
          <div className="col-span-7 h-[calc(100vh-100px)] sticky top-20 rounded-3xl overflow-hidden border border-border-button-default shadow-xl">
            <MapComponent 
              workers={workers} 
              selectedWorkerId={selectedWorker?.id}
              onSelectWorker={(w) => setSelectedWorker(w)}
              className="h-full w-full"
            />
          </div>

        </div>
      )}

      {/* ── Initial Loading Fallback before Mount ── */}
      {!mounted && (
        <div className="h-[500px] w-full rounded-3xl bg-background-secondary-default/50 animate-pulse border border-border-button-default flex items-center justify-center">
          <RiCompass3Line className="h-8 w-8 animate-spin text-[#45BA50]" />
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          DEDICATED SLIDE-OVER FILTER DRAWER (Mobile + Desktop)
          ═════════════════════════════════════════════════════════════════════ */}
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
                resultsCount={workers.length}
                onClose={() => setFilterDrawerOpen(false)}
                onApply={() => setFilterDrawerOpen(false)}
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
