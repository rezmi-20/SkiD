ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'completion_requested';
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'payment_pending';
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'closed';

ALTER TABLE worker_profiles
  ADD COLUMN IF NOT EXISTS verification_reason text,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS verified_at timestamp;

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS requested_date timestamp,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS completion_rejection_reason text;

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS terms_status varchar(50) NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS terms_submitted_at timestamp,
  ADD COLUMN IF NOT EXISTS terms_submitted_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamp,
  ADD COLUMN IF NOT EXISTS terms_accepted_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS terms_rejected_at timestamp,
  ADD COLUMN IF NOT EXISTS terms_rejected_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS terms_rejection_reason text;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS chapa_reference text;

CREATE UNIQUE INDEX IF NOT EXISTS contract_job_unique_idx
  ON contracts(job_id);

CREATE UNIQUE INDEX IF NOT EXISTS contract_signature_contract_user_unique_idx
  ON contract_signatures(contract_id, user_id);

CREATE UNIQUE INDEX IF NOT EXISTS rating_job_rater_rated_unique_idx
  ON ratings(job_id, rater_id, rated_id);

CREATE UNIQUE INDEX IF NOT EXISTS payment_chapa_ref_unique_idx
  ON payments(chapa_ref)
  WHERE chapa_ref IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payment_released_job_unique_idx
  ON payments(job_id)
  WHERE status = 'released';

CREATE INDEX IF NOT EXISTS job_client_idx ON jobs(client_id);
CREATE INDEX IF NOT EXISTS job_worker_idx ON jobs(worker_id);
CREATE INDEX IF NOT EXISTS rating_job_idx ON ratings(job_id);
CREATE INDEX IF NOT EXISTS payment_job_idx ON payments(job_id);
CREATE INDEX IF NOT EXISTS payment_status_idx ON payments(status);
