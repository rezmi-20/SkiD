"use server";

import { sql } from "@/lib/db";
import { requireAdminPermission, type AdminPermission } from "@/lib/admin-authorization";

export interface AdminPaymentReportRow {
  paymentId: string;
  jobId: string;
  jobTitle: string;
  clientName: string;
  workerName: string;
  amount: number;
  commissionAmount: number;
  netAmount: number;
  status: string;
  chapaStatus: string | null;
  chapaRef: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AdminPaymentReport {
  totals: {
    grossVolume: number;
    releasedVolume: number;
    commissionRevenue: number;
    workerPayouts: number;
    releasedCount: number;
    pendingCount: number;
    refundedCount: number;
  };
  monthly: Array<{
    month: string;
    grossVolume: number;
    commissionRevenue: number;
    workerPayouts: number;
  }>;
  payments: AdminPaymentReportRow[];
}

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

export async function getAdminPaymentReport(permission: AdminPermission = "payment_cases.read"): Promise<AdminPaymentReport> {
  await requireAdminPermission(permission);

  const [totalsRows, monthlyRows, paymentRows] = await Promise.all([
    sql`
      SELECT
        COALESCE(SUM(amount), 0) as gross_volume,
        COALESCE(SUM(CASE WHEN status = 'released' THEN amount ELSE 0 END), 0) as released_volume,
        COALESCE(SUM(CASE WHEN status = 'released' THEN commission_amount ELSE 0 END), 0) as commission_revenue,
        COALESCE(SUM(CASE WHEN status = 'released' THEN net_amount ELSE 0 END), 0) as worker_payouts,
        COUNT(*) FILTER (WHERE status = 'released') as released_count,
        COUNT(*) FILTER (WHERE status = 'held') as pending_count,
        COUNT(*) FILTER (WHERE status = 'refunded') as refunded_count
      FROM payments
    `,
    sql`
      SELECT
        to_char(date_trunc('month', created_at), 'Mon YYYY') as month,
        date_trunc('month', created_at) as month_start,
        COALESCE(SUM(amount), 0) as gross_volume,
        COALESCE(SUM(commission_amount), 0) as commission_revenue,
        COALESCE(SUM(net_amount), 0) as worker_payouts
      FROM payments
      GROUP BY month_start
      ORDER BY month_start ASC
      LIMIT 12
    `,
    sql`
      SELECT
        p.id as payment_id,
        p.job_id,
        p.amount,
        p.commission_amount,
        p.net_amount,
        p.status,
        p.chapa_status,
        p.chapa_ref,
        p.created_at,
        p.updated_at,
        j.title as job_title,
        COALESCE(cp.full_name, cu.email, 'Client') as client_name,
        COALESCE(wp.full_name, wu.email, 'Worker') as worker_name
      FROM payments p
      JOIN jobs j ON p.job_id = j.id
      JOIN users cu ON j.client_id = cu.id
      JOIN users wu ON j.worker_id = wu.id
      LEFT JOIN client_profiles cp ON cp.user_id = j.client_id
      LEFT JOIN worker_profiles wp ON wp.user_id = j.worker_id
      ORDER BY p.created_at DESC
      LIMIT 80
    `,
  ]);

  const totals = totalsRows[0] ?? {};

  return {
    totals: {
      grossVolume: toNumber(totals.gross_volume),
      releasedVolume: toNumber(totals.released_volume),
      commissionRevenue: toNumber(totals.commission_revenue),
      workerPayouts: toNumber(totals.worker_payouts),
      releasedCount: toNumber(totals.released_count),
      pendingCount: toNumber(totals.pending_count),
      refundedCount: toNumber(totals.refunded_count),
    },
    monthly: monthlyRows.map((row: any) => ({
      month: row.month,
      grossVolume: toNumber(row.gross_volume),
      commissionRevenue: toNumber(row.commission_revenue),
      workerPayouts: toNumber(row.worker_payouts),
    })),
    payments: paymentRows.map((row: any) => ({
      paymentId: row.payment_id,
      jobId: row.job_id,
      jobTitle: row.job_title,
      clientName: row.client_name,
      workerName: row.worker_name,
      amount: toNumber(row.amount),
      commissionAmount: toNumber(row.commission_amount),
      netAmount: toNumber(row.net_amount),
      status: row.status,
      chapaStatus: row.chapa_status,
      chapaRef: row.chapa_ref,
      createdAt: row.created_at?.toISOString?.() ?? String(row.created_at),
      updatedAt: row.updated_at?.toISOString?.() ?? (row.updated_at ? String(row.updated_at) : null),
    })),
  };
}
