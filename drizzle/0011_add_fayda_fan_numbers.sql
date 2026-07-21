ALTER TABLE worker_profiles
  ADD COLUMN IF NOT EXISTS fayda_fan_number VARCHAR(64);

ALTER TABLE client_profiles
  ADD COLUMN IF NOT EXISTS fayda_fan_number VARCHAR(64);
