# Deployment Guide

Target platform: Vercel with Neon PostgreSQL.

## Required Environment Variables

Set these in the hosting environment. Do not commit values.

- `DATABASE_URL`
- `NEON_AUTH_BASE_URL`
- `NEON_AUTH_COOKIE_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `CORS_ALLOWED_ORIGINS`
- `CHAPA_SECRET_KEY`
- `CHAPA_WEBHOOK_URL`

Recommended:

- `CHAPA_WEBHOOK_SECRET`
- `BASE_URL`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_CHAPA_PUBLIC_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Sandbox-only:

- `CHAPA_SANDBOX`
- `CHAPA_SANDBOX_ALLOW_NETWORK`
- `CHAPA_SANDBOX_LOW_VALUE_AMOUNT`

## Build and Start

- Build command: `npm run build`
- Start command: `npm run start`
- Node.js: use a modern Node version compatible with Next 16 and the installed dependencies.

## First Deployment

1. Create the Neon database.
2. Configure all required environment variables in Vercel.
3. Run `npm run check:env:production` with production variables available.
4. Run `npm run db:migrate`.
5. If this database predates Phase 3, run `npm run db:migrate:core`.
6. Run `npm run db:verify:core`.
7. Run `npm run db:check:schema`.
8. Deploy the app.
9. Run `npm run build` locally and in CI before promoting.

## Redeployment

1. Review migration files.
2. Apply migrations with `npm run db:migrate`.
3. Run database verification commands.
4. Deploy the new version.
5. Smoke test login, dashboards, contract view, payment page, rating page, and admin verification.

## Rollback

1. Roll back the Vercel deployment to the previous known-good build.
2. Do not manually reverse database migrations unless a reviewed rollback migration exists.
3. If a data issue exists, take a database backup first.
4. Run read-only verification before resuming traffic.

## Database Verification

Run:

```bash
npm run db:verify:core
npm run db:check:schema
npm run check:e2e:workflow
```

These commands must not print secrets.

## CORS and Public URLs

`proxy.ts` preserves same-origin requests and allows credentialed CORS only for configured origins. `CORS_ALLOWED_ORIGINS` must not contain `*`.

Production URLs must be HTTPS and must not use localhost.

## Chapa Webhook Setup

1. Configure `CHAPA_WEBHOOK_URL` to the deployed HTTPS URL ending in `/api/payment/webhook`.
2. Configure the same URL in the Chapa dashboard.
3. Configure `CHAPA_WEBHOOK_SECRET`.
4. Confirm signed webhook delivery in sandbox before live use.

## Auth and Cookies

`NEON_AUTH_COOKIE_SECRET` must be present and strong. Protected routes fail closed to login when session validation fails.

Use HTTPS in production so secure cookies and redirects behave correctly.

## Upload Storage

Uploads use Cloudinary when configured. Vercel filesystem storage is not persistent, so file uploads must not depend on local disk after deployment.

## PWA Behavior

The app registers a service worker from the shared layout. After deployment, test fresh load, hard refresh, and update behavior so stale cached assets do not hide a failed release.

## Local Path Safety

Release code must not depend on Windows-only paths or `.env.local` in production. Production env values come from the hosting platform.

## Troubleshooting

- Build fails on route types: clear generated `.next` locally and rebuild.
- Auth redirects loop: verify `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, and cookie domain behavior.
- CORS preflight fails: verify `CORS_ALLOWED_ORIGINS` contains the deployed HTTPS origin.
- Payment cannot initialize: verify Chapa keys, HTTPS webhook URL, worker subaccount, and job state.
- Receipt denied: verify the requester is admin, client, or worker for the payment job.
