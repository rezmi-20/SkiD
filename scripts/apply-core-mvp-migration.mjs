import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true });

const dryRun = process.argv.includes("--dry-run");
const migrationPath = resolve(process.cwd(), "drizzle/0012_core_mvp_workflow.sql");

if (!process.env.DATABASE_URL) {
  console.error("MISSING database connection environment");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const migrationSql = readFileSync(migrationPath, "utf8");

const enumChanges = [
  { type: "job_status", value: "completion_requested" },
  { type: "job_status", value: "payment_pending" },
  { type: "job_status", value: "paid" },
  { type: "job_status", value: "closed" },
];

const columnChanges = [
  { table: "worker_profiles", column: "verification_reason", ddl: "ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS verification_reason text" },
  { table: "worker_profiles", column: "verified_by", ddl: "ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES users(id)" },
  { table: "worker_profiles", column: "verified_at", ddl: "ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS verified_at timestamp" },
  { table: "jobs", column: "location", ddl: "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location text" },
  { table: "jobs", column: "requested_date", ddl: "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requested_date timestamp" },
  { table: "jobs", column: "rejection_reason", ddl: "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS rejection_reason text" },
  { table: "jobs", column: "completion_rejection_reason", ddl: "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS completion_rejection_reason text" },
  { table: "contracts", column: "terms_status", ddl: "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS terms_status varchar(50) NOT NULL DEFAULT 'draft'" },
  { table: "contracts", column: "terms_submitted_at", ddl: "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS terms_submitted_at timestamp" },
  { table: "contracts", column: "terms_submitted_by", ddl: "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS terms_submitted_by uuid REFERENCES users(id)" },
  { table: "contracts", column: "terms_accepted_at", ddl: "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS terms_accepted_at timestamp" },
  { table: "contracts", column: "terms_accepted_by", ddl: "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS terms_accepted_by uuid REFERENCES users(id)" },
  { table: "contracts", column: "terms_rejected_at", ddl: "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS terms_rejected_at timestamp" },
  { table: "contracts", column: "terms_rejected_by", ddl: "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS terms_rejected_by uuid REFERENCES users(id)" },
  { table: "contracts", column: "terms_rejection_reason", ddl: "ALTER TABLE contracts ADD COLUMN IF NOT EXISTS terms_rejection_reason text" },
  { table: "payments", column: "chapa_reference", ddl: "ALTER TABLE payments ADD COLUMN IF NOT EXISTS chapa_reference text" },
];

const enumChecks = [
  ...enumChanges.map((item) => ({
    label: `job_status:${item.value}`,
    kind: "enum",
    type: item.type,
    value: item.value,
    ddl: `ALTER TYPE ${item.type} ADD VALUE IF NOT EXISTS '${item.value}'`,
  })),
];

const indexChanges = [
  { label: "job_client_idx", table: "jobs", kind: "index", ddl: "CREATE INDEX IF NOT EXISTS job_client_idx ON jobs(client_id)" },
  { label: "job_worker_idx", table: "jobs", kind: "index", ddl: "CREATE INDEX IF NOT EXISTS job_worker_idx ON jobs(worker_id)" },
  { label: "rating_job_idx", table: "ratings", kind: "index", ddl: "CREATE INDEX IF NOT EXISTS rating_job_idx ON ratings(job_id)" },
  { label: "payment_job_idx", table: "payments", kind: "index", ddl: "CREATE INDEX IF NOT EXISTS payment_job_idx ON payments(job_id)" },
  { label: "payment_status_idx", table: "payments", kind: "index", ddl: "CREATE INDEX IF NOT EXISTS payment_status_idx ON payments(status)" },
];

const uniqueIndexChanges = [
  { label: "contract_job_unique_idx", table: "contracts", kind: "unique", ddl: "CREATE UNIQUE INDEX IF NOT EXISTS contract_job_unique_idx ON contracts(job_id)" },
  { label: "contract_signature_contract_user_unique_idx", table: "contract_signatures", kind: "unique", ddl: "CREATE UNIQUE INDEX IF NOT EXISTS contract_signature_contract_user_unique_idx ON contract_signatures(contract_id, user_id)" },
  { label: "rating_job_rater_rated_unique_idx", table: "ratings", kind: "unique", ddl: "CREATE UNIQUE INDEX IF NOT EXISTS rating_job_rater_rated_unique_idx ON ratings(job_id, rater_id, rated_id)" },
  { label: "payment_chapa_ref_unique_idx", table: "payments", kind: "unique", ddl: "CREATE UNIQUE INDEX IF NOT EXISTS payment_chapa_ref_unique_idx ON payments(chapa_ref) WHERE chapa_ref IS NOT NULL" },
  { label: "payment_released_job_unique_idx", table: "payments", kind: "unique", ddl: "CREATE UNIQUE INDEX IF NOT EXISTS payment_released_job_unique_idx ON payments(job_id) WHERE status = 'released'" },
];

const plannedChanges = [
  ...enumChecks,
  ...columnChanges.map((item) => ({ label: `${item.table}.${item.column}`, kind: "column", ddl: item.ddl })),
  ...indexChanges,
  ...uniqueIndexChanges,
];

function normalizeSqlStatements(source) {
  return source
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean)
    .filter((statement) => !statement.startsWith("--"));
}

function isDestructiveStatement(statement) {
  return /\bDROP\b|\bTRUNCATE\b|\bDELETE\b|\bALTER\s+TABLE\s+\S+\s+DROP\b/i.test(statement);
}

async function columnExists(table, column) {
  const rows = await sql`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
      AND column_name = ${column}
    LIMIT 1
  `;
  return rows.length > 0;
}

async function enumValueExists(type, value) {
  const rows = await sql`
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = ${type}
      AND e.enumlabel = ${value}
    LIMIT 1
  `;
  return rows.length > 0;
}

async function indexExists(indexName) {
  const rows = await sql`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = ${indexName}
    LIMIT 1
  `;
  if (rows.length === 0) return { exists: false, unique: false };
  return {
    exists: true,
    unique: String(rows[0].indexdef || "").toUpperCase().startsWith("CREATE UNIQUE INDEX"),
  };
}

async function changeExists(change) {
  if (change.kind === "enum") {
    return enumValueExists(change.type, change.value);
  }

  if (change.kind === "column") {
    const match = change.ddl.match(/ALTER TABLE (\w+) ADD COLUMN IF NOT EXISTS (\w+)/i);
    if (!match) return false;
    return columnExists(match[1], match[2]);
  }

  const index = await indexExists(change.label);
  if (change.kind === "unique") {
    return index.exists && index.unique;
  }
  return index.exists;
}

async function getDuplicateRows(query, fields) {
  const rows = await sql.query(query);
  return rows.map((row) => {
    const base = {};
    for (const field of fields) base[field] = row[field];
    base.count = Number(row.count || 0);
    return base;
  });
}

async function getCurrentObjectState(item) {
  return changeExists(item);
}

function printDuplicateSection(title, rows, formatter) {
  if (rows.length === 0) {
    console.log(`PASS ${title}: none`);
    return false;
  }

  console.log(`MISSING ${title}: duplicate data found`);
  for (const row of rows) {
    console.log(`- ${formatter(row)}`);
  }
  return true;
}

const statements = normalizeSqlStatements(migrationSql);
const destructiveStatements = statements.filter(isDestructiveStatement);

const duplicateContracts = await getDuplicateRows(
  `
    SELECT job_id, COUNT(*)::int AS count
    FROM contracts
    GROUP BY job_id
    HAVING COUNT(*) > 1
    ORDER BY count DESC, job_id
  `,
  ["job_id"]
);

const duplicateSignatures = await getDuplicateRows(
  `
    SELECT contract_id, user_id, COUNT(*)::int AS count
    FROM contract_signatures
    GROUP BY contract_id, user_id
    HAVING COUNT(*) > 1
    ORDER BY count DESC, contract_id, user_id
  `,
  ["contract_id", "user_id"]
);

const duplicateRatings = await getDuplicateRows(
  `
    SELECT job_id, rater_id, rated_id, COUNT(*)::int AS count
    FROM ratings
    GROUP BY job_id, rater_id, rated_id
    HAVING COUNT(*) > 1
    ORDER BY count DESC, job_id, rater_id, rated_id
  `,
  ["job_id", "rater_id", "rated_id"]
);

const duplicateReleasedPayments = await getDuplicateRows(
  `
    SELECT job_id, COUNT(*)::int AS count
    FROM payments
    WHERE status = 'released'
    GROUP BY job_id
    HAVING COUNT(*) > 1
    ORDER BY count DESC, job_id
  `,
  ["job_id"]
);

const blockers = [];

if (printDuplicateSection("contracts per job", duplicateContracts, (row) => `job_id=${row.job_id} count=${row.count}`)) {
  blockers.push("duplicate contracts per job");
}
if (printDuplicateSection("signatures per contract/user", duplicateSignatures, (row) => `contract_id=${row.contract_id} user_id=${row.user_id} count=${row.count}`)) {
  blockers.push("duplicate signatures per contract/user");
}
if (printDuplicateSection("rating directions per job", duplicateRatings, (row) => `job_id=${row.job_id} rater_id=${row.rater_id} rated_id=${row.rated_id} count=${row.count}`)) {
  blockers.push("duplicate rating directions per job");
}
if (printDuplicateSection("released payments per job", duplicateReleasedPayments, (row) => `job_id=${row.job_id} count=${row.count}`)) {
  blockers.push("duplicate released payments per job");
}

console.log("Planned changes:");
for (const change of plannedChanges) {
  const exists = await changeExists(change);
  console.log(`- ${exists ? "PASS" : "MISSING"} ${change.label}`);
}

console.log("Destructive operations:");
if (destructiveStatements.length === 0) {
  console.log("- none");
} else {
  for (const statement of destructiveStatements) {
    console.log(`- ${statement}`);
  }
  blockers.push("destructive statements present");
}

const applied = [];
const skipped = [];
const failed = [];

if (!dryRun && blockers.length === 0) {
  const toApply = [];
  for (const change of plannedChanges) {
    const exists = await changeExists(change);
    if (exists) {
      skipped.push(change.label);
      continue;
    }

    toApply.push(change);
  }

  try {
    if (toApply.length > 0) {
      await sql.transaction((txn) => toApply.map((change) => txn.query(change.ddl)));
      applied.push(...toApply.map((change) => change.label));
    }
  } catch (error) {
    failed.push(String(error?.message || error));
  }
}

console.log("Summary:");
console.log(`- applied: ${dryRun ? 0 : applied.length}`);
console.log(`- skipped: ${dryRun ? plannedChanges.length : skipped.length}`);
console.log(`- failed: ${failed.length}`);

const safeToRun = blockers.length === 0;
console.log(`Safe to run: ${safeToRun ? "yes" : "no"}`);

if (dryRun) {
  if (!safeToRun) {
    process.exit(1);
  }
  process.exit(0);
}

if (failed.length > 0 || !safeToRun) {
  process.exit(1);
}

process.exit(0);
