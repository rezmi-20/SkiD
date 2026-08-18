# Phase 5D.7 Governance Controls

Phase 5D.7 adds audit log, reporting, appeal, and administrator conduct controls without starting Phase 5D.8.

## Audit Logs

- `audit_logs` now accepts structured governance metadata: actor type, admin role, module, target, before/after state, reason, related reference, high-risk flag, proposer, approver, and executor type.
- New governance audit writes redact sensitive keys before storage, including FIN, password, hash, token, secret, credential, Chapa payload, file URL, document, and raw payload fields.
- The super-admin audit page is read-only and supports filtering by action, module, target type, high-risk status, search term, and date range.
- Audit history is preserved. User deletion now blocks when audit history exists instead of rewriting `audit_logs.user_id`.

## Reports

- `/admin/reports` is now a super-admin-only read-only governance report.
- Reports are aggregate by design: users, verification, jobs, payments, disputes, support tickets, and neutral administrator operation counts.
- Reports include date filtering for today, last seven days, last thirty days, and bounded custom ranges.
- Operational administrators do not receive global reports because `getGovernanceReport` requires `reports.read` and super-admin role.

## Appeals

- Clients and workers can appeal eligible dispute resolutions or rejected/revoked verification decisions through `/client/appeals` and `/worker/appeals`.
- Appeals are limited to affected participants, validate target IDs, reject duplicates while an appeal is active, and enforce the configured appeal window.
- Appeal history is append-only through `appeal_events`.
- Super admin can review appeals, but the original decision administrator cannot review their own decision.
- Overturning an appeal records a corrective governance event; it does not directly mutate unrelated payment, provider, or verification records.

## Administrator Conduct

- `admin_misconduct_reviews` and `admin_misconduct_events` provide a controlled review workflow for administrator conduct concerns.
- Only super admin may open, note, and resolve conduct reviews.
- A super admin cannot open a self-review or suspend/revoke their own account.
- Referenced audit IDs are validated and retained as immutable references.
- Suspension or revocation outcomes use the secured admin employee status path and increment session version.

## Ethical Administration

- Super admin has oversight permissions but intentionally does not receive routine operational permissions such as verification approval, dispute resolution, payment review, or support response.
- Misuse indicators are neutral triage signals for human review, not automatic punishments.
- Financial high-risk actions preserve proposed-by, approved-by, and executed-by attribution.
- Support ticket actions now contribute structured governance audit events.

## Verification

Run:

```bash
npm run check:governance-controls
npm run check:admin-authorization
npm run check:dispute-financial-actions
npm run check:support-workflow
npx tsc --noEmit
```

Manual browser testing remains deferred for the broader phase bundle unless explicitly requested.
