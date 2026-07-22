# Authorization Matrix

## Admin
- Full access to admin routes.
- Can verify workers, resolve disputes, and view all jobs, payments, contracts, and reports.

## Client
- Can create jobs, create/finalize their contract drafts, confirm completion, start payment, and rate workers after payment.
- Can view only their own jobs, contracts, payments, conversations, messages, notifications, and receipts.

## Verified Worker
- Can discover verified work, accept assigned jobs, request completion, sign contracts, rate clients after payment, and view their own records.
- Cannot access admin-only resources.

## Unverified Worker
- Can register and submit Fayda verification data.
- Cannot appear in public worker search or participate in the verified workflow until approved.

## Unrelated Authenticated User
- No access to other users' jobs, contracts, payments, receipts, signatures, or conversations.

## Unauthenticated User
- Public pages only.
- Protected routes fail closed to login.

## Route Rules
- Jobs, contracts, payments, ratings, uploads, notifications, and receipts enforce authentication plus participation or ownership checks.
- Admin routes require admin role.
- Worker verification requires admin role.
- Public worker search and detail routes expose only verified, active workers and no sensitive fields.
