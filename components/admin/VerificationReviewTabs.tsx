"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  ExternalLink,
  Search,
  UserRound,
  Filter,
  User,
  X,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Fingerprint,
  Eye,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import FadeContent from "@/components/ui/fade-content";
import { WorkerReviewDrawer, WorkerQueueItem } from "./dashboard/WorkerReviewDrawer";

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

const PAGE_SIZE = 12;

export function VerificationReviewTabs({ workers, clients, canOpenDetails, canReview }: Props) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<"workers" | "clients">("workers");
  const [queue, setQueue] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [resubmittedOnly, setResubmittedOnly] = useState(false);
  const [reviewerFilter, setReviewerFilter] = useState("");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Slide-out review drawer state
  const [drawerWorker, setDrawerWorker] = useState<WorkerQueueItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();
  const normalizedReviewer = reviewerFilter.trim().toLowerCase();

  // Reset pagination on filter or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [tab, queue, query, dateFrom, dateTo, reviewerFilter, resubmittedOnly]);

  const handleOpenReview = (worker: WorkerRow) => {
    setDrawerWorker({
      user_id: worker.userId,
      full_name: worker.fullName,
      email: worker.email,
      phone: worker.phone || undefined,
      fin_last4: worker.maskedFin ? worker.maskedFin.replace(/[^0-9]/g, "") : null,
      has_document: worker.hasDocument,
      verification_status: worker.status,
      is_verified: worker.isVerified,
      is_suspended: worker.isSuspended,
      created_at: worker.createdAt,
    });
    setIsDrawerOpen(true);
  };

  const ageLabel = (createdAt: string) => {
    const ms = Date.now() - new Date(createdAt).getTime();
    const days = Math.max(0, Math.floor(ms / 86_400_000));
    if (days <= 0) return t("common.today" as any) || "Today";
    if (days === 1) return `1 ${t("common.day" as any) || "day"}`;
    return `${days} ${t("common.days" as any) || "days"}`;
  };

  const statusLabel = (status: string) =>
    status === "not_started"
      ? t("admin.clients.notVerified" as any) || "Not Verified"
      : t(`verification.status.${status}` as any) || status;

  const matchesQueue = (status: string) => {
    if (queue === "all") return true;
    if (queue === "pending") return status === "pending";
    if (queue === "approved") return status === "approved";
    if (queue === "rejected") return status === "rejected" || status === "revoked" || status === "suspended";
    return false;
  };

  const matchesFilters = (row: { status: string; attemptNumber: number | null; createdAt: string; reviewerName: string | null }) => {
    if (!matchesQueue(row.status)) return false;
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
    [workers, normalizedQuery, queue, dateFrom, dateTo, resubmittedOnly, normalizedReviewer],
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
    [clients, normalizedQuery, queue, dateFrom, dateTo, resubmittedOnly, normalizedReviewer],
  );

  const currentList = tab === "workers" ? filteredWorkers : filteredClients;
  const currentTotal = tab === "workers" ? workers.length : clients.length;
  const totalPages = Math.max(1, Math.ceil(currentList.length / PAGE_SIZE));
  const paginatedWorkers = useMemo(
    () => filteredWorkers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredWorkers, currentPage]
  );
  const paginatedClients = useMemo(
    () => filteredClients.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredClients, currentPage]
  );

  const pendingWorkerCount = useMemo(() => workers.filter((w) => w.status === "pending").length, [workers]);
  const pendingClientCount = useMemo(() => clients.filter((c) => c.status === "pending").length, [clients]);

  // Aggregate metrics across workers and clients
  const pendingTotal = pendingWorkerCount + pendingClientCount;
  const verifiedTotal =
    workers.filter((w) => w.status === "approved").length +
    clients.filter((c) => c.status === "approved").length;
  const totalAccounts = workers.length + clients.length;
  const faydaOnFile =
    workers.filter((w) => w.hasDocument).length +
    clients.filter((c) => c.hasDocument).length;

  const hasActiveAdvanced = Boolean(dateFrom || dateTo || reviewerFilter || resubmittedOnly);

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full">
      {/* 1. Flush, Clean Page Header with Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Identity Verification
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Review Fayda National ID credentials and trade certifications
          </p>
        </div>

        {/* Tab Switcher: Artisans vs Clients */}
        <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTab("workers")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
              tab === "workers"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Artisans</span>
            <span className="rounded-full bg-secondary/80 px-1.5 py-0.2 text-[10px] font-mono border border-border">
              {workers.length}
            </span>
            {pendingWorkerCount > 0 && (
              <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded-full">
                {pendingWorkerCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("clients")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer",
              tab === "clients"
                ? "bg-card text-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UserRound className="w-3.5 h-3.5" />
            <span>Clients</span>
            <span className="rounded-full bg-secondary/80 px-1.5 py-0.2 text-[10px] font-mono border border-border">
              {clients.length}
            </span>
            {pendingClientCount > 0 && (
              <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded-full">
                {pendingClientCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Verification Metric Strip (Clean elevated cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Pending Review</p>
            <p className="text-xl font-bold text-foreground mt-1 tabular-nums">{pendingTotal}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Verified Accounts</p>
            <p className="text-xl font-bold text-foreground mt-1 tabular-nums">{verifiedTotal}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-success/10 text-success flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Fayda On File</p>
            <p className="text-xl font-bold text-foreground mt-1 tabular-nums">
              {faydaOnFile} / {totalAccounts}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
            <Fingerprint className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Review SLA</p>
            <p className="text-xl font-bold text-foreground mt-1">&lt; 2 Hours</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Filters and Search (UNCONTAINED - flush row inspired by deals page) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={
                tab === "workers"
                  ? "Search artisans by name, email, phone, or FIN..."
                  : "Search clients by name, email, phone, or FIN..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-8 rounded-lg bg-secondary border border-border text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Queue Filter Segmented Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "all", label: "All Records" },
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved" },
              { id: "rejected", label: "Rejected" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setQueue(item.id as typeof queue)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                  queue === item.id
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shrink-0",
            showAdvancedFilters || hasActiveAdvanced
              ? "bg-accent/10 border border-accent/30 text-accent font-semibold"
              : "bg-secondary border border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
          {hasActiveAdvanced && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-200",
              showAdvancedFilters && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Expandable Advanced Filters (only shown when toggled) */}
      {showAdvancedFilters && (
        <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-200">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Reviewer Name
            </label>
            <input
              value={reviewerFilter}
              onChange={(e) => setReviewerFilter(e.target.value)}
              placeholder="Filter by admin..."
              className="w-full rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground cursor-pointer w-full">
              <input
                type="checkbox"
                checked={resubmittedOnly}
                onChange={(e) => setResubmittedOnly(e.target.checked)}
                className="rounded text-accent focus:ring-accent"
              />
              <span className="truncate text-xs font-medium">Resubmissions only</span>
            </label>
          </div>
        </div>
      )}

      {/* 4. Table Card (ONLY encapsulates table and pagination footer) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        {tab === "workers" ? (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-secondary/50">
                  <th className="py-3 px-4">Artisan</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Fayda National ID</th>
                  <th className="py-3 px-4">Reviewer & Age</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {paginatedWorkers.map((worker) => {
                  const isApproved = worker.status === "approved";
                  return (
                    <tr
                      key={worker.userId}
                      className="hover:bg-secondary/40 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent flex items-center justify-center font-bold text-xs shrink-0 transition-colors">
                            {worker.fullName?.charAt(0) || <User size={13} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-xs truncate group-hover:text-accent transition">
                              {worker.fullName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">{worker.email}</p>
                            {worker.phone && (
                              <p className="text-[10px] text-muted-foreground font-mono">+251 {worker.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            isApproved
                              ? "bg-success/10 text-success border-success/20"
                              : worker.isSuspended || worker.status === "rejected" || worker.status === "revoked"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isApproved ? "bg-success" : worker.isSuspended ? "bg-destructive" : "bg-warning"
                            }`}
                          />
                          {statusLabel(worker.isSuspended ? "suspended" : worker.status)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        <p className="font-mono text-xs font-semibold text-foreground">
                          {worker.maskedFin || "No FIN Provided"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {worker.hasDocument ? "Fayda Scan On File" : "No Document"}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">
                          {worker.reviewerName || "Unassigned"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Attempt #{worker.attemptNumber || 1} · {ageLabel(worker.createdAt)}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {canReview && (
                            <button
                              type="button"
                              onClick={() => handleOpenReview(worker)}
                              className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition flex items-center gap-1"
                              title="Quick Review Drawer"
                            >
                              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>Review</span>
                            </button>
                          )}

                          {canOpenDetails && (
                            <Link
                              href={`/admin/verify/${worker.userId}`}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-accent/10 hover:text-accent text-muted-foreground font-medium transition"
                              title="Full Inspection Studio"
                            >
                              <span>Studio</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedWorkers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-xs text-muted-foreground">
                      No artisan identity submissions found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-secondary/50">
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Verification Status</th>
                  <th className="py-3 px-4">Fayda National ID</th>
                  <th className="py-3 px-4">Reviewer & Age</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {paginatedClients.map((client) => {
                  const isApproved = client.status === "approved";
                  return (
                    <tr
                      key={client.userId}
                      className="hover:bg-secondary/40 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent flex items-center justify-center font-bold text-xs shrink-0 transition-colors">
                            {client.fullName?.charAt(0) || <User size={13} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-xs truncate group-hover:text-accent transition">
                              {client.fullName}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">{client.email}</p>
                            {client.phone && (
                              <p className="text-[10px] text-muted-foreground font-mono">+251 {client.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            isApproved
                              ? "bg-success/10 text-success border-success/20"
                              : client.isSuspended || client.status === "rejected" || client.status === "revoked"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isApproved ? "bg-success" : client.isSuspended ? "bg-destructive" : "bg-warning"
                            }`}
                          />
                          {statusLabel(client.isSuspended ? "suspended" : client.status)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        <p className="font-mono text-xs font-semibold text-foreground">
                          {client.maskedFin || "No FIN Provided"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {client.hasDocument ? "Fayda Scan On File" : "No Document"}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">
                          {client.reviewerName || "Unassigned"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Attempt #{client.attemptNumber || 1} · {ageLabel(client.createdAt)}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {canOpenDetails && (
                          <Link
                            href={`/admin/clients/${client.userId}/verify`}
                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent/10 hover:text-accent text-muted-foreground font-semibold transition"
                          >
                            <span>{canReview ? "Review" : "View"}</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {paginatedClients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-xs text-muted-foreground">
                      No client identity submissions found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination & Count Footer (matches deals.tsx style) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-secondary/30">
          <span className="text-xs sm:text-sm text-muted-foreground">
            Showing{" "}
            {currentList.length === 0
              ? 0
              : `${(currentPage - 1) * PAGE_SIZE + 1}-${Math.min(currentPage * PAGE_SIZE, currentList.length)}`}{" "}
            of {currentList.length} {tab === "workers" ? "artisans" : "clients"}
            {currentList.length !== currentTotal && ` (filtered from ${currentTotal})`}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none transition-colors duration-200"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  return (
                    <span key={p} className="flex items-center">
                      {prev && p - prev > 1 && (
                        <span className="px-1 text-xs text-muted-foreground">…</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center",
                          currentPage === p
                            ? "bg-accent text-accent-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 disabled:pointer-events-none transition-colors duration-200"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Review Sheet Drawer */}
      <WorkerReviewDrawer
        worker={drawerWorker}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        canReview={canReview}
        canApprove={canReview}
        canReject={canReview}
        onStatusChanged={() => {
          setIsDrawerOpen(false);
        }}
      />
    </FadeContent>
  );
}
