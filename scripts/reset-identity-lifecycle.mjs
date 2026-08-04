#!/usr/bin/env node

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { pathToFileURL } from "node:url";

dotenv.config({ path: ".env.local", quiet: true });

export const WORKER_STATES = new Set(["pending", "approved", "rejected", "suspended", "revoked"]);
export const CLIENT_STATES = new Set(["not_started", "pending", "approved", "rejected", "suspended", "revoked"]);

const PROFILE_TABLE_BY_ROLE = {
  worker: "worker_profiles",
  client: "client_profiles",
};

const PROFILE_COLUMNS = {
  is_verified: true,
  verification_status: true,
  verification_reason: true,
  verified_by: true,
  verified_at: true,
  fayda_doc_url: true,
  fin_encrypted: true,
  fin_encryption_key_id: true,
  fin_fingerprint: true,
  fin_last4: true,
  verification_provider: true,
  verification_reference: true,
};

const SENSITIVE_PROFILE_COLUMNS = new Set([
  "fayda_doc_url",
  "fin_encrypted",
  "fin_encryption_key_id",
  "fin_fingerprint",
  "fin_last4",
]);

function fail(message) {
  throw new Error(message);
}

export function maskEmail(email) {
  const [name, domain] = String(email || "").split("@");
  if (!name || !domain) return "(invalid email)";
  const visible = name.length <= 2 ? `${name[0] ?? ""}*` : `${name.slice(0, 2)}***${name.slice(-1)}`;
  return `${visible}@${domain}`;
}

export function parseArgs(argv) {
  const args = {
    apply: false,
    clearContracts: false,
    clearPin: false,
    clearVerificationSubmission: false,
    clearRatings: false,
    clearPayments: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") args.apply = true;
    else if (arg === "--clear-contracts") args.clearContracts = true;
    else if (arg === "--clear-pin") args.clearPin = true;
    else if (arg === "--clear-verification-submission") args.clearVerificationSubmission = true;
    else if (arg === "--clear-ratings") args.clearRatings = true;
    else if (arg === "--clear-payments") args.clearPayments = true;
    else if (arg === "--email") args.email = argv[++i];
    else if (arg === "--state") args.state = argv[++i];
    else fail(`Unknown argument: ${arg}`);
  }

  if (!args.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(args.email)) {
    fail("An exact email address is required with --email.");
  }

  if (!args.state) {
    fail("A requested identity state is required with --state.");
  }

  return args;
}

export function assertEnvironment(env = process.env) {
  if (env.NODE_ENV === "production") {
    fail("Refusing to run identity reset in production.");
  }

  if (env.ALLOW_DEV_IDENTITY_RESET !== "true") {
    fail("Refusing to run. Set ALLOW_DEV_IDENTITY_RESET=true for local development identity resets.");
  }
}

export function validateStateForRole(role, state) {
  if (role === "worker" && !WORKER_STATES.has(state)) {
    fail(`State "${state}" is not valid for worker accounts.`);
  }

  if (role === "client" && !CLIENT_STATES.has(state)) {
    fail(`State "${state}" is not valid for client accounts.`);
  }

  if (role !== "worker" && role !== "client") {
    fail(`Identity reset supports only client and worker accounts, not "${role}".`);
  }
}

export function normalizeStoredStatus(role, requestedState) {
  if (role === "client" && requestedState === "not_started") return "incomplete";
  return requestedState;
}

export function deriveCurrentStatus(role, user, profile = {}) {
  if (user?.is_suspended) return "suspended";
  if (profile.verification_status) {
    return role === "client" && profile.verification_status === "incomplete"
      ? "not_started"
      : profile.verification_status;
  }
  return profile.is_verified ? "approved" : role === "client" ? "not_started" : "pending";
}

export function buildIdentityPlan({ role, requestedState, profileColumns, clearVerificationSubmission = false }) {
  validateStateForRole(role, requestedState);

  const storedStatus = normalizeStoredStatus(role, requestedState);
  const verified = requestedState === "approved";
  const userSuspended = requestedState === "suspended";
  const profileAssignments = {};

  if (profileColumns.has("is_verified")) profileAssignments.is_verified = verified;
  if (profileColumns.has("verification_status")) profileAssignments.verification_status = storedStatus;
  if (profileColumns.has("verification_reason")) {
    profileAssignments.verification_reason =
      requestedState === "rejected" ? "Development test reset: rejected state." : null;
  }
  if (profileColumns.has("verified_by")) profileAssignments.verified_by = null;
  if (profileColumns.has("verified_at")) profileAssignments.verified_at = verified ? "NOW()" : null;

  if (clearVerificationSubmission) {
    for (const column of SENSITIVE_PROFILE_COLUMNS) {
      if (profileColumns.has(column)) profileAssignments[column] = null;
    }
    if (profileColumns.has("verification_provider")) profileAssignments.verification_provider = null;
    if (profileColumns.has("verification_reference")) profileAssignments.verification_reference = null;
  }

  return {
    userAssignments: { is_suspended: userSuspended },
    profileAssignments,
    storedStatus,
    verified,
    discoverableWorker: role === "worker" && verified && !userSuspended,
  };
}

function literalSql(value) {
  if (value === null) return "NULL";
  if (value === true) return "TRUE";
  if (value === false) return "FALSE";
  if (value === "NOW()") return "NOW()";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function assignmentSql(assignments) {
  return Object.entries(assignments)
    .map(([column, value]) => `"${column}" = ${literalSql(value)}`)
    .join(", ");
}

function safePlannedChanges(plan, options) {
  const changes = [
    `users.is_suspended -> ${plan.userAssignments.is_suspended}`,
    `profile.is_verified -> ${plan.verified}`,
    `profile.verification_status -> ${plan.storedStatus}`,
  ];

  if (options.clearVerificationSubmission) changes.push("verification submission fields -> cleared");
  if (options.clearPin) changes.push("contract PIN setup -> deleted");
  if (options.clearContracts) changes.push("contracts involving this user -> deleted");
  if (options.clearRatings) changes.push("ratings involving this user -> deleted");
  if (options.clearPayments) changes.push("payments for this user's jobs -> deleted");

  return changes;
}

async function getColumns(sql, tableName) {
  const rows = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${tableName}
  `;
  return new Set(rows.map((row) => row.column_name));
}

async function getOptionalProfile(sql, role, userId, columns) {
  const tableName = PROFILE_TABLE_BY_ROLE[role];
  const selected = ["user_id", ...Object.keys(PROFILE_COLUMNS).filter((column) => columns.has(column))];
  const safeColumns = selected.map((column) => `"${column}"`).join(", ");
  const rows = await sql.query(`SELECT ${safeColumns} FROM ${tableName} WHERE user_id = $1 LIMIT 1`, [userId]);
  return rows[0] ?? {};
}

function printSafeSummary({ user, maskedEmail, currentStatus, requestedStatus, apply, plannedChanges }) {
  console.log("Development identity reset summary");
  console.log(`Mode: ${apply ? "APPLY" : "DRY_RUN"}`);
  console.log(`User ID: ${user.id}`);
  console.log(`Email: ${maskedEmail}`);
  console.log(`Role: ${user.role}`);
  console.log(`Current status: ${currentStatus}`);
  console.log(`Requested status: ${requestedStatus}`);
  console.log("Planned changes:");
  for (const change of plannedChanges) {
    console.log(`- ${change}`);
  }
  if (!apply) console.log("Dry-run only. Pass --apply to change data.");
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  assertEnvironment();

  if (!process.env.DATABASE_URL) {
    fail("DATABASE_URL is required.");
  }

  const sql = neon(process.env.DATABASE_URL);
  const users = await sql`
    SELECT id, email, role, is_suspended
    FROM users
    WHERE email = ${options.email}
    LIMIT 1
  `;

  if (users.length === 0) {
    fail(`No account found for ${maskEmail(options.email)}.`);
  }

  const user = users[0];
  validateStateForRole(user.role, options.state);

  const profileTable = PROFILE_TABLE_BY_ROLE[user.role];
  const profileColumns = await getColumns(sql, profileTable);
  const profile = await getOptionalProfile(sql, user.role, user.id, profileColumns);
  const currentStatus = deriveCurrentStatus(user.role, user, profile);
  const plan = buildIdentityPlan({
    role: user.role,
    requestedState: options.state,
    profileColumns,
    clearVerificationSubmission: options.clearVerificationSubmission,
  });
  const plannedChanges = safePlannedChanges(plan, options);

  printSafeSummary({
    user,
    maskedEmail: maskEmail(user.email),
    currentStatus,
    requestedStatus: options.state,
    apply: options.apply,
    plannedChanges,
  });

  if (!options.apply) return;

  const profileSetSql = assignmentSql(plan.profileAssignments);
  const cleanupQueries = [];

  if (options.clearPayments) {
    cleanupQueries.push((tx) => tx`
      DELETE FROM payments
      WHERE job_id IN (SELECT id FROM jobs WHERE client_id = ${user.id} OR worker_id = ${user.id})
    `);
  }

  if (options.clearRatings) {
    cleanupQueries.push((tx) => tx`
      DELETE FROM ratings
      WHERE rater_id = ${user.id}
         OR rated_id = ${user.id}
         OR job_id IN (SELECT id FROM jobs WHERE client_id = ${user.id} OR worker_id = ${user.id})
    `);
  }

  if (options.clearContracts) {
    cleanupQueries.push((tx) => tx`
      DELETE FROM contract_signatures
      WHERE user_id = ${user.id}
         OR contract_id IN (
           SELECT c.id
           FROM contracts c
           JOIN jobs j ON j.id = c.job_id
           WHERE j.client_id = ${user.id} OR j.worker_id = ${user.id}
         )
    `);
    cleanupQueries.push((tx) => tx`
      DELETE FROM contracts
      WHERE job_id IN (SELECT id FROM jobs WHERE client_id = ${user.id} OR worker_id = ${user.id})
    `);
  }

  if (options.clearPin) {
    cleanupQueries.push((tx) => tx`DELETE FROM contract_setups WHERE user_id = ${user.id}`);
  }

  const results = await sql.transaction((tx) => [
    ...cleanupQueries.map((buildQuery) => buildQuery(tx)),
    tx`UPDATE users SET is_suspended = ${plan.userAssignments.is_suspended} WHERE id = ${user.id}`,
    ...(profileSetSql
      ? [tx`UPDATE ${tx.unsafe(profileTable)} SET ${tx.unsafe(profileSetSql)} WHERE user_id = ${user.id}`]
      : []),
    tx`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (
        ${user.id},
        'development_test_reset',
        ${JSON.stringify({
          role: user.role,
          previousStatus: currentStatus,
          requestedStatus: options.state,
          clearContracts: options.clearContracts,
          clearPin: options.clearPin,
          clearVerificationSubmission: options.clearVerificationSubmission,
          clearRatings: options.clearRatings,
          clearPayments: options.clearPayments,
          timestamp: new Date().toISOString(),
        })}
      )
    `,
  ]);

  console.log(`Applied development_test_reset. Statements executed: ${results.length}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  run().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
