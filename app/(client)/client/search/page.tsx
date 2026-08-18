"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import WorkerCard from "@/components/search/WorkerCard";
import SearchFilters from "@/components/search/SearchFilters";
import { Worker, ViewMode, SearchFilters as FilterType } from "@/components/search/types";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Map, List, AlertCircle, SearchX } from "lucide-react";
import FadeContent from "@/components/ui/fade-content";

// Dynamically import Map with no SSR
const MapComponent = dynamic(() => import("@/components/search/MapComponent"), { 
    ssr: false,
    loading: () => <div className="h-[calc(100vh-280px)] w-full bg-muted animate-pulse rounded-2xl" />
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
    <FadeContent blur duration={0.4} className="flex flex-col gap-6 pb-32 md:pb-8">
      {/* ── Page Header (Justified) ── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1.5 bg-primary/10 text-primary border-none hover:bg-primary/15 py-0.5 px-2.5 rounded-full font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${location ? 'bg-primary animate-pulse' : 'bg-destructive animate-pulse'}`} />
              <span className="text-[10px] uppercase tracking-wider">
                {locLoading ? t("search.locating") : location ? t("search.nearbyKezira") : t("search.locationRequired")}
              </span>
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {t("search.discoverTitle")}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            {t("search.discoverDesc")}
          </p>
        </div>

        {/* Desktop View Toggle */}
        <div className="hidden md:flex bg-muted rounded-xl p-1 border border-border shadow-sm">
          <Button 
            onClick={() => setViewMode("list")}
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            className="flex items-center gap-1.5 rounded-lg text-xs font-bold"
          >
            <List size={14} />
            {t("search.view.list")}
          </Button>
          <Button 
            onClick={() => setViewMode("map")}
            variant={viewMode === "map" ? "secondary" : "ghost"}
            size="sm"
            className="flex items-center gap-1.5 rounded-lg text-xs font-bold"
          >
            <Map size={14} />
            {t("search.view.map")}
          </Button>
        </div>
      </section>

      {/* ── Search & Results Layout ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-20">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              type="text"
              placeholder={t("search.placeholderDetailed")}
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              className="w-full pl-10 h-11 bg-card border-border rounded-xl"
            />
          </div>

          {error && (
            <Card className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">{error}</span>
              </CardContent>
            </Card>
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
                    <Card className="border border-dashed border-border p-12 text-center bg-card shadow-sm">
                      <CardContent className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                          <SearchX size={22} />
                        </div>
                        <div className="max-w-xs mx-auto space-y-1">
                          <p className="font-semibold text-sm">{t("search.noResultsTitle")}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("search.noResultsDesc")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
                
                {loading && (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-[600px] w-full rounded-2xl overflow-hidden border border-border shadow-inner"
              >
                <MapComponent workers={workers} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </FadeContent>
  );
}
