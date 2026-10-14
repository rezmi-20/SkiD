import Link from "next/link";
import { Scale, ChevronRight, Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react";

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

function getStatusBadge(status: string, outcome?: string | null) {
  if (outcome) {
    switch (outcome) {
      case "upheld":
        return {
          label: "Ruling: Upheld",
          classes: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        };
      case "overturned":
        return {
          label: "Ruling: Overturned",
          classes: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        };
      case "returned_for_re_review":
        return {
          label: "Returned for Review",
          classes: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        };
      case "dismissed":
        return {
          label: "Dismissed",
          classes: "border-muted-foreground/30 bg-muted/40 text-muted-foreground",
        };
    }
  }

  switch (status) {
    case "appeal_requested":
      return {
        label: "Under Review",
        classes: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      };
    case "appeal_under_review":
      return {
        label: "Super Admin Review",
        classes: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
      };
    case "appeal_resolved":
      return {
        label: "Adjudicated",
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

export default function UserAppealsList({
  appeals,
  role,
}: {
  appeals: AppealItem[];
  role: "client" | "worker";
}) {
  if (appeals.length === 0) {
    return (
      <div className="rounded-xl border border-border/80 bg-card p-10 text-center space-y-4 shadow-2xs">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Scale className="h-6 w-6" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-sm font-bold text-foreground">No Governance Appeals Filed</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If you disagree with a dispute outcome or account determination, you can request an independent Super Admin review within 7 days.
          </p>
        </div>
        <div>
          <Link
            href={`/${role}/appeals/new`}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Request New Appeal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs divide-y divide-border/60">
      {appeals.map((appeal) => {
        const badge = getStatusBadge(appeal.status, appeal.outcome);
        return (
          <Link
            key={appeal.id}
            href={`/${role}/appeals/${appeal.id}`}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-accent/40 transition-colors"
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
                {appeal.reason ? String(appeal.reason).replaceAll("_", " ") : "Governance Appeal Review"}
              </h3>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Case: <span className="font-mono text-foreground">{String(appeal.target_id).slice(0, 8)}...</span>
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Filed on {new Date(appeal.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors hidden sm:inline">
                View Dossier
              </span>
              <div className="rounded-md bg-muted/60 p-1.5 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
