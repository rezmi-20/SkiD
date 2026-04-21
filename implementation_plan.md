# Implementation Plan — Mobile PWA Overhaul ("App-First" UI)

We will completely redesign the mobile experience to move away from "web-like" patterns and adopt a "native-app" aesthetic and functionality.

## Proposed Changes

### 1. Header & Navigation (True Mobile Shell)
#### [MODIFY] [AppShell.tsx](components/ui/AppShell.tsx)
- **Hide Top Bar**: Completely remove the `Desktop Navigation` bar for screens smaller than `md`.
- **Top Brand Mark**: Add a very subtle logo on the top left of the *content* area, not a sticky bar.
- **Main Bottom Nav**: Ensure it is strictly `fixed bottom-0` and anchored to `pb-safe`.

---

### 1. Fix: CSS Build Error & Blank Screen
#### [MODIFY] [globals.css](app/globals.css)
- **Fix Build Error**: Rewrite selectors targeting arbitrary Tailwind classes (e.g., `.bg-[#0e0e0e]`) to use attribute selectors or proper escaping to satisfy the Next.js 16/Turbopack CSS parser.
- **Theme Mappings**: Ensure `@theme` block is fully compatible with Tailwind v4.

#### [MODIFY] [LandingPageContent.jsx](components/LandingPageContent.jsx)
- Remove the full-screen `!mounted` conditional if possible, or replace it with a more transparent transition.
- Ensure all custom theme variables are correctly referenced to avoid CSS crashes.
- Fix potential hydration mismatches in the theme toggle and language switch.

---

### 2. Worker Cards (Mobile Stack)
#### [MODIFY] [WorkerCard.tsx](components/search/WorkerCard.tsx)
- **Responsive Layout**: On mobile, stack the content where necessary to avoid name truncation ("Ahme...").
- **Compact Badges**: Reduce the size of the verification badge and star ratings for mobile.
- **Touch Targets**: Optimize the "Message" and "Profile" buttons to be full-width on mobile for easier thumb access.

---

### 3. Functional Logout
#### [MODIFY] [Profile Page](app/(client)/client/profile/page.tsx)
- **Primary Logout Button**: Add a large, high-contrast "Sign Out" button at the bottom of the profile section.
- **Session Info**: Display the logged-in email clearly.

---

### 4. Search & Filters (Information Density)
#### [MODIFY] [SearchFilters.tsx](components/search/SearchFilters.tsx)
- **Slim Search**: Reduce the height of the search bar on mobile.
- **Category Refinement**: Reduce vertical padding between categories and result counts.

---

## Verification Plan

### Automated Tests
- `npm run build` to ensure no environment regressions.

### Manual Verification
- Use Chrome DevTools to simulate **iPhone SE** (smallest screen) and **Pixel 7**.
- Verify that **Sign Out** redirects back to `/login` smoothly.
- Ensure the bottom nav doesn't cover the "Message" buttons on the last worker card.
