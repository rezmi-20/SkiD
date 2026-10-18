export interface CachedWorkerData {
  worker: {
    id: string;
    email?: string;
    full_name: string;
    bio: string;
    skills: string[];
    latitude: number | null;
    longitude: number | null;
    hourly_rate: string;
    avatar_url: string;
    is_verified: boolean;
    avg_rating: string | number;
    total_ratings: string | number;
    availability?: string;
  };
  reviews: any[];
  timestamp: number;
}

const memoryCache = new Map<string, CachedWorkerData>();

export function getCachedWorker(id: string): CachedWorkerData | null {
  if (!id) return null;
  if (memoryCache.has(id)) {
    return memoryCache.get(id)!;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`worker_cache_${id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        memoryCache.set(id, parsed);
        return parsed;
      }
    } catch {
      // storage unavailable or quota exceeded
    }
  }
  return null;
}

export function setCachedWorker(id: string, data: { worker: any; reviews?: any[] }) {
  if (!id || !data.worker) return;
  const entry: CachedWorkerData = {
    worker: data.worker,
    reviews: data.reviews || [],
    timestamp: Date.now(),
  };
  memoryCache.set(id, entry);
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(`worker_cache_${id}`, JSON.stringify(entry));
    } catch {
      // ignore storage errors
    }
  }
}
