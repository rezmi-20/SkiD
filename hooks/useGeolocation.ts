"use client";

import { useState, useEffect, useCallback } from "react";

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  /** Automatically request location on mount. Default: false */
  autoRequest?: boolean;
  /** Watch for position changes. Default: false */
  watch?: boolean;
  /** PositionOptions passed to the browser API */
  positionOptions?: PositionOptions;
}

/**
 * useGeolocation
 * Wraps the browser Geolocation API for requesting and watching the user's position.
 * Used by the worker search map, worker location update, and "near me" filtering.
 */
export function useGeolocation({
  autoRequest = false,
  watch = false,
  positionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
}: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const onSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      loading: false,
    });
  }, []);

  const onError = useCallback((err: GeolocationPositionError) => {
    setState((prev) => ({
      ...prev,
      error: err.message,
      loading: false,
    }));
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by this browser.",
        loading: false,
      }));
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(onSuccess, onError, positionOptions);
  }, [onSuccess, onError, positionOptions]);

  useEffect(() => {
    if (autoRequest) {
      requestLocation();
    }
  }, [autoRequest, requestLocation]);

  useEffect(() => {
    if (!watch || !navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, positionOptions);
    return () => navigator.geolocation.clearWatch(watchId);
  }, [watch, onSuccess, onError, positionOptions]);

  return { ...state, requestLocation };
}
