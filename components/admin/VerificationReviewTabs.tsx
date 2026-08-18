"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, ExternalLink, Search, ShieldCheck, UserRound } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type WorkerRow = {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  isVerified: boolean;
  isSuspended: boolean;
  maskedFin: string | null;
  hasDocument: boolean;
  attemptNumber: number | null;
  createdAt: string;
  decidedAt: string | null;
  reviewerName: string | null;
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
  attemptNumber: number | null;
  createdAt: string;
  decidedAt: string | null;
  reviewerName: string | null;
};

type Props = {
  workers: WorkerRow[];
  clients: ClientRow[];
  canOpenDetails: boolean;
  canReview: boolean;
};

function statusClass(status: string) {
  if (status === "approved") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (status === "rejected" || status === "revoked" || status === "suspended") {
    return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  }
  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusClass(status)}`}>
      <ShieldCheck className="h-3 w-3" />
      {label}
    </span>
  );
}

export function VerificationReviewTabs({ workers, clients, canOpenDetails, canReview }: Props) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"workers" | "clients">("workers");
  const [queue, setQueue] = useState<"pending" | "approved" | "rejected" | "revoked" | "suspended" | "resubmitted" | "all">("pending");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [resubmittedOnly, setResubmittedOnly] = useState(false);
  const [reviewerFilter, setReviewerFilter] = useState("");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedReviewer = reviewerFilter.trim().toLowerCase();

  const ageLabel = (createdAt: string) => {
    const ms = Date.now() - new Date(createdAt).getTime();
    const days = Math.max(0, Math.floor(ms / 86_400_000));
    if (days <= 0) return t("common.today");
    if (days === 1) return `1 ${t("common.day")}`;
    return `${days} ${t("common.days")}`;
  };

  const statusLabel = (status: string) =>
    status === "not_started" ? t("admin.clients.notVerified" as any) : t(`verification.status.${status}` as any);

  const matchesQueue = (status: string) => {
    if (queue === "all") return true;
    if (queue === "pending") return status === "pending";
    if (queue === "approved") return status === "approved";
    if (queue === "rejected") return status === "rejected";
    if (queue === "revoked") return status === "revoked";
    if (queue === "suspended") return status === "suspended";
    if (queue === "resubmitted") return true;
    return false;
  };

  const matchesFilters = (row: { status: string; attemptNumber: number | null; createdAt: string; reviewerName: string | null }) => {
    if (statusFilter !== "all") {
      if (row.status !== statusFilter) return false;
    } else {
      if (!matchesQueue(row.status)) return false;
      if (queue === "resubmitted" && !(row.status === "resubmission_requested" || Number(row.attemptNumber || 1) > 1)) return false;
    }
    if (dateFrom && new Date(row.createdAt) < new Date(`${dateFrom}T00:00:00`)) return false;
    if (dateTo && new Date(row.createdAt) > new Date(`${dateTo}T23:59:59`)) return false;
    if (normalizedReviewer && !String(row.reviewerName || "").toLowerCase().includes(normalizedReviewer)) return false;
    return true;
  };

  const filteredWorkers = useMemo(
    () =>
      workers.filter((worker) =>
        matchesFilters(worker) &&
        (!resubmittedOnly || worker.status === "resubmission_requested" || Number(worker.attemptNumber || 1) > 1) &&
        [worker.fullName, worker.email, worker.phone, worker.status, worker.maskedFin, worker.reviewerName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
      ),
    [workers, normalizedQuery, queue, statusFilter, dateFrom, dateTo, resubmittedOnly, normalizedReviewer],
  );

  const filteredClients = useMemo(
    () =>
      clients.filter((client) =>
        matchesFilters(client) &&
        (!resubmittedOnly || client.status === "resubmission_requested" || Number(client.attemptNumber || 1) > 1) &&
        [client.fullName, client.email, client.phone, client.status, client.maskedFin, client.reviewerName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
      ),
    [clients, normalizedQuery, queue, statusFilter, dateFrom, dateTo, resubmittedOnly, normalizedReviewer],
  );

  return (
    <div className="space-y-5 pb-10">
      <div className="rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">{t("admin.verification.panel")}</p>
        <h1 className="mt-1 text-2xl font-bold text-on-surface">{t("admin.verification.queueTitle")}</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          {t("admin.verification.queueDesc")}
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex rounded-lg border border-outline-variant bg-surface-container p-1">
          <button
            type="button"
            onClick={() => setTab("workers")}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black uppercase tracking-wider ${
              tab === "workers" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            {t("admin.verification.tab.workers")}
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
            {t("admin.verification.tab.clients")}
            <span className="rounded-full bg-black/10 px-2 py-0.5 font-mono">{clients.length}</span>
          </button>
        </div>

        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("admin.verification.search")}
            className="w-full rounded-lg border border-outline-variant bg-surface-container py-2 pl-9 pr-3 text-sm text-on-surface outline-none focus:border-primary"
          />
        </div>
        </div>

        <div className="grid gap-3 md:grid-cols-6">
          <select
            value={queue}
            onChange={(event) => setQueue(event.target.value as typeof queue)}
            className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-xs font-bold text-on-surface"
          >
            <option value="pending">{t("admin.verification.queue.pending")}</option>
            <option value="approved">{t("admin.verification.queue.approved")}</option>
            <option value="rejected">{t("admin.verification.queue.rejected")}</option>
            <option value="revoked">{t("admin.verification.queue.revoked")}</option>
            <option value="suspended">{t("admin.verification.queue.suspended")}</option>
            <option value="resubmitted">{t("admin.verification.queue.resubmitted")}</option>
            <option value="all">{t("admin.verification.queue.all")}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-xs font-bold text-on-surface"
          >
            <option value="all">{t("admin.verification.status.all")}</option>
            <option value="not_started">{t("admin.clients.notVerified" as any)}</option>
            <option value="pending">{t("verification.status.pending")}</option>
            <option value="resubmission_requested">{t("verification.status.resubmission_requested")}</option>
            <option value="rejected">{t("verification.status.rejected")}</option>
            <option value="approved">{t("verification.status.approved")}</option>
            <option value="suspended">{t("verification.status.suspended")}</option>
            <option value="revoked">{t("verification.status.revoked")}</option>
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-xs font-bold text-on-surface"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-xs font-bold text-on-surface"
          />
          <input
            value={reviewerFilter}
            onChange={(event) => setReviewerFilter(event.target.value)}
            placeholder={t("admin.verification.filter.reviewer")}
            className="rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-xs font-bold text-on-surface"
          />
          <label className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-xs font-bold text-on-surface">
            <input
              type="checkbox"
              checked={resubmittedOnly}
              onChange={(event) => setResubmittedOnly(event.target.checked)}
            />
            {t("admin.verification.filter.resubmitted")}
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        {tab === "workers" ? (
          <table className="w-full text-sm">
            <thead className="border-b border-outline-variant bg-surface-container/50 text-left">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t("admin.verification.col.worker")}</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t("admin.common.status")}</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t("admin.verification.col.finDoc")}</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t("admin.verification.col.reviewerAge")}</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t("admin.verification.col.action")}</th>
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
                    <StatusBadge status={worker.isSuspended ? "suspended" : worker.status} label={statusLabel(worker.isSuspended ? "suspended" : worker.status)} />
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-on-surface-variant">
                    <p>{worker.maskedFin || t("admin.verification.finMissing")}</p>
                    <p className="text-[10px]">{worker.hasDocument ? t("admin.verification.documentSubmitted") : t("admin.verification.documentMissing")}</p>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-on-surface-variant">
                    <p>{worker.reviewerName || t("admin.verification.unassigned")}</p>
                    <p className="text-[10px]">
                      {t("admin.verification.currentAttempt")} {worker.attemptNumber || 1} · {ageLabel(worker.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canOpenDetails && (
                      <Link
                        href={`/admin/verify/${worker.userId}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-[11px] font-black uppercase tracking-wider text-on-surface hover:bg-surface-container-high"
                      >
                        {canReview ? t("admin.verification.review") : t("admin.verification.viewDetails")} <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {filteredWorkers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm font-bold text-on-surface-variant">
                    {t("admin.verification.noWorkers")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-outline-variant bg-surface-container/50 text-left">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t("admin.verification.col.client")}</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t("admin.common.status")}</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t("admin.verification.col.finDoc")}</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t("admin.verification.col.reviewerAge")}</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t("admin.verification.col.action")}</th>
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
                    <StatusBadge status={client.isSuspended ? "suspended" : client.status} label={statusLabel(client.isSuspended ? "suspended" : client.status)} />
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-on-surface-variant">
                    <p>{client.maskedFin || t("admin.verification.finMissing")}</p>
                    <p className="text-[10px]">{client.hasDocument ? t("admin.verification.documentSubmitted") : t("admin.verification.documentMissing")}</p>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-on-surface-variant">
                    <p>{client.reviewerName || t("admin.verification.unassigned")}</p>
                    <p className="text-[10px]">
                      {t("admin.verification.currentAttempt")} {client.attemptNumber || 1} · {ageLabel(client.createdAt)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canOpenDetails && (
                      <Link
                        href={`/admin/clients/${client.userId}/verify`}
                        className="inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container px-3 py-2 text-[11px] font-black uppercase tracking-wider text-on-surface hover:bg-surface-container-high"
                      >
                        {canReview ? t("admin.verification.review") : t("admin.verification.viewDetails")} <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm font-bold text-on-surface-variant">
                    {t("admin.verification.noClients")}
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
