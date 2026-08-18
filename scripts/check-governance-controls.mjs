import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");

const packageJson = JSON.parse(read("package.json"));
const schema = read("lib/schema.ts");
const migration = read("scripts/migrate-governance-controls.mjs");
const governance = read("lib/actions/governance.ts");
const adminAuth = read("lib/admin-authorization.ts");
const sidebar = read("components/admin/Sidebar.tsx");
const auditPage = read("app/(admin)/admin/audit/page.tsx");
const reportsPage = read("app/(admin)/admin/reports/page.tsx");
const appealsPage = read("app/(admin)/admin/appeals/page.tsx");
const appealDetailsPage = read("app/(admin)/admin/appeals/[id]/page.tsx");
const clientAppeals = read("app/(client)/client/appeals/page.tsx");
const workerAppeals = read("app/(worker)/worker/appeals/page.tsx");
const clientAppealDetails = read("app/(client)/client/appeals/[id]/page.tsx");
const workerAppealDetails = read("app/(worker)/worker/appeals/[id]/page.tsx");
const misconductPage = read("app/(admin)/admin/misconduct/page.tsx");
const misconductDetailsPage = read("app/(admin)/admin/misconduct/[id]/page.tsx");
const financialActions = read("lib/actions/dispute-financial-actions.ts");
const supportActions = read("lib/actions/support.ts");
const superAdminActions = read("lib/actions/super-admin.ts");

let failed = false;
function check(label, ok) {
  console.log(`${ok ? "PASS" : "MISSING"} ${label}`);
  if (!ok) failed = true;
}

const operationalPermissions = [
  "verification.review",
  "verification.approve",
  "verification.reject",
  "disputes.resolve",
  "payment_cases.review",
  "support.respond",
  "support.resolve",
];

const superAdminBlock = adminAuth.match(/super_admin:\s*\[([\s\S]*?)\],\s*content_verification_admin:/)?.[1] || "";
const misuseIndicatorBlock = governance.slice(
  governance.indexOf("export async function getMisuseIndicators"),
  governance.indexOf("async function recordMisconductEvent"),
);

check("npm script wired", packageJson.scripts?.["check:governance-controls"] === "node scripts/check-governance-controls.mjs");
check("migration script wired", packageJson.scripts?.["db:migrate:governance-controls"] === "node scripts/migrate-governance-controls.mjs");
check("audit schema has structured attribution fields", ["actorType", "adminRole", "module", "targetType", "targetId", "previousState", "newState", "reason", "relatedReference", "highRisk", "proposedByAdminId", "approvedByAdminId", "executedByType"].every((field) => schema.includes(field)));
check("audit migration adds structured audit columns and indexes", migration.includes("ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS") && migration.includes("audit_logs_admin_idx") && migration.includes("audit_logs_target_idx") && migration.includes("audit_logs_high_risk_idx"));
check("governance audit writer sanitizes sensitive data", governance.includes("SENSITIVE_KEY") && governance.includes("sanitizeAuditValue") && governance.includes("writeGovernanceAudit"));
check("audit UI is super-admin read-only with search/filter", auditPage.includes("getAuditLogEntries") && auditPage.includes("highRiskOnly") && auditPage.includes("module") && auditPage.includes("targetType") && !auditPage.includes("deleteAudit") && !auditPage.includes("updateAudit"));
check("application does not expose audit deletion", !/DELETE\s+FROM\s+audit_logs/i.test(governance + auditPage + reportsPage + appealsPage + appealDetailsPage + misconductPage + misconductDetailsPage));
check("user deletion no longer rewrites audit history", superAdminActions.includes("audit_history") && !superAdminActions.includes("UPDATE audit_logs SET user_id = NULL"));

check("reports route uses global governance report permission", reportsPage.includes('requireAdminPermission("reports.read")') && governance.includes("getGovernanceReport") && governance.includes('admin.role !== "super_admin"'));
check("reports are aggregate and date-filtered", governance.includes("periodRange") && governance.includes("Invalid custom date range") && reportsPage.includes("Read-only System Reports") && reportsPage.includes("Neutral Admin Operation Metrics"));
check("reports avoid raw payload columns", !/chapa_response|provider_action_response|document_file|file_url|password_hash|raw_/i.test(reportsPage));

check("appeal tables and append-only events exist", schema.includes("appeals") && schema.includes("appealEvents") && migration.includes("CREATE TABLE IF NOT EXISTS appeals") && migration.includes("CREATE TABLE IF NOT EXISTS appeal_events"));
check("participants can create and view appeal history", governance.includes("createAppeal") && governance.includes("getUserAppeals") && governance.includes("getUserAppealDetails") && clientAppeals.includes("UserAppealsList") && workerAppeals.includes("UserAppealsList") && clientAppealDetails.includes("Appeal History") && workerAppealDetails.includes("Appeal History"));
check("appeals validate ownership, duplicate, expiry, and target IDs", governance.includes("Only affected clients or workers may appeal") && governance.includes("Appealable dispute decision not found") && governance.includes("active appeal already exists") && governance.includes("appeal window has expired") && governance.includes("Invalid original decision identifier"));
check("appeal review separates original admin and super admin", governance.includes("Original decision administrator cannot review this appeal") && governance.includes("Only super admin may resolve appeals") && appealDetailsPage.includes("reviewAppeal"));
check("appeals record events rather than direct unrelated mutations", governance.includes("recordAppealEvent") && governance.includes("correctiveEventOnly") && appealDetailsPage.includes("does not directly mutate unrelated payment/provider records"));

check("misconduct review tables and events exist", schema.includes("adminMisconductReviews") && schema.includes("adminMisconductEvents") && migration.includes("CREATE TABLE IF NOT EXISTS admin_misconduct_reviews") && migration.includes("CREATE TABLE IF NOT EXISTS admin_misconduct_events"));
check("misconduct reviews are super-admin only and self-protected", governance.includes("Only super admin may open misconduct reviews") && governance.includes("Super admin cannot open a self-review") && governance.includes("assertCanModifyAdminAccount"));
check("misconduct references immutable audit IDs", governance.includes("referenced_audit_ids") && governance.includes("Referenced audit IDs must be valid immutable audit identifiers") && misconductDetailsPage.includes("Append-only History"));
check("misconduct outcomes use secured employee status actions", governance.includes('requireAdminPermission("admin_accounts.suspend")') && governance.includes("session_version = session_version + 1") && governance.includes("admin_role <> 'super_admin'"));

check("ethical controls keep super admin out of routine operations", operationalPermissions.every((permission) => !superAdminBlock.includes(`"${permission}"`)));
check("misuse indicators are neutral and non-automatic", governance.includes("getMisuseIndicators") && governance.includes("Neutral operational metrics require human interpretation") && !/UPDATE\s+admin_employees/i.test(misuseIndicatorBlock));
check("high-risk financial actions carry proposal/approval attribution", financialActions.includes("proposedByAdminId") && financialActions.includes("approvedByAdminId") && financialActions.includes("financial_high_risk_action_approved") && financialActions.includes("executeApprovedRelease"));
check("support actions now write governance audit entries", supportActions.includes("support_ticket_claimed") && supportActions.includes("support_ticket_resolved") && supportActions.includes("writeGovernanceAudit"));
check("navigation exposes governance surfaces", sidebar.includes("/admin/audit") && sidebar.includes("/admin/appeals") && sidebar.includes("/admin/misconduct") && sidebar.includes("/admin/reports"));

process.exit(failed ? 1 : 0);
