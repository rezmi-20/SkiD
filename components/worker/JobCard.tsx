"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/shell/StatusBadge";

export interface WorkerJobCardData {
  id: string;
  title: string;
  description: string | null;
  budget: number | string | null;
  status: string;
  created_at: string | Date;
  client_name: string | null;
  client_avatar: string | null;
  client_location?: string | null;
  contract_id?: string | null;
}

interface JobCardProps {
  job: WorkerJobCardData;
  actions?: React.ReactNode;
  showActions?: boolean;
  onAccept?: (jobId: string) => Promise<void>;
  onReject?: (jobId: string) => Promise<void>;
}

function timeAgo(dateValue: string | Date) {
  const diff = Date.now() - new Date(dateValue).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateValue).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatBudget(value: number | string | null) {
  if (value === null || value === undefined) return "N/A";
  const amount = Number(value);
  if (Number.isNaN(amount)) return "N/A";
  return `${amount.toLocaleString()} ETB`;
}

export default function JobCard({
  job,
  actions,
  showActions = true,
  onAccept,
  onReject,
}: JobCardProps) {
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  const handleAccept = async () => {
    if (!onAccept) return;
    setLoading("accept");
    try {
      await onAccept(job.id);
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setLoading("reject");
    try {
      await onReject(job.id);
    } finally {
      setLoading(null);
    }
  };

  const initials = job.client_name
    ? job.client_name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CL";

  return (
    <article className="border border-outline-variant bg-surface-container-lowest rounded-lg p-5 shadow-sm transition-colors hover:border-primary/40">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container flex items-center justify-center">
              {job.client_avatar ? (
                <img src={job.client_avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-black text-on-surface-variant">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-on-surface">{job.title}</h3>
              <p className="text-xs font-medium text-on-surface-variant">
                Client: {job.client_name || "Unknown client"}
              </p>
            </div>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="grid gap-3 text-sm text-on-surface-variant sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Location</p>
            <p className="mt-1 font-bold text-on-surface">{job.client_location || "Dire Dawa"}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Budget</p>
            <p className="mt-1 font-bold text-on-surface">{formatBudget(job.budget)}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Requested</p>
            <p className="mt-1 font-bold text-on-surface">{timeAgo(job.created_at)}</p>
          </div>
        </div>

        {job.description && (
          <p className="line-clamp-3 text-sm leading-6 text-on-surface-variant">{job.description}</p>
        )}

        {showActions && (
          <div className="flex flex-col gap-2 border-t border-outline-variant pt-4 sm:flex-row">
            {actions ?? (
              <>
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={!onAccept || loading !== null}
                  title={!onAccept ? "Accept invitation is unavailable" : "Accept hiring invitation"}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading === "accept" ? (
                    <span className="h-4 w-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  )}
                  Accept Invitation
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={!onReject || loading !== null}
                  title={!onReject ? "Decline invitation is unavailable" : "Decline hiring invitation"}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-4 text-xs font-black uppercase tracking-widest text-on-surface-variant disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading === "reject" ? (
                    <span className="h-4 w-4 rounded-full border-2 border-on-surface-variant border-t-transparent animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                  )}
                  Decline
                </button>
                <Link
                  href="/worker/jobs"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-4 text-xs font-black uppercase tracking-widest text-on-surface hover:border-primary/40"
                >
                  Details
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
