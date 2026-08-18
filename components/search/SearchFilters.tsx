"use client";

import { motion } from "framer-motion";
import { ViewMode, SearchFilters as FilterType } from "./types";
import { useLanguage } from "@/context/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  SlidersHorizontal, 
  Map, 
  List, 
  Star, 
  Compass, 
  RotateCcw,
  Sparkles,
  Layers
} from "lucide-react";

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
    <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
      <CardContent className="p-5 space-y-5">
        
        {/* Header Title Block */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-primary" />
            <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{t("search.refine")}</h3>
          </div>
          <Badge variant="outline" className="rounded-full text-[9px] font-bold border-border bg-muted/50 px-2 py-0.5">
            {resultsCount} {t("search.found")}
          </Badge>
        </div>

        <Separator className="bg-border" />

        {/* View Toggle (Mobile Only - Desktop has it in header) */}
        <div className="md:hidden flex bg-muted rounded-xl p-1 border border-border">
          <Button 
            onClick={() => setViewMode("list")}
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold"
          >
            <List size={13} />
            {t("search.view.list")}
          </Button>
          <Button 
            onClick={() => setViewMode("map")}
            variant={viewMode === "map" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold"
          >
            <Map size={13} />
            {t("search.view.map")}
          </Button>
        </div>

        {/* Category Details Block style */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            <span className="flex items-center gap-1.5"><Layers size={12} /> {t("search.serviceCategory")}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const isSelected = filters.category === cat || (cat === "All" && !filters.category);
              return (
                <Button
                  key={cat}
                  onClick={() => setFilters({ ...filters, category: cat === "All" ? "" : cat })}
                  variant={isSelected ? "default" : "outline"}
                  size="xs"
                  className="rounded-lg text-[9px] uppercase font-bold tracking-wider px-2.5 h-7"
                >
                  {cat === "All" ? t("categories.all") : cat === "Electrician" ? t("categories.electrician") : cat === "Plumber" ? t("categories.plumber") : cat === "Painter" ? t("categories.painter") : cat === "Satellite Dish" ? t("categories.satellite_dish") : t("categories.house_finishing")}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Details Slider: Rating */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            <span className="flex items-center gap-1.5"><Star size={12} /> {t("search.minRating")}</span>
            <Badge variant="outline" className="flex items-center gap-0.5 border-primary/20 bg-primary/10 text-primary py-0 px-2 rounded font-bold text-[9px]">
              <span>{(filters.minRating || 3.0).toFixed(1)}</span>
            </Badge>
          </div>
          <div className="relative pt-1 px-1">
            <input 
              type="range" min="3" max="5" step="0.1" 
              value={filters.minRating || 3.0}
              onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
              className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary border border-border"
            />
            <div className="flex justify-between mt-1 text-[8px] font-bold text-muted-foreground tracking-wider uppercase">
              <span>3.0</span>
              <span>5.0</span>
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Details Slider: Distance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
            <span className="flex items-center gap-1.5"><Compass size={12} /> {t("search.maxDistance")}</span>
            <Badge variant="outline" className="flex items-center gap-0.5 border-border bg-muted py-0 px-2 rounded font-bold text-[9px]">
              <span>{filters.maxDistance}km</span>
            </Badge>
          </div>
          <div className="relative pt-1 px-1">
            <input 
              type="range" min="1" max="50" step="1"
              value={filters.maxDistance}
              onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
              className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary border border-border"
            />
            <div className="flex justify-between mt-1 text-[8px] font-bold text-muted-foreground tracking-wider uppercase">
              <span>1km</span>
              <span>50km</span>
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        {/* Reset Filters */}
        <Button 
          onClick={() => setFilters({ query: "", category: "", minRating: 0, maxDistance: 100, sortBy: "Nearest" })}
          variant="outline"
          size="sm"
          className="w-full rounded-xl text-[10px] font-bold uppercase tracking-wider h-10 border-border"
        >
          <RotateCcw size={12} className="mr-1.5" />
          {t("search.resetFilters")}
        </Button>
      </CardContent>
    </Card>
  );
}
