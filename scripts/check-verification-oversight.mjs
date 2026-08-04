import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");

const adminAuth = read("lib/admin-authorization.ts");
const workerPage = read("app/(admin)/admin/verify/[id]/page.tsx");
const clientPage = read("app/(admin)/admin/clients/[id]/verify/page.tsx");
const workerContent = read("components/WorkerVerificationContent.tsx");
const tabs = read("components/admin/VerificationReviewTabs.tsx");
const pending = read("components/admin/PendingVerification.tsx");
const workersManagement = read("components/admin/WorkersManagementClient.tsx");
const adminActions = read("lib/actions/admin.ts");
const workerApi = read("app/api/workers/verify/route.ts");
const clientApi = read("app/api/clients/verify/route.ts");

let failed = false;
function check(label, ok) {
  if (ok) {
    console.log(`PASS ${label}`);
  } else {
    console.log(`MISSING ${label}`);
    failed = true;
  }
}

function roleBlock(role) {
  const match = adminAuth.match(new RegExp(`${role}: \\[([\\s\\S]*?)\\],`));
  return match?.[1] ?? "";
}

const superAdminBlock = roleBlock("super_admin");
const disputePaymentBlock = roleBlock("dispute_payment_admin");
const userSupportBlock = roleBlock("user_support_admin");

check("super admin has verification.read", adminAuth.includes("super_admin") && adminAuth.includes('"verification.read"'));
check("super admin lacks verification.review", !superAdminBlock.includes('"verification.review"'));
check("super admin lacks verification.approve", !superAdminBlock.includes('"verification.approve"'));
check("worker case opens with verification.read", workerPage.includes('requireAdminPermission("verification.read")'));
check("client case opens with verification.read", clientPage.includes('requireAdminPermission("verification.read")'));
check("worker case derives review capability separately", workerPage.includes('hasAdminPermission(admin, "verification.review")'));
check("client case derives review capability separately", clientPage.includes('hasAdminPermission(admin, "verification.review")'));
check("worker page renders read-only oversight message", workerContent.includes("Read-only oversight mode"));
check("client page renders read-only oversight message", clientPage.includes("Read-only oversight mode"));
check("worker controls hidden without capabilities", workerContent.includes("capabilities.canApprove") && workerContent.includes("capabilities.canReject"));
check("client controls hidden without capabilities", clientPage.includes("capabilities.canApprove") && clientPage.includes("capabilities.canReject"));
check("verification list labels view details for read-only", tabs.includes('canReview ? "Review" : "View details"'));
check("dashboard pending list labels view details for read-only", pending.includes('canReview ? t("admin.action.review" as any) : "View details"'));
check("workers table labels view details for read-only", workersManagement.includes('verificationCapabilities.canReview ? t("admin.action.review" as any) : "View details"'));
check("approve server action requires exact permission", adminActions.includes('status === "approved"') && adminActions.includes('"verification.approve"'));
check("reject server action requires exact permission", adminActions.includes('status === "rejected"') && adminActions.includes('"verification.reject"'));
check("request resubmission server action requires exact permission", adminActions.includes('status === "pending"') && adminActions.includes('"verification.request_resubmission"'));
check("worker verification API requires exact permission", workerApi.includes("requireAdminPermission") && workerApi.includes("verification.approve") && workerApi.includes("verification.reject"));
check("client verification API requires exact permission", clientApi.includes("requireAdminPermission") && clientApi.includes("verification.approve") && clientApi.includes("verification.reject"));
check("unrelated admin roles have no verification.read", !disputePaymentBlock.includes('"verification.read"') && !userSupportBlock.includes('"verification.read"'));

process.exit(failed ? 1 : 0);
