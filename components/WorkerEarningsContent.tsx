"use client";

import { useState } from "react";
import { Download, CreditCard, ArrowUpRight, Receipt, Briefcase, Building2, Clock, Landmark, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getChapaReceiptUrl } from "@/lib/config";
import FadeContent from "@/components/ui/fade-content";
import { Separator } from "@/components/ui/separator";

interface Transaction {
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

interface WorkerEarnings {
  totalEarnings: number;
  pendingEarnings: number;
  availableEarnings: number;
  completedJobs: number;
  commissionFees: number;
  transactions: Transaction[];
}

interface WorkerEarningsContentProps {
  earnings: WorkerEarnings;
}

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString()} ETB`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusLabel(status: string) {
  if (status === "released") return "Released";
  if (status === "held") return "Pending";
  if (status === "refunded") return "Refunded";
  return status;
}

function statusClass(status: string) {
  switch (status) {
    case "released":
      return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
    case "held":
      return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    case "refunded":
      return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
    default:
      return "bg-surface-container-high text-on-surface-variant border border-outline-variant/40";
  }
}

export default function WorkerEarningsContent({ earnings }: WorkerEarningsContentProps) {
  const stats = [
    { label: "Available Balance", value: formatMoney(earnings.availableEarnings), detail: "Released payouts", icon: Landmark },
    { label: "Pending Funds", value: formatMoney(earnings.pendingEarnings), detail: "Held in escrow", icon: Clock },
    { label: "Completed Jobs", value: earnings.completedJobs.toLocaleString(), detail: "Successfully billed", icon: Briefcase },
    { label: "Commission Fees", value: formatMoney(earnings.commissionFees), detail: "Platform share (5%)", icon: Building2 },
  ];

  // Process transaction history for visual AreaChart
  const getChartData = () => {
    const grouped = earnings.transactions.reduce((acc: Record<string, number>, tx) => {
      const date = new Date(tx.createdAt);
      if (isNaN(date.getTime())) return acc;
      const month = date.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
      acc[month] = (acc[month] || 0) + tx.netAmount;
      return acc;
    }, {});

    const sortedMonths = Object.keys(grouped).sort((a, b) => {
      const dateA = new Date("01 " + a);
      const dateB = new Date("01 " + b);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedMonths.map((month) => ({
      month,
      Earnings: grouped[month],
    }));
  };

  const chartData = getChartData();
  const hasChartData = chartData.length > 0;

  return (
    <FadeContent blur duration={0.4} className="space-y-6 pb-24 max-w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm transition-colors duration-300">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Financial Dashboard
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mt-0.5">Earnings & Payouts</h1>
          <p className="text-sm text-on-surface-variant opacity-75 mt-0.5">
            Track released payments, pending escrows, and financial statements.
          </p>
        </div>
        <button
          disabled
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-outline-variant/60 bg-surface-container px-4.5 text-xs font-black uppercase tracking-wider text-on-surface-variant opacity-50 select-none shrink-0"
        >
          <Download className="w-4 h-4" />
          Export Statements
        </button>
      </div>

      {/* Main Income Summary Hero Card */}
      <section className="relative overflow-hidden rounded-3xl border border-outline-variant bg-gradient-to-br from-[#0c121e] to-[#060a12] p-6 shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Total Released Income</p>
          <div className="mt-2.5 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-extrabold tracking-tight text-white leading-none">
                {formatMoney(earnings.totalEarnings)}
              </p>
              <p className="text-xs text-zinc-400 mt-2">All payments cleared and sent directly to your registered bank account.</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-primary">
              <TrendingUp className="w-3.5 h-3.5" />
              Commission Rate 5%
            </span>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-outline-variant/70 bg-surface-container-lowest p-5 transition-all duration-200 hover:border-primary/25 hover:shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-60">{stat.label}</p>
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-3.5 text-2xl font-extrabold tracking-tight text-on-surface">{stat.value}</p>
              <p className="mt-1 text-xs text-on-surface-variant opacity-60">{stat.detail}</p>
            </div>
          );
        })}
      </section>

      {/* Analytics Chart */}
      <section className="rounded-2xl border border-outline-variant/75 bg-surface-container-lowest p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-sm font-bold text-on-surface">Income Performance</h2>
          <p className="text-xs text-on-surface-variant opacity-60">Visualize cleared payouts grouped by month.</p>
        </div>

        <div className="h-[240px] w-full pr-4">
          {hasChartData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--md-sys-color-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--md-sys-color-primary)" stopOpacity={0} />
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
                <Area
                  type="monotone"
                  dataKey="Earnings"
                  stroke="var(--md-sys-color-primary)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#earningsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl bg-surface-container/30 text-xs font-bold uppercase tracking-wider text-on-surface-variant opacity-40">
              No historical data available
            </div>
          )}
        </div>
      </section>

      {/* Transaction History Card */}
      <section className="rounded-2xl border border-outline-variant/80 bg-surface-container-lowest overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Transaction Ledger</h2>
            <p className="text-xs text-on-surface-variant opacity-60">Audit trail of cleared payouts, platform shares, and net earnings.</p>
          </div>
          <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full border border-outline-variant/30">
            {earnings.transactions.length} Records
          </span>
        </div>

        {earnings.transactions.length === 0 ? (
          <div className="px-5 py-16 text-center space-y-3">
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/60">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="max-w-xs mx-auto space-y-0.5">
              <p className="text-sm font-black text-on-surface uppercase tracking-wide">No transactions yet</p>
              <p className="text-xs text-on-surface-variant opacity-60">Cleared funds from completed jobs will appear in this ledger.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/40">
            {earnings.transactions.map((tx) => (
              <div
                key={tx.id}
                className="grid gap-4 p-5 lg:grid-cols-[1fr_130px_130px_150px] lg:items-center hover:bg-surface-container/20 transition-colors duration-150 group"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-on-surface group-hover:text-primary transition-colors text-sm">{tx.title}</p>
                  <p className="mt-1 text-xs text-on-surface-variant opacity-75">
                    Client: <span className="font-semibold">{tx.client}</span> &bull; {formatDate(tx.createdAt)}
                  </p>
                  {tx.chapaRef && (
                    <p className="mt-1 truncate font-mono text-[10px] text-on-surface-variant opacity-50">{tx.chapaRef}</p>
                  )}
                  {tx.status === "released" && tx.chapaReference && (
                    <div className="mt-2">
                      <a
                        href={getChapaReceiptUrl(tx.chapaReference)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary hover:underline"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Chapa Receipt
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-50">Gross Invoice</p>
                  <p className="text-sm font-bold text-on-surface mt-0.5">{formatMoney(tx.amount)}</p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-50">Platform Fee</p>
                  <p className="text-sm font-semibold text-on-surface-variant mt-0.5">{formatMoney(tx.commissionAmount)}</p>
                </div>

                <div className="flex items-center justify-between gap-3 lg:block lg:text-right">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-50 lg:hidden">Payout Net</p>
                    <p className="text-sm font-black text-primary lg:mt-0.5">{formatMoney(tx.netAmount)}</p>
                  </div>
                  <span
                    className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${statusClass(tx.status)}`}
                  >
                    {statusLabel(tx.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </FadeContent>
  );
}
