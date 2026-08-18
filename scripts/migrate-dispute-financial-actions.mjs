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

await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS financial_hold_status varchar(30) NOT NULL DEFAULT 'none'`;
await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS hold_dispute_id uuid REFERENCES disputes(id)`;
await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS hold_reason text`;
await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS held_by_admin_id uuid REFERENCES admin_employees(id)`;
await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS held_at timestamp`;
await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS hold_released_at timestamp`;
await sql`ALTER TABLE payments ADD COLUMN IF NOT EXISTS hold_release_reason text`;

await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS financial_action_state varchar(50) NOT NULL DEFAULT 'none'`;
await sql`ALTER TABLE disputes ADD COLUMN IF NOT EXISTS financial_action_updated_at timestamp`;

await sql`
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'payments_financial_hold_status_allowed'
    ) THEN
      ALTER TABLE payments
      ADD CONSTRAINT payments_financial_hold_status_allowed
      CHECK (financial_hold_status IN ('none', 'held'));
    END IF;
  END
  $$;
`;

await sql`
  CREATE TABLE IF NOT EXISTS dispute_financial_actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id uuid NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    payment_id uuid REFERENCES payments(id),
    action varchar(60) NOT NULL,
    proposal_status varchar(40) NOT NULL DEFAULT 'proposed',
    amount integer,
    currency varchar(10) NOT NULL DEFAULT 'ETB',
    reason text NOT NULL,
    proposed_by_admin_id uuid REFERENCES admin_employees(id),
    approved_by_admin_id uuid REFERENCES admin_employees(id),
    rejected_by_admin_id uuid REFERENCES admin_employees(id),
    previous_financial_state varchar(60),
    new_financial_state varchar(60),
    provider_action_reference text,
    provider_action_status varchar(60),
    provider_action_response json,
    idempotency_key varchar(160) NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    approved_at timestamp,
    rejected_at timestamp,
    executed_at timestamp,
    updated_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`ALTER TABLE dispute_financial_actions ADD COLUMN IF NOT EXISTS dispute_status_snapshot varchar(50)`;
await sql`ALTER TABLE dispute_financial_actions ADD COLUMN IF NOT EXISTS decision_snapshot varchar(50)`;
await sql`ALTER TABLE dispute_financial_actions ADD COLUMN IF NOT EXISTS payment_status_snapshot varchar(50)`;
await sql`ALTER TABLE dispute_financial_actions ADD COLUMN IF NOT EXISTS hold_status_snapshot varchar(30)`;

await sql`
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'dispute_financial_actions_action_allowed'
    ) THEN
      ALTER TABLE dispute_financial_actions
      ADD CONSTRAINT dispute_financial_actions_action_allowed
      CHECK (action IN (
        'no_financial_action',
        'release_payment',
        'hold_payment',
        'refund_review_required',
        'partial_refund_review_required',
        'payment_provider_investigation',
        'escalate_financial_case'
      ));
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'dispute_financial_actions_status_allowed'
    ) THEN
      ALTER TABLE dispute_financial_actions
      ADD CONSTRAINT dispute_financial_actions_status_allowed
      CHECK (proposal_status IN ('proposed', 'approved', 'rejected', 'executed'));
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'dispute_financial_actions_amount_valid'
    ) THEN
      ALTER TABLE dispute_financial_actions
      ADD CONSTRAINT dispute_financial_actions_amount_valid
      CHECK (amount IS NULL OR amount > 0);
    END IF;
  END
  $$;
`;

await sql`CREATE UNIQUE INDEX IF NOT EXISTS dispute_financial_actions_idempotency_unique_idx ON dispute_financial_actions(idempotency_key)`;
await sql`CREATE INDEX IF NOT EXISTS dispute_financial_actions_dispute_idx ON dispute_financial_actions(dispute_id, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS dispute_financial_actions_payment_idx ON dispute_financial_actions(payment_id, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS dispute_financial_actions_status_idx ON dispute_financial_actions(proposal_status)`;
await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS dispute_financial_pending_action_unique_idx
  ON dispute_financial_actions(dispute_id, action)
  WHERE proposal_status IN ('proposed', 'approved')
`;
await sql`
  CREATE UNIQUE INDEX IF NOT EXISTS payment_active_hold_unique_idx
  ON payments(id)
  WHERE financial_hold_status = 'held'
`;

console.log("Dispute financial actions migration completed.");
