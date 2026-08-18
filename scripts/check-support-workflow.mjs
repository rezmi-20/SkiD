import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");

const packageJson = JSON.parse(read("package.json"));
const actions = read("lib/actions/support.ts");
const constants = read("lib/support-constants.ts");
const schema = read("lib/schema.ts");
const migration = read("scripts/migrate-support-workflow.mjs");
const adminAuth = read("lib/admin-authorization.ts");
const adminQueue = read("app/(admin)/admin/support/page.tsx");
const adminDetails = read("app/(admin)/admin/support/[id]/page.tsx");
const userDetails = read("components/support/UserSupportDetails.tsx");
const attachmentRoute = read("app/api/support/[ticketId]/attachments/[attachmentId]/route.ts");
const notifications = read("lib/actions/notifications.ts");

let failed = false;
function check(label, ok) {
  console.log(`${ok ? "PASS" : "MISSING"} ${label}`);
  if (!ok) failed = true;
}

function roleBlock(role) {
  const start = adminAuth.indexOf(`${role}: [`);
  if (start === -1) return "";
  const next = adminAuth.indexOf("],", start);
  return next === -1 ? adminAuth.slice(start) : adminAuth.slice(start, next);
}

function functionBlock(source, name) {
  const start = source.indexOf(`function ${name}`) === -1 ? source.indexOf(`${name}(`) : source.indexOf(`function ${name}`);
  if (start === -1) return "";
  const next = source.indexOf("\nexport async function ", start + 1);
  return next === -1 ? source.slice(start) : source.slice(start, next);
}

const categories = [
  "account_access",
  "identity_verification",
  "profile_account",
  "job_workflow",
  "contract_help",
  "payment_help",
  "technical_issue",
  "safety_concern",
  "other",
];

const statuses = ["open", "assigned", "awaiting_user", "in_progress", "escalated", "resolved", "closed"];
const priorities = ["low", "normal", "high", "urgent"];
const resolutionTypes = [
  "guidance_provided",
  "issue_resolved",
  "referred_to_verification",
  "referred_to_dispute",
  "technical_issue_recorded",
  "unable_to_resolve",
];

check("npm script wired", packageJson.scripts?.["check:support-workflow"] === "node scripts/check-support-workflow.mjs");
check("migration script wired", packageJson.scripts?.["db:migrate:support-workflow"] === "node scripts/migrate-support-workflow.mjs");
check("support tables exist", ["supportTickets", "supportMessages", "supportEvents", "supportInternalNotes", "supportAttachments"].every((name) => schema.includes(name)));
check("plain SQL migration creates support tables", migration.includes("CREATE TABLE IF NOT EXISTS support_tickets") && migration.includes("CREATE TABLE IF NOT EXISTS support_messages"));
check("category/priority/status constraints exist", migration.includes("support_tickets_category_allowed") && migration.includes("support_tickets_priority_allowed") && migration.includes("support_tickets_status_allowed"));
check("controlled categories centralized", categories.every((value) => constants.includes(`"${value}"`) && migration.includes(`'${value}'`)));
check("controlled statuses centralized", statuses.every((value) => constants.includes(`"${value}"`) && migration.includes(`'${value}'`)));
check("controlled priorities centralized", priorities.every((value) => constants.includes(`"${value}"`) && migration.includes(`'${value}'`)));
check("controlled resolution types centralized", resolutionTypes.every((value) => constants.includes(`"${value}"`) && migration.includes(`'${value}'`)));

check("unauthenticated ticket creation denied", actions.includes("Unauthorized.") && actions.includes("auth()"));
check("only client/worker create tickets", actions.includes('session.user.role === "worker"') && actions.includes('session.user.role === "client"') && actions.includes("Only clients and workers"));
check("arbitrary owner ID impossible", actions.includes("owner_id") && actions.includes("${session.user.id}") && !/ownerId\s*:\s*String\(formData\.get/.test(actions));
check("related job/contract/payment ownership validated", actions.includes("validateRelatedRecords") && actions.includes("Related job does not belong") && actions.includes("Related payment does not belong"));
check("human readable support reference generated", actions.includes("SUP-") && actions.includes("support_ticket_ref_seq") && schema.includes("reference"));
check("duplicate ticket submission guarded", actions.includes("idempotencyKey") && migration.includes("support_tickets_idempotency_unique_idx"));

check("support admin has explicit support permissions", ["support.claim", "support.reply", "support.request_information", "support.note", "support.resolve", "support.escalate"].every((p) => adminAuth.includes(`"${p}"`)));
check("support admin operations role-limited", actions.includes('admin.role !== "user_support_admin"') && actions.includes("Only User Support Admins"));
check("verification admin denied ordinary support operations", !roleBlock("content_verification_admin").includes("support.reply"));
check("dispute admin denied ordinary support operations", !roleBlock("dispute_payment_admin").includes("support.reply"));
check("super admin read-only support oversight", actions.includes("canReadOnly") && actions.includes('admin.role === "super_admin"') && adminDetails.includes("Super admin oversight mode"));
check("public user cannot read another ticket", actions.includes("WHERE t.id = ${ticketId}") && actions.includes("t.owner_id = ${session.user.id}"));

check("claim uses versioned conditional update", actions.includes("assignment_version = ${expectedVersion}") && actions.includes("assignment_version = assignment_version + 1"));
check("simultaneous claim returns conflict", actions.includes("Reload and try again") && actions.includes("status: 409"));
check("reassignment requires reason", actions.includes("Reassignment requires a reason"));

check("owner can reply and unrelated user denied", actions.includes("submitSupportReply") && actions.includes("owner_id = ${session.user.id}"));
check("assigned support admin can reply", actions.includes("adminReplySupportTicket") && actions.includes("ensureAssignedSupportAdmin"));
check("closed ticket rejects stale reply", actions.includes("Closed tickets cannot receive replies") && actions.includes("status <> 'closed'"));
check("internal notes hidden from user details", actions.includes("support_internal_notes") && !functionBlock(actions, "getUserSupportTicketDetails").includes("support_internal_notes"));

check("verification escalation does not approve verification", actions.includes("escalateSupportToVerification") && !/escalateSupportToVerification[\s\S]*(approve|reject|revoke).*verification/i.test(actions));
check("dispute escalation avoids duplicates", actions.includes("escalateSupportToDispute") && actions.includes("linked_dispute_id IS NULL") && actions.includes("SELECT id") && actions.includes("FROM disputes"));
check("support cannot resolve disputes or mutate payment status", !/support[\s\S]*UPDATE payments[\s\S]*status/.test(actions) && !/support[\s\S]*final_decision/.test(actions));
check("safety escalation does not suspend users", actions.includes("escalateSupportSafety") && !/UPDATE users[\s\S]*is_suspended/.test(actions));

check("resolution summary required", actions.includes("Resolution summary is required"));
check("resolution event created", actions.includes('eventType: "resolved"'));
check("reopen policy centralized and conditional", constants.includes("SUPPORT_REOPEN_WINDOW_DAYS") && actions.includes("status = 'resolved'") && actions.includes("resolved_at >= NOW()"));
check("closed ticket cannot normally reopen", actions.includes("Closed tickets require a new support request"));

check("notifications use support update type", notifications.includes("support_update") && actions.includes("notifyUser"));
check("privacy warnings in user/admin UI", userDetails.includes("Do not include passwords") && adminDetails.includes("Never request or record passwords"));
check("event metadata sanitizer blocks secrets", actions.includes("SENSITIVE_KEY") && actions.includes("safeMetadata"));
check("queue avoids attachment payloads", adminQueue.includes("attachment_count") && !adminQueue.includes("file_url") && !adminQueue.includes("final_pdf_base64") && !adminQueue.includes("fayda"));
check("attachment route is protected no-store", attachmentRoute.includes("hasAdminPermission(admin, \"support.read\")") && attachmentRoute.includes("Cache-Control") && attachmentRoute.includes("no-store"));
check("raw attachment URL not exposed in details", !userDetails.includes("file_url") && !adminDetails.includes("file_url"));

check("admin queue has required filters", ["Open", "Assigned", "Awaiting", "In Progress", "Escalated", "Resolved", "Closed", "all"].every((term) => adminQueue.toLowerCase().includes(term.toLowerCase().replace(" ", "_")) || adminQueue.includes(term)));
check("admin queue search fields present", adminQueue.includes("Search reference, name, email, subject") && actions.includes("owner_email") && actions.includes("owner_name"));

process.exit(failed ? 1 : 0);
