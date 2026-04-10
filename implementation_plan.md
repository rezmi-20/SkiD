# Implementation Plan — Post-Login Redirect Fix

Currently, after a successful login, the application redirects users to the landing page (`/`). This requires the middleware to "catch" the request and redirect them again to their dashboard, which can sometimes fail or feel slow. 

We will update the login logic to determine the user's role and redirect them to the correct dashboard immediately.

## Proposed Changes

### 1. Update Login Logic
We will modify the login form submission to fetch the session information immediately after success and perform a role-based redirect.

#### [MODIFY] [login/page.tsx](app/(auth)/login/page.tsx)
- After `signIn` succeeds, call `getSession()` to retrieve the user's role.
- Use a switch/if-else block to redirect to `/worker/dashboard`, `/client/dashboard`, or `/admin/dashboard`.
- Fallback to `/` only if no role is found.

---

### 2. Verify Proxy Middleware
We will ensure that the `proxy.ts` (middleware) is not accidentally allowing logged-in users to remain on the landing page if they manually navigate there.

#### [CHECK] [proxy.ts](proxy.ts)
- Confirm the role matching logic is robust (e.g., handling potential case sensitivity or undefined roles).

---

## Verification Plan

### Manual Verification
1. Log in as a **Worker** and verify you arrive at `/worker/dashboard`.
2. Log in as a **Client** and verify you arrive at `/client/dashboard`.
3. Verify that trying to go back to `/login` while logged in sends you back to your dashboard.
