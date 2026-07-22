# Final Demo Guide

This is a 10-15 minute demonstration sequence for the SkiD/DireSkill final-year project.

## Pre-Demo Checks

Run:

```bash
npm run db:verify:core
npm run db:check:schema
npm run check:workflow
npm run check:e2e:workflow
npm run check:auth
npm run check:payment
npm run test:browser
npx tsc --noEmit
npm run build
```

For demo records in a non-production database:

```bash
npm run demo:reset
npm run demo:seed
```

## Roles Needed

- Admin account
- Client account
- Verified worker account
- Unverified worker account

Demo data scripts create database-side demo records only. They do not provision external Neon Auth login accounts. Create or verify login accounts through the normal app registration/auth tooling before presenting. Do not use shared real passwords in the presentation.

## Demo Sequence

1. Landing page
   Show the value proposition, Fayda verification messaging, Chapa payment promise, and contract-backed workflow.

2. Client login
   Sign in as the client role and open the dashboard.

3. Create a job
   Open the client search or hiring flow and show the job invitation UI.

4. Worker verification state
   Show the unverified worker in the admin verification queue and explain why unverified workers are excluded from hiring discovery.

5. Verified worker discovers work
   Sign in as the verified worker and open pending jobs or dashboard requests.

6. Contract creation and acceptance
   Show the contract details page, terms review, and finalized read-only contract state.

7. Signatures
   Explain the contract setup PIN, signature consent checklist, signature records, PDF evidence, hash, and QR proof.

8. Completion request and client confirmation
   Use the worker gigs page to show completion request behavior, then show the client-side completion review state.

9. Payment sandbox or simulated verified payment
   Prefer a Chapa sandbox transaction if sandbox credentials are ready. If internet or sandbox is unavailable, use the seeded paid demo job and explain the server-to-server verification and idempotent webhook path.

10. Rating
   Show the rating page for a paid job and explain one rating direction per job.

11. Admin verification and oversight
   Show admin dashboard, verification queue, contracts, jobs, and payment reports.

12. Security highlights
   Mention removed diagnostic routes, credentialed CORS origin restrictions, protected-route fail-closed behavior, owner/participant checks, hidden worker email fields, protected Fayda/dispute evidence, and duplicate-prevention constraints.

13. Database integrity and test commands
   Show the verification command output summary from the terminal.

## Backup Demo Path

If the internet or Chapa sandbox fails:

1. Use `npm run demo:seed`.
2. Show the seeded paid job and payment record.
3. Explain that real paid status still requires Chapa server-to-server verification in production.
4. Do not manually mark real jobs as paid during the demo.

## Recovery Steps

- If auth fails, verify `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET`.
- If demo records look stale, run `npm run demo:reset` then `npm run demo:seed`.
- If routes 404 after deleting dev routes, rebuild to refresh `.next` metadata.
- If payment pages fail, check job status, active signed contract, worker subaccount, and Chapa env variables.
- If browser tests fail after a crash, rerun `npm run demo:reset` and `npm run test:browser`.
