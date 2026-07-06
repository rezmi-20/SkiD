ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS chapa_checkout_url text,
  ADD COLUMN IF NOT EXISTS chapa_status varchar(50),
  ADD COLUMN IF NOT EXISTS chapa_response json,
  ADD COLUMN IF NOT EXISTS worker_subaccount_id text,
  ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS payments_chapa_ref_idx
  ON payments (chapa_ref)
  WHERE chapa_ref IS NOT NULL;
