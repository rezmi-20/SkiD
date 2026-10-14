import Link from "next/link";
import { getAuditLogEntries } from "@/lib/actions/governance";
import {
  ShieldCheck,
  Search,
  Filter,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Calendar,
  Layers,
  Target,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  if (!value) return "Not recorded";
  return new Date(String(value)).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActorBadge(role: string = "") {
  switch (role) {
    case "super_admin":
      return "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400";
    case "dispute_payment_admin":
      return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "content_verification_admin":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "user_support_admin":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
    case "system":
      return "border-border bg-muted/60 text-muted-foreground";
    default:
      return "border-border bg-muted/40 text-foreground";
  }
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const result = await getAuditLogEntries({
    q: params.q,
    action: params.action,
    module: params.module,
    targetType: params.targetType,
    adminRole: params.adminRole,
    highRiskOnly: params.highRisk === "1",
    page: Number(params.page || 1),
    from: params.from,
    to: params.to,
  });

  const entries = result.entries || [];
  const hasActiveFilters = Boolean(
    params.q ||
      params.module ||
      params.targetType ||
      params.from ||
      params.to ||
      params.highRisk === "1"
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary tracking-wide uppercase mb-1.5">
            <ShieldCheck className="h-3 w-3" />
            Append-Only Cryptographic Ledger
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Immutable Audit Trail
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cryptographically sealed timeline of all administrative actions, dispute resolutions, and governance determinations.
          </p>
        </div>
      </header>

      {/* Filter Card */}
      <form
        method="GET"
        className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-2xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span>Filter Audit Ledger</span>
            {hasActiveFilters && (
              <span className="rounded-full bg-primary/15 px-2 py-0.2 text-[10px] font-bold text-primary normal-case">
                Filters Active
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <Link
              href="/admin/audit"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Filters
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Free Text Search */}
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Search Query
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                name="q"
                defaultValue={params.q || ""}
                placeholder="Search action, target ID, reference..."
                className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Module Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Module
            </label>
            <select
              name="module"
              defaultValue={params.module || ""}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="">All Modules</option>
              <option value="appeals">Appeals</option>
              <option value="disputes">Disputes</option>
              <option value="governance">Governance</option>
              <option value="verification">Verification</option>
              <option value="support">Support</option>
              <option value="payments">Payments</option>
              <option value="admin_auth">Admin Auth</option>
            </select>
          </div>

          {/* Target Type Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Target Type
            </label>
            <select
              name="targetType"
              defaultValue={params.targetType || ""}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="">All Target Types</option>
              <option value="dispute">Dispute</option>
              <option value="appeal">Appeal</option>
              <option value="admin_employee">Admin Employee</option>
              <option value="user">User Account</option>
              <option value="payment">Payment</option>
              <option value="verification_event">Verification Event</option>
            </select>
          </div>

          {/* High-risk toggle */}
          <div className="space-y-1 flex flex-col justify-end">
            <label className="flex items-center gap-2 rounded-md border border-border/80 bg-muted/20 px-3 py-1.5 text-xs font-semibold text-foreground cursor-pointer hover:bg-muted/40 transition-colors">
              <input
                type="checkbox"
                name="highRisk"
                value="1"
                defaultChecked={params.highRisk === "1"}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span>High-Risk Only</span>
              </span>
            </label>
          </div>
        </div>

        {/* Date Row and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                From:
              </span>
              <input
                name="from"
                type="date"
                defaultValue={params.from || ""}
                className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                To:
              </span>
              <input
                name="to"
                type="date"
                defaultValue={params.to || ""}
                className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Link
                href="/admin/audit"
                className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                Reset
              </Link>
            )}
            <button
              type="submit"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
            >
              <Filter className="h-3 w-3" />
              Apply Filter
            </button>
          </div>
        </div>
      </form>

      {/* Ledger Table */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/80 bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor / Principal</th>
                <th className="px-4 py-3">Action & Module</th>
                <th className="px-4 py-3">Target Reference</th>
                <th className="px-4 py-3">Attribution & Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <p className="font-semibold text-foreground">No audit entries found</p>
                    <p className="text-xs mt-1">Try broadening your search query or reset date filters.</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry: any) => {
                  const roleBadge = getActorBadge(entry.actor_role);
                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-accent/40 transition-colors group"
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {formatDate(entry.created_at)}
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground">
                            {entry.actor_name || entry.actor_employee_id || entry.actor_type || "System"}
                          </p>
                          <span
                            className={`inline-block rounded-md border px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${roleBadge}`}
                          >
                            {String(entry.actor_role || entry.actor_type || "system").replaceAll("_", " ")}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground font-mono text-[11px]">
                            {entry.action}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span className="capitalize font-medium">{entry.module || "System"}</span>
                            {entry.high_risk && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-rose-500/10 px-1 py-0.2 text-[9px] font-bold text-rose-600 dark:text-rose-400">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                High-Risk
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Target Reference */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 max-w-xs" title={`Full ID: ${entry.target_id || "None"}`}>
                          <span className="inline-block rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono font-bold text-foreground">
                            {entry.target_type || "general"}
                          </span>
                          <p className="font-mono text-[11px] text-foreground/80 truncate">
                            {entry.target_id ? `${String(entry.target_id).slice(0, 18)}...` : "—"}
                          </p>
                        </div>
                      </td>

                      {/* Reference & Reason */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="space-y-0.5 max-w-xs">
                          {entry.related_reference && (
                            <p className="font-mono font-bold text-primary text-[11px]">
                              {entry.related_reference}
                            </p>
                          )}
                          {entry.reason && (
                            <p className="text-[11px] text-foreground/90 truncate" title={entry.reason}>
                              {entry.reason}
                            </p>
                          )}
                          {entry.proposed_by_employee_id && (
                            <p className="text-[10px]">
                              Proposed by <span className="font-mono font-medium">{entry.proposed_by_employee_id}</span>
                            </p>
                          )}
                          {entry.approved_by_employee_id && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              Approved by <span className="font-mono font-medium">{entry.approved_by_employee_id}</span>
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-3">
          <span className="text-xs text-muted-foreground">
            Page <span className="font-bold text-foreground">{result.page}</span> · Showing up to{" "}
            {result.pageSize} records per page
          </span>
          <div className="flex items-center gap-2">
            {result.page > 1 ? (
              <Link
                href={`/admin/audit?page=${result.page - 1}`}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Link>
            ) : null}
            {entries.length === result.pageSize ? (
              <Link
                href={`/admin/audit?page=${result.page + 1}`}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
