# Implementation Plan — Logout Flow & Live Connectivity

We have confirmed two independent issues:
1. **Live Site**: The `DATABASE_URL` is definitively missing from the Vercel project environment.
2. **Logout Issue**: The new "Precision Suite" dashboards are currently missing a "Sign Out" button, which is why your session persists locally.

## Proposed Changes

### 1. Add Logout Functionality
We will add a "Sign Out" button to the header of all dashboards. Since these are Server Components, we will use a small form that triggers the NextAuth `signOut` action from `@/lib/auth`.

#### [MODIFY] [worker/dashboard/page.tsx](app/(worker)/worker/dashboard/page.tsx)
- Add a "Sign Out" button next to "Profile Index".

#### [MODIFY] [client/dashboard/page.tsx](app/(client)/client/dashboard/page.tsx)
- Add a "Sign Out" button to the top-right header area.

#### [MODIFY] [admin/dashboard/page.tsx](app/(admin)/admin/dashboard/page.tsx)
- Add a "Sign Out" button to the platform administration header.

---

### 2. Live Site Connectivity (Action Required)
Your diagnostic route confirmed: `has_db_url: false`. 

**Resolution Steps for Vercel**:
1. Sign in to your [Vercel Dashboard](https://vercel.com).
2. Select the **'SkiD'** project.
3. Go to **Settings** → **Environment Variables**.
4. **Add Key**: `DATABASE_URL`
5. **Add Value**: Paste your Neon connection string (the one ending in `?sslmode=require`).
6. **Save**.
7. **Critical**: Go to the **Deployments** tab, click the three dots on the latest deployment, and select **Redeploy**. Environment variables are only picked up during a build.

---

## Verification Plan

### Manual Verification
1. I will push the "Sign Out" buttons.
2. You will click "Sign Out" locally to verify it returns you to the login screen.
3. You will verify the live site connection after following the Vercel steps provided above.
