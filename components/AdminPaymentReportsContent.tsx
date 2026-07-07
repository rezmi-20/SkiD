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
import { useLanguage } from "@/context/LanguageContext";

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString()} ETB`;
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
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 transition-colors duration-300 shadow-sm">
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
  const { t } = useLanguage();
  const hasChartData = report.monthly.length > 0;

  function formatDate(value: string | null) {
    if (!value) return t("admin.report.notRecorded" as any);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("admin.report.notRecorded" as any);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function statusClass(status: string) {
    if (status === "released") return "bg-primary/10 text-primary";
    if (status === "refunded") return "bg-error/10 text-error";
    return "bg-surface-container-high text-on-surface-variant";
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          {t("admin.report.payments" as any)}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">
          {t("admin.report.revenue" as any)}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-on-surface-variant">
          {t("admin.report.desc" as any)}
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={t("admin.report.released" as any)}
          value={formatMoney(report.totals.releasedVolume)}
          detail={`${report.totals.releasedCount} ${t("admin.report.successful" as any)}`}
          icon="paid"
        />
        <StatTile
          label={t("admin.report.commission" as any)}
          value={formatMoney(report.totals.commissionRevenue)}
          detail={t("admin.report.commissionDesc" as any)}
          icon="account_balance"
        />
        <StatTile
          label={t("admin.report.payouts" as any)}
          value={formatMoney(report.totals.workerPayouts)}
          detail={t("admin.report.payoutsDesc" as any)}
          icon="engineering"
        />
        <StatTile
          label={t("admin.report.pending" as any)}
          value={String(report.totals.pendingCount)}
          detail={`${report.totals.refundedCount} ${t("admin.report.refunded" as any)}`}
          icon="pending_actions"
        />
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 transition-colors duration-300 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-on-surface">
              {t("admin.report.flow" as any)}
            </h2>
            <p className="text-xs text-on-surface-variant">
              {t("admin.report.flowDesc" as any)}
            </p>
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
                <Bar dataKey="grossVolume" name={t("admin.report.gross" as any)} fill="var(--md-sys-color-on-surface)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commissionRevenue" name={t("admin.report.commission" as any)} fill="var(--md-sys-color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="workerPayouts" name={t("admin.report.workerShare" as any)} fill="var(--md-sys-color-outline)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-surface-container-low text-sm font-semibold text-on-surface-variant">
              {t("admin.report.noData" as any)}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest transition-colors duration-300 shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-on-surface">
              {t("admin.report.recent" as any)}
            </h2>
            <p className="text-xs text-on-surface-variant">
              {t("admin.report.recentDesc" as any)}
            </p>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant">
            {report.payments.length} {t("admin.report.records" as any)}
          </span>
        </div>

        {report.payments.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm font-semibold text-on-surface-variant">
            {t("admin.report.none" as any)}
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
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
                  <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                    {t("admin.report.total" as any)}
                  </p>
                  <p className="text-sm font-semibold text-on-surface">{formatMoney(payment.amount)}</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                    {t("admin.report.commission" as any)}
                  </p>
                  <p className="text-sm font-semibold text-on-surface">{formatMoney(payment.commissionAmount)}</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                    {t("admin.report.status" as any)}
                  </p>
                  <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>

                <div className="lg:text-right">
                  <Link
                    href={`/api/payments/${payment.paymentId}/receipt`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high px-3 text-xs font-bold transition-all active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                    {t("admin.report.receipt" as any)}
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
