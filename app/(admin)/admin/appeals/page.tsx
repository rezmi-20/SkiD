import Link from "next/link";
import { getAppealsForReview } from "@/lib/actions/governance";
import { Scale, ChevronRight, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

function getStatusBadge(status: string) {
  switch (status) {
    case "appeal_requested":
      return {
        label: "Pending Review",
        classes: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      };
    case "appeal_under_review":
      return {
        label: "Under Review",
        classes: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      };
    case "appeal_resolved":
      return {
        label: "Resolved",
        classes: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      };
    case "appeal_dismissed":
      return {
        label: "Dismissed",
        classes: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
      };
    default:
      return {
        label: status.replaceAll("_", " "),
        classes: "border-border bg-muted/30 text-foreground",
      };
  }
}

export default async function AdminAppealsPage() {
  const appeals = await getAppealsForReview();

  const pendingCount = appeals.filter((a: any) =>
    ["appeal_requested", "appeal_under_review"].includes(a.status)
  ).length;
  const resolvedCount = appeals.filter((a: any) =>
    ["appeal_resolved", "appeal_dismissed"].includes(a.status)
  ).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary tracking-wide uppercase mb-1.5">
            <Scale className="h-3 w-3" />
            Independent Oversight Board
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Governance Appeals Queue
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Super Admin escalation pipeline for disputed outcomes and formal procedural challenges.
          </p>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Appeals Filed
          </p>
          <p className="mt-1 text-2xl font-black text-foreground">{appeals.length}</p>
        </div>
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Awaiting Determination
          </p>
          <p className="mt-1 text-2xl font-black text-amber-700 dark:text-amber-400">
            {pendingCount}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Completed Rulings
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {resolvedCount}
          </p>
        </div>
      </div>

      {/* Appeals List Card */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="border-b border-border/60 px-5 py-3.5 bg-muted/20 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Appeals Docket ({appeals.length})
          </h2>
          <span className="text-[11px] text-muted-foreground font-medium">
            Ordered by newest submission
          </span>
        </div>

        {appeals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="mx-auto w-10 h-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">No Appeals in Queue</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                All platform disputes and verification decisions are currently uncontested or fully adjudicated.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {appeals.map((appeal: any) => {
              const badge = getStatusBadge(appeal.status);
              return (
                <Link
                  key={appeal.id}
                  href={`/admin/appeals/${appeal.id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-accent/40 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        {appeal.reference}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize">
                        {String(appeal.appeal_type).replaceAll("_", " ")}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {appeal.reason
                        ? String(appeal.reason).replaceAll("_", " ")
                        : "Governance Appeal"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Appellant: <span className="font-medium text-foreground">{appeal.appellant_name}</span>
                      </span>
                      <span>·</span>
                      <span>
                        Original Reviewer:{" "}
                        <span className="font-medium text-foreground">
                          {appeal.original_employee_id || "Platform / Unassigned"}
                        </span>
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(appeal.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors hidden sm:inline">
                      Review Dossier
                    </span>
                    <div className="rounded-md bg-muted/60 p-1.5 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
