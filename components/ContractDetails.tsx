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
  type CounterTermsInput,
} from "@/lib/actions/contracts";
import { confirmJobCompletion, rejectJobCompletion } from "@/lib/actions/jobs";
import PinVerificationModal from "@/components/shell/PinVerificationModal";
import StatusBadge from "@/components/shell/StatusBadge";
import {
  RiFileTextLine,
  RiCoinsLine,
  RiCalendarLine,
  RiMapPin2Line,
  RiShieldCheckFill,
  RiCheckDoubleLine,
  RiCheckboxCircleFill,
  RiTimeLine,
  RiAlertLine,
  RiDownloadLine,
  RiArrowLeftLine,
  RiLockLine,
  RiEditLine,
  RiBriefcaseLine,
  RiFlashlightFill,
  RiPhoneLine,
  RiArrowRightUpLine,
  RiArrowLeftRightLine,
  RiCloseCircleLine,
  RiFileShieldLine,
  RiSave3Line,
  RiFileCopyLine,
  RiCheckLine,
} from "@remixicon/react";
import { useLanguage } from "@/context/LanguageContext";
import dynamic from "next/dynamic";
import ParticipantEvidenceExportButton from "@/components/contract/ParticipantEvidenceExportButton";
import { cx } from "@/utils/cx";

const JobSiteMap = dynamic(() => import("@/components/contract/JobSiteMap"), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full rounded-2xl bg-slate-100 dark:bg-zinc-800/60 animate-pulse flex items-center justify-center text-xs font-semibold text-slate-400">
      Loading OpenStreetMap...
    </div>
  ),
});

interface Props {
  contract: any;
  userId: string;
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value: number | string | null | undefined) {
  const amount = Number(value || 0);
  return `${amount.toLocaleString()} ETB`;
}

function formatDateTimeInput(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 19);
}

interface ParsedRejection {
  reason: string;
  counterBudget?: number | null;
  counterDate?: string | null;
  counterNotes?: string | null;
}

function parseRejectionReason(raw: string | null | undefined): ParsedRejection | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return {
        reason: parsed.reason || "",
        counterBudget: typeof parsed.counterBudget === "number" ? parsed.counterBudget : null,
        counterDate: parsed.counterDate || null,
        counterNotes: parsed.counterNotes || null,
      };
    }
  } catch {
    // Plain string fallback
  }
  return { reason: raw };
}

function SignatureRow({ label, name, signedAt }: { label: string; name: string | null; signedAt?: string | Date | null }) {
  const signed = !!signedAt;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 p-3.5 transition-all">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">{label}</p>
        <p className="mt-0.5 truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{name || "Not Assigned"}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="text-end">
          <span
            className={cx(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
              signed
                ? "bg-[#134e27]/25 text-[#a4fe47] border border-[#45BA50]/30"
                : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
            )}
          >
            {signed ? (
              <>
                <RiCheckboxCircleFill className="w-3 h-3 text-[#a4fe47]" />
                <span>Signed</span>
              </>
            ) : (
              <>
                <RiTimeLine className="w-3 h-3 text-amber-500" />
                <span>Pending</span>
              </>
            )}
          </span>
          {signed && (
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">{formatDateTime(signedAt)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function VerificationStatusRow({ label, verified, maskedFin }: { label: string; verified: boolean; maskedFin?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40 p-3">
      <div>
        <span className="text-xs font-bold text-slate-900 dark:text-white">{label} Identity</span>
        <p className="mt-0.5 font-mono text-[10px] text-slate-400 dark:text-zinc-500">
          FIN: {maskedFin || "Not Linked"}
        </p>
      </div>
      <span
        className={cx(
          "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
          verified && maskedFin
            ? "bg-[#134e27]/25 text-[#a4fe47] border border-[#45BA50]/30"
            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
        )}
      >
        {verified && maskedFin ? (
          <>
            <RiShieldCheckFill className="w-3 h-3 text-[#a4fe47]" />
            <span>Fayda Verified</span>
          </>
        ) : (
          <>
            <RiAlertLine className="w-3 h-3 text-rose-500" />
            <span>Unverified</span>
          </>
        )}
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
  const [copied, setCopied] = useState(false);

  if (!pdfUrl && !documentHash && !qrCodeDataUrl) return null;

  const copyHash = () => {
    if (!documentHash) return;
    navigator.clipboard.writeText(documentHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-5 shadow-xs space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#134e27]/25 text-[#a4fe47] border border-[#45BA50]/30">
          <RiShieldCheckFill className="h-5 w-5 text-[#a4fe47]" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#a4fe47]">Cryptographic Evidence</span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">DireSkill Legal Record</h3>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
            Activated {formatDateTime(activatedAt)}
          </p>
        </div>
      </div>

      {qrCodeDataUrl && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 p-4">
          <img src={qrCodeDataUrl} alt="Contract verification QR code" className="h-28 w-28 rounded-xl shadow-xs" />
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 mt-2">Scan to Verify Court Authenticity</span>
        </div>
      )}

      {documentHash && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/40 p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">SHA-256 Agreement Hash</p>
            <button
              onClick={copyHash}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#45BA50] hover:underline cursor-pointer"
            >
              {copied ? <RiCheckLine className="w-3 h-3 text-[#a4fe47]" /> : <RiFileCopyLine className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <p className="break-all font-mono text-[10px] text-slate-600 dark:text-zinc-300 leading-tight bg-white dark:bg-zinc-900 p-2 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 select-all">
            {documentHash}
          </p>
        </div>
      )}

      {pdfUrl && (
        <a
          href={pdfUrl}
          className="inline-flex min-h-[44px] py-2.5 px-4 h-auto w-full items-center justify-center gap-2 rounded-2xl bg-[#45BA50] hover:bg-[#3ca346] text-white text-xs sm:text-sm font-bold shadow-[0_2px_10px_rgba(69,186,80,0.3)] transition active:scale-[0.98] text-center cursor-pointer"
        >
          <RiDownloadLine className="h-4 w-4" />
          <span>Download Signed PDF</span>
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
  placeholder,
  helperText,
  icon: Icon,
  unitBadge,
  required = false,
  min,
}: {
  label: string;
  value: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: "text" | "number" | "date" | "datetime-local";
  placeholder?: string;
  helperText?: string;
  icon?: React.ComponentType<{ className?: string }>;
  unitBadge?: string;
  required?: boolean;
  min?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-300">
          {Icon && <Icon className="h-3.5 w-3.5 text-[#45BA50]" />}
          <span>{label}</span>
          {required && !readOnly && <span className="text-rose-500">*</span>}
        </label>
        {readOnly && (
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Locked
          </span>
        )}
      </div>

      {readOnly ? (
        <div className="min-h-[44px] rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-zinc-100 transition">
          {value ? (
            <span className={multiline ? "whitespace-pre-wrap leading-relaxed font-normal" : ""}>
              {type === "datetime-local" ? formatDateTime(value) : value}{" "}
              {unitBadge && <span className="font-bold text-[#45BA50] ml-1">{unitBadge}</span>}
            </span>
          ) : (
            <span className="italic text-slate-400 dark:text-zinc-500 font-normal">Not provided</span>
          )}
        </div>
      ) : multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full resize-y rounded-2xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-3.5 py-2.5 text-xs sm:text-sm font-medium leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none transition focus:border-[#45BA50] focus:ring-2 focus:ring-[#45BA50]/20"
        />
      ) : (
        <div className="relative">
          <input
            type={type}
            step={type === "datetime-local" ? "1" : undefined}
            value={value}
            min={min}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={cx(
              "w-full rounded-2xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 outline-none transition focus:border-[#45BA50] focus:ring-2 focus:ring-[#45BA50]/20 [color-scheme:light] dark:[color-scheme:dark]",
              unitBadge ? "pl-3.5 pr-16 text-base font-bold" : "px-3.5"
            )}
          />
          {unitBadge && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="rounded-xl border border-[#45BA50]/30 bg-[#134e27]/25 px-2.5 py-0.5 text-xs font-black text-[#a4fe47]">
                {unitBadge}
              </span>
            </div>
          )}
        </div>
      )}

      {helperText && !readOnly && (
        <p className="text-[10px] text-slate-400 dark:text-zinc-500 pl-1 leading-normal">
          {helperText}
        </p>
      )}
    </div>
  );
}

const WORKFLOW_STEPS = [
  "Draft Scope",
  "Worker Review",
  "Finalize Draft",
  "Signatures",
  "Active Service",
];

function getWorkflowStepIndex(status: string, hasClientSigned: boolean, hasWorkerSigned: boolean) {
  if (status === "ACTIVE" || status === "FULLY_SIGNED") return 4;
  if (hasClientSigned && !hasWorkerSigned) return 3;
  if (status === "READY_FOR_SIGNATURE" || status === "WORKER_SIGNED") return 3;
  if (status === "DRAFT") return 1;
  return 0;
}

function ContractWorkflowStepper({ currentStep }: { currentStep: number }) {
  return (
    <section className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          Execution Lifecycle
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
          Step {currentStep + 1} of 5
        </span>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <ol className="flex min-w-[540px] items-center">
          {WORKFLOW_STEPS.map((step, index) => {
            const isComplete = index < currentStep;
            const isActive = index === currentStep;

            return (
              <li key={step} className="flex flex-1 items-center">
                <div className="flex min-w-0 flex-col items-center gap-1.5">
                  <div
                    className={cx(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all",
                      isComplete
                        ? "bg-[#45BA50] text-white shadow-[0_2px_8px_rgba(69,186,80,0.3)]"
                        : isActive
                        ? "bg-white dark:bg-zinc-900 border-2 border-[#45BA50] text-[#45BA50] ring-4 ring-[#45BA50]/15"
                        : "border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500"
                    )}
                  >
                    {isComplete ? <RiCheckLine className="h-4 w-4 stroke-[3]" /> : index + 1}
                  </div>
                  <span
                    className={cx(
                      "whitespace-nowrap text-[10px] font-black uppercase tracking-wider",
                      isActive
                        ? "text-[#45BA50]"
                        : isComplete
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-400 dark:text-zinc-500"
                    )}
                  >
                    {step}
                  </span>
                </div>

                {index < WORKFLOW_STEPS.length - 1 && (
                  <div
                    className={cx(
                      "mx-2 h-1 flex-1 rounded-full transition-colors",
                      index < currentStep ? "bg-[#45BA50]" : "bg-slate-200 dark:bg-zinc-800"
                    )}
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
  const { t } = useLanguage();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isFinalizingDraft, setIsFinalizingDraft] = useState(false);
  const [isTermsActionLoading, setIsTermsActionLoading] = useState(false);
  const [isCompletionActionLoading, setIsCompletionActionLoading] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [termsRejectReason, setTermsRejectReason] = useState("");
  const [counterBudget, setCounterBudget] = useState("");
  const [counterDate, setCounterDate] = useState("");
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
  const parsedRejection = parseRejectionReason(contract.terms_rejection_reason);

  const [draftForm, setDraftForm] = useState({
    jobTitle: contract.job_title || "",
    jobDescription: contract.job_description || contract.terms || "",
    workLocation: contract.work_location || "",
    paymentAmount: String(contract.payment_amount ?? contract.budget ?? ""),
    estimatedCompletionDate: formatDateTimeInput(contract.estimated_completion_date),
    materialsResponsibility: contract.materials_responsibility || "",
    additionalNotes: contract.additional_notes || "",
  });
  const displayPayment = draftForm.paymentAmount || contract.budget;

  useEffect(() => {
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
    setDraftMessage("");
    setDraftError("");

    if (!draftForm.jobTitle.trim() || draftForm.jobTitle.trim().length < 3) {
      setDraftError("Project Title is required (minimum 3 characters).");
      return;
    }
    if (!draftForm.jobDescription.trim() || draftForm.jobDescription.trim().length < 5) {
      setDraftError("Detailed Scope of Work is required (minimum 5 characters).");
      return;
    }
    const amount = Number(draftForm.paymentAmount);
    if (!draftForm.paymentAmount || Number.isNaN(amount) || amount <= 0) {
      setDraftError("A valid positive payment amount in ETB is required.");
      return;
    }
    if (!draftForm.estimatedCompletionDate) {
      setDraftError("Estimated Completion Date & Time is required. Please select date and time.");
      return;
    }
    if (!draftForm.workLocation.trim()) {
      setDraftError("Work Location is required. Please enter the site neighborhood or city.");
      return;
    }
    if (!draftForm.materialsResponsibility.trim()) {
      setDraftError("Materials & Equipment Responsibility is required.");
      return;
    }

    setIsSavingDraft(true);

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

      setDraftMessage("Draft saved and submitted for worker review.");
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
      setDraftMessage("Terms accepted. Waiting for the client to finalize the contract.");
      router.refresh();
    } catch {
      setDraftError("An error occurred while accepting terms.");
    } finally {
      setIsTermsActionLoading(false);
    }
  };

  const handleRejectTerms = async () => {
    if (!termsRejectReason.trim()) {
      setDraftError("Please specify what needs changing or explain your desired terms.");
      return;
    }

    setIsTermsActionLoading(true);
    setDraftError("");
    setDraftMessage("");

    try {
      const payload: CounterTermsInput = {
        reason: termsRejectReason.trim(),
        counterBudget: counterBudget ? Number(counterBudget) : null,
        counterDate: counterDate || null,
        counterNotes: null,
      };

      const result = await rejectContractTerms(contract.id, payload);
      if (!result.success) {
        setDraftError(result.error);
        return;
      }
      setShowRejectForm(false);
      setDraftMessage("Counter-proposal submitted. The client has been notified to adjust and resubmit.");
      router.refresh();
    } catch {
      setDraftError("An error occurred while requesting revisions.");
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
      setDraftMessage("Completion confirmed. Redirecting to payment...");
      router.push(`/client/pay/${contract.job_id}`);
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
      if (!isClient) {
        router.push("/worker/gigs");
      } else {
        router.push("/client/contracts");
      }
    } catch {
      alert("An error occurred during signing.");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 pb-32 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">

        {/* ── Top Header & Breadcrumb ────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href={backHref}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition active:scale-95 shadow-2xs"
              >
                <RiArrowLeftLine className="w-3.5 h-3.5" />
                <span>Back</span>
              </Link>
              <span className="text-slate-300 dark:text-zinc-700">•</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#134e27]/25 text-[#a4fe47] border border-[#45BA50]/30 inline-flex items-center gap-1">
                <RiShieldCheckFill className="w-3.5 h-3.5 text-[#a4fe47]" />
                <span>Smart Agreement</span>
              </span>
              <span className="text-xs font-mono text-slate-400 dark:text-zinc-500">
                #{String(contract.id).slice(0, 8).toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {contract.job_title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
              Legally-enforceable service contract with Fayda identity validation and direct milestone protection in Dire Dawa.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <StatusBadge status={contractStatus === "active" ? "contract_signed" : contractStatus} size="md" />
            {contract.pdf_url && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="inline-flex items-center gap-1.5 px-4 h-10 rounded-full text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <RiDownloadLine className="w-4 h-4" />
                <span>{isDownloadingPdf ? "Exporting..." : "PDF"}</span>
              </button>
            )}
          </div>
        </header>

        {/* ── Visual Workflow Stepper ────────────────────────────────────── */}
        <ContractWorkflowStepper currentStep={workflowStep} />

        {/* ── 4-Card KPI Deal Strip with Sixpay Waves ────────────────────── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* KPI 1: Agreed Payment */}
          <div className="relative overflow-hidden p-4 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-[#45BA50] flex items-center justify-center shrink-0 border border-[#45BA50]/30 z-10">
              <RiCoinsLine className="w-5 h-5" />
            </div>
            <div className="min-w-0 z-10">
              <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
                {formatMoney(displayPayment)}
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate">
                Milestone Protected
              </p>
            </div>
            {/* Ambient Sixpay wave */}
            <div className="absolute -bottom-2 -right-4 w-28 h-12 opacity-20 pointer-events-none">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full stroke-[#45BA50] fill-none stroke-2">
                <path d="M0,25 Q25,5 50,20 T100,10" />
              </svg>
            </div>
          </div>

          {/* KPI 2: Completion Timeline */}
          <div className="relative overflow-hidden p-4 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20 z-10">
              <RiCalendarLine className="w-5 h-5" />
            </div>
            <div className="min-w-0 z-10">
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                {draftForm.estimatedCompletionDate ? formatDateTime(draftForm.estimatedCompletionDate) : "Pending Review"}
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate mt-0.5">
                Delivery Schedule
              </p>
            </div>
            {/* Ambient wave */}
            <div className="absolute -bottom-2 -right-4 w-28 h-12 opacity-20 pointer-events-none">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full stroke-blue-500 fill-none stroke-2">
                <path d="M0,20 Q30,35 60,15 T100,25" />
              </svg>
            </div>
          </div>

          {/* KPI 3: Job Site Location */}
          <div className="relative overflow-hidden p-4 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20 z-10">
              <RiMapPin2Line className="w-5 h-5" />
            </div>
            <div className="min-w-0 z-10">
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                {draftForm.workLocation || "Dire Dawa, ET"}
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate mt-0.5">
                Physical Worksite
              </p>
            </div>
            {/* Ambient wave */}
            <div className="absolute -bottom-2 -right-4 w-28 h-12 opacity-20 pointer-events-none">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full stroke-purple-500 fill-none stroke-2">
                <path d="M0,15 Q35,5 70,30 T100,10" />
              </svg>
            </div>
          </div>

          {/* KPI 4: Contract Protocol Status */}
          <div className="relative overflow-hidden p-4 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#134e27]/25 text-[#a4fe47] flex items-center justify-center shrink-0 border border-[#45BA50]/30 z-10">
              <RiFileShieldLine className="w-5 h-5" />
            </div>
            <div className="min-w-0 z-10">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight capitalize truncate">
                  {String(contractStatus).replaceAll("_", " ")}
                </p>
                {contractStatus === "ACTIVE" && (
                  <span className="w-2 h-2 rounded-full bg-[#45BA50] animate-ping" />
                )}
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate mt-0.5">
                DireSkill Protocol
              </p>
            </div>
            {/* Ambient wave */}
            <div className="absolute -bottom-2 -right-4 w-28 h-12 opacity-20 pointer-events-none">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full stroke-[#45BA50] fill-none stroke-2">
                <path d="M0,30 Q40,10 75,20 T100,5" />
              </svg>
            </div>
          </div>

        </section>

        {/* ── Active On-Site Location & Direct Call Banner ────────────────── */}
        {contractStatus === "ACTIVE" && (
          <section className="rounded-3xl border border-[#45BA50]/30 bg-emerald-500/[0.06] dark:bg-[#45BA50]/10 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#45BA50]/20 text-[#a4fe47] flex items-center justify-center shrink-0 border border-[#45BA50]/30">
                  <RiMapPin2Line className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#45BA50]">
                    Active Worksite • Direct Line Unlocked
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Site Location & Direct Contact Access
                  </h3>
                </div>
              </div>

              {(isClient ? contract.worker_phone : contract.client_phone) && (
                <a
                  href={`tel:${isClient ? contract.worker_phone : contract.client_phone}`}
                  className="inline-flex items-center justify-center gap-2 px-5 h-10 rounded-full text-xs font-bold bg-[#45BA50] hover:bg-[#3ca346] text-white shadow-[0_2px_10px_rgba(69,186,80,0.3)] transition active:scale-95 cursor-pointer self-start sm:self-auto"
                >
                  <RiPhoneLine className="w-4 h-4" />
                  <span>Call {isClient ? "Worker" : "Client"} Direct ({isClient ? contract.worker_phone : contract.client_phone})</span>
                </a>
              )}
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-zinc-800">
              <JobSiteMap
                workLocation={contract.work_location}
                latitude={contract.client_latitude}
                longitude={contract.client_longitude}
                jobTitle={contract.job_title}
                clientName={contract.client_name}
              />
            </div>
          </section>
        )}

        {/* ── Parties Legal Dossier ───────────────────────────────────────── */}
        <section className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <RiShieldCheckFill className="w-4 h-4 text-[#45BA50]" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                Agreement Signatories Dossier
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
              Both parties backed by Fayda KYC
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center">
            {/* Client Party */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20 overflow-hidden">
                {contract.client_avatar ? (
                  <img src={contract.client_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <img src="/default-avatar.svg" alt="" className="w-8 h-8 opacity-80" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Employer
                  </span>
                  {clientVerified ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#45BA50]">
                      <RiShieldCheckFill className="w-3 h-3 text-[#a4fe47]" />
                      <span>Fayda Verified</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">Unverified</span>
                  )}
                </div>
                <p className="truncate text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {contract.client_name || "Client"}
                </p>
                <p className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                  {contractStatus === "ACTIVE" && contract.client_phone
                    ? `Tel: ${contract.client_phone}`
                    : contract.client_masked_fin
                    ? `FIN: ${contract.client_masked_fin}`
                    : "Phone protected until signing"}
                </p>
              </div>
            </div>

            {/* Handshake Bridge */}
            <div className="hidden lg:flex flex-col items-center justify-center px-2">
              <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-400 dark:text-zinc-400 flex items-center justify-center shadow-xs">
                <RiArrowLeftRightLine className="w-4 h-4 text-[#45BA50]" />
              </div>
            </div>

            {/* Worker Party */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-2xl bg-[#134e27]/25 text-[#a4fe47] flex items-center justify-center shrink-0 border border-[#45BA50]/30 overflow-hidden">
                {contract.worker_avatar ? (
                  <img src={contract.worker_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <img src="/images/worker_holding_card.png" alt="" className="w-10 h-10 object-contain" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#a4fe47]">
                    Artisan Professional
                  </span>
                  {workerVerified ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#45BA50]">
                      <RiShieldCheckFill className="w-3 h-3 text-[#a4fe47]" />
                      <span>Fayda Verified</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">Unverified</span>
                  )}
                </div>
                <p className="truncate text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  {contract.worker_name || "Skilled Artisan"}
                </p>
                <p className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                  {contractStatus === "ACTIVE" && contract.worker_phone
                    ? `Tel: ${contract.worker_phone}`
                    : contract.worker_masked_fin
                    ? `FIN: ${contract.worker_masked_fin}`
                    : "Phone protected until signing"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Dual-Column Content Grid ──────────────────────────────── */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
          
          {/* Left Column: Contract Terms & Scope of Work */}
          <div className="space-y-5">
            
            {/* Status Alert Banners */}
            {termsStatus === "rejected" && (
              <div className="rounded-3xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-5 shadow-xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                    <RiAlertLine className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Counter-Proposal Requested
                    </span>
                    <p className="text-xs text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                      {isClient
                        ? "The artisan reviewed your proposed terms and requested changes before agreeing to sign:"
                        : "You requested the following revisions to this draft agreement:"}
                    </p>
                  </div>
                </div>

                {parsedRejection && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-500/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        Proposed Adjustments
                      </span>
                      {isClient && (parsedRejection.counterBudget || parsedRejection.counterDate) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (parsedRejection.counterBudget) {
                              setDraftForm((prev) => ({ ...prev, paymentAmount: String(parsedRejection.counterBudget) }));
                            }
                            if (parsedRejection.counterDate) {
                              setDraftForm((prev) => ({ ...prev, estimatedCompletionDate: parsedRejection.counterDate! }));
                            }
                            setDraftMessage("Worker's proposed budget and timeline applied. Review and resubmit.");
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-300 hover:bg-rose-500/25 transition cursor-pointer"
                        >
                          <RiFlashlightFill className="w-3.5 h-3.5" />
                          <span>Apply Desired Terms</span>
                        </button>
                      )}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 text-xs">
                      {parsedRejection.counterBudget && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-slate-400 dark:text-zinc-500">Desired Budget:</span>
                          <span className="ml-1.5 font-bold text-slate-900 dark:text-white">{formatMoney(parsedRejection.counterBudget)}</span>
                        </div>
                      )}
                      {parsedRejection.counterDate && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60">
                          <span className="text-slate-400 dark:text-zinc-500">Desired Date:</span>
                          <span className="ml-1.5 font-bold text-slate-900 dark:text-white">{formatDateTime(parsedRejection.counterDate)}</span>
                        </div>
                      )}
                    </div>

                    {parsedRejection.reason && (
                      <p className="text-xs text-slate-700 dark:text-zinc-300 italic pt-1 border-t border-slate-100 dark:border-zinc-800">
                        "{parsedRejection.reason}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {termsStatus === "submitted" && (
              <div className="rounded-3xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-5 shadow-xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <RiTimeLine className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Awaiting Artisan Acceptance
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                    {isClient
                      ? `Draft submitted for review. Waiting for ${contract.worker_name || "the worker"} to accept terms before you can finalize.`
                      : `${contract.client_name || "The client"} submitted these terms. Review the scope and budget below and accept or propose changes.`}
                  </p>
                </div>
              </div>
            )}

            {termsStatus === "accepted" && (
              <div className="rounded-3xl border border-emerald-300 dark:border-[#45BA50]/30 bg-emerald-50 dark:bg-[#45BA50]/10 p-5 shadow-xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#134e27]/25 text-[#a4fe47] flex items-center justify-center shrink-0 border border-[#45BA50]/30">
                  <RiCheckboxCircleFill className="w-5 h-5 text-[#a4fe47]" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-black uppercase tracking-wider text-[#45BA50]">
                    Terms Agreed
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
                    {isClient
                      ? "The artisan has formally accepted all terms! You can now finalize the draft to open electronic signatures."
                      : "You accepted the proposed agreement terms. Waiting for the client to finalize the contract for signing."}
                  </p>
                </div>
              </div>
            )}

            {/* UNIFIED CONTRACT DOCUMENT SHEET */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs divide-y divide-slate-200/80 dark:divide-zinc-800 overflow-hidden">
              
              {/* Section 1: Scope of Work */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <RiBriefcaseLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      1. Scope of Work & Deliverables
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                      Define the exact trade tasks and quality acceptance criteria.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  <DraftField
                    label="Project Title"
                    value={draftForm.jobTitle}
                    readOnly={!canEditDraft}
                    required
                    onChange={(value) => updateDraftField("jobTitle", value)}
                    placeholder="e.g. Bathroom plumbing overhaul & valve fittings"
                    helperText="Clear project title identifying the required skilled service."
                    icon={RiBriefcaseLine}
                  />
                  <DraftField
                    label="Detailed Scope & Acceptance Criteria"
                    value={draftForm.jobDescription}
                    readOnly={!canEditDraft}
                    required
                    multiline
                    onChange={(value) => updateDraftField("jobDescription", value)}
                    placeholder="Describe exact tasks, materials quality, milestone deliverables, and completion conditions..."
                    helperText="Specific tasks, quality milestones, and acceptance conditions."
                    icon={RiFileTextLine}
                  />
                </div>
              </div>

              {/* Section 2: Financial Terms & Timeline */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#134e27]/25 text-[#a4fe47] flex items-center justify-center shrink-0 border border-[#45BA50]/30">
                    <RiCoinsLine className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      2. Financial Terms & Delivery Schedule
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                      Direct compensation release and milestone delivery schedule.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-1">
                  <DraftField
                    label="Agreed Compensation"
                    value={String(draftForm.paymentAmount ?? "")}
                    readOnly={!canEditDraft}
                    required
                    type="number"
                    unitBadge="ETB"
                    onChange={(value) => updateDraftField("paymentAmount", value)}
                    placeholder="0"
                    helperText="Secured safely under DireSkill milestone protection until verified completion."
                    icon={RiCoinsLine}
                  />
                  <DraftField
                    label="Target Completion Date & Time"
                    value={draftForm.estimatedCompletionDate}
                    readOnly={!canEditDraft}
                    required
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 19)}
                    onChange={(value) => updateDraftField("estimatedCompletionDate", value)}
                    helperText="Delivery deadline date and time for site milestone inspection."
                    icon={RiCalendarLine}
                  />
                  <div className="sm:col-span-2">
                    <DraftField
                      label="Physical Jobsite Location"
                      value={draftForm.workLocation}
                      readOnly={!canEditDraft}
                      required
                      onChange={(value) => updateDraftField("workLocation", value)}
                      placeholder="e.g. Kebele 02, Near Commercial Bank, Dire Dawa"
                      helperText="Physical job site or neighborhood in Dire Dawa."
                      icon={RiMapPin2Line}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Legal Responsibilities & Materials */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 border border-purple-500/20">
                    <RiShieldCheckFill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      3. Legal Responsibilities & Materials Allocation
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                      Identify material procurement, equipment supply, and safety standards.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  <DraftField
                    label="Materials & Tools Responsibility"
                    value={draftForm.materialsResponsibility}
                    readOnly={!canEditDraft}
                    required
                    multiline
                    onChange={(value) => updateDraftField("materialsResponsibility", value)}
                    placeholder="Specify whether client or artisan supplies raw materials, equipment, ladders, or tools..."
                    helperText="Specify whether client or worker supplies raw materials, equipment, safety apparatus, or permits."
                    icon={RiBriefcaseLine}
                  />
                  <DraftField
                    label="Additional Site Conditions & Warranty"
                    value={draftForm.additionalNotes}
                    readOnly={!canEditDraft}
                    multiline
                    onChange={(value) => updateDraftField("additionalNotes", value)}
                    placeholder="Working hours, access permits, clean-up requirements, workmanship warranty..."
                    helperText="Working hours, access credentials, site cleanup requirements, or warranty agreements."
                    icon={RiFileTextLine}
                  />
                </div>
              </div>

              {/* Feedback Alert messages */}
              {(draftError || draftMessage) && (
                <div className="p-5">
                  {draftError && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <RiAlertLine className="w-4 h-4 shrink-0" />
                      <span>{draftError}</span>
                    </div>
                  )}
                  {draftMessage && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-[#45BA50]/30 text-xs sm:text-sm font-bold text-[#45BA50] flex items-center gap-2">
                      <RiCheckboxCircleFill className="w-4 h-4 text-[#a4fe47] shrink-0" />
                      <span>{draftMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Client Draft Action Bar */}
              {canEditDraft && (
                <div className="p-5 bg-slate-50/80 dark:bg-zinc-800/40 border-t border-slate-200/80 dark:border-zinc-800 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={isSavingDraft || isFinalizingDraft}
                      className="inline-flex min-h-[46px] py-2.5 px-5 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-700/80 disabled:opacity-50 transition active:scale-[0.98] cursor-pointer shadow-2xs"
                    >
                      <RiSave3Line className="w-4 h-4 text-[#45BA50]" />
                      <span>
                        {isSavingDraft
                          ? "Saving..."
                          : termsStatus === "rejected"
                          ? "Save & Resubmit Terms"
                          : termsStatus === "draft"
                          ? "Save Initial Draft"
                          : "Update Proposed Terms"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowFinalizeModal(true)}
                      disabled={isSavingDraft || isFinalizingDraft || !canFinalizeDraft}
                      className={cx(
                        "inline-flex min-h-[46px] py-2.5 px-5 flex-1 items-center justify-center gap-2 rounded-2xl text-xs sm:text-sm font-bold transition active:scale-[0.98]",
                        canFinalizeDraft
                          ? "bg-[#45BA50] hover:bg-[#3ca346] text-white shadow-[0_2px_10px_rgba(69,186,80,0.3)] cursor-pointer"
                          : "bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed"
                      )}
                    >
                      <RiLockLine className="w-4 h-4" />
                      <span>Finalize for Electronic Signing</span>
                    </button>
                  </div>

                  {!canFinalizeDraft && (
                    <p className="text-center text-[11px] text-slate-400 dark:text-zinc-500 leading-relaxed">
                      {termsStatus === "submitted"
                        ? "Waiting for the artisan to accept the terms before finalization."
                        : termsStatus === "rejected"
                        ? "Artisan requested revisions. Adjust terms and click 'Save & Resubmit Terms'."
                        : "Submit terms to the artisan for acceptance before finalization."}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Worker Terms Review Action Card */}
            {canWorkerReviewTerms && (
              <div className="rounded-3xl border border-[#45BA50]/30 bg-white dark:bg-zinc-900/90 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#134e27]/25 text-[#a4fe47] flex items-center justify-center shrink-0 border border-[#45BA50]/30">
                    <RiBriefcaseLine className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#a4fe47]">
                      Artisan Action Required
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      Review Proposed Terms & Compensation
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mt-1">
                      Please examine the scope, compensation of{" "}
                      <strong className="text-slate-900 dark:text-white font-bold">{formatMoney(displayPayment)}</strong>,
                      and target schedule above. Accept to proceed to finalization, or counter-propose changes.
                    </p>
                  </div>
                </div>

                {!showRejectForm ? (
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleAcceptTerms}
                      disabled={isTermsActionLoading}
                      className="inline-flex min-h-[46px] py-2.5 px-5 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#45BA50] hover:bg-[#3ca346] text-white text-xs sm:text-sm font-bold shadow-[0_2px_10px_rgba(69,186,80,0.3)] transition active:scale-[0.98] cursor-pointer"
                    >
                      <RiCheckboxCircleFill className="w-4 h-4 text-[#a4fe47]" />
                      <span>{isTermsActionLoading ? "Processing..." : "Accept Proposed Terms"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      disabled={isTermsActionLoading}
                      className="inline-flex min-h-[46px] py-2.5 px-5 flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition active:scale-[0.98] cursor-pointer"
                    >
                      <RiCloseCircleLine className="w-4 h-4" />
                      <span>Request Revisions</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5 p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        Submit Counter-Proposal
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(false)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1">
                          Desired Compensation (ETB)
                        </label>
                        <input
                          type="number"
                          value={counterBudget}
                          onChange={(e) => setCounterBudget(e.target.value)}
                          placeholder={String(contract.payment_amount || contract.budget || "1000")}
                          className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1">
                          Desired Completion Date
                        </label>
                        <input
                          type="datetime-local"
                          step="1"
                          value={counterDate}
                          min={new Date().toISOString().slice(0, 19)}
                          onChange={(e) => setCounterDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-rose-500 [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-1">
                        Revision Reason <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={termsRejectReason}
                        onChange={(event) => setTermsRejectReason(event.target.value)}
                        rows={3}
                        placeholder="Explain required changes, additional materials needed, or schedule constraints..."
                        className="w-full rounded-xl border border-rose-300 dark:border-rose-500/30 bg-white dark:bg-zinc-800 p-3 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleRejectTerms}
                        disabled={isTermsActionLoading || !termsRejectReason.trim()}
                        className="inline-flex min-h-[42px] py-2 px-5 flex-1 items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold transition active:scale-[0.98] cursor-pointer"
                      >
                        {isTermsActionLoading ? "Submitting..." : "Send Counter-Proposal to Client"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Signatures, Identity Verification, and Evidence */}
          <aside className="space-y-5">
            
            {/* Signatures Dossier Card */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                  Electronic Signatures
                </span>
                <RiCheckDoubleLine className="w-4 h-4 text-[#45BA50]" />
              </div>

              <div className="space-y-2.5">
                <SignatureRow label="Client Signature" name={contract.client_name} signedAt={contract.client_signed_at} />
                <SignatureRow label="Artisan Signature" name={contract.worker_name} signedAt={contract.worker_signed_at} />
              </div>

              {/* Fayda Identity Verification Rows */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Identity & Compliance
                </p>
                <VerificationStatusRow label="Client" verified={clientVerified} maskedFin={contract.client_masked_fin} />
                <VerificationStatusRow label="Worker" verified={workerVerified} maskedFin={contract.worker_masked_fin} />
                {!bothPartiesVerified && (
                  <p className="text-[11px] font-bold text-rose-500 leading-tight">
                    Both parties must complete Fayda KYC verification before signing.
                  </p>
                )}
              </div>

              {/* Completion Review (If requested by worker) */}
              {canClientReviewCompletion && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                    Completion Verification
                  </span>
                  <p className="text-xs text-slate-700 dark:text-zinc-300">
                    The artisan has marked this project delivered. Inspect the site work before approving release.
                  </p>
                  <textarea
                    value={completionRejectReason}
                    onChange={(event) => setCompletionRejectReason(event.target.value)}
                    placeholder="Reason if rejecting delivered work..."
                    className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmCompletion}
                      disabled={isCompletionActionLoading}
                      className="inline-flex min-h-[40px] py-2 px-4 flex-1 items-center justify-center rounded-xl bg-[#45BA50] hover:bg-[#3ca346] text-white text-xs font-bold transition active:scale-[0.98] cursor-pointer"
                    >
                      Confirm & Pay
                    </button>
                    <button
                      type="button"
                      onClick={handleRejectCompletion}
                      disabled={isCompletionActionLoading || !completionRejectReason.trim()}
                      className="inline-flex min-h-[40px] py-2 px-4 flex-1 items-center justify-center rounded-xl border border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition active:scale-[0.98] cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Sign Contract Section */}
              {contractStatus === "ACTIVE" ? (
                <div className="p-3.5 rounded-2xl bg-[#134e27]/25 border border-[#45BA50]/30 text-xs font-bold text-[#a4fe47] flex items-center gap-2">
                  <RiShieldCheckFill className="w-4 h-4 text-[#a4fe47] shrink-0" />
                  <span>Contract fully executed and legally active.</span>
                </div>
              ) : contractStatus === "DRAFT" ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 text-xs font-medium text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Contract is currently in draft. Once both parties agree on terms and the draft is finalized, electronic signing unlocks.
                </div>
              ) : !bothPartiesVerified && canSign && !userHasSigned ? (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-500">
                  Fayda KYC verification required before signing.
                </div>
              ) : !canSign ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 text-xs font-bold text-slate-500 dark:text-zinc-400">
                  {userHasSigned ? "Waiting for the other party's signature." : "Contract not ready for signature yet."}
                </div>
              ) : !userHasSigned ? (
                <div className="space-y-3 pt-2">
                  <div className="space-y-2">
                    {[
                      ["readCompletely", "I have read this contract completely."],
                      ["understandsTerms", "I understand all terms and conditions."],
                      ["voluntarilyAgrees", "I voluntarily agree to this agreement."],
                      ["pinIsSignature", "My Contract PIN acts as my binding electronic signature."],
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-start gap-2.5 p-2.5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/30 cursor-pointer text-xs font-medium text-slate-800 dark:text-zinc-200">
                        <input
                          type="checkbox"
                          checked={signatureConsent[key as keyof typeof signatureConsent]}
                          onChange={(e) =>
                            setSignatureConsent((curr) => ({
                              ...curr,
                              [key]: e.target.checked,
                            }))
                          }
                          className="mt-0.5 h-4 w-4 accent-[#45BA50] cursor-pointer"
                        />
                        <span className="leading-snug">{label}</span>
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPinModalOpen(true)}
                    disabled={isSigning || !hasAllSignatureConsent || !bothPartiesVerified}
                    className="inline-flex min-h-[48px] py-3 px-5 w-full items-center justify-center gap-2 rounded-2xl bg-[#45BA50] hover:bg-[#3ca346] text-white text-xs sm:text-sm font-black shadow-[0_2px_12px_rgba(69,186,80,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98] cursor-pointer"
                  >
                    <RiShieldCheckFill className="w-4 h-4 text-[#a4fe47]" />
                    <span>{isSigning ? "Signing Contract..." : "Sign with Security PIN"}</span>
                  </button>
                </div>
              ) : isFullySigned ? (
                <div className="p-3.5 rounded-2xl bg-[#134e27]/25 border border-[#45BA50]/30 text-xs font-bold text-[#a4fe47]">
                  Both parties have signed. Activating legal record...
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500 flex items-center gap-2">
                  <RiTimeLine className="w-4 h-4 shrink-0" />
                  <span>Waiting for counter-party to sign.</span>
                </div>
              )}
            </div>

            {/* Cryptographic & PDF Evidence Dossier */}
            <DocumentEvidenceCard
              pdfUrl={contract.pdf_url}
              documentHash={contract.document_hash}
              qrCodeDataUrl={contract.qr_code_data_url}
              activatedAt={contract.activated_at}
            />

            {/* Legal Evidence Export Package */}
            <ParticipantEvidenceExportButton contractId={contract.id} />
          </aside>

        </section>

      </div>

      {/* ── Security PIN Verification Modal ─────────────────────────────── */}
      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onVerify={handleSign}
        title="Electronic Signature Authorization"
        description="Enter your 4-digit Contract PIN. This constitutes a legally-binding electronic signature on this DireSkill contract."
      />

      {/* ── Finalize Draft Confirmation Dialog ───────────────────────────── */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#134e27]/25 text-[#a4fe47] flex items-center justify-center shrink-0 border border-[#45BA50]/30">
                <RiLockLine className="w-5 h-5 text-[#a4fe47]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Lock & Finalize Agreement
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Finalizing will permanently lock terms and allow both parties to electronically sign with their Contract PINs.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFinalizeModal(false)}
                disabled={isFinalizingDraft}
                className="inline-flex min-h-[44px] py-2.5 px-4 flex-1 items-center justify-center rounded-2xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalizeDraft}
                disabled={isFinalizingDraft}
                className="inline-flex min-h-[44px] py-2.5 px-4 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#45BA50] hover:bg-[#3ca346] text-white text-xs font-bold shadow-[0_2px_10px_rgba(69,186,80,0.3)] transition cursor-pointer"
              >
                {isFinalizingDraft ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <RiCheckboxCircleFill className="w-4 h-4 text-[#a4fe47]" />
                )}
                <span>{isFinalizingDraft ? "Finalizing..." : "Confirm & Lock"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
