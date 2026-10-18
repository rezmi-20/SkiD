"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  acceptContractTerms,
  finalizeContractDraft,
  rejectContractTerms,
  saveContractDraft,
  signContract,
} from "@/lib/actions/contracts";
import { confirmJobCompletion, rejectJobCompletion } from "@/lib/actions/jobs";
import PinVerificationModal from "@/components/shell/PinVerificationModal";
import StatusBadge from "@/components/shell/StatusBadge";
import { CheckCircle2, Clock, XCircle, ShieldCheck, Download, Check, ArrowLeft, Save, Lock, PenTool } from "lucide-react";

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

function formatDateInput(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
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
        {signed ? (
          <CheckCircle2 className="h-4 w-4 text-primary" />
        ) : (
          <Clock className="h-4 w-4 text-on-surface-variant" />
        )}
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

function VerificationStatusRow({ label, verified, maskedFin }: { label: string; verified: boolean; maskedFin?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container p-3">
      <div>
        <span className="text-sm font-bold text-on-surface">{label}</span>
        <p className="mt-0.5 font-mono text-[11px] font-semibold text-on-surface-variant">
          FIN: {maskedFin || "Not recorded"}
        </p>
      </div>
      <span className={`inline-flex items-center gap-1.5 text-xs font-black ${verified && maskedFin ? "text-primary" : "text-error"}`}>
        {verified && maskedFin ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        <span>{verified && maskedFin ? "Verified" : "Not verified"}</span>
      </span>
    </div>
  );
}

function DocumentEvidenceCard({
  pdfUrl,
  documentHash,
  qrCodeDataUrl,
  activatedAt,
}: {
  pdfUrl?: string | null;
  documentHash?: string | null;
  qrCodeDataUrl?: string | null;
  activatedAt?: string | Date | null;
}) {
  if (!pdfUrl && !documentHash && !qrCodeDataUrl) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/10 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Activated Evidence</p>
          <h3 className="mt-1 text-base font-black text-on-surface">DireSkill final document</h3>
          <p className="mt-1 text-xs font-semibold text-on-surface-variant">
            Activated {formatDate(activatedAt)}
          </p>
        </div>
      </div>

      {qrCodeDataUrl && (
        <div className="mt-5 flex justify-center rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
          <img src={qrCodeDataUrl} alt="Contract verification QR code" className="h-28 w-28" />
        </div>
      )}

      {documentHash && (
        <div className="mt-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">SHA-256 Hash</p>
          <p className="mt-2 break-all font-mono text-[11px] leading-5 text-on-surface">{documentHash}</p>
        </div>
      )}

      {pdfUrl && (
        <a
          href={pdfUrl}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-primary bg-surface-container-lowest px-4 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-on-primary transition"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF</span>
        </a>
      )}
    </div>
  );
}

function DraftField({
  label,
  value,
  readOnly,
  onChange,
  multiline = false,
  type = "text",
}: {
  label: string;
  value: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: "text" | "number" | "date";
}) {
  const baseClass =
    "w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-sm font-medium text-on-surface outline-none transition-colors focus:border-primary disabled:cursor-default disabled:opacity-100";

  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
      {multiline ? (
        <textarea
          rows={4}
          value={value}
          disabled={readOnly}
          onChange={(event) => onChange(event.target.value)}
          className={`${baseClass} resize-none ${readOnly ? "bg-surface-container-lowest" : ""}`}
          placeholder={readOnly ? "Not provided" : undefined}
        />
      ) : (
        <input
          type={type}
          value={value}
          disabled={readOnly}
          onChange={(event) => onChange(event.target.value)}
          className={`${baseClass} ${readOnly ? "bg-surface-container-lowest" : ""}`}
          placeholder={readOnly ? "Not provided" : undefined}
        />
      )}
    </label>
  );
}

function ContractReadOnlySummary({
  title,
  description,
  workLocation,
  paymentAmount,
  estimatedCompletionDate,
  materialsResponsibility,
  additionalNotes,
}: {
  title: string;
  description: string;
  workLocation: string;
  paymentAmount: string;
  estimatedCompletionDate: string;
  materialsResponsibility: string;
  additionalNotes: string;
}) {
  const rows = [
    ["Job Title", title],
    ["Job Description", description],
    ["Work Location", workLocation],
    ["Payment Amount", paymentAmount ? `${Number(paymentAmount).toLocaleString()} ETB` : ""],
    ["Estimated Completion Date", estimatedCompletionDate],
    ["Materials Responsibility", materialsResponsibility],
    ["Additional Notes", additionalNotes],
  ];

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
      <div className="border-b border-outline-variant pb-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Finalized Contract</p>
        <h2 className="mt-2 text-xl font-black text-on-surface">Read-Only Agreement</h2>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          This finalized version is locked. Both parties must sign this same version before work begins.
        </p>
      </div>

      <div className="mt-5 divide-y divide-outline-variant">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-2 py-4 md:grid-cols-[220px_1fr]">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</p>
            <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-on-surface">
              {value || "Not provided"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const WORKFLOW_STEPS = [
  "General Info",
  "Payment & Location",
  "Responsibilities",
  "Review & Sign",
  "Worker Sign",
  "Activated",
];

function getWorkflowStepIndex(status: string, hasClientSigned: boolean, hasWorkerSigned: boolean) {
  if (status === "ACTIVE") return 5;
  if (status === "FULLY_SIGNED") return 5;
  if (hasClientSigned && !hasWorkerSigned) return 4;
  if (status === "READY_FOR_SIGNATURE" || status === "WORKER_SIGNED") return 3;
  return 0;
}

function ContractWorkflowStepper({
  currentStep,
}: {
  currentStep: number;
}) {
  return (
    <section className="rounded-3xl border border-outline-variant/60 bg-[#0e141d] px-4 py-5 md:px-6 shadow-sm">
      <div className="overflow-x-auto no-scrollbar">
        <ol className="flex min-w-[640px] items-center">
          {WORKFLOW_STEPS.map((step, index) => {
            const isComplete = index < currentStep;
            const isActive = index === currentStep;

            return (
              <li key={step} className="flex flex-1 items-center">
                <div className="flex min-w-0 flex-col items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-black transition-colors ${
                      isComplete || isActive
                        ? "border-[#a3e635] bg-[#a3e635] text-black shadow-[0_0_10px_rgba(163,230,53,0.3)]"
                        : "border-outline-variant/60 bg-surface-container text-on-surface-variant"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {isComplete ? (
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`whitespace-nowrap text-[11px] font-bold ${
                      isActive ? "text-[#a3e635]" : isComplete ? "text-on-surface" : "text-on-surface-variant opacity-60"
                    }`}
                  >
                    {step}
                  </span>
                </div>

                {index < WORKFLOW_STEPS.length - 1 && (
                  <div
                    className={`mx-3 h-0.5 flex-1 rounded-full ${
                      index < currentStep ? "bg-[#a3e635]" : "bg-outline-variant/40"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default function ContractDetails({ contract, userId }: Props) {
  const router = useRouter();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isFinalizingDraft, setIsFinalizingDraft] = useState(false);
  const [isTermsActionLoading, setIsTermsActionLoading] = useState(false);
  const [isCompletionActionLoading, setIsCompletionActionLoading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [termsRejectReason, setTermsRejectReason] = useState("");
  const [completionRejectReason, setCompletionRejectReason] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [draftError, setDraftError] = useState("");
  const [signatureConsent, setSignatureConsent] = useState({
    readCompletely: false,
    understandsTerms: false,
    voluntarilyAgrees: false,
    pinIsSignature: false,
  });

  const isClient = userId === contract.client_id;
  const backHref = isClient ? "/client/contracts" : "/worker/contracts";
  const hasClientSigned = !!contract.client_signed_at;
  const hasWorkerSigned = !!contract.worker_signed_at;
  const isFullySigned = hasClientSigned && hasWorkerSigned;
  const userHasSigned = isClient ? hasClientSigned : hasWorkerSigned;
  const signatureStatus = contract.signature_status || (isFullySigned ? "active" : hasClientSigned ? "pending_worker" : "pending_client");
  const contractStatus = contract.status || signatureStatus || "DRAFT";
  const termsStatus = contract.terms_status || "draft";
  const canSign =
    contractStatus === "READY_FOR_SIGNATURE" ||
    (isClient && contractStatus === "WORKER_SIGNED") ||
    (!isClient && contractStatus === "CLIENT_SIGNED");
  const hasAllSignatureConsent = Object.values(signatureConsent).every(Boolean);
  const clientVerified = !!contract.client_verified;
  const workerVerified = !!contract.worker_verified;
  const bothPartiesVerified = clientVerified && workerVerified && !!contract.client_masked_fin && !!contract.worker_masked_fin;
  const canEditDraft = isClient && contractStatus === "DRAFT";
  const canWorkerReviewTerms = !isClient && contractStatus === "DRAFT" && termsStatus === "submitted";
  const canFinalizeDraft = canEditDraft && termsStatus === "accepted";
  const canClientReviewCompletion = isClient && contract.job_status === "completion_requested";
  const workflowStep = getWorkflowStepIndex(contractStatus, hasClientSigned, hasWorkerSigned);
  const [draftForm, setDraftForm] = useState({
    jobTitle: contract.job_title || "",
    jobDescription: contract.job_description || contract.terms || "",
    workLocation: contract.work_location || "",
    paymentAmount: String(contract.payment_amount ?? contract.budget ?? ""),
    estimatedCompletionDate: formatDateInput(contract.estimated_completion_date),
    materialsResponsibility: contract.materials_responsibility || "",
    additionalNotes: contract.additional_notes || "",
  });
  const displayPayment = draftForm.paymentAmount || contract.budget;

  useEffect(() => {
    // If the contract is in an active transition state (terms review, pending signature, completion review),
    // auto-sync server data on window focus and on an 8-second interval so counterparts see updates automatically
    const isTransitioning =
      contractStatus === "DRAFT" ||
      contractStatus === "READY_FOR_SIGNATURE" ||
      contractStatus === "CLIENT_SIGNED" ||
      contractStatus === "WORKER_SIGNED" ||
      contract.job_status === "completion_requested" ||
      contract.job_status === "in_progress";

    if (!isTransitioning) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 8000);

    const onFocus = () => {
      router.refresh();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [contractStatus, contract.job_status, router]);

  const handleDownloadPdf = async () => {
    if (!contract.pdf_url || isDownloadingPdf) return;
    setIsDownloadingPdf(true);

    try {
      const response = await fetch(contract.pdf_url, {
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data?.error || "Contract PDF is not available yet.");
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `direskill-contract-${contract.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const updateDraftField = (field: keyof typeof draftForm, value: string) => {
    setDraftForm((current) => ({ ...current, [field]: value }));
    setDraftMessage("");
    setDraftError("");
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setDraftMessage("");
    setDraftError("");

    try {
      const result = await saveContractDraft(contract.id, draftForm);
      if (!result.success) {
        if (result.code === "CONTRACT_SETUP_REQUIRED") {
          router.push("/client/contract-setup");
          return;
        }
        setDraftError(result.error);
        return;
      }

      setDraftMessage("Draft saved.");
      router.refresh();
    } catch {
      setDraftError("An error occurred while saving the draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleFinalizeDraft = async () => {
    setIsFinalizingDraft(true);
    setDraftError("");
    setDraftMessage("");

    try {
      const result = await finalizeContractDraft(contract.id);
      if (!result.success) {
        if (result.code === "CONTRACT_SETUP_REQUIRED") {
          router.push("/client/contract-setup");
          return;
        }
        setDraftError(result.error);
        setShowFinalizeModal(false);
        return;
      }

      setShowFinalizeModal(false);
      router.refresh();
    } catch {
      setDraftError("An error occurred while finalizing the draft.");
      setShowFinalizeModal(false);
    } finally {
      setIsFinalizingDraft(false);
    }
  };

  const handleAcceptTerms = async () => {
    setIsTermsActionLoading(true);
    setDraftError("");
    setDraftMessage("");

    try {
      const result = await acceptContractTerms(contract.id);
      if (!result.success) {
        if (result.code === "CONTRACT_SETUP_REQUIRED") {
          router.push("/worker/contract-setup");
          return;
        }
        setDraftError(result.error);
        return;
      }
      setDraftMessage("Terms accepted. Waiting for the client to finalize.");
      router.refresh();
    } catch {
      setDraftError("An error occurred while accepting terms.");
    } finally {
      setIsTermsActionLoading(false);
    }
  };

  const handleRejectTerms = async () => {
    setIsTermsActionLoading(true);
    setDraftError("");
    setDraftMessage("");

    try {
      const result = await rejectContractTerms(contract.id, termsRejectReason);
      if (!result.success) {
        setDraftError(result.error);
        return;
      }
      setDraftMessage("Terms rejected. The client can revise and resubmit.");
      router.refresh();
    } catch {
      setDraftError("An error occurred while rejecting terms.");
    } finally {
      setIsTermsActionLoading(false);
    }
  };

  const handleConfirmCompletion = async () => {
    setIsCompletionActionLoading(true);
    setDraftError("");
    setDraftMessage("");

    try {
      const result = await confirmJobCompletion(contract.job_id);
      if (!result.success) {
        setDraftError(result.error);
        return;
      }
      setDraftMessage("Completion confirmed. Payment can now be started.");
      router.refresh();
    } catch {
      setDraftError("An error occurred while confirming completion.");
    } finally {
      setIsCompletionActionLoading(false);
    }
  };

  const handleRejectCompletion = async () => {
    setIsCompletionActionLoading(true);
    setDraftError("");
    setDraftMessage("");

    try {
      const result = await rejectJobCompletion(contract.job_id, completionRejectReason);
      if (!result.success) {
        setDraftError(result.error);
        return;
      }
      setDraftMessage("Completion rejected. The job has been returned to in progress.");
      router.refresh();
    } catch {
      setDraftError("An error occurred while rejecting completion.");
    } finally {
      setIsCompletionActionLoading(false);
    }
  };

  const handleSign = async (pin: string) => {
    setIsSigning(true);
    setIsPinModalOpen(false);

    try {
      const result = await signContract(contract.id, pin, hasAllSignatureConsent);
      if (!result.success) {
        if (result.code === "CONTRACT_SETUP_REQUIRED") {
          router.push(isClient ? "/client/contract-setup" : "/worker/contract-setup");
          return;
        }
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-32">
      <header className="flex flex-col gap-4 border-b border-outline-variant/60 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href={backHref}
            className="mb-4 inline-flex h-9 items-center gap-1.5 rounded-full border border-outline-variant/60 bg-surface-container-low px-3.5 text-xs font-bold text-on-surface hover:text-on-surface hover:border-[#a3e635]/40 transition active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </Link>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#a3e635]">Service Agreement</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-on-surface sm:text-3xl md:text-4xl">
            {contract.job_title}
          </h1>
          <p className="mt-1 font-mono text-xs text-on-surface-variant opacity-60">
            Contract #{String(contract.id).slice(0, 8).toUpperCase()}
          </p>
        </div>
        <StatusBadge status={contractStatus === "active" ? "contract_signed" : contractStatus} size="md" />
      </header>

      <ContractWorkflowStepper currentStep={workflowStep} />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-outline-variant/60 bg-[#0e141d] p-5 sm:p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Payment</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-[#a3e635]">{formatMoney(displayPayment)}</p>
        </div>
        <div className="rounded-3xl border border-outline-variant/60 bg-[#0e141d] p-5 sm:p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Job Status</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black capitalize text-on-surface">{String(contract.job_status || "pending").replaceAll("_", " ")}</p>
        </div>
        <div className="rounded-3xl border border-outline-variant/60 bg-[#0e141d] p-5 sm:p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Contract Status</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black capitalize text-on-surface">{String(contractStatus).toLowerCase().replaceAll("_", " ")}</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
        {contractStatus === "DRAFT" ? (
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 md:p-8">
            <div className="border-b border-outline-variant pb-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Contract Draft</p>
              <h2 className="mt-2 text-xl font-black text-on-surface">
                {canEditDraft ? "Fill Contract Details" : "Review Contract Details"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {canEditDraft
                  ? "Submit the proposed terms for worker review. The contract cannot be finalized until the worker accepts them."
                  : "Review the client-filled proposal. Accept it to let the client finalize, or reject it with a reason so the client can revise."}
              </p>
            </div>

            <div className="mx-auto mt-6 grid max-w-2xl gap-5">
              <DraftField
                label="Job Title"
                value={draftForm.jobTitle}
                readOnly={!canEditDraft}
                onChange={(value) => updateDraftField("jobTitle", value)}
              />
              <DraftField
                label="Job Description"
                value={draftForm.jobDescription}
                readOnly={!canEditDraft}
                multiline
                onChange={(value) => updateDraftField("jobDescription", value)}
              />
              <DraftField
                label="Work Location"
                value={draftForm.workLocation}
                readOnly={!canEditDraft}
                onChange={(value) => updateDraftField("workLocation", value)}
              />
              <div className="grid gap-5 md:grid-cols-2">
                <DraftField
                  label="Payment Amount"
                  value={String(draftForm.paymentAmount ?? "")}
                  readOnly={!canEditDraft}
                  type="number"
                  onChange={(value) => updateDraftField("paymentAmount", value)}
                />
                <DraftField
                  label="Estimated Completion Date"
                  value={draftForm.estimatedCompletionDate}
                  readOnly={!canEditDraft}
                  type="date"
                  onChange={(value) => updateDraftField("estimatedCompletionDate", value)}
                />
              </div>
              <DraftField
                label="Materials Responsibility"
                value={draftForm.materialsResponsibility}
                readOnly={!canEditDraft}
                multiline
                onChange={(value) => updateDraftField("materialsResponsibility", value)}
              />
              <DraftField
                label="Additional Notes"
                value={draftForm.additionalNotes}
                readOnly={!canEditDraft}
                multiline
                onChange={(value) => updateDraftField("additionalNotes", value)}
              />

              {draftError && (
                <div className="rounded-lg border border-error/20 bg-error-container p-4 text-sm font-bold text-on-error-container">
                  {draftError}
                </div>
              )}
              {draftMessage && (
                <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm font-bold text-primary">
                  {draftMessage}
                </div>
              )}

              {canEditDraft && (
                <div className="flex flex-col gap-3 sm:flex-row pt-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft || isFinalizingDraft}
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container hover:bg-surface-container-high px-5 text-xs font-bold uppercase tracking-wider text-on-surface disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98]"
                  >
                    {isSavingDraft ? (
                      <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{isSavingDraft ? "Saving..." : "Save Draft"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFinalizeModal(true)}
                    disabled={isSavingDraft || isFinalizingDraft || !canFinalizeDraft}
                    title={!canFinalizeDraft ? "Worker acceptance is required before finalization" : "Finalize accepted terms"}
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#a3e635] px-5 text-xs font-black uppercase tracking-wider text-black disabled:cursor-not-allowed disabled:opacity-60 transition hover:opacity-90 shadow-[0_4px_16px_rgba(163,230,53,0.3)] active:scale-[0.98]"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Finalize Draft</span>
                  </button>
                </div>
              )}

              {canWorkerReviewTerms && (
                <div className="space-y-3 rounded-2xl border border-outline-variant/60 bg-surface-container/70 p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#a3e635]">Worker Terms Review</p>
                  <textarea
                    value={termsRejectReason}
                    onChange={(event) => setTermsRejectReason(event.target.value)}
                    rows={3}
                    placeholder="Reason required only if rejecting terms"
                    className="w-full resize-none rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none focus:border-[#a3e635]/60"
                  />
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleAcceptTerms}
                      disabled={isTermsActionLoading}
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#a3e635] px-5 text-xs font-black uppercase tracking-wider text-black hover:opacity-90 shadow-[0_4px_16px_rgba(163,230,53,0.3)] disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98]"
                    >
                      Accept Terms
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectTerms}
                      disabled={isTermsActionLoading || !termsRejectReason.trim()}
                      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-rose-500/40 bg-surface-container-low px-5 text-xs font-black uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98]"
                    >
                      Reject Terms
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ContractReadOnlySummary
            title={draftForm.jobTitle}
            description={draftForm.jobDescription}
            workLocation={draftForm.workLocation}
            paymentAmount={draftForm.paymentAmount}
            estimatedCompletionDate={draftForm.estimatedCompletionDate}
            materialsResponsibility={draftForm.materialsResponsibility}
            additionalNotes={draftForm.additionalNotes}
          />
        )}

        <aside className="flex flex-col gap-4">
          <SignatureRow label="Client" name={contract.client_name} signedAt={contract.client_signed_at} />
          <SignatureRow label="Worker" name={contract.worker_name} signedAt={contract.worker_signed_at} />

          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <div className="mb-4 space-y-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Identity Verification</p>
              <VerificationStatusRow label="Client" verified={clientVerified} maskedFin={contract.client_masked_fin} />
              <VerificationStatusRow label="Worker" verified={workerVerified} maskedFin={contract.worker_masked_fin} />
              {!bothPartiesVerified && (
                <p className="text-xs font-bold leading-5 text-error">
                  Both client and worker must complete identity verification before signing this contract.
                </p>
              )}
            </div>

            {canClientReviewCompletion && (
              <div className="mb-4 space-y-3 rounded-lg border border-primary/30 bg-primary/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Completion Review</p>
                <p className="text-sm font-bold leading-6 text-on-surface">
                  The worker marked this job complete. Confirm only after checking the delivered work.
                </p>
                <textarea
                  value={completionRejectReason}
                  onChange={(event) => setCompletionRejectReason(event.target.value)}
                  placeholder="Reason if rejecting completion"
                  className="min-h-20 w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-sm font-semibold text-on-surface outline-none focus:border-primary/50"
                />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleConfirmCompletion}
                    disabled={isCompletionActionLoading}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#a3e635] px-5 text-xs font-black uppercase tracking-wider text-black hover:opacity-90 shadow-[0_4px_16px_rgba(163,230,53,0.3)] disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98]"
                  >
                    Confirm Completion
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectCompletion}
                    disabled={isCompletionActionLoading || !completionRejectReason.trim()}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-rose-500/40 bg-surface-container-low px-5 text-xs font-black uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98]"
                  >
                    Reject Completion
                  </button>
                </div>
              </div>
            )}

            {contractStatus === "ACTIVE" ? (
              <div className="rounded-2xl border border-[#a3e635]/30 bg-[#a3e635]/10 p-4 text-sm font-bold text-[#a3e635]">
                Contract activated. Work is now in progress and the final PDF evidence is available below.
              </div>
            ) : contractStatus === "DRAFT" ? (
              <div className="rounded-2xl border border-secondary/30 bg-secondary/10 p-4 text-sm font-bold text-secondary">
                This is a contract draft. The client can edit and finalize it in the next workflow step before either party signs.
              </div>
            ) : !bothPartiesVerified && canSign && !userHasSigned ? (
              <div className="rounded-2xl border border-error/30 bg-error/10 p-4 text-sm font-bold text-error">
                Both client and worker must complete identity verification before signing this contract.
              </div>
            ) : !canSign ? (
              <div className="rounded-2xl border border-outline-variant/60 bg-surface-container p-4 text-sm font-bold text-on-surface-variant">
                This contract is not ready for your signature yet.
              </div>
            ) : !userHasSigned ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {[
                    ["readCompletely", "I have read this contract completely."],
                    ["understandsTerms", "I understand all terms and conditions."],
                    ["voluntarilyAgrees", "I voluntarily agree to this contract."],
                    ["pinIsSignature", "I understand that my Contract PIN acts as my electronic signature."],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-start gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container p-3.5">
                      <input
                        type="checkbox"
                        checked={signatureConsent[key as keyof typeof signatureConsent]}
                        onChange={(event) =>
                          setSignatureConsent((current) => ({
                            ...current,
                            [key]: event.target.checked,
                          }))
                        }
                        className="mt-1 h-4 w-4 accent-[#a3e635]"
                      />
                      <span className="text-xs sm:text-sm font-bold leading-5 text-on-surface">{label}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(true)}
                  disabled={isSigning || !hasAllSignatureConsent || !bothPartiesVerified}
                  className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#a3e635] px-6 text-xs sm:text-sm font-black uppercase tracking-wider text-black hover:opacity-90 shadow-[0_4px_18px_rgba(163,230,53,0.35)] disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98] cursor-pointer"
                >
                  <PenTool className="h-4 w-4 stroke-[2.5]" />
                  <span>{isSigning ? "Signing..." : "Sign Contract"}</span>
                </button>
              </div>
            ) : isFullySigned ? (
              <div className="rounded-2xl border border-[#a3e635]/30 bg-[#a3e635]/10 p-4 text-sm font-bold text-[#a3e635]">
                Contract fully signed. Final activation will generate the PDF, hash, QR code, and job start state.
              </div>
            ) : (
              <div className="rounded-2xl border border-outline-variant/60 bg-surface-container p-4 text-sm font-bold text-on-surface-variant">
                Waiting for the other party to sign.
              </div>
            )}

            {contract.pdf_url && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container hover:bg-surface-container-high px-5 text-xs font-bold uppercase tracking-wider text-on-surface hover:border-[#a3e635]/40 transition active:scale-[0.98]"
              >
                <Download className="h-4 w-4" />
                <span>{isDownloadingPdf ? "Downloading..." : "Download PDF"}</span>
              </button>
            )}
          </div>

          <DocumentEvidenceCard
            pdfUrl={contract.pdf_url}
            documentHash={contract.document_hash}
            qrCodeDataUrl={contract.qr_code_data_url}
            activatedAt={contract.activated_at}
          />
        </aside>
      </section>

      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onVerify={handleSign}
        title="Electronic Signature Confirmation"
        description="By entering your Contract PIN, you confirm that you have read this agreement, voluntarily agree to its terms, and your Contract PIN serves as your electronic signature."
      />

      {showFinalizeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-outline-variant/60 bg-[#0e141d] p-6 sm:p-7 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#a3e635]/15 text-[#a3e635] border border-[#a3e635]/30">
                <Lock className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-on-surface">Finalize Draft</h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-on-surface-variant">
                  After finalizing, this contract becomes read only.
                </p>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-on-surface-variant">
                  Both parties must electronically sign before work begins.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowFinalizeModal(false)}
                disabled={isFinalizingDraft}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-outline-variant/60 bg-surface-container px-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant disabled:opacity-60 transition hover:bg-surface-container-high"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalizeDraft}
                disabled={isFinalizingDraft}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#a3e635] px-4 text-xs font-black uppercase tracking-wider text-black disabled:opacity-60 transition hover:opacity-90 shadow-[0_4px_16px_rgba(163,230,53,0.3)]"
              >
                {isFinalizingDraft ? (
                  <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                )}
                <span>{isFinalizingDraft ? "Finalizing..." : "Finalize"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
