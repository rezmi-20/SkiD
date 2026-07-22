# Database Migration Guide

This repository uses Drizzle Kit with SQL migrations in `drizzle/` and the schema definition in `lib/schema.ts`.

## Supported Process

1. Configure `DATABASE_URL` in the target environment.
2. Run `npm run db:migrate`.
3. For repository history that still needs the core MVP workflow patch, run `npm run db:migrate:core`.
4. Run `npm run db:verify:core`.
5. Run `npm run db:check:schema`.
6. Never use `npm run db:push` on production without explicit review.

## Current Commands

- `npm run db:generate`: generate Drizzle migrations from schema changes.
- `npm run db:migrate`: apply formal Drizzle migrations.
- `npm run db:migrate:core`: safe one-time runner for `drizzle/0012_core_mvp_workflow.sql`.
- `npm run db:verify:core`: read-only verification for the core workflow migration.
- `npm run db:check:schema`: read-only schema consistency check.
- `npm run db:studio`: local Drizzle Studio.
- `npm run db:push`: development-only schema push; not a production migration command.

## Retired One-Off Scripts

The following executable scripts were removed from `scripts/` because normal release paths must not contain ad hoc schema mutators:

- `scripts/run-contract-setup-migration.mjs`: created `contract_setups`; superseded by `drizzle/0005_add_contract_setups.sql`.
- `scripts/run-contract-status-migration.mjs`: added `contracts.status`; superseded by `drizzle/0006_add_contract_status.sql`.
- `scripts/run-contract-draft-fields-migration.mjs`: added contract draft fields; superseded by `drizzle/0007_add_contract_draft_fields.sql`.
- `scripts/run-contract-finalization-migration.mjs`: added finalization metadata; superseded by `drizzle/0008_add_contract_finalization.sql`.
- `scripts/run-contract-signatures-migration.mjs`: created `contract_signatures`; superseded by `drizzle/0009_add_contract_signatures.sql`.
- `scripts/run-contract-final-document-migration.mjs`: added final PDF/hash/QR fields; superseded by `drizzle/0010_add_contract_final_document.sql`.
- `scripts/run-migration.ts`: added `users.is_suspended`; now represented in the current schema and migration history.
- `scripts/run-useful-migration.ts`: added unreferenced community counter columns that are not in the current schema; rerunning it would create schema drift.

If a future schema change is needed, create or generate a formal migration, review it, apply it with `npm run db:migrate`, then verify with the read-only checks.
