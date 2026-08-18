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

async function enumValueExists(typeName, value) {
  const rows = await sql`
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = ${typeName}
      AND e.enumlabel = ${value}
    LIMIT 1
  `;
  return rows.length > 0;
}

async function addEnumValue(typeName, value) {
  if (await enumValueExists(typeName, value)) return;
  await sql.query(`ALTER TYPE ${typeName} ADD VALUE '${value}'`, []);
}

const disputeStatuses = [
  "awaiting_client_response",
  "awaiting_worker_response",
  "evidence_review",
  "dismissed",
  "escalated",
];

for (const status of disputeStatuses) {
  await addEnumValue("dispute_status", status);
  console.log(`OK dispute_status:${status}`);
}

await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS title varchar(160)`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS category varchar(50)`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS requested_resolution varchar(50)`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS opened_by uuid REFERENCES users(id)`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS opened_by_role varchar(20)`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS contract_id uuid REFERENCES contracts(id)`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS payment_id uuid REFERENCES payments(id)`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS creation_snapshot json`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS assigned_admin_id uuid REFERENCES admin_employees(id)`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS assigned_at timestamp`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS assignment_version integer NOT NULL DEFAULT 0`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS final_decision varchar(50)`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS final_reason text`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS financial_action_required boolean NOT NULL DEFAULT false`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS workflow_frozen boolean NOT NULL DEFAULT true`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS conflict_admin_ids uuid[]`;

await sql`
  UPDATE disputes d
  SET
    title = COALESCE(d.title, LEFT(COALESCE(j.title, 'Dispute'), 160)),
    category = COALESCE(d.category, 'other'),
    requested_resolution = COALESCE(d.requested_resolution, 'other'),
    opened_by = COALESCE(d.opened_by, d.client_id),
    opened_by_role = COALESCE(d.opened_by_role, 'client'),
    contract_id = COALESCE(d.contract_id, c.id),
    payment_id = COALESCE(d.payment_id, p.id),
    creation_snapshot = COALESCE(
      d.creation_snapshot,
      json_build_object(
        'disputeId', d.id,
        'jobId', d.job_id,
        'contractId', c.id,
        'paymentId', p.id,
        'clientId', d.client_id,
        'workerId', d.worker_id,
        'jobStatus', j.status,
        'contractStatus', c.status,
        'paymentStatus', p.status,
        'contractAmount', COALESCE(c.payment_amount, j.budget),
        'completionRejectionReason', j.completion_rejection_reason,
        'createdAt', d.created_at
      )
    )
  FROM jobs j
  LEFT JOIN contracts c ON c.job_id = j.id
  LEFT JOIN LATERAL (
    SELECT id, status
    FROM payments
    WHERE job_id = j.id
    ORDER BY created_at DESC
    LIMIT 1
  ) p ON true
  WHERE d.job_id = j.id
`;

await sql`
  CREATE TABLE IF NOT EXISTS dispute_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id uuid NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    actor_type varchar(30) NOT NULL,
    actor_id uuid,
    event_type varchar(60) NOT NULL,
    old_status varchar(50),
    new_status varchar(50),
    metadata json,
    created_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS dispute_evidence (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id uuid NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    uploaded_by uuid NOT NULL REFERENCES users(id),
    uploader_role varchar(20) NOT NULL,
    file_url text NOT NULL,
    file_name varchar(255),
    mime_type varchar(120) NOT NULL,
    file_size integer NOT NULL,
    storage_fingerprint varchar(128) NOT NULL,
    is_removed boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS dispute_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id uuid NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    requested_by_admin_id uuid REFERENCES admin_employees(id),
    requested_from varchar(20) NOT NULL,
    instruction text NOT NULL,
    due_at timestamp,
    status varchar(30) NOT NULL DEFAULT 'requested',
    response_text text,
    responded_by uuid REFERENCES users(id),
    responded_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS dispute_admin_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id uuid NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    admin_employee_id uuid NOT NULL REFERENCES admin_employees(id),
    note text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`CREATE INDEX IF NOT EXISTS dispute_job_idx ON disputes(job_id)`;
await sql`CREATE INDEX IF NOT EXISTS dispute_client_idx ON disputes(client_id)`;
await sql`CREATE INDEX IF NOT EXISTS dispute_worker_idx ON disputes(worker_id)`;
await sql`CREATE INDEX IF NOT EXISTS dispute_status_idx ON disputes(status)`;
await sql`CREATE INDEX IF NOT EXISTS dispute_assigned_admin_idx ON disputes(assigned_admin_id)`;
await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS dispute_active_job_unique_idx
  ON disputes(job_id)
  WHERE status IN (
    'open',
    'under_review',
    'awaiting_client_response',
    'awaiting_worker_response',
    'evidence_review',
    'escalated'
  )
`;
await sql`CREATE INDEX IF NOT EXISTS dispute_events_dispute_idx ON dispute_events(dispute_id, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS dispute_evidence_dispute_idx ON dispute_evidence(dispute_id, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS dispute_responses_dispute_idx ON dispute_responses(dispute_id, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS dispute_notes_dispute_idx ON dispute_admin_notes(dispute_id, created_at)`;

console.log("Dispute workflow migration completed.");
