import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { ClientProfileDossier } from "@/components/admin/clients/ClientProfileDossier";

export const dynamic = "force-dynamic";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdminPermission("verification.read");
  const canSuspendAccount = hasAdminPermission(admin, "admin_accounts.suspend");

  const { id } = await params;

  const [clientRows, metricsRows, jobsRows, reminderRows] = await Promise.all([
    sql`
      SELECT
        u.id AS user_id,
        COALESCE(cp.full_name, u.email, 'Unknown Client') AS full_name,
        cp.fin_last4,
        cp.verification_status,
        cp.is_verified,
        COALESCE(cp.created_at, u.created_at) AS created_at,
        u.email,
        u.phone,
        u.is_suspended
      FROM users u
      LEFT JOIN client_profiles cp ON cp.user_id = u.id
      WHERE u.id = ${id} AND u.role = 'client'
      LIMIT 1
    `,
    sql`
      SELECT
        COUNT(DISTINCT j.id)::int AS total_jobs,
        COALESCE(SUM(c.payment_amount), 0)::int AS total_spent,
        COUNT(DISTINCT CASE WHEN c.status IN ('funded', 'in_progress') THEN c.id END)::int AS active_contracts
      FROM jobs j
      LEFT JOIN contracts c ON c.job_id = j.id
      WHERE j.client_id = ${id}
    `,
    sql`
      SELECT
        j.id,
        j.title,
        j.status,
        j.created_at,
        COALESCE(c.payment_amount, 0)::int AS amount,
        COALESCE(wp.full_name, 'Open / Unassigned') AS worker_name
      FROM jobs j
      LEFT JOIN contracts c ON c.job_id = j.id
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      WHERE j.client_id = ${id}
      ORDER BY j.created_at DESC
      LIMIT 15
    `,
    sql`
      SELECT MAX(created_at) AS last_reminder_at, COUNT(*)::int AS reminder_count
      FROM notifications
      WHERE user_id = ${id}
        AND type = 'identity_verification_required'
    `,
  ]);

  const rawClient = clientRows[0];
  if (!rawClient) notFound();

  const metrics = metricsRows[0] || {
    total_jobs: 0,
    total_spent: 0,
    active_contracts: 0,
  };

  const reminders = reminderRows[0] || {
    last_reminder_at: null,
    reminder_count: 0,
  };

  const client = {
    userId: rawClient.user_id,
    fullName: rawClient.full_name,
    email: rawClient.email,
    phone: rawClient.phone,
    isVerified: Boolean(rawClient.is_verified),
    isSuspended: Boolean(rawClient.is_suspended),
    verificationStatus: String(rawClient.verification_status || "pending"),
    finLast4: rawClient.fin_last4,
    createdAt: String(rawClient.created_at || new Date().toISOString()),
    totalSpent: Number(metrics.total_spent || 0),
    totalJobs: Number(metrics.total_jobs || 0),
    activeContracts: Number(metrics.active_contracts || 0),
    reminderCount: Number(reminders.reminder_count || 0),
    lastReminderAt: reminders.last_reminder_at ? String(reminders.last_reminder_at) : null,
  };

  const jobs = (jobsRows || []).map((j: any) => ({
    id: j.id,
    title: j.title || "Job Listing",
    workerName: j.worker_name,
    amount: Number(j.amount || 0),
    status: j.status || "open",
    createdAt: String(j.created_at),
  }));

  return (
    <ClientProfileDossier
      client={client}
      jobs={jobs}
      canSuspendAccount={canSuspendAccount}
    />
  );
}

