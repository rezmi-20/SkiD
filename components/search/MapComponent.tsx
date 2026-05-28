"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Worker } from "./types";
import { useTheme } from "next-themes";

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
}

const createWorkerIcon = (rating: number) => {
  const isTopRated = rating >= 4.5;
  const colorClass = isTopRated ? 'text-[#ffb703]' : 'text-[#4ade80]';
  const shadowClass = isTopRated ? 'drop-shadow-[0_0_10px_rgba(255,183,3,0.8)]' : 'drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]';
  
  return L.divIcon({
    html: `<div class="flex flex-col items-center justify-center -mt-8">
             <span class="material-symbols-outlined text-[42px] ${colorClass} ${shadowClass}" style="font-variation-settings: 'FILL' 1;">location_on</span>
           </div>`,
    className: 'custom-leaflet-icon bg-transparent border-0',
    iconSize: [42, 42],
    iconAnchor: [21, 40],
  });
};

const userLocationIcon = () => L.divIcon({
  html: `<div class="relative w-4 h-4 sm:w-5 sm:h-5">
           <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
           <div class="relative w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
         </div>`,
  className: 'custom-leaflet-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

import { useLocation, DEFAULT_CENTER } from "@/context/LocationContext";

const MapUpdater = ({ workers, center }: { workers: Worker[], center: [number, number] }) => {
  const map = useMap();
  
  // Create a string representation of workers to use in dependency array to avoid reference issues
  const workersHash = workers.map(w => w.id).join(',');

  useEffect(() => {
    // Filter out workers that don't have valid coordinates (0,0 is null fallback)
    const validWorkers = workers.filter(w => w.lat !== 0 && w.lng !== 0);
    
    if (validWorkers.length > 0) {
      const bounds = L.latLngBounds([center]);
      validWorkers.forEach(w => bounds.extend([w.lat, w.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else {
      map.setView(center, 13);
    }
  }, [workersHash, center[0], center[1], map]);
  
  return null;
};

export default function MapComponent({ workers }: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();
  const { location } = useLocation();

  useEffect(() => {
    fixLeafletIcons();
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-full w-full bg-surface-container-low animate-pulse rounded-3xl" />;

  const center: [number, number] = location 
    ? [location.lat, location.lng] 
    : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];
  
  const isLight = theme === 'light';
  // Use colorful OpenStreetMap tiles regardless of theme
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div className="h-[calc(100vh-280px)] w-full rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl z-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: isLight ? "#f8f9fa" : "#1a1a1a" }}
      >
        <MapUpdater workers={workers} center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        
        {/* User Location Dot */}
        <Marker position={center} icon={userLocationIcon()}>
          <Popup className="compact-popup">
            <div className="p-1 font-sans text-center">
              <p className="font-bold text-xs">Your Location</p>
              <p className="text-[10px] text-gray-500">Dire Dawa</p>
            </div>
          </Popup>
        </Marker>

        {workers.filter(w => w.lat !== 0 && w.lng !== 0).map((worker) => (
          <Marker key={worker.id} position={[worker.lat, worker.lng]} icon={createWorkerIcon(worker.rating)}>
            <Popup className="compact-popup">
              <div className="p-1 font-sans min-w-[120px]">
                <p className="font-headline font-black text-sm mb-0.5 tracking-tighter leading-tight truncate">{worker.name}</p>
                <p className="text-[9px] text-[#ffb703] uppercase tracking-widest font-bold mb-2 truncate">{worker.skill}</p>
                
                <div className="flex items-center justify-between mt-2 mb-3 bg-white/5 rounded-lg p-1.5 border border-white/5">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px] text-[#ffb703]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-black text-[10px]">{worker.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px] text-on-surface-variant">location_on</span>
                    <span className="font-bold text-[9px] text-on-surface-variant uppercase">{worker.distance === "N/A" ? "N/A" : `${worker.distance} KM`}</span>
                  </div>
                </div>
                
                <a 
                  href={`/client/worker/${worker.id}`} 
                  className="block text-center py-2 bg-white hover:bg-white/90 text-black text-[9px] font-black uppercase tracking-widest rounded-lg no-underline transition-colors"
                >
                  View Profile
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx global>{`
        .leaflet-container {
          background: var(--bg-page) !important;
        }
        .leaflet-popup-content-wrapper {
          background: #1a1a1a !important;
          color: #ffffff !important;
          border-radius: 1rem !important;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .leaflet-popup-tip {
          background: #1a1a1a !important;
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
