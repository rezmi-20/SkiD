import Link from "next/link";
import { getGovernanceReport, getMisuseIndicators } from "@/lib/actions/governance";
import { requireAdminPermission } from "@/lib/admin-authorization";
import {
  BarChart3,
  Calendar,
  Users,
  Briefcase,
  CreditCard,
  Scale,
  Headphones,
  ShieldAlert,
  Filter,
  RotateCcw,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Governance Reports | DireSkill Admin",
  description: "Review read-only system-wide operational, audit, appeal, and support governance metrics.",
};

function n(value: unknown) {
  return Number(value || 0).toLocaleString();
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  await requireAdminPermission("reports.read");
  const params = await searchParams;

  const [report, indicators] = await Promise.all([
    getGovernanceReport(params.period || "last_7_days", params.from, params.to),
    getMisuseIndicators(),
  ]);

  if ("error" in report) throw new Error(report.error);

  const activePeriod = params.period || "last_7_days";

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary tracking-wide uppercase mb-1.5">
            <BarChart3 className="h-3 w-3" />
            Executive Oversight
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Read-only System Reports
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aggregated operational indicators, platform volume metrics, and impartial staff administration telemetry.
          </p>
        </div>
      </header>

      {/* Date Filter Bar */}
      <form
        method="GET"
        className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              name="period"
              defaultValue={activePeriod}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="all_time">All Time</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">From:</span>
            <input
              name="from"
              type="date"
              defaultValue={params.from || ""}
              className="rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">To:</span>
            <input
              name="to"
              type="date"
              defaultValue={params.to || ""}
              className="rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {params.period && params.period !== "last_7_days" && (
            <Link
              href="/admin/reports"
              className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              Reset
            </Link>
          )}
          <button
            type="submit"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
          >
            <Filter className="h-3 w-3" />
            Apply Filter
          </button>
        </div>
      </form>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="User Accounts"
          icon={<Users className="h-4 w-4 text-primary" />}
          rows={[
            ["Total Clients", report.users.total_clients],
            ["Total Workers", report.users.total_workers],
            ["Verified Workers", report.users.verified_workers],
            ["Verified Clients", report.users.verified_clients],
            ["Pending Identity Verification", report.users.pending_verification],
          ]}
        />
        <MetricCard
          title="Job Execution"
          icon={<Briefcase className="h-4 w-4 text-blue-500" />}
          rows={[
            ["Jobs Created (Period)", report.jobs.jobs_created],
            ["Active In-Progress Jobs", report.jobs.jobs_active],
            ["Completed & Paid", report.jobs.jobs_completed],
            ["Disputed Jobs", report.jobs.jobs_disputed],
          ]}
        />
        <MetricCard
          title="Escrow & Payments"
          icon={<CreditCard className="h-4 w-4 text-emerald-500" />}
          rows={[
            ["Provider Verified Payments", report.payments.verified_payments],
            ["Released to Workers", report.payments.released_payments],
            ["Financial Holds", report.payments.held_payments],
            ["Under Financial Review", report.payments.financial_review_cases],
          ]}
        />
        <MetricCard
          title="Dispute Operations"
          icon={<Scale className="h-4 w-4 text-amber-500" />}
          rows={[
            ["Open Disputes", report.disputes.open_disputes],
            ["Under Evidence Review", report.disputes.under_review_disputes],
            ["Resolved Cases", report.disputes.resolved_disputes],
            ["Escalated Cases", report.disputes.escalated_disputes],
          ]}
        />
        <MetricCard
          title="User Support Tickets"
          icon={<Headphones className="h-4 w-4 text-purple-500" />}
          rows={[
            ["Open Tickets", report.support.open_tickets],
            ["Resolved Tickets", report.support.resolved_tickets],
            ["Escalated Tickets", report.support.escalations],
            ["Avg Resolution Time", `${Math.round(Number(report.support.avg_resolution_hours || 0))} hrs`],
          ]}
        />
      </div>

      {/* Neutral Admin Operation Metrics */}
      <section className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs space-y-0">
        <div className="border-b border-border/60 px-5 py-4 bg-muted/20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Neutral Admin Operation Metrics
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{report.note}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/60 bg-muted/10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verifications</th>
                <th className="px-4 py-3">Disputes</th>
                <th className="px-4 py-3">Support</th>
                <th className="px-4 py-3">Sensitive Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {report.adminOps.map((row: any) => (
                <tr key={row.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-primary">
                    {row.admin_employee_id}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{row.full_name}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">
                    {String(row.admin_role).replaceAll("_", " ")}
                  </td>
                  <td className="px-4 py-3 font-semibold">{n(row.verification_decisions)}</td>
                  <td className="px-4 py-3 font-semibold">{n(row.disputes_handled)}</td>
                  <td className="px-4 py-3 font-semibold">{n(row.support_tickets_handled)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        Number(row.sensitive_access_count) > 5
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {n(row.sensitive_access_count)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Misuse Indicators */}
      <section className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs space-y-0">
        <div className="border-b border-border/60 px-5 py-4 bg-muted/20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <span>Misuse Indicators</span>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Automated statistical variance indicators for supervisor awareness. No disciplinary actions are automated.
          </p>
        </div>

        <div className="divide-y divide-border/60">
          {indicators.map((row: any) => (
            <div
              key={row.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-accent/30 transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">
                    {row.admin_employee_id}
                  </span>
                  <span className="text-xs font-bold text-foreground">{row.full_name}</span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize">
                    {String(row.admin_role).replaceAll("_", " ")}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs shrink-0">
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                    row.misuse_flag === "high_risk_review"
                      ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : row.misuse_flag === "attention_required"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-border bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {row.misuse_flag.replaceAll("_", " ")}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  FIN: <strong className="text-foreground">{n(row.fin_reveal_count)}</strong> · High-Risk:{" "}
                  <strong className="text-foreground">{n(row.high_risk_count)}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Array<[string, unknown]>;
}) {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
        {icon}
      </div>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">{label}</span>
            <span className="font-bold text-foreground font-mono">{typeof value === "number" ? n(value) : String(value ?? 0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
