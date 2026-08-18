"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Scale, UserRound } from "lucide-react";

interface DisputeRow {
  id: string;
  job_id: string;
  title: string | null;
  category: string | null;
  requested_resolution: string | null;
  status: string;
  payment_status: string | null;
  client_name: string | null;
  worker_name: string | null;
  assigned_admin_name: string | null;
  created_at: string;
}

const QUEUES = [
  ["open", "Open"],
  ["under_review", "Under Review"],
  ["awaiting_client_response", "Awaiting Client"],
  ["awaiting_worker_response", "Awaiting Worker"],
  ["evidence_review", "Evidence Review"],
  ["resolved", "Resolved"],
  ["escalated", "Escalated"],
  ["all", "All"],
] as const;

function statusClass(status: string) {
  if (status === "resolved") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (status === "dismissed") return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
  if (status === "escalated") return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
}

function formatAge(value: string) {
  const hours = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 3_600_000));
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function AdminDisputesContent({ initialDisputes }: { initialDisputes: DisputeRow[] }) {
  const [queue, setQueue] = useState<(typeof QUEUES)[number][0]>("open");
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const rows = useMemo(
    () =>
      initialDisputes.filter((row) => {
        const matchesQueue = queue === "all" || row.status === queue;
        const haystack = [row.id, row.title, row.category, row.status, row.client_name, row.worker_name, row.payment_status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return matchesQueue && (!query || haystack.includes(query));
      }),
    [initialDisputes, query, queue],
  );

  return (
    <div className="space-y-5 pb-10">
      <header className="rounded-2xl border border-outline-variant bg-surface-container-low px-6 py-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Dispute and Payment Admin</p>
        <h1 className="mt-1 text-2xl font-extrabold text-on-surface">Dispute Cases</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Review participant disputes, assignments, evidence, responses, and decisions.</p>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex flex-wrap gap-2">
          {QUEUES.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setQueue(value)}
              className={`rounded-lg border px-3 py-2 text-[11px] font-black uppercase tracking-wider ${
                queue === value ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-surface-container text-on-surface"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dispute, participant, category, status"
            className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container pl-10 pr-3 text-sm"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest">
        {rows.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant">
            <Scale className="mx-auto h-10 w-10 opacity-50" />
            <p className="mt-3 text-sm font-black uppercase tracking-wider">No disputes in this queue</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Case</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Parties</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">Assigned</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-container/40">
                  <td className="px-4 py-3">
                    <p className="font-black text-on-surface">{row.title || "Untitled dispute"}</p>
                    <p className="mt-1 font-mono text-[10px] text-on-surface-variant">#{row.id.slice(0, 8)} · {formatAge(String(row.created_at))}</p>
                    <p className="mt-1 text-[11px] font-bold text-on-surface-variant">{row.category || "other"} · {row.payment_status || "no payment"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1 text-xs font-bold"><UserRound className="h-3.5 w-3.5" /> {row.client_name || "Client"}</p>
                    <p className="mt-1 text-xs font-bold text-on-surface-variant">{row.worker_name || "Worker"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${statusClass(row.status)}`}>
                      {row.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-on-surface-variant">
                    {row.assigned_admin_name || "Unassigned"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/disputes/${row.id}`}
                      className="inline-flex rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-[11px] font-black uppercase tracking-wider text-on-surface hover:border-primary hover:text-primary"
                    >
                      Open Case
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
