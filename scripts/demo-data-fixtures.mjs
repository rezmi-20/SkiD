import { resolve } from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

export const DEMO_IDS = {
  admin: "10000000-0000-4000-8000-000000000001",
  client: "10000000-0000-4000-8000-000000000002",
  worker: "10000000-0000-4000-8000-000000000003",
  unverifiedWorker: "10000000-0000-4000-8000-000000000004",
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
  await sql`DELETE FROM ratings WHERE id = ${DEMO_IDS.rating} OR job_id = ${DEMO_IDS.jobPaid}`;
  await sql`DELETE FROM payments WHERE id = ${DEMO_IDS.payment} OR chapa_ref = 'DIRESKILL-DEMO-PAID'`;
  await sql`DELETE FROM notifications WHERE user_id IN (${DEMO_IDS.admin}, ${DEMO_IDS.client}, ${DEMO_IDS.worker}, ${DEMO_IDS.unverifiedWorker}) AND title LIKE 'DEMO - %'`;
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
  await sql`DELETE FROM contract_setups WHERE user_id IN (${DEMO_IDS.client}, ${DEMO_IDS.worker})`;
  await sql`DELETE FROM worker_profiles WHERE user_id IN (${DEMO_IDS.worker}, ${DEMO_IDS.unverifiedWorker})`;
  await sql`DELETE FROM client_profiles WHERE user_id = ${DEMO_IDS.client}`;
  await sql`DELETE FROM users WHERE id IN (${DEMO_IDS.admin}, ${DEMO_IDS.client}, ${DEMO_IDS.worker}, ${DEMO_IDS.unverifiedWorker})`;
}
