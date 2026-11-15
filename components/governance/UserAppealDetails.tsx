"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RiScales3Line,
  RiArrowLeftLine,
  RiShieldCheckFill,
  RiTimeLine,
  RiCheckDoubleLine,
  RiFileList3Line,
  RiExternalLinkLine,
  RiAwardLine,
  RiInformationLine,
} from "@remixicon/react";
import AppealEvidenceList from "@/components/governance/AppealEvidenceList";
import { DEMO_APPEAL_DATA } from "@/lib/mock-appeal";
import { cx } from "@/utils/cx";

/* ── draw-svg Skill: Super Admin High-Court Governance Seal ───────────────── */
function SuperAdminCourtSeal({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <rect width="36" height="36" rx="12" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M18 6L7 12V18C7 24.5 11.7 30.6 18 32C24.3 30.6 29 24.5 29 18V12L18 6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M18 12V22M13 15H23M13 15L10 20H16L13 15ZM23 15L20 20H26L23 15Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Awaiting Review";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function UserAppealDetails({
  data,
  role,
  isDemoMode = false,
}: {
  data: any;
  role: "client" | "worker";
  isDemoMode?: boolean;
}) {
  const { appeal, events = [] } = data || DEMO_APPEAL_DATA;
  const isResolved = ["appeal_resolved", "appeal_dismissed", "appeal_granted"].includes(appeal?.status);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {isDemoMode && (
        <div className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-3.5 flex items-center justify-between gap-3 text-caption-1-semibold text-text-primary">
          <div className="flex items-center gap-2">
            <RiInformationLine className="size-4 text-accent-600 shrink-0" />
            <span>
              Preview Mode: Demonstrating independent Super Admin appeal review interface.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-600 text-white shrink-0">
            Preview Active
          </span>
        </div>
      )}

      {/* ── Breadcrumb Navigation ── */}
      <Link
        href={`/${role}/appeals`}
        className="inline-flex items-center gap-1.5 text-caption-1-semibold text-text-secondary hover:text-text-primary transition-colors"
      >
        <RiArrowLeftLine className="size-4" />
        <span>Back to appeals</span>
      </Link>

      {/* ── Main Docket Header ── */}
      <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 sm:p-7 shadow-xs space-y-3">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-accent-500/10 text-accent-600 flex items-center justify-center shrink-0">
            <SuperAdminCourtSeal className="size-7" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-border-button-default bg-background-secondary-default px-2.5 py-0.5 font-mono text-[11px] font-semibold text-text-secondary">
                {appeal?.reference || "DS-APL-DEMO"}
              </span>
              <span
                className={cx(
                  "inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-caption-1-semibold uppercase tracking-wider",
                  isResolved
                    ? "border border-accent-500/30 bg-accent-500/10 text-accent-700 dark:text-accent-300"
                    : "border border-chart-4/30 bg-chart-4/10 text-chart-4"
                )}
              >
                {isResolved ? <RiCheckDoubleLine className="size-3.5" /> : <RiTimeLine className="size-3.5" />}
                <span>{String(appeal?.status || "under_review").replaceAll("_", " ")}</span>
              </span>
            </div>

            <h1 className="text-title-1-medium text-text-primary tracking-tight">
              Governance Appeal Docket
            </h1>
            <p className="text-body-medium text-text-secondary">
              Filed on {new Date(appeal.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} · Category:{" "}
              <strong className="text-text-primary">{String(appeal.appeal_type).replaceAll("_", " ")}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* ── Appeal Case Specifications ── */}
      <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 sm:p-7 shadow-xs space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-2xl border border-border-button-default bg-background-secondary-default p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Appeal Status</span>
            <p className="text-caption-1-semibold font-bold text-text-primary capitalize">
              {String(appeal.status).replaceAll("_", " ")}
            </p>
          </div>

          <div className="rounded-2xl border border-border-button-default bg-background-secondary-default p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Target Decision ID</span>
            <p className="text-caption-1-semibold font-mono text-text-primary truncate">
              {String(appeal.target_id).slice(0, 16)}...
            </p>
          </div>

          <div className="rounded-2xl border border-border-button-default bg-background-secondary-default p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Primary Grounds</span>
            <p className="text-caption-1-semibold font-bold text-text-primary capitalize">
              {String(appeal.reason).replaceAll("_", " ")}
            </p>
          </div>

          <div className="rounded-2xl border border-border-button-default bg-background-secondary-default p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Governance Ruling</span>
            <p className="text-caption-1-semibold font-bold text-accent-600 capitalize">
              {appeal.outcome ? String(appeal.outcome).replaceAll("_", " ") : "Pending Determination"}
            </p>
          </div>

          <div className="rounded-2xl border border-border-button-default bg-background-secondary-default p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Resolution Date</span>
            <p className="text-caption-1-semibold text-text-primary">{formatDate(appeal.resolved_at)}</p>
          </div>

          <div className="rounded-2xl border border-border-button-default bg-background-secondary-default p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Case Level</span>
            <p className="text-caption-1-semibold text-text-primary">Super Admin Appellate Panel</p>
          </div>
        </div>

        {/* Grounds Narrative */}
        <div className="space-y-2 border-t border-separator-border pt-4">
          <h2 className="text-caption-1-semibold uppercase tracking-wider text-text-tertiary">
            Submitted Grounds & Justification Statement
          </h2>
          <div className="whitespace-pre-wrap rounded-2xl border border-border-button-default bg-background-secondary-default p-4 text-body-medium text-text-primary leading-relaxed font-normal">
            {appeal.explanation}
          </div>
        </div>

        {/* Super Admin Official Ruling (if available) */}
        {appeal.outcome_reason && (
          <div className="space-y-2 border-t border-separator-border pt-4">
            <h2 className="text-caption-1-semibold uppercase tracking-wider text-accent-700 dark:text-accent-300">
              Super Admin Appellate Panel Determination
            </h2>
            <div className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-5 space-y-2">
              <div className="flex items-center gap-2">
                <RiAwardLine className="size-5 text-accent-600" />
                <p className="text-caption-1-semibold font-bold uppercase tracking-wider text-accent-800 dark:text-accent-300">
                  Outcome: {String(appeal.outcome).replaceAll("_", " ")}
                </p>
              </div>
              <p className="text-body-medium text-text-primary leading-relaxed whitespace-pre-wrap">
                {appeal.outcome_reason}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Attached Evidence Files ── */}
      <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 sm:p-7 shadow-xs">
        <AppealEvidenceList
          appealId={appeal.id}
          evidenceReferences={appeal.evidence_references}
          title="Attached Documentary Evidence"
        />
      </div>

      {/* ── Procedural Audit Trail ── */}
      <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 sm:p-7 shadow-xs space-y-4">
        <h2 className="text-title-3-semibold text-text-primary">
          Procedural Audit Timeline ({events.length})
        </h2>
        <div className="relative border-s border-separator-border ms-3 ps-4 space-y-5 my-2">
          {events.map((ev: any, idx: number) => (
            <div key={`${ev.event_type}-${ev.created_at}-${idx}`} className="relative">
              <div className="absolute -start-[23px] top-1 size-3 rounded-full bg-accent-500 ring-4 ring-background-primary-default" />
              <p className="text-caption-1-semibold font-bold text-text-primary capitalize">
                {String(ev.event_type).replaceAll("_", " ")}
              </p>
              <p className="text-[11px] text-text-tertiary mt-0.5">
                {formatDate(ev.created_at)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
