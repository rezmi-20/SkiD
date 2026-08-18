import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (file) => readFileSync(resolve(root, file), "utf8");

const packageJson = JSON.parse(read("package.json"));
const financialActions = read("lib/actions/dispute-financial-actions.ts");
const paymentProcessing = read("lib/payment-processing.ts");
const migration = read("scripts/migrate-dispute-financial-actions.mjs");
const schema = read("lib/schema.ts");
const adminPage = read("app/(admin)/admin/disputes/[id]/page.tsx");
const chapa = read("lib/chapa.ts");
const receipt = read("app/api/payments/[paymentId]/receipt/route.ts");

let failed = false;
function check(label, ok) {
  console.log(`${ok ? "PASS" : "MISSING"} ${label}`);
  if (!ok) failed = true;
}

const allowedActions = [
  "no_financial_action",
  "release_payment",
  "hold_payment",
  "refund_review_required",
  "partial_refund_review_required",
  "payment_provider_investigation",
  "escalate_financial_case",
];

check("npm script wired", packageJson.scripts?.["check:dispute-financial-actions"] === "node scripts/check-dispute-financial-actions.mjs");
check("migration script wired", packageJson.scripts?.["db:migrate:dispute-financial-actions"] === "node scripts/migrate-dispute-financial-actions.mjs");
check("all controlled outcomes are present", allowedActions.every((action) => financialActions.includes(`"${action}"`) && migration.includes(`'${action}'`)));
check("database constrains financial actions", migration.includes("dispute_financial_actions_action_allowed") && migration.includes("dispute_financial_actions_status_allowed"));
check("database constrains active holds", migration.includes("payments_financial_hold_status_allowed") && migration.includes("payment_active_hold_unique_idx"));
check("append-only financial ledger exists", schema.includes("disputeFinancialActions") && migration.includes("CREATE TABLE IF NOT EXISTS dispute_financial_actions"));
check("ledger has idempotency guard", schema.includes("idempotencyKey") && migration.includes("dispute_financial_actions_idempotency_unique_idx"));
check("pending high-risk proposal dedupe exists", migration.includes("dispute_financial_pending_action_unique_idx") && migration.includes("proposal_status IN ('proposed', 'approved')"));
check("ordinary financial operations require dispute/payment admin", financialActions.includes('admin.role !== "dispute_payment_admin"') && financialActions.includes("requireOperationalFinancialAdmin"));
check("ordinary financial operations require assigned dispute admin", financialActions.includes("Financial case operations require assignment") && financialActions.includes("financialCase.assigned_admin_id !== admin.id"));
check("financial decisions require evidence and recorded responses", financialActions.includes("requireFinancialDecisionReadiness") && financialActions.includes("submittedResponseCount") && financialActions.includes("pendingResponseCount"));
check("super admin approval is separate from execution", financialActions.includes("approveFinancialAction") && financialActions.includes('admin.role !== "super_admin"') && financialActions.includes("executeApprovedRelease"));
check("release uses payment-domain verification helper", financialActions.includes("verifyAndReleasePayment({") && financialActions.includes('source: "dispute_resolution"'));
check("financial actions do not directly release payments", !/dispute-financial-actions[\s\S]*UPDATE payments[\s\S]*status\s*=\s*'released'/.test(financialActions));
check("payment release blocks unrelated active dispute holds", paymentProcessing.includes("activeDisputeHold") && paymentProcessing.includes("payment_release_blocked_by_dispute_hold"));
check("held payment verification preserves provider facts", paymentProcessing.includes("providerVerified: true") && paymentProcessing.includes("Payment provider verification is recorded") && paymentProcessing.includes("chapa_response ="));
check("authorized dispute release is explicit", paymentProcessing.includes("authorizedDisputeId") && financialActions.includes("authorizedDisputeId: action.dispute_id"));
check("hold action preserves provider status", financialActions.includes("SET financial_hold_status = 'held'") && !financialActions.includes("chapa_status =") && !financialActions.includes("chapa_response ="));
check("duplicate holds are rejected", financialActions.includes("financial_hold_status IS DISTINCT FROM 'held'") && financialActions.includes("already has an active hold"));
check("release requires provider-verified successful status", financialActions.includes("Release requires provider-verified successful payment status") && financialActions.includes("isProviderSuccess"));
check("refund actions are review only", financialActions.includes("provider_action_pending") && !financialActions.includes("refundChapa") && !financialActions.includes("createRefund"));
check("Chapa integration has no refund execution helper", !/refund|reverse|void/i.test(chapa));
check("refund amount is bounded by paid amount", financialActions.includes("requestedAmount > Number(financialCase.payment_amount || 0)"));
check("no code marks refunds provider-complete here", !/UPDATE payments[\s\S]*status\s*=\s*'refunded'/.test(financialActions));
check("participants are notified", financialActions.includes("notifyParticipant") && financialActions.includes("Promise.all"));
check("dispute events are recorded", financialActions.includes("recordFinancialEvent") && financialActions.includes("payment_released_after_dispute"));
check("stale approvals have dispute decision snapshots", schema.includes("decisionSnapshot") && migration.includes("decision_snapshot") && financialActions.includes("The dispute decision changed after this proposal was created"));
check("receipts require verified released payment", receipt.includes("Receipt is available only after verified payment release") && receipt.includes('payment.status !== "released"'));
check("admin UI exposes hold/propose/approve/execute controls", adminPage.includes("Controlled Payment Actions") && adminPage.includes("Hold Payment") && adminPage.includes("Approve") && adminPage.includes("Execute Release"));
check("admin UI does not expose raw provider payload", !adminPage.includes("chapa_response") && !adminPage.includes("provider_action_response"));
check("refund completion copy is conservative", adminPage.includes("Refund outcomes remain review-required"));

process.exit(failed ? 1 : 0);
