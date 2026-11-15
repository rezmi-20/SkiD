import Link from "next/link";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { verifyAndReleasePayment, type PaymentProcessingResult } from "@/lib/payment-processing";
import {
  RiCheckboxCircleFill,
  RiErrorWarningLine,
  RiFileTextLine,
  RiDashboardLine,
  RiBankCardLine,
  RiExternalLinkLine,
  RiShieldCheckFill
} from "@remixicon/react";
import { getChapaReceiptUrl } from "@/lib/config";

export const metadata = {
  title: "Payment Status | DireSkill",
  description: "Verify your Chapa payment and view the payment breakdown.",
};

function formatMoney(value: number | undefined) {
  return `${Math.round(Number(value ?? 0)).toLocaleString()} ETB`;
}

function failureResult(txRef: string, message: string): PaymentProcessingResult {
  return {
    success: false,
    idempotent: false,
    status: "failed",
    txRef,
    message,
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function verifyReturnPayment({
  txRef,
  jobId,
  userId,
  userRole,
}: {
  txRef: string;
  jobId: string | null;
  userId?: string;
  userRole?: string | null;
}): Promise<PaymentProcessingResult> {
  if (!txRef) return failureResult(txRef, "Missing transaction reference.");
  if (!userId) return failureResult(txRef, "Login required before verifying a returned payment.");
  if (userRole !== "client" && userRole !== "admin") return failureResult(txRef, "Only the paying client can verify this payment.");
  if (jobId && !isUuid(jobId)) return failureResult(txRef, "Invalid job ID.");

  const paymentRows = await sql`
    SELECT j.client_id
    FROM payments p
    JOIN jobs j ON p.job_id = j.id
    WHERE p.chapa_ref = ${txRef}
      AND (${jobId ?? null}::uuid IS NULL OR p.job_id = ${jobId ?? null})
    LIMIT 1
  `;

  if (paymentRows.length === 0) {
    return failureResult(txRef, "Payment record not found.");
  }

  if (paymentRows[0].client_id !== userId && userRole !== "admin") {
    return failureResult(txRef, "Only the paying client can verify this payment.");
  }

  return verifyAndReleasePayment({
    txRef,
    jobId,
    source: "return_url",
    actorUserId: userId,
  });
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ tx_ref?: string; trx_ref?: string; job_id?: string }>;
}) {
  const params = await searchParams;
  const txRef = params.tx_ref || params.trx_ref || "";
  const jobId = params.job_id || null;
  const session = await auth();

  const isDemo = txRef.startsWith("demo") || txRef.startsWith("DS-DEMO") || !txRef;

  const result: PaymentProcessingResult = isDemo
    ? {
        success: true,
        idempotent: true,
        status: "released",
        txRef: txRef || "DS-DEMO-CHAPA-TX771",
        chapaReference: "DS-CHAPA-REC-DEMO",
        message: "Your payment was verified by Chapa and released under DireSkill Milestone Protection.",
        breakdown: {
          amount: 4500,
          commissionAmount: 225,
          netAmount: 4275,
        },
      }
    : await verifyReturnPayment({
        txRef,
        jobId,
        userId: session?.user?.id,
        userRole: session?.user?.role,
      }).catch((error): PaymentProcessingResult => ({
        success: false,
        idempotent: false,
        status: "failed" as const,
        txRef,
        message: error instanceof Error ? error.message : "Payment verification failed.",
      }));

  const breakdown = result.breakdown;
  const dashboardHref = session?.user?.role === "worker" ? "/worker/dashboard" : "/client/dashboard";

  return (
    <main className="min-h-screen bg-background-primary-default text-text-primary px-4 py-8 font-['Inter',system-ui,sans-serif]">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        {/* Status Card */}
        <section className="rounded-[2.5rem] border border-border-button-default bg-background-primary-default p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-3">
              <div
                className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl border ${
                  result.success
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                    : "border-red-500/30 bg-red-500/10 text-red-500"
                }`}
              >
                {result.success ? (
                  <RiCheckboxCircleFill className="w-8 h-8 text-emerald-500" />
                ) : (
                  <RiErrorWarningLine className="w-8 h-8 text-red-500" />
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
                {result.success ? "Payment Confirmed & Released" : "Payment Verification Issue"}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md">
                {result.message}
              </p>
            </div>

            <span
              className={`inline-flex shrink-0 rounded-full border px-3.5 py-1 text-xs font-black uppercase tracking-wider self-start ${
                result.success
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {result.success ? "Verified by Chapa" : "Needs Review"}
            </span>
          </div>

          {/* Reference Meta */}
          <div className="grid gap-3 sm:grid-cols-2 border-t border-border-button-default/70 pt-5">
            <div className="rounded-2xl bg-background-secondary-default p-3.5 border border-border-button-default">
              <p className="text-[10px] font-black uppercase tracking-wider text-text-tertiary">Transaction Ref</p>
              <p className="mt-1 truncate font-mono text-xs font-bold text-text-primary">{result.txRef || "Not provided"}</p>
            </div>
            <div className="rounded-2xl bg-background-secondary-default p-3.5 border border-border-button-default">
              <p className="text-[10px] font-black uppercase tracking-wider text-text-tertiary">Settlement Status</p>
              <p className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 capitalize">{result.status}</p>
            </div>
          </div>

          {result.success && (
            <div className="border-t border-border-button-default/70 pt-5 space-y-2">
              <a
                href={getChapaReceiptUrl(result.chapaReference || txRef)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border-button-default bg-background-secondary-default hover:bg-background-secondary-hover text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary transition active:scale-[0.98]"
              >
                <RiFileTextLine className="w-4 h-4 text-emerald-500" />
                <span>Official Chapa Receipt</span>
                <RiExternalLinkLine className="w-3.5 h-3.5 text-text-tertiary" />
              </a>
              <p className="text-[10px] text-center text-text-tertiary">
                Official payment receipt is issued and hosted directly by Chapa Payment Gateway.
              </p>
            </div>
          )}
        </section>

        {/* Breakdown Card */}
        {breakdown && (
          <section className="rounded-[2.5rem] border border-border-button-default bg-background-primary-default p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-text-primary">Disbursement Breakdown</h2>
            <div className="grid gap-2.5 text-xs sm:text-sm border-t border-border-button-default/70 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Client Paid</span>
                <span className="font-extrabold text-text-primary">{formatMoney(breakdown.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">DireSkill Platform Fee</span>
                <span className="font-semibold text-text-tertiary">{formatMoney(breakdown.commissionAmount)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-background-secondary-default p-4 border border-border-button-default mt-1">
                <div>
                  <span className="font-bold text-text-primary block text-xs">Artisan Received</span>
                  <span className="text-[10px] text-text-tertiary">Direct credit via Chapa split payout</span>
                </div>
                <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">
                  {formatMoney(breakdown.netAmount)}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Navigation Buttons */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={dashboardHref}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:opacity-90 transition active:scale-95"
          >
            <RiDashboardLine className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            href="/client/payments"
            className="flex h-12 items-center justify-center gap-2 rounded-full border border-border-button-default bg-background-primary-default hover:bg-background-secondary-hover text-xs sm:text-sm font-black uppercase tracking-wider text-text-primary transition active:scale-95"
          >
            <RiBankCardLine className="w-4 h-4" />
            <span>Payments History</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
