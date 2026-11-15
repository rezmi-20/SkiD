"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RiScales3Line,
  RiArrowRightLine,
  RiTimeLine,
  RiCheckDoubleLine,
  RiAlertLine,
  RiShieldFlashLine,
  RiEyeLine,
} from "@remixicon/react";
import { cx } from "@/utils/cx";

const SAMPLE_DISPUTES = [
  {
    id: "demo",
    title: "Incomplete Signal Calibration and Missing LNB Bracket",
    job_title: "Commercial Satellite Dish & LNB Alignment",
    category: "incomplete_work",
    status: "under_investigation",
    required_action: "worker_response_required",
    created_at: "2026-11-13T10:00:00Z",
  },
  {
    id: "demo-resolved",
    title: "Unapproved Material Substitutions for Copper Piping",
    job_title: "Piassa Villa Plumbing Installation & Pressure Test",
    category: "quality_of_work",
    status: "resolved",
    required_action: "none",
    created_at: "2026-11-08T14:30:00Z",
  },
];

export default function UserDisputesList({
  disputes,
  role,
}: {
  disputes: any[];
  role: "client" | "worker";
}) {
  const [showDemoCases, setShowDemoCases] = useState(disputes.length === 0);

  const displayList = disputes.length > 0 ? disputes : showDemoCases ? SAMPLE_DISPUTES : [];

  return (
    <div className="space-y-4">
      {disputes.length === 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-accent-500/30 bg-accent-500/10 p-3.5 text-caption-1-semibold text-text-primary">
          <div className="flex items-center gap-2">
            <RiShieldFlashLine className="size-4 text-accent-600" />
            <span>Zero open dispute disputes on your account.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDemoCases((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-background-primary-default px-3 py-1.5 text-[11px] font-bold text-accent-600 border border-border-button-default hover:bg-background-secondary-default transition"
          >
            <RiEyeLine className="size-3.5" />
            <span>{showDemoCases ? "Hide Demo Cases" : "Inspect Sample Cases"}</span>
          </button>
        </div>
      )}

      {displayList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border-button-default bg-background-primary-default p-12 text-center space-y-3">
          <div className="size-12 rounded-2xl bg-background-secondary-default text-text-tertiary flex items-center justify-center mx-auto">
            <RiScales3Line className="size-6" />
          </div>
          <div>
            <p className="text-body-medium font-bold text-text-primary">No Disputes Recorded</p>
            <p className="text-caption-2 text-text-secondary mt-1 max-w-sm mx-auto">
              All your jobs and contracts are running smoothly under DireSkill Milestone Protection.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((dispute) => {
            const isResolved = dispute.status === "resolved";
            const targetHref = dispute.id.startsWith("demo")
              ? `/${role}/disputes/demo`
              : `/${role}/disputes/${dispute.id}`;

            return (
              <Link
                key={dispute.id}
                href={targetHref}
                className="group block rounded-3xl border border-border-button-default bg-background-primary-default p-5 sm:p-6 transition-all hover:border-accent-500/50 hover:shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-background-secondary-default text-text-secondary border border-border-button-default">
                        {String(dispute.category || "General").replaceAll("_", " ")}
                      </span>
                      <span className="text-[11px] text-text-tertiary">
                        {dispute.job_title}
                      </span>
                    </div>

                    <h3 className="text-title-3-semibold text-text-primary group-hover:text-accent-600 transition-colors">
                      {dispute.title || dispute.job_title}
                    </h3>
                  </div>

                  <span
                    className={cx(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shrink-0",
                      isResolved
                        ? "border border-accent-500/30 bg-accent-500/10 text-accent-700 dark:text-accent-300"
                        : "border border-chart-4/30 bg-chart-4/10 text-chart-4"
                    )}
                  >
                    {isResolved ? (
                      <RiCheckDoubleLine className="size-3.5" />
                    ) : (
                      <RiTimeLine className="size-3.5" />
                    )}
                    <span>{String(dispute.status).replaceAll("_", " ")}</span>
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-separator-border pt-3 text-caption-2 text-text-secondary">
                  <span>
                    Required action:{" "}
                    <strong className="text-text-primary font-semibold">
                      {String(dispute.required_action || "none").replaceAll("_", " ")}
                    </strong>
                  </span>

                  <span className="inline-flex items-center gap-1 font-bold text-accent-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect Details</span>
                    <RiArrowRightLine className="size-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
