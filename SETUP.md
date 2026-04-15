# DireSkill — Developer Onboarding & Setup Guide

> **For AI assistants (Antigravity, Copilot, etc.):** Read this entire file before making any changes. It documents the full project architecture, all environment variables, known issues, and the correct patterns to follow.

---

## 1. Project Overview

**DireSkill** is a mobile-first PWA marketplace for skilled workers (electricians, plumbers, painters, etc.) in Dire Dawa, Ethiopia. Clients can find and hire verified workers. Workers register with Fayda ID and receive jobs through the platform.

| Feature | Status |
|---|---|
| Auth (Email/Phone + Password) | ✅ Done |
| Client job search + map | ✅ Done |
| Worker dashboard + gigs | ✅ Done |
| Admin verification panel | ✅ Done |
| Global theme (light/dark/grayscale) | ✅ Done |
| Global language (EN / Amharic) | ✅ Done |
| Chapa payment integration | 🔧 In Progress |
| Real-time messaging | 🔧 In Progress |

**GitHub:** https://github.com/rezmi-20/SkiD  
**Branch:** `main`

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.2 (App Router, Turbopack) |
| Language | TypeScript + JSX |
| Styling | Tailwind CSS v4 + vanilla CSS custom properties |
| Auth | NextAuth v5 (beta) — Credentials provider, JWT |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Map | Leaflet + react-leaflet |
| Animations | Framer Motion |
| Theming | next-themes (`attribute="data-theme"`) |
| Payments | Chapa (Ethiopian payment gateway) |

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

---

## 5. Environment Variables

Create a file named **`.env.local`** in the project root with exactly these values:

```env
# Neon PostgreSQL — serverless DB hosted on neon.tech
DATABASE_URL=postgresql://neondb_owner:npg_uH9bUs3KmtLP@ep-mute-meadow-anqyrcz7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# NextAuth secret — used to sign JWT tokens
AUTH_SECRET=pY8uX1k5vR3tZ7wQ2mN9bV4cMx0fL6jS9gH1kP3nG0o

# NextAuth URL — must match where app runs locally
NEXTAUTH_URL=http://localhost:3000
```

> **Note:** The Neon database is already provisioned and seeded. No migration needed on first run (tables already exist in the cloud DB).

### If you get a DB connection error:
1. Verify `DATABASE_URL` is exactly as above (no spaces, no line break).
2. The Neon project is in **us-east-1**. Connection should work from any device.
3. If the pool says "too many connections", wait 30 seconds and retry.

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
const themeIcon = !mounted ? 'contrast' : theme === 'dark' ? 'dark_mode' : 'light_mode';
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
│   │   └── otp-verification/page.tsx
│   │
│   ├── (client)/               ← Client group (wrapped in AppShell role="client")
│   │   ├── layout.tsx          ← Auth guard + AppShell
│   │   └── client/
│   │       ├── search/page.tsx ← Worker search + map
│   │       ├── dashboard/      ← My Jobs
│   │       ├── messages/       ← Chat (in progress)
│   │       └── profile/        ← Client profile
│   │
│   ├── (worker)/               ← Worker group (wrapped in AppShell role="worker")
│   │   ├── layout.tsx
│   │   └── worker/
│   │       ├── dashboard/page.tsx ← Earnings, jobs, analytics
│   │       ├── gigs/page.tsx
│   │       ├── earnings/page.tsx
│   │       └── profile/page.tsx
│   │
│   ├── (admin)/                ← Admin panel
│   │   ├── layout.tsx
│   │   └── admin/
│   │       ├── dashboard/
│   │       └── verify/[id]/    ← Worker ID verification
│   │
│   └── api/
│       ├── auth/[...nextauth]/ ← NextAuth route handler
│       ├── auth/register/      ← User registration
│       ├── jobs/               ← Job CRUD
│       ├── workers/            ← Worker search
│       ├── ratings/
│       ├── contracts/
│       └── payments/chapa/     ← Chapa webhook
│
├── components/
│   ├── LandingPageContent.jsx  ← Full landing page (hero, categories, how it works)
│   ├── Providers.tsx           ← ThemeProvider + LanguageProvider + SessionProvider
│   └── ui/
│       ├── AppShell.tsx        ← Authenticated layout shell (nav + mobile nav)
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
│       └── admin.ts            ← Admin server actions
│
├── types/
│   └── index.ts                ← Shared global types (e.g., Session user augmentation)
│
├── public/
│   ├── manifest.json           ← PWA manifest
│   └── sw.js                   ← Service worker
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
The app uses **3 themes** controlled by `next-themes` with `attribute="data-theme"`:

| Theme | Key | Description |
|---|---|---|
| Grayscale | `grayscale` | Default. Dark near-black, cream primary accent |
| Dark | `dark` | Pure black, neon green primary |
| Light | `light` | Warm ivory background, green primary |

**CSS Variables** (defined in `globals.css`):
```css
--bg-page        /* page background */
--text-high      /* primary text */
--text-med       /* secondary text */
--primary-accent /* brand color (maps to Tailwind 'primary') */
--surface-glass  /* card/panel backgrounds */
--border-glass   /* border color */
```

**Tailwind mappings** (in `@theme` block of `globals.css`):
```
bg-background → --bg-page
bg-surface    → --surface-glass
border-border → --border-glass
text-text-high → --text-high
text-text-med  → --text-med
text-primary   → --primary-accent
```

> ⚠️ **Never use hardcoded dark Tailwind classes** like `bg-black/50`, `border-white/5`, `text-white` in new components. Always use the semantic tokens above so all 3 themes work.

### Language System
```tsx
import { useLanguage } from "@/context/LanguageContext";

const { t, language, setLanguage } = useLanguage();
// t("nav.home") → "Home" | "ዋና ገፅ"
```

Add new keys to `lib/translations.ts` under both `en` and `am` objects.

---

## 9. Database Schema (Neon PostgreSQL)

Tables already created in cloud DB:

| Table | Purpose |
|---|---|
| `users` | All users (id, email, phone, password_hash, role) |
| `worker_profiles` | Worker details (skills, location, fayda_doc, is_verified) |
| `client_profiles` | Client details |
| `jobs` | Job postings (pending/active/completed/disputed/cancelled) |
| `contracts` | Contract PDFs per job |
| `ratings` | Rating scores (1-5) per completed job |
| `messages` | Chat messages between users |
| `payments` | Chapa payment records (held/released/refunded) |

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
  const session = await auth();
  if (!session || session.user.role !== "worker") redirect("/login");
  
  const rows = await sql`SELECT * FROM jobs WHERE worker_id = ${session.user.id}`;
  // ...render
}
```

### Writing a new Client Component with theme
```tsx
"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function MyComponent() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  if (!mounted) return null; // Prevents hydration mismatch
  // ...render
}
```

---

## 11. Development Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (check for errors)
npx tsc --noEmit     # TypeScript type check only (no build)
npx drizzle-kit push # Push schema changes to Neon DB
npx drizzle-kit studio # Open Drizzle Studio (visual DB explorer)
```

---

## 12. Deployment Notes

- The app is **not yet deployed** to production.
- Planned platform: **Vercel** (free tier, automatic deploys from `main`)
- When deploying, add all `.env.local` variables to Vercel's Environment Variables dashboard.
- Change `NEXTAUTH_URL` to the production URL when deploying.

---

## 13. What's Still In Progress

| Feature | File(s) | Notes |
|---|---|---|
| Real-time messaging | `app/(client)/client/messages/` | UI exists, needs WebSocket or Pusher |
| Worker profile editing | `app/(worker)/worker/profile/` | Form needs save action |
| Client dashboard (My Jobs) | `app/(client)/client/dashboard/` | Needs job CRUD wiring |
| Chapa payment flow | `app/api/payments/chapa/route.ts` | Webhook exists, needs test |
| OTP verification | `app/(auth)/otp-verification/` | UI done, SMS not wired |
| Worker job browse | `/worker/jobs` (not created yet) | Needs new page |

---

*Last updated: 2026-04-15 — after global theme + language implementation*
