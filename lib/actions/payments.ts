import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { PLATFORM_CONFIG } from "@/lib/config";
import { assertActiveVerifiedWorker } from "@/lib/identity-lifecycle";

export interface WorkerEarningsTransaction {
  id: string;
  jobId: string;
  title: string;
  client: string;
  amount: number;
  commissionAmount: number;
  netAmount: number;
  status: string;
  chapaRef: string | null;
  chapaReference: string | null;
  createdAt: string;
}

export interface ClientPaymentRecord {
  jobId: string;
  jobTitle: string;
  jobStatus: string;
  workerName: string;
  signedAt: string | Date | null;
  paymentId: string | null;
  paymentStatus: string;
  chapaRef: string | null;
  chapaReference: string | null;
  total: number;
  commissionAmount: number;
  netAmount: number;
  createdAt: string | Date | null;
}

export function getPaymentBreakdown(amount: number | null | undefined) {
  const total = Number(amount ?? 0);
  const commission = Math.round(total * PLATFORM_CONFIG.COMMISSION_RATE);
  const netAmount = Math.max(total - commission, 0);

  return {
    total,
    commission,
    netAmount,
    commissionRate: PLATFORM_CONFIG.COMMISSION_RATE,
  };
}

export async function getPaymentPageData(jobId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") return null;

  try {
    const rows = await sql`
      SELECT
        j.id as job_id,
        j.title as job_title,
        j.status as job_status,
        COALESCE(c.payment_amount, j.budget) as budget,
        j.client_id,
        j.worker_id,
        wp.full_name as worker_name,
        wp.avatar_url as worker_avatar,
        wp.is_verified as worker_verified,
        wp.skills,
        cp.full_name as client_name,
        c.id as contract_id,
        c.signed_at,
        c.status as contract_status,
        c.payment_amount,
        p.id as payment_id,
        p.status as payment_status,
        p.chapa_status,
        p.chapa_ref as tx_ref,
        p.chapa_reference,
        p.amount as paid_amount,
        p.commission_amount,
        p.net_amount
      FROM jobs j
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
      LEFT JOIN contracts c ON c.job_id = j.id
      LEFT JOIN payments p ON p.job_id = j.id
      WHERE j.id = ${jobId} AND j.client_id = ${session.user.id}
      ORDER BY p.created_at DESC NULLS LAST
      LIMIT 1
    `;

    if (rows.length === 0) return null;

    const row = rows[0];
    const calculated = getPaymentBreakdown(row.payment_amount ?? row.paid_amount ?? row.budget);

    return {
      ...row,
      payment_total: row.paid_amount ?? row.payment_amount ?? calculated.total,
      commission_amount: row.commission_amount ?? calculated.commission,
      net_amount: row.net_amount ?? calculated.netAmount,
      commission_rate: calculated.commissionRate,
    };
  } catch (error) {
    console.error("[GET_PAYMENT_PAGE_DATA_ERROR]", error);
    return null;
  }
}

export async function getClientPayments(): Promise<ClientPaymentRecord[]> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    throw new Error("Unauthorized");
  }

  try {
    const rows = await sql`
      SELECT
        j.id as job_id,
        j.title as job_title,
        j.status as job_status,
        j.budget,
        j.updated_at,
        c.signed_at,
        wp.full_name as worker_name,
        p.id as payment_id,
        p.amount,
        p.commission_amount,
        p.net_amount,
        p.status as payment_status,
        p.chapa_ref,
        p.chapa_reference,
        p.created_at as payment_created_at
      FROM jobs j
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      LEFT JOIN contracts c ON c.job_id = j.id
      LEFT JOIN payments p ON p.job_id = j.id
      WHERE j.client_id = ${session.user.id}
        AND (j.status IN ('completed', 'payment_pending', 'paid', 'closed') OR p.id IS NOT NULL)
      ORDER BY COALESCE(p.created_at, j.updated_at) DESC
    `;

    return rows.map((row: any): ClientPaymentRecord => {
      const fallback = getPaymentBreakdown(row.amount ?? row.budget);

      return {
        jobId: row.job_id,
        jobTitle: row.job_title,
        jobStatus: row.job_status,
        workerName: row.worker_name ?? "Worker",
        signedAt: row.signed_at,
        paymentId: row.payment_id,
        paymentStatus: row.payment_status ?? "unpaid",
        chapaRef: row.chapa_ref,
        chapaReference: row.chapa_reference ?? null,
        total: Number(row.amount ?? row.budget ?? fallback.total),
        commissionAmount: Number(row.commission_amount ?? fallback.commission),
        netAmount: Number(row.net_amount ?? fallback.netAmount),
        createdAt: row.payment_created_at ?? row.updated_at,
      };
    });
  } catch (error) {
    console.error("[GET_CLIENT_PAYMENTS_ERROR]", error);
    return [];
  }
}

export async function getWorkerEarnings() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "worker") {
    throw new Error("Unauthorized");
  }

  const workerAccess = await assertActiveVerifiedWorker(session.user.id);
  if (!workerAccess.allowed) {
    throw new Error(workerAccess.error || "Forbidden");
  }

  try {
    const rows = await sql`
      SELECT
        p.id,
        p.job_id,
        p.amount,
        p.commission_amount,
        p.net_amount,
        p.status,
        p.chapa_ref,
        p.chapa_reference,
        p.created_at,
        j.title as job_title,
        j.budget,
        cp.full_name as client_name
      FROM payments p
      JOIN jobs j ON p.job_id = j.id
      LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
      WHERE j.worker_id = ${session.user.id}
      ORDER BY p.created_at DESC
    `;

    const transactions: WorkerEarningsTransaction[] = rows.map((row: any) => {
      const fallback = getPaymentBreakdown(row.amount ?? row.budget);
      const amount = Number(row.amount ?? fallback.total);
      const commissionAmount = Number(row.commission_amount ?? fallback.commission);
      const netAmount = Number(row.net_amount ?? fallback.netAmount);

      return {
        id: row.id,
        jobId: row.job_id,
        title: row.job_title,
        client: row.client_name ?? "Client",
        amount,
        commissionAmount,
        netAmount,
        status: row.status,
        chapaRef: row.chapa_ref,
        chapaReference: row.chapa_reference ?? null,
        createdAt: row.created_at?.toISOString?.() ?? String(row.created_at),
      };
    });

    const released = transactions.filter((tx) => tx.status === "released");
    const held = transactions.filter((tx) => tx.status === "held");

    return {
      totalEarnings: released.reduce((sum, tx) => sum + tx.netAmount, 0),
      pendingEarnings: held.reduce((sum, tx) => sum + tx.netAmount, 0),
      availableEarnings: released.reduce((sum, tx) => sum + tx.netAmount, 0),
      completedJobs: released.length,
      commissionFees: transactions.reduce((sum, tx) => sum + tx.commissionAmount, 0),
      transactions,
    };
  } catch (error) {
    console.error("[GET_WORKER_EARNINGS_ERROR]", error);
    return {
      totalEarnings: 0,
      pendingEarnings: 0,
      availableEarnings: 0,
      completedJobs: 0,
      commissionFees: 0,
      transactions: [],
    };
  }
}
