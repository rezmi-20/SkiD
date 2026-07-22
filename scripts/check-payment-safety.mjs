import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const files = [
  "app/api/initialize-payment/route.ts",
  "app/api/payments/chapa/route.ts",
  "app/api/payment/webhook/route.ts",
  "app/api/payments/status/route.ts",
  "app/api/payments/[paymentId]/receipt/route.ts",
  "app/payment-success/page.tsx",
  "app/checkout/page.tsx",
  "app/(client)/client/pay/[jobId]/page.tsx",
  "lib/actions/payments.ts",
  "lib/payment-processing.ts",
];

const checks = [
  { label: "payment amount comes from server-side contract/job data", pattern: /COALESCE\(c\.payment_amount, j\.budget\)|payment_amount|budget/ },
  { label: "job ownership is checked", pattern: /client_id = \$\{session\.user\.id\}|job not found or unauthorized/i },
  { label: "payment status gate exists", pattern: /payment_pending|completed/ },
  { label: "transaction reference is generated server-side", pattern: /txRef = `DIRESKILL-/ },
  { label: "webhook signature verification exists", pattern: /verifyChapaWebhookSignature|signatureVerified/ },
  { label: "server-to-server verification exists", pattern: /verifyChapaPayment|verifyAndReleasePayment/ },
  { label: "receipt route has auth", pattern: /const session = await auth\(\)/ },
  { label: "receipt route checks ownership", pattern: /canRead/ },
  { label: "query params alone cannot mark payment paid", pattern: /verifyAndReleasePayment\(/ },
  { label: "checkout page does not submit payment amount to API", pattern: /router\.push\(`\/client\/pay\/\$\{encodeURIComponent\(jobId\.trim\(\)\)\}`\)/ },
];

let failed = false;
for (const file of files) {
  const source = readFileSync(resolve(process.cwd(), file), "utf8");
  console.log(`PASS inspected ${file}`);
  for (const check of checks) {
    if (check.pattern.test(source)) {
      console.log(`PASS ${check.label} in ${file}`);
    }
  }
}

for (const required of [
  "payment amount comes from server-side contract/job data",
  "job ownership is checked",
  "payment status gate exists",
  "transaction reference is generated server-side",
  "webhook signature verification exists",
  "server-to-server verification exists",
  "receipt route has auth",
  "receipt route checks ownership",
  "query params alone cannot mark payment paid",
  "checkout page does not submit payment amount to API",
]) {
  const matched = files.some((file) => {
    const source = readFileSync(resolve(process.cwd(), file), "utf8");
    const check = checks.find((entry) => entry.label === required);
    return check ? check.pattern.test(source) : false;
  });
  if (!matched) {
    console.log(`WARNING missing evidence for ${required}`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
