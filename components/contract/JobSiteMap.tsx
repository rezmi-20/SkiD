"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, ExternalLink, MapPin, Compass } from "lucide-react";

// Fix default Leaflet marker assets in Next.js
const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
};

const createJobSiteIcon = () => {
  return L.divIcon({
    html: `
      <div style="cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; background-color: #10b981; border-radius: 9999px; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="background: linear-gradient(135deg, #047857 0%, #10b981 100%); color: #ffffff; border: 2px solid #ffffff; box-shadow: 0 4px 14px rgba(4, 120, 87, 0.5); width: 32px; height: 32px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-size: 16px;">
            📍
          </div>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #047857; margin-top: -1px;"></div>
      </div>
    `,
    className: "custom-jobsite-pin bg-transparent border-0",
    iconSize: [36, 42],
    iconAnchor: [0, 0],
  });
};

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1 });
  }, [center, map]);
  return null;
}

interface JobSiteMapProps {
  workLocation?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  jobTitle?: string | null;
  clientName?: string | null;
  className?: string;
}

// Fallback neighborhood coordinates for Dire Dawa
function resolveCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined,
  locationStr: string | null | undefined
): [number, number] {
  if (lat && lng && !Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
    return [lat, lng];
  }

  const loc = (locationStr || "").toLowerCase();
  if (loc.includes("kezira")) return [9.5931, 41.8596];
  if (loc.includes("sabian")) return [9.5915, 41.8661];
  if (loc.includes("megala")) return [9.588, 41.861];
  if (loc.includes("dechetu")) return [9.595, 41.864];
  if (loc.includes("goro")) return [9.582, 41.855];

  // Default to central Dire Dawa
  return [9.5915, 41.8661];
}

export default function JobSiteMap({
  workLocation,
  latitude,
  longitude,
  jobTitle,
  clientName,
  className = "",
}: JobSiteMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcons();
    setMounted(true);
  }, []);

  const [lat, lng] = resolveCoordinates(latitude, longitude, workLocation);
  const locationLabel = workLocation || "Dire Dawa, Ethiopia";

  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  if (!mounted) {
    return (
      <div className={`h-48 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center text-xs text-slate-400 ${className}`}>
        Loading OpenStreetMap...
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Map Canvas */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 shadow-inner z-0">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <MapRecenter center={[lat, lng]} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[lat, lng]} icon={createJobSiteIcon()}>
            <Popup className="jobsite-popup">
              <div className="p-1 space-y-1 font-sans text-xs">
                <p className="font-bold text-slate-900">{jobTitle || "Job Site Location"}</p>
                <p className="text-[11px] text-slate-600 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-600 inline" />
                  {locationLabel}
                </p>
                {clientName && (
                  <p className="text-[10px] text-slate-500">Client: {clientName}</p>
                )}
                <p className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Location Overlay Badge */}
        <div className="absolute top-2 left-2 z-[500] max-w-[85%] rounded-lg bg-white/90 dark:bg-[#0a0f18]/90 backdrop-blur-md px-2.5 py-1.5 border border-slate-200/80 dark:border-white/10 shadow-sm flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate">
            {locationLabel}
          </p>
        </div>
      </div>

      {/* Navigation Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <Compass className="h-3.5 w-3.5 text-emerald-600 dark:text-[#a3e635]" />
          <span>{lat.toFixed(4)}° N, {lng.toFixed(4)}° E</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e141d] px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition shadow-xs"
          >
            <ExternalLink className="h-3 w-3" />
            <span>OpenStreetMap</span>
          </a>

          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-xs font-semibold transition shadow-xs"
          >
            <Navigation className="h-3 w-3" />
            <span>Directions</span>
          </a>
        </div>
      </div>
    </div>
  );
}
