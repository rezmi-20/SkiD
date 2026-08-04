CREATE TABLE IF NOT EXISTS verification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_user_id uuid NOT NULL REFERENCES users(id),
  account_type varchar(20) NOT NULL,
  attempt_number integer NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'pending',
  document_reference text,
  document_fingerprint varchar(128),
  fin_last4 varchar(4),
  is_current boolean NOT NULL DEFAULT true,
  submitted_at timestamp NOT NULL DEFAULT NOW(),
  decided_at timestamp,
  decided_by uuid REFERENCES admin_employees(id),
  created_at timestamp NOT NULL DEFAULT NOW(),
  CONSTRAINT verification_attempts_account_type_allowed CHECK (account_type IN ('worker', 'client')),
  CONSTRAINT verification_attempts_status_allowed CHECK (
    status IN ('pending', 'approved', 'rejected', 'resubmission_requested', 'suspended', 'revoked')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS verification_attempts_account_number_unique_idx
  ON verification_attempts(account_user_id, account_type, attempt_number);

CREATE UNIQUE INDEX IF NOT EXISTS verification_attempts_current_unique_idx
  ON verification_attempts(account_user_id, account_type)
  WHERE is_current = true;

CREATE INDEX IF NOT EXISTS verification_attempts_account_idx
  ON verification_attempts(account_user_id, account_type);

CREATE TABLE IF NOT EXISTS verification_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES verification_attempts(id),
  account_user_id uuid NOT NULL REFERENCES users(id),
  account_type varchar(20) NOT NULL,
  old_status varchar(50),
  new_status varchar(50) NOT NULL,
  action varchar(50) NOT NULL,
  admin_employee_id uuid REFERENCES admin_employees(id),
  admin_role varchar(50),
  reason text,
  attempt_number integer,
  document_fingerprint varchar(128),
  created_at timestamp NOT NULL DEFAULT NOW(),
  CONSTRAINT verification_events_account_type_allowed CHECK (account_type IN ('worker', 'client')),
  CONSTRAINT verification_events_action_allowed CHECK (
    action IN ('submitted', 'approved', 'rejected', 'resubmission_requested', 'suspended', 'revoked', 'viewed_document')
  )
);

CREATE INDEX IF NOT EXISTS verification_events_account_idx
  ON verification_events(account_user_id, account_type);

CREATE INDEX IF NOT EXISTS verification_events_attempt_idx
  ON verification_events(attempt_id);

CREATE OR REPLACE FUNCTION prevent_verification_event_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'verification_events are append-only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS verification_events_no_update ON verification_events;
CREATE TRIGGER verification_events_no_update
  BEFORE UPDATE ON verification_events
  FOR EACH ROW EXECUTE FUNCTION prevent_verification_event_mutation();

DROP TRIGGER IF EXISTS verification_events_no_delete ON verification_events;
CREATE TRIGGER verification_events_no_delete
  BEFORE DELETE ON verification_events
  FOR EACH ROW EXECUTE FUNCTION prevent_verification_event_mutation();

CREATE TABLE IF NOT EXISTS content_moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type varchar(50) NOT NULL,
  content_id uuid NOT NULL,
  action varchar(50) NOT NULL,
  reason text NOT NULL,
  admin_employee_id uuid REFERENCES admin_employees(id),
  admin_role varchar(50),
  created_at timestamp NOT NULL DEFAULT NOW(),
  CONSTRAINT content_moderation_events_action_allowed CHECK (
    action IN ('hide', 'remove', 'restore', 'dismiss_report')
  )
);

CREATE INDEX IF NOT EXISTS content_moderation_events_content_idx
  ON content_moderation_events(content_type, content_id);
