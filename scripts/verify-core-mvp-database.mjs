import { resolve } from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: resolve(process.cwd(), ".env.local") });

if (!process.env.DATABASE_URL) {
  console.error("MISSING database connection environment");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const checks = [
  ...[
    ["jobs.location", "jobs", "location"],
    ["jobs.requested_date", "jobs", "requested_date"],
    ["jobs.rejection_reason", "jobs", "rejection_reason"],
    ["jobs.completion_rejection_reason", "jobs", "completion_rejection_reason"],
    ["worker_profiles.verification_reason", "worker_profiles", "verification_reason"],
    ["worker_profiles.verified_by", "worker_profiles", "verified_by"],
    ["worker_profiles.verified_at", "worker_profiles", "verified_at"],
    ["contracts.terms_status", "contracts", "terms_status"],
    ["contracts.terms_submitted_at", "contracts", "terms_submitted_at"],
    ["contracts.terms_submitted_by", "contracts", "terms_submitted_by"],
    ["contracts.terms_accepted_at", "contracts", "terms_accepted_at"],
    ["contracts.terms_accepted_by", "contracts", "terms_accepted_by"],
    ["contracts.terms_rejected_at", "contracts", "terms_rejected_at"],
    ["contracts.terms_rejected_by", "contracts", "terms_rejected_by"],
    ["contracts.terms_rejection_reason", "contracts", "terms_rejection_reason"],
    ["payments.chapa_reference", "payments", "chapa_reference"],
  ].map(([label, table, column]) => ({ kind: "column", label, table, column })),
  ...[
    ["job_status:completion_requested", "job_status", "completion_requested"],
    ["job_status:payment_pending", "job_status", "payment_pending"],
    ["job_status:paid", "job_status", "paid"],
    ["job_status:closed", "job_status", "closed"],
  ].map(([label, type, value]) => ({ kind: "enum", label, type, value })),
  ...[
    ["job_client_idx", "jobs", "job_client_idx"],
    ["job_worker_idx", "jobs", "job_worker_idx"],
    ["rating_job_idx", "ratings", "rating_job_idx"],
    ["payment_job_idx", "payments", "payment_job_idx"],
    ["payment_status_idx", "payments", "payment_status_idx"],
  ].map(([label, table, index]) => ({ kind: "index", label, table, index })),
  ...[
    ["contract_job_unique_idx", "contracts", "contract_job_unique_idx"],
    ["contract_signature_contract_user_unique_idx", "contract_signatures", "contract_signature_contract_user_unique_idx"],
    ["rating_job_rater_rated_unique_idx", "ratings", "rating_job_rater_rated_unique_idx"],
    ["payment_chapa_ref_unique_idx", "payments", "payment_chapa_ref_unique_idx"],
    ["payment_released_job_unique_idx", "payments", "payment_released_job_unique_idx"],
  ].map(([label, table, index]) => ({ kind: "unique", label, table, index })),
];

async function existsColumn(table, column) {
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

async function existsEnumValue(type, value) {
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

async function existsIndex(index) {
  const rows = await sql`
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = ${index}
    LIMIT 1
  `;
  return rows.length > 0;
}

async function isUniqueIndex(index) {
  const rows = await sql`
    SELECT indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = ${index}
    LIMIT 1
  `;
  return rows.length > 0 && String(rows[0].indexdef || "").toUpperCase().startsWith("CREATE UNIQUE INDEX");
}

let failed = false;

for (const check of checks) {
  let ok = false;
  if (check.kind === "column") {
    ok = await existsColumn(check.table, check.column);
  } else if (check.kind === "enum") {
    ok = await existsEnumValue(check.type, check.value);
  } else if (check.kind === "index") {
    ok = await existsIndex(check.index);
  } else if (check.kind === "unique") {
    ok = await existsIndex(check.index);
    if (ok) {
      ok = await isUniqueIndex(check.index);
    }
  }

  console.log(`${ok ? "PASS" : "MISSING"} ${check.label}`);
  if (!ok) failed = true;
}

process.exit(failed ? 1 : 0);
