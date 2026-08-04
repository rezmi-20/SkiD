import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  assertEnvironment,
  buildIdentityPlan,
  deriveCurrentStatus,
  maskEmail,
  parseArgs,
  validateStateForRole,
} from "./reset-identity-lifecycle.mjs";

const root = process.cwd();
const script = fs.readFileSync(path.join(root, "scripts/reset-identity-lifecycle.mjs"), "utf8");
const contractSetup = fs.readFileSync(path.join(root, "lib/actions/contract-setup.ts"), "utf8");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const profileColumns = new Set([
  "is_verified",
  "verification_status",
  "verification_reason",
  "verified_by",
  "verified_at",
  "fayda_doc_url",
  "fin_encrypted",
  "fin_encryption_key_id",
  "fin_fingerprint",
  "fin_last4",
  "verification_provider",
  "verification_reference",
]);

function pass(name) {
  console.log(`PASS ${name}`);
}

assert.throws(() => assertEnvironment({ NODE_ENV: "production", ALLOW_DEV_IDENTITY_RESET: "true" }), /production/);
pass("production execution is rejected");

assert.throws(() => assertEnvironment({ NODE_ENV: "development" }), /ALLOW_DEV_IDENTITY_RESET=true/);
pass("missing allow flag is rejected");

assert.throws(() => validateStateForRole("worker", "not_started"), /not valid for worker/);
assert.throws(() => validateStateForRole("admin", "approved"), /supports only client and worker/);
pass("role-incompatible state is rejected");

assert.throws(() => parseArgs(["--state", "pending"]), /email/);
assert.throws(() => parseArgs(["--email", "test@example.com"]), /state/);
assert.equal(parseArgs(["--email", "test@example.com", "--state", "pending"]).apply, false);
assert.equal(parseArgs(["--email", "test@example.com", "--state", "pending", "--apply"]).apply, true);
pass("dry-run is default and apply is explicit");

assert.equal(maskEmail("test@example.com"), "te***t@example.com");
assert.match(script, /No account found for \$\{maskEmail\(options\.email\)\}/);
pass("unknown email path is safe and masked");

const pendingWorker = buildIdentityPlan({ role: "worker", requestedState: "pending", profileColumns });
assert.equal(pendingWorker.userAssignments.is_suspended, false);
assert.equal(pendingWorker.profileAssignments.is_verified, false);
assert.equal(pendingWorker.profileAssignments.verification_status, "pending");
assert.equal(pendingWorker.discoverableWorker, false);
pass("pending worker becomes undiscoverable");

const approvedWorker = buildIdentityPlan({ role: "worker", requestedState: "approved", profileColumns });
assert.equal(approvedWorker.userAssignments.is_suspended, false);
assert.equal(approvedWorker.profileAssignments.is_verified, true);
assert.equal(approvedWorker.profileAssignments.verification_status, "approved");
assert.equal(approvedWorker.discoverableWorker, true);
pass("approved worker becomes discoverable");

const suspendedWorker = buildIdentityPlan({ role: "worker", requestedState: "suspended", profileColumns });
assert.equal(suspendedWorker.userAssignments.is_suspended, true);
assert.equal(suspendedWorker.profileAssignments.is_verified, false);
assert.equal(suspendedWorker.profileAssignments.verification_status, "suspended");
pass("suspended worker is inactive and marked suspended consistently");

const rejectedClient = buildIdentityPlan({ role: "client", requestedState: "rejected", profileColumns });
assert.equal(rejectedClient.userAssignments.is_suspended, false);
assert.equal(rejectedClient.profileAssignments.is_verified, false);
assert.equal(rejectedClient.profileAssignments.verification_status, "rejected");
pass("client rejected state updates status fields consistently");

const notStartedClient = buildIdentityPlan({ role: "client", requestedState: "not_started", profileColumns });
assert.equal(notStartedClient.profileAssignments.is_verified, false);
assert.equal(notStartedClient.profileAssignments.verification_status, "incomplete");
assert.equal(deriveCurrentStatus("client", { is_suspended: false }, notStartedClient.profileAssignments), "not_started");
assert.match(contractSetup, /getClientIdentityVerificationStatus/);
assert.match(contractSetup, /if \(!identity\.verified\)/);
pass("not_started client cannot use contract PIN because identity remains unverified");

const approvedClient = buildIdentityPlan({ role: "client", requestedState: "approved", profileColumns });
assert.equal(approvedClient.profileAssignments.is_verified, true);
assert.equal(approvedClient.profileAssignments.verification_status, "approved");
pass("approved client can pass identity prerequisite for contract PIN");

const clearSubmission = buildIdentityPlan({
  role: "client",
  requestedState: "not_started",
  profileColumns,
  clearVerificationSubmission: true,
});
assert.equal(clearSubmission.profileAssignments.fin_encrypted, null);
assert.equal(clearSubmission.profileAssignments.fin_fingerprint, null);
assert.equal(clearSubmission.profileAssignments.fayda_doc_url, null);
pass("clear-verification-submission detaches sensitive submission fields");

const consoleLines = script
  .split(/\r?\n/)
  .filter((line) => line.includes("console.log") || line.includes("console.error"));
assert.ok(consoleLines.every((line) => !/fin_|fayda|document|cookie|password|fingerprint/i.test(line)));
pass("reset never prints FIN, document, cookie, or password data");

assert.match(script, /development_test_reset/);
assert.doesNotMatch(script, /toggleWorkerVerification/);
assert.doesNotMatch(script, /updateClientVerificationStatus/);
pass("audit action is clearly distinguished from administrator decisions");

assert.equal(packageJson.scripts?.["dev:reset-identity"], "node scripts/reset-identity-lifecycle.mjs");
pass("package script is wired");

console.log("\nAll development identity reset checks passed.");
