"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import WorkerCard from "@/components/search/WorkerCard";
import SearchFilters from "@/components/search/SearchFilters";
import { Worker, ViewMode, SearchFilters as FilterType } from "@/components/search/types";
import { useLanguage } from "@/context/LanguageContext";

// Dynamically import Map with no SSR
const MapComponent = dynamic(() => import("@/components/search/MapComponent"), { 
    ssr: false,
    loading: () => <div className="h-[calc(100vh-280px)] w-full bg-surface-container-low animate-pulse rounded-[2rem]" />
});

const MOCK_WORKERS: Worker[] = [
  {
    id: "1",
    name: "Ahmed Tesfaye",
    skill: "Master Plumber",
    category: "Plumber",
    rating: 4.9,
    reviews: 124,
    distance: 0.8,
    lat: 9.5932,
    lng: 41.8615,
    photo: "https://images.unsplash.com/photo-1540560485459-c219e9939392?auto=format&fit=crop&w=400&q=80",
    isVerified: true,
    district: "Kezira",
    skills: ["Pipe Installation", "Leak Repair", "Solar Water Heaters"]
  },
  {
    id: "2",
    name: "Selamawit Kebede",
    skill: "Industrial Electrician",
    category: "Electrician",
    rating: 4.8,
    reviews: 89,
    distance: 1.2,
    lat: 9.5854,
    lng: 41.8752,
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    isVerified: true,
    district: "Ashawa",
    skills: ["Wiring", "Control Panels", "Solar Installation"]
  },
  {
    id: "3",
    name: "Dawit Berhanu",
    skill: "House Painter & Finisher",
    category: "Painter",
    rating: 4.7,
    reviews: 56,
    distance: 2.1,
    lat: 9.5982,
    lng: 41.8701,
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    isVerified: false,
    district: "Gende Korem",
    skills: ["Interior Painting", "Wall Texturing", "Stucco"]
  },
  {
    id: "4",
    name: "Muna Ibrahim",
    skill: "Satellite Dish Expert",
    category: "Satellite Dish",
    rating: 4.9,
    reviews: 210,
    distance: 0.5,
    lat: 9.5912,
    lng: 41.8645,
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    isVerified: true,
    district: "Sabian",
    skills: ["DSTV Setup", "Canal+ Calibration", "Multi-Dish Systems"]
  },
  {
    id: "5",
    name: "Yonas Mekonnen",
    skill: "Emergency Plumber",
    category: "Plumber",
    rating: 4.5,
    reviews: 34,
    distance: 3.4,
    lat: 9.5821,
    lng: 41.8542,
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    isVerified: false,
    district: "Melka Jebdu",
    skills: ["Drain Unclogging", "Valve Replacement", "Emergency Repair"]
  },
  {
    id: "6",
    name: "Hana Tadesse",
    skill: "Interior Designer",
    category: "House Finishing",
    rating: 5.0,
    reviews: 18,
    distance: 1.5,
    lat: 9.5955,
    lng: 41.8688,
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    isVerified: true,
    district: "Kezira",
    skills: ["Flooring", "Tiling", "Ceiling Design"]
  },
  {
    id: "7",
    name: "Tewodros Kassahun",
    skill: "Certified Electrician",
    category: "Electrician",
    rating: 4.6,
    reviews: 72,
    distance: 0.9,
    lat: 9.5901,
    lng: 41.8622,
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    isVerified: true,
    district: "Sabian",
    skills: ["Lighting Design", "Smart Home Setup", "Main Breakers"]
  },
  {
    id: "8",
    name: "Abebech Zewdu",
    skill: "Appliance Repair",
    category: "Electrician",
    rating: 4.3,
    reviews: 42,
    distance: 4.2,
    lat: 9.6010,
    lng: 41.8500,
    photo: "https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?auto=format&fit=crop&w=400&q=80",
    isVerified: false,
    district: "Mariam Sefer",
    skills: ["Oven Repair", "Washing Machines", "Fridge Fix"]
  },
  {
    id: "9",
    name: "Bereket Tilahun",
    skill: "Commercial Painter",
    category: "Painter",
    rating: 4.8,
    reviews: 110,
    distance: 1.8,
    lat: 9.5880,
    lng: 41.8710,
    photo: "https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&w=400&q=80",
    isVerified: true,
    district: "Megala",
    skills: ["Exterior Painting", "Spray Painting", "Epoxy"]
  },
  {
    id: "10",
    name: "Kidist Alemu",
    skill: "Custom Cabinetry",
    category: "House Finishing",
    rating: 4.9,
    reviews: 65,
    distance: 2.5,
    lat: 9.5940,
    lng: 41.8600,
    photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
    isVerified: true,
    district: "Dechatu",
    skills: ["Kitchen Cabinets", "Shelving", "Wood Finishing"]
  },
  {
    id: "11",
    name: "Eyob Worku",
    skill: "Water Pump Technician",
    category: "Plumber",
    rating: 4.1,
    reviews: 21,
    distance: 5.5,
    lat: 9.6050,
    lng: 41.8450,
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    isVerified: false,
    district: "Gende Kore",
    skills: ["Pump Installation", "Motor Repair", "Tank Cleaning"]
  },
  {
    id: "12",
    name: "Fasika Endale",
    skill: "Network Installer",
    category: "Electrician",
    rating: 4.4,
    reviews: 38,
    distance: 1.0,
    lat: 9.5895,
    lng: 41.8650,
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    isVerified: true,
    district: "Kezira",
    skills: ["Cabling", "Wi-Fi Setup", "Router Config"]
  }
];

import { useLocation } from "@/context/LocationContext";
import { useEffect } from "react";

export default function SearchPage() {
  const { t } = useLanguage();
  const { location, loading: locLoading } = useLocation();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
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
          skill: filters.category || filters.query,
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
          // Map DB fields to component expects if different
          const mapped: Worker[] = data.workers.map((w: any) => ({
            id: w.id,
            name: w.full_name,
            skill: Array.isArray(w.skills) ? w.skills[0] || "Professional" : "Professional",
            category: Array.isArray(w.skills) ? w.skills[0] || "" : "",
            rating: Number(w.avg_rating),
            reviews: Number(w.total_ratings),
            distance: w.distance ? Number(w.distance).toFixed(1) : "0.0",
            lat: Number(w.latitude),
            lng: Number(w.longitude),
            photo: w.avatar_url || "https://images.unsplash.com/photo-1540560485459-c219e9939392?auto=format&fit=crop&w=400&q=80",
            isVerified: w.is_verified,
            district: "Dire Dawa", // Simple fallback or use DB district
            skills: w.skills
          }));
          setWorkers(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch workers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, [filters, location]);

  const filteredWorkers = workers; // Logic moved to backend

  return (
    <div className="min-h-screen bg-surface p-6 pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-6xl font-headline font-black text-on-surface tracking-tighter">
            {t("search.title")} <span className="text-primary italic">{t("search.title.highlight")}</span>
          </h1>
          <p className="text-on-surface-variant text-[12px] md:text-sm font-medium">{t("search.subtitle")}</p>
        </header>

        <SearchFilters 
          filters={filters} 
          setFilters={setFilters} 
          viewMode={viewMode}
          setViewMode={setViewMode}
          resultsCount={filteredWorkers.length}
        />

        <AnimatePresence mode="wait">
          {viewMode === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredWorkers.length > 0 ? (
                filteredWorkers.map((worker) => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center space-y-4">
                  <span className="material-symbols-outlined text-6xl text-white/5">search_off</span>
                  <p className="text-on-surface-variant font-medium">{t("search.noResults")}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <MapComponent workers={filteredWorkers} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action for PWA feel */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-surface-container-high/80 backdrop-blur-2xl border border-white/5 px-8 py-4 rounded-full shadow-2xl md:hidden flex items-center gap-10">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <span className="material-symbols-outlined text-on-surface-variant">chat_bubble</span>
          <span className="material-symbols-outlined text-on-surface-variant">person</span>
      </div>
    </div>
  );
}
