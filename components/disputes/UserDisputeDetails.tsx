"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RiScales3Line,
  RiShieldCheckFill,
  RiCheckDoubleLine,
  RiTimeLine,
  RiAlertLine,
  RiArrowLeftLine,
  RiExternalLinkLine,
  RiImageLine,
  RiVideoLine,
  RiFilePdfLine,
  RiFileTextLine,
  RiAuctionLine,
  RiExchangeDollarLine,
  RiShieldFlashLine,
  RiInformationLine,
  RiFolderShield2Line,
} from "@remixicon/react";
import { GOVERNANCE_APPEAL_WINDOW_DAYS } from "@/lib/governance-constants";
import ParticipantEvidenceExportButton from "@/components/contract/ParticipantEvidenceExportButton";
import DisputeResponseForm from "@/components/disputes/DisputeResponseForm";
import DisputeEvidenceUploadForm from "@/components/disputes/DisputeEvidenceUploadForm";
import { addDisputeEvidence, submitDisputeResponse } from "@/lib/actions/disputes";
import { MOCK_DISPUTE_SCENARIOS } from "@/lib/mock-dispute";
import { cx } from "@/utils/cx";

/* ── draw-svg Skill: Justice Scale Platform Emblem ────────────────────────── */
function DisputeJusticeSeal({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="10" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M16 6v19M8 11h16M8 11l-3 7h6l-3-7zM24 11l-3 7h6l-3-7zM11 25h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="6" r="2" fill="currentColor" />
    </svg>
  );
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEvidenceIcon(mimeType: string = "") {
  if (mimeType.startsWith("image/")) return <RiImageLine className="size-4 text-accent-600 shrink-0" />;
  if (mimeType.startsWith("video/")) return <RiVideoLine className="size-4 text-chart-2 shrink-0" />;
  if (mimeType === "application/pdf") return <RiFilePdfLine className="size-4 text-chart-4 shrink-0" />;
  return <RiFileTextLine className="size-4 text-text-tertiary shrink-0" />;
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UserDisputeDetails({
  data: initialData,
  role,
  isDemoMode = false,
}: {
  data: any;
  role: "client" | "worker";
  isDemoMode?: boolean;
}) {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>("under_review");
  const activeData = isDemoMode
    ? MOCK_DISPUTE_SCENARIOS[selectedScenarioKey]?.data || initialData
    : initialData;

  const { dispute, events = [], evidence = [], responses = [] } = activeData || {};
  const isTerminal = ["resolved", "dismissed"].includes(String(dispute?.status || ""));

  const resolvedAt = dispute?.resolved_at ? new Date(dispute.resolved_at) : null;
  const isAppealWindowOpen =
    Boolean(resolvedAt) &&
    Date.now() - (resolvedAt?.getTime() || 0) <= GOVERNANCE_APPEAL_WINDOW_DAYS * 864e5;

  async function handleResponseAction(formData: FormData) {
    if (isDemoMode) {
      alert("Demo Mode: In live mode, your response would be logged to the governance ledger.");
      return;
    }
    const responseId = String(formData.get("responseId") || "");
    const responseText = String(formData.get("responseText") || "");
    const result = await submitDisputeResponse(responseId, responseText);
    if (!result.success) throw new Error(result.error);
  }

  async function handleUploadEvidenceAction(formData: FormData) {
    if (isDemoMode) {
      alert("Demo Mode: Evidence upload recorded successfully.");
      return { success: true };
    }
    const url = String(formData.get("evidenceUrl") || "").trim();
    const fileName = String(formData.get("fileName") || "Uploaded Evidence").trim();
    const mimeType = String(formData.get("mimeType") || "image/png").trim();
    const fileSize = Number(formData.get("fileSize") || 1);

    return await addDisputeEvidence(dispute.id, {
      url,
      fileName,
      mimeType,
      fileSize,
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* ── stageshow Skill: Interactive Scenario Switcher Bar (Demo Inspection) ── */}
      {isDemoMode && (
        <div className="rounded-3xl border border-accent-500/30 bg-accent-500/10 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-accent-500 animate-ping" />
              <span className="text-caption-1-semibold uppercase tracking-wider text-accent-700 dark:text-accent-300">
                stageshow Interactive Preview Mode
              </span>
            </div>
            <span className="text-caption-2 text-text-tertiary">
              Testing dispute stages without active DB locks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.values(MOCK_DISPUTE_SCENARIOS).map((scenario) => {
              const active = scenario.id === selectedScenarioKey;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setSelectedScenarioKey(scenario.id)}
                  className={cx(
                    "text-start rounded-2xl border px-3.5 py-2.5 transition-all text-caption-1-semibold",
                    active
                      ? "border-accent-500 bg-background-primary-default shadow-xs text-text-primary"
                      : "border-border-button-default bg-background-secondary-default text-text-tertiary hover:text-text-primary"
                  )}
                >
                  <p className="font-bold">{scenario.label}</p>
                  <p className="text-[11px] font-normal text-text-tertiary line-clamp-1 mt-0.5">
                    {scenario.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Top Header Navigation ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${role}/disputes`}
          className="inline-flex items-center gap-1.5 text-caption-1-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <RiArrowLeftLine className="size-4" />
          <span>Back to disputes</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="rounded-md border border-border-button-default bg-background-secondary-default px-2 py-0.5 font-mono text-[11px] font-semibold text-text-tertiary">
            #{String(dispute?.id || "DEMO").slice(0, 12)}
          </span>
          <span
            className={cx(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-caption-1-semibold uppercase tracking-wider",
              dispute?.status === "resolved"
                ? "border border-accent-500/30 bg-accent-500/10 text-accent-700 dark:text-accent-300"
                : dispute?.status === "dismissed"
                ? "border border-border-button-default bg-background-secondary-default text-text-tertiary"
                : "border border-chart-4/30 bg-chart-4/10 text-chart-4"
            )}
          >
            {dispute?.status === "resolved" ? (
              <RiCheckDoubleLine className="size-3.5" />
            ) : (
              <RiTimeLine className="size-3.5" />
            )}
            <span>{String(dispute?.status || "pending").replaceAll("_", " ")}</span>
          </span>
        </div>
      </div>

      {/* ── Title Card ── */}
      <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 space-y-3 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-accent-500/10 text-accent-600 flex items-center justify-center shrink-0">
            <DisputeJusticeSeal className="size-7" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-background-secondary-default text-text-secondary border border-border-button-default">
                {String(dispute?.category || "general").replaceAll("_", " ")}
              </span>
              <span className="text-caption-2 text-text-tertiary">
                Opened {formatDate(dispute?.created_at)}
              </span>
            </div>
            <h1 className="text-title-1-medium text-text-primary tracking-tight">
              {dispute?.title || dispute?.job_title || "Dispute Case Investigation"}
            </h1>
            <p className="text-body-medium text-text-secondary">
              Relates to Job: <span className="font-semibold text-text-primary">{dispute?.job_title}</span>
            </p>
          </div>
        </div>

        {/* Milestone Protection Alert Strip */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-chart-4/30 bg-chart-4/10 p-3 text-caption-1-semibold text-text-primary">
          <RiShieldFlashLine className="size-4 text-chart-4 shrink-0" />
          <span>
            DireSkill Milestone Protection: Funds remain safely frozen in milestone lock until final resolution.
          </span>
        </div>

        {dispute?.contract_id && (
          <div className="pt-1">
            <ParticipantEvidenceExportButton contractId={dispute.contract_id} />
          </div>
        )}
      </div>

      {/* ── Case Narrative & Requested Settlement ── */}
      <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 space-y-5 shadow-xs">
        <div className="space-y-2">
          <h2 className="text-caption-1-semibold uppercase tracking-wider text-text-tertiary">
            Filed Claim & Factual Narrative
          </h2>
          <div className="rounded-2xl border border-border-button-default bg-background-secondary-default p-4 text-body-medium text-text-primary leading-relaxed whitespace-pre-line">
            {dispute?.description}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-separator-border">
          <span className="text-body-medium text-text-secondary">Requested Resolution:</span>
          <span className="rounded-xl border border-border-button-default bg-background-secondary-default px-3 py-1 text-caption-1-semibold font-bold uppercase tracking-wider text-text-primary">
            {String(dispute?.requested_resolution || "Not specified").replaceAll("_", " ")}
          </span>
        </div>

        {/* Final Decision Ruling Banner (if resolved) */}
        {dispute?.final_decision && (
          <div className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-xl bg-accent-500/20 text-accent-700 dark:text-accent-300 flex items-center justify-center shrink-0">
                <RiAuctionLine className="size-5" />
              </div>
              <div className="space-y-1 flex-1">
                <p className="text-caption-1-semibold uppercase tracking-wider text-accent-800 dark:text-accent-300 font-bold">
                  Official Ruling: {String(dispute.final_decision).replaceAll("_", " ")}
                </p>
                <p className="text-body-medium text-text-primary leading-relaxed">
                  {dispute.final_reason}
                </p>
              </div>
            </div>

            {/* Status Breakdown Chips */}
            <div className="grid grid-cols-1 gap-2 pt-3 sm:grid-cols-3 text-caption-2 border-t border-accent-500/20">
              <div className="rounded-xl bg-background-primary-default p-2.5 border border-border-button-default">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Job Status</span>
                <span className="font-semibold text-text-primary capitalize">{dispute.current_job_status || "Completed"}</span>
              </div>
              <div className="rounded-xl bg-background-primary-default p-2.5 border border-border-button-default">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Contract</span>
                <span className="font-semibold text-text-primary capitalize">{dispute.current_contract_status || "Completed"}</span>
              </div>
              <div className="rounded-xl bg-background-primary-default p-2.5 border border-border-button-default">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Payment</span>
                <span className="font-semibold text-text-primary capitalize">{dispute.current_payment_status || "Settled"}</span>
              </div>
            </div>

            {/* Appeal Callout */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-accent-500/20">
              <p className="text-caption-2 text-text-secondary">
                {isAppealWindowOpen
                  ? "If you contest this ruling, you can file a formal governance appeal within 7 days."
                  : "The 7-day governance appeal window for this decision has closed."}
              </p>

              {isAppealWindowOpen && (
                <Link
                  href={`/${role}/appeals/new?targetId=${dispute.id}&appealType=dispute_resolution`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent-600 px-4 py-2 text-caption-1-semibold font-bold uppercase tracking-wider text-white shadow-xs hover:bg-accent-700 transition"
                >
                  <RiScales3Line className="size-4" />
                  <span>Request Appeal</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Evidence Files ── */}
      <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiFolderShield2Line className="size-5 text-text-secondary" />
            <h2 className="text-title-3-semibold text-text-primary">
              Submitted Evidence Vault ({evidence.length})
            </h2>
          </div>
          <span className="text-caption-2 text-text-tertiary">
            Tamper-proof file hashing
          </span>
        </div>

        {evidence.length === 0 ? (
          <p className="text-caption-1-semibold text-text-tertiary italic py-3 text-center">
            No evidence files attached to this case.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {evidence.map((item: any) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-between gap-3 rounded-2xl border border-border-button-default bg-background-secondary-default p-3.5 hover:border-accent-500/50 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-xl bg-background-primary-default border border-border-button-default flex items-center justify-center shrink-0">
                    {getEvidenceIcon(item.mime_type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-caption-1-semibold text-text-primary truncate group-hover:text-accent-600 transition-colors">
                      {item.file_name || "Evidence Record"}
                    </p>
                    <p className="text-[11px] text-text-tertiary">
                      {formatBytes(item.file_size)} · {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
                <RiExternalLinkLine className="size-4 text-text-tertiary group-hover:text-accent-600 shrink-0" />
              </a>
            ))}
          </div>
        )}

        {!isTerminal && (
          <div className="pt-2 border-t border-separator-border">
            <DisputeEvidenceUploadForm disputeId={dispute.id} action={handleUploadEvidenceAction} />
          </div>
        )}
      </div>

      {/* ── Official Admin Responses ── */}
      <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 space-y-4 shadow-xs">
        <h2 className="text-title-3-semibold text-text-primary">
          Formal Information Inquiries ({responses.length})
        </h2>

        {responses.length === 0 ? (
          <p className="text-caption-1-semibold text-text-tertiary italic py-3 text-center">
            No pending response requests recorded by governance administrators.
          </p>
        ) : (
          <div className="space-y-3">
            {responses.map((resp: any) => {
              const canRespond =
                !isTerminal && resp.status === "requested" && (resp.requested_from === role || isDemoMode);
              return (
                <div
                  key={resp.id}
                  className="rounded-2xl border border-border-button-default bg-background-secondary-default p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-caption-1-semibold font-bold uppercase tracking-wider text-text-primary">
                      {resp.requested_from} Technical Response
                    </span>
                    <span className="rounded-full border border-border-button-default bg-background-primary-default px-2.5 py-0.5 text-[10px] font-bold uppercase text-text-secondary">
                      {resp.status}
                    </span>
                  </div>

                  <p className="text-body-medium text-text-secondary">{resp.instruction}</p>
                  <p className="text-[11px] text-text-tertiary">Due: {formatDate(resp.due_at)}</p>

                  {resp.response_text && (
                    <div className="rounded-xl bg-background-primary-default p-3.5 border border-border-button-default">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1">
                        Submitted Technical Statement
                      </span>
                      <p className="text-body-medium text-text-primary">{resp.response_text}</p>
                    </div>
                  )}

                  {canRespond && (
                    <div className="pt-2 border-t border-separator-border">
                      <DisputeResponseForm responseId={resp.id} action={handleResponseAction} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Activity History Timeline ── */}
      <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 space-y-4 shadow-xs">
        <h2 className="text-title-3-semibold text-text-primary">
          Procedural Timeline ({events.length})
        </h2>

        <div className="relative border-s border-separator-border ms-3 ps-4 space-y-5 my-2">
          {events.map((ev: any, idx: number) => (
            <div key={`${ev.event_type}-${ev.created_at}-${idx}`} className="relative">
              <div className="absolute -start-[23px] top-1 size-3 rounded-full bg-accent-500 ring-4 ring-background-primary-default" />
              <p className="text-caption-1-semibold font-bold text-text-primary capitalize">
                {String(ev.event_type).replaceAll("_", " ")}
              </p>
              {ev.note && <p className="text-caption-2 text-text-secondary mt-0.5">{ev.note}</p>}
              <p className="text-[11px] text-text-tertiary mt-0.5">
                {formatDate(ev.created_at)} · {ev.actor_type || "system"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
