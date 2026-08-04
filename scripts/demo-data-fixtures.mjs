import { resolve } from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

export const DEMO_IDS = {
  admin: "10000000-0000-4000-8000-000000000001",
  client: "10000000-0000-4000-8000-000000000002",
  worker: "10000000-0000-4000-8000-000000000003",
  unverifiedWorker: "10000000-0000-4000-8000-000000000004",
  secondClient: "10000000-0000-4000-8000-000000000005",
  secondWorker: "10000000-0000-4000-8000-000000000006",
  rejectedWorker: "10000000-0000-4000-8000-000000000007",
  suspendedWorker: "10000000-0000-4000-8000-000000000008",
  revokedWorker: "10000000-0000-4000-8000-000000000009",
  unverifiedClient: "10000000-0000-4000-8000-000000000010",
  jobPending: "10000000-0000-4000-8000-000000000101",
  jobActive: "10000000-0000-4000-8000-000000000102",
  jobInProgress: "10000000-0000-4000-8000-000000000103",
  jobCompletionRequested: "10000000-0000-4000-8000-000000000104",
  jobPaymentPending: "10000000-0000-4000-8000-000000000105",
  jobPaid: "10000000-0000-4000-8000-000000000106",
  contract: "10000000-0000-4000-8000-000000000201",
  signatureClient: "10000000-0000-4000-8000-000000000301",
  signatureWorker: "10000000-0000-4000-8000-000000000302",
  payment: "10000000-0000-4000-8000-000000000401",
  rating: "10000000-0000-4000-8000-000000000501",
};

export function assertNonProduction() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    throw new Error("Demo data scripts refuse to run in production.");
  }
}

export function connectDemoDatabase() {
  config({ path: resolve(process.cwd(), ".env.local"), quiet: true });
  assertNonProduction();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }

  return neon(process.env.DATABASE_URL);
}

export async function resetDemoData(sql) {
  await sql`
    DELETE FROM ratings
    WHERE job_id IN (
      SELECT id FROM jobs
      WHERE title LIKE 'BROWSER-E2E - %'
        AND client_id IN (${DEMO_IDS.client}, ${DEMO_IDS.secondClient}, ${DEMO_IDS.unverifiedClient})
    )
  `;
  await sql`
    DELETE FROM payments
    WHERE job_id IN (
      SELECT id FROM jobs
      WHERE title LIKE 'BROWSER-E2E - %'
        AND client_id IN (${DEMO_IDS.client}, ${DEMO_IDS.secondClient}, ${DEMO_IDS.unverifiedClient})
    )
  `;
  await sql`
    DELETE FROM contract_signatures
    WHERE contract_id IN (
      SELECT c.id FROM contracts c
      JOIN jobs j ON c.job_id = j.id
      WHERE j.title LIKE 'BROWSER-E2E - %'
        AND j.client_id IN (${DEMO_IDS.client}, ${DEMO_IDS.secondClient}, ${DEMO_IDS.unverifiedClient})
    )
  `;
  await sql`
    DELETE FROM contracts
    WHERE job_id IN (
      SELECT id FROM jobs
      WHERE title LIKE 'BROWSER-E2E - %'
        AND client_id IN (${DEMO_IDS.client}, ${DEMO_IDS.secondClient}, ${DEMO_IDS.unverifiedClient})
    )
  `;
  await sql`
    DELETE FROM jobs
    WHERE title LIKE 'BROWSER-E2E - %'
      AND client_id IN (${DEMO_IDS.client}, ${DEMO_IDS.secondClient}, ${DEMO_IDS.unverifiedClient})
  `;
  await sql`DELETE FROM ratings WHERE id = ${DEMO_IDS.rating} OR job_id = ${DEMO_IDS.jobPaid}`;
  await sql`DELETE FROM payments WHERE id = ${DEMO_IDS.payment} OR chapa_ref = 'DIRESKILL-DEMO-PAID'`;
  await sql`
    DELETE FROM notifications
    WHERE user_id IN (
      ${DEMO_IDS.admin},
      ${DEMO_IDS.client},
      ${DEMO_IDS.worker},
      ${DEMO_IDS.unverifiedWorker},
      ${DEMO_IDS.secondClient},
      ${DEMO_IDS.secondWorker},
      ${DEMO_IDS.rejectedWorker},
      ${DEMO_IDS.suspendedWorker},
      ${DEMO_IDS.revokedWorker},
      ${DEMO_IDS.unverifiedClient}
    )
    AND title LIKE 'DEMO - %'
  `;
  await sql`DELETE FROM contract_signatures WHERE id IN (${DEMO_IDS.signatureClient}, ${DEMO_IDS.signatureWorker}) OR contract_id = ${DEMO_IDS.contract}`;
  await sql`DELETE FROM contracts WHERE id = ${DEMO_IDS.contract}`;
  await sql`
    DELETE FROM jobs
    WHERE id IN (
      ${DEMO_IDS.jobPending},
      ${DEMO_IDS.jobActive},
      ${DEMO_IDS.jobInProgress},
      ${DEMO_IDS.jobCompletionRequested},
      ${DEMO_IDS.jobPaymentPending},
      ${DEMO_IDS.jobPaid}
    )
  `;
  await sql`
    DELETE FROM contract_setups
    WHERE user_id IN (${DEMO_IDS.client}, ${DEMO_IDS.worker}, ${DEMO_IDS.secondClient}, ${DEMO_IDS.secondWorker})
  `;
  await sql`
    DELETE FROM worker_profiles
    WHERE user_id IN (
      ${DEMO_IDS.worker},
      ${DEMO_IDS.unverifiedWorker},
      ${DEMO_IDS.secondWorker},
      ${DEMO_IDS.rejectedWorker},
      ${DEMO_IDS.suspendedWorker},
      ${DEMO_IDS.revokedWorker}
    )
  `;
  await sql`
    DELETE FROM client_profiles
    WHERE user_id IN (${DEMO_IDS.client}, ${DEMO_IDS.secondClient}, ${DEMO_IDS.unverifiedClient})
  `;
  await sql`
    DELETE FROM users
    WHERE id IN (
      ${DEMO_IDS.client},
      ${DEMO_IDS.worker},
      ${DEMO_IDS.unverifiedWorker},
      ${DEMO_IDS.secondClient},
      ${DEMO_IDS.secondWorker},
      ${DEMO_IDS.rejectedWorker},
      ${DEMO_IDS.suspendedWorker},
      ${DEMO_IDS.revokedWorker},
      ${DEMO_IDS.unverifiedClient}
    )
  `;
  await sql`
    DELETE FROM admin_employees
    WHERE id = ${DEMO_IDS.admin}
      AND identity_note = 'development_test_admin_seed'
  `;
}
