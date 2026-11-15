"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  RiArrowLeftSLine,
  RiCheckDoubleLine,
  RiShieldCheckFill,
  RiBankCardLine,
  RiPrinterLine,
  RiRefreshLine,
  RiExternalLinkLine,
  RiSparklingFill,
  RiFileTextLine,
  RiInformationLine,
  RiCheckboxCircleFill,
  RiLock2Fill
} from "@remixicon/react";
import { getChapaReceiptUrl } from "@/lib/config";

/* ── 1. draw-svg Skill: Telebirr Brand Badge Emblem ── */
function TelebirrBadgeSvg({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="32" height="32" rx="8" fill="#0072bc" />
      <path
        d="M8 10 H24 V14 H18 V24 H14 V14 H8 Z"
        fill="#ffffff"
      />
      <circle cx="23" cy="9" r="3" fill="#ffcb05" />
    </svg>
  );
}

/* ── 2. draw-svg Skill: CBE Birr Brand Badge Emblem ── */
function CbeBirrBadgeSvg({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="32" height="32" rx="8" fill="#4a154b" />
      <path
        d="M10 8 H22 C23.1 8 24 8.9 24 10 V22 C24 23.1 23.1 24 22 24 H10 C8.9 24 8 23.1 8 22 V10 C8 8.9 8.9 8 10 8 Z"
        stroke="#f2a900"
        strokeWidth="2"
      />
      <path d="M13 13 H19 M13 16 H18 M13 19 H19" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ── 3. draw-svg Skill: Chapa Verified Gateway Biometric Seal ── */
function ChapaVerifiedGatewaySvg({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="16" cy="16" r="14" fill="#059669" fillOpacity="0.15" stroke="#10b981" strokeWidth="1.5" />
      <path
        d="M10 16.5 L14 20.5 L22 12.5"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Step = "ready" | "processing" | "awaiting" | "confirmed" | "paid";

export interface PaymentPageContentProps {
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
  isDemoMode?: boolean;
}

const PAYMENT_METHODS = [
  { id: "telebirr", name: "Telebirr", icon: TelebirrBadgeSvg, desc: "Instant mobile wallet payment" },
  { id: "cbe_birr", name: "CBE Birr", icon: CbeBirrBadgeSvg, desc: "Commercial Bank of Ethiopia" },
];

const POLL_INTERVAL_MS = 3000;
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
  isDemoMode = false,
}: PaymentPageContentProps) {
  const router = useRouter();
  const hasPendingVerification = !alreadyPaid && paymentStatus === "held" && !!existingTxRef;
  const [step, setStep] = useState<Step>(alreadyPaid ? "paid" : hasPendingVerification ? "awaiting" : "ready");
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [txRef, setTxRef] = useState(existingTxRef ?? (isDemoMode ? "DS-DEMO-TX-77821" : ""));
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [confirmedData, setConfirmedData] = useState<{
    paymentId: string;
    chapaReference: string | null;
    breakdown: { amount: number; commissionAmount: number; netAmount: number };
  } | null>(
    alreadyPaid
      ? {
          paymentId: paymentId || "PAY-CONFIRMED",
          chapaReference: existingTxRef || "DS-CHAPA-REC",
          breakdown: { amount, commissionAmount, netAmount },
        }
      : null
  );

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const verifyingRef = useRef(false);

  const isProcessing = step === "processing";
  const feePercent = Math.round(commissionRate * 100);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const completePaymentFromResponse = useCallback(
    (data: {
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
    },
    [amount, commissionAmount, netAmount]
  );

  const verifyPaymentWithProvider = useCallback(
    async ({ silent = false } = {}) => {
      if (isDemoMode) {
        completePaymentFromResponse({
          paymentId: "DEMO-PAY-RELEASED-99",
          chapaReference: txRef || "DS-DEMO-CHAPA-REF",
          breakdown: { amount, commissionAmount, netAmount },
        });
        return true;
      }

      if (!txRef || verifyingRef.current) return false;
      verifyingRef.current = true;

      try {
        const res = await fetch("/api/payments/chapa", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, txRef }),
        });
        const data = (await readPaymentResponse(res)) as {
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
          setError(
            data.error ||
              data.message ||
              "Payment not confirmed yet. Please complete the payment in the Chapa tab, then try again."
          );
        }
        return false;
      } catch {
        if (!silent) setError("Could not check payment status. Please try again.");
        return false;
      } finally {
        verifyingRef.current = false;
      }
    },
    [amount, commissionAmount, completePaymentFromResponse, isDemoMode, jobId, netAmount, txRef]
  );

  useEffect(() => {
    if (step !== "awaiting" || !txRef || isDemoMode) return;

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
  }, [completePaymentFromResponse, isDemoMode, step, txRef, verifyPaymentWithProvider]);

  useEffect(() => () => stopPolling(), []);

  const handlePay = async () => {
    if (isProcessing) return;
    setStep("processing");
    setError(null);
    setPollCount(0);

    if (isDemoMode) {
      setTimeout(() => {
        setTxRef("DEMO-CHAPA-TX-88219");
        setStep("awaiting");
      }, 700);
      return;
    }

    try {
      const initRes = await fetch("/api/payments/chapa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, method: selectedMethod }),
      });
      const initData = (await readPaymentResponse(initRes)) as {
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

  const handleManualVerify = async () => {
    await verifyPaymentWithProvider();
  };

  return (
    <div className="min-h-screen bg-background-primary-default text-text-primary pb-24 font-['Inter',system-ui,sans-serif]">
      {/* ── Demo / Preview Interactive Mode Banner ── */}
      {isDemoMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 font-bold">
            <div className="flex items-center gap-2">
              <RiSparklingFill className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Inspection Preview Mode — Test the Chapa & Telebirr payment UI interactively</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setStep("ready")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${step === "ready" ? "bg-amber-500 text-black" : "bg-black/10 dark:bg-white/10"}`}
              >
                1. Ready
              </button>
              <button
                type="button"
                onClick={() => setStep("awaiting")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${step === "awaiting" ? "bg-amber-500 text-black" : "bg-black/10 dark:bg-white/10"}`}
              >
                2. Awaiting
              </button>
              <button
                type="button"
                onClick={() => {
                  completePaymentFromResponse({
                    paymentId: "DEMO-PAY-ID",
                    chapaReference: "DS-DEMO-CHAPA-RECEIPT",
                    breakdown: { amount, commissionAmount, netAmount },
                  });
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${step === "confirmed" ? "bg-amber-500 text-black" : "bg-black/10 dark:bg-white/10"}`}
              >
                3. Confirmed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Header ── */}
      <header className="sticky top-0 z-30 border-b border-border-button-default bg-background-primary-default/95 backdrop-blur-md px-4">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border-button-default bg-background-secondary-default hover:bg-background-secondary-hover text-text-primary shadow-xs transition active:scale-95 cursor-pointer"
              aria-label="Go back"
            >
              <RiArrowLeftSLine className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-black tracking-tight text-text-primary">Complete Payment</h1>
              <p className="truncate text-xs text-text-tertiary">{jobTitle}</p>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`rounded-full px-3.5 py-1 text-[11px] font-black uppercase tracking-wider border ${
              step === "paid" || step === "confirmed"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : step === "awaiting" || hasPendingVerification
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-background-secondary-default text-text-secondary border-border-button-default"
            }`}
          >
            {step === "paid" || step === "confirmed"
              ? "Payment Released"
              : step === "awaiting" || hasPendingVerification
              ? "Pending Verification"
              : paymentStatus === "held"
              ? "Initiated"
              : "Ready to Pay"}
          </span>
        </div>
      </header>

      {/* ── Main Container: 2-Col Desktop / 1-Col Mobile ── */}
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px] items-start">
        {/* Main Section */}
        <section className="space-y-6 rounded-[2rem] border border-border-button-default bg-background-primary-default p-6 sm:p-8 shadow-sm">
          {/* Worker Identity Card */}
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-2xl overflow-hidden border border-border-button-default bg-background-secondary-default flex items-center justify-center shadow-xs">
              {workerAvatar ? (
                <img src={workerAvatar} alt={workerName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-black text-text-primary">{workerName?.[0] ?? "W"}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-base font-black text-text-primary">{workerName}</p>
                {workerVerified && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-500">
                    <RiShieldCheckFill className="w-4 h-4" />
                  </span>
                )}
              </div>
              <p className="text-xs text-text-tertiary mt-0.5 font-medium">
                Verified Artisan · DireSkill Milestone Protected
              </p>
            </div>
          </div>

          {/* Transparent Payment Breakdown */}
          <div className="grid gap-3 border-t border-border-button-default/70 pt-5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-text-secondary font-medium">Job Total (Client Milestone Deposit)</span>
              <span className="font-extrabold text-text-primary">{formatMoney(amount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-text-secondary font-medium">DireSkill Platform Fee ({feePercent}%)</span>
              <span className="font-semibold text-text-tertiary">{formatMoney(commissionAmount)}</span>
            </div>

            {/* Worker Net Payout Card */}
            <div className="flex items-center justify-between rounded-2xl bg-background-secondary-default p-4 border border-border-button-default mt-1">
              <div>
                <span className="font-black text-text-primary block text-sm">Artisan Net Payout</span>
                <span className="text-[11px] text-text-tertiary">Direct credit via Chapa split settlement</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatMoney(netAmount)}
              </span>
            </div>
          </div>

          {/* Payment Provider Selector — only when ready */}
          {(step === "ready" || step === "processing") && (
            <div className="space-y-3 border-t border-border-button-default/70 pt-5">
              <p className="text-[11px] font-black uppercase tracking-wider text-text-tertiary">
                Select Ethiopian Payment Method
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] cursor-pointer ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 text-text-primary shadow-sm ring-1 ring-emerald-500"
                          : "border-border-button-default bg-background-secondary-default hover:bg-background-secondary-hover text-text-secondary"
                      }`}
                    >
                      <Icon className="w-8 h-8 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs sm:text-sm text-text-primary leading-tight">{method.name}</p>
                        <p className="text-[10px] text-text-tertiary truncate mt-0.5">{method.desc}</p>
                      </div>
                      {isSelected && (
                        <RiCheckboxCircleFill className="w-5 h-5 text-emerald-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* "Awaiting" Screen with polling animation */}
          {step === "awaiting" && (
            <div className="space-y-4 border-t border-border-button-default/70 pt-5">
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-background-secondary-default border border-border-button-default px-5 py-7 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                <p className="text-base font-black text-text-primary">Waiting for Chapa Confirmation…</p>
                <p className="text-xs leading-relaxed text-text-secondary max-w-sm">
                  Complete your payment in the Chapa tab that opened. This page will update automatically once verified.
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Status checked {pollCount} time{pollCount !== 1 ? "s" : ""}…
                </p>
              </div>

              <button
                type="button"
                onClick={handleManualVerify}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border-button-default bg-background-secondary-default hover:bg-background-secondary-hover text-xs sm:text-sm font-black uppercase tracking-wider text-text-primary transition active:scale-[0.98] cursor-pointer"
              >
                <RiRefreshLine className="w-4 h-4" />
                <span>I have completed payment — Verify Now</span>
              </button>
            </div>
          )}

          {/* Confirmed Screen */}
          {step === "confirmed" && confirmedData && (
            <div className="space-y-4 border-t border-border-button-default/70 pt-5">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-6 text-center">
                <RiCheckboxCircleFill className="w-12 h-12 text-emerald-500" />
                <p className="text-base font-black text-emerald-600 dark:text-emerald-400">Payment Confirmed & Released!</p>
                <p className="text-xs text-text-secondary">
                  The milestone payment has been verified by Chapa and credited directly to the worker.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={getChapaReceiptUrl(confirmedData.chapaReference || txRef)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border-button-default bg-background-secondary-default text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary hover:bg-background-secondary-hover transition active:scale-[0.98]"
                >
                  <RiFileTextLine className="w-4 h-4 text-emerald-500" />
                  <span>Official Chapa Receipt</span>
                  <RiExternalLinkLine className="w-3.5 h-3.5 text-text-tertiary" />
                </a>

                <button
                  type="button"
                  onClick={() => router.push("/client/contracts")}
                  className="flex h-12 flex-1 items-center justify-center rounded-full bg-zinc-950 dark:bg-zinc-100 px-5 text-xs sm:text-sm font-black uppercase tracking-wider text-white dark:text-zinc-950 hover:opacity-90 transition active:scale-[0.98] cursor-pointer"
                >
                  View Contracts
                </button>
              </div>
            </div>
          )}

          {/* Already-paid Screen */}
          {step === "paid" && (
            <div className="flex flex-col gap-3 border-t border-border-button-default/70 pt-5 sm:flex-row">
              {(existingTxRef || txRef) && (
                <a
                  href={getChapaReceiptUrl(existingTxRef || txRef)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border-button-default bg-background-secondary-default text-xs font-bold uppercase tracking-wider text-text-primary hover:bg-background-secondary-hover transition active:scale-[0.98]"
                >
                  <RiFileTextLine className="w-4 h-4 text-emerald-500" />
                  <span>Official Receipt</span>
                  <RiExternalLinkLine className="w-3.5 h-3.5 text-text-tertiary" />
                </a>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border-button-default bg-background-secondary-default text-xs font-bold uppercase tracking-wider text-text-primary hover:bg-background-secondary-hover transition active:scale-[0.98] cursor-pointer"
              >
                <RiPrinterLine className="w-4 h-4" />
                <span>Print Breakdown</span>
              </button>
              <button
                type="button"
                onClick={() => router.push("/client/contracts")}
                className="flex h-12 flex-1 items-center justify-center rounded-full bg-zinc-950 dark:bg-zinc-100 px-5 text-xs font-black uppercase tracking-wider text-white dark:text-zinc-950 hover:opacity-90 transition active:scale-[0.98] cursor-pointer"
              >
                Contracts Hub
              </button>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Pay Primary Button */}
          {(step === "ready" || step === "processing") && (
            <div className="border-t border-border-button-default/70 pt-5">
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="flex h-13 md:h-14 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 dark:bg-zinc-100 px-6 text-sm sm:text-base font-black tracking-tight text-white dark:text-zinc-950 shadow-xl hover:opacity-90 disabled:opacity-50 transition active:scale-[0.98] cursor-pointer"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-950 border-t-transparent animate-spin" />
                ) : (
                  <RiBankCardLine className="w-5 h-5" />
                )}
                <span>{isProcessing ? "Connecting to Chapa…" : `Pay ${formatMoney(amount)} with ${selectedMethod === "telebirr" ? "Telebirr" : "CBE Birr"}`}</span>
              </button>
            </div>
          )}
        </section>

        {/* Aside Sidebar: Milestone Protection & Chapa Verification */}
        <aside className="space-y-5 rounded-[2rem] border border-border-button-default bg-background-primary-default p-6 shadow-sm lg:sticky lg:top-24">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-text-tertiary">Payment Protection</p>
            <p className="mt-1 text-base font-black text-text-primary">
              {step === "paid" || step === "confirmed"
                ? "Paid to Artisan"
                : step === "awaiting"
                ? "Pending Verification"
                : paymentStatus === "held"
                ? "Chapa Payment Initiated"
                : "Ready to Settle"}
            </p>
          </div>

          <div className="space-y-2.5 border-t border-border-button-default/70 pt-4 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-text-secondary">Contract ID</span>
              <span className="truncate font-mono font-bold text-text-primary">{contractId}</span>
            </div>
            {txRef && (
              <div className="flex justify-between gap-3">
                <span className="text-text-secondary">Chapa Ref</span>
                <span className="truncate font-mono font-bold text-emerald-600 dark:text-emerald-400">{txRef}</span>
              </div>
            )}
            {chapaStatus && (
              <div className="flex justify-between gap-3">
                <span className="text-text-secondary">Verification Status</span>
                <span className="truncate font-bold capitalize text-text-primary">
                  {String(chapaStatus).replaceAll("_", " ")}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-border-button-default/70 pt-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
              <ChapaVerifiedGatewaySvg className="w-4 h-4 shrink-0" />
              <span>DireSkill Milestone Protection</span>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              Client payment passes securely through Chapa split settlement. 5% is credited to DireSkill and the 95% net balance is directly released to the verified artisan.
            </p>
          </div>

          {step === "awaiting" && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs leading-relaxed text-emerald-700 dark:text-emerald-400 font-medium">
              Chapa gateway tab is open. Complete your mobile wallet PIN confirmation there, and your official split-receipt will generate automatically here.
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
