"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signContract } from "@/lib/actions/contracts";
import PinVerificationModal from "./ui/PinVerificationModal";
import StatusBadge from "./ui/StatusBadge";

interface Props {
  contract: any;
  userId: string;
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Pending";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value || 0);
  return `${amount.toLocaleString()} ETB`;
}

function SignatureRow({ label, name, signedAt }: { label: string; name: string | null; signedAt?: string | Date | null }) {
  const signed = !!signedAt;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</p>
        <p className="mt-1 truncate text-sm font-black text-on-surface">{name || "Unknown"}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={`material-symbols-outlined text-[18px] ${signed ? "text-primary" : "text-on-surface-variant"}`}>
          {signed ? "check_circle" : "schedule"}
        </span>
        <div className="text-right">
          <p className={`text-xs font-black ${signed ? "text-primary" : "text-on-surface-variant"}`}>
            {signed ? "Signed" : "Pending"}
          </p>
          <p className="text-[10px] text-on-surface-variant">{formatDate(signedAt)}</p>
        </div>
      </div>
    </div>
  );
}

export default function ContractDetails({ contract, userId }: Props) {
  const router = useRouter();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const isClient = userId === contract.client_id;
  const backHref = isClient ? "/client/contracts" : "/worker/contracts";
  const hasClientSigned = !!contract.client_signed_at;
  const hasWorkerSigned = !!contract.worker_signed_at;
  const isFullySigned = hasClientSigned && hasWorkerSigned;
  const userHasSigned = isClient ? hasClientSigned : hasWorkerSigned;
  const signatureStatus = contract.signature_status || (isFullySigned ? "active" : hasClientSigned ? "pending_worker" : "pending_client");

  const handleSign = async (pin: string) => {
    setIsSigning(true);
    setIsPinModalOpen(false);

    try {
      const result = await signContract(contract.id, pin);
      if (!result.success) {
        alert(result.error);
        return;
      }
      router.refresh();
    } catch {
      alert("An error occurred during signing.");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-32">
      <header className="flex flex-col gap-4 border-b border-outline-variant pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href={backHref}
            className="mb-4 inline-flex h-10 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-xs font-black uppercase tracking-widest text-on-surface hover:border-primary/40"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back
          </Link>
          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Service Agreement</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-on-surface md:text-4xl">
            {contract.job_title}
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Contract #{String(contract.id).slice(0, 8).toUpperCase()}
          </p>
        </div>
        <StatusBadge status={signatureStatus === "active" ? "contract_signed" : "pending"} size="md" />
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Payment</p>
          <p className="mt-2 text-2xl font-black text-on-surface">{formatMoney(contract.budget)}</p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Job Status</p>
          <p className="mt-2 text-2xl font-black capitalize text-on-surface">{String(contract.job_status || "pending").replaceAll("_", " ")}</p>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Signatures</p>
          <p className="mt-2 text-2xl font-black text-on-surface">{[hasClientSigned, hasWorkerSigned].filter(Boolean).length}/2</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
          <div className="border-b border-outline-variant pb-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Scope of Work</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-on-surface-variant">
              {contract.job_description || contract.terms || "No specific description provided."}
            </p>
          </div>

          <div className="pt-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Terms</p>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              This agreement becomes active when both parties sign. Work, payment, and disputes must remain inside DireSkill for safety and platform support.
            </p>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <SignatureRow label="Client" name={contract.client_name} signedAt={contract.client_signed_at} />
          <SignatureRow label="Worker" name={contract.worker_name} signedAt={contract.worker_signed_at} />

          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            {!userHasSigned ? (
              <button
                type="button"
                onClick={() => setIsPinModalOpen(true)}
                disabled={isSigning}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">draw</span>
                {isSigning ? "Signing" : "Sign Contract"}
              </button>
            ) : isFullySigned ? (
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm font-bold text-primary">
                Contract active. Both signatures are complete.
              </div>
            ) : (
              <div className="rounded-lg border border-outline-variant bg-surface-container p-4 text-sm font-bold text-on-surface-variant">
                Waiting for the other party to sign.
              </div>
            )}

            {contract.pdf_url && (
              <a
                href={contract.pdf_url}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-outline-variant px-4 text-xs font-black uppercase tracking-widest text-on-surface hover:border-primary/40"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download PDF
              </a>
            )}
          </div>
        </aside>
      </section>

      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onVerify={handleSign}
        title="Secure Signature"
        description={`Confirm your agreement to the terms of "${contract.job_title}" by entering your 4-digit PIN.`}
      />
    </div>
  );
}
