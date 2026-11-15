"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import FadeContent from "@/components/ui/fade-content";
import { getChapaReceiptUrl } from "@/lib/config";
import {
  RiDownload2Line,
  RiBankCardLine,
  RiShieldCheckFill,
  RiTimeLine,
  RiBriefcaseLine,
  RiBuilding2Line,
  RiArrowRightUpLine,
  RiReceiptLine,
  RiCheckboxCircleFill,
} from "@remixicon/react";

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

const DEMO_WORKER_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-demo-1",
    jobId: "demo-job-1",
    title: "Commercial Satellite Dish & LNB Alignment",
    client: "Almaz Bekele",
    amount: 4000,
    commissionAmount: 200,
    netAmount: 3800,
    status: "released",
    chapaRef: "CP-TXN-2026-9082",
    chapaReference: "CP-TXN-2026-9082",
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
  },
  {
    id: "tx-demo-2",
    jobId: "demo-job-2",
    title: "Piassa Villa Plumbing & Fixture Installation",
    client: "Dawit Haile",
    amount: 6500,
    commissionAmount: 325,
    netAmount: 6175,
    status: "held",
    chapaRef: "CP-TXN-2026-8814",
    chapaReference: "CP-TXN-2026-8814",
    createdAt: new Date(Date.now() - 12 * 864e5).toISOString(),
  },
  {
    id: "tx-demo-3",
    jobId: "demo-job-3",
    title: "Residential Electrical Distribution Box Wiring",
    client: "Solomon Kassa",
    amount: 5200,
    commissionAmount: 260,
    netAmount: 4940,
    status: "released",
    chapaRef: "CP-TXN-2026-7719",
    chapaReference: "CP-TXN-2026-7719",
    createdAt: new Date(Date.now() - 35 * 864e5).toISOString(),
  },
];

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
  if (status === "held") return "Milestone Protected";
  if (status === "refunded") return "Refunded";
  return status;
}

function statusClass(status: string) {
  switch (status) {
    case "released":
      return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/40";
    case "held":
      return "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40 dark:border-amber-700/40";
    case "refunded":
      return "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300/40 dark:border-rose-700/40";
    default:
      return "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700";
  }
}

/* ── draw-svg Skill: Topographic Contour Vector Background Texture ─────────── */
function TopographicContourSvg({ className = "absolute inset-0 w-full h-full pointer-events-none opacity-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="none" aria-hidden="true">
      <path d="M-50 120 C 150 70, 260 170, 460 120 C 660 70, 760 150, 900 90" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.45" />
      <path d="M-50 150 C 120 100, 230 200, 430 150 C 630 100, 730 180, 900 120" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
      <path d="M-50 90 C 180 40, 290 140, 490 90 C 690 40, 790 120, 900 60" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.25" />
    </svg>
  );
}

export default function WorkerEarningsContent({ earnings }: WorkerEarningsContentProps) {
  const [showDemo, setShowDemo] = useState(earnings.transactions.length === 0);
  const isDemoActive = showDemo && earnings.transactions.length === 0;

  const activeTransactions = isDemoActive ? DEMO_WORKER_TRANSACTIONS : earnings.transactions;
  const totalEarn = isDemoActive ? 15700 : earnings.totalEarnings;
  const availEarn = isDemoActive ? 8740 : earnings.availableEarnings;
  const pendEarn = isDemoActive ? 6175 : earnings.pendingEarnings;
  const compJobs = isDemoActive ? 3 : earnings.completedJobs;
  const commFees = isDemoActive ? 785 : earnings.commissionFees;

  const stats = [
    { label: "Available Balance", value: formatMoney(availEarn), detail: "Direct released payouts", icon: RiBankCardLine },
    { label: "Protected Funds", value: formatMoney(pendEarn), detail: "Under Milestone Protection", icon: RiShieldCheckFill },
    { label: "Completed Jobs", value: compJobs.toLocaleString(), detail: "Successfully executed", icon: RiBriefcaseLine },
    { label: "Commission Fees", value: formatMoney(commFees), detail: "Platform share (5%)", icon: RiBuilding2Line },
  ];

  // Process transaction history for AreaChart
  const getChartData = () => {
    const grouped = activeTransactions.reduce((acc: Record<string, number>, tx) => {
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

  const handleExportStatements = () => {
    const headers = ["Transaction ID", "Job Title", "Client", "Gross Amount (ETB)", "Commission Fee (ETB)", "Net Earnings (ETB)", "Status", "Reference", "Date"];
    const rows = activeTransactions.map((tx) => [
      `"${tx.id}"`,
      `"${(tx.title || "Job").replace(/"/g, '""')}"`,
      `"${(tx.client || "Client").replace(/"/g, '""')}"`,
      (tx.amount || 0).toFixed(2),
      (tx.commissionAmount || 0).toFixed(2),
      (tx.netAmount || 0).toFixed(2),
      `"${tx.status || "completed"}"`,
      `"${tx.chapaReference || tx.chapaRef || "N/A"}"`,
      `"${formatDate(tx.createdAt)}"`,
    ]);

    rows.push([]);
    rows.push([
      `"SUMMARY"`,
      `"Total Released: ${(earnings.totalEarnings || 0).toFixed(2)} ETB"`,
      `"Total Protected: ${(earnings.pendingEarnings || 0).toFixed(2)} ETB"`,
      (earnings.totalEarnings || 0).toFixed(2),
      (earnings.commissionFees || 0).toFixed(2),
      (earnings.availableEarnings || 0).toFixed(2),
      `"COMPLETED"`,
      `"Jobs: ${earnings.completedJobs || 0}"`,
      `"${new Date().toLocaleDateString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `DireSkill_Earnings_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 md:space-y-8 font-['Inter',system-ui,sans-serif] text-zinc-900 dark:text-zinc-100 pb-10 sm:pb-12">
      
      {/* ── Top Header Card (with Topographic Contour Aesthetic) ── */}
      <div className="relative rounded-[2rem] bg-[#111216] dark:bg-zinc-950 text-white p-6 sm:p-8 overflow-hidden border border-zinc-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <TopographicContourSvg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 text-white" />

        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Direct Milestone Settlements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
            Earnings & Payout Ledger
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed">
            Track cleared payments, milestone release receipts, and direct bank deposits without custodial holding.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            type="button"
            onClick={handleExportStatements}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 px-5 text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <RiDownload2Line className="size-4" />
            <span>Export Statement (CSV)</span>
          </button>
        </div>
      </div>

      {/* ── Main Income Summary Hero Card ── */}
      <div className="rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Total Released Income
          </span>
          <p className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-none">
            {formatMoney(totalEarn)}
          </p>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Cleared milestone payouts sent directly to your account with 0 escrow delays.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
          <RiArrowRightUpLine className="size-4" />
          <span>DireSkill Fixed Fee 5%</span>
        </div>
      </div>

      {/* ── 4-Metric Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-[1.75rem] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-5 space-y-2 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className="size-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                  <Icon className="size-4" />
                </div>
              </div>

              <p className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                {stat.value}
              </p>

              <p className="text-[11px] text-zinc-400 font-medium">
                {stat.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Analytics Chart ── */}
      <div className="rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
            Income Distribution Over Time
          </h2>
          <p className="text-xs text-zinc-400">
            Monthly cleared payouts released upon client milestone verification.
          </p>
        </div>

        <div className="h-[250px] w-full">
          {hasChartData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="workerEarningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} />
                <Tooltip
                  formatter={(value) => formatMoney(Number(value))}
                  contentStyle={{
                    background: "#111216",
                    border: "1px solid #27272a",
                    borderRadius: 16,
                    color: "#ffffff",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Earnings"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#workerEarningsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-xs font-semibold text-zinc-400">
              No historical payment trends yet
            </div>
          )}
        </div>
      </div>

      {/* ── Transaction Ledger Table ── */}
      <div className="rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              Transaction Ledger
            </h2>
            <p className="text-xs text-zinc-400">
              Audit trail of cleared payouts, platform shares, and net earnings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {earnings.transactions.length === 0 && (
              <button
                type="button"
                onClick={() => setShowDemo((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition"
              >
                <span>{showDemo ? "Hide Sample Data" : "Inspect Sample Transactions"}</span>
              </button>
            )}
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {activeTransactions.length} Records
            </span>
          </div>
        </div>

        {activeTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <RiReceiptLine className="size-10 text-zinc-400 mx-auto" />
            <p className="text-sm font-bold text-zinc-900 dark:text-white">
              No transactions recorded yet
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Cleared funds from completed jobs will appear in this ledger.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {activeTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-5 sm:p-6 grid gap-4 lg:grid-cols-[1fr_140px_140px_160px] lg:items-center hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                    {tx.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Client: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{tx.client}</span> • {formatDate(tx.createdAt)}
                  </p>
                  {tx.chapaRef && (
                    <p className="text-[10px] font-mono text-zinc-400 mt-0.5 truncate">
                      Ref: {tx.chapaRef}
                    </p>
                  )}
                  {tx.status === "released" && (
                    <div className="mt-2">
                      <a
                        href={getChapaReceiptUrl(tx.chapaRef)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <RiReceiptLine className="size-3.5" />
                        <span>Chapa Official Receipt</span>
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Gross Invoice
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">
                    {formatMoney(tx.amount)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Platform Fee (5%)
                  </span>
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                    {formatMoney(tx.commissionAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between lg:block lg:text-right">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block lg:hidden">
                      Payout Net
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(tx.netAmount)}
                    </span>
                  </div>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide mt-1.5 ${statusClass(tx.status)}`}>
                    {statusLabel(tx.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
