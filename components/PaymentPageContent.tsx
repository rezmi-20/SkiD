"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, CheckCircle2, Receipt, Printer, CreditCard, ShieldCheck } from "lucide-react";
import { getChapaReceiptUrl } from "@/lib/config";

type Step = "ready" | "processing" | "awaiting" | "confirmed" | "paid";

interface PaymentPageContentProps {
  jobId: string;
  contractId: string;
  jobTitle: string;
  workerName: string;
  workerAvatar: string | null;
  workerVerified: boolean;
  amount: number;
  commissionAmount: number;
  netAmount: number;
  commissionRate: number;
  paymentStatus: string;
  chapaStatus?: string | null;
  alreadyPaid: boolean;
  paymentId?: string | null;
  existingTxRef?: string;
}

const PAYMENT_METHODS = [
  { id: "telebirr", name: "Telebirr" },
  { id: "cbe_birr", name: "CBE Birr" },
];

const POLL_INTERVAL_MS = 3000; // poll every 3 seconds
const VERIFY_FALLBACK_AFTER_POLLS = 4;

function formatMoney(value: number | string | undefined | null) {
  const num = Number(value || 0);
  return `${Math.round(Number.isFinite(num) ? num : 0).toLocaleString()} ETB`;
}

async function readPaymentResponse(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(res.ok ? "Payment response was invalid." : `Payment request failed (${res.status}).`);
  }
}

function openCheckoutUrl(checkoutUrl: string) {
  const checkoutWindow = window.open(checkoutUrl, "_blank", "noopener,noreferrer");
  if (!checkoutWindow) {
    window.location.href = checkoutUrl;
  }
}

export default function PaymentPageContent({
  jobId,
  contractId,
  jobTitle,
  workerName,
  workerAvatar,
  workerVerified,
  amount,
  commissionAmount,
  netAmount,
  commissionRate,
  paymentStatus,
  chapaStatus,
  alreadyPaid,
  paymentId,
  existingTxRef,
}: PaymentPageContentProps) {
  const router = useRouter();
  const hasPendingVerification = !alreadyPaid && paymentStatus === "held" && !!existingTxRef;
  const [step, setStep] = useState<Step>(alreadyPaid ? "paid" : hasPendingVerification ? "awaiting" : "ready");
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [txRef, setTxRef] = useState(existingTxRef ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [confirmedData, setConfirmedData] = useState<{
    paymentId: string;
    chapaReference: string | null;
    breakdown: { amount: number; commissionAmount: number; netAmount: number };
  } | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const verifyingRef = useRef(false);

  const isProcessing = step === "processing";
  const feePercent = Math.round(commissionRate * 100);

  // --- Polling logic ---
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const completePaymentFromResponse = useCallback((data: {
    paymentId?: string;
    payment_id?: string;
    chapaReference?: string | null;
    breakdown?: { amount: number; commissionAmount: number; netAmount: number };
  }) => {
    stopPolling();
    setConfirmedData({
      paymentId: data.paymentId || data.payment_id || "",
      chapaReference: data.chapaReference ?? null,
      breakdown: data.breakdown || { amount, commissionAmount, netAmount },
    });
    setStep("confirmed");
    setError(null);
  }, [amount, commissionAmount, netAmount]);

  const verifyPaymentWithProvider = useCallback(async ({ silent = false } = {}) => {
    if (!txRef || verifyingRef.current) return false;
    verifyingRef.current = true;

    try {
      const res = await fetch("/api/payments/chapa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, txRef }),
      });
      const data = await readPaymentResponse(res) as {
        success?: boolean;
        status?: string;
        error?: string;
        message?: string;
        paymentId?: string;
        payment_id?: string;
        chapaReference?: string | null;
        breakdown?: { amount: number; commissionAmount: number; netAmount: number };
      };

      if (res.ok && (data.status === "released" || data.success)) {
        completePaymentFromResponse(data);
        return true;
      }

      if (!silent) {
        setError(data.error || data.message || "Payment not confirmed yet. Please complete the payment in the Chapa tab, then try again.");
      }
      return false;
    } catch {
      if (!silent) setError("Could not check payment status. Please try again.");
      return false;
    } finally {
      verifyingRef.current = false;
    }
  }, [completePaymentFromResponse, jobId, txRef]);

  useEffect(() => {
    if (step !== "awaiting" || !txRef) return;

    let attempts = 0;
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status?txRef=${encodeURIComponent(txRef)}`);
        attempts += 1;
        setPollCount(attempts);

        if (!res.ok) {
          if (attempts >= VERIFY_FALLBACK_AFTER_POLLS && attempts % VERIFY_FALLBACK_AFTER_POLLS === 0) {
            await verifyPaymentWithProvider({ silent: true });
          }
          return;
        }

        const data = await res.json();
        if (data.status === "released") {
          completePaymentFromResponse(data);
          return;
        }

        if (attempts >= VERIFY_FALLBACK_AFTER_POLLS && attempts % VERIFY_FALLBACK_AFTER_POLLS === 0) {
          await verifyPaymentWithProvider({ silent: true });
        }
      } catch {
        // silently retry
      }
    }, POLL_INTERVAL_MS);

    return stopPolling;
  }, [completePaymentFromResponse, step, txRef, verifyPaymentWithProvider]);

  // cleanup on unmount
  useEffect(() => () => stopPolling(), []);

  // --- Pay handler ---
  const handlePay = async () => {
    if (isProcessing) return;
    setStep("processing");
    setError(null);
    setPollCount(0);

    try {
      const initRes = await fetch("/api/payments/chapa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, method: selectedMethod }),
      });
      const initData = await readPaymentResponse(initRes) as {
        error?: string;
        txRef?: string;
        checkoutUrl?: string;
      };
      if (!initRes.ok && initRes.status === 409 && initData.txRef) {
        setTxRef(initData.txRef);
        setPollCount(0);
        setStep("awaiting");
        setError(initData.error || "A payment is already pending verification. Complete it in Chapa, then check status here.");
        if (initData.checkoutUrl) openCheckoutUrl(initData.checkoutUrl);
        return;
      }
      if (!initRes.ok) throw new Error(initData.error || "Payment initiation failed");
      if (!initData.txRef) throw new Error("Payment initiation did not return a transaction reference.");
      if (!initData.checkoutUrl) throw new Error("Chapa did not return a checkout URL.");

      const ref = initData.txRef;
      setTxRef(ref);
      setStep("awaiting");

      openCheckoutUrl(initData.checkoutUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setStep("ready");
    }
  };

  // --- Manual verify button ---
  const handleManualVerify = async () => {
    await verifyPaymentWithProvider();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-30 border-b border-outline-variant/60 bg-surface/95 px-4 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-outline-variant/60 bg-surface-container-low text-on-surface hover:border-[#a3e635]/40 transition active:scale-95 cursor-pointer"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-black tracking-tight text-on-surface">Complete Payment</h1>
              <p className="truncate text-xs text-on-surface-variant opacity-70">{jobTitle}</p>
            </div>
          </div>
          <span className="rounded-full border border-outline-variant/60 bg-surface-container px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#a3e635]">
            {step === "paid" || step === "confirmed" ? "Released" : step === "awaiting" || hasPendingVerification ? "Pending Verification" : paymentStatus === "held" ? "Initiated" : "Pending"}
          </span>
        </div>
      </header>

      {/* ── Responsive 2-Col Desktop / 1-Col Mobile Grid ── */}
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px] items-start">
        {/* Main Section */}
        <section className="space-y-6 rounded-3xl border border-outline-variant/60 bg-[#0e141d] p-6 sm:p-8 shadow-sm">
          {/* Worker card */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container ring-2 ring-[#a3e635]/20 shrink-0">
              {workerAvatar ? (
                <img src={workerAvatar} alt={workerName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-black text-[#a3e635]">{workerName?.[0] ?? "W"}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-base font-bold text-on-surface">{workerName}</p>
                {workerVerified && (
                  <span className="material-symbols-outlined text-[18px] text-[#a3e635]">verified</span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant opacity-70">Direct verified payment via Chapa</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid gap-3 border-t border-outline-variant/40 pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant font-medium">Job Total (Client Pays)</span>
              <span className="font-bold text-on-surface">{formatMoney(amount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant font-medium">Platform Fee ({feePercent}%)</span>
              <span className="font-semibold text-on-surface-variant">{formatMoney(commissionAmount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-surface-container p-4 text-sm mt-1">
              <div>
                <span className="font-bold text-on-surface block">Worker Receives</span>
                <span className="text-[11px] text-on-surface-variant opacity-60">Net payout after platform fee</span>
              </div>
              <span className="text-xl font-black text-[#a3e635]">{formatMoney(netAmount)}</span>
            </div>
          </div>

          {/* Method selector — only when ready */}
          {(step === "ready" || step === "processing") && (
            <div className="space-y-3 border-t border-outline-variant/40 pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-70">Payment Provider</p>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex h-12 items-center justify-center rounded-full border text-xs sm:text-sm font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                      selectedMethod === method.id
                        ? "border-[#a3e635] bg-[#a3e635]/15 text-[#a3e635] shadow-[0_0_12px_rgba(163,230,53,0.2)]"
                        : "border-outline-variant/60 bg-surface-container-low text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    {method.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* "Awaiting" screen */}
          {step === "awaiting" && (
            <div className="space-y-4 border-t border-outline-variant/40 pt-5">
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-container/70 border border-outline-variant/60 px-5 py-7 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#a3e635]" />
                <p className="text-base font-black text-on-surface">Waiting for payment confirmation…</p>
                <p className="text-xs leading-relaxed text-on-surface-variant opacity-80 max-w-sm">
                  Complete your payment in the Chapa tab that just opened.<br />
                  This page will update automatically once confirmed.<br />
                  <span className="font-bold text-on-surface">You can view and download your receipt from the Chapa tab.</span>
                </p>
                <p className="text-[11px] text-[#a3e635] font-semibold">Checked {pollCount} time{pollCount !== 1 ? "s" : ""}…</p>
              </div>
              <button
                onClick={handleManualVerify}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#a3e635]/40 bg-[#a3e635]/10 text-xs sm:text-sm font-black uppercase tracking-wider text-[#a3e635] hover:bg-[#a3e635]/20 transition active:scale-[0.98] cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                <span>I have paid — Check Status</span>
              </button>
            </div>
          )}

          {/* Confirmed screen */}
          {step === "confirmed" && confirmedData && (
            <div className="space-y-4 border-t border-outline-variant/40 pt-5">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#a3e635]/30 bg-[#a3e635]/10 px-5 py-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-[#a3e635]" />
                <p className="text-base font-black text-[#a3e635]">Payment Confirmed!</p>
                <p className="text-xs text-on-surface-variant">The payment has been verified and released to the worker.</p>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={getChapaReceiptUrl(confirmedData.chapaReference || txRef)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#a3e635]/60 bg-[#a3e635]/10 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#a3e635] hover:bg-[#a3e635]/20 transition active:scale-[0.98]"
                >
                  <Receipt className="h-4 w-4" />
                  <span>Official Chapa Receipt</span>
                </a>
              </div>

              <button
                onClick={() => router.push("/client/contracts")}
                className="flex h-12 w-full items-center justify-center rounded-full bg-[#a3e635] px-5 text-xs sm:text-sm font-black uppercase tracking-wider text-black hover:opacity-90 shadow-[0_4px_16px_rgba(163,230,53,0.3)] transition active:scale-[0.98] cursor-pointer"
              >
                Back to Contracts
              </button>
            </div>
          )}

          {/* Already-paid screen */}
          {step === "paid" && (
            <div className="flex flex-col gap-3 border-t border-outline-variant/40 pt-5 sm:flex-row">
              {(existingTxRef || txRef) && (
                <a
                  href={getChapaReceiptUrl(existingTxRef || txRef)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#a3e635]/60 bg-[#a3e635]/10 text-xs font-bold uppercase tracking-wider text-[#a3e635] hover:bg-[#a3e635]/20 transition active:scale-[0.98]"
                >
                  <Receipt className="h-4 w-4" />
                  <span>Official Receipt</span>
                </a>
              )}
              <button
                onClick={() => window.print()}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container text-xs font-bold uppercase tracking-wider text-on-surface hover:bg-surface-container-high transition active:scale-[0.98] cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
              <button
                onClick={() => router.push("/client/contracts")}
                className="flex h-12 flex-1 items-center justify-center rounded-full bg-[#a3e635] px-5 text-xs font-black uppercase tracking-wider text-black hover:opacity-90 shadow-[0_4px_16px_rgba(163,230,53,0.3)] transition active:scale-[0.98] cursor-pointer"
              >
                Back to Contracts
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-xs sm:text-sm font-medium text-error">
              {error}
            </div>
          )}

          {/* Pay button — only when ready */}
          {(step === "ready" || step === "processing") && (
            <div className="border-t border-outline-variant/40 pt-5">
              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="flex h-13 md:h-14 w-full items-center justify-center gap-2 rounded-full bg-[#a3e635] px-6 text-sm sm:text-base font-black tracking-tight text-black shadow-[0_4px_18px_rgba(163,230,53,0.35)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98] cursor-pointer"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CreditCard className="h-5 w-5 stroke-[2.5]" />
                )}
                <span>{isProcessing ? "Opening Chapa…" : `Pay ${formatMoney(amount)}`}</span>
              </button>
            </div>
          )}
        </section>

        {/* Aside Sidebar */}
        <aside className="space-y-5 rounded-3xl border border-outline-variant/60 bg-[#0e141d] p-6 shadow-sm lg:sticky lg:top-24">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Payment Status</p>
            <p className="mt-1 text-base font-black text-on-surface">
              {step === "paid" || step === "confirmed"
                ? "Paid to worker"
                : step === "awaiting"
                ? "Pending verification"
                : paymentStatus === "held"
                ? "Chapa payment started"
                : "Ready to pay"}
            </p>
          </div>

          <div className="space-y-2.5 border-t border-outline-variant/40 pt-4 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-on-surface-variant">Contract ID</span>
              <span className="truncate font-mono font-bold text-on-surface">{contractId}</span>
            </div>
            {txRef && (
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Chapa Ref</span>
                <span className="truncate font-mono font-bold text-[#a3e635]">{txRef}</span>
              </div>
            )}
            {chapaStatus && (
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Verification</span>
                <span className="truncate font-bold capitalize text-on-surface">{String(chapaStatus).replaceAll("_", " ")}</span>
              </div>
            )}
          </div>

          <div className="border-t border-outline-variant/40 pt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
              <ShieldCheck size={16} className="text-[#a3e635]" />
              <span>Direct Non-Escrow Settlement</span>
            </div>
            <p className="text-xs leading-relaxed text-on-surface-variant opacity-70">
              The client payment passes securely through Chapa, 5% is recorded as commission, and the remaining balance is directly credited to the verified worker.
            </p>
          </div>

          {step === "awaiting" && (
            <div className="rounded-2xl border border-[#a3e635]/30 bg-[#a3e635]/10 p-3.5 text-xs leading-relaxed text-[#a3e635]">
              <span className="material-symbols-outlined text-[14px] align-middle">open_in_new</span>{" "}
              Chapa opened in a new tab. Complete your payment there — the receipt will stay open so you can save it.
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
