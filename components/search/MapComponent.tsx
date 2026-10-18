"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Worker } from "./types";
import { useTheme } from "next-themes";
import { useLocation, DEFAULT_CENTER } from "@/context/LocationContext";
import { Crosshair, LocateFixed, Compass } from "lucide-react";

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
  className?: string;
}

const createWorkerIcon = (rating: number, isSelected = false) => {
  const isTopRated = rating >= 4.5;
  const bg = isSelected ? '#a3e635' : '#181d24';
  const text = isSelected ? '#000000' : '#ffffff';
  const border = isSelected ? '#000000' : '#a3e635';
  const star = isSelected ? '#000000' : isTopRated ? '#f59e0b' : '#a3e635';
  const shadow = isSelected ? '0 0 16px rgba(163,230,53,0.7)' : '0 4px 12px rgba(0,0,0,0.45)';
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
           <div class="absolute inset-0 bg-[#a3e635] rounded-full animate-ping opacity-75"></div>
           <div class="relative w-4 h-4 bg-[#a3e635] rounded-full border-2 border-black shadow-[0_0_12px_rgba(163,230,53,0.9)]"></div>
         </div>`,
  className: 'custom-leaflet-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Map controller for automatic viewport framing & manual real-time re-centering
const MapController = ({ 
  workers, 
  center, 
  selectedWorker 
}: { 
  workers: Worker[]; 
  center: [number, number]; 
  selectedWorker?: Worker | null;
}) => {
  const map = useMap();
  const workersHash = workers.map(w => w.id).join(',');

  useEffect(() => {
    if (selectedWorker && selectedWorker.lat && selectedWorker.lng) {
      map.flyTo([selectedWorker.lat, selectedWorker.lng], 15, { duration: 0.8 });
      return;
    }

    const validWorkers = workers.filter(w => w.lat !== 0 && w.lng !== 0);
    if (validWorkers.length > 0) {
      const bounds = L.latLngBounds([center]);
      validWorkers.forEach(w => bounds.extend([w.lat, w.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else {
      map.setView(center, 13);
    }
  }, [workersHash, center[0], center[1], selectedWorker?.id, map]);
  
  return null;
};

// Floating Locate Me button component that uses useMap hook
const LocateMeControl = ({ center, onLocate }: { center: [number, number]; onLocate: () => void }) => {
  const map = useMap();

  const handleLocate = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onLocate();
    map.flyTo(center, 15, { duration: 1 });
  }, [center, map, onLocate]);

  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: "80px", marginRight: "12px", zIndex: 1000 }}>
      <div className="leaflet-control">
        <button
          type="button"
          onClick={handleLocate}
          className="h-11 w-11 rounded-full bg-card/95 backdrop-blur-md border border-outline-variant/80 text-foreground shadow-2xl flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all group"
          title="Center on My Real-Time Location"
        >
          <Crosshair className="h-5 w-5 text-foreground group-hover:text-[#a3e635] transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default function MapComponent({
  workers,
  selectedWorkerId,
  onSelectWorker,
  className = "h-full w-full",
}: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();
  const { location, accuracy, isLive, refreshLocation } = useLocation();

  useEffect(() => {
    fixLeafletIcons();
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-full w-full bg-muted/40 animate-pulse rounded-3xl" />;

  const center: [number, number] = location 
    ? [location.lat, location.lng] 
    : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];
  
  const selectedWorker = workers.find(w => w.id === selectedWorkerId) || null;
  const isLight = theme === 'light';
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className={`relative overflow-hidden z-0 ${className}`}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: isLight ? "#f8f9fa" : "#1a1a1a" }}
      >
        <MapController workers={workers} center={center} selectedWorker={selectedWorker} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tileUrl}
        />
        
        {/* Real-time GPS accuracy circle */}
        {location && (
          <Circle
            center={center}
            radius={Math.max(accuracy || 150, 100)}
            pathOptions={{
              color: "#a3e635",
              fillColor: "#a3e635",
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
              <p className="font-black text-xs text-white">Your Real-Time Location</p>
              <p className="text-[10px] text-[#a3e635] font-bold">
                {isLive ? `Live GPS (±${accuracy || 20}m)` : "Dire Dawa (Cached)"}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Workers Pins with Rating Bubbles */}
        {workers.filter(w => w.lat !== 0 && w.lng !== 0).map((worker) => {
          const isSelected = selectedWorkerId === worker.id;
          return (
            <Marker
              key={worker.id}
              position={[worker.lat, worker.lng]}
              icon={createWorkerIcon(worker.rating, isSelected)}
              eventHandlers={{
                click: () => {
                  onSelectWorker?.(worker);
                },
              }}
            >
              <Popup className="compact-popup">
                <div className="p-1 font-sans min-w-[140px]">
                  <p className="font-black text-xs mb-0.5 truncate text-white">{worker.name}</p>
                  <p className="text-[10px] text-[#a3e635] uppercase font-bold mb-1.5 truncate">{worker.skill}</p>
                  
                  <div className="flex items-center justify-between text-[10px] mb-2 text-white/80">
                    <span className="text-amber-400 font-bold">★ {worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
                    <span>{worker.distance !== "N/A" ? `${worker.distance} km` : "Dire Dawa"}</span>
                  </div>
                  
                  <a 
                    href={`/client/worker/${worker.id}`} 
                    className="block text-center py-1.5 bg-[#a3e635] hover:opacity-90 text-black text-[10px] font-black uppercase tracking-wider rounded-full no-underline transition-opacity"
                  >
                    View Profile
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Google Maps style "Locate Me" Button */}
        <LocateMeControl center={center} onLocate={refreshLocation} />
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          background: var(--bg-page) !important;
        }
        .leaflet-popup-content-wrapper {
          background: #181d24 !important;
          color: #ffffff !important;
          border-radius: 1rem !important;
          border: 1px solid rgba(163, 230, 53, 0.25);
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        }
        .leaflet-popup-tip {
          background: #181d24 !important;
        }
        .leaflet-bar a {
           background-color: var(--surface-glass) !important;
           color: var(--text-high) !important;
           border-bottom: 1px solid var(--border-glass) !important;
        }
      `}</style>
    </div>
  );
}
