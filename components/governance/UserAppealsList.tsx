"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RiScales3Line,
  RiArrowRightLine,
  RiTimeLine,
  RiCheckDoubleLine,
  RiAlertLine,
  RiAddLine,
  RiEyeLine,
} from "@remixicon/react";
import { useLanguage } from "@/context/LanguageContext";
import { cx } from "@/utils/cx";

interface AppealItem {
  id: string;
  reference: string;
  appeal_type: string;
  target_type: string;
  target_id: string;
  status: string;
  reason: string;
  outcome?: string | null;
  created_at: string | Date;
  updated_at?: string | Date;
}

const SAMPLE_APPEALS: AppealItem[] = [
  {
    id: "demo",
    reference: "DS-APL-2026-0814",
    appeal_type: "dispute_resolution",
    target_type: "dispute",
    target_id: "disp-bo-9082",
    status: "appeal_under_review",
    reason: "new_evidence",
    created_at: "2026-11-13T12:00:00Z",
  },
  {
    id: "demo-resolved",
    reference: "DS-APL-2026-0792",
    appeal_type: "worker_verification",
    target_type: "verification",
    target_id: "ver-fayda-501",
    status: "appeal_resolved",
    outcome: "overturned",
    reason: "procedural_error",
    created_at: "2026-11-04T09:15:00Z",
  },
];

export default function UserAppealsList({
  appeals,
  role,
}: {
  appeals: AppealItem[];
  role: "client" | "worker";
}) {
  const { t } = useLanguage();
  const [showDemo, setShowDemo] = useState(appeals.length === 0);

  const displayList = appeals.length > 0 ? appeals : showDemo ? SAMPLE_APPEALS : [];

  return (
    <div className="space-y-4">
      {appeals.length === 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-accent-500/30 bg-accent-500/10 p-3.5 text-caption-1-semibold text-text-primary">
          <div className="flex items-center gap-2">
            <RiScales3Line className="size-4 text-accent-600 shrink-0" />
            <span>Zero pending appeals on your record.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDemo((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-background-primary-default px-3 py-1.5 text-[11px] font-bold text-accent-600 border border-border-button-default hover:bg-background-secondary-default transition"
          >
            <RiEyeLine className="size-3.5" />
            <span>{showDemo ? "Hide Sample Appeals" : "Inspect Sample Appeals"}</span>
          </button>
        </div>
      )}

      {displayList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border-button-default bg-background-primary-default p-12 text-center space-y-4 shadow-xs">
          <div className="mx-auto size-12 rounded-2xl bg-background-secondary-default flex items-center justify-center text-accent-600">
            <RiScales3Line className="size-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-title-3-semibold text-text-primary">{t("appeals.noAppealsTitle") || "No Appeals Filed"}</h3>
            <p className="text-caption-2 text-text-secondary leading-relaxed">
              {t("appeals.noAppealsDesc") || "If you contest a dispute ruling, you can request an independent Super Admin governance review."}
            </p>
          </div>
          <div>
            <Link
              href={`/${role}/appeals/new`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent-600 px-4 py-2.5 text-caption-1-semibold font-bold uppercase tracking-wider text-white shadow-xs hover:bg-accent-700 transition"
            >
              <RiAddLine className="size-4" />
              <span>Request Appeal</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map((appeal) => {
            const isResolved = ["appeal_resolved", "appeal_dismissed", "appeal_granted"].includes(appeal.status);
            const targetHref = appeal.id.startsWith("demo")
              ? `/${role}/appeals/demo`
              : `/${role}/appeals/${appeal.id}`;

            return (
              <Link
                key={appeal.id}
                href={targetHref}
                className="group block rounded-3xl border border-border-button-default bg-background-primary-default p-5 sm:p-6 transition-all hover:border-accent-500/50 hover:shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-accent-600 px-2 py-0.5 rounded-md bg-background-secondary-default border border-border-button-default">
                        {appeal.reference}
                      </span>
                      <span className="text-[11px] text-text-tertiary">
                        {String(appeal.appeal_type).replaceAll("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-title-3-semibold text-text-primary group-hover:text-accent-600 transition-colors">
                      Grounds: {String(appeal.reason).replaceAll("_", " ")}
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
                    {isResolved ? <RiCheckDoubleLine className="size-3.5" /> : <RiTimeLine className="size-3.5" />}
                    <span>{appeal.outcome ? String(appeal.outcome).replaceAll("_", " ") : String(appeal.status).replaceAll("_", " ")}</span>
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-separator-border pt-3 text-caption-2 text-text-secondary">
                  <span>
                    Filed on {new Date(appeal.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </span>

                  <span className="inline-flex items-center gap-1 font-bold text-accent-600 group-hover:translate-x-0.5 transition-transform">
                    <span>View Docket</span>
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
