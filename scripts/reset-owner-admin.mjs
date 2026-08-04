import { config } from "dotenv";
import { randomBytes, scryptSync } from "node:crypto";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });

function fail(message) {
  console.error(message);
  process.exit(1);
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function generateTemporaryPassword() {
  return `Owner-${randomBytes(12).toString("base64url")}-9!`;
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  });
  return `${salt}:${Buffer.from(key).toString("hex")}`;
}

const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
if (isProduction && process.env.OWNER_ADMIN_RESET_EMERGENCY !== "true") {
  fail("Refusing to reset the owner admin in production without OWNER_ADMIN_RESET_EMERGENCY=true.");
}
if (process.env.ALLOW_OWNER_ADMIN_RESET !== "true") {
  fail("Refusing to run. Set ALLOW_OWNER_ADMIN_RESET=true before resetting the owner admin employee credential.");
}
if (!process.env.DATABASE_URL) fail("DATABASE_URL is not configured.");

const ownerEmail = normalizeEmail(process.env.OWNER_SUPER_ADMIN_EMAIL || "remedanseid00@gmail.com");
if (!ownerEmail) fail("OWNER_SUPER_ADMIN_EMAIL is not configured.");

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
  SELECT id, admin_employee_id, work_email, admin_role
  FROM admin_employees
  WHERE lower(work_email) = ${ownerEmail}
  ORDER BY created_at ASC
`;

if (rows.length === 0) fail("Configured owner super-admin employee was not found.");
if (rows.length > 1) fail("Multiple owner employee rows found. Refusing to choose a reset target.");

const owner = rows[0];
if (owner.admin_role !== "super_admin") {
  fail("Configured owner employee is not a super_admin. Refusing to reset.");
}

const temporaryPassword = generateTemporaryPassword();
const passwordHash = hashPassword(temporaryPassword);
const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

const updatedRows = await sql`
  UPDATE admin_employees
  SET password_hash = ${passwordHash},
      admin_activation_required = true,
      admin_status = 'activation_required',
      temp_credential_expires_at = ${expiresAt.toISOString()},
      activation_completed_at = NULL,
      session_version = session_version + 1,
      updated_at = NOW()
  WHERE id = ${owner.id}
    AND admin_role = 'super_admin'
  RETURNING admin_employee_id
`;

if (updatedRows.length !== 1) {
  fail("Owner admin reset did not update exactly one super_admin employee. Refusing to print credentials.");
}

await sql`
  INSERT INTO audit_logs (admin_employee_id, action, details)
  VALUES (
    ${owner.id},
    'owner_admin_temporary_credential_reset',
    ${JSON.stringify({
      reason: "owner_admin_bootstrap_reset",
      employeeId: owner.admin_employee_id,
      timestamp: new Date().toISOString(),
    })}
  )
`.catch(() => undefined);

console.log(`OWNER_EMPLOYEE_ID ${owner.admin_employee_id}`);
console.log(`OWNER_TEMPORARY_PASSWORD ${temporaryPassword}`);
console.log(`OWNER_TEMPORARY_PASSWORD_EXPIRES_AT ${expiresAt.toISOString()}`);
console.log("Temporary password is shown once. Sign in at /admin/login and complete /admin/activate.");
