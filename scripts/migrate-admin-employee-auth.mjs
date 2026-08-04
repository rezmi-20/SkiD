import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes, scryptSync } from "node:crypto";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });

if (!process.env.DATABASE_URL) {
  console.error("MISSING database connection environment");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const sql = neon(process.env.DATABASE_URL);
const migration = readFileSync(resolve(process.cwd(), "drizzle/0016_admin_employee_auth.sql"), "utf8");
const ownerEmail = String(process.env.OWNER_SUPER_ADMIN_EMAIL || "remedanseid00@gmail.com").trim().toLowerCase();

function hashBetterAuthPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${Buffer.from(key).toString("hex")}`;
}

const statements = migration
  .split(/;\s*(?=\n|$)/)
  .map((statement) => statement.trim())
  .filter(Boolean);

if (dryRun) {
  for (const statement of statements) console.log(`PLAN ${statement.split("\n")[0].slice(0, 90)}`);
  console.log("Dry-run complete. No schema or data changed.");
  process.exit(0);
}

for (const statement of statements) {
  await sql.query(statement);
}

const placeholderRows = await sql`
  SELECT id, admin_employee_id, admin_role, work_email
  FROM admin_employees
  WHERE password_hash = 'migration_requires_reset'
  ORDER BY admin_role, admin_employee_id
`;

for (const row of placeholderRows) {
  const temporaryPassword = `Admin-${randomBytes(12).toString("base64url")}-9!`;
  const passwordHash = await hashBetterAuthPassword(temporaryPassword);
  await sql`
    UPDATE admin_employees
    SET password_hash = ${passwordHash},
        admin_status = 'activation_required',
        admin_activation_required = true,
        temp_credential_expires_at = NOW() + INTERVAL '24 hours',
        activation_completed_at = NULL,
        session_version = session_version + 1,
        updated_at = NOW()
    WHERE id = ${row.id}
  `;
  if (String(row.admin_role) === "super_admin" && String(row.work_email || "").toLowerCase() === ownerEmail) {
    console.log(`OWNER_ADMIN_EMPLOYEE_ID ${row.admin_employee_id}`);
  }
  console.log(`MIGRATED_ADMIN_EMPLOYEE_ID ${row.admin_employee_id}`);
  console.log(`MIGRATED_ADMIN_TEMPORARY_PASSWORD ${temporaryPassword}`);
}

if (placeholderRows.length > 0) {
  console.log("public email login no longer grants administrator access.");
  console.log(`The configured owner (${ownerEmail}) must use /admin/login with Employee ID and password.`);
  console.log("The owner's Employee ID is printed above as OWNER_ADMIN_EMPLOYEE_ID.");
  console.log("Temporary passwords are shown once. Complete activation through /admin/activate.");
  console.log("If the owner temporary credential is lost, run: ALLOW_OWNER_ADMIN_RESET=true npm run reset:owner-admin");
  console.log("Do not rerun destructive migration steps just to recover credentials.");
}

console.log("PASS admin employee auth migration applied");
