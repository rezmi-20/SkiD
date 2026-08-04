ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_username varchar(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_full_name varchar(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_temp_credential_expires_at timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_activation_completed_at timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_identity_reference varchar(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_identity_note text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_admin_username_format'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_admin_username_format
      CHECK (
        admin_username IS NULL
        OR admin_username ~ '^[a-z][a-z0-9_]{2,31}$'
      );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS user_admin_username_unique_idx
  ON users (lower(admin_username))
  WHERE admin_username IS NOT NULL;

CREATE INDEX IF NOT EXISTS user_admin_activation_required_idx
  ON users(admin_activation_required);

CREATE INDEX IF NOT EXISTS user_admin_temp_credential_expires_at_idx
  ON users(admin_temp_credential_expires_at);
