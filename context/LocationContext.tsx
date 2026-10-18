"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);
  const { data: session } = authClient.useSession();
  const watchIdRef = useRef<number | null>(null);

  const syncLocationWithBackend = useCallback(async (coords: Coords) => {
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
    setLocation(newCoords);
    setAccuracy(Math.round(position.coords.accuracy || 0));
    setIsLive(true);
    setError(null);
    setLoading(false);

    try {
      localStorage.setItem('direskill-coords', JSON.stringify(newCoords));
    } catch (e) {
      // storage unavailable
    }

    if (session) {
      syncLocationWithBackend(newCoords);
    }
  }, [session, syncLocationWithBackend]);

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    console.warn("[LOCATION_WARN] Geolocation error or timeout:", err.message);
    setError(err.message);
    setLoading(false);
    setIsLive(false);

    // Fallback to cached location if available
    try {
      const cached = localStorage.getItem('direskill-coords');
      if (cached) {
        setLocation(JSON.parse(cached));
        return;
      }
    } catch (e) {
      // ignore
    }

    // Default to Dire Dawa Sabian center
    setLocation(DEFAULT_CENTER);
  }, []);

  const refreshLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  }, [handlePositionSuccess, handlePositionError]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Initial load from cache to render quickly
    try {
      const cached = localStorage.getItem('direskill-coords');
      if (cached) {
        setLocation(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {
      console.error("Failed to load cached location", e);
    }

    // 2. Fetch fresh high-accuracy position immediately
    refreshLocation();

    // 3. Start active watchPosition for real-time live location tracking
    if (navigator.geolocation) {
      try {
        watchIdRef.current = navigator.geolocation.watchPosition(
          handlePositionSuccess,
          handlePositionError,
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
        );
      } catch (err) {
        console.warn("Could not start watchPosition", err);
      }
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [refreshLocation, handlePositionSuccess, handlePositionError]);

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
