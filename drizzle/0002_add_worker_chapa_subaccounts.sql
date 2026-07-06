ALTER TABLE worker_profiles
  ADD COLUMN IF NOT EXISTS chapa_subaccount_id text,
  ADD COLUMN IF NOT EXISTS bank_account text,
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_code varchar(50),
  ADD COLUMN IF NOT EXISTS chapa_split_type varchar(20) DEFAULT 'percentage',
  ADD COLUMN IF NOT EXISTS chapa_split_value double precision DEFAULT 0.05;

CREATE UNIQUE INDEX IF NOT EXISTS worker_profiles_chapa_subaccount_id_idx
  ON worker_profiles (chapa_subaccount_id)
  WHERE chapa_subaccount_id IS NOT NULL;
