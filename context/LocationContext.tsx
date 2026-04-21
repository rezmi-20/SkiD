"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Coords {
  lat: number;
  lng: number;
}

interface LocationContextType {
  location: Coords | null;
  error: string | null;
  loading: boolean;
  refreshLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Default center: Sabian Area, Dire Dawa
export const DEFAULT_CENTER: Coords = { lat: 9.5915, lng: 41.8661 };

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { data: session } = useSession();

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newCoords);
        setError(null);
        setLoading(false);
        
        // Save to localStorage
        localStorage.setItem('direskill-coords', JSON.stringify(newCoords));
        
        // Sync with backend if logged in
        if (session) {
            syncLocationWithBackend(newCoords);
        }
      },
      (err) => {
        console.warn("Geolocation failed or timed out", err.message);
        setError(err.message);
        setLoading(false);
        
        // Fallback to cached location
        const cached = localStorage.getItem('direskill-coords');
        if (cached) {
          try {
            setLocation(JSON.parse(cached));
          } catch(e) {
            console.error("Malformed cached coords", e);
          }
        } else {
            // Default to Dire Dawa center if no cache
            setLocation(DEFAULT_CENTER);
        }
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  const syncLocationWithBackend = async (coords: Coords) => {
    try {
      await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coords),
      });
    } catch (e) {
      console.error("Failed to sync location with backend", e);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    console.debug("[DIREDAWA-DIAG] LocationProvider mounting");

    // Initial load from cache
    try {
      const cached = localStorage.getItem('direskill-coords');
      if (cached) {
        setLocation(JSON.parse(cached));
        setLoading(false);
      }
    } catch (e) {
      console.error("Failed to load cached location", e);
    }
    
    // Trigger fresh check
    refreshLocation();
    
    // Set up interval for background updates (Approved for clients)
    const interval = setInterval(refreshLocation, 120000); // Every 2 minutes
    return () => clearInterval(interval);
  }, [refreshLocation]);

  return (
    <LocationContext.Provider value={{ location, error, loading, refreshLocation }}>
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
