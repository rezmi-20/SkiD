"use client";

import { getChapaReceiptUrl } from "@/lib/config";

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

export default function WorkerEarningsContent({ earnings }: WorkerEarningsContentProps) {
  const stats = [
    { label: "Available", value: formatMoney(earnings.availableEarnings), detail: "Released to balance" },
    { label: "Pending", value: formatMoney(earnings.pendingEarnings), detail: "Held payments" },
    { label: "Completed Jobs", value: earnings.completedJobs.toLocaleString(), detail: "Paid jobs" },
    { label: "Platform Fees", value: formatMoney(earnings.commissionFees), detail: "Commission retained" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Earnings</h1>
          <p className="text-sm text-on-surface-variant">
            Payments from completed jobs and platform commission history.
          </p>
        </div>
        <button
          disabled
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-surface-variant px-4 text-xs font-bold uppercase tracking-wide text-on-surface-variant opacity-60"
        >
          <span className="material-symbols-outlined text-[17px]">download</span>
          Export
        </button>
      </div>

      <section className="rounded-lg border border-surface-variant bg-surface-container-lowest p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Total released earnings</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <p className="text-4xl font-bold tracking-tight text-on-surface">{formatMoney(earnings.totalEarnings)}</p>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Commission rate 5%
          </span>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-surface-variant bg-surface-container-lowest p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{stat.label}</p>
            <p className="mt-2 text-xl font-bold text-on-surface">{stat.value}</p>
            <p className="mt-1 text-xs text-on-surface-variant">{stat.detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-surface-variant bg-surface-container-lowest">
        <div className="flex items-center justify-between border-b border-surface-variant px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Transaction History</h2>
            <p className="text-xs text-on-surface-variant">Released and pending payment records.</p>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant">
            {earnings.transactions.length} records
          </span>
        </div>

        {earnings.transactions.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-semibold text-on-surface">No earnings yet</p>
            <p className="mt-1 text-sm text-on-surface-variant">Completed paid jobs will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-variant">
            {earnings.transactions.map((tx) => (
              <div key={tx.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_140px_140px_120px] lg:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-on-surface">{tx.title}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    {tx.client} - {formatDate(tx.createdAt)}
                  </p>
                  {tx.chapaRef && (
                    <p className="mt-1 truncate font-mono text-[11px] text-on-surface-variant">{tx.chapaRef}</p>
                  )}
                  {tx.status === "released" && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {tx.chapaReference && (
                        <a
                          href={getChapaReceiptUrl(tx.chapaReference)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                          Chapa Receipt
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Gross</p>
                  <p className="text-sm font-semibold text-on-surface">{formatMoney(tx.amount)}</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Commission</p>
                  <p className="text-sm font-semibold text-on-surface">{formatMoney(tx.commissionAmount)}</p>
                </div>

                <div className="flex items-center justify-between gap-3 lg:block lg:text-right">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Net</p>
                    <p className="text-sm font-bold text-primary">{formatMoney(tx.netAmount)}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      tx.status === "released"
                        ? "bg-primary/10 text-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {statusLabel(tx.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
