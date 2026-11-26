"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Worker } from "./types";
import { useTheme } from "next-themes";
import { useLocation, DEFAULT_CENTER } from "@/context/LocationContext";
import { Crosshair } from "lucide-react";

// Fix for default Leaflet icons in Next.js
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
};

interface MapComponentProps {
  workers: Worker[];
  selectedWorkerId?: string | number | null;
  onSelectWorker?: (worker: Worker | null) => void;
  onMapClick?: () => void;
  recenterSignal?: number;
  className?: string;
}

const isValidCoord = (c: any): boolean => {
  if (c == null) return false;
  const num = Number(c);
  return !isNaN(num) && isFinite(num) && num !== 0;
};

const createWorkerIcon = (rating: number, isSelected = false) => {
  const isTopRated = rating >= 4.5;
  const bg = isSelected ? '#45BA50' : '#134e27';
  const text = isSelected ? '#ffffff' : '#a4fe47';
  const border = isSelected ? '#ffffff' : '#45BA50';
  const star = isSelected ? '#ffffff' : isTopRated ? '#f59e0b' : '#a4fe47';
  const shadow = isSelected ? '0 0 16px rgba(69,186,80,0.7)' : '0 4px 12px rgba(0,0,0,0.45)';
  const scale = isSelected ? 'scale(1.15)' : 'scale(1)';

  return L.divIcon({
    html: `
      <div style="cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%) ${scale}; transition: transform 0.2s ease;">
        <div style="background-color: ${bg}; color: ${text}; border: 1.5px solid ${border}; box-shadow: ${shadow}; padding: 4px 8px; border-radius: 9999px; font-weight: 900; font-size: 11px; display: inline-flex; align-items: center; gap: 3px; font-family: system-ui, -apple-system, sans-serif; white-space: nowrap;">
          <span style="color: ${star};">★</span>
          <span>${rating > 0 ? rating.toFixed(1) : '5.0'}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${border}; margin-top: -1px;"></div>
      </div>
    `,
    className: 'custom-leaflet-icon bg-transparent border-0',
    iconSize: [50, 36],
    iconAnchor: [0, 0],
  });
};

const userLocationIcon = () => L.divIcon({
  html: `<div class="relative w-6 h-6 flex items-center justify-center">
           <div class="absolute inset-0 bg-[#45BA50] rounded-full animate-ping opacity-75"></div>
           <div class="relative w-4 h-4 bg-[#45BA50] rounded-full border-2 border-white shadow-[0_0_12px_rgba(69,186,80,0.9)]"></div>
         </div>`,
  className: 'custom-leaflet-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Map controller for automatic viewport framing & manual real-time re-centering
const MapController = ({
  workers,
  center,
  isLive,
  selectedWorker,
  onMapClick,
  recenterSignal,
}: {
  workers: Worker[];
  center: [number, number];
  isLive: boolean;
  selectedWorker?: Worker | null;
  onMapClick?: () => void;
  recenterSignal?: number;
}) => {
  const map = useMap();
  const initialFittedRef = useRef(false);
  const hasCenteredLiveRef = useRef(false);
  const pendingLocateRef = useRef(false);
  const prevRecenterSignal = useRef(recenterSignal);
  const prevCenterRef = useRef<[number, number]>(center);

  useEffect(() => {
    if (!map) return;
    const handleMapClick = () => {
      onMapClick?.();
    };
    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, onMapClick]);

  // Recenter signal from external trigger (e.g. My GPS button in header)
  useEffect(() => {
    if (recenterSignal !== undefined && recenterSignal !== prevRecenterSignal.current) {
      prevRecenterSignal.current = recenterSignal;
      pendingLocateRef.current = true;
      try {
        map.flyTo(center, 16, { duration: 0.9 });
      } catch {}
    }
  }, [recenterSignal, center, map]);

  // Fly to updated center once live GPS resolves after initial fallback or after clicking My GPS
  useEffect(() => {
    const centerMoved =
      Math.abs(prevCenterRef.current[0] - center[0]) > 0.0001 ||
      Math.abs(prevCenterRef.current[1] - center[1]) > 0.0001;
    prevCenterRef.current = center;

    if (!map || selectedWorker) return;

    if (pendingLocateRef.current && centerMoved) {
      pendingLocateRef.current = false;
      try {
        map.flyTo(center, 16, { duration: 0.9 });
      } catch {}
      return;
    }

    if (isLive && !hasCenteredLiveRef.current) {
      hasCenteredLiveRef.current = true;
      try {
        const validWorkers = workers.filter(w => isValidCoord(w.lat) && isValidCoord(w.lng));
        if (validWorkers.length > 0) {
          const bounds = L.latLngBounds([center]);
          validWorkers.forEach(w => bounds.extend([Number(w.lat), Number(w.lng)]));
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            return;
          }
        }
        map.flyTo(center, 15, { duration: 0.9 });
      } catch {}
    }
  }, [center, isLive, workers, selectedWorker, map]);

  useEffect(() => {
    try {
      if (!map) return;
      map.invalidateSize();

      if (selectedWorker && isValidCoord(selectedWorker.lat) && isValidCoord(selectedWorker.lng)) {
        map.flyTo([Number(selectedWorker.lat), Number(selectedWorker.lng)], 15, { duration: 0.8 });
        return;
      }

      // Only auto-fit all workers once initially or when worker list length changes, not on every user pan/center update
      if (!initialFittedRef.current) {
        const validWorkers = workers.filter(w => isValidCoord(w.lat) && isValidCoord(w.lng));
        if (validWorkers.length > 0) {
          const bounds = L.latLngBounds([center]);
          validWorkers.forEach(w => bounds.extend([Number(w.lat), Number(w.lng)]));
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            initialFittedRef.current = true;
          }
        } else {
          map.setView(center, 14);
          initialFittedRef.current = true;
        }
      }
    } catch (err) {
      console.warn("[MapController] caught non-fatal map animation warning:", err);
    }
  }, [workers.length, selectedWorker?.id, map]);

  return null;
};

// Floating Locate Me button component that uses useMap hook
const LocateMeControl = ({
  center,
  onLocate,
  onTriggerRecenter,
}: {
  center: [number, number];
  onLocate: () => void;
  onTriggerRecenter: () => void;
}) => {
  const map = useMap();

  const handleLocate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onLocate();
    onTriggerRecenter();
    try {
      map.flyTo(center, 16, { duration: 0.9 });
    } catch { }
  }, [center, map, onLocate, onTriggerRecenter]);

  return (
    <div className="leaflet-top leaflet-right mt-[68px] lg:mt-3 mr-3 z-[900]">
      <div className="leaflet-control">
        <button
          type="button"
          onClick={handleLocate}
          className="relative h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-2 border-[#45BA50] text-[#45BA50] shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          title="Center on My Real-Time Location"
          aria-label="Center on My Real-Time Location"
        >
          <Crosshair className="h-5 w-5 sm:h-6 sm:w-6 text-[#45BA50] stroke-[2.2] group-hover:rotate-45 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#45BA50] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#45BA50]" />
          </span>
        </button>
      </div>
    </div>
  );
};

export class MapErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.error("[MapErrorBoundary caught Leaflet error]:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full bg-background-secondary-default flex items-center justify-center p-6 text-center text-text-tertiary">
          <p className="text-xs font-bold">Interactive map unavailable. Artisans are listed below.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MapComponent({
  workers,
  selectedWorkerId,
  onSelectWorker,
  onMapClick,
  recenterSignal,
  className = "",
}: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [internalRecenter, setInternalRecenter] = useState(0);
  const { theme } = useTheme();
  const { location, accuracy, isLive, refreshLocation } = useLocation();

  useEffect(() => {
    fixLeafletIcons();
    setIsMounted(true);
  }, []);

  // Spread overlapping markers that share identical privacy-rounded coordinates
  const displayWorkers = useMemo(() => {
    const valid = workers.filter(w => isValidCoord(w.lat) && isValidCoord(w.lng));
    const buckets = new Map<string, Worker[]>();
    for (const w of valid) {
      const key = `${Number(w.lat).toFixed(4)}:${Number(w.lng).toFixed(4)}`;
      const list = buckets.get(key) || [];
      list.push(w);
      buckets.set(key, list);
    }

    const positioned: Array<Worker & { displayLat: number; displayLng: number }> = [];
    for (const group of buckets.values()) {
      group.forEach((w, idx) => {
        const baseLat = Number(w.lat);
        const baseLng = Number(w.lng);
        if (group.length === 1) {
          positioned.push({ ...w, displayLat: baseLat, displayLng: baseLng });
        } else {
          const angle = (2 * Math.PI * idx) / group.length;
          const radius = 0.00045; // ~50m visual separation for stacked markers
          positioned.push({
            ...w,
            displayLat: baseLat + radius * Math.sin(angle),
            displayLng: baseLng + radius * Math.cos(angle),
          });
        }
      });
    }
    return positioned;
  }, [workers]);

  if (!isMounted) return <div className="h-full w-full bg-background-secondary-default animate-pulse" />;

  const centerLat = isValidCoord(location?.lat) ? Number(location!.lat) : DEFAULT_CENTER.lat;
  const centerLng = isValidCoord(location?.lng) ? Number(location!.lng) : DEFAULT_CENTER.lng;
  const center: [number, number] = [centerLat, centerLng];

  const selectedWorker = workers.find(w => w.id === selectedWorkerId) || null;
  const isLight = theme === 'light';
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const combinedRecenterSignal = (recenterSignal || 0) + internalRecenter;

  return (
    <MapErrorBoundary>
      <div className={`relative overflow-hidden z-0 h-full w-full ${className}`}>
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", background: isLight ? "#f8f9fa" : "#1a1a1a" }}
        >
          <MapController
            workers={workers}
            center={center}
            isLive={isLive}
            selectedWorker={selectedWorker}
            onMapClick={onMapClick}
            recenterSignal={combinedRecenterSignal}
          />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={tileUrl}
          />

          {/* Real-time GPS accuracy circle */}
          {isValidCoord(location?.lat) && isValidCoord(location?.lng) && (
            <Circle
              center={center}
              radius={Math.max(accuracy || 150, 100)}
              pathOptions={{
                color: "#45BA50",
                fillColor: "#45BA50",
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: isLive ? undefined : "4, 4",
              }}
            />
          )}

          {/* User Location Pulse Marker */}
          <Marker position={center} icon={userLocationIcon()}>
            <Popup className="compact-popup">
              <div className="p-1 font-sans text-center">
                <p className="font-black text-xs text-white">Your Location</p>
                <p className="text-[10px] text-[#a4fe47] font-bold">
                  {isLive ? `Live GPS (±${accuracy || 20}m)` : "Dire Dawa (Default)"}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Workers Pins with Rating Bubbles - Clicking selects artisan in ride-hailing bottom sheet */}
          {displayWorkers.map((worker) => {
            const isSelected = selectedWorkerId === worker.id;
            return (
              <Marker
                key={worker.id}
                position={[worker.displayLat, worker.displayLng]}
                icon={createWorkerIcon(worker.rating, isSelected)}
                eventHandlers={{
                  click: () => {
                    onSelectWorker?.(worker);
                  },
                }}
              />
            );
          })}

          <LocateMeControl
            center={center}
            onLocate={refreshLocation}
            onTriggerRecenter={() => setInternalRecenter((s) => s + 1)}
          />
        </MapContainer>

        <style jsx global>{`
          .leaflet-container {
            background: var(--bg-page) !important;
          }
          .leaflet-popup-content-wrapper {
            background: #134e27 !important;
            color: #ffffff !important;
            border-radius: 1rem !important;
            border: 1px solid rgba(69, 186, 80, 0.4);
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          }
          .leaflet-popup-tip {
            background: #134e27 !important;
          }
          .leaflet-bar a {
             background-color: var(--surface-glass) !important;
             color: var(--text-high) !important;
             border-bottom: 1px solid var(--border-glass) !important;
          }
        `}</style>
      </div>
    </MapErrorBoundary>
  );
}
