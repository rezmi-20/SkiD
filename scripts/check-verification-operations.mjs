import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");

const pkg = JSON.parse(read("package.json"));
const migration = read("drizzle/0018_verification_operations.sql");
const schema = read("lib/schema.ts");
const ops = read("lib/verification-operations.ts");
const adminActions = read("lib/actions/admin.ts");
const profileActions = read("lib/actions/profile.ts");
const registerRoute = read("app/api/auth/profile/route.ts");
const queuePage = read("app/(admin)/admin/verify/page.tsx");
const queueTabs = read("components/admin/VerificationReviewTabs.tsx");
const workerPage = read("app/(admin)/admin/verify/[id]/page.tsx");
const workerContent = read("components/WorkerVerificationContent.tsx");
const clientPage = read("app/(admin)/admin/clients/[id]/verify/page.tsx");
const workerDoc = read("app/api/workers/[id]/verification-document/route.ts");
const clientDoc = read("app/api/clients/[clientId]/verification-document/route.ts");
const workerApi = read("app/api/workers/verify/route.ts");
const clientApi = read("app/api/clients/verify/route.ts");
const community = read("lib/actions/community.ts");
const communityPage = read("app/(admin)/admin/community/page.tsx");
const communityClient = read("components/admin/CommunityModerationClient.tsx");
const smoke = read("tests/browser/smoke.spec.ts");

let failed = false;
function check(label, ok) {
  console.log(`${ok ? "PASS" : "MISSING"} ${label}`);
  if (!ok) failed = true;
}

check("npm script wired", pkg.scripts?.["check:verification-operations"] === "node scripts/check-verification-operations.mjs");
check("migration creates attempts and events", migration.includes("CREATE TABLE IF NOT EXISTS verification_attempts") && migration.includes("CREATE TABLE IF NOT EXISTS verification_events"));
check("events are append-only", migration.includes("verification_events_no_update") && migration.includes("verification_events_no_delete"));
check("attempts have one current index", migration.includes("verification_attempts_current_unique_idx") && migration.includes("WHERE is_current = true"));
check("schema exports attempt and event tables", schema.includes("verificationAttempts") && schema.includes("verificationEvents"));
check("decision path requires exact permissions", ops.includes("verification.approve") && ops.includes("verification.reject") && ops.includes("verification.request_resubmission"));
check("only content verification admin can decide", ops.includes("Only content and verification administrators may make verification decisions") && ops.includes("canActOnVerification"));
check("self review denied", ops.includes("Administrators cannot review their own verification case"));
check("stale attempt denied", ops.includes("This verification attempt is stale") && ops.includes("expectedAttemptId"));
check("duplicate/concurrent decision denied", ops.includes("already been decided") && ops.includes("changed while you were reviewing"));
check("FIN and document required before decision", ops.includes("Current FIN metadata and verification document are required"));
check("history omits full FIN and raw document data", migration.includes("document_fingerprint") && !migration.includes("fin_encrypted") && !migration.includes("fayda_doc_url"));
check("submission attempts recorded for profile and registration", profileActions.includes("recordVerificationSubmission") && registerRoute.includes("recordVerificationSubmission"));
check("admin actions delegate to guarded operations", adminActions.includes("decideVerificationCase") && adminActions.includes("expectedAttemptId"));
check("queue has worker and client filters", queueTabs.includes("Pending queue") && queueTabs.includes("Rejected/resubmitted") && queueTabs.includes("Recently decided"));
check("queue displays masked FIN and no raw document URL", queuePage.includes("maskFinLast4") && !queueTabs.includes("fayda_doc_url"));
check("worker review uses protected document route", workerContent.includes("/api/workers/${worker.user_id}/verification-document") && !workerContent.includes("src={worker.fayda_doc_url}"));
check("client review uses protected document route", clientPage.includes("/api/clients/${client.user_id}/verification-document"));
check("review pages show timeline", workerContent.includes("Case Timeline") && clientPage.includes("Timeline and History"));
check("document routes require admin employee permission", workerDoc.includes("getAdminPrincipal") && workerDoc.includes("verification.read") && clientDoc.includes("getAdminPrincipal") && clientDoc.includes("verification.read"));
check("document routes send no-store headers", workerDoc.includes("Cache-Control") && workerDoc.includes("no-store") && clientDoc.includes("Cache-Control") && clientDoc.includes("no-store"));
check("document APIs record view events", workerDoc.includes("recordVerificationDocumentView") && clientDoc.includes("recordVerificationDocumentView"));
check("decision APIs return conflict status", workerApi.includes("statusCode") && workerApi.includes("result.status") && clientApi.includes("statusCode") && clientApi.includes("result.status"));
check("content moderation requires permission and reason", community.includes('requireAdminPermission("content.moderate")') && community.includes("A moderation reason is required"));
check("content moderation history exists", migration.includes("content_moderation_events") && community.includes("INSERT INTO content_moderation_events"));
check("content moderation UI hides controls without permission", communityPage.includes("canModerate") && communityClient.includes("Read only"));
check("browser coverage added", smoke.includes("super admin verification oversight stays read-only") && smoke.includes("/admin/verify"));

process.exit(failed ? 1 : 0);
