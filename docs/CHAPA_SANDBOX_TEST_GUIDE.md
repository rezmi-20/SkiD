# Chapa Sandbox Test Guide

Use this guide only with Chapa sandbox credentials. Do not run sandbox payment tests against production data.

## Required Sandbox Variables

- `CHAPA_SECRET_KEY`
- `CHAPA_WEBHOOK_SECRET`
- `CHAPA_WEBHOOK_URL`
- `NEXT_PUBLIC_APP_URL`
- `CHAPA_SANDBOX=true`
- `CHAPA_SANDBOX_ALLOW_NETWORK=1`
- `CHAPA_SANDBOX_LOW_VALUE_AMOUNT`

Optional:

- `NEXT_PUBLIC_CHAPA_PUBLIC_KEY`
- `WEBHOOK_URL`

## Initialize a Sandbox Transaction

The guarded command is:

```bash
npm run test:payment:sandbox -- --run
```

The command refuses to run unless:

- The process is not production.
- `CHAPA_SANDBOX=true`.
- `CHAPA_SANDBOX_ALLOW_NETWORK=1`.
- The amount is between 1 and 10 ETB.
- Callback and app URLs are HTTPS and not localhost.

It does not modify local payment records.

## Callback and Return URLs

The app sends Chapa:

- `callback_url`: `CHAPA_WEBHOOK_URL`, or a validated production webhook URL.
- `return_url`: `NEXT_PUBLIC_APP_URL` plus `/payment-success`.

The server rejects localhost and non-HTTPS production callback URLs through `npm run check:env:production`.

## Webhook Signature Verification

Webhook requests go to `/api/payment/webhook`.

The route verifies Chapa signatures before reading the payment event. It checks supported Chapa signature headers and uses `CHAPA_WEBHOOK_SECRET`, falling back to `CHAPA_SECRET_KEY` only for compatibility.

## Server-to-Server Verification

A webhook or client confirmation does not mark a job paid by itself. The app calls Chapa server-to-server verification through `verifyAndReleasePayment` and compares the verified amount with the local payment record before release.

## Idempotency Checks

To confirm duplicate callbacks are safe:

1. Complete one sandbox transaction.
2. Send the same successful webhook payload twice with a valid signature.
3. Confirm the first request releases the payment.
4. Confirm the second request returns an idempotent already-released result.
5. Confirm there is still only one released payment for the job.

## Failed Transaction Checks

To confirm failed transactions do not mark a job paid:

1. Initialize a sandbox transaction.
2. Simulate or complete a failed/cancelled sandbox payment.
3. Confirm `/api/payment/webhook` ignores non-success events.
4. Confirm the job remains `completed` or `payment_pending`, not `paid`.
5. Confirm the local payment record is not `released`.

## Inspect Payment Records Safely

Use read-only SQL or the admin payment report page. Do not edit payment rows manually during testing.

Recommended read-only checks:

- Payment status for the test `chapa_ref`.
- Job status for the related job.
- Count of released payments for the job.
- Audit log and notification records.

## Reset Sandbox Test Records

Use demo reset only for demo-owned records:

```bash
npm run demo:reset
```

For non-demo sandbox payment records, delete only records clearly owned by the sandbox test transaction reference after exporting any evidence needed for the report.
