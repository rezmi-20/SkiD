CREATE TABLE IF NOT EXISTS admin_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_employee_id varchar(32) NOT NULL,
  work_email varchar(255) NOT NULL,
  full_name varchar(255) NOT NULL,
  phone varchar(20),
  department varchar(120) NOT NULL DEFAULT 'Operations',
  admin_role varchar(50) NOT NULL,
  admin_status varchar(50) NOT NULL DEFAULT 'activation_required',
  admin_activation_required boolean NOT NULL DEFAULT true,
  password_hash text NOT NULL,
  temp_credential_expires_at timestamp,
  activation_completed_at timestamp,
  admin_identity_reference varchar(120),
  identity_reference varchar(120),
  identity_note text,
  session_version integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES admin_employees(id),
  legacy_user_id uuid REFERENCES users(id),
  created_at timestamp NOT NULL DEFAULT NOW(),
  updated_at timestamp NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_employees_role_allowed CHECK (
    admin_role IN ('super_admin', 'content_verification_admin', 'dispute_payment_admin', 'user_support_admin')
  ),
  CONSTRAINT admin_employees_status_allowed CHECK (
    admin_status IN ('activation_required', 'active', 'suspended', 'revoked')
  ),
  CONSTRAINT admin_employees_employee_id_format CHECK (
    admin_employee_id ~ '^[A-Z]{3}-[0-9]{4,}$'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_employees_employee_id_unique_idx
  ON admin_employees (lower(admin_employee_id));

CREATE UNIQUE INDEX IF NOT EXISTS admin_employees_work_email_unique_idx
  ON admin_employees (lower(work_email));

CREATE UNIQUE INDEX IF NOT EXISTS admin_employees_admin_identity_reference_unique_idx
  ON admin_employees (admin_identity_reference)
  WHERE admin_identity_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS admin_employees_role_idx ON admin_employees(admin_role);
CREATE INDEX IF NOT EXISTS admin_employees_status_idx ON admin_employees(admin_status);

CREATE SEQUENCE IF NOT EXISTS admin_employee_ver_seq START 1;
CREATE SEQUENCE IF NOT EXISTS admin_employee_dsp_seq START 1;
CREATE SEQUENCE IF NOT EXISTS admin_employee_sup_seq START 1;
CREATE SEQUENCE IF NOT EXISTS admin_employee_own_seq START 1;
CREATE SEQUENCE IF NOT EXISTS admin_identity_reference_seq START 1;

ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS admin_employee_id uuid REFERENCES admin_employees(id);

INSERT INTO admin_employees (
  admin_employee_id,
  work_email,
  full_name,
  department,
  admin_role,
  admin_status,
  admin_activation_required,
  password_hash,
  temp_credential_expires_at,
  activation_completed_at,
  legacy_user_id,
  created_at,
  updated_at
)
SELECT
  'OWN-' || LPAD(nextval('admin_employee_own_seq')::text, 4, '0'),
  u.email,
  COALESCE(u.admin_full_name, split_part(u.email, '@', 1), 'Super Admin'),
  'Executive',
  'super_admin',
  CASE WHEN u.admin_status = 'active' AND u.admin_activation_required = false THEN 'active' ELSE 'activation_required' END,
  CASE WHEN u.admin_status = 'active' AND u.admin_activation_required = false THEN false ELSE true END,
  'migration_requires_reset',
  CASE WHEN u.admin_status = 'active' AND u.admin_activation_required = false THEN NULL ELSE NOW() + INTERVAL '24 hours' END,
  CASE WHEN u.admin_status = 'active' AND u.admin_activation_required = false THEN COALESCE(u.admin_activation_completed_at, NOW()) ELSE NULL END,
  u.id,
  COALESCE(u.admin_created_at, u.created_at, NOW()),
  NOW()
FROM users u
WHERE u.role = 'admin'
  AND lower(u.email) = lower('remedanseid00@gmail.com')
  AND NOT EXISTS (
    SELECT 1 FROM admin_employees ae WHERE lower(ae.work_email) = lower(u.email)
  );

INSERT INTO admin_employees (
  admin_employee_id,
  work_email,
  full_name,
  department,
  admin_role,
  admin_status,
  admin_activation_required,
  password_hash,
  temp_credential_expires_at,
  activation_completed_at,
  legacy_user_id,
  created_at,
  updated_at
)
SELECT
  CASE COALESCE(u.admin_role, 'user_support_admin')
    WHEN 'content_verification_admin' THEN 'VER-' || LPAD(nextval('admin_employee_ver_seq')::text, 4, '0')
    WHEN 'dispute_payment_admin' THEN 'DSP-' || LPAD(nextval('admin_employee_dsp_seq')::text, 4, '0')
    WHEN 'super_admin' THEN 'OWN-' || LPAD(nextval('admin_employee_own_seq')::text, 4, '0')
    ELSE 'SUP-' || LPAD(nextval('admin_employee_sup_seq')::text, 4, '0')
  END,
  u.email,
  COALESCE(u.admin_full_name, split_part(u.email, '@', 1), 'Administrator'),
  'Operations',
  CASE
    WHEN u.admin_role IN ('super_admin', 'content_verification_admin', 'dispute_payment_admin', 'user_support_admin') THEN u.admin_role
    ELSE 'user_support_admin'
  END,
  CASE
    WHEN u.admin_status IN ('active', 'suspended', 'revoked') THEN u.admin_status
    ELSE 'activation_required'
  END,
  CASE WHEN u.admin_status = 'active' AND u.admin_activation_required = false THEN false ELSE true END,
  'migration_requires_reset',
  CASE WHEN u.admin_status = 'active' AND u.admin_activation_required = false THEN NULL ELSE NOW() + INTERVAL '24 hours' END,
  CASE WHEN u.admin_status = 'active' AND u.admin_activation_required = false THEN COALESCE(u.admin_activation_completed_at, NOW()) ELSE NULL END,
  u.id,
  COALESCE(u.admin_created_at, u.created_at, NOW()),
  NOW()
FROM users u
WHERE u.role = 'admin'
  AND lower(u.email) <> lower('remedanseid00@gmail.com')
  AND NOT EXISTS (
    SELECT 1 FROM admin_employees ae WHERE lower(ae.work_email) = lower(u.email)
  );
