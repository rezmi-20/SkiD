"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeContractSetup } from "@/lib/actions/contract-setup";
import {
  RiCheckDoubleLine,
  RiLock2Fill,
  RiFileTextLine,
  RiShieldCheckFill,
  RiArrowLeftSLine,
  RiCheckboxCircleFill,
  RiKeyLine,
  RiPencilLine,
  RiArrowRightLine
} from "@remixicon/react";

/* ── draw-svg Skill: Digital Biometric Contract Seal ── */
function ContractBiometricSealSvg({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="20" cy="20" r="18" fill="#059669" fillOpacity="0.12" stroke="#10b981" strokeWidth="1.5" />
      <path
        d="M20 10 C 25.5 10, 30 14.5, 30 20 C 30 25.5, 25.5 30, 20 30"
        stroke="#10b981"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20 14 C 23.3 14, 26 16.7, 26 20 C 26 23.3, 23.3 26, 20 26"
        stroke="#34d399"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="3" fill="#10b981" />
    </svg>
  );
}

interface Props {
  role: "client" | "worker";
  completed: boolean;
  completedAt?: string | null;
  returnTo?: string;
}

export default function ContractSetupContent({ role, completed, completedAt, returnTo }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const effectiveReturnTo = returnTo || searchParams.get("returnTo") || null;

  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [acceptedSignatureUse, setAcceptedSignatureUse] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(completed);

  const dashboardHref = role === "worker" ? "/worker/dashboard" : "/client/dashboard";
  const backHref = effectiveReturnTo || dashboardHref;

  const canSubmit = useMemo(() => {
    return acceptedPolicy && acceptedSignatureUse && /^\d{4}$/.test(pin) && pin === confirmPin && !submitting;
  }, [acceptedPolicy, acceptedSignatureUse, pin, confirmPin, submitting]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await completeContractSetup({
        pin,
        confirmPin,
        acceptedPolicy,
        acceptedSignatureUse,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      router.refresh();

      if (effectiveReturnTo) {
        setTimeout(() => {
          router.push(effectiveReturnTo);
        }, 1200);
      }
    } catch {
      setError("Unable to complete Contract Setup. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-10 sm:pb-14 pt-2 px-4 sm:px-6 font-['Inter',system-ui,sans-serif] text-text-primary">
      {/* ── Top Header ── */}
      <header className="flex items-center justify-between pb-4 border-b border-border-button-default">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="w-10 h-10 rounded-2xl border border-border-button-default bg-background-secondary-default hover:bg-background-secondary-hover text-text-primary flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer"
            aria-label={effectiveReturnTo ? "Back to previous page" : "Back to dashboard"}
          >
            <RiArrowLeftSLine className="w-6 h-6" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              DireSkill Milestone Security
            </p>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
              Digital Contract PIN Setup
            </h1>
          </div>
        </div>

        <ContractBiometricSealSvg className="w-10 h-10 shrink-0 hidden sm:block" />
      </header>

      {/* ── Already Completed Banner ── */}
      {success && (
        <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:p-6 shadow-sm">
          <div className="flex items-start gap-3.5">
            <RiCheckboxCircleFill className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h2 className="text-sm font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Contract Setup Active & Verified
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {completedAt
                  ? `Your 4-digit signature PIN was configured on ${new Date(completedAt).toLocaleDateString()}.`
                  : "Your 4-digit signature PIN is active. You can create, accept, and sign milestone agreements."}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── 4 Architecture Columns (draw-svg + BoardUI cards) ── */}
      <section className="grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "Electronic Signature",
            body: "Your 4-digit PIN acts as your binding electronic signature when you voluntarily execute an agreement.",
            icon: RiPencilLine,
          },
          {
            title: "Private Hashing",
            body: "DireSkill encrypts and hashes your PIN. Plaintext digits are never saved and cannot be viewed by administrators.",
            icon: RiLock2Fill,
          },
          {
            title: "Milestone Protection",
            body: "Every contract records milestone deliverables, PDF evidence hashes, and timestamps for court-grade security.",
            icon: RiFileTextLine,
          },
          {
            title: "User Control",
            body: "Review every agreement carefully. Sign only when scope, timeline, and milestone disbursements are verified.",
            icon: RiShieldCheckFill,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="rounded-3xl border border-border-button-default bg-background-primary-default p-5 shadow-xs flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-text-primary">{item.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{item.body}</p>
              </div>
            </article>
          );
        })}
      </section>

      {/* ── PIN Setup Form ── */}
      <form
        onSubmit={handleSubmit}
        className="rounded-[2.5rem] border border-border-button-default bg-background-primary-default p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="space-y-2">
          <h2 className="text-base font-black text-text-primary tracking-tight">Terms & Security Authorization</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            DireSkill digital contracts record scope, signatures, audit events, and SHA-256 PDF hashes. Signing confirms that you understand the terms and authorize your Contract PIN as your electronic agreement execution.
          </p>
        </div>

        {/* Checkbox 1 */}
        <label className="flex items-start gap-3 p-4 rounded-2xl border border-border-button-default bg-background-secondary-default hover:bg-background-secondary-hover cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={acceptedPolicy}
            onChange={(event) => setAcceptedPolicy(event.target.checked)}
            className="mt-1 h-4 w-4 accent-emerald-500"
          />
          <span className="text-xs sm:text-sm font-bold text-text-primary leading-snug">
            I have read and agree to the DireSkill Digital Contract & Milestone Protection Policy.
          </span>
        </label>

        {/* Checkbox 2 */}
        <label className="flex items-start gap-3 p-4 rounded-2xl border border-border-button-default bg-background-secondary-default hover:bg-background-secondary-hover cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={acceptedSignatureUse}
            onChange={(event) => setAcceptedSignatureUse(event.target.checked)}
            className="mt-1 h-4 w-4 accent-emerald-500"
          />
          <span className="text-xs sm:text-sm font-bold text-text-primary leading-snug">
            I authorize my 4-digit Contract PIN to execute milestone sign-offs and contract approvals.
          </span>
        </label>

        {/* 4-digit PIN Inputs */}
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-text-tertiary">
              4-Digit Contract PIN
            </label>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="h-14 w-full rounded-2xl border border-border-button-default bg-background-secondary-default px-4 text-center text-2xl font-black tracking-[0.5em] text-text-primary outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-text-tertiary">
              Confirm 4-Digit PIN
            </label>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                className="h-14 w-full rounded-2xl border border-border-button-default bg-background-secondary-default px-4 text-center text-2xl font-black tracking-[0.5em] text-text-primary outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-bold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-13 sm:h-14 flex-1 items-center justify-center gap-2 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs sm:text-sm font-black uppercase tracking-wider shadow-xl hover:opacity-90 disabled:opacity-50 transition active:scale-[0.98] cursor-pointer"
          >
            {submitting ? (
              <div className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-950 border-t-transparent animate-spin" />
            ) : (
              <RiKeyLine className="w-4 h-4" />
            )}
            <span>{submitting ? "Configuring PIN…" : success ? "Update Contract PIN" : "Set Contract PIN"}</span>
          </button>

          {effectiveReturnTo ? (
            <button
              type="button"
              onClick={() => router.push(effectiveReturnTo)}
              className="flex h-13 sm:h-14 sm:w-56 items-center justify-center gap-1.5 rounded-full bg-[#134e27] text-[#a4fe47] hover:bg-[#134e27]/90 text-xs font-black uppercase tracking-wider transition active:scale-[0.98] cursor-pointer"
            >
              <span>Return to Contract</span>
              <RiArrowRightLine className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push(dashboardHref)}
              className="flex h-13 sm:h-14 sm:w-48 items-center justify-center rounded-full border border-border-button-default bg-background-secondary-default text-text-primary hover:bg-background-secondary-hover text-xs font-black uppercase tracking-wider transition active:scale-[0.98] cursor-pointer"
            >
              Dashboard
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
