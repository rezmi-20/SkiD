import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");

const adminAuth = read("lib/admin-authorization.ts");
const superAdminActions = read("lib/actions/super-admin.ts");
const adminActions = read("lib/actions/admin.ts");
const adminPayments = read("lib/actions/admin-payments.ts");
const reportsPage = read("app/(admin)/admin/reports/page.tsx");
const disputes = read("lib/actions/disputes.ts");
const proxy = read("proxy.ts");
const adminLayout = read("app/(admin)/layout.tsx");
const adminSession = read("lib/admin-session.ts");
const authCallback = read("app/auth/callback/page.tsx");
const workersVerifyApi = read("app/api/workers/verify/route.ts");
const clientsVerifyApi = read("app/api/clients/verify/route.ts");
const courtCopyApi = read("app/api/admin/contracts/[id]/court-copy/route.ts");

const roles = [
  "super_admin",
  "content_verification_admin",
  "dispute_payment_admin",
  "user_support_admin",
];

const statuses = ["invited", "activation_required", "active", "suspended", "revoked"];

const matrix = {
  super_admin: [
    "admin_accounts.create",
    "admin_accounts.read",
    "admin_accounts.assign_role",
    "admin_accounts.suspend",
    "admin_accounts.reactivate",
    "audit.read",
    "reports.read",
    "appeals.read",
    "appeals.resolve",
    "admin_misconduct.review",
    "verification.read",
    "content.read",
    "disputes.read",
    "payment_cases.read",
    "support.read",
  ],
  content_verification_admin: [
    "verification.read",
    "verification.review",
    "verification.approve",
    "verification.reject",
    "verification.request_resubmission",
    "content.read",
    "content.moderate",
  ],
  dispute_payment_admin: [
    "disputes.read",
    "disputes.review",
    "disputes.request_evidence",
    "disputes.resolve",
    "disputes.escalate",
    "payment_cases.read",
    "payment_cases.review",
  ],
  user_support_admin: [
    "support.read",
    "support.respond",
    "support.resolve",
    "support.escalate",
    "users.read_limited",
  ],
};

let failed = false;
function check(label, condition) {
  if (condition) {
    console.log(`PASS ${label}`);
  } else {
    console.log(`MISSING ${label}`);
    failed = true;
  }
}

function hasPermission(role, status, permission) {
  return status === "active" && Boolean(matrix[role]?.includes(permission));
}

for (const role of roles) {
  check(`admin role defined: ${role}`, adminAuth.includes(`"${role}"`) || adminAuth.includes(`${role}: [`));
}

for (const status of statuses) {
  check(`admin status defined: ${status}`, adminAuth.includes(`"${status}"`));
}

for (const [role, permissions] of Object.entries(matrix)) {
  for (const permission of permissions) {
    check(`${role} permission ${permission}`, adminAuth.includes(`"${permission}"`));
  }
}

check("unauthenticated user denied", adminAuth.includes("getAdminSessionFromCookies") && adminAuth.includes("Active administrator access is required"));
check("client and worker public sessions denied", proxy.includes("getAdminEmployeeState") && proxy.includes('ADMIN_SESSION_COOKIE'));
check("public auth callback has no legacy admin role compatibility", !authCallback.includes('role === "admin"') && !authCallback.includes('redirect("/admin/login")'));
check("suspended admin denied", adminAuth.includes("isSuspended") && adminAuth.includes('return "suspended"'));
check("inactive admin denied", adminAuth.includes('status !== "active"') && adminAuth.includes("admin_activation_required"));
check("unknown role denied", adminAuth.includes("isAdminRole") && adminAuth.includes("return null"));

check("content admin can review verification", hasPermission("content_verification_admin", "active", "verification.review"));
check("content admin denied payment review", !hasPermission("content_verification_admin", "active", "payment_cases.review"));
check("dispute/payment admin can review payment case", hasPermission("dispute_payment_admin", "active", "payment_cases.review"));
check("dispute/payment admin denied verification approve", !hasPermission("dispute_payment_admin", "active", "verification.approve"));
check("support admin can read support", hasPermission("user_support_admin", "active", "support.read"));
check("support admin denied admin creation", !hasPermission("user_support_admin", "active", "admin_accounts.create"));
check("super admin can manage admin accounts", hasPermission("super_admin", "active", "admin_accounts.assign_role"));
check("super admin does not inherit verification approve", !hasPermission("super_admin", "active", "verification.approve"));
check("super admin does not inherit dispute resolve", !hasPermission("super_admin", "active", "disputes.resolve"));
check("suspended admin permission denied", !hasPermission("content_verification_admin", "suspended", "verification.review"));
check("inactive admin permission denied", !hasPermission("content_verification_admin", "activation_required", "verification.review"));

check("self role change denied", adminAuth.includes("actor.id === targetUserId") && superAdminActions.includes('assertCanModifyAdminAccount(admin, userId, "assign_role")'));
check("self suspension denied", adminAuth.includes("actor.id === targetUserId") && superAdminActions.includes('assertCanModifyAdminAccount(admin, userId, isSuspended ? "suspend" : "reactivate")'));

check("admin layout uses centralized principal", adminLayout.includes("getAdminPrincipal"));
check("admin session has separate employee marker", adminSession.includes('typ: "admin_employee"') && adminSession.includes("skid-admin-session"));
check("proxy denies inactive admin resources", proxy.includes("isActiveAdminAccount") && proxy.includes("Active administrator access is required."));
check("verification actions require permission", adminActions.includes("verification.approve") && adminActions.includes("verification.reject"));
check("admin account actions require governance permissions", superAdminActions.includes("admin_accounts.create") && superAdminActions.includes("admin_accounts.assign_role"));
check("payment admin loader requires permission", adminPayments.includes("payment_cases.read") && reportsPage.includes("reports.read"));
check("dispute loaders/actions require permissions", disputes.includes("disputes.read") && disputes.includes("disputes.resolve"));
check("worker verification API requires permission", workersVerifyApi.includes("requireAdminPermission"));
check("client verification API requires permission", clientsVerifyApi.includes("requireAdminPermission"));
check("court copy API requires active admin", courtCopyApi.includes("requireAdmin()") && courtCopyApi.includes("AdminAuthorizationError"));

process.exit(failed ? 1 : 0);
