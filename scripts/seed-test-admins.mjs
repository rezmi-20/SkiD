import { config } from "dotenv";
import { randomBytes, scryptSync } from "node:crypto";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });

const activeMode = process.env.ALLOW_DEV_ADMIN_SEED_ACTIVE === "true";
const resetMode = process.env.ALLOW_DEV_ADMIN_SEED_RESET === "true";

const targets = [
  { role: "content_verification_admin", prefix: "VER", seq: "admin_employee_ver_seq", env: "TEST_CONTENT_VERIFICATION_ADMIN_EMAIL", email: process.env.TEST_CONTENT_VERIFICATION_ADMIN_EMAIL },
  { role: "dispute_payment_admin", prefix: "DSP", seq: "admin_employee_dsp_seq", env: "TEST_DISPUTE_PAYMENT_ADMIN_EMAIL", email: process.env.TEST_DISPUTE_PAYMENT_ADMIN_EMAIL },
  { role: "user_support_admin", prefix: "SUP", seq: "admin_employee_sup_seq", env: "TEST_USER_SUPPORT_ADMIN_EMAIL", email: process.env.TEST_USER_SUPPORT_ADMIN_EMAIL },
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function tempPassword() {
  return `Ds-${randomBytes(9).toString("base64url")}-5D!`;
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

async function nextEmployeeId(sql, target) {
  const rows = await sql.query(`SELECT nextval('${target.seq}')::int AS n`, []);
  return `${target.prefix}-${String(rows[0].n).padStart(4, "0")}`;
}

if (process.env.NODE_ENV === "production") fail("Refusing to seed test admins in production.");
if (process.env.ALLOW_DEV_ADMIN_SEED !== "true") fail("Refusing to run. Set ALLOW_DEV_ADMIN_SEED=true for local development admin seeding.");
if (!process.env.DATABASE_URL) fail("DATABASE_URL is not configured.");

const normalizedTargets = targets.map((target) => ({ ...target, email: normalizeEmail(target.email) }));
const ownerEmail = normalizeEmail(process.env.OWNER_SUPER_ADMIN_EMAIL || "remedanseid00@gmail.com");
for (const target of normalizedTargets) {
  if (!target.email) fail(`${target.env} is required.`);
  if (target.email === ownerEmail) fail(`${target.env} must not be the configured owner super-admin account.`);
}
if (new Set(normalizedTargets.map((target) => target.email)).size !== normalizedTargets.length) {
  fail("Configured test admin emails must be unique after normalization.");
}

const sql = neon(process.env.DATABASE_URL);
const status = activeMode ? "active" : "activation_required";
console.log(`Development employee admin seed mode: ${status}`);
if (activeMode) console.warn("WARNING development active seed mode bypasses first-login activation for rapid role testing.");

for (const target of normalizedTargets) {
  const existingRows = await sql`
    SELECT id, admin_employee_id
    FROM admin_employees
    WHERE lower(work_email) = ${target.email}
    LIMIT 1
  `;
  const existing = existingRows[0] ?? null;
  const shouldRotate = !existing || resetMode;
  const password = shouldRotate ? tempPassword() : null;
  const passwordHash = password ? hashPassword(password) : null;
  const employeeId = existing?.admin_employee_id ?? await nextEmployeeId(sql, target);

  if (existing) {
    await sql`
      UPDATE admin_employees
      SET full_name = COALESCE(full_name, ${`Development ${target.role}`}),
          department = COALESCE(department, 'Development Testing'),
          admin_role = ${target.role},
          admin_status = ${status},
          admin_activation_required = ${!activeMode},
          password_hash = COALESCE(${passwordHash}, password_hash),
          temp_credential_expires_at = ${activeMode ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()},
          activation_completed_at = CASE WHEN ${activeMode} THEN COALESCE(activation_completed_at, NOW()) ELSE NULL END,
          session_version = CASE WHEN ${shouldRotate} THEN session_version + 1 ELSE session_version END,
          updated_at = NOW()
      WHERE id = ${existing.id}
    `;
    console.log(`UPDATED ${target.role} ${employeeId} status=${status}`);
  } else {
    await sql`
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
        identity_reference,
        identity_note,
        created_at,
        updated_at
      )
      VALUES (
        ${employeeId},
        ${target.email},
        ${`Development ${target.role}`},
        'Development Testing',
        ${target.role},
        ${status},
        ${!activeMode},
        ${passwordHash},
        ${activeMode ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()},
        ${activeMode ? new Date().toISOString() : null},
        'development_test_seed',
        'development_test_admin_seed',
        NOW(),
        NOW()
      )
    `;
    console.log(`CREATED ${target.role} ${employeeId} status=${status}`);
  }

  if (password) console.log(`TEMPORARY_PASSWORD ${employeeId} ${password}`);
}

console.log("Development employee admin seed complete. Temporary passwords are shown only for newly-created or reset employee accounts.");
