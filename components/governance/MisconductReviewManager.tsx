"use client";

import { useState } from "react";
import Link from "next/link";
import { openMisconductReview } from "@/lib/actions/governance";
import {
  ShieldAlert,
  UserCheck,
  AlertCircle,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  FileText,
  UserX,
  Loader2,
  Archive,
  Search,
} from "lucide-react";

interface EmployeeIndicator {
  id: string;
  admin_employee_id: string;
  full_name: string;
  admin_role: string;
  misuse_flag: string;
  rejection_like_count?: number;
  fin_reveal_count?: number;
  high_risk_count?: number;
  failed_access_count?: number;
  assignment_count?: number;
}

interface MisconductReviewItem {
  id: string;
  reference: string;
  employee_id: string;
  full_name: string;
  admin_employee_id: string;
  admin_role: string;
  status: string;
  outcome?: string | null;
  reason: string;
  created_at: string | Date;
}

function getOutcomeBadge(outcome?: string | null) {
  if (!outcome) return null;
  switch (outcome) {
    case "no_action":
      return {
        label: "Ruling: No Action (Exonerated)",
        classes: "border-border bg-muted/60 text-muted-foreground",
      };
    case "formal_warning":
      return {
        label: "Ruling: Written Warning",
        classes: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      };
    case "mandatory_retraining":
      return {
        label: "Ruling: Retraining Required",
        classes: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      };
    case "temporary_suspension":
      return {
        label: "Ruling: Suspended Account",
        classes: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
      };
    case "revoke_admin_access":
      return {
        label: "Ruling: Access Revoked",
        classes: "border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300",
      };
    default:
      return {
        label: `Ruling: ${outcome.replaceAll("_", " ")}`,
        classes: "border-primary/30 bg-primary/10 text-primary",
      };
  }
}

export default function MisconductReviewManager({
  indicators,
  reviews,
}: {
  indicators: EmployeeIndicator[];
  reviews: MisconductReviewItem[];
}) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    indicators[0]?.id || ""
  );
  const [reason, setReason] = useState<string>("");
  const [auditIds, setAuditIds] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Tabs for Reviews section: "all" | "active" | "resolved"
  const [reviewTab, setReviewTab] = useState<"all" | "active" | "resolved">("all");

  const selectedEmployee = indicators.find((i) => i.id === selectedEmployeeId);

  const activeReviews = reviews.filter(
    (r) => !["resolved", "dismissed"].includes(r.status)
  );
  const resolvedReviews = reviews.filter((r) =>
    ["resolved", "dismissed"].includes(r.status)
  );

  const displayedReviews =
    reviewTab === "active"
      ? activeReviews
      : reviewTab === "resolved"
      ? resolvedReviews
      : reviews;

  const handleOpenReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedEmployeeId) {
      setErrorMessage("Please select an administrator employee to review.");
      return;
    }

    if (reason.trim().length < 10) {
      setErrorMessage("Please enter an investigation reason of at least 10 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedAuditIds = auditIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const result = await openMisconductReview(
        selectedEmployeeId,
        reason.trim(),
        parsedAuditIds
      );

      if (!result.success) {
        setErrorMessage(result.error || "Failed to initiate misconduct review.");
        return;
      }

      setSuccessMessage(`Review ${result.reference} opened successfully!`);
      window.location.href = `/admin/misconduct/${result.reviewId}`;
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Initiation Form Card */}
      <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="space-y-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <span>Initiate Formal Administrator Review</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Open an independent oversight investigation on a staff administrator with referenced audit records.
            </p>
          </div>
          <span className="rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary uppercase">
            Super Admin Authority
          </span>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2.5 rounded-md border border-destructive/25 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleOpenReview} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Employee Selector Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Target Administrator Employee
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                {indicators.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.admin_employee_id} · {ind.full_name} ({String(ind.admin_role).replaceAll("_", " ")})
                  </option>
                ))}
              </select>
              {selectedEmployee && (
                <p className="text-[11px] text-muted-foreground">
                  Role: <span className="font-semibold text-foreground">{selectedEmployee.admin_role}</span> · Activity Flag:{" "}
                  <span className="font-semibold capitalize text-foreground">{selectedEmployee.misuse_flag.replaceAll("_", " ")}</span>
                </p>
              )}
            </div>

            {/* Referenced Audit IDs (Optional) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Referenced Audit Entry IDs <span className="text-[10px] lowercase font-normal">(optional)</span>
              </label>
              <input
                value={auditIds}
                onChange={(e) => setAuditIds(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g. 21794c27-b73b-41a0-b8e4-cd504202a662"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
              />
              <p className="text-[11px] text-muted-foreground">
                Links immutable audit ledger actions to this case dossier.
              </p>
            </div>
          </div>

          {/* Investigation Reason */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Formal Investigation Grounds & Narrative
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              required
              minLength={10}
              rows={3}
              placeholder="State the factual basis, policy breach, or procedural irregularity requiring governance review..."
              className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-muted-foreground italic">
              Conflict guard: Super Admins cannot open self-reviews or reviews on their own accounts.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Opening Review...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Open Review Case
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Staff Activity & Misuse Indicators */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="border-b border-border/60 px-5 py-3.5 bg-muted/20 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Staff Administrator Activity Ledger ({indicators.length})
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Select any staff administrator below to quickly open an audit review on their recent activity.
            </p>
          </div>
        </div>

        <div className="divide-y divide-border/60">
          {indicators.map((ind) => {
            const isSelected = ind.id === selectedEmployeeId;
            return (
              <div
                key={ind.id}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isSelected ? "bg-primary/5" : "hover:bg-accent/30"
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary">
                      {ind.admin_employee_id}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize">
                      {String(ind.admin_role).replaceAll("_", " ")}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                        ind.misuse_flag === "high_risk_review"
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : ind.misuse_flag === "attention_required"
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-border bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {ind.misuse_flag.replaceAll("_", " ")}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-foreground truncate">
                    {ind.full_name}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmployeeId(ind.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "border border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Selected
                      </>
                    ) : (
                      "Review this Admin"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Governance Reviews & Historical Rulings Section */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs space-y-0">
        <div className="border-b border-border/60 px-5 py-4 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Misconduct Review Dossiers & Historical Rulings ({reviews.length})
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Access ongoing investigations and inspect historical rulings (read-only audit archive).
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="inline-flex rounded-lg border border-border bg-muted/50 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setReviewTab("all")}
              className={`rounded-md px-3 py-1 transition-colors cursor-pointer ${
                reviewTab === "all"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewTab("active")}
              className={`rounded-md px-3 py-1 transition-colors cursor-pointer ${
                reviewTab === "active"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active ({activeReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewTab("resolved")}
              className={`rounded-md px-3 py-1 transition-colors cursor-pointer ${
                reviewTab === "resolved"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Resolved / Archive ({resolvedReviews.length})
            </button>
          </div>
        </div>

        {displayedReviews.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground space-y-1">
            <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-500 mb-2" />
            <p className="text-xs font-bold text-foreground">
              {reviewTab === "active"
                ? "No Active Investigations"
                : reviewTab === "resolved"
                ? "No Historical Rulings in Archive"
                : "No Governance Reviews Found"}
            </p>
            <p className="text-[11px]">
              {reviewTab === "active"
                ? "All staff administrators are currently in good standing."
                : "Concluded reviews and disciplinary determinations will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {displayedReviews.map((review) => {
              const isClosed = ["resolved", "dismissed"].includes(review.status);
              const outcomeBadge = getOutcomeBadge(review.outcome);

              return (
                <Link
                  key={review.id}
                  href={`/admin/misconduct/${review.id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-accent/40 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary">
                        {review.reference}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isClosed
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {review.status}
                      </span>

                      {outcomeBadge && (
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${outcomeBadge.classes}`}
                        >
                          {outcomeBadge.label}
                        </span>
                      )}

                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground capitalize">
                        {String(review.admin_role).replaceAll("_", " ")}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-foreground truncate">
                      {review.full_name}{" "}
                      <span className="text-xs font-normal text-muted-foreground font-mono">
                        ({review.admin_employee_id})
                      </span>
                    </p>

                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {review.reason}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Opened on{" "}
                        {new Date(review.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                    <span>
                      {isClosed ? "Inspect Ruling (Read-Only)" : "Manage Dossier"}
                    </span>
                    <ChevronRight className="h-4 w-4" />
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
