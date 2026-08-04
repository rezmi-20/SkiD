import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });

if (!process.env.DATABASE_URL) {
  console.error("MISSING database connection environment");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const sql = neon(process.env.DATABASE_URL);
const statements = [
  ["users.admin_username column", "ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_username varchar(32)"],
  ["users.admin_full_name column", "ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_full_name varchar(255)"],
  ["users.admin_temp_credential_expires_at column", "ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_temp_credential_expires_at timestamp"],
  ["users.admin_activation_completed_at column", "ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_activation_completed_at timestamp"],
  ["users.admin_identity_reference column", "ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_identity_reference varchar(120)"],
  ["users.admin_identity_note column", "ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_identity_note text"],
  [
    "users_admin_username_format constraint",
    `DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_admin_username_format') THEN
    ALTER TABLE users
      ADD CONSTRAINT users_admin_username_format
      CHECK (admin_username IS NULL OR admin_username ~ '^[a-z][a-z0-9_]{2,31}$');
  END IF;
END $$`,
  ],
  ["user_admin_username_unique_idx index", "CREATE UNIQUE INDEX IF NOT EXISTS user_admin_username_unique_idx ON users (lower(admin_username)) WHERE admin_username IS NOT NULL"],
  ["user_admin_activation_required_idx index", "CREATE INDEX IF NOT EXISTS user_admin_activation_required_idx ON users(admin_activation_required)"],
  ["user_admin_temp_credential_expires_at_idx index", "CREATE INDEX IF NOT EXISTS user_admin_temp_credential_expires_at_idx ON users(admin_temp_credential_expires_at)"],
];

if (dryRun) {
  for (const [label] of statements) console.log(`PLAN ${label}`);
  console.log("Dry-run complete. No schema or data changed.");
  process.exit(0);
}

for (const [label, statement] of statements) {
  await sql.query(statement);
  console.log(`PASS ${label}`);
}
console.log("PASS admin activation/profile migration applied");
