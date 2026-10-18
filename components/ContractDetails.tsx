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
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Download,
  Check,
  ArrowLeft,
  Save,
  Lock,
  PenTool,
  Briefcase,
  Calendar,
  MapPin,
  Banknote,
  FileText,
  FileCheck,
  AlertTriangle,
  ArrowRightLeft,
  Layers,
  Sparkles,
  Phone,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import dynamic from "next/dynamic";

const JobSiteMap = dynamic(() => import("@/components/contract/JobSiteMap"), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full rounded-xl bg-slate-100 dark:bg-[#0a0f18] animate-pulse flex items-center justify-center text-xs text-slate-400">
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
    second: "2-digit",
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
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e141d] p-3.5 shadow-sm">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">{name || "Unknown"}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {signed ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-[#a3e635]" />
        ) : (
          <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        )}
        <div className="text-right">
          <p className={`text-xs font-bold ${signed ? "text-emerald-600 dark:text-[#a3e635]" : "text-slate-500 dark:text-slate-400"}`}>
            {signed ? "Signed" : "Pending"}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatDateTime(signedAt)}</p>
        </div>
      </div>
    </div>
  );
}

function VerificationStatusRow({ label, verified, maskedFin }: { label: string; verified: boolean; maskedFin?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
      <div>
        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{label}</span>
        <p className="mt-0.5 font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          FIN: {maskedFin || "Not recorded"}
        </p>
      </div>
      <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${verified && maskedFin ? "text-emerald-600 dark:text-[#a3e635]" : "text-rose-600 dark:text-rose-400"}`}>
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
    <div className="rounded-2xl border border-emerald-500/30 dark:border-[#a3e635]/30 bg-white dark:bg-[#0e141d] p-5 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-[#a3e635]/15 text-emerald-600 dark:text-[#a3e635] border border-emerald-500/20 dark:border-[#a3e635]/30">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-[#a3e635]">Activated Evidence</p>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">DireSkill Verified Agreement</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Activated {formatDateTime(activatedAt)}
          </p>
        </div>
      </div>

      {qrCodeDataUrl && (
        <div className="flex justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
          <img src={qrCodeDataUrl} alt="Contract verification QR code" className="h-24 w-24" />
        </div>
      )}

      {documentHash && (
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">SHA-256 Hash</p>
          <p className="mt-1 break-all font-mono text-[10px] leading-4 text-slate-700 dark:text-slate-300">{documentHash}</p>
        </div>
      )}

      {pdfUrl && (
        <a
          href={pdfUrl}
          className="inline-flex min-h-[44px] py-2.5 px-4 h-auto w-full items-center justify-center gap-2 rounded-xl bg-primary text-white dark:bg-[#a3e635] dark:text-black text-xs sm:text-sm font-bold hover:opacity-95 shadow-sm transition active:scale-[0.98] text-center"
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
        <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {Icon && <Icon className="h-3.5 w-3.5 text-primary dark:text-[#a3e635]" />}
          <span>{label}</span>
          {required && !readOnly && <span className="text-rose-500">*</span>}
        </label>
        {readOnly && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Read Only
          </span>
        )}
      </div>

      {readOnly ? (
        <div className="min-h-[42px] rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/75 dark:bg-white/5 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 transition">
          {value ? (
            <span className={multiline ? "whitespace-pre-wrap leading-relaxed font-normal" : ""}>
              {type === "datetime-local" ? formatDateTime(value) : value}{" "}
              {unitBadge && <span className="font-bold text-emerald-600 dark:text-[#a3e635] ml-1">{unitBadge}</span>}
            </span>
          ) : (
            <span className="italic text-slate-400 dark:text-slate-500 font-normal">Not provided</span>
          )}
        </div>
      ) : multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full resize-y rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0a0f18] px-3.5 py-2.5 text-xs sm:text-sm font-medium leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition focus:border-primary dark:focus:border-[#a3e635] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#a3e635]/20 focus:bg-white dark:focus:bg-[#0c1320]"
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
            className={`w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0a0f18] py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition focus:border-primary dark:focus:border-[#a3e635] focus:ring-2 focus:ring-primary/20 dark:focus:ring-[#a3e635]/20 focus:bg-white dark:focus:bg-[#0c1320] [color-scheme:light] dark:[color-scheme:dark] ${
              unitBadge ? "pl-3.5 pr-14 text-base font-bold text-slate-900 dark:text-white" : "px-3.5"
            }`}
          />
          {unitBadge && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="rounded-md border border-slate-300 dark:border-[#a3e635]/30 bg-slate-100 dark:bg-[#a3e635]/15 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-[#a3e635]">
                {unitBadge}
              </span>
            </div>
          )}
        </div>
      )}

      {helperText && !readOnly && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-1 leading-normal">
          {helperText}
        </p>
      )}
    </div>
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
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e141d] p-6 shadow-sm divide-y divide-slate-200 dark:divide-white/10 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-[#a3e635]" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-[#a3e635]">Finalized Agreement</p>
          </div>
          <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">Binding Service Contract</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            This agreement is permanently locked and ready for electronic signatures.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-slate-300 dark:border-[#a3e635]/40 bg-slate-100 dark:bg-[#a3e635]/10 px-3 py-1 text-xs font-bold text-slate-700 dark:text-[#a3e635]">
          <Lock className="h-3.5 w-3.5" />
          <span>Locked for Signatures</span>
        </div>
      </div>

      {/* Section 1: Scope */}
      <div className="pt-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary dark:text-[#a3e635]">
          <Briefcase className="h-4 w-4" />
          <span>1. Scope of Work & Deliverables</span>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4 space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Project Title</p>
            <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">{title || "Not provided"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Agreed Scope & Details</p>
            <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
              {description || "Not provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Financial Terms & Timeline */}
      <div className="pt-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary dark:text-[#a3e635]">
          <Banknote className="h-4 w-4" />
          <span>2. Financial Terms & Delivery Schedule</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Agreed Payment</p>
            <p className="mt-1 text-lg font-black text-emerald-600 dark:text-[#a3e635]">
              {paymentAmount ? `${Number(paymentAmount).toLocaleString()} ETB` : "Not provided"}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">Escrow Protected</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completion Date & Time</p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {estimatedCompletionDate ? formatDateTime(estimatedCompletionDate) : "Not provided"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Work Location</p>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{workLocation || "Dire Dawa"}</p>
          </div>
        </div>
      </div>

      {/* Section 3: Responsibilities */}
      <div className="pt-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary dark:text-[#a3e635]">
          <ShieldCheck className="h-4 w-4" />
          <span>3. Legal Responsibilities & Materials</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Materials & Equipment</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
              {materialsResponsibility || "Standard agreement terms apply."}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Additional Site Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
              {additionalNotes || "Standard agreement terms apply."}
            </p>
          </div>
        </div>
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
    <section className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e141d] px-4 py-3.5 shadow-sm">
      <div className="overflow-x-auto no-scrollbar">
        <ol className="flex min-w-[580px] items-center">
          {WORKFLOW_STEPS.map((step, index) => {
            const isComplete = index < currentStep;
            const isActive = index === currentStep;

            return (
              <li key={step} className="flex flex-1 items-center">
                <div className="flex min-w-0 flex-col items-center gap-1.5">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold transition-colors ${
                      isComplete || isActive
                        ? "border-primary bg-primary text-white dark:border-[#a3e635] dark:bg-[#a3e635] dark:text-black"
                        : "border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    {isComplete ? (
                      <Check className="h-3 w-3 stroke-[3]" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`whitespace-nowrap text-[10px] font-bold ${
                      isActive
                        ? "text-primary dark:text-[#a3e635]"
                        : isComplete
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>

                {index < WORKFLOW_STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 rounded-full ${
                      index < currentStep ? "bg-primary dark:bg-[#a3e635]" : "bg-slate-200 dark:bg-white/10"
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

    // Strict client-side validation
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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 sm:px-6 pb-28">
      {/* Top Header */}
      <header className="flex flex-col gap-3 border-b border-slate-200 dark:border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href={backHref}
            className="mb-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e141d] px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </Link>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-[#a3e635]">
            {t("contract.agreement")}
          </p>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {contract.job_title}
          </h1>
          <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">
            Contract #{String(contract.id).slice(0, 8).toUpperCase()}
          </p>
        </div>
        <StatusBadge status={contractStatus === "active" ? "contract_signed" : contractStatus} size="md" />
      </header>

      {/* Workflow Stepper */}
      <ContractWorkflowStepper currentStep={workflowStep} />

      {/* Compact Top Metrics Bar */}
      <section className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-white/10 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e141d] py-3.5 shadow-sm text-center">
        <div className="px-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Payment</p>
          <p className="mt-0.5 text-base sm:text-xl font-black text-emerald-600 dark:text-[#a3e635]">{formatMoney(displayPayment)}</p>
        </div>
        <div className="px-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Job Status</p>
          <p className="mt-1 text-xs sm:text-sm font-bold capitalize text-slate-900 dark:text-white truncate">
            {String(contract.job_status || "pending").replaceAll("_", " ")}
          </p>
        </div>
        <div className="px-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contract</p>
          <p className="mt-1 text-xs sm:text-sm font-bold capitalize text-slate-900 dark:text-white truncate">
            {String(contractStatus).toLowerCase().replaceAll("_", " ")}
          </p>
        </div>
      </section>

      {/* Active Contract Unlocked Site & Direct Contact Banner */}
      {contractStatus === "ACTIVE" && (
        <div className="rounded-xl border border-emerald-500/30 dark:border-[#a3e635]/30 bg-emerald-50/70 dark:bg-[#a3e635]/10 p-4 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-[#a3e635] border border-emerald-500/20">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-[#a3e635]">
                Contract Active • Site Location & Direct Contact Unlocked
              </span>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                Both parties have electronically signed with verified identity. Escrow funds are secured.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f18] p-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Job Site Location
              </p>
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-[#a3e635] shrink-0" />
                <span>{contract.work_location || "Dire Dawa, Ethiopia"}</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Worker may proceed to site as agreed.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f18] p-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isClient ? "Worker Direct Phone" : "Client Direct Phone"}
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {(isClient ? contract.worker_phone : contract.client_phone) || "09********"}
                </p>
                {(isClient ? contract.worker_phone : contract.client_phone) && (
                  <a
                    href={`tel:${isClient ? contract.worker_phone : contract.client_phone}`}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-xs font-bold transition shadow-sm"
                  >
                    <Phone className="h-3 w-3" />
                    <span>Call Now</span>
                  </a>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Direct phone line for on-site coordination.
              </p>
            </div>
          </div>

          {/* Interactive OpenStreetMap Site Location */}
          <div className="pt-2 border-t border-emerald-500/20 dark:border-white/10">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-[#a3e635]" />
              <span>Interactive OpenStreetMap • Travel Navigation</span>
            </p>
            <JobSiteMap
              workLocation={contract.work_location}
              latitude={contract.client_latitude}
              longitude={contract.client_longitude}
              jobTitle={contract.job_title}
              clientName={contract.client_name}
            />
          </div>
        </div>
      )}

      {/* Compact Agreement Parties Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e141d] p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2.5 mb-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-[#a3e635]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {t("contract.parties")}
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
            DireSkill Smart Contract #{String(contract.id).slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] items-center">
          {/* Client Party */}
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 p-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary text-sm">
              {contract.client_avatar ? (
                <img src={contract.client_avatar} alt="" className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                (contract.client_name || "C").charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("contract.client")}
                </span>
                {clientVerified ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("contract.verified")}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400">
                    {t("contract.notVerified")}
                  </span>
                )}
              </div>
              <p className="truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{contract.client_name || "Client"}</p>
              {contract.client_masked_fin && (
                <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  FIN: {contract.client_masked_fin}
                </p>
              )}
              {contractStatus === "ACTIVE" && contract.client_phone ? (
                <p className="text-[10px] font-mono text-emerald-600 dark:text-[#a3e635]">
                  Phone: {contract.client_phone}
                </p>
              ) : (
                <p className="text-[10px] font-mono text-slate-400">
                  Phone: 09•••••••• (Unlocked upon contract signing)
                </p>
              )}
            </div>
          </div>

          {/* Center Divider / Handshake */}
          <div className="hidden lg:flex flex-col items-center justify-center px-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Worker Party */}
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 p-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 dark:bg-[#a3e635]/15 font-bold text-emerald-600 dark:text-[#a3e635] text-sm">
              {contract.worker_avatar ? (
                <img src={contract.worker_avatar} alt="" className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                (contract.worker_name || "W").charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-[#a3e635]">
                  {t("contract.worker")}
                </span>
                {workerVerified ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("contract.verified")}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400">
                    {t("contract.notVerified")}
                  </span>
                )}
              </div>
              <p className="truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{contract.worker_name || "Service Professional"}</p>
              {contract.worker_masked_fin && (
                <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  FIN: {contract.worker_masked_fin}
                </p>
              )}
              {contractStatus === "ACTIVE" && contract.worker_phone ? (
                <p className="text-[10px] font-mono text-emerald-600 dark:text-[#a3e635]">
                  Phone: {contract.worker_phone}
                </p>
              ) : (
                <p className="text-[10px] font-mono text-slate-400">
                  Phone: 09•••••••• (Unlocked upon contract signing)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        {contractStatus === "DRAFT" ? (
          <div className="space-y-4">
            {/* Terms Negotiation Status Alert Banner */}
            {termsStatus === "rejected" ? (
              <div className="rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4 shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        {t("contract.termsRejectedTitle")}
                      </span>
                      {contract.terms_rejected_at && (
                        <span className="text-[10px] font-semibold text-rose-500/80">
                          • {formatDateTime(contract.terms_rejected_at)}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      {isClient
                        ? "The worker reviewed the proposed draft and requested changes:"
                        : "You requested the following revisions before you can accept this draft:"}
                    </p>
                  </div>
                </div>

                {parsedRejection && (
                  <div className="rounded-xl border border-rose-200 dark:border-rose-500/20 bg-white/80 dark:bg-[#0a0f18]/80 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        {t("contract.counterTermsTitle")}
                      </p>
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
                            setDraftMessage("Worker's desired terms applied! Review and save to resubmit.");
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 px-2.5 py-1 text-xs font-bold transition cursor-pointer"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>{t("contract.applyCounterTerms")}</span>
                        </button>
                      )}
                    </div>

                    {(parsedRejection.counterBudget || parsedRejection.counterDate) && (
                      <div className="grid gap-2 sm:grid-cols-2 text-xs">
                        {parsedRejection.counterBudget && (
                          <div className="rounded-lg bg-slate-50 dark:bg-white/5 p-2 border border-slate-200 dark:border-white/5">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">{t("contract.counterBudget")}:</span>
                            <span className="ml-1.5 font-bold text-slate-900 dark:text-white">{formatMoney(parsedRejection.counterBudget)}</span>
                          </div>
                        )}
                        {parsedRejection.counterDate && (
                          <div className="rounded-lg bg-slate-50 dark:bg-white/5 p-2 border border-slate-200 dark:border-white/5">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">{t("contract.counterDate")}:</span>
                            <span className="ml-1.5 font-bold text-slate-900 dark:text-white">{formatDateTime(parsedRejection.counterDate)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {parsedRejection.reason && (
                      <p className="text-xs text-slate-800 dark:text-slate-200 italic leading-relaxed pt-1">
                        "{parsedRejection.reason}"
                      </p>
                    )}
                  </div>
                )}

                {isClient && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Adjust the scope, compensation, or completion date in the form below, then click{" "}
                    <strong className="text-slate-900 dark:text-white font-bold">"{t("contract.resubmitTerms")}"</strong> to send updated terms.
                  </p>
                )}
              </div>
            ) : termsStatus === "submitted" ? (
              <div className="rounded-xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      {t("contract.termsSubmittedTitle")}
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      {isClient
                        ? `Terms submitted for worker review. Waiting for ${contract.worker_name || "the worker"} to review and accept before you can finalize.`
                        : `${contract.client_name || "The client"} submitted these proposed terms. Please review the scope, compensation, and schedule below.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : termsStatus === "accepted" ? (
              <div className="rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {t("contract.termsAcceptedTitle")}
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      {isClient
                        ? `The worker formally accepted all proposed terms. You can now finalize this draft to advance to electronic signatures.`
                        : `You accepted these proposed terms. Waiting for ${contract.client_name || "the client"} to finalize the contract for signing.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-sky-300 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                      {t("contract.termsDraftTitle")}
                    </p>
                    <p className="mt-0.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                      {isClient
                        ? "Enter the project scope, compensation, and completion date below. Save and submit to send the proposal to the worker."
                        : `${contract.client_name || "The client"} is preparing the initial contract draft. You will be invited to review once submitted.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* UNIFIED CONTRACT DOCUMENT SHEET */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e141d] shadow-sm divide-y divide-slate-200 dark:divide-white/10 overflow-hidden">
              {/* Section 1: Scope of Work */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-[#a3e635]/15 text-primary dark:text-[#a3e635]">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {t("contract.scopeSection")}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("contract.scopeDesc")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-1">
                  <DraftField
                    label={t("contract.jobTitle")}
                    value={draftForm.jobTitle}
                    readOnly={!canEditDraft}
                    required
                    onChange={(value) => updateDraftField("jobTitle", value)}
                    placeholder={t("contract.jobTitlePlaceholder")}
                    helperText="Clear project title identifying the required skilled service."
                    icon={Briefcase}
                  />
                  <DraftField
                    label={t("contract.jobDesc")}
                    value={draftForm.jobDescription}
                    readOnly={!canEditDraft}
                    required
                    multiline
                    onChange={(value) => updateDraftField("jobDescription", value)}
                    placeholder={t("contract.jobDescPlaceholder")}
                    helperText="Specific tasks, quality milestones, and acceptance conditions."
                    icon={FileText}
                  />
                </div>
              </div>

              {/* Section 2: Financial Terms & Timeline */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-[#a3e635]/15 text-primary dark:text-[#a3e635]">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {t("contract.financeSection")}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("contract.financeDesc")}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-2 pt-1">
                  <DraftField
                    label={t("contract.paymentAmount")}
                    value={String(draftForm.paymentAmount ?? "")}
                    readOnly={!canEditDraft}
                    required
                    type="number"
                    unitBadge="ETB"
                    onChange={(value) => updateDraftField("paymentAmount", value)}
                    placeholder="0"
                    helperText="Held safely in DireSkill Escrow until verified job completion."
                    icon={Banknote}
                  />
                  <DraftField
                    label={t("contract.completionDate")}
                    value={draftForm.estimatedCompletionDate}
                    readOnly={!canEditDraft}
                    required
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 19)}
                    onChange={(value) => updateDraftField("estimatedCompletionDate", value)}
                    helperText="Target completion date & time (Hour:Minute:Second)."
                    icon={Calendar}
                  />
                  <div className="sm:col-span-2">
                    <DraftField
                      label={t("contract.workLocation")}
                      value={draftForm.workLocation}
                      readOnly={!canEditDraft}
                      required
                      onChange={(value) => updateDraftField("workLocation", value)}
                      placeholder={t("contract.workLocationPlaceholder")}
                      helperText="Physical job site or neighborhood in Dire Dawa."
                      icon={MapPin}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Legal Responsibilities & Materials */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-[#a3e635]/15 text-primary dark:text-[#a3e635]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {t("contract.termsSection")}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("contract.termsDesc")}
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-1">
                  <DraftField
                    label={t("contract.materials")}
                    value={draftForm.materialsResponsibility}
                    readOnly={!canEditDraft}
                    required
                    multiline
                    onChange={(value) => updateDraftField("materialsResponsibility", value)}
                    placeholder={t("contract.materialsPlaceholder")}
                    helperText="Specify whether client or worker supplies raw materials, equipment, safety apparatus, or permits."
                    icon={Layers}
                  />
                  <DraftField
                    label={t("contract.additionalNotes")}
                    value={draftForm.additionalNotes}
                    readOnly={!canEditDraft}
                    multiline
                    onChange={(value) => updateDraftField("additionalNotes", value)}
                    placeholder={t("contract.additionalNotesPlaceholder")}
                    helperText="Working hours, access credentials, site cleanup requirements, or warranty agreements."
                    icon={FileText}
                  />
                </div>
              </div>

              {/* Status and Error messages inside sheet */}
              {(draftError || draftMessage) && (
                <div className="p-4 sm:p-5">
                  {draftError && (
                    <div className="rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-3 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                      {draftError}
                    </div>
                  )}
                  {draftMessage && (
                    <div className="rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-3 text-xs sm:text-sm font-bold text-emerald-600 dark:text-[#a3e635]">
                      {draftMessage}
                    </div>
                  )}
                </div>
              )}

              {/* Client Draft Action Bar with flexible mobile sizing */}
              {canEditDraft && (
                <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={isSavingDraft || isFinalizingDraft}
                      className="inline-flex min-h-[48px] py-3 px-4 h-auto flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0a0f18] hover:bg-slate-50 dark:hover:bg-white/5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98] shadow-sm cursor-pointer text-center leading-snug"
                    >
                      {isSavingDraft ? (
                        <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <Save className="h-4 w-4 shrink-0" />
                      )}
                      <span>
                        {isSavingDraft
                          ? "Saving..."
                          : termsStatus === "rejected"
                          ? t("contract.resubmitTerms")
                          : termsStatus === "draft"
                          ? t("contract.saveDraft")
                          : t("contract.updateTerms")}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFinalizeModal(true)}
                      disabled={isSavingDraft || isFinalizingDraft || !canFinalizeDraft}
                      title={!canFinalizeDraft ? "Worker acceptance is required before finalization" : "Finalize accepted terms"}
                      className={`inline-flex min-h-[48px] py-3 px-4 h-auto flex-1 items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold transition active:scale-[0.98] text-center leading-snug ${
                        canFinalizeDraft
                          ? "bg-primary text-white dark:bg-[#a3e635] dark:text-black shadow-sm hover:opacity-95 cursor-pointer"
                          : "border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                      }`}
                    >
                      <Lock className="h-4 w-4 shrink-0" />
                      <span>{t("contract.finalizeDraft")}</span>
                    </button>
                  </div>
                  {!canFinalizeDraft && (
                    <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {termsStatus === "submitted"
                        ? "Waiting for the worker to review and accept the terms before you can finalize."
                        : termsStatus === "rejected"
                        ? "Worker requested revisions. Adjust terms and click 'Save & Resubmit Terms' before finalization."
                        : "Submit terms to the worker for acceptance before finalization."}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Worker Terms Review Action Card with responsive buttons */}
            {canWorkerReviewTerms && (
              <div className="rounded-2xl border border-emerald-500/30 dark:border-[#a3e635]/40 bg-white dark:bg-[#0e141d] p-5 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-[#a3e635]/15 text-emerald-600 dark:text-[#a3e635] border border-emerald-500/20 dark:border-[#a3e635]/30">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-[#a3e635]">Worker Action Required</p>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Review Proposed Contract Terms</h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Please review the scope, compensation of <span className="font-bold text-emerald-600 dark:text-[#a3e635]">{formatMoney(displayPayment)}</span>, and completion timeline above. Accept to allow the client to finalize, or request changes with a counter-proposal.
                    </p>
                  </div>
                </div>

                {!showRejectForm ? (
                  <div className="flex flex-col gap-2.5 sm:flex-row pt-1">
                    <button
                      type="button"
                      onClick={handleAcceptTerms}
                      disabled={isTermsActionLoading}
                      className="inline-flex min-h-[48px] py-3 px-4 h-auto flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-white dark:bg-[#a3e635] dark:text-black text-xs sm:text-sm font-bold hover:opacity-95 shadow-sm disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98] cursor-pointer text-center leading-snug"
                    >
                      {isTermsActionLoading ? (
                        <span className="h-4 w-4 rounded-full border-2 border-white dark:border-black border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 stroke-[2.5] shrink-0" />
                      )}
                      <span>{t("contract.acceptTerms")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      disabled={isTermsActionLoading}
                      className="inline-flex min-h-[48px] py-3 px-4 h-auto flex-1 items-center justify-center gap-2 rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98] cursor-pointer text-center leading-snug"
                    >
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span>{t("contract.rejectTerms")}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/10 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        {t("contract.proposeCounterTerms")}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(false)}
                        className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          {t("contract.counterBudget")}
                        </label>
                        <input
                          type="number"
                          value={counterBudget}
                          onChange={(e) => setCounterBudget(e.target.value)}
                          placeholder={String(contract.payment_amount || contract.budget || "1000")}
                          className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0a0f18] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-rose-500 [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                          {t("contract.counterDate")}
                        </label>
                        <input
                          type="datetime-local"
                          step="1"
                          value={counterDate}
                          min={new Date().toISOString().slice(0, 19)}
                          onChange={(e) => setCounterDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0a0f18] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-rose-500 [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        Reason & Explanation <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={termsRejectReason}
                        onChange={(event) => setTermsRejectReason(event.target.value)}
                        rows={3}
                        placeholder="Explain what needs to change, why the budget or timeline needs adjusting, or materials needed..."
                        className="w-full resize-none rounded-xl border border-rose-300 dark:border-rose-500/40 bg-white dark:bg-[#0a0f18] px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="flex flex-col gap-2.5 sm:flex-row pt-1">
                      <button
                        type="button"
                        onClick={handleRejectTerms}
                        disabled={isTermsActionLoading || !termsRejectReason.trim()}
                        className="inline-flex min-h-[44px] py-2.5 px-4 h-auto flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 text-xs sm:text-sm font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98] cursor-pointer text-center leading-snug"
                      >
                        {isTermsActionLoading ? "Submitting..." : t("contract.submitRevisions")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(false)}
                        disabled={isTermsActionLoading}
                        className="inline-flex min-h-[44px] py-2.5 px-4 h-auto items-center justify-center rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                      >
                        {t("contract.cancel")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
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

        {/* Right Sidebar: Signatures, Identity Verification, and Documents */}
        <aside className="flex flex-col gap-4">
          <SignatureRow label="Client" name={contract.client_name} signedAt={contract.client_signed_at} />
          <SignatureRow label="Worker" name={contract.worker_name} signedAt={contract.worker_signed_at} />

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e141d] p-5 shadow-sm space-y-4">
            <div className="space-y-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Identity Verification</p>
              <VerificationStatusRow label="Client" verified={clientVerified} maskedFin={contract.client_masked_fin} />
              <VerificationStatusRow label="Worker" verified={workerVerified} maskedFin={contract.worker_masked_fin} />
              {!bothPartiesVerified && (
                <p className="text-xs font-bold leading-5 text-rose-600 dark:text-rose-400">
                  Both client and worker must complete identity verification before signing this contract.
                </p>
              )}
            </div>

            {canClientReviewCompletion && (
              <div className="space-y-3 rounded-xl border border-emerald-300 dark:border-[#a3e635]/30 bg-emerald-50 dark:bg-[#a3e635]/10 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-[#a3e635]">Completion Review</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  The worker marked this job complete. Confirm only after checking the delivered work.
                </p>
                <textarea
                  value={completionRejectReason}
                  onChange={(event) => setCompletionRejectReason(event.target.value)}
                  placeholder="Reason if rejecting completion"
                  className="min-h-16 w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#0a0f18] p-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-primary"
                />
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleConfirmCompletion}
                    disabled={isCompletionActionLoading}
                    className="inline-flex min-h-[44px] py-2.5 px-4 h-auto flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-white dark:bg-[#a3e635] dark:text-black text-xs sm:text-sm font-bold hover:opacity-95 shadow-sm disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98] text-center"
                  >
                    Confirm Completion
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectCompletion}
                    disabled={isCompletionActionLoading || !completionRejectReason.trim()}
                    className="inline-flex min-h-[44px] py-2.5 px-4 h-auto flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-500/10 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98] text-center"
                  >
                    Reject Completion
                  </button>
                </div>
              </div>
            )}

            {contractStatus === "ACTIVE" ? (
              <div className="rounded-xl border border-emerald-300 dark:border-[#a3e635]/30 bg-emerald-50 dark:bg-[#a3e635]/10 p-3.5 text-xs sm:text-sm font-bold text-emerald-700 dark:text-[#a3e635]">
                Contract activated. Work is now in progress and the final PDF evidence is available below.
              </div>
            ) : contractStatus === "DRAFT" ? (
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5 text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                This contract is currently in draft. Once both parties agree on terms and the draft is finalized, digital signing will be unlocked.
              </div>
            ) : isFullySigned || contractStatus === "FULLY_SIGNED" ? (
              <div className="rounded-xl border border-emerald-300 dark:border-[#a3e635]/30 bg-emerald-50 dark:bg-[#a3e635]/10 p-3.5 text-xs sm:text-sm font-bold text-emerald-700 dark:text-[#a3e635]">
                Contract fully signed. Final activation will generate the PDF, hash, QR code, and job start state.
              </div>
            ) : !bothPartiesVerified && canSign && !userHasSigned ? (
              <div className="rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-3.5 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
                Both client and worker must complete identity verification before signing this contract.
              </div>
            ) : !canSign ? (
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                {userHasSigned ? "Waiting for the other party to sign." : "This contract is not ready for your signature yet."}
              </div>
            ) : !userHasSigned ? (
              <div className="space-y-3.5">
                <div className="space-y-2.5">
                  {[
                    ["readCompletely", "I have read this contract completely."],
                    ["understandsTerms", "I understand all terms and conditions."],
                    ["voluntarilyAgrees", "I voluntarily agree to this contract."],
                    ["pinIsSignature", "I understand that my Contract PIN acts as my electronic signature."],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-start gap-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={signatureConsent[key as keyof typeof signatureConsent]}
                        onChange={(event) =>
                          setSignatureConsent((current) => ({
                            ...current,
                            [key]: event.target.checked,
                          }))
                        }
                        className="mt-0.5 h-4 w-4 accent-primary dark:accent-[#a3e635]"
                      />
                      <span className="text-xs font-bold leading-5 text-slate-800 dark:text-slate-200">{label}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(true)}
                  disabled={isSigning || !hasAllSignatureConsent || !bothPartiesVerified}
                  className="inline-flex min-h-[48px] py-3 px-5 h-auto w-full items-center justify-center gap-2 rounded-xl bg-primary text-white dark:bg-[#a3e635] dark:text-black text-xs sm:text-sm font-bold hover:opacity-95 shadow-sm disabled:cursor-not-allowed disabled:opacity-60 transition active:scale-[0.98] cursor-pointer text-center leading-snug"
                >
                  <PenTool className="h-4 w-4 stroke-[2.5]" />
                  <span>{isSigning ? "Signing..." : "Sign Contract"}</span>
                </button>
              </div>
            ) : isFullySigned ? (
              <div className="rounded-xl border border-emerald-300 dark:border-[#a3e635]/30 bg-emerald-50 dark:bg-[#a3e635]/10 p-3.5 text-xs sm:text-sm font-bold text-emerald-700 dark:text-[#a3e635]">
                Contract fully signed. Final activation will generate the PDF, hash, QR code, and job start state.
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                Waiting for the other party to sign.
              </div>
            )}

            {contract.pdf_url && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="mt-2 inline-flex min-h-[44px] py-2.5 px-4 h-auto w-full items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-xs font-bold text-slate-800 dark:text-white transition active:scale-[0.98] text-center"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e141d] p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-[#a3e635]/15 text-primary dark:text-[#a3e635] border border-primary/20 dark:border-[#a3e635]/30">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Finalize Draft</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  After finalizing, this contract becomes read-only and locked for electronic signatures.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row pt-2">
              <button
                type="button"
                onClick={() => setShowFinalizeModal(false)}
                disabled={isFinalizingDraft}
                className="inline-flex min-h-[44px] py-2.5 px-4 h-auto flex-1 items-center justify-center rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalizeDraft}
                disabled={isFinalizingDraft}
                className="inline-flex min-h-[44px] py-2.5 px-4 h-auto flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-white dark:bg-[#a3e635] dark:text-black text-xs font-bold hover:opacity-95 shadow-sm transition"
              >
                {isFinalizingDraft ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white dark:border-black border-t-transparent animate-spin shrink-0" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 stroke-[2.5] shrink-0" />
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
