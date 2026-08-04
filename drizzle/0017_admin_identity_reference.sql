ALTER TABLE admin_employees
  ADD COLUMN IF NOT EXISTS admin_identity_reference varchar(120);

CREATE SEQUENCE IF NOT EXISTS admin_identity_reference_seq START 1;

CREATE UNIQUE INDEX IF NOT EXISTS admin_employees_admin_identity_reference_unique_idx
  ON admin_employees (admin_identity_reference)
  WHERE admin_identity_reference IS NOT NULL;
