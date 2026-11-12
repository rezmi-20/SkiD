"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Coins,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Search,
  X,
  UserRound,
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
} from "lucide-react";
import type { AdminPaymentReport, AdminPaymentReportRow } from "@/lib/actions/admin-payments";
import FadeContent from "@/components/ui/fade-content";
import { useLanguage } from "@/context/LanguageContext";
import { PaymentDetailDrawer } from "./admin/payments/PaymentDetailDrawer";

function formatMoney(value: number) {
  return `ETB ${Math.round(value).toLocaleString()}`;
}

function statusClass(status: string) {
  if (status === "released") {
    return "bg-success/10 text-success border-success/20";
  }
  if (status === "refunded") {
    return "bg-destructive/10 text-destructive border-destructive/20";
  }
  return "bg-warning/10 text-warning border-warning/20";
}

const FILTER_TABS = ["all", "released", "held", "refunded"] as const;

export default function AdminPaymentReportsContent({ report }: { report: AdminPaymentReport }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [drawerPayment, setDrawerPayment] = useState<AdminPaymentReportRow | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const hasChartData = report.monthly.length > 0;
  const paymentsList = report.payments || [];

  const query = search.trim().toLowerCase();

  const filteredPayments = useMemo(() => {
    return paymentsList.filter((p) => {
      const matchesFilter = selectedFilter === "all" || p.status === selectedFilter;
      const haystack = [
        p.paymentId,
        p.jobTitle,
        p.clientName,
        p.workerName,
        p.chapaRef,
        p.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [paymentsList, selectedFilter, query]);

  const handleOpenDrawer = (p: AdminPaymentReportRow) => {
    setDrawerPayment(p);
    setIsDrawerOpen(true);
  };

  const inEscrowCustody = Math.max(0, report.totals.grossVolume - report.totals.releasedVolume);

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("admin.payments.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("admin.payments.desc")}
          </p>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards (Reference layout) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Gross Escrow Volume */}
        <div className="rounded-xl p-4 bg-card border border-accent/40 shadow-xs transition-all duration-200">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t("admin.payments.kpi.grossVolume")}</span>
            <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatMoney(report.totals.grossVolume)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Total platform throughput</p>
        </div>

        {/* Card 2: Artisan Payouts Released */}
        <div className="rounded-xl p-4 bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t("admin.payments.kpi.released")}</span>
            <div className="p-1.5 rounded-lg bg-success/10 text-success">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatMoney(report.totals.workerPayouts)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {report.totals.releasedCount} settled releases
          </p>
        </div>

        {/* Card 3: Platform Commission (10%) */}
        <div className="rounded-xl p-4 bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t("admin.payments.kpi.commission")}</span>
            <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatMoney(report.totals.commissionRevenue)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">10% retained earnings</p>
        </div>

        {/* Card 4: In Escrow Custody */}
        <div className="rounded-xl p-4 bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-medium">{t("admin.payments.kpi.inCustody")}</span>
            <div className="p-1.5 rounded-lg bg-warning/10 text-warning">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground font-mono">
            {formatMoney(inEscrowCustody)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {report.totals.pendingCount} milestone holds
          </p>
        </div>
      </div>

      {/* 3. Monthly Escrow Distribution Chart Card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">{t("admin.payments.chart.title")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{t("admin.payments.chart.desc")}</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
              <span>{t("admin.payments.chart.gross")}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>{t("admin.payments.chart.commission")}</span>
            </span>
          </div>
        </div>

        {hasChartData ? (
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.monthly} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "currentColor" }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "currentColor" }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-xl border border-border bg-card shadow-xl p-3 text-xs">
                        <p className="font-semibold text-muted-foreground mb-1">{label}</p>
                        {payload.map((p: any, i: number) => (
                          <p key={i} className="font-bold font-mono" style={{ color: p.color }}>
                            {p.name}: {formatMoney(Number(p.value))}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="grossVolume" name={t("admin.payments.chart.gross")} fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="commissionRevenue" name={t("admin.payments.chart.commission")} fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-muted-foreground">
            {t("admin.payments.chart.noData")}
          </div>
        )}
      </div>

      {/* 4. Floating Search & Filters (deals.tsx pattern - uncontained) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.payments.searchPlaceholder")}
              className="w-72 h-9 pl-9 pr-8 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {FILTER_TABS.map((filter) => {
              const isSelected = selectedFilter === filter;
              const filterLabel =
                filter === "all"
                  ? t("admin.payments.filter.all")
                  : filter === "released"
                  ? t("admin.payments.filter.released")
                  : filter === "held"
                  ? t("admin.payments.filter.held")
                  : filter === "refunded"
                  ? t("admin.payments.filter.refunded")
                  : filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filterLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Separate Data Table Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xs">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                <th className="py-3 px-4">{t("admin.payments.table.job")}</th>
                <th className="py-3 px-4">{t("admin.payments.table.client")} / {t("admin.payments.table.worker")}</th>
                <th className="py-3 px-4">{t("admin.payments.table.amount")}</th>
                <th className="py-3 px-4">{t("admin.payments.kpi.released")}</th>
                <th className="py-3 px-4">{t("admin.payments.kpi.commission")}</th>
                <th className="py-3 px-4">{t("admin.payments.table.status")}</th>
                <th className="py-3 px-4 text-right">{t("admin.payments.inspect")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.map((p) => (
                <tr
                  key={p.paymentId}
                  className="hover:bg-secondary/30 transition-colors group"
                >
                  {/* Job info */}
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground line-clamp-1">{p.jobTitle}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {p.chapaRef || `#${p.paymentId.slice(0, 8)}`}
                      </p>
                    </div>
                  </td>

                  {/* Parties */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <UserRound className="w-3 h-3 text-blue-500 shrink-0" />
                        <span className="font-medium text-foreground truncate max-w-[120px]">
                          {p.clientName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wrench className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="font-medium text-foreground truncate max-w-[120px]">
                          {p.workerName}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Gross Amount */}
                  <td className="py-3 px-4 font-mono font-bold text-foreground">
                    {formatMoney(p.amount)}
                  </td>

                  {/* Net Payout */}
                  <td className="py-3 px-4 font-mono font-bold text-success">
                    {formatMoney(p.netAmount)}
                  </td>

                  {/* Commission */}
                  <td className="py-3 px-4 font-mono font-semibold text-accent">
                    {formatMoney(p.commissionAmount)}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${statusClass(
                        p.status
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                      <span className="capitalize">{p.status}</span>
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenDrawer(p)}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold border border-border transition cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      <span>{t("admin.payments.inspect")}</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <CreditCard className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    <p className="text-xs font-semibold text-foreground">
                      {t("admin.payments.noPayments")}
                    </p>
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="mt-2 text-xs text-accent hover:underline cursor-pointer"
                      >
                        Clear search filter
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Payment Review Drawer */}
      <PaymentDetailDrawer
        payment={drawerPayment}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </FadeContent>
  );
}
