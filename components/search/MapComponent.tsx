"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Worker } from "./types";

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
  const colorClass = isTopRated ? 'bg-[#ffb703]' : 'bg-white';
  const shadowClass = isTopRated ? 'shadow-[0_0_15px_rgba(255,183,3,0.5)]' : 'shadow-lg';
  
  return L.divIcon({
    html: `<div class="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-black ${colorClass} ${shadowClass}"></div>`,
    className: 'custom-leaflet-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
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

export default function MapComponent({ workers }: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcons();
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="h-full w-full bg-surface-container-low animate-pulse rounded-3xl" />;

  const center: [number, number] = [9.5915, 41.8661]; // Sabian Area, Dire Dawa

  return (
    <div className="h-[calc(100vh-280px)] w-full rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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

        {workers.map((worker) => (
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
                    <span className="font-bold text-[9px] text-on-surface-variant uppercase">{worker.distance} KM</span>
                  </div>
                </div>
                
                <a 
                  href={`/worker/${worker.id}`} 
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
          background: #111 !important;
        }
        .leaflet-popup-content-wrapper {
          background: #1C1C1C !important;
          color: white !important;
          border-radius: 1rem !important;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .leaflet-popup-tip {
          background: #1C1C1C !important;
        }
        .leaflet-bar a {
           background-color: #1C1C1C !important;
           color: white !important;
           border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        }
      `}</style>
    </div>
  );
}
