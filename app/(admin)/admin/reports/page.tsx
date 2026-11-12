import { getGovernanceReport, getMisuseIndicators } from "@/lib/actions/governance";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { AdminReportsClient } from "@/components/admin/reports/AdminReportsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Governance Reports & Intelligence | DireSkill Admin",
  description: "Platform analytics, escrow liquidity, artisan KYC throughput, and executive audit reports.",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  await requireAdminPermission("reports.read");
  const params = await searchParams;

  const [report, indicators] = await Promise.all([
    getGovernanceReport(params.period || "last_30_days", params.from, params.to),
    getMisuseIndicators(),
  ]);

  if ("error" in report) {
    throw new Error(report.error);
  }

  // Format indicators
  const formattedIndicators = (indicators || []).map((row: any) => ({
    id: String(row.id),
    admin_employee_id: String(row.admin_employee_id || ""),
    full_name: String(row.full_name || ""),
    admin_role: String(row.admin_role || ""),
    misuse_flag: String(row.misuse_flag || "standard"),
    fin_reveal_count: Number(row.fin_reveal_count || 0),
    high_risk_count: Number(row.high_risk_count || 0),
  }));

  // Format governance report data
  const formattedGovernance = {
    period: report.period || params.period || "last_30_days",
    from: params.from,
    to: params.to,
    users: {
      total_clients: Number(report.users?.total_clients || 0),
      total_workers: Number(report.users?.total_workers || 0),
      suspended_accounts: Number(report.users?.suspended_accounts || 0),
      verified_workers: Number(report.users?.verified_workers || 0),
      verified_clients: Number(report.users?.verified_clients || 0),
      pending_verification: Number(report.users?.pending_verification || 0),
    },
    jobs: {
      jobs_created: Number(report.jobs?.jobs_created || 0),
      jobs_active: Number(report.jobs?.jobs_active || 0),
      jobs_completed: Number(report.jobs?.jobs_completed || 0),
      jobs_disputed: Number(report.jobs?.jobs_disputed || 0),
    },
    payments: {
      verified_payments: Number(report.payments?.verified_payments || 0),
      released_payments: Number(report.payments?.released_payments || 0),
      held_payments: Number(report.payments?.held_payments || 0),
      financial_review_cases: Number(report.payments?.financial_review_cases || 0),
    },
    disputes: {
      open_disputes: Number(report.disputes?.open_disputes || 0),
      under_review_disputes: Number(report.disputes?.under_review_disputes || 0),
      resolved_disputes: Number(report.disputes?.resolved_disputes || 0),
      escalated_disputes: Number(report.disputes?.escalated_disputes || 0),
      avg_resolution_hours: Number(report.disputes?.avg_resolution_hours || 0),
    },
    support: {
      open_tickets: Number(report.support?.open_tickets || 0),
      resolved_tickets: Number(report.support?.resolved_tickets || 0),
      escalated_tickets: Number(report.support?.escalated_tickets || 0),
      avg_resolution_hours: Number(report.support?.avg_resolution_hours || 0),
    },
    adminOps: (report.adminOps || []).map((row: any) => ({
      id: String(row.id),
      admin_employee_id: String(row.admin_employee_id || ""),
      full_name: String(row.full_name || ""),
      admin_role: String(row.admin_role || ""),
      verification_decisions: Number(row.verification_decisions || 0),
      disputes_handled: Number(row.disputes_handled || 0),
      support_tickets_handled: Number(row.support_tickets_handled || 0),
      sensitive_access_count: Number(row.sensitive_access_count || 0),
    })),
    note: report.note,
  };

  return (
    <AdminReportsClient
      governanceReport={formattedGovernance}
      indicators={formattedIndicators}
    />
  );
}
