"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, ExternalLink, Search, ShieldCheck, UserRound } from "lucide-react";

type WorkerRow = {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  isVerified: boolean;
  isSuspended: boolean;
  hasDocument: boolean;
  createdAt: string;
};

type ClientRow = {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  isVerified: boolean;
  isSuspended: boolean;
  maskedFin: string | null;
  hasDocument: boolean;
  createdAt: string;
};

type Props = {
  workers: WorkerRow[];
  clients: ClientRow[];
};

function statusClass(status: string) {
  if (status === "approved") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (status === "rejected" || status === "revoked" || status === "suspended") {
    return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  }
  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusClass(status)}`}>
      <ShieldCheck className="h-3 w-3" />
      {status.replace("_", " ")}
    </span>
  );
}

export function VerificationReviewTabs({ workers, clients }: Props) {
  const [tab, setTab] = useState<"workers" | "clients">("workers");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredWorkers = useMemo(
    () =>
      workers.filter((worker) =>
        [worker.fullName, worker.email, worker.phone, worker.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
      ),
    [workers, normalizedQuery],
  );

  const filteredClients = useMemo(
    () =>
      clients.filter((client) =>
        [client.fullName, client.email, client.phone, client.status, client.maskedFin]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
      ),
    [clients, normalizedQuery],
  );

  return (
    <div className="space-y-5 pb-10">
      <div className="rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Verification Panel</p>
        <h1 className="mt-1 text-2xl font-bold text-on-surface">Fayda Review Queue</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Review worker and client identity status from one place.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex rounded-lg border border-outline-variant bg-surface-container p-1">
          <button
            type="button"
            onClick={() => setTab("workers")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black uppercase tracking-wider ${
              tab === "workers" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Workers
            <span className="rounded-full bg-black/10 px-2 py-0.5 font-mono">{workers.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("clients")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black uppercase tracking-wider ${
              tab === "clients" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <UserRound className="h-4 w-4" />
            Clients
            <span className="rounded-full bg-black/10 px-2 py-0.5 font-mono">{clients.length}</span>
          </button>
        </div>

        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, phone, or status"
            className="w-full rounded-lg border border-outline-variant bg-surface-container py-2 pl-9 pr-3 text-sm text-on-surface outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        {tab === "workers" ? (
          <table className="w-full text-sm">
            <thead className="border-b border-outline-variant bg-surface-container/50 text-left">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Worker</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Document</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredWorkers.map((worker) => (
                <tr key={worker.userId} className="hover:bg-surface-container">
                  <td className="px-4 py-3">
                    <p className="font-bold text-on-surface">{worker.fullName}</p>
                    <p className="text-xs text-on-surface-variant">{worker.email}</p>
                    {worker.phone && <p className="text-[10px] text-on-surface-variant/70">{worker.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={worker.isSuspended ? "suspended" : worker.status} />
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-on-surface-variant">
                    {worker.hasDocument ? "Submitted" : "Missing"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/verify/${worker.userId}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-[11px] font-black uppercase tracking-wider text-on-surface hover:bg-surface-container-high"
                    >
                      Review <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredWorkers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm font-bold text-on-surface-variant">
                    No workers match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-outline-variant bg-surface-container/50 text-left">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Client</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">FIN / Document</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredClients.map((client) => (
                <tr key={client.userId} className="hover:bg-surface-container">
                  <td className="px-4 py-3">
                    <p className="font-bold text-on-surface">{client.fullName}</p>
                    <p className="text-xs text-on-surface-variant">{client.email}</p>
                    {client.phone && <p className="text-[10px] text-on-surface-variant/70">{client.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={client.isSuspended ? "suspended" : client.status} />
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-on-surface-variant">
                    <p>{client.maskedFin || "FIN not recorded"}</p>
                    <p className="text-[10px]">{client.hasDocument ? "Document submitted" : "Document missing"}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/clients/${client.userId}/verify`}
                      className="inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-[11px] font-black uppercase tracking-wider text-on-surface hover:bg-surface-container-high"
                    >
                      Review <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm font-bold text-on-surface-variant">
                    No clients match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
