"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

type Step = "summary" | "method" | "processing" | "success";

interface PaymentPageContentProps {
  jobId: string;
  contractId: string;
  jobTitle: string;
  workerName: string;
  workerAvatar: string | null;
  workerVerified: boolean;
  amount: number;
  alreadyPaid: boolean;
  existingTxRef?: string;
}

const PAYMENT_METHODS = [
  {
    id: "telebirr",
    name: "Telebirr",
    description: "Pay via Ethio Telecom Telebirr",
    color: "from-blue-500 to-blue-700",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="white">
        <circle cx="24" cy="24" r="22" fill="rgba(255,255,255,0.15)" />
        <text x="24" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">TB</text>
      </svg>
    ),
  },
  {
    id: "cbe_birr",
    name: "CBE Birr",
    description: "Pay via Commercial Bank of Ethiopia",
    color: "from-green-600 to-green-800",
    icon: (
      <svg viewBox="0 0 48 48" className="w-8 h-8" fill="white">
        <circle cx="24" cy="24" r="22" fill="rgba(255,255,255,0.15)" />
        <text x="24" y="30" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">CBE</text>
      </svg>
    ),
  },
];

export default function PaymentPageContent({
  jobId, contractId, jobTitle, workerName, workerAvatar, workerVerified, amount, alreadyPaid, existingTxRef,
}: PaymentPageContentProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(alreadyPaid ? "success" : "summary");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [txRef, setTxRef] = useState(existingTxRef ?? "");
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingDot, setProcessingDot] = useState(0);

  const handlePay = async () => {
    if (!selectedMethod) return;
    setStep("processing");
    setError(null);

    // Animate processing dots
    const dotInterval = setInterval(() => setProcessingDot(d => (d + 1) % 4), 400);

    try {
      // Step 1: Initiate
      const initRes = await fetch("/api/payments/chapa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, amount, method: selectedMethod }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData.error || "Initiation failed");

      const ref = initData.txRef;
      setTxRef(ref);

      // Simulate processing delay (2 seconds)
      await new Promise(res => setTimeout(res, 2000));

      // Step 2: Confirm
      const confirmRes = await fetch("/api/payments/chapa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, txRef: ref }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmData.error || "Confirmation failed");

      clearInterval(dotInterval);
      setCompletedAt(confirmData.completedAt);
      setStep("success");
    } catch (err: any) {
      clearInterval(dotInterval);
      setError(err.message);
      setStep("method");
    }
  };

  // ─── Processing Screen ─────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-8">
        <div className="relative w-28 h-28">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <motion.div
            className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl filled">payments</span>
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-on-surface">Processing Payment</h2>
          <p className="text-sm text-on-surface-variant">
            Connecting to {selectedMethod === "telebirr" ? "Telebirr" : "CBE Birr"}
            {"...".slice(0, processingDot + 1)}
          </p>
        </div>
        <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl text-xs text-primary font-bold max-w-xs">
          🔒 Test Mode — No real money is transferred
        </div>
      </div>
    );
  }

  // ─── Success Screen ────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-6">
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="w-24 h-24 bg-green-400/10 rounded-[2rem] flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-green-400 text-5xl filled">check_circle</span>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="space-y-2">
          <h1 className="text-2xl font-black text-on-surface">Paid Successfully!</h1>
          <p className="text-sm text-on-surface-variant">Payment for <span className="font-bold text-on-surface">{jobTitle}</span> has been confirmed.</p>
        </motion.div>

        {/* Receipt Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm bg-surface-container-lowest rounded-[2rem] border border-surface-variant p-6 space-y-4 shadow-lg"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant font-bold uppercase tracking-widest">Transaction ID</span>
            <span className="font-black text-on-surface font-mono text-[10px] bg-surface-container-high px-2 py-1 rounded-lg">{txRef}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant font-bold uppercase tracking-widest">Amount</span>
            <span className="font-black text-green-400 text-base">{amount.toLocaleString()} ETB</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-on-surface-variant font-bold uppercase tracking-widest">Status</span>
            <span className="px-3 py-1 bg-green-400/10 text-green-400 rounded-full font-black text-[10px] uppercase tracking-widest">Paid ✓</span>
          </div>
          {completedAt && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-on-surface-variant font-bold uppercase tracking-widest">Date</span>
              <span className="font-bold text-on-surface">{new Date(completedAt).toLocaleString()}</span>
            </div>
          )}
          <div className="pt-2 border-t border-surface-variant/50 text-center text-[9px] text-on-surface-variant opacity-40 font-bold uppercase tracking-widest">
            Simulated — Test Mode Only
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={() => window.print()}
            className="w-full h-14 bg-surface-container-high text-on-surface rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 border border-surface-variant hover:bg-primary/10 hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined">print</span>
            Download Receipt
          </button>
          <button
            onClick={() => router.push("/client/contracts")}
            className="w-full h-14 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-primary/30 active:scale-95 transition-all"
          >
            Back to Contracts
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Main Flow (Summary + Method Selection) ────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-surface-variant px-6 h-16 flex items-center gap-4">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-base font-black text-on-surface">Complete Payment</h1>
          <p className="text-[10px] text-on-surface-variant font-medium truncate max-w-[220px]">{jobTitle}</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-8 space-y-6">
        {/* Test Mode Warning */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl"
        >
          <span className="material-symbols-outlined text-yellow-400 text-[20px] filled shrink-0">science</span>
          <p className="text-xs text-yellow-400 font-bold">Test Mode — This is a simulation. No real money will be transferred.</p>
        </motion.div>

        {/* Worker & Payment Summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-surface-container-lowest rounded-[2rem] p-6 border border-surface-variant shadow-sm space-y-5"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Payment Summary</p>

          {/* Worker */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[1.4rem] overflow-hidden bg-surface-container-high border-2 border-surface-container-highest flex items-center justify-center shrink-0">
              {workerAvatar ? (
                <img src={workerAvatar} alt={workerName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-primary">{workerName?.[0]}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-on-surface">{workerName}</span>
                {workerVerified && <span className="material-symbols-outlined text-primary text-[16px] filled">verified</span>}
              </div>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold opacity-50">Verified Worker</span>
            </div>
          </div>

          <div className="border-t border-surface-variant/50" />

          {/* Amount Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface-variant font-medium">Service Fee</span>
              <span className="font-bold text-on-surface">{Math.round(amount * 0.95).toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-on-surface-variant font-medium">Platform Fee (5%)</span>
              <span className="font-bold text-on-surface">{Math.round(amount * 0.05).toLocaleString()} ETB</span>
            </div>
            <div className="border-t border-surface-variant/50 pt-3 flex justify-between items-center">
              <span className="font-black text-on-surface uppercase tracking-widest text-[10px]">Total Due</span>
              <span className="text-2xl font-black text-primary">{amount.toLocaleString()} ETB</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Method Selection */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface-container-lowest rounded-[2rem] p-6 border border-surface-variant shadow-sm space-y-4"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Select Payment Method</p>
          <div className="grid grid-cols-2 gap-4">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all active:scale-95 ${
                  selectedMethod === method.id
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-surface-container-highest hover:border-primary/30 hover:bg-surface-container-low"
                }`}
              >
                {selectedMethod === method.id && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary text-[14px] filled">check</span>
                  </span>
                )}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center shadow-lg`}>
                  {method.icon}
                </div>
                <div className="text-center">
                  <p className="font-black text-on-surface text-sm">{method.name}</p>
                  <p className="text-[9px] text-on-surface-variant opacity-50 font-medium leading-tight mt-0.5">{method.description}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-error/10 border border-error/20 text-error rounded-2xl text-xs font-bold flex items-center gap-3">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Pay Button */}
        <motion.button
          onClick={handlePay}
          disabled={!selectedMethod}
          whileTap={{ scale: 0.97 }}
          className="w-full h-16 bg-primary text-on-primary rounded-full font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 disabled:opacity-40 transition-all"
        >
          <span className="material-symbols-outlined filled">payments</span>
          Pay {amount.toLocaleString()} ETB Now
        </motion.button>

        <p className="text-center text-[9px] text-on-surface-variant opacity-40 font-bold uppercase tracking-widest pb-4">
          Secured by Chapa • Test Mode Active
        </p>
      </main>
    </div>
  );
}
