"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RiBankCardLine,
  RiReceiptLine,
  RiArrowRightLine,
  RiCheckDoubleLine,
  RiShieldCheckFill,
  RiTimeLine,
  RiEyeLine,
  RiAlertLine,
  RiFlashlightFill,
} from "@remixicon/react";
import { getChapaReceiptUrl } from "@/lib/config";
import { cx } from "@/utils/cx";

interface PaymentRecord {
  jobId: string;
  paymentId?: string | null;
  jobTitle: string;
  workerName: string;
  total: number;
  netAmount: number;
  jobStatus: string;
  paymentStatus: string;
  chapaRef?: string | null;
  createdAt: string | Date;
}

const DEMO_PAYMENTS: PaymentRecord[] = [
  {
    jobId: "demo",
    paymentId: "pay-101",
    jobTitle: "Commercial Satellite Dish & LNB Alignment",
    workerName: "Tadesse Hailu",
    total: 4000,
    netAmount: 3800,
    jobStatus: "payment_pending",
    paymentStatus: "held",
    chapaRef: "CP-TXN-2026-9082",
    createdAt: new Date(Date.now() - 864e5).toISOString(),
  },
  {
    jobId: "demo-2",
    paymentId: "pay-102",
    jobTitle: "Master Bathroom Plumbing & Drain Fixtures",
    workerName: "Yonas Mekonnen",
    total: 6500,
    netAmount: 6175,
    jobStatus: "completed",
    paymentStatus: "released",
    chapaRef: "CP-TXN-2026-8814",
    createdAt: new Date(Date.now() - 4 * 864e5).toISOString(),
  },
];

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString()} ETB`;
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "released") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-accent-500/30 bg-accent-500/10 text-accent-700 dark:text-accent-300">
        <RiCheckDoubleLine className="size-3" />
        <span>Released</span>
      </span>
    );
  }
  if (status === "held") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-chart-4/30 bg-chart-4/10 text-chart-4">
        <RiShieldCheckFill className="size-3" />
        <span>Milestone Held</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-border-button-default bg-background-secondary-default text-text-tertiary">
      <RiTimeLine className="size-3" />
      <span>{status}</span>
    </span>
  );
}

export default function ClientPaymentsContent({ payments = [] }: { payments: PaymentRecord[] }) {
  const [showDemo, setShowDemo] = useState(payments.length === 0);
  const displayList = payments.length > 0 ? payments : showDemo ? DEMO_PAYMENTS : [];

  return (
    <div className="space-y-6 pb-24">
      {/* ── Page Header ── */}
      <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 sm:p-8 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent-600">
            Financial Ledger
          </span>
          <span className="size-1.5 rounded-full bg-accent-500" />
          <span className="text-caption-2 text-text-tertiary">Direct Chapa Gateway</span>
        </div>
        <h1 className="text-title-1-medium text-text-primary tracking-tight">Payments & Escrow</h1>
        <p className="text-body-medium text-text-secondary">
          Track locked milestone funds, approve completed job releases, and download Chapa tax receipts.
        </p>
      </div>

      {payments.length === 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-accent-500/30 bg-accent-500/10 p-3.5 text-caption-1-semibold text-text-primary">
          <div className="flex items-center gap-2">
            <RiShieldCheckFill className="size-4 text-accent-600" />
            <span>Zero pending payments in your live database queue.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDemo((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-background-primary-default px-3 py-1.5 text-[11px] font-bold text-accent-600 border border-border-button-default hover:bg-background-secondary-default transition"
          >
            <RiEyeLine className="size-3.5" />
            <span>{showDemo ? "Hide Sample Ledger" : "Inspect Sample Ledger"}</span>
          </button>
        </div>
      )}

      {/* ── Table Card ── */}
      <div className="rounded-3xl border border-border-button-default bg-background-primary-default shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-separator-border flex items-center justify-between">
          <div>
            <h2 className="text-title-3-semibold text-text-primary">Payment Records</h2>
            <p className="text-caption-2 text-text-secondary">
              Settlements processed through Telebirr, CBE Birr, and Chapa Direct.
            </p>
          </div>
          <span className="rounded-full border border-border-button-default bg-background-secondary-default px-3 py-1 text-caption-2 font-bold text-text-secondary">
            {displayList.length} Records
          </span>
        </div>

        {displayList.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-background-secondary-default flex items-center justify-center mx-auto text-text-tertiary">
              <RiBankCardLine className="size-6" />
            </div>
            <div>
              <p className="text-body-medium font-bold text-text-primary">No Payments Yet</p>
              <p className="text-caption-2 text-text-secondary mt-1 max-w-xs mx-auto">
                Completed jobs will automatically appear here when ready for payment release.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-caption-1-semibold">
              <thead className="bg-background-secondary-default border-b border-separator-border text-[10px] uppercase tracking-wider text-text-tertiary">
                <tr>
                  <th className="py-3.5 px-6 text-start">Job & Professional</th>
                  <th className="py-3.5 px-6 text-end">Total Amount</th>
                  <th className="py-3.5 px-6 text-end">Worker Net</th>
                  <th className="py-3.5 px-6 text-center">Milestone Status</th>
                  <th className="py-3.5 px-6 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-separator-border">
                {displayList.map((payment) => {
                  const canPay =
                    ["completed", "payment_pending"].includes(payment.jobStatus) &&
                    payment.paymentStatus !== "released";

                  return (
                    <tr
                      key={`${payment.jobId}-${payment.paymentId ?? "unpaid"}`}
                      className="hover:bg-background-secondary-default/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="space-y-1 max-w-[280px]">
                          <p className="font-bold text-text-primary truncate">{payment.jobTitle}</p>
                          <p className="text-caption-2 text-text-secondary font-medium">
                            {payment.workerName} · {formatDate(payment.createdAt)}
                          </p>
                          {payment.chapaRef && (
                            <p className="font-mono text-[10px] text-text-tertiary">{payment.chapaRef}</p>
                          )}
                          {payment.paymentStatus === "released" && (
                            <a
                              href={getChapaReceiptUrl(payment.chapaRef || "")}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent-600 hover:underline pt-0.5"
                            >
                              <RiReceiptLine className="size-3" />
                              <span>Chapa Receipt</span>
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-end font-bold text-text-primary text-body-medium">
                        {formatMoney(payment.total)}
                      </td>

                      <td className="py-4 px-6 text-end text-text-secondary">
                        {formatMoney(payment.netAmount)}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <StatusBadge status={payment.paymentStatus} />
                      </td>

                      <td className="py-4 px-6 text-end">
                        {canPay ? (
                          <Link
                            href={`/client/pay/${payment.jobId}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-accent-600 px-4 py-2 text-caption-1-semibold font-bold uppercase tracking-wider text-white shadow-xs hover:bg-accent-700 active:scale-95 transition"
                          >
                            <span>Pay</span>
                            <RiArrowRightLine className="size-3.5" />
                          </Link>
                        ) : (
                          <span className="text-caption-2 text-text-tertiary">Settled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
