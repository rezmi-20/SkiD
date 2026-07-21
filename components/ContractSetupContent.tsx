"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { completeContractSetup } from "@/lib/actions/contract-setup";

interface Props {
  role: "client" | "worker";
  completed: boolean;
  completedAt?: string | null;
}

export default function ContractSetupContent({ role, completed, completedAt }: Props) {
  const router = useRouter();
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [acceptedSignatureUse, setAcceptedSignatureUse] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(completed);

  const dashboardHref = role === "worker" ? "/worker/dashboard" : "/client/dashboard";

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
    } catch {
      setError("Unable to complete Contract Setup. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 pb-28">
      <header className="border-b border-outline-variant pb-6">
        <p className="text-xs font-black uppercase tracking-widest text-primary">DireSkill Digital Contracts</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-on-surface md:text-4xl">
          Complete Your Contract Setup
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
          Set up your private Contract PIN before creating or signing digital contracts on DireSkill.
        </p>
      </header>

      {success && (
        <section className="rounded-lg border border-primary/30 bg-primary/10 p-5">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary">check_circle</span>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-primary">Contract Setup Complete</h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {completedAt
                  ? `Completed on ${new Date(completedAt).toLocaleDateString()}.`
                  : "You can now use contract features and sign finalized agreements with your Contract PIN."}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {[
          {
            title: "Electronic Signature",
            body: "Your Contract PIN is used as your electronic signature when you voluntarily sign a finalized DireSkill contract.",
            icon: "draw",
          },
          {
            title: "Privacy Notice",
            body: "DireSkill stores only your hashed PIN. The plain PIN is never saved and cannot be viewed by administrators.",
            icon: "lock",
          },
          {
            title: "Digital Contract Policy",
            body: "A finalized contract becomes read only. Both parties must sign the same finalized version before work begins.",
            icon: "policy",
          },
          {
            title: "User Responsibilities",
            body: "Review every contract carefully, keep your PIN private, and sign only when you understand and agree to all terms.",
            icon: "verified_user",
          },
        ].map((item) => (
          <article key={item.title} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-primary">
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-on-surface">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{item.body}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <form onSubmit={handleSubmit} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-black text-on-surface">Terms and Conditions Summary</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              DireSkill digital contracts record the agreed job details, signatures, timestamps, audit events, document hash, and final PDF evidence. Signing confirms that you read the finalized agreement and voluntarily accept its terms.
            </p>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-outline-variant bg-surface-container p-4">
            <input
              type="checkbox"
              checked={acceptedPolicy}
              onChange={(event) => setAcceptedPolicy(event.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span className="text-sm font-bold leading-6 text-on-surface">
              I have read and understood the Digital Contract Policy.
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-outline-variant bg-surface-container p-4">
            <input
              type="checkbox"
              checked={acceptedSignatureUse}
              onChange={(event) => setAcceptedSignatureUse(event.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            <span className="text-sm font-bold leading-6 text-on-surface">
              I agree to use my Contract PIN as my electronic signature for contracts created through DireSkill.
            </span>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                New PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container px-4 text-center text-lg font-black tracking-[0.4em] text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Confirm PIN
              </label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container px-4 text-center text-lg font-black tracking-[0.4em] text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-error/20 bg-error-container p-4 text-sm font-bold text-on-error-container">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span className="h-4 w-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[18px]">shield_lock</span>
              )}
              {submitting ? "Saving" : "Create Contract PIN"}
            </button>
            <button
              type="button"
              onClick={() => router.push(dashboardHref)}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-lg border border-outline-variant bg-surface-container px-4 text-xs font-black uppercase tracking-widest text-on-surface-variant"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
