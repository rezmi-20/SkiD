"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { authClient } from "@/lib/auth/client";

interface Coords {
  lat: number;
  lng: number;
}

interface LocationContextType {
  location: Coords | null;
  error: string | null;
  loading: boolean;
  accuracy: number | null;
  isLive: boolean;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Default center: Sabian Area, Dire Dawa
export const DEFAULT_CENTER: Coords = { lat: 9.5915, lng: 41.8661 };

const MIN_UI_MOVE_METERS = 25;
const MIN_BACKEND_SYNC_METERS = 50;
const MIN_BACKEND_SYNC_MS = 15_000;

function haversineMeters(a: Coords, b: Coords): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatGeolocationError(err: GeolocationPositionError): string {
  if (err.code === 1) return "Location permission denied. Using Dire Dawa default.";
  if (err.code === 2) return "GPS position unavailable. Using fallback location.";
  if (err.code === 3) return "GPS request timed out.";
  return err.message || "Unable to retrieve location.";
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [location, setLocation] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const { data: session } = authClient.useSession();

  const watchIdRef = useRef<number | null>(null);
  const locationRef = useRef<Coords | null>(null);
  const isLiveRef = useRef<boolean>(false);
  const manualRefreshRef = useRef<boolean>(false);
  const lastSyncedCoordsRef = useRef<Coords | null>(null);
  const lastSyncedAtRef = useRef<number>(0);
  const syncedUserIdRef = useRef<string | null>(null);

  const shouldAutoTrack = Boolean(
    pathname && (pathname.startsWith("/client") || pathname.startsWith("/worker"))
  );

  const syncLocationWithBackend = useCallback(async (coords: Coords, userId?: string | null, force = false) => {
    if (!userId) return;
    const now = Date.now();
    const lastCoords = lastSyncedCoordsRef.current;
    const sameUser = syncedUserIdRef.current === userId;
    const movedEnough = !lastCoords || haversineMeters(lastCoords, coords) >= MIN_BACKEND_SYNC_METERS;
    const cooledDown = now - lastSyncedAtRef.current >= MIN_BACKEND_SYNC_MS;

    if (!force && sameUser && (!movedEnough || !cooledDown)) {
      return;
    }

    lastSyncedCoordsRef.current = coords;
    lastSyncedAtRef.current = now;
    syncedUserIdRef.current = userId;

    try {
      await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coords),
      });
    } catch (e) {
      console.error("Failed to sync location with backend", e);
    }
  }, []);

  const handlePositionSuccess = useCallback((position: GeolocationPosition) => {
    const newCoords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    const nextAccuracy = Math.round(position.coords.accuracy || 0);
    const prevCoords = locationRef.current;
    const wasLive = isLiveRef.current;
    const isManual = manualRefreshRef.current;
    manualRefreshRef.current = false;

    const movedEnoughForUi = !prevCoords || haversineMeters(prevCoords, newCoords) >= MIN_UI_MOVE_METERS;

    if (!wasLive || movedEnoughForUi || isManual) {
      locationRef.current = newCoords;
      setLocation(newCoords);
    }

    isLiveRef.current = true;
    setAccuracy(nextAccuracy);
    setIsLive(true);
    setError(null);
    setLoading(false);

    try {
      localStorage.setItem('direskill-coords', JSON.stringify(newCoords));
    } catch {
      // storage unavailable
    }

    const userId = session?.user?.id ?? null;
    if (userId) {
      syncLocationWithBackend(newCoords, userId, isManual);
    }
  }, [session?.user?.id, syncLocationWithBackend]);

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    manualRefreshRef.current = false;
    const readableError = formatGeolocationError(err);
    console.warn("[LOCATION_WARN]", readableError);
    setError(readableError);
    setLoading(false);

    // Keep an existing live GPS fix intact on transient watchPosition timeouts
    if (err.code === 3 && isLiveRef.current && locationRef.current) {
      return;
    }

    isLiveRef.current = false;
    setIsLive(false);

    if (locationRef.current) {
      return;
    }

    // Fallback to cached location if available
    try {
      const cached = localStorage.getItem('direskill-coords');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          locationRef.current = parsed;
          setLocation(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }

    // Default to Dire Dawa Sabian center
    locationRef.current = DEFAULT_CENTER;
    setLocation(DEFAULT_CENTER);
  }, []);

  const refreshLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      if (!locationRef.current) {
        locationRef.current = DEFAULT_CENTER;
        setLocation(DEFAULT_CENTER);
      }
      return;
    }

    manualRefreshRef.current = true;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  }, [handlePositionSuccess, handlePositionError]);

  const handlePositionSuccessRef = useRef(handlePositionSuccess);
  handlePositionSuccessRef.current = handlePositionSuccess;

  const handlePositionErrorRef = useRef(handlePositionError);
  handlePositionErrorRef.current = handlePositionError;

  const refreshLocationRef = useRef(refreshLocation);
  refreshLocationRef.current = refreshLocation;

  // Load cached coordinates immediately once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cached = localStorage.getItem('direskill-coords');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          locationRef.current = parsed;
          setLocation(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load cached location", e);
    }

    locationRef.current = DEFAULT_CENTER;
    setLocation(DEFAULT_CENTER);
    setLoading(false);
  }, []);

  // Start real-time GPS tracking on authenticated client/worker areas (or if already permitted)
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    let cancelled = false;
    const startTracking = () => {
      if (cancelled) return;
      refreshLocationRef.current();
      if (watchIdRef.current === null) {
        try {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => handlePositionSuccessRef.current(pos),
            (err) => handlePositionErrorRef.current(err),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
          );
        } catch (err) {
          console.warn("Could not start watchPosition", err);
        }
      }
    };

    if (shouldAutoTrack) {
      startTracking();
    } else if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((status) => {
          if (status.state === "granted") {
            startTracking();
          }
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [shouldAutoTrack]);

  // Sync live GPS coordinates once session finishes resolving
  useEffect(() => {
    const userId = session?.user?.id ?? null;
    if (userId && isLive && location && syncedUserIdRef.current !== userId) {
      syncLocationWithBackend(location, userId, true);
    }
  }, [session?.user?.id, isLive, location, syncLocationWithBackend]);

  return (
    <LocationContext.Provider value={{ location, error, loading, accuracy, isLive, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
