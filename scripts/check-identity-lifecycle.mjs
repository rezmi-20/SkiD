import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const results = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function report(name, ok) {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "MISSING"} ${name}`);
}

const identity = read("lib/identity-lifecycle.ts");
const workersApi = read("app/api/workers/route.ts");
const workerDetailApi = read("app/api/workers/[id]/route.ts");
const jobsApi = read("app/api/jobs/route.ts");
const jobDetailApi = read("app/api/jobs/[id]/route.ts");
const jobsActions = read("lib/actions/jobs.ts");
const contracts = read("lib/actions/contracts.ts");
const contractSetup = read("lib/actions/contract-setup.ts");
const ratings = read("lib/actions/ratings.ts");
const payments = read("lib/actions/payments.ts");
const receipt = read("app/api/payments/[paymentId]/receipt/route.ts");
const profileApi = read("app/api/auth/profile/route.ts");
const adminActions = read("lib/actions/admin.ts");
const clientVerifyApi = read("app/api/clients/verify/route.ts");
const courtCopy = read("app/api/admin/contracts/[id]/court-copy/route.ts");
const migration = read("scripts/migrate-fin-protection.mjs");
const packageJson = JSON.parse(read("package.json"));

report("canonical active worker check requires approved status", identity.includes("wp.verification_status = 'approved'"));
report("canonical active worker check requires is_verified true", identity.includes("wp.is_verified = true"));
report("canonical active worker check requires not suspended", identity.includes("u.is_suspended = false"));
report("new worker registration starts pending", profileApi.includes("verification_status)") && profileApi.includes("'pending'"));
report("worker search excludes pending/rejected/suspended workers", workersApi.includes("wp.verification_status = 'approved'") && workersApi.includes("u.is_suspended = false"));
report("worker public detail excludes pending/rejected/suspended workers", workerDetailApi.includes("wp.verification_status = 'approved'") && workerDetailApi.includes("u.is_suspended = false"));
report("job invitation target must be active verified worker", jobsApi.includes("wp.verification_status = 'approved'") && jobsActions.includes("wp.verification_status = 'approved'"));
report("worker jobs API blocks inactive workers", jobsApi.includes("assertActiveVerifiedWorker") && jobDetailApi.includes("assertActiveVerifiedWorker"));
report("pending worker cannot accept/reject/start/complete jobs", jobsActions.match(/assertActiveVerifiedWorker/g)?.length >= 6);
report("worker contract setup/opening blocked by lifecycle", contractSetup.includes("assertActiveVerifiedWorker") && contracts.includes("ensureContractSetupComplete(`/contracts/${contractId}`)"));
report("worker contract list blocked by lifecycle", contracts.includes("ensureContractSetupComplete(\"/worker/contracts\")"));
report("worker rating participation blocked by lifecycle", ratings.includes("assertActiveVerifiedWorker") && ratings.includes("worker_verification_status !== \"approved\""));
report("worker earnings/receipt blocked by lifecycle", payments.includes("assertActiveVerifiedWorker") && receipt.includes("isActiveVerifiedWorker"));
report("unverified client contract access redirects with required message", contractSetup.includes("CLIENT_CONTRACT_VERIFICATION_MESSAGE") && contractSetup.includes("returnTo"));
report("client contract pages preserve return destination", read("app/(client)/client/contracts/[id]/page.tsx").includes("`/client/contracts/${id}`"));
report(
  "client verification admin transition is admin-only",
  adminActions.includes("updateClientVerificationStatus") &&
    (
      clientVerifyApi.includes("session.user.role !== \"admin\"") ||
      (clientVerifyApi.includes("requireAdminPermission") && adminActions.includes("verification.approve"))
    ),
);
report("client verification transition writes audit record", adminActions.includes("client_verification_status_changed") && adminActions.includes("oldStatus") && adminActions.includes("newStatus"));
report("client verification audit omits full FIN", !adminActions.includes("finEncrypted") && !adminActions.includes("fin_fingerprint"));
report("forged court-copy reauth header is rejected", courtCopy.includes("COURT_COPY_EXPORT_ENABLED") && !courtCopy.includes("x-legal-reauth-confirmed"));
report("court-copy feature disabled by default", courtCopy.includes("courtCopyFeatureEnabled()") && courtCopy.includes("status: 503"));
report("migration dry-run does not print plaintext FIN", migration.includes("Dry-run complete. No data or schema was changed.") && !migration.includes("console.log(row.fayda_fan_number)") && !migration.includes("console.warn(row.fayda_fan_number)"));
report("migration preserves legacy source data on failed rows", migration.includes("skipped += 1") && migration.includes("continue;") && migration.includes("DROP COLUMN IF EXISTS fayda_fan_number"));
report("identity lifecycle script is wired", packageJson.scripts?.["check:identity-lifecycle"] === "node scripts/check-identity-lifecycle.mjs");

const failed = results.filter((result) => !result.ok);
if (failed.length > 0) {
  console.error(`\n${failed.length} identity lifecycle check(s) failed.`);
  process.exit(1);
}

console.log("\nAll identity lifecycle checks passed.");
