# Implementation Plan — Admin Setup & Verification Flow

We will implement a secure method for creating the System Admin account and build out the "Verification" feature in the Admin Dashboard, allowing you to approve workers after reviewing their Fayda Documents.

## Proposed Changes

### 1. Admin Seeding (One-Time Setup)
We will create a script that you can run to securely insert the initial admin account into the database. This script will hash the password and set the `role` to `admin`.

#### [NEW] [seed-admin.ts](scripts/seed-admin.ts)
- A standalone TypeScript script using `@neondatabase/serverless` and `bcryptjs`.
- Configured to insert `admin@dire-skill.com` with a hashed version of `admin123`.
- Uses `ON CONFLICT (email) DO NOTHING` to prevent duplicates.

---

### 2. Worker Verification Logic
We will implement the backend and frontend for the admin to approve workers.

#### [NEW] [admin.ts](lib/actions/admin.ts)
- A Server Action to update the `is_verified` status in the `worker_profiles` table.
- Restricted to users with the `admin` role.

#### [NEW] [verify/[id]/page.tsx](app/(admin)/admin/verify/[id]/page.tsx)
- A detailed review page accessible only by admins.
- Fetches the worker's data (Full Name, Phone, Email) and their Fayda Document (Image/Base64).
- Provides an **"Approve Worker"** button that triggers the Server Action.
- Once approved, the worker is redirected back to the dashboard.

---

### 3. Dashboard Updates
We will refine the main Admin Dashboard to show real-time stats and linked verification requests.

#### [MODIFY] [page.tsx](app/(admin)/admin/dashboard/page.tsx)
- Ensure the "Review Document" links correctly point to the new verification page.

---

## Verification Plan

### Automated Tests
1. Run the seed script: `npx tsx scripts/seed-admin.ts`.
2. Verify the login flow with the new admin credentials.

### Manual Verification
1. Log in as **Admin**.
2. Navigate to the dashboard and see the list of unverified workers.
3. Click "Review Document" for a worker.
4. Click "Approve" and verify the worker's status is updated to "Certified" in the dashboard.
