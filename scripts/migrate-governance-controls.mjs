import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { resolve } from "node:path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

await sql`CREATE SEQUENCE IF NOT EXISTS misconduct_review_ref_seq START 1`;
await sql`CREATE SEQUENCE IF NOT EXISTS appeal_ref_seq START 1`;

const auditColumns = [
  ["actor_type", "varchar(30)"],
  ["admin_role", "varchar(50)"],
  ["module", "varchar(60)"],
  ["target_type", "varchar(60)"],
  ["target_id", "text"],
  ["previous_state", "json"],
  ["new_state", "json"],
  ["reason", "text"],
  ["related_reference", "varchar(120)"],
  ["high_risk", "boolean NOT NULL DEFAULT false"],
  ["proposed_by_admin_id", "uuid REFERENCES admin_employees(id)"],
  ["approved_by_admin_id", "uuid REFERENCES admin_employees(id)"],
  ["executed_by_type", "varchar(30)"],
];

for (const [column, ddl] of auditColumns) {
  await sql.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ${column} ${ddl}`, []);
}

await sql`
  CREATE TABLE IF NOT EXISTS admin_misconduct_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference varchar(32) NOT NULL,
    employee_id uuid NOT NULL REFERENCES admin_employees(id),
    opened_by_admin_id uuid NOT NULL REFERENCES admin_employees(id),
    status varchar(30) NOT NULL DEFAULT 'open',
    reason text NOT NULL,
    referenced_audit_ids uuid[],
    outcome varchar(50),
    outcome_reason text,
    resolved_by_admin_id uuid REFERENCES admin_employees(id),
    resolved_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS admin_misconduct_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id uuid NOT NULL REFERENCES admin_misconduct_reviews(id) ON DELETE CASCADE,
    actor_admin_id uuid REFERENCES admin_employees(id),
    event_type varchar(60) NOT NULL,
    old_status varchar(30),
    new_status varchar(30),
    note text,
    metadata json,
    created_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS appeals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference varchar(32) NOT NULL,
    appeal_type varchar(50) NOT NULL,
    appellant_user_id uuid NOT NULL REFERENCES users(id),
    appellant_role varchar(20) NOT NULL,
    target_type varchar(50) NOT NULL,
    target_id uuid NOT NULL,
    original_decision varchar(80),
    original_decision_reason text,
    original_admin_id uuid REFERENCES admin_employees(id),
    status varchar(40) NOT NULL DEFAULT 'appeal_requested',
    reason varchar(80) NOT NULL,
    explanation text NOT NULL,
    evidence_references text[],
    reviewed_by_admin_id uuid REFERENCES admin_employees(id),
    outcome varchar(60),
    outcome_reason text,
    resolved_at timestamp,
    idempotency_key varchar(160) NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS appeal_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    appeal_id uuid NOT NULL REFERENCES appeals(id) ON DELETE CASCADE,
    actor_type varchar(30) NOT NULL,
    actor_id uuid,
    event_type varchar(60) NOT NULL,
    old_status varchar(40),
    new_status varchar(40),
    metadata json,
    created_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_misconduct_status_allowed') THEN
      ALTER TABLE admin_misconduct_reviews
      ADD CONSTRAINT admin_misconduct_status_allowed
      CHECK (status IN ('open', 'under_review', 'action_required', 'resolved', 'dismissed'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_misconduct_outcome_allowed') THEN
      ALTER TABLE admin_misconduct_reviews
      ADD CONSTRAINT admin_misconduct_outcome_allowed
      CHECK (outcome IS NULL OR outcome IN ('no_action', 'warning_recorded', 'training_required', 'temporary_suspension', 'revoke_admin_access'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appeals_type_allowed') THEN
      ALTER TABLE appeals
      ADD CONSTRAINT appeals_type_allowed
      CHECK (appeal_type IN ('dispute_resolution', 'verification_decision'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appeals_status_allowed') THEN
      ALTER TABLE appeals
      ADD CONSTRAINT appeals_status_allowed
      CHECK (status IN ('appeal_requested', 'appeal_under_review', 'appeal_resolved', 'appeal_dismissed'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appeals_reason_allowed') THEN
      ALTER TABLE appeals
      ADD CONSTRAINT appeals_reason_allowed
      CHECK (reason IN ('new_evidence', 'procedural_error', 'incorrect_fact', 'decision_inconsistent_with_record', 'other'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appeals_outcome_allowed') THEN
      ALTER TABLE appeals
      ADD CONSTRAINT appeals_outcome_allowed
      CHECK (outcome IS NULL OR outcome IN ('upheld', 'returned_for_re_review', 'overturned', 'dismissed'));
    END IF;
  END
  $$;
`;

await sql`CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs(created_at)`;
await sql`CREATE INDEX IF NOT EXISTS audit_logs_admin_idx ON audit_logs(admin_employee_id, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs(action, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS audit_logs_target_idx ON audit_logs(target_type, target_id)`;
await sql`CREATE INDEX IF NOT EXISTS audit_logs_module_idx ON audit_logs(module, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS audit_logs_high_risk_idx ON audit_logs(high_risk, created_at)`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS admin_misconduct_reviews_reference_unique_idx ON admin_misconduct_reviews(reference)`;
await sql`CREATE INDEX IF NOT EXISTS admin_misconduct_reviews_employee_idx ON admin_misconduct_reviews(employee_id, status)`;
await sql`CREATE INDEX IF NOT EXISTS admin_misconduct_reviews_status_idx ON admin_misconduct_reviews(status, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS admin_misconduct_events_review_idx ON admin_misconduct_events(review_id, created_at)`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS appeals_reference_unique_idx ON appeals(reference)`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS appeals_idempotency_unique_idx ON appeals(idempotency_key)`;
await sql`CREATE INDEX IF NOT EXISTS appeals_appellant_idx ON appeals(appellant_user_id, status)`;
await sql`CREATE INDEX IF NOT EXISTS appeals_target_idx ON appeals(target_type, target_id)`;
await sql`CREATE INDEX IF NOT EXISTS appeals_status_idx ON appeals(status, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS appeal_events_appeal_idx ON appeal_events(appeal_id, created_at)`;

console.log("Governance controls migration completed.");
