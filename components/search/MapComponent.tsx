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
        
        {workers.map((worker) => (
          <Marker key={worker.id} position={[worker.lat, worker.lng]}>
            <Popup className="compact-popup">
              <div className="p-1 font-sans">
                <p className="font-bold text-sm mb-1">{worker.name}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{worker.skill}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-yellow-500">★</span>
                  <span className="font-bold text-xs">{worker.rating}</span>
                </div>
                <a 
                  href={`/worker/${worker.id}`} 
                  className="mt-3 block text-center py-2 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-lg no-underline"
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
