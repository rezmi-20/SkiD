"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  alreadyPaid: boolean;
  existingTxRef?: string;
}

const PAYMENT_METHODS = [
  { id: "telebirr", name: "Telebirr" },
  { id: "cbe_birr", name: "CBE Birr" },
];

const POLL_INTERVAL_MS = 3000; // poll every 3 seconds

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString()} ETB`;
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
  alreadyPaid,
  existingTxRef,
}: PaymentPageContentProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(alreadyPaid ? "paid" : "ready");
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

  const isProcessing = step === "processing";
  const feePercent = Math.round(commissionRate * 100);

  // --- Polling logic ---
  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    if (step !== "awaiting" || !txRef) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status?txRef=${encodeURIComponent(txRef)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "released") {
          stopPolling();
          setConfirmedData({
            paymentId: data.paymentId,
            chapaReference: data.chapaReference,
            breakdown: data.breakdown,
          });
          setStep("confirmed");
        } else {
          setPollCount((c) => c + 1);
        }
      } catch {
        // silently retry
      }
    }, POLL_INTERVAL_MS);

    return stopPolling;
  }, [step, txRef]);

  // cleanup on unmount
  useEffect(() => () => stopPolling(), []);

  // --- Pay handler ---
  const handlePay = async () => {
    if (isProcessing) return;
    setStep("processing");
    setError(null);

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
      if (!initRes.ok) throw new Error(initData.error || "Payment initiation failed");
      if (!initData.txRef) throw new Error("Payment initiation did not return a transaction reference.");
      if (!initData.checkoutUrl) throw new Error("Chapa did not return a checkout URL.");

      const ref = initData.txRef;
      setTxRef(ref);

      // Open Chapa in a NEW TAB — this page becomes the "waiting for confirmation" screen
      window.open(initData.checkoutUrl, "_blank", "noopener,noreferrer");

      // Start waiting for webhook to fire
      setStep("awaiting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setStep("ready");
    }
  };

  // --- Manual verify button ---
  const handleManualVerify = async () => {
    if (!txRef) return;
    try {
      const res = await fetch(`/api/payments/status?txRef=${encodeURIComponent(txRef)}`);
      const data = await res.json();
      if (data.status === "released") {
        stopPolling();
        setConfirmedData({
          paymentId: data.paymentId,
          chapaReference: data.chapaReference,
          breakdown: data.breakdown,
        });
        setStep("confirmed");
      } else {
        setError("Payment not confirmed yet. Please complete the payment in the Chapa tab, then try again.");
      }
    } catch {
      setError("Could not check payment status. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-surface-variant bg-surface/95 px-4 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-surface-variant text-on-surface-variant hover:bg-surface-container-high"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-on-surface">Complete Payment</h1>
              <p className="truncate text-xs text-on-surface-variant">{jobTitle}</p>
            </div>
          </div>
          <span className="rounded-full border border-surface-variant px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
            {step === "paid" || step === "confirmed" ? "Released" : step === "awaiting" ? "Pending" : paymentStatus === "held" ? "Initiated" : "Pending"}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-4 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4 rounded-lg border border-surface-variant bg-surface-container-lowest p-4">
          {/* Worker card */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-surface-variant bg-surface-container-high">
              {workerAvatar ? (
                <img src={workerAvatar} alt={workerName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-primary">{workerName?.[0] ?? "W"}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold text-on-surface">{workerName}</p>
                {workerVerified && (
                  <span className="material-symbols-outlined text-[16px] text-primary">verified</span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant">Chapa payment with platform commission deducted</p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid gap-2 border-t border-surface-variant pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Client pays via Chapa</span>
              <span className="font-semibold text-on-surface">{formatMoney(amount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">Platform fee ({feePercent}%)</span>
              <span className="font-semibold text-on-surface">{formatMoney(commissionAmount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container-high px-3 py-2 text-sm">
              <span className="font-semibold text-on-surface">Worker receives</span>
              <span className="font-bold text-primary">{formatMoney(netAmount)}</span>
            </div>
          </div>

          {/* Method selector — only when ready */}
          {(step === "ready" || step === "processing") && (
            <div className="space-y-3 border-t border-surface-variant pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Payment method</p>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex h-11 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                      selectedMethod === method.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-surface-variant text-on-surface hover:bg-surface-container-high"
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
            <div className="space-y-4 border-t border-surface-variant pt-4">
              <div className="flex flex-col items-center gap-3 rounded-lg bg-surface-container-low px-4 py-6 text-center">
                <span className="material-symbols-outlined animate-spin text-[36px] text-primary">progress_activity</span>
                <p className="text-sm font-bold text-on-surface">Waiting for payment confirmation…</p>
                <p className="text-xs leading-5 text-on-surface-variant">
                  Complete your payment in the Chapa tab that just opened.<br />
                  This page will update automatically once confirmed.<br />
                  <span className="font-semibold text-on-surface">You can view and download your receipt from the Chapa tab — it will stay open.</span>
                </p>
                <p className="text-[11px] text-on-surface-variant">Checked {pollCount} time{pollCount !== 1 ? "s" : ""}…</p>
              </div>
              <button
                onClick={handleManualVerify}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-primary text-sm font-bold text-primary hover:bg-primary/10"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                I have paid — Check Status
              </button>
            </div>
          )}

          {/* Confirmed screen */}
          {step === "confirmed" && confirmedData && (
            <div className="space-y-3 border-t border-surface-variant pt-4">
              <div className="flex flex-col items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-5 text-center">
                <span className="material-symbols-outlined text-[36px] text-primary">check_circle</span>
                <p className="text-sm font-bold text-primary">Payment Confirmed!</p>
                <p className="text-xs text-on-surface-variant">The payment has been verified and released to the worker.</p>
              </div>
              {txRef && (
                <a
                  href={getChapaReceiptUrl(txRef)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-surface-variant text-sm font-bold text-on-surface hover:bg-surface-container-high"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  Chapa Receipt
                </a>
              )}
              <button
                onClick={() => router.push("/client/contracts")}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-on-primary"
              >
                Back to Contracts
              </button>
            </div>
          )}

          {/* Already-paid screen */}
          {step === "paid" && (
            <div className="flex flex-col gap-2 border-t border-surface-variant pt-4 sm:flex-row">
              <button
                onClick={() => window.print()}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-surface-variant text-sm font-bold text-on-surface hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                Print
              </button>
              <button
                onClick={() => router.push("/client/contracts")}
                className="flex h-11 flex-1 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-on-primary"
              >
                Back to Contracts
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm font-medium text-error">
              {error}
            </div>
          )}

          {/* Pay button — only when ready */}
          {(step === "ready" || step === "processing") && !error && (
            <div className="border-t border-surface-variant pt-4">
              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isProcessing ? "progress_activity" : "payments"}
                </span>
                {isProcessing ? "Opening Chapa…" : `Pay ${formatMoney(amount)}`}
              </button>
            </div>
          )}
        </section>

        <aside className="space-y-4 rounded-lg border border-surface-variant bg-surface-container-lowest p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Payment status</p>
            <p className="mt-1 text-sm font-semibold text-on-surface">
              {step === "paid" || step === "confirmed"
                ? "Paid to worker"
                : step === "awaiting"
                ? "Waiting for Chapa confirmation"
                : paymentStatus === "held"
                ? "Chapa payment started"
                : "Ready to pay"}
            </p>
          </div>

          <div className="space-y-2 border-t border-surface-variant pt-4 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-on-surface-variant">Contract</span>
              <span className="truncate font-mono text-xs text-on-surface">{contractId}</span>
            </div>
            {txRef && (
              <div className="flex justify-between gap-3">
                <span className="text-on-surface-variant">Chapa ref</span>
                <span className="truncate font-mono text-xs text-on-surface">{txRef}</span>
              </div>
            )}
          </div>

          <p className="border-t border-surface-variant pt-4 text-xs leading-5 text-on-surface-variant">
            Test mode is active. The client payment passes through the platform, 5% is recorded as commission, and the remaining balance is credited to the worker.
          </p>

          {step === "awaiting" && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-3 text-xs leading-5 text-primary">
              <span className="material-symbols-outlined text-[14px] align-middle">open_in_new</span>{" "}
              Chapa opened in a new tab. Complete your payment there — the receipt will stay open so you can save it.
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
