-- Phase 5B.1: protect Fayda Identification Number (FIN) storage.
-- Add encrypted FIN fields first. Legacy plaintext fayda_fan_number columns are
-- removed only after scripts/migrate-fin-protection.mjs copies valid legacy data.

ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS fin_encrypted text;
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS fin_encryption_key_id varchar(64);
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS fin_fingerprint text;
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS fin_last4 varchar(4);
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS verification_provider varchar(100);
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS verification_reference varchar(255);

ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS fayda_doc_url text;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS fin_encrypted text;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS fin_encryption_key_id varchar(64);
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS fin_fingerprint text;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS fin_last4 varchar(4);
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS verification_status varchar(50) NOT NULL DEFAULT 'incomplete';
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS verification_reason text;
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS verification_provider varchar(100);
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS verification_reference varchar(255);
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES users(id);
ALTER TABLE client_profiles ADD COLUMN IF NOT EXISTS verified_at timestamp;

CREATE UNIQUE INDEX IF NOT EXISTS worker_fin_fingerprint_unique_idx
  ON worker_profiles(fin_fingerprint)
  WHERE fin_fingerprint IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS client_fin_fingerprint_unique_idx
  ON client_profiles(fin_fingerprint)
  WHERE fin_fingerprint IS NOT NULL;

CREATE INDEX IF NOT EXISTS client_verification_status_idx
  ON client_profiles(verification_status);

CREATE INDEX IF NOT EXISTS worker_verification_status_idx
  ON worker_profiles(verification_status);
