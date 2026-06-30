import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientPayments } from "@/lib/actions/payments";

export const metadata = {
  title: "Payments | DireSkill",
  description: "Review completed job payments and payment status.",
};

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString()} ETB`;
}

function formatDate(value: string | Date | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function statusLabel(status: string) {
  if (status === "released") return "Released";
  if (status === "held") return "Initiated";
  if (status === "refunded") return "Refunded";
  return "Unpaid";
}

export default async function ClientPaymentsPage() {
  const session = await auth();
  if (!session || session.user.role !== "client") redirect("/login");

  const payments = await getClientPayments();

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Payments</h1>
        <p className="text-sm text-on-surface-variant">
          Completed jobs ready for payment and released payment records.
        </p>
      </div>

      <section className="rounded-lg border border-surface-variant bg-surface-container-lowest">
        <div className="flex items-center justify-between border-b border-surface-variant px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-on-surface">Payment Queue</h2>
            <p className="text-xs text-on-surface-variant">Pay completed jobs and track released funds.</p>
          </div>
          <span className="text-xs font-semibold text-on-surface-variant">{payments.length} records</span>
        </div>

        {payments.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm font-semibold text-on-surface">No payments yet</p>
            <p className="mt-1 text-sm text-on-surface-variant">Completed jobs will appear here when they are ready for payment.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-variant">
            {payments.map((payment) => {
              const canPay = payment.jobStatus === "completed" && payment.signedAt && payment.paymentStatus !== "released";

              return (
                <article key={`${payment.jobId}-${payment.paymentId ?? "unpaid"}`} className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_130px_130px_130px] lg:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-on-surface">{payment.jobTitle}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {payment.workerName} - {formatDate(payment.createdAt)}
                    </p>
                    {payment.chapaRef && (
                      <p className="mt-1 truncate font-mono text-[11px] text-on-surface-variant">{payment.chapaRef}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Total</p>
                    <p className="text-sm font-semibold text-on-surface">{formatMoney(payment.total)}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">Worker Receives</p>
                    <p className="text-sm font-semibold text-on-surface">{formatMoney(payment.netAmount)}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3 lg:block lg:text-right">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        payment.paymentStatus === "released"
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {statusLabel(payment.paymentStatus)}
                    </span>
                    {canPay && (
                      <Link
                        href={`/client/pay/${payment.jobId}`}
                        className="mt-0 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-xs font-bold text-on-primary lg:mt-2"
                      >
                        Pay
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
