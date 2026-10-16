- [x] Update `lib/translations.ts` with contract-related keys
- [x] Add "Contracts" to `AppShell.tsx` and `MobileNav.tsx`
- [x] Create `lib/actions/contracts.ts` for fetching contract data
- [x] Implement `ContractsPageContent.tsx` (List View)
- [x] Create client and worker contract list pages
- [x] Implement `ContractDetails.tsx` (Detail View matching mockup)
- [x] Create shared contract details route
- [ ] Verify functionality and responsiveness
- [ ] Install dependencies (leaflet, react-leaflet)
- [ ] Implement search mock data provider
- [ ] Create WorkerCard component
- [ ] Create SearchFilters and ViewToggle components
- [ ] Create MapComponent (with SSR safety)
- [ ] Assemble Search Page in `app/(client)/client/search/page.tsx`
- [x] Assembly and Polish Verification

## Post-UAT Optimization & UI Backlog (To-Do Later)

### 1. Performance & Latency Optimizations (WebSockets Alternative)
- [x] **Progressive Form Feedback & State Transitions:** Instant live status indicator (`Assembling evidence...`, `Recording appeal on governance ledger...`, `Finalized`) during submission to eliminate perceived latency.
- [x] **Neon Connection & Index Verification:** Verified existing btree indexes on all governance and dispute foreign keys (`appellant_user_id`, `target_id`, `status`, `created_at`, `admin_employee_id`, `high_risk`).
- [x] **Query Parallelization:** Verified and ensured `Promise.all` execution for audit logs, appeal events, and detail aggregations.
- [ ] **Realtime Event Stream (Lightweight SSE):** Evaluate Server-Sent Events (SSE) or Pusher for live push notifications if background sync without page refresh is required.

### 2. UI / UX Improvements
- [x] **Evidence Preview Modals / Lightbox:** Full-screen modal with ESC key dismiss and video player integration in `AppealEvidenceList.tsx`.
- [x] **Design Token Harmonization:** Modernized `/admin/appeals`, `/client/appeals`, and `/worker/appeals` pages to strict 8px radius system, status chips, and stats summaries.
- [x] **Compliance & Workflow Verification:** Full pass on `npm run check:governance-controls`, `npm run check:workflow`, `npm run check:auth`, and `npm run check:dispute-workflow` with 0 errors.

### 3. Logged Manual UAT Fixes (To-Do Later)
- [ ] **Rating Redirect Graceful Fallback (Test 14):** Prevent 1-second abrupt redirect on `/worker/rate/[id]` and `/client/rate/[id]` when payment is not yet in `released` status; show an informative alert and return link instead.
- [ ] **Notification Bell UI Glitch (Test 3 & 4):** Fix notification page where icon names display as oversized text instead of SVG icons.
- [ ] **Messages Link 404 from Notification (Test 4):** Correct `/messages` link in notification page to route to `/[role]/messages`.
- [ ] **Worker Earnings Export Statement (Test 4):** Implement statement download/export on `/worker/earnings`.
- [x] **Server Action / Auth Me Error Handling (Test 3 & 18):** Handle `GET /api/auth/me 401` gracefully without throwing unhandled promise rejections on `/login`. Convert client-side profile pages to Server Components and use GET endpoints for polling.
- [ ] **Contract Signatures Client Verification Guard (Test 10):** Enforce identity verification requirement before clients or workers can create contract PINs and sign agreements.
- [ ] **Realtime State Sync (Test 9 & 11):** Eliminate manual page refresh when counterpart accepts/rejects terms or requests completion.


