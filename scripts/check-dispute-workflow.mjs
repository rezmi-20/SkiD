import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");

const actions = read("lib/actions/disputes.ts");
const constants = read("lib/dispute-constants.ts");
const migration = read("scripts/migrate-dispute-workflow.mjs");
const schema = read("lib/schema.ts");
const adminPage = read("app/(admin)/admin/disputes/[id]/page.tsx");
const userDetails = read("components/disputes/UserDisputeDetails.tsx");
const evidenceRoute = read("app/api/disputes/[disputeId]/evidence/[evidenceId]/route.ts");
const adminQueue = read("components/AdminDisputesContent.tsx");
const packageJson = read("package.json");

let failed = false;
function check(label, ok) {
  console.log(`${ok ? "PASS" : "MISSING"} ${label}`);
  if (!ok) failed = true;
}

check("npm script wired", packageJson.includes('"check:dispute-workflow"'));
check("migration is additive", migration.includes("ADD COLUMN IF NOT EXISTS") && migration.includes("CREATE TABLE IF NOT EXISTS dispute_events"));
check("controlled categories exist", constants.includes("DISPUTE_CATEGORIES") && constants.includes("work_not_completed") && constants.includes("payment_issue"));
check("controlled requested resolutions exist", constants.includes("DISPUTE_REQUESTED_RESOLUTIONS") && constants.includes("refund_review"));
check("allowed dispute job states centralized", constants.includes("DISPUTE_ALLOWED_JOB_STATUSES") && !constants.includes('"pending",\n  "accepted"'));
check("participant-only dispute creation", actions.includes("Only the job client or worker can open this dispute"));
check("duplicate active dispute protection", actions.includes("DISPUTE_ACTIVE_STATUSES") && actions.includes("dispute_active_job_unique_idx"));
check("creation snapshot excludes sensitive fields", actions.includes("creation_snapshot") && !actions.includes("fin_encrypted") && !actions.includes("password_hash"));
check("workflow freeze marker used", actions.includes("workflow_frozen") && actions.includes("UPDATE jobs SET status = 'disputed'"));
check("resolution does not directly mutate job/payment status", !actions.match(/resolveDispute[\s\S]*UPDATE jobs SET status =/) && !actions.match(/resolveDispute[\s\S]*UPDATE payments SET status =/));
check("financial actions deferred", actions.includes("financialActionRequired") && actions.includes("Phase 5D.5") === false);
check("append-only events implemented", actions.includes("recordDisputeEvent") && schema.includes("disputeEvents"));
check("evidence records are protected", schema.includes("disputeEvidence") && evidenceRoute.includes("Cache-Control") && evidenceRoute.includes("no-store"));
check("raw evidence URL not exposed in user/admin details", userDetails.includes("/api/disputes/") && adminPage.includes("/api/disputes/") && !userDetails.includes("file_url"));
check("admin queue supports required queues", adminQueue.includes("Awaiting Client") && adminQueue.includes("Evidence Review") && adminQueue.includes("Escalated"));
check("claim/reassign exists", actions.includes("claimDispute") && actions.includes("Reassignment requires a reason"));
check("request client/worker response exists", actions.includes("requestDisputeResponse") && actions.includes("awaiting_client_response") && actions.includes("awaiting_worker_response"));
check("wrong party response denied", actions.includes("This response request is not assigned to you"));
check("internal notes are admin-only and not in user details", actions.includes("addInternalDisputeNote") && !userDetails.includes("dispute_admin_notes"));
check("conflict declaration exists", actions.includes("declareDisputeConflict") && actions.includes("conflict_admin_ids"));
check("super admin read-only preserved", adminPage.includes("Read-only oversight mode") && actions.includes('admin.role !== "dispute_payment_admin"'));
check("notification type used", actions.includes("dispute_update"));
check("unsupported evidence rejected", actions.includes("ALLOWED_EVIDENCE_MIME_TYPES") && actions.includes("MAX_EVIDENCE_BYTES"));

process.exit(failed ? 1 : 0);
