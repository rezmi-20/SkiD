"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import {
  RiBankCardLine,
  RiArrowLeftSLine,
  RiShieldCheckFill,
  RiSparklingFill,
  RiInformationLine
} from "@remixicon/react";

function formatMoney(value: number) {
  return `${Math.round(value).toLocaleString()} ETB`;
}

export default function CheckoutPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("job_id") || searchParams.get("jobId") || "demo-solar-installation";
  const initialAmount = Number(searchParams.get("amount") || 4500);

  const [jobId, setJobId] = useState(initialJobId);
  const [amount, setAmount] = useState(Number.isFinite(initialAmount) ? initialAmount : 4500);
  const [phone, setPhone] = useState(searchParams.get("phone") || "0915123456");
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
      setError(t("checkout.errJobId") || "Please enter a job ID or use demo.");
      return;
    }

    router.push(`/client/pay/${encodeURIComponent(jobId.trim())}`);
  };

  return (
    <main className="min-h-screen bg-background-primary-default text-text-primary px-4 py-8 font-['Inter',system-ui,sans-serif]">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_360px] items-start">
        <form
          onSubmit={handleSubmit}
          className="rounded-[2.5rem] border border-border-button-default bg-background-primary-default p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border-button-default">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                DireSkill Secure Checkout
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
                {t("checkout.title") || "Milestone Payment Checkout"}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 rounded-2xl border border-border-button-default bg-background-secondary-default hover:bg-background-secondary-hover text-text-primary flex items-center justify-center shadow-xs transition active:scale-95"
            >
              <RiArrowLeftSLine className="w-6 h-6" />
            </button>
          </div>

          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t("checkout.desc") || "Review your milestone payment breakdown and proceed to verified settlement through Chapa, Telebirr, or CBE Birr."}
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-text-tertiary">
                Job or Milestone Reference
              </span>
              <div className="relative">
                <input
                  value={jobId}
                  onChange={(event) => setJobId(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-border-button-default bg-background-secondary-default px-4 text-sm font-semibold text-text-primary outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                  placeholder="e.g. demo-solar-installation"
                />
              </div>
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-text-tertiary">
                Amount (ETB)
              </span>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className="h-12 rounded-2xl border border-border-button-default bg-background-secondary-default px-4 text-sm font-semibold text-text-primary outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-text-tertiary">
                Payer Mobile (Telebirr / CBE)
              </span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-12 rounded-2xl border border-border-button-default bg-background-secondary-default px-4 text-sm font-semibold text-text-primary outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-bold text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="flex h-13 sm:h-14 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 dark:bg-zinc-100 px-6 text-sm sm:text-base font-black tracking-tight text-white dark:text-zinc-950 shadow-xl hover:opacity-90 transition active:scale-[0.98] cursor-pointer"
          >
            <RiBankCardLine className="w-5 h-5" />
            <span>Proceed to Payment Screen</span>
          </button>
        </form>

        <aside className="rounded-[2.5rem] border border-border-button-default bg-background-primary-default p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-text-primary">
            {t("checkout.breakdown") || "Settlement Summary"}
          </h2>

          <div className="grid gap-2.5 text-xs sm:text-sm border-t border-border-button-default/70 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">{t("checkout.clientPays") || "Milestone Amount"}</span>
              <span className="font-extrabold text-text-primary">{formatMoney(breakdown.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">{t("checkout.platformFee") || "Platform Fee (5%)"}</span>
              <span className="font-semibold text-text-tertiary">{formatMoney(breakdown.commission)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-background-secondary-default p-3.5 border border-border-button-default mt-1">
              <div>
                <span className="font-bold text-text-primary block text-xs">{t("checkout.workerReceives") || "Artisan Receives"}</span>
                <span className="text-[10px] text-text-tertiary">Direct credit via Chapa</span>
              </div>
              <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">
                {formatMoney(breakdown.workerShare)}
              </span>
            </div>
          </div>

          <div className="border-t border-border-button-default/70 pt-4 space-y-2 text-xs leading-relaxed text-text-secondary">
            <div className="flex items-center gap-1.5 font-bold text-text-primary">
              <RiShieldCheckFill className="w-4 h-4 text-emerald-500" />
              <span>Milestone Protected Settlement</span>
            </div>
            <p className="text-[11px] text-text-tertiary">
              Funds are held under DireSkill Milestone Protection and released to the verified artisan upon confirmed phase completion.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
