import Link from "next/link";
import { auth } from "@/lib/auth";
import { getChapaReceiptUrl } from "@/lib/config";
import { verifyAndReleasePayment, type PaymentProcessingResult } from "@/lib/payment-processing";




export const metadata = {
  title: "Payment Status | DireSkill",
  description: "Verify your Chapa payment and view the payment breakdown.",
};

function formatMoney(value: number | undefined) {
  return `${Math.round(Number(value ?? 0)).toLocaleString()} ETB`;
}

function statusTone(success: boolean) {
  return success
    ? "border-primary/30 bg-primary/10 text-primary"
    : "border-error/30 bg-error/10 text-error";
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

  const result: PaymentProcessingResult = txRef
    ? await verifyAndReleasePayment({
        txRef,
        jobId,
        source: "return_url",
        actorUserId: session?.user?.id ?? null,
      }).catch((error): PaymentProcessingResult => ({
        success: false,
        idempotent: false,
        status: "failed" as const,
        txRef,
        message: error instanceof Error ? error.message : "Payment verification failed.",
      }))
    : {
        success: false,
        idempotent: false,
        status: "failed" as const,
        txRef,
        message: "Missing transaction reference.",
      };

  const breakdown = result.breakdown;
  const dashboardHref = session?.user?.role === "worker" ? "/worker/dashboard" : "/client/dashboard";

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <section className="rounded-lg border border-surface-variant bg-surface-container-lowest p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border ${statusTone(result.success)}`}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {result.success ? "check_circle" : "error"}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-on-surface">
                {result.success ? "Payment Confirmed" : "Payment Not Confirmed"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{result.message}</p>
            </div>

            <span
              className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusTone(result.success)}`}
            >
              {result.success ? (result.idempotent ? "Already verified" : "Verified") : "Needs review"}
            </span>
          </div>

          <div className="mt-5 grid gap-3 border-t border-surface-variant pt-5 sm:grid-cols-2">
            <div className="rounded-lg bg-surface-container-low px-3 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Transaction Ref</p>
              <p className="mt-1 truncate font-mono text-xs font-semibold text-on-surface">{txRef || "Not provided"}</p>
            </div>
            <div className="rounded-lg bg-surface-container-low px-3 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Status</p>
              <p className="mt-1 text-sm font-semibold text-on-surface">{result.status}</p>
            </div>
          </div>

          {result.success && result.chapaReference && (
            <div className="mt-5 border-t border-surface-variant pt-5 flex flex-col gap-2">
              <a
                href={getChapaReceiptUrl(result.chapaReference)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/95 px-4 text-sm font-bold text-on-primary transition-colors duration-200"
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                Chapa Receipt
              </a>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-surface-variant bg-surface-container-lowest p-5">
          <h2 className="text-sm font-bold text-on-surface">Transaction Breakdown</h2>
          <div className="mt-4 grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Client paid</span>
              <span className="font-semibold text-on-surface">{formatMoney(breakdown?.amount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Platform commission</span>
              <span className="font-semibold text-on-surface">{formatMoney(breakdown?.commissionAmount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container-high px-3 py-2 text-sm">
              <span className="font-semibold text-on-surface">Worker receives</span>
              <span className="font-bold text-primary">{formatMoney(breakdown?.netAmount)}</span>
            </div>
          </div>
        </section>

        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            href={dashboardHref}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-on-primary"
          >
            <span className="material-symbols-outlined text-[18px]">dashboard</span>
            Go to Dashboard
          </Link>
          <Link
            href="/client/payments"
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-surface-variant bg-surface-container-lowest px-4 text-sm font-bold text-on-surface hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            Make Another Payment
          </Link>
        </div>
      </div>
    </main>
  );
}
