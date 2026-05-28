"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import WorkerCard from "@/components/search/WorkerCard";
import SearchFilters from "@/components/search/SearchFilters";
import { Worker, ViewMode, SearchFilters as FilterType } from "@/components/search/types";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";

// Dynamically import Map with no SSR
const MapComponent = dynamic(() => import("@/components/search/MapComponent"), { 
    ssr: false,
    loading: () => <div className="h-[calc(100vh-280px)] w-full bg-surface-container animate-pulse rounded-[2rem]" />
});

export default function SearchPage() {
  const { t } = useLanguage();
  const { location, loading: locLoading } = useLocation();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<FilterType>({
    query: "",
    category: "",
    minRating: 0,
    maxDistance: 100,
    sortBy: "Nearest",
  });

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          query: filters.query || "",
          category: filters.category === "All" ? "" : (filters.category || ""),
          minRating: filters.minRating.toString(),
          maxDistance: filters.maxDistance.toString(),
        });

        if (location) {
          params.append("lat", location.lat.toString());
          params.append("lng", location.lng.toString());
        }

        const res = await fetch(`/api/workers?${params.toString()}`);
        const data = await res.json();
        
        if (data.workers) {
          const mapped: Worker[] = data.workers.map((w: any) => ({
            id: w.id,
            name: w.full_name,
            skill: Array.isArray(w.skills) ? w.skills[0] || "Professional" : "Professional",
            category: Array.isArray(w.skills) ? w.skills[0] || "" : "",
            rating: Number(w.avg_rating),
            reviews: Number(w.total_ratings),
            distance: w.distance != null ? Number(w.distance).toFixed(1) : "N/A",
            lat: Number(w.latitude) || 0,
            lng: Number(w.longitude) || 0,
            photo: w.avatar_url || null,
            isVerified: w.is_verified,
            district: "Dire Dawa",
            skills: w.skills
          }));
          setWorkers(mapped);
        }
      } catch (err: any) {
        console.error("Failed to fetch workers", err);
        setError(`Fetch failed: ${err.message}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [filters, location]);

  return (
    <div className="flex flex-col gap-8 pb-32 md:pb-8">
      
      {/* ── Page Header (Justified) ── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 w-fit mb-2">
             <div className={`w-1.5 h-1.5 rounded-full ${location ? 'bg-primary animate-pulse' : 'bg-error'}`} />
             <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                {locLoading ? "Locating..." : location ? `Nearby Kezira, DD` : "Location Required"}
             </span>
          </div>
          <h1 className="text-headline-lg text-on-background tracking-tight">
            Discover Professionals
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-xl">
            Find and hire verified service experts in your local district.
          </p>
        </div>

        {/* Desktop View Toggle */}
        <div className="hidden md:flex bg-surface-container rounded-2xl p-1 border border-surface-container-highest shadow-sm">
           <button 
             onClick={() => setViewMode("list")}
             className={`flex items-center gap-2 px-6 py-2 rounded-xl text-label-md font-bold transition-all ${viewMode === "list" ? "bg-on-surface text-surface-container-lowest shadow-lg" : "text-on-surface-variant hover:text-on-surface"}`}
           >
             <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
             List
           </button>
           <button 
             onClick={() => setViewMode("map")}
             className={`flex items-center gap-2 px-6 py-2 rounded-xl text-label-md font-bold transition-all ${viewMode === "map" ? "bg-on-surface text-surface-container-lowest shadow-lg" : "text-on-surface-variant hover:text-on-surface"}`}
           >
             <span className="material-symbols-outlined text-[18px]">map</span>
             Map
           </button>
        </div>
      </section>

      {/* ── Search & Results Layout ── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-28">
           <SearchFilters 
             filters={filters} 
             setFilters={setFilters} 
             viewMode={viewMode}
             setViewMode={setViewMode}
             resultsCount={workers.length}
           />
        </aside>

        {/* Results Main Area */}
        <main className="flex-grow w-full min-w-0 flex flex-col gap-6">
          {/* Smart Search Bar */}
          <div className="relative group w-full max-w-2xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-[22px]">search</span>
            <input 
              type="text"
              placeholder="Search by name, skill, or service..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              className="w-full bg-surface-container-low border border-surface-container-highest focus:ring-2 focus:ring-primary/20 text-on-surface rounded-2xl py-4 pl-12 pr-4 transition-all group-hover:bg-surface-container-high placeholder:text-on-surface-variant/40 outline-none"
            />
          </div>

          {error && (
            <div className="p-4 bg-error-container/20 border border-error/20 rounded-2xl text-error text-sm flex items-center gap-3">
              <span className="material-symbols-outlined">warning</span>
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {viewMode === "list" ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4"
              >
                {workers.length > 0 ? (
                  workers.map((worker) => (
                    <WorkerCard key={worker.id} worker={worker} />
                  ))
                ) : (
                  !loading && (
                    <div className="col-span-full py-20 bg-surface-container-lowest rounded-3xl border border-dashed border-surface-container-highest flex flex-col items-center justify-center text-center px-6">
                      <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-on-surface-variant/40 text-[32px]">search_off</span>
                      </div>
                      <h3 className="text-headline-md text-on-surface">No results found</h3>
                      <p className="text-body-md text-on-surface-variant max-w-xs mt-2">Try adjusting your filters or searching for something else.</p>
                    </div>
                  )
                )}
                {loading && (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-40 bg-surface-container-low animate-pulse rounded-2xl" />
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-[600px] w-full rounded-3xl overflow-hidden border border-surface-container-highest shadow-inner"
              >
                <MapComponent workers={workers} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
