# Implementation Plan — Root Redirect Fix (Server-Side)

The middleware-based redirect (`proxy.ts`) appears to be bypassed or ignored by Vercel for the root path (`/`). To resolve this "loop" once and for all, we will move the redirect logic directly into the root page as a Server Component.

## Proposed Changes

### 1. Revert Middleware Convention
We will rename `proxy.ts` back to `middleware.ts`. While there was a deprecation warning, NextAuth v5 still expects the standard filename.

#### [RENAME] `proxy.ts` -> `middleware.ts`
- Restore the `export default auth(...)` convention.

---

### 2. Implement Server-Side Redirect on Root
We will convert the main landing page into a Server Component that checks for a session *before* rendering the landing page content.

#### [NEW] [LandingPage.jsx](app/LandingPage.jsx)
- Move all the current logic and UI from `app/page.jsx` into this new client component.

#### [MODIFY] [page.jsx](app/page.jsx)
- Convert this to a **Server Component**.
- Import `auth` from `@/lib/auth`.
- If a session exists, perform a server-side `redirect()` to the user's respective dashboard.
- If no session exists, render `<LandingPage />`.

---

## Verification Plan

### Automated Tests
1. Run `npm run build` locally to ensure no conflicts with the new Server/Client split.

### Manual Verification
1. Login locally and verify you are redirected to the dashboard.
2. Visit the live site and verify that even if you manually type the landing page URL, you are shifted back to your workspace.
