import { getGovernanceReport, getMisuseIndicators } from "@/lib/actions/governance";
import { requireAdminPermission } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Governance Reports | DireSkill Admin",
  description: "Review read-only system-wide operational, audit, appeal, and support governance metrics.",
};

function n(value: unknown) {
  return Number(value || 0).toLocaleString();
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ period?: string; from?: string; to?: string }> }) {
  await requireAdminPermission("reports.read");
  const params = await searchParams;
  const [report, indicators] = await Promise.all([
    getGovernanceReport(params.period || "last_7_days", params.from, params.to),
    getMisuseIndicators(),
  ]);
  if ("error" in report) throw new Error(report.error);
  return (
    <div className="space-y-6 pb-16">
      <header>
        <p className="text-xs font-black uppercase tracking-widest text-primary">Governance Reports</p>
        <h1 className="text-3xl font-black text-on-surface">Read-only System Reports</h1>
      </header>
      <form className="grid gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 md:grid-cols-4">
        <select name="period" defaultValue={params.period || "last_7_days"} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
          <option value="today">Today</option>
          <option value="last_7_days">Last 7 days</option>
          <option value="last_30_days">Last 30 days</option>
          <option value="custom">Custom</option>
        </select>
        <input name="from" type="date" defaultValue={params.from || ""} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <input name="to" type="date" defaultValue={params.to || ""} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <button className="rounded-lg bg-surface-container px-4 text-xs font-black uppercase tracking-widest">Apply</button>
      </form>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Users" rows={[["Clients", report.users.total_clients], ["Workers", report.users.total_workers], ["Verified workers", report.users.verified_workers], ["Verified clients", report.users.verified_clients], ["Pending verification", report.users.pending_verification]]} />
        <Metric title="Jobs" rows={[["Created", report.jobs.jobs_created], ["Active", report.jobs.jobs_active], ["Completed", report.jobs.jobs_completed], ["Disputed", report.jobs.jobs_disputed]]} />
        <Metric title="Payments" rows={[["Verified", report.payments.verified_payments], ["Released", report.payments.released_payments], ["Held", report.payments.held_payments], ["Financial reviews", report.payments.financial_review_cases]]} />
        <Metric title="Disputes" rows={[["Open", report.disputes.open_disputes], ["Under review", report.disputes.under_review_disputes], ["Resolved", report.disputes.resolved_disputes], ["Escalated", report.disputes.escalated_disputes]]} />
        <Metric title="Support" rows={[["Open tickets", report.support.open_tickets], ["Resolved tickets", report.support.resolved_tickets], ["Escalations", report.support.escalations], ["Avg hours", Math.round(Number(report.support.avg_resolution_hours || 0))]]} />
      </div>
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Neutral Admin Operation Metrics</h2>
        <p className="mt-2 text-xs font-bold text-on-surface-variant">{report.note}</p>
        <div className="mt-4 space-y-2">
          {report.adminOps.map((row: any) => (
            <div key={row.id} className="grid gap-3 rounded-lg border border-outline-variant bg-surface-container p-3 text-sm md:grid-cols-6">
              <span className="font-black">{row.admin_employee_id}</span>
              <span>{row.full_name}</span>
              <span>{row.admin_role}</span>
              <span>Verification {n(row.verification_decisions)}</span>
              <span>Support {n(row.support_tickets_handled)}</span>
              <span>Sensitive {n(row.sensitive_access_count)}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Misuse Indicators</h2>
        <div className="mt-4 space-y-2">
          {indicators.map((row: any) => (
            <div key={row.id} className="grid gap-3 rounded-lg border border-outline-variant bg-surface-container p-3 text-sm md:grid-cols-5">
              <span className="font-black">{row.admin_employee_id}</span>
              <span>{row.full_name}</span>
              <span>{row.admin_role}</span>
              <span>{row.misuse_flag}</span>
              <span>FIN {n(row.fin_reveal_count)} - high-risk {n(row.high_risk_count)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ title, rows }: { title: string; rows: Array<[string, unknown]> }) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
      <h2 className="text-sm font-black uppercase tracking-widest">{title}</h2>
      <div className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="font-bold text-on-surface-variant">{label}</span>
            <span className="font-black">{n(value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
