"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth/server";

export async function getPaymentPageData(jobId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") return null;

  try {
    const rows = await sql`
      SELECT
        j.id as job_id,
        j.title as job_title,
        j.status as job_status,
        j.budget,
        j.client_id,
        j.worker_id,
        wp.full_name as worker_name,
        wp.avatar_url as worker_avatar,
        wp.is_verified as worker_verified,
        wp.skills,
        cp.full_name as client_name,
        c.id as contract_id,
        c.signed_at,
        p.id as payment_id,
        p.status as payment_status,
        p.chapa_ref as tx_ref,
        p.amount as paid_amount
      FROM jobs j
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
      LEFT JOIN contracts c ON c.job_id = j.id
      LEFT JOIN payments p ON p.job_id = j.id
      WHERE j.id = ${jobId} AND j.client_id = ${session.user.id}
    `;

    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error("[GET_PAYMENT_PAGE_DATA_ERROR]", error);
    return null;
  }
}
