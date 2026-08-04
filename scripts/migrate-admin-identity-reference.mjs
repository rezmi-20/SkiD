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
  ["admin_employees.admin_identity_reference column", "ALTER TABLE admin_employees ADD COLUMN IF NOT EXISTS admin_identity_reference varchar(120)"],
  ["admin_identity_reference_seq sequence", "CREATE SEQUENCE IF NOT EXISTS admin_identity_reference_seq START 1"],
  [
    "admin_identity_reference unique index",
    `CREATE UNIQUE INDEX IF NOT EXISTS admin_employees_admin_identity_reference_unique_idx
      ON admin_employees (admin_identity_reference)
      WHERE admin_identity_reference IS NOT NULL`,
  ],
];

for (const [label, statement] of statements) {
  if (dryRun) {
    console.log(`PLAN ${label}`);
    continue;
  }
  await sql.query(statement);
  console.log(`PASS ${label}`);
}

console.log(dryRun ? "Dry-run complete. No schema or data changed." : "Admin identity reference migration complete.");
