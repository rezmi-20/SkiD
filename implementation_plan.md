# Implementation Plan — Search Workers Page

We will build the core discovery experience for clients, allowing them to find skilled workers in Dire Dawa through a high-contrast, performant interface featuring smart filters and a map-integrated view.

## Proposed Changes

### 1. Dependencies
We need to install the map libraries required for the Map View.
- `leaflet`: The core mapping engine.
- `react-leaflet`: React wrapper for Leaflet.
- `@types/leaflet`: TypeScript definitions.

---

### 2. Search Page Components
We will break the page into focused components to maintain the "Precision Suite" aesthetics.

#### [NEW] [WorkerCard.tsx](components/search/WorkerCard.tsx)
- Premium card design with hairline borders and sharp typography.
- Displays worker name, rating (★), review count, and distance.
- Includes a "Verified" badge for Fayda-approved profiles.

#### [NEW] [SearchFilters.tsx](components/search/SearchFilters.tsx)
- Category chips (Plumber, Electrician, etc.).
- Rating and Distance sliders/toggles.
- View switcher (List ↔ Map).

#### [NEW] [MapComponent.tsx](components/search/MapComponent.tsx)
- A Leaflet map centered on Dire Dawa.
- Dynamically imported (using `next/dynamic`) to avoid SSR issues.
- Displays worker markers; clicking a marker shows a preview popup.

---

### 3. Main Search Page
#### [NEW] [search/page.tsx](app/(client)/client/search/page.tsx)
- The main entry point for clients.
- Manages search state (query, filters).
- Provides mock data for early testing and hooks up the List and Map views.

---

## Technical Details: Geolocation
- For the initial version, we will use mock coordinates for Dire Dawa neighborhoods (Kezira, Gende Korem, Megala).
- We will implement a basic Haversine distance calculation to show "Distance from you."

## Verification Plan

### Automated Tests
1. Run `npm run build` to verify Leaflet dynamic imports and SSR safety.

### Manual Verification
1. **Search**: Type "Plumber" and verify the list filters correctly.
2. **View Toggle**: Switch between List and Map views smoothly.
3. **Map Interaction**: Click a marker on the map and verify the worker's info appears.
4. **Filters**: Adjust the rating filter and verify only high-rated workers remain.
