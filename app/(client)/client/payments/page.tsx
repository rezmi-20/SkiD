import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getChapaReceiptUrl } from "@/lib/config";
import { getClientPayments } from "@/lib/actions/payments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { CreditCard, Receipt, ArrowRight } from "lucide-react";
import FadeContent from "@/components/ui/fade-content";

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

function getStatusBadge(status: string) {
  if (status === "released") {
    return (
      <span className="inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
        Released
      </span>
    );
  }
  if (status === "held") {
    return (
      <span className="inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
        Initiated
      </span>
    );
  }
  if (status === "refunded") {
    return (
      <span className="inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
        Refunded
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-surface-container text-on-surface-variant border border-outline-variant/40">
      Unpaid
    </span>
  );
}

export default async function ClientPaymentsPage() {
  const session = await auth();
  if (!session || session.user.role !== "client") redirect("/login");

  const payments = await getClientPayments();

  return (
    <FadeContent blur duration={0.4} className="mx-auto max-w-5xl space-y-6 pb-24 max-w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-1.5 bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm transition-colors duration-300">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Financial Ledger
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Payments</h1>
        <p className="text-sm text-on-surface-variant opacity-75">
          Completed jobs ready for payment and released payment records.
        </p>
      </div>

      {/* ── Main Payment Queue Card ── */}
      <Card className="border border-outline-variant bg-surface-container-lowest shadow-sm rounded-2xl overflow-hidden transition-colors duration-300">
        <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/40 bg-surface-container-low/30 p-5">
          <div className="space-y-1">
            <CardTitle className="text-sm font-bold tracking-tight text-on-surface">Payment Queue</CardTitle>
            <CardDescription className="text-xs text-on-surface-variant opacity-75">
              Pay completed jobs through Chapa and track worker payouts.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-full text-[10px] font-bold border border-outline-variant/30">
            {payments.length} Records
          </Badge>
        </CardHeader>
        
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center mx-auto text-on-surface-variant/60">
                <CreditCard size={22} />
              </div>
              <div className="max-w-xs mx-auto space-y-1">
                <p className="font-bold text-sm text-on-surface">No payments yet</p>
                <p className="text-xs text-on-surface-variant opacity-60 leading-relaxed">
                  Completed jobs will appear here when they are ready for payment.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-surface-container-low/50">
                  <TableRow className="border-b border-outline-variant/40">
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-60 h-11">Job Details</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-60 h-11 text-right">Total Budget</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-60 h-11 text-right">Worker Receives</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-60 h-11 text-center">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-60 h-11 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-outline-variant/30">
                  {payments.map((payment) => {
                    const canPay = ["completed", "payment_pending"].includes(payment.jobStatus) && payment.paymentStatus !== "released";

                    return (
                      <TableRow key={`${payment.jobId}-${payment.paymentId ?? "unpaid"}`} className="border-b border-outline-variant/30 hover:bg-surface-container/30 transition-colors duration-150 group">
                        <TableCell className="py-4">
                          <div className="space-y-1 max-w-[280px]">
                            <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">{payment.jobTitle}</p>
                            <p className="text-xs text-on-surface-variant font-semibold">
                              {payment.workerName} &bull; {formatDate(payment.createdAt)}
                            </p>
                            {payment.chapaRef && (
                              <p className="font-mono text-[9px] text-on-surface-variant opacity-50 truncate">{payment.chapaRef}</p>
                            )}
                            {payment.paymentStatus === "released" && payment.chapaReference && (
                              <div className="pt-1">
                                <a
                                  href={getChapaReceiptUrl(payment.chapaReference)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary hover:underline"
                                >
                                  <Receipt size={12} />
                                  <span>Chapa Receipt</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4 font-extrabold text-sm text-on-surface">
                          {formatMoney(payment.total)}
                        </TableCell>
                        <TableCell className="text-right py-4 font-semibold text-sm text-on-surface-variant">
                          {formatMoney(payment.netAmount)}
                        </TableCell>
                        <TableCell className="text-center py-4">
                          {getStatusBadge(payment.paymentStatus)}
                        </TableCell>
                        <TableCell className="text-right py-4">
                          {canPay && (
                            <Button asChild size="sm" className="rounded-xl h-9 font-bold px-4 active:scale-95 duration-150" variant="default">
                              <Link href={`/client/pay/${payment.jobId}`}>
                                <span>Pay</span>
                                <ArrowRight size={14} className="ml-1" />
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </FadeContent>
  );
}
