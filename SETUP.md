# DireSkill — Developer Onboarding & Setup Guide

> **For AI assistants (Antigravity, Copilot, etc.):** Read this entire file before making any changes. It documents the full project architecture, all environment variables, known issues, and the correct patterns to follow.

---

## 1. Project Overview

**DireSkill** is a mobile-first PWA marketplace for skilled workers (electricians, plumbers, painters, etc.) in Dire Dawa, Ethiopia. Clients can find and hire verified workers. Workers register with Fayda ID and receive jobs through the platform.

| Feature                             | Status                                       |
| ----------------------------------- | -------------------------------------------- |
| Auth (Email/Phone + Password)       | ✅ Done                                      |
| Client job search + map             | ✅ Done                                      |
| Worker dashboard + gigs             | ✅ Done                                      |
| Admin verification panel            | ✅ Done                                      |
| Global theme (light/dark/grayscale) | ✅ Done                                      |
| Global language (EN / Amharic)      | ✅ Done                                      |
| PWA Support (Offline/Install)       | ✅ Active (Fixed sw.js paths)                |
| High-Fidelity Landing & Search      | ✅ Done (Bento layouts)                      |
| My Contracts Hub (Lumina Design)    | ✅ Done (List & Digital Contract views)      |
| Bidirectional Rating & Reviews      | ✅ Done (with media support & unique guards) |
| In-App Notification Hub             | ✅ Done (Bell polling + real-time alerts)    |
| Payment Simulation                  | ✅ Done (Chapa test mode with receipt UI)    |
| Stability & Hydration Fixes         | ✅ Active                                    |

**GitHub:** https://github.com/rezmi-20/SkiD  
**Branch:** `main`

---

## 2. Default Admin Credentials

For local development and platform management, use the following administrator credentials:

| Role      | Email                  | Password   |
| --------- | ---------------------- | ---------- |
| **Admin** | `admin@dire-skill.com` | `admin123` |

---

## 3. Tech Stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Framework  | Next.js 16.2.2 (App Router, Turbopack)                 |
| Language   | TypeScript + JSX                                       |
| Styling    | Tailwind CSS v4 + vanilla CSS custom properties        |
| Auth       | Neon Auth (@neondatabase/auth) — Email/OTP, Multi-role |
| Database   | Neon PostgreSQL (serverless)                           |
| ORM        | Drizzle ORM                                            |
| Map        | Leaflet + react-leaflet                                |
| Animations | Framer Motion                                          |
| Theming    | next-themes (`attribute="data-theme"`)                 |
| Payments   | Chapa (Ethiopian payment gateway)                      |

---

## 3. Prerequisites

Install these **before cloning**:

```bash
# Node.js 20+ (check with: node -v)
# npm 10+   (check with: npm -v)
# Git       (check with: git --version)
```

> On Windows, use **PowerShell** or **Git Bash**. The shell separator `&&` does NOT work in PowerShell — run commands one at a time.

---

## 4. Clone & First-Time Setup

```bash
# 1. Clone
git clone https://github.com/rezmi-20/SkiD.git
cd SkiD

# 2. Install dependencies
npm install

# 3. Create environment file (see Section 5)
# Create .env.local in the project root

# 4. Run dev server
npm run dev
```

> ⚠️ `.env.local` is **gitignored** and will NOT be on the new device after cloning. You must recreate it manually (see Section 5).

### 4.1 Save and Push Changes

When you make local updates and want to keep them in the repository:

```bash
git add .
git commit -m "Describe your changes"
git push origin main
```

The remote repository for this project is:

```bash
https://github.com/rezmi-20/SkiD.git
```

If you are working from a feature branch, replace `main` with your branch name.

---

## 5. Environment Variables

Create a file named **`.env.local`** in the project root with exactly these values:

```env
# Neon PostgreSQL — serverless DB hosted on neon.tech
DATABASE_URL=postgresql://neondb_owner:npg_uH9bUs3KmtLP@ep-mute-meadow-anqyrcz7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Neon Auth (Better Auth) configuration (Optional for local fallback, but recommended)
NEON_AUTH_BASE_URL=https://auth.neon.tech
NEON_AUTH_COOKIE_SECRET=your_secret_here
```

> ⚠️ **IMPORTANT NOTE FOR NEW DEVICES:** Because `.env.local` is gitignored, it does not get pulled automatically. You **must** create it manually in the root of the directory on your new device for the database connection to work.

> **Note:** The Neon database is already provisioned and seeded. No migration needed on first run (tables already exist in the cloud DB).

### 5.1 Troubleshooting Database Connection Problems on a New Device

If you can see the web app running but it hangs, shows a blank screen, or fails on registration/login due to a database error, follow these verification steps:

1. **Verify `.env.local` Existence**: Ensure the `.env.local` file is in the root directory (same folder as `package.json`, NOT inside the `app` or `lib` folder).
2. **Verify Environment Variables**: Make sure the keys are exactly `DATABASE_URL` with the connection string provided in Section 5 above (without spaces, double quotes, or trailing slashes).
3. **Restart the Dev Server**: Next.js does **not** hot-reload changes in `.env.local`. You **must** stop the server (`Ctrl + C`) and restart it using `npm run dev` to load the new values.
4. **Neon IP Allowlist Block**:
   - If your database dashboard has an IP Allowlist turned on, it will reject requests from your new machine's IP address.
   - Go to your **Neon Console -> Settings -> Security -> IP Allowlist** and verify if it's restricting connections.
5. **Flush Service Worker & Local Cache**:
   - The PWA Service Worker may cache old pages that attempt connections to obsolete endpoints.
   - Open Chrome DevTools (`F12`).
   - Navigate to the **Application** tab.
   - Click **Storage** on the left menu, and click **Clear site data**.
   - Refresh the page to reload the latest bundle.

---

## 6. Common Installation Errors & Fixes

### ❌ `npm install` — peer dependency warnings

```
npm warn peer dep missing: react@19 ...
```

**Fix:** These are just warnings, not errors. Run `npm install --legacy-peer-deps` if install fails.

### ❌ TypeScript error on first run

```
Cannot find module '@/context/LanguageContext'
```

**Fix:** This file exists at `context/LanguageContext.tsx`. Make sure `tsconfig.json` has `"paths": { "@/*": ["./*"] }`.

### ❌ Leaflet SSR crash

```
window is not defined (leaflet)
```

**Fix:** `MapComponent` must always be imported with `dynamic(..., { ssr: false })`. Never import it directly.  
Already implemented in `app/(client)/client/search/page.tsx`.

### ❌ next-themes hydration mismatch

```
Hydration failed because server rendered HTML didn't match client
```

**Fix:** Any component using `useTheme()` **MUST** have a mounted guard:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
// Defer theme-specific rendering until mounted === true
const themeIcon = !mounted
  ? "contrast"
  : theme === "dark"
    ? "dark_mode"
    : "light_mode";
```

Already implemented in `AppShell.tsx`. New components must follow the same pattern.

### ❌ `&&` not working in PowerShell terminal

```
The token '&&' is not a valid statement separator
```

**Fix:** Run commands one-by-one in PowerShell. Or switch to Git Bash.

### ❌ `npm run dev` — port already in use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Fix:**

```powershell
# Kill the process using port 3000
npx kill-port 3000
npm run dev
```

### ❌ Module not found: `@neondatabase/serverless`

**Fix:** Run `npm install` again. If it still fails:

```bash
npm install @neondatabase/serverless
```

### ❌ Login Redirect Loop / Endless Loading on localhost (Neon Auth)

**Symptoms:** After signing in successfully, you are immediately redirected back to the login page.
**Cause:** The remote Neon Authentication Server strictly issues cookies with the `__Secure-` prefix. Chrome and Edge will silently drop these cookies if the app is running on plain `http://localhost:3000`.
**Fix (Already implemented):** We built a local HTTP workaround into the proxy (`app/api/auth/[...path]/route.ts`) and `middleware.ts`. It dynamically strips the `__Secure-` prefix when sending cookies to your browser, and silently adds it back before sending requests to the Neon server. You do not need to use `mkcert` or `--experimental-https`.

### ❌ 500 Internal Server Error immediately after code change

**Symptoms:** After fixing a file, the browser still shows a 500 error complaining about a syntax error or a missing property in a route file.
**Cause:** Next.js 16 (Turbopack) occasionally fails to invalidate its build cache when modifying catch-all API routes (like `[...path]/route.ts`).
**Fix:** Perform a Nuclear Reset on the cache: stop the dev server, delete the `.next/` directory (`Remove-Item -Recurse -Force .next`), and run `npm run dev` again.

---

## 7. Project Architecture

```
SklD/
├── app/
│   ├── layout.jsx              ← Root layout: fonts, Providers wrapper, PWA meta
│   ├── page.jsx                ← Landing page entry (renders LandingPageContent)
│   ├── globals.css             ← Design tokens (CSS vars), theme overrides, Tailwind
│   │
│   ├── (auth)/                 ← Auth group (no AppShell)
│   │   ├── login/page.tsx
│   │   ├── register/
│   │   │   ├── client/page.tsx
│   │   │   └── worker/page.tsx
│   │
│   ├── (client)/               ← Client group (wrapped in AppShell role="client")
│   │   ├── layout.tsx          ← Auth guard + AppShell
│   │   └── client/
│   │       ├── search/page.tsx ← Worker search + map
│   │       ├── dashboard/      ← My Jobs
│   │       ├── messages/       ← Chat (In Progress)
│   │       ├── profile/        ← Client profile
│   │       ├── contracts/      ← Redirects to /contracts
│   │       ├── notifications/  ← Notification Hub
│   │       ├── pay/[jobId]/    ← Payment Simulation
│   │       └── rate/[jobId]/   ← Rating Page
│   │
│   ├── (worker)/               ← Worker group (wrapped in AppShell role="worker")
│   │   ├── layout.tsx
│   │   └── worker/
│   │       ├── dashboard/page.tsx ← Earnings, jobs, analytics
│   │       ├── gigs/page.tsx
│   │       ├── earnings/page.tsx
│   │       ├── messages/       ← Chat (In Progress)
│   │       ├── profile/        ← Worker profile
│   │       ├── notifications/  ← Notification Hub
│   │       └── rate/[jobId]/   ← Rating Page
│   │
│   ├── (admin)/                ← Admin panel
│   │   ├── layout.tsx
│   │   └── admin/
│   │       ├── dashboard/
│   │       └── verify/[id]/    ← Worker ID verification
│   │
│   ├── contracts/              ← Contracts Hub
│   │   └── [id]/               ← Digital Contract view
│   │
│   ├── diag/                   ← Diagnostic tools
│   │
│   └── api/
│       ├── auth/[...nextauth]/ ← NextAuth route handler
│       ├── auth/register/      ← User registration
│       ├── jobs/               ← Job CRUD
│       ├── workers/            ← Worker search
│       ├── ratings/
│       ├── contracts/          ← Contract retrieval
│       └── payments/chapa/     ← Simulated Chapa API
│
├── components/
│   ├── LandingPageContent.jsx  ← Full landing page (hero, categories, how it works)
│   ├── ContractsPageContent.tsx ← My Contracts list (Lumina style)
│   ├── ContractDetails.tsx     ← Digital Contract detail view
│   ├── Providers.tsx           ← ThemeProvider + LanguageProvider + SessionProvider
│   └── ui/
│       ├── AppShell.tsx        ← Authenticated layout shell (nav + mobile nav + notification bell)
│       └── MobileNav.tsx       ← Bottom tab bar for mobile
│   └── search/
│       ├── WorkerCard.tsx      ← Worker result card
│       ├── SearchFilters.tsx   ← Search bar + filters + category chips
│       ├── MapComponent.tsx    ← Leaflet map (SSR-safe, dynamic import only)
│       └── types.ts            ← Shared TypeScript types for search feature
│
├── context/
│   └── LanguageContext.tsx     ← Global language state (EN/AM), t() hook
│
├── lib/
│   ├── db.ts                   ← Neon SQL client
│   ├── auth.ts                 ← NextAuth config
│   ├── schema.ts               ← Drizzle ORM schema (all tables)
│   ├── translations.ts         ← EN/AM translation strings
│   └── actions/
│       ├── admin.ts            ← Admin server actions
│       ├── notifications.ts    ← Notification server actions
│       ├── ratings.ts          ← Rating server actions
│       └── payments.ts         ← Payment server actions
│
├── types/
│   └── index.ts                ← Shared global types (e.g., Session user augmentation)
│
├── scratch/
│   └── simulate_flow.js        ← End-to-end flow testing script
│
├── public/
│   ├── site.webmanifest        ← PWA manifest (Renamed from .json to bypass blockers)
│   ├── noise.svg               ← Local grain texture (Local to bypass ad-blockers)
│   └── sw.js                   ← Service worker (Auto-unregisters on localhost)
│
├── .env.local                  ← ⚠️ NOT in git. Create manually (see Section 5)
├── next.config.js
├── tailwind.config.ts          (not present — Tailwind v4 uses postcss plugin)
├── drizzle.config.ts
└── tsconfig.json
```

---

## 8. Design System

### Theme System

The app uses **3 themes** controlled by `next-themes` with `attribute="data-theme"`. The **Grayscale (Premium)** mode is the default and recommended experience.

| Theme                 | Key         | Description                                                                    |
| --------------------- | ----------- | ------------------------------------------------------------------------------ |
| Grayscale (Premium)   | `grayscale` | **Default**. Charcoal backgrounds (`#09090b`), Neon-Green accents (`#4ade80`). |
| Bento Noir (Dark)     | `dark`      | Deepest black (`#000000`), consistent green accents.                           |
| Bento Lumiere (Light) | `light`     | Warm ivory background, high-contrast text.                                     |

**CSS Variables** (defined in `globals.css`):

```css
--bg-page        /* Main page background */
--text-high      /* Primary high-contrast text */
--text-med       /* Secondary muted text */
--primary-accent /* Brand accent (Neon-Green) */
--brand-logo     /* Brand identity color */
--surface-glass  /* Semi-transparent panel background */
--border-glass   /* Subtle border/separator color */
```

**Tailwind mappings** (in `@theme` block of `globals.css`):
bg-background → --bg-page
bg-surface → --surface-glass
border-border → --border-glass
text-text-high → --text-high
text-text-med → --text-med
text-primary → --primary-accent
brand-logo → --brand-logo

````

### Iconography Strategy
⚠️ **IMPORTANT:** Do NOT use icon fonts (Material Symbols, FontAwesome) or external icon libraries.
- Use **Inline SVGs** exclusively.
- Icons should be defined directly in the component or imported from a local SVG file.
- This ensures zero layout shifts (CLS), perfect offline reliability in the PWA, and absolute control over "Neon-Green" glow effects.

> ⚠️ **Never use hardcoded dark Tailwind classes** like `bg-black/50`, `border-white/5`, `text-white` in new components. Always use the semantic tokens above so all 3 themes work.

### Language System
```tsx
import { useLanguage } from "@/context/LanguageContext";

const { t, language, setLanguage } = useLanguage();
// t("nav.home") → "Home" | "ዋና ገፅ"
````

Add new keys to `lib/translations.ts` under both `en` and `am` objects.

---

## 9. Database Schema (Neon PostgreSQL)

Tables already created in cloud DB:

| Table             | Purpose                                                                  |
| ----------------- | ------------------------------------------------------------------------ |
| `users`           | All users (id, email, phone, password_hash, role)                        |
| `worker_profiles` | Worker details (skills, location, fayda_doc, is_verified)                |
| `client_profiles` | Client details                                                           |
| `jobs`            | Job postings (pending/active/completed/disputed/cancelled)               |
| `contracts`       | Contract PDFs per job                                                    |
| `ratings`         | Rating scores, text, media `photo_urls[]`, and `is_flagged` per job/user |
| `messages`        | Chat messages between users                                              |
| `payments`        | Chapa payment records (held/released/refunded)                           |
| `notifications`   | Cross-platform real-time alerts (`is_read`, `type`, `link_href`)         |

### Roles

- `client` → can search workers, post jobs, pay
- `worker` → receives jobs, needs Fayda verification
- `admin` → verifies workers, manages platform

### Running migrations (only if schema changes)

```bash
npx drizzle-kit push
```

---

## 10. Key Patterns to Follow

### Adding a new translated string

1. Add to `lib/translations.ts` under both `en` and `am`
2. Use `const { t } = useLanguage()` in the component
3. Call `t("your.key")`

### Adding a new page inside a role group

- Client pages go in `app/(client)/client/[page]/page.tsx`
- Worker pages go in `app/(worker)/worker/[page]/page.tsx`
- Admin pages go in `app/(admin)/admin/[page]/page.tsx`
- The `layout.tsx` in each group handles auth guard + AppShell

### Writing a new Server Component with DB

```tsx
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function MyPage() {
  // Use the compatibility wrapper from @/lib/auth
  const session = await auth();
  if (!session || session.user.role !== "worker") redirect("/login");

  const rows =
    await sql`SELECT * FROM jobs WHERE worker_id = ${session.user.id}`;
  // ...render
}
```

### Writing a new Client Component with theme

````tsx
"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function MyComponent() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

### ❌ White Screen / Hydration Hang (SOLVED)
**Symptoms:** Page stays white or flashes white endlessly on mobile devices.
**Cause:** `next-themes` applies the theme after hydration, which can cause a flash of unstyled content or a "white-out" if the default CSS doesn't match the system preference immediately.
**Fix:** We implemented an **Early Theme Injection Script** in the `<head>` of `layout.jsx`. This script reads the `localStorage` and applies the `data-theme` attribute **before** React even starts, ensuring the Charcoal background is rendered instantly.

### ❌ Ad Blocker / Hydration Hang
**Symptoms:** Page stays on "Initializing..." or a black screen endlessly.
**Cause:** Ad blockers often block `manifest.json` or external textures (e.g., Unsplash/Vercel assets) that React is waiting for during hydration.
**Fixes:**
1. We localized `noise.svg` and renamed the manifest to `site.webmanifest` to bypass typical filters.
2. Added a 4s fallback in `LandingPageContent.jsx` to force the app to mount even if a resource is blocked.
3. **If still stuck:** Toggling off your ad blocker for localhost will instantly resolve it.

### ❌ `useSession` must be wrapped in a `SessionProvider`
**Cause:** `LocationProvider` or other contexts tried to access the session before `SessionProvider` was initialized.
**Golden Rule:** Always ensure `SessionProvider` is at the very top of the nesting in `Providers.tsx`.

### ❌ Geolocation Search — Not Showing Profiles
**Symptoms:** Newly registered workers don't show up in search results.
**Cause:** Search results were filtered to only show `is_verified = true` workers.
**Fix:** We relaxed the filter to show all workers. New workers now show up immediately.

### ❌ Chrome Mobile White Screen
**Symptoms:** Page stays white on mobile browsers.
**Cause:** Often caused by hydration crashes or ad-blockers blocking critical assets (like `site.webmanifest`).
**Fixes:**
1. **IP Whitelisting:** Added `10.*` IP range to `sw.js` logic to prevent SW interference during local cross-device testing.
2. **Path Correction:** Fixed `sw.js` trying to cache a non-existent `manifest.json` (renamed to `site.webmanifest`).
3. **AppShell Centering:** Removed strict `max-w-7xl` centering that left large empty spaces on wide screens.

---

## 11. Project Continuity — Pulling to a New Device

To continue development on another device:

1. **Clone & Install**:
   ```bash
   git clone https://github.com/rezmi-20/SkiD.git
   cd SkiD
   npm install --legacy-peer-deps
````

2. **Recreate `.env.local`**: Use the values in **Section 5**.
3. **Confirm Manifest**: Ensure your browser dev tools show `site.webmanifest` loading instead of `manifest.json`.
4. **Clean Start**: If you see old cached versions, go to **Application > Storage > Clear site data** in Chrome DevTools.

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (check for errors)
npx tsc --noEmit     # TypeScript type check only (no build)
npx drizzle-kit push # Push schema changes to Neon DB
npx drizzle-kit studio # Open Drizzle Studio (visual DB explorer)
```

---

## 12. Nuclear Reset — When to Delete & Reinstall

Some problems **cannot be fixed by changing code**. They are caused by corrupted caches, stale build artifacts, or broken lock files. In these cases, the only correct fix is to **delete the specific directory and regenerate it**.

Here are all the cases you will encounter in this project:

---

### 🗑️ Case 1: Stale Next.js Build Cache (`.next/`)

**When to do this:**

- You see TypeScript errors referencing routes or files that no longer exist (e.g., old `[...nextauth]` route after migration).
- Pages are rendering old content even after you've changed the code.
- Build output references deleted files or shows phantom type errors.
- The dev server crashes on startup with cryptic module resolution errors.

**Fix:**

```powershell
# In PowerShell:
Remove-Item -Recurse -Force .next
npm run dev
```

```bash
# In Git Bash / Mac / Linux:
rm -rf .next
npm run dev
```

> The `.next` folder is **always safe to delete**. Next.js regenerates it fully on every `npm run dev` or `npm run build`.

---

### 🗑️ Case 2: Broken or Mismatched Dependencies (`node_modules/`)

**When to do this:**

- After pulling from a branch where `package.json` changed significantly.
- You see errors like `Cannot find module 'X'` even though it's listed in `package.json`.
- Running `npm install` gives peer dependency errors or skips packages silently.
- The app crashes with `Module not found: Error: Can't resolve '@neondatabase/auth/react'`.
- After switching Node.js versions (e.g., Node 18 → Node 20).

**Fix:**

```powershell
# In PowerShell:
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install --legacy-peer-deps
```

```bash
# In Git Bash / Mac / Linux:
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

> ⚠️ Always delete **both** `node_modules` AND `package-lock.json` together. Deleting only one can leave them out of sync.

---

### 🗑️ Case 3: TypeScript Build Cache (`tsconfig.tsbuildinfo`)

**When to do this:**

- `npx tsc --noEmit` reports errors for files that look perfectly correct.
- After a large refactor where many files were renamed or moved.
- You renamed or deleted a file but TypeScript still complains about it.

**Fix:**

```powershell
Remove-Item -Force tsconfig.tsbuildinfo
npx tsc --noEmit
```

---

### 🗑️ Case 4: Browser Service Worker & Cache (PWA)

**When to do this:**

- The browser loads an old cached version of the app even after a full rebuild.
- A white or black screen persists in the browser but the terminal shows no errors.
- Old API endpoint URLs (e.g., `/api/auth/register`) are being called even though you renamed them.
- The app works in **Incognito** but not in the normal browser window.

**Fix (Chrome / Edge):**

1. Open DevTools (`F12`).
2. Go to the **Application** tab.
3. Click **Service Workers** in the left panel → click **Unregister**.
4. Click **Storage** in the left panel → click **Clear site data**.
5. Hard refresh: `Ctrl + Shift + R`.

---

### 🗑️ Case 5: Full Clean Slate (New Device / Persistent Errors)

**When to do this:**

- You just cloned/pulled on a new device and nothing works.
- Multiple errors are happening at once and you can't isolate the root cause.
- You've tried everything and the app still won't start.

**Complete reset sequence (run in order):**

```powershell
# 1. Delete all generated/cached directories
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
Remove-Item -Force tsconfig.tsbuildinfo

# 2. Reinstall all dependencies
npm install --legacy-peer-deps

# 3. Verify your .env.local exists (CRITICAL - not in git!)
#    See Section 5 for the exact values to paste.

# 4. Start the dev server fresh
npm run dev
```

> ⚠️ After step 4, **do not open the browser immediately**. Wait for the terminal to show `✓ Ready on http://localhost:3000` before navigating to the page.

---

### 📋 Quick Reference Cheat Sheet

| Problem                       | Delete This                                      | Then Run                                            |
| ----------------------------- | ------------------------------------------------ | --------------------------------------------------- |
| Phantom TypeScript errors     | `.next/`                                         | `npm run dev`                                       |
| `Module not found` after pull | `node_modules/` + `package-lock.json`            | `npm install --legacy-peer-deps`                    |
| Old code still rendering      | `.next/`                                         | `npm run dev`                                       |
| TS errors on renamed files    | `tsconfig.tsbuildinfo`                           | `npx tsc --noEmit`                                  |
| Old API URLs being called     | Browser cache (DevTools)                         | Clear site data + Hard refresh                      |
| Nothing works (new device)    | `.next/` + `node_modules/` + `package-lock.json` | `npm install --legacy-peer-deps` then `npm run dev` |

---

## 13. Deployment Notes

- The app is **not yet deployed** to production.
- Planned platform: **Vercel** (free tier, automatic deploys from `main`)
- When deploying, add all `.env.local` variables to Vercel's Environment Variables dashboard.
- Change `NEXTAUTH_URL` to the production URL when deploying.

---

## 13. What's Still In Progress

| Feature            | File(s)                           | Notes                             |
| ------------------ | --------------------------------- | --------------------------------- |
| My Contracts Hub   | `app/contracts/[id]/`             | ✅ Done (Lumina design)           |
| Chapa payment flow | `app/api/payments/chapa/route.ts` | Webhook exists, needs test        |
| Messaging System   | `app/(client)/client/messages`    | UI implemented, Socket.io pending |
| Worker job browse  | `/worker/gigs`                    | ✅ Done                           |

---

## 14. Core Stability & Pattern Fixes

### ❌ Persistent "White Screen" on Mobile/Web

**Symptoms:** Page hangs on a blank white screen during initial load or transitions.
**Cause:** Next.js 16 Server Components suspend while waiting for database queries. Without a `loading.tsx` file, the browser has no HTML to render.
**Fix:** Implemented global `app/loading.tsx` and `app/error.tsx`. The app now shows a branded spinner immediately.

### ❌ Database Connection Exhaustion (Fixed)

**Cause:** Re-initializing the Neon client on every request in serverless.
**Fix:** Refactored `lib/db.ts` to use a **Singleton Pattern**.

### ❌ Service Worker Cache (Solved)

**Symptoms:** Page works in Incognito but shows blank in normal browser after deployment.
**Cause:** Cache-First strategy served old `index.html` referencing deleted JS bundles.
**Fix:** Updated `sw.js` to **Network-First** for navigation and bumped `CACHE_NAME` to `v2`.

---

_Last updated: 2026-05-13 — Post-Stability & SW Cache Fixes_

---

## 15. Development Workflow & Rules (Strict)

To ensure high code quality, stability, and maintainability, all AI assistants and developers MUST follow these rules:

### 15.1 Phased Implementation

- **Divide into Phases**: Every non-trivial task must have an implementation plan divided into logical phases.
- **Dynamic Phase Count**: The number of phases should be appropriate for the task's complexity (e.g., 3-8 phases).
- **Test-After-Phase**: Each phase must be tested and verified as "working" before proceeding to the next. Do not implement everything at once.

### 15.2 Root Cause Analysis (100% Certainty)

- **No Guess-Fixing**: When an error occurs, identify the problem with 100% certainty before attempting a fix.
- **Diagnostic Step**: Use logging, error boundaries, or isolated reproduction to confirm the bug.
- **Avoid "Trial and Error"**: If a fix fails twice, step back and re-analyze the root cause.

### 15.3 Modular Component Architecture (Small Files)

- **File Length Limit**: **STRICT** limit of **300 lines** per file.
- **Ideal Length**: Target **~100 lines** for individual components.
- **Split & Disband**: If a file grows near or over 300 lines, it **MUST** be refactored into smaller, logical sub-components or utility files.
- **Preference**: It is significantly better to have **5 files of 100 lines** than **1 file of 500 lines**.

### 15.4 Full-Page Translation (Mandatory)

- **Comprehensive Support**: Every page developed or modified must include full translation support (e.g., English, Affan oromo, Somali(not strict for this) and Amharic for all text elements.
- **No Partial Translations**: Do not limit translations to just sidebars or navigation. The entire page content (labels, placeholders, buttons, messages) must be translated.
- **Translation Pattern**: Use the established `t()` hook and `lib/translations.ts` pattern.

### 15.5 Learning Behavior

- The AI assistant should treat these rules as core operational instructions and maintain consistency across sessions.
