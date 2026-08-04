ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_role varchar(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_status varchar(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_activation_required boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_created_by uuid REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_created_at timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_updated_at timestamp;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_admin_role_allowed'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_admin_role_allowed
      CHECK (
        admin_role IS NULL OR admin_role IN (
          'super_admin',
          'content_verification_admin',
          'dispute_payment_admin',
          'user_support_admin'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_admin_status_allowed'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_admin_status_allowed
      CHECK (
        admin_status IS NULL OR admin_status IN (
          'invited',
          'activation_required',
          'active',
          'suspended',
          'revoked'
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_admin_metadata_requires_admin_role'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_admin_metadata_requires_admin_role
      CHECK (
        role = 'admin'
        OR (
          admin_role IS NULL
          AND admin_status IS NULL
          AND admin_created_by IS NULL
          AND admin_created_at IS NULL
          AND admin_updated_at IS NULL
        )
      );
  END IF;
END $$;

UPDATE users
SET
  admin_role = CASE
    WHEN lower(email) = lower('remedanseid00@gmail.com') THEN 'super_admin'
    ELSE COALESCE(admin_role, 'user_support_admin')
  END,
  admin_status = COALESCE(admin_status, 'active'),
  admin_activation_required = COALESCE(admin_activation_required, false),
  admin_created_at = COALESCE(admin_created_at, created_at, NOW()),
  admin_updated_at = NOW()
WHERE role = 'admin';

CREATE INDEX IF NOT EXISTS user_admin_role_idx ON users(admin_role);
CREATE INDEX IF NOT EXISTS user_admin_status_idx ON users(admin_status);
CREATE INDEX IF NOT EXISTS user_admin_created_by_idx ON users(admin_created_by);
