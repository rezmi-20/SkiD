import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");

const actions = read("lib/actions/disputes.ts");
const constants = read("lib/dispute-constants.ts");
const migration = read("scripts/migrate-dispute-workflow.mjs");
const schema = read("lib/schema.ts");
const adminPage = read("app/(admin)/admin/disputes/[id]/page.tsx");
const adminTabs = read("components/admin/AdminDisputeCaseTabs.tsx");
const adminDisputeUi = `${adminPage}\n${adminTabs}`;
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
check("resolution does not directly mutate payment status", !actions.match(/resolveDispute[\s\S]*UPDATE payments SET status =/));
check("resolution performs controlled post-dispute job transition", actions.includes("resolvePostDisputeJobStatus") && actions.includes("post_resolution_job_transitioned") && actions.includes("assertAllowedJobTransition"));
check("worker payment authorized only enables normal payment path", actions.includes('outcome === "worker_payment_authorized"') && actions.includes('nextStatus: "completed"') && !actions.match(/resolveDispute[\s\S]*INSERT INTO payments/));
check("resolved by agreement requires explicit operational outcome", actions.includes("Resolved by agreement requires an explicit operational outcome") && adminDisputeUi.includes("Select post-resolution job outcome"));
check("financial actions deferred", actions.includes("financialActionRequired") && actions.includes("Phase 5D.5") === false);
check("append-only events implemented", actions.includes("recordDisputeEvent") && schema.includes("disputeEvents"));
check("evidence records are protected", schema.includes("disputeEvidence") && evidenceRoute.includes("Cache-Control") && evidenceRoute.includes("no-store"));
check("raw evidence URL not exposed in user/admin details", userDetails.includes("/api/disputes/") && adminDisputeUi.includes("/api/disputes/") && !userDetails.includes("file_url"));
check("admin queue supports required queues", adminQueue.includes("Awaiting Client") && adminQueue.includes("Evidence Review") && adminQueue.includes("Escalated"));
check("claim/reassign exists", actions.includes("claimDispute") && actions.includes("Reassignment requires a reason"));
check("request client/worker response exists", actions.includes("requestDisputeResponse") && actions.includes("awaiting_client_response") && actions.includes("awaiting_worker_response"));
check("central assigned-admin guard exists", actions.includes("ensureAssignedAdminCanOperateDispute") && actions.includes("This dispute must be claimed before operational actions are allowed."));
check("information requests require exact assignment", actions.includes("requestDisputeResponse") && actions.match(/requestDisputeResponse[\s\S]*ensureAssignedAdminCanOperateDispute[\s\S]*assigned_admin_id = \$\{admin\.id\}/));
check("internal notes require exact assignment", actions.includes("addInternalDisputeNote") && actions.match(/addInternalDisputeNote[\s\S]*ensureAssignedAdminCanOperateDispute[\s\S]*assigned_admin_id = \$\{admin\.id\}/));
check("resolution requires exact assignment", actions.includes("resolveDispute") && actions.match(/resolveDispute[\s\S]*ensureAssignedAdminCanOperateDispute[\s\S]*assigned_admin_id = \$\{admin\.id\}/));
check("resolution does not write admin employee id into legacy user FK", !actions.match(/^\s*admin_id\s*=\s*\$\{admin\.id\}/m));
check("unassigned cases cannot be operated on", actions.includes("This dispute must be claimed before operational actions are allowed."));
check("conflicted admins remain blocked", actions.includes("You declared a conflict on this dispute.") && adminDisputeUi.includes("cannot reclaim it or perform operational actions"));
check("terminal disputes reject operational mutations", actions.includes("DISPUTE_TERMINAL_STATUSES") && actions.includes("This dispute is terminal and read-only.") && actions.includes("isTerminalDisputeStatus(dispute.status)"));
check("terminal operational controls are absent", adminDisputeUi.includes("Terminal Read-Only State") && adminDisputeUi.includes("Operational dispute, assignment, note, resolution, and routine financial controls are locked") && adminDisputeUi.includes("!isTerminal && canResolve"));
check("same-owner claim is idempotent", actions.includes("dispute.assigned_admin_id === admin.id") && actions.includes("noop: true"));
check("assigned open non-conflicted admin can declare conflict", adminPage.includes("canDeclareConflict") && adminPage.includes("isAssignedToCurrentAdmin && !isTerminal") && adminDisputeUi.includes("canClaim || canDeclareConflict") && adminDisputeUi.includes("Declare Conflict"));
check("unassigned non-conflicted admins keep claim eligibility", adminPage.includes("!isAssignedToCurrentAdmin") && adminDisputeUi.includes("Claim / Reassign") && adminDisputeUi.includes("Assignment Required"));
check("terminal disputes hide declare conflict", adminPage.includes("canDeclareConflict") && adminPage.includes("!isTerminal") && adminDisputeUi.includes("!isTerminal && !isConflicted && (canClaim || canDeclareConflict)"));
check("conflict declaration is idempotent and audited once", actions.includes("conflictIds.includes(admin.id)") && actions.includes("noop: true") && actions.includes('eventType: "conflict_declared"'));
check("wrong party response denied", actions.includes("This response request is not assigned to you"));
check("response submission event is idempotent", actions.includes("existing_event.metadata->>'responseId'") && actions.includes("event_type = 'response_submitted'"));
check("internal notes are admin-only and not in user details", actions.includes("addInternalDisputeNote") && !userDetails.includes("dispute_admin_notes"));
check("conflict declaration exists", actions.includes("declareDisputeConflict") && actions.includes("conflict_admin_ids"));
check("super admin read-only preserved", adminPage.includes("Read-only oversight mode") && actions.includes('admin.role !== "dispute_payment_admin"'));
check("notification type used", actions.includes("dispute_update"));
check("unsupported evidence rejected", actions.includes("ALLOWED_EVIDENCE_MIME_TYPES") && actions.includes("MAX_EVIDENCE_BYTES"));

process.exit(failed ? 1 : 0);
