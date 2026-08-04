import { sql } from "@/lib/db";

export const CLIENT_CONTRACT_VERIFICATION_MESSAGE =
  "Fayda identity verification is required before accessing contracts.";

export const WORKER_ACTIVE_VERIFICATION_MESSAGE =
  "Your worker profile must be verified and active before using worker features.";

export async function getActiveVerifiedWorker(userId: string) {
  const rows = await sql`
    SELECT u.id
    FROM users u
    JOIN worker_profiles wp ON u.id = wp.user_id
    WHERE u.id = ${userId}
      AND u.role = 'worker'
      AND u.is_suspended = false
      AND wp.is_verified = true
      AND wp.verification_status = 'approved'
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function isActiveVerifiedWorker(userId: string) {
  return Boolean(await getActiveVerifiedWorker(userId));
}

export async function assertActiveVerifiedWorker(userId: string) {
  if (!(await isActiveVerifiedWorker(userId))) {
    return { allowed: false, error: WORKER_ACTIVE_VERIFICATION_MESSAGE };
  }
  return { allowed: true, error: null };
}
