import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

const checks = [
  {
    file: "lib/job-workflow.ts",
    patterns: [
      /completion_requested/,
      /payment_pending/,
      /paid/,
      /closed/,
      /assertAllowedJobTransition/,
      /pending:[\s\S]*worker:\s*\["accepted",\s*"rejected"\]/,
      /in_progress:[\s\S]*worker:\s*\["completion_requested"\]/,
      /completion_requested:[\s\S]*client:\s*\["completed",\s*"in_progress",\s*"disputed"\]/,
    ],
  },
  {
    file: "lib/actions/jobs.ts",
    patterns: [
      /session\.user\.role !== "client"/,
      /wp\.is_verified = true/,
      /u\.is_suspended = false/,
      /SET status = 'completion_requested'/,
      /confirmJobCompletion/,
      /rejectJobCompletion/,
      /assertAllowedJobTransition/,
    ],
  },
  {
    file: "lib/actions/contracts.ts",
    patterns: [
      /terms_status = 'submitted'/,
      /acceptContractTerms/,
      /rejectContractTerms/,
      /contract\.terms_status !== "accepted"/,
      /activateContractAfterFullSignature/,
    ],
  },
  {
    file: "app/api/payments/chapa/route.ts",
    patterns: [
      /Payment is only available after client-confirmed completion/,
      /contract_status !== "ACTIVE"/,
      /COALESCE\(c\.payment_amount, j\.budget\) as payment_amount/,
      /status IN \('released', 'held'\)/,
      /status = 'payment_pending'/,
    ],
  },
  {
    file: "lib/payment-processing.ts",
    patterns: [
      /verifyChapaPayment/,
      /amountsMatch/,
      /SET status = 'released'/,
      /SET status = 'paid'/,
      /payment_failed/,
    ],
  },
  {
    file: "lib/actions/ratings.ts",
    patterns: [
      /RATEABLE_JOB_STATUSES = \["paid", "closed"\]/,
      /payment_status !== "released"/,
      /sanitizeText\(reviewText/,
      /UPDATE jobs[\s\S]*SET status = 'closed'/,
    ],
  },
  {
    file: "app/api/workers/route.ts",
    patterns: [
      /u\.role = 'worker'/,
      /u\.is_suspended = false/,
      /wp\.is_verified = true/,
    ],
    absent: [/u\.email/],
  },
  {
    file: "app/api/workers/[id]/route.ts",
    patterns: [
      /u\.is_suspended = false/,
      /wp\.is_verified = true/,
      /j\.status IN \('paid', 'closed'\)/,
    ],
    absent: [/u\.email/],
  },
];

const failures = [];

for (const check of checks) {
  const source = await readFile(path.join(root, check.file), "utf8");

  for (const pattern of check.patterns) {
    if (!pattern.test(source)) {
      failures.push(`${check.file}: missing ${pattern}`);
    }
  }

  for (const pattern of check.absent || []) {
    if (pattern.test(source)) {
      failures.push(`${check.file}: forbidden ${pattern}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Core workflow rule check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Core workflow rule check passed.");
