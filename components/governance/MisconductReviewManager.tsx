"use client";

import { useState } from "react";
import Link from "next/link";
import { openMisconductReview } from "@/lib/actions/governance";
import { useLanguage } from "@/context/LanguageContext";
import {
  ShieldAlert,
  AlertCircle,
  ChevronRight,
  Clock,
  CheckCircle2,
  FileText,
  Loader2,
  Shield,
  Activity,
  User,
  Scale,
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
        label: "No Action (Exonerated)",
        classes: "border-border bg-secondary text-muted-foreground",
      };
    case "formal_warning":
      return {
        label: "Written Warning",
        classes: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      };
    case "mandatory_retraining":
      return {
        label: "Retraining Required",
        classes: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      };
    case "temporary_suspension":
      return {
        label: "Suspended Account",
        classes: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
      };
    case "revoke_admin_access":
      return {
        label: "Access Revoked",
        classes: "border-rose-500/40 bg-rose-500/15 text-rose-700 dark:text-rose-300",
      };
    default:
      return {
        label: outcome.replaceAll("_", " "),
        classes: "border-accent/30 bg-accent/10 text-accent",
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
  const { t } = useLanguage();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    indicators[0]?.id || ""
  );
  const [reason, setReason] = useState<string>("");
  const [auditIds, setAuditIds] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
    <div className="space-y-6 pb-24 w-full">
      {/* 1. Header (Clean deals.tsx style: No dots, no uppercase pill badges) */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {t("admin.misconduct.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.misconduct.desc")}
        </p>
      </div>

      {/* 2. KPI Summary Cards (deals.tsx & forecasting.tsx pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t("admin.misconduct.kpi.total")}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground font-mono mt-1">{reviews.length}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
              <Scale className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{t("admin.misconduct.kpi.active")}</p>
              <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono mt-1">{activeReviews.length}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{t("admin.misconduct.kpi.flags")}</p>
              <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono mt-1">{indicators.length}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{t("admin.misconduct.kpi.concluded")}</p>
              <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono mt-1">{resolvedReviews.length}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Formal Investigation Initiation Form */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="border-b border-border pb-3">
          <h2 className="text-sm font-bold text-foreground">
            {t("admin.misconduct.form.title")}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("admin.misconduct.form.desc")}
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleOpenReview} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("admin.misconduct.form.employee")}
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:border-accent"
              >
                {indicators.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.admin_employee_id} · {ind.full_name} ({String(ind.admin_role).replaceAll("_", " ")})
                  </option>
                ))}
              </select>
              {selectedEmployee && (
                <p className="text-[11px] text-muted-foreground font-mono">
                  Role: <span className="font-semibold text-foreground">{selectedEmployee.admin_role}</span> · Flag:{" "}
                  <span className="font-semibold capitalize text-foreground">{selectedEmployee.misuse_flag.replaceAll("_", " ")}</span>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {t("admin.misconduct.form.auditIds")}
              </label>
              <input
                value={auditIds}
                onChange={(e) => setAuditIds(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g. 21794c27-b73b-41a0-b8e4-cd504202a662"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-accent placeholder:text-muted-foreground"
              />
              <p className="text-[11px] text-muted-foreground">
                {t("admin.misconduct.form.auditIdsDesc")}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t("admin.misconduct.form.reason")}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              required
              minLength={10}
              rows={3}
              placeholder={t("admin.misconduct.form.reasonPlaceholder")}
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-accent-foreground shadow-xs hover:bg-accent/90 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{t("admin.misconduct.form.submit")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Floating Filter Bar (deals.tsx pattern) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: t("admin.misconduct.filter.all"), count: reviews.length },
            { id: "active", label: t("admin.misconduct.filter.active"), count: activeReviews.length },
            { id: "resolved", label: t("admin.misconduct.filter.resolved"), count: resolvedReviews.length },
          ].map((tab) => {
            const isSelected = reviewTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReviewTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Standalone Table Card */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xs">
        {displayedReviews.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-1">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 opacity-70 mb-2" />
            <p className="text-xs font-semibold text-foreground">
              {t("admin.misconduct.noInquiries")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">{t("admin.misconduct.table.reference")}</th>
                  <th className="px-4 py-3">{t("admin.misconduct.table.role")}</th>
                  <th className="px-4 py-3">{t("admin.misconduct.table.grounds")}</th>
                  <th className="px-4 py-3">{t("admin.misconduct.table.status")}</th>
                  <th className="px-4 py-3">{t("admin.misconduct.table.ruling")}</th>
                  <th className="px-4 py-3">{t("admin.misconduct.table.date")}</th>
                  <th className="px-4 py-3 text-right">{t("admin.misconduct.table.action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedReviews.map((review) => {
                  const isClosed = ["resolved", "dismissed"].includes(review.status);
                  const outcomeBadge = getOutcomeBadge(review.outcome);

                  return (
                    <tr
                      key={review.id}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-accent text-xs">
                            {review.reference}
                          </span>
                          <p className="font-semibold text-foreground text-xs">{review.full_name}</p>
                          <p className="font-mono text-[10px] text-muted-foreground">{review.admin_employee_id}</p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground capitalize">
                        {String(review.admin_role).replaceAll("_", " ")}
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                          {review.reason}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                            isClosed
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {review.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {outcomeBadge ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${outcomeBadge.classes}`}
                          >
                            {outcomeBadge.label}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px] italic">Pending Ruling</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-xs font-mono text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/admin/misconduct/${review.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                        >
                          <span>{t("admin.misconduct.table.action")}</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
