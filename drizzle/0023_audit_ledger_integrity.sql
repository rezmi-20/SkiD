-- 0023_audit_ledger_integrity.sql
-- Cryptographic Chaining, Tamper-Resistance, and Append-Only Invariants for Audit Logs & Court Evidence

-- 1. Add cryptographic chain columns and sequential ordering to audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS sequence_number BIGSERIAL;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS event_hash VARCHAR(64);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS previous_event_hash VARCHAR(64);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS payload_digest VARCHAR(64);

-- 2. Indexes for sequential verification and audit lookups
CREATE INDEX IF NOT EXISTS audit_logs_sequence_idx ON audit_logs(sequence_number);
CREATE INDEX IF NOT EXISTS audit_logs_event_hash_idx ON audit_logs(event_hash);
CREATE INDEX IF NOT EXISTS audit_logs_user_idx ON audit_logs(user_id, created_at);

-- 3. Append-Only Trigger on audit_logs: strictly forbid UPDATE or DELETE
CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs are append-only: UPDATE and DELETE operations are strictly prohibited for accountability integrity.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_logs_no_update ON audit_logs;
CREATE TRIGGER audit_logs_no_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

DROP TRIGGER IF EXISTS audit_logs_no_delete ON audit_logs;
CREATE TRIGGER audit_logs_no_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

-- 4. Enhance court_evidence_records for official PDF archival and participant access
ALTER TABLE court_evidence_records ADD COLUMN IF NOT EXISTS pdf_base64 TEXT;
ALTER TABLE court_evidence_records ADD COLUMN IF NOT EXISTS requested_by_user_id UUID REFERENCES users(id);
ALTER TABLE court_evidence_records ADD COLUMN IF NOT EXISTS participant_role VARCHAR(30);
ALTER TABLE court_evidence_records ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'certified';
ALTER TABLE court_evidence_records ADD COLUMN IF NOT EXISTS document_manifest_digest VARCHAR(64);

CREATE INDEX IF NOT EXISTS court_evidence_requester_idx 
  ON court_evidence_records(requested_by_user_id, created_at);
