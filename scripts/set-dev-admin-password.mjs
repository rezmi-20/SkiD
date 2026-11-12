import { config } from "dotenv";
import { randomBytes, scryptSync } from "node:crypto";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });

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

const targetEmployeeId = process.argv[2] || "OWN-0001";
const newPassword = process.argv[3] || "Admin@12345678";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const passwordHash = hashPassword(newPassword);

const rows = await sql`
  UPDATE admin_employees
  SET password_hash = ${passwordHash},
      admin_status = 'active',
      admin_activation_required = false,
      temp_credential_expires_at = NULL,
      activation_completed_at = NOW(),
      session_version = session_version + 1,
      updated_at = NOW()
  WHERE lower(admin_employee_id) = lower(${targetEmployeeId})
  RETURNING admin_employee_id, work_email, admin_role, admin_status
`;

if (rows.length === 0) {
  console.error(`Employee ${targetEmployeeId} not found`);
  process.exit(1);
}

console.log("==========================================");
console.log(" ADMIN PASSWORD UPDATED SUCCESSFULLY!");
console.log(` Employee ID : ${rows[0].admin_employee_id}`);
console.log(` Email       : ${rows[0].work_email}`);
console.log(` Role        : ${rows[0].admin_role}`);
console.log(` Status      : ${rows[0].admin_status}`);
console.log(` Password    : ${newPassword}`);
console.log("==========================================");
