"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminPaymentReport } from "@/lib/actions/admin-payments";

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString()} ETB`;
}

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusClass(status: string) {
  if (status === "released") return "bg-primary/10 text-primary";
  if (status === "refunded") return "bg-error/10 text-error";
  return "bg-surface-container-high text-on-surface-variant";
}

function StatTile({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
}) {
  return (
    <div className="rounded-lg border border-surface-variant bg-surface-container-lowest p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
          <p className="mt-2 truncate text-xl font-bold text-on-surface">{value}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-on-surface-variant">{detail}</p>
    </div>
  );
}

export default function AdminPaymentReportsContent({ report }: { report: AdminPaymentReport }) {
  const hasChartData = report.monthly.length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Payments</p>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Revenue Reports</h1>
        <p className="max-w-2xl text-sm leading-6 text-on-surface-variant">
          Track Chapa payment volume, platform commission, worker payouts, and downloadable receipts.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Released Volume"
          value={formatMoney(report.totals.releasedVolume)}
          detail={`${report.totals.releasedCount} successful payments`}
          icon="paid"
        />
        <StatTile
          label="Commission"
          value={formatMoney(report.totals.commissionRevenue)}
          detail="5% platform revenue"
          icon="account_balance"
        />
        <StatTile
          label="Worker Payouts"
          value={formatMoney(report.totals.workerPayouts)}
          detail="Sent through Chapa split payment"
          icon="engineering"
        />
        <StatTile
          label="Pending"
          value={String(report.totals.pendingCount)}
          detail={`${report.totals.refundedCount} refunded records`}
          icon="pending_actions"
        />
      </section>

      <section className="rounded-lg border border-surface-variant bg-surface-container-lowest p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Monthly Payment Flow</h2>
            <p className="text-xs text-on-surface-variant">Gross payment, commission, and worker share.</p>
          </div>
        </div>

        <div className="h-[320px] w-full">
          {hasChartData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-outline-variant)" />
                <XAxis dataKey="month" tick={{ fill: "var(--md-sys-color-on-surface-variant)", fontSize: 12 }} />
                <YAxis tick={{ fill: "var(--md-sys-color-on-surface-variant)", fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => formatMoney(Number(value))}
                  contentStyle={{
                    background: "var(--md-sys-color-surface-container-lowest)",
                    border: "1px solid var(--md-sys-color-outline-variant)",
                    borderRadius: 8,
                    color: "var(--md-sys-color-on-surface)",
                  }}
                />
                <Legend />
                <Bar dataKey="grossVolume" name="Gross" fill="var(--md-sys-color-on-surface)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commissionRevenue" name="Commission" fill="var(--md-sys-color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="workerPayouts" name="Worker share" fill="var(--md-sys-color-outline)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-surface-container-low text-sm font-semibold text-on-surface-variant">
              No payment data yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-surface-variant bg-surface-container-lowest">
        <div className="flex items-center justify-between border-b border-surface-variant px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Recent Payments</h2>
            <p className="text-xs text-on-surface-variant">Latest Chapa payment records and receipts.</p>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant">{report.payments.length} records</span>
        </div>

        {report.payments.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm font-semibold text-on-surface-variant">
            No payments have been recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-surface-variant">
            {report.payments.map((payment) => (
              <article
                key={payment.paymentId}
                className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_130px_130px_120px_120px] lg:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-on-surface">{payment.jobTitle}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {payment.clientName} to {payment.workerName} - {formatDate(payment.createdAt)}
                  </p>
                  {payment.chapaRef && (
                    <p className="mt-1 truncate font-mono text-[11px] text-on-surface-variant">{payment.chapaRef}</p>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Total</p>
                  <p className="text-sm font-semibold text-on-surface">{formatMoney(payment.amount)}</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Commission</p>
                  <p className="text-sm font-semibold text-on-surface">{formatMoney(payment.commissionAmount)}</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Status</p>
                  <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>

                <div className="lg:text-right">
                  <Link
                    href={`/api/payments/${payment.paymentId}/receipt`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-surface-variant px-3 text-xs font-bold text-on-surface hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    Receipt
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
