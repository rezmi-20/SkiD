"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString()} ETB`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("job_id") || searchParams.get("jobId") || "";
  const initialAmount = Number(searchParams.get("amount") || 100);

  const [jobId, setJobId] = useState(initialJobId);
  const [amount, setAmount] = useState(Number.isFinite(initialAmount) ? initialAmount : 100);
  const [firstName, setFirstName] = useState(searchParams.get("first_name") || "");
  const [lastName, setLastName] = useState(searchParams.get("last_name") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [phone, setPhone] = useState(searchParams.get("phone") || "0900123456");
  const [error, setError] = useState("");

  const breakdown = useMemo(() => {
    const total = Math.max(Number(amount) || 0, 0);
    const commission = Math.round(total * 0.05);
    return {
      total,
      commission,
      workerShare: Math.max(total - commission, 0),
    };
  }, [amount]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!jobId.trim()) {
      setError("Enter the completed job ID to open its secure Chapa checkout.");
      return;
    }

    router.push(`/client/pay/${encodeURIComponent(jobId.trim())}`);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_340px]">
        <form onSubmit={handleSubmit} className="rounded-lg border border-surface-variant bg-surface-container-lowest p-5">
          <div className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Chapa Checkout</h1>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              Enter the completed job details, then continue to the secure job payment screen.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Completed Job ID</span>
              <input
                value={jobId}
                onChange={(event) => setJobId(event.target.value)}
                className="h-11 rounded-lg border border-surface-variant bg-surface px-3 text-sm font-medium text-on-surface outline-none focus:border-primary"
                placeholder="Job UUID"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Amount</span>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="h-11 rounded-lg border border-surface-variant bg-surface px-3 text-sm font-medium text-on-surface outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Phone</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-11 rounded-lg border border-surface-variant bg-surface px-3 text-sm font-medium text-on-surface outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">First Name</span>
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="h-11 rounded-lg border border-surface-variant bg-surface px-3 text-sm font-medium text-on-surface outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Last Name</span>
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="h-11 rounded-lg border border-surface-variant bg-surface px-3 text-sm font-medium text-on-surface outline-none focus:border-primary"
              />
            </label>

            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-lg border border-surface-variant bg-surface px-3 text-sm font-medium text-on-surface outline-none focus:border-primary"
              />
            </label>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm font-medium text-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-on-primary"
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            Pay with Chapa
          </button>
        </form>

        <aside className="rounded-lg border border-surface-variant bg-surface-container-lowest p-5">
          <h2 className="text-sm font-bold text-on-surface">Payment Breakdown</h2>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Client pays</span>
              <span className="font-semibold text-on-surface">{formatMoney(breakdown.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Platform fee</span>
              <span className="font-semibold text-on-surface">{formatMoney(breakdown.commission)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-surface-container-high px-3 py-2">
              <span className="font-semibold text-on-surface">Worker receives</span>
              <span className="font-bold text-primary">{formatMoney(breakdown.workerShare)}</span>
            </div>
          </div>

          <p className="mt-4 border-t border-surface-variant pt-4 text-xs leading-5 text-on-surface-variant">
            The final charge uses the job budget and client profile saved in DireSkill.
          </p>
        </aside>
      </div>
    </main>
  );
}
