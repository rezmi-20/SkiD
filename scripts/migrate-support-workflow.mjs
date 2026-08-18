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

await sql`CREATE SEQUENCE IF NOT EXISTS support_ticket_ref_seq START 1`;

await sql`
  CREATE TABLE IF NOT EXISTS support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference varchar(32) NOT NULL,
    owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_role varchar(20) NOT NULL,
    category varchar(50) NOT NULL,
    priority varchar(20) NOT NULL DEFAULT 'normal',
    status varchar(30) NOT NULL DEFAULT 'open',
    subject varchar(180) NOT NULL,
    description text NOT NULL,
    related_job_id uuid REFERENCES jobs(id),
    related_contract_id uuid REFERENCES contracts(id),
    related_payment_id uuid REFERENCES payments(id),
    linked_dispute_id uuid REFERENCES disputes(id),
    escalation_type varchar(40),
    escalation_reason text,
    assigned_admin_id uuid REFERENCES admin_employees(id),
    assigned_at timestamp,
    assignment_version integer NOT NULL DEFAULT 0,
    resolution_type varchar(50),
    resolution_summary text,
    resolved_by_admin_id uuid REFERENCES admin_employees(id),
    resolved_at timestamp,
    closed_at timestamp,
    idempotency_key varchar(160) NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS support_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    actor_type varchar(30) NOT NULL,
    actor_id uuid NOT NULL,
    message text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS support_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    actor_type varchar(30) NOT NULL,
    actor_id uuid,
    event_type varchar(60) NOT NULL,
    old_status varchar(30),
    new_status varchar(30),
    metadata json,
    created_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS support_internal_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    admin_employee_id uuid NOT NULL REFERENCES admin_employees(id),
    note text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )
`;

await sql`
  CREATE TABLE IF NOT EXISTS support_attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
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
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'support_tickets_category_allowed') THEN
      ALTER TABLE support_tickets
      ADD CONSTRAINT support_tickets_category_allowed
      CHECK (category IN (
        'account_access',
        'identity_verification',
        'profile_account',
        'job_workflow',
        'contract_help',
        'payment_help',
        'technical_issue',
        'safety_concern',
        'other'
      ));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'support_tickets_priority_allowed') THEN
      ALTER TABLE support_tickets
      ADD CONSTRAINT support_tickets_priority_allowed
      CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'support_tickets_status_allowed') THEN
      ALTER TABLE support_tickets
      ADD CONSTRAINT support_tickets_status_allowed
      CHECK (status IN ('open', 'assigned', 'awaiting_user', 'in_progress', 'escalated', 'resolved', 'closed'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'support_tickets_resolution_type_allowed') THEN
      ALTER TABLE support_tickets
      ADD CONSTRAINT support_tickets_resolution_type_allowed
      CHECK (
        resolution_type IS NULL OR resolution_type IN (
          'guidance_provided',
          'issue_resolved',
          'referred_to_verification',
          'referred_to_dispute',
          'technical_issue_recorded',
          'unable_to_resolve'
        )
      );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'support_messages_actor_type_allowed') THEN
      ALTER TABLE support_messages
      ADD CONSTRAINT support_messages_actor_type_allowed
      CHECK (actor_type IN ('client', 'worker', 'support_admin'));
    END IF;
  END
  $$;
`;

await sql`CREATE UNIQUE INDEX IF NOT EXISTS support_tickets_reference_unique_idx ON support_tickets(reference)`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS support_tickets_idempotency_unique_idx ON support_tickets(idempotency_key)`;
await sql`CREATE INDEX IF NOT EXISTS support_tickets_owner_idx ON support_tickets(owner_id, status)`;
await sql`CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status, updated_at)`;
await sql`CREATE INDEX IF NOT EXISTS support_tickets_assigned_admin_idx ON support_tickets(assigned_admin_id, status)`;
await sql`CREATE INDEX IF NOT EXISTS support_tickets_related_job_idx ON support_tickets(related_job_id)`;
await sql`CREATE INDEX IF NOT EXISTS support_messages_ticket_idx ON support_messages(ticket_id, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS support_events_ticket_idx ON support_events(ticket_id, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS support_internal_notes_ticket_idx ON support_internal_notes(ticket_id, created_at)`;
await sql`CREATE INDEX IF NOT EXISTS support_attachments_ticket_idx ON support_attachments(ticket_id, created_at)`;

console.log("Support workflow migration completed.");
