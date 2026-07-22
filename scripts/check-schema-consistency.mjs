import { resolve } from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true });

if (!process.env.DATABASE_URL) {
  console.error("MISSING database connection environment");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
let failed = false;

function report(label, ok, severity = "critical") {
  console.log(`${ok ? "PASS" : severity === "warning" ? "WARNING" : "MISSING"} ${label}`);
  if (!ok && severity !== "warning") failed = true;
}

async function getColumn(table, column) {
  const rows = await sql`
    SELECT column_name, data_type, udt_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
      AND column_name = ${column}
    LIMIT 1
  `;
  return rows[0] || null;
}

async function hasEnumValue(typeName, value) {
  const rows = await sql`
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = ${typeName}
      AND e.enumlabel = ${value}
    LIMIT 1
  `;
  return rows.length > 0;
}

async function getIndex(indexName) {
  const rows = await sql`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = ${indexName}
    LIMIT 1
  `;
  return rows[0] || null;
}

async function getForeignKey(table, column) {
  const rows = await sql`
    SELECT
      c.conname,
      c.confrelid::regclass::text as ref_table,
      a.attname as column_name
    FROM pg_constraint c
    JOIN pg_class rel ON rel.oid = c.conrelid
    JOIN unnest(c.conkey) WITH ORDINALITY AS ck(attnum, ord) ON true
    JOIN pg_attribute a ON a.attrelid = rel.oid AND a.attnum = ck.attnum
    WHERE c.contype = 'f'
      AND rel.relname = ${table}
      AND a.attname = ${column}
    LIMIT 1
  `;
  return rows[0] || null;
}

const columnChecks = [
  ["jobs.location", "jobs", "location", { nullable: true }],
  ["jobs.requested_date", "jobs", "requested_date", { nullable: true }],
  ["jobs.rejection_reason", "jobs", "rejection_reason", { nullable: true }],
  ["jobs.completion_rejection_reason", "jobs", "completion_rejection_reason", { nullable: true }],
  ["worker_profiles.verification_reason", "worker_profiles", "verification_reason", { nullable: true }],
  ["worker_profiles.verified_by", "worker_profiles", "verified_by", { nullable: true }],
  ["worker_profiles.verified_at", "worker_profiles", "verified_at", { nullable: true }],
  ["contracts.terms_status", "contracts", "terms_status", { nullable: false, default: "'draft'::character varying" }],
  ["contracts.terms_submitted_at", "contracts", "terms_submitted_at", { nullable: true }],
  ["contracts.terms_submitted_by", "contracts", "terms_submitted_by", { nullable: true }],
  ["contracts.terms_accepted_at", "contracts", "terms_accepted_at", { nullable: true }],
  ["contracts.terms_accepted_by", "contracts", "terms_accepted_by", { nullable: true }],
  ["contracts.terms_rejected_at", "contracts", "terms_rejected_at", { nullable: true }],
  ["contracts.terms_rejected_by", "contracts", "terms_rejected_by", { nullable: true }],
  ["contracts.terms_rejection_reason", "contracts", "terms_rejection_reason", { nullable: true }],
  ["payments.chapa_reference", "payments", "chapa_reference", { nullable: true }],
];

for (const [label, table, column, expected] of columnChecks) {
  const meta = await getColumn(table, column);
  if (!meta) {
    report(label, false);
    continue;
  }

  const nullableMatches = expected.nullable ? meta.is_nullable === "YES" : meta.is_nullable === "NO";
  const defaultMatches = expected.default ? String(meta.column_default || "") === expected.default : true;

  if (!nullableMatches || !defaultMatches) {
    report(label, false, "warning");
  } else {
    report(label, true);
  }
}

for (const value of ["completion_requested", "payment_pending", "paid", "closed"]) {
  report(`job_status:${value}`, await hasEnumValue("job_status", value));
}

const indexChecks = [
  ["job_client_idx", "jobs", false],
  ["job_worker_idx", "jobs", false],
  ["rating_job_idx", "ratings", false],
  ["payment_job_idx", "payments", false],
  ["payment_status_idx", "payments", false],
  ["contract_job_unique_idx", "contracts", true],
  ["contract_signature_contract_user_unique_idx", "contract_signatures", true],
  ["rating_job_rater_rated_unique_idx", "ratings", true],
  ["payment_chapa_ref_unique_idx", "payments", true],
  ["payment_released_job_unique_idx", "payments", true],
];

for (const [indexName, _table, unique] of indexChecks) {
  const index = await getIndex(indexName);
  if (!index) {
    report(indexName, false);
    continue;
  }

  const isUnique = String(index.indexdef || "").toUpperCase().startsWith("CREATE UNIQUE INDEX");
  report(indexName, unique ? isUnique : true, unique ? "critical" : "warning");
}

report("contracts.job_id foreign key", Boolean(await getForeignKey("contracts", "job_id")));
report("contract_signatures.contract_id foreign key", Boolean(await getForeignKey("contract_signatures", "contract_id")));
report("contract_signatures.user_id foreign key", Boolean(await getForeignKey("contract_signatures", "user_id")));
report("ratings.job_id foreign key", Boolean(await getForeignKey("ratings", "job_id")));
report("payments.job_id foreign key", Boolean(await getForeignKey("payments", "job_id")));
report("worker_profiles.verified_by foreign key", Boolean(await getForeignKey("worker_profiles", "verified_by")));

process.exit(failed ? 1 : 0);
