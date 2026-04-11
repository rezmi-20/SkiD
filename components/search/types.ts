export interface Worker {
  id: string | number;
  name: string;
  skill: string;
  rating: number;
  reviews: number;
  distance: number;
  lat: number;
  lng: number;
  photo: string;
  isVerified: boolean;
  category: string;
  district: string;
  bio?: string;
  skills?: string[];
}

export type ViewMode = "list" | "map";

export interface SearchFilters {
  query: string;
  category: string;
  minRating: number;
  maxDistance: number;
  sortBy: "Nearest" | "Highest Rated" | "Most Reviewed" | "";
}
