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
import { Banknote, Landmark, Briefcase, Clock, Receipt, FileText, TrendingUp, Calendar } from "lucide-react";
import type { AdminPaymentReport } from "@/lib/actions/admin-payments";
import { useLanguage } from "@/context/LanguageContext";
import FadeContent from "@/components/ui/fade-content";

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString()} ETB`;
}

function StatTile({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 transition-all duration-200 hover:border-blue-500/30 hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-60">{label}</p>
          <p className="mt-3 truncate text-2xl font-extrabold text-on-surface leading-none">{value}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container text-blue-500">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="mt-3.5 text-xs text-on-surface-variant opacity-60">{detail}</p>
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
    if (status === "released") {
      return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    }
    if (status === "refunded") {
      return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
    }
    return "bg-surface-container text-on-surface-variant border border-outline-variant/40";
  }

  return (
    <FadeContent blur duration={0.4} className="space-y-5 pb-10 max-w-full">
      {/* Page Header */}
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low px-6 py-5 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 dark:text-blue-400">
          {t("admin.portal" as any)}
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold text-on-surface tracking-tight">
          {t("admin.report.revenue" as any)}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant opacity-70">
          {t("admin.report.desc" as any)}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={t("admin.report.released" as any)}
          value={formatMoney(report.totals.releasedVolume)}
          detail={`${report.totals.releasedCount} ${t("admin.report.successful" as any)}`}
          icon={Banknote}
        />
        <StatTile
          label={t("admin.report.commission" as any)}
          value={formatMoney(report.totals.commissionRevenue)}
          detail={t("admin.report.commissionDesc" as any)}
          icon={Landmark}
        />
        <StatTile
          label={t("admin.report.payouts" as any)}
          value={formatMoney(report.totals.workerPayouts)}
          detail={t("admin.report.payoutsDesc" as any)}
          icon={Briefcase}
        />
        <StatTile
          label={t("admin.report.pending" as any)}
          value={String(report.totals.pendingCount)}
          detail={`${report.totals.refundedCount} ${t("admin.report.refunded" as any)}`}
          icon={Clock}
        />
      </section>

      {/* Revenue Performance Chart */}
      <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-on-surface">
              {t("admin.report.flow" as any)}
            </h2>
            <p className="text-xs text-on-surface-variant opacity-60">
              {t("admin.report.flowDesc" as any)}
            </p>
          </div>
        </div>

        <div className="h-[320px] w-full pr-4">
          {hasChartData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--md-sys-color-on-surface)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--md-sys-color-on-surface)" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="commissionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--md-sys-color-primary)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--md-sys-color-primary)" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="payoutsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--md-sys-color-outline)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--md-sys-color-outline)" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-outline-variant)" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: "var(--md-sys-color-on-surface-variant)", fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fill: "var(--md-sys-color-on-surface-variant)", fontSize: 11, fontWeight: 600 }} />
                <Tooltip
                  formatter={(value) => formatMoney(Number(value))}
                  contentStyle={{
                    background: "var(--md-sys-color-surface-container-lowest)",
                    border: "1px solid var(--md-sys-color-outline-variant)",
                    borderRadius: 12,
                    color: "var(--md-sys-color-on-surface)",
                    fontSize: 11,
                    fontWeight: "bold",
                  }}
                />
                <Legend />
                <Bar dataKey="grossVolume" name={t("admin.report.gross" as any)} fill="url(#grossGrad)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commissionRevenue" name={t("admin.report.commission" as any)} fill="url(#commissionGrad)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="workerPayouts" name={t("admin.report.workerShare" as any)} fill="url(#payoutsGrad)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl bg-surface-container-low text-sm font-semibold text-on-surface-variant">
              {t("admin.report.noData" as any)}
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity Logs */}
      <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-on-surface">
              {t("admin.report.recent" as any)}
            </h2>
            <p className="text-xs text-on-surface-variant opacity-60">
              {t("admin.report.recentDesc" as any)}
            </p>
          </div>
          <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full border border-outline-variant/30">
            {report.payments.length} {t("admin.report.records" as any)}
          </span>
        </div>

        {report.payments.length === 0 ? (
          <div className="px-5 py-16 text-center space-y-3">
            <div className="w-12 h-12 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto text-blue-500/60">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-black text-on-surface uppercase tracking-wider">{t("admin.report.none" as any)}</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/40">
            {report.payments.map((payment) => (
              <article
                key={payment.paymentId}
                className="grid gap-4 p-5 lg:grid-cols-[1fr_130px_130px_120px_130px] lg:items-center hover:bg-surface-container/20 transition-colors duration-150 group"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-on-surface group-hover:text-blue-500 transition-colors text-sm">{payment.jobTitle}</p>
                  <p className="mt-1 text-xs text-on-surface-variant opacity-75">
                    {payment.clientName} to {payment.workerName} &bull; {formatDate(payment.createdAt)}
                  </p>
                  {payment.chapaRef && (
                    <p className="mt-1 truncate font-mono text-[10px] text-on-surface-variant opacity-50">{payment.chapaRef}</p>
                  )}
                </div>

                <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-50">{t("admin.report.grossInvoice" as any)}</p>
                  <p className="text-sm font-bold text-on-surface mt-0.5">{formatMoney(payment.amount)}</p>
                </div>

                <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-50">{t("admin.report.platformFee" as any)}</p>
                  <p className="text-sm font-semibold text-on-surface-variant mt-0.5">{formatMoney(payment.commissionAmount)}</p>
                </div>

                <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-50 mb-1">{t("admin.report.status" as any)}</p>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${statusClass(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>

                <div className="lg:text-right">
                  <Link
                    href={`/api/payments/${payment.paymentId}/receipt`}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container text-on-surface hover:text-blue-500 hover:border-blue-500/30 px-3.5 text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    {t("admin.report.receipt" as any)}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </FadeContent>
  );
}
