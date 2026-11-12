import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  addMisconductNote,
  getMisconductReviewDetails,
  resolveMisconductReview,
} from "@/lib/actions/governance";
import {
  MISCONDUCT_REVIEW_OUTCOMES,
  MISCONDUCT_REVIEW_STATUSES,
} from "@/lib/governance-constants";
import { ShieldAlert, ArrowLeft, Clock, CheckCircle2, User, FileText } from "lucide-react";

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

export default async function MisconductReviewDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getMisconductReviewDetails(id);
  if (!data) notFound();
  const { review, events } = data;

  async function note(formData: FormData) {
    "use server";
    const result = await addMisconductNote(
      id,
      String(formData.get("note") || ""),
      String(formData.get("status") || "") as any
    );
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/misconduct/${id}`);
  }

  async function resolve(formData: FormData) {
    "use server";
    const result = await resolveMisconductReview(
      id,
      String(formData.get("outcome") || "") as any,
      String(formData.get("reason") || "")
    );
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/misconduct/${id}`);
  }

  const isClosed = ["resolved", "dismissed"].includes(review.status);

  return (
    <div className="w-full space-y-6 pb-24">
      <Link
        href="/admin/misconduct"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to misconduct reviews</span>
      </Link>

      <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-accent">
              {review.reference}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {review.full_name}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Employee ID: {review.admin_employee_id} · Role: <span className="capitalize">{String(review.admin_role).replaceAll("_", " ")}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                isClosed
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              Status: {review.status}
            </span>
            {review.outcome && (
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase text-accent">
                Outcome: {review.outcome.replaceAll("_", " ")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Case Reason & Grounds */}
      <section className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Formal Investigation Grounds
        </h2>
        <div className="rounded-md bg-muted/30 p-3.5 border border-border/60">
          <p className="text-xs font-medium text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {review.reason}
          </p>
        </div>
        {review.outcome_reason && (
          <div className="space-y-1 pt-2 border-t border-border/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Resolution Determination Findings
            </h3>
            <p className="text-xs text-foreground/90 whitespace-pre-wrap rounded-md bg-emerald-500/10 p-3 border border-emerald-500/20">
              {review.outcome_reason}
            </p>
          </div>
        )}
      </section>

      {/* Governance Actions (If Active) */}
      {!isClosed && (
        <section className="grid gap-4 lg:grid-cols-2">
          {/* Note Form */}
          <form
            action={note}
            className="space-y-3 rounded-xl border border-border/80 bg-card p-5 shadow-2xs"
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Add Governance Investigation Note
            </h2>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Update Status
              </label>
              <select
                name="status"
                defaultValue={review.status}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                {MISCONDUCT_REVIEW_STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Confidential Investigation Finding
              </label>
              <textarea
                name="note"
                required
                rows={3}
                placeholder="Record interview notes, audit findings, or operational facts..."
                className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>
            <button className="h-9 inline-flex items-center justify-center rounded-md border border-border bg-muted/60 px-4 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-muted transition-colors cursor-pointer">
              Add Note
            </button>
          </form>

          {/* Resolution Form */}
          <form
            action={resolve}
            className="space-y-3 rounded-xl border border-border/80 bg-card p-5 shadow-2xs"
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Resolve Review Dossier
            </h2>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Formal Outcome Determination
              </label>
              <select
                name="outcome"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                {MISCONDUCT_REVIEW_OUTCOMES.map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Resolution Rationale & Remediation
              </label>
              <textarea
                name="reason"
                required
                rows={3}
                placeholder="State the conclusive determination and remediation requirements..."
                className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>
            <button className="h-9 inline-flex items-center justify-center rounded-md bg-primary px-4 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 transition-opacity shadow-xs cursor-pointer">
              Resolve Review
            </button>
          </form>
        </section>
      )}

      {/* Append-only History Section (Required by compliance suite) */}
      <section className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Append-only History
        </h2>
        <div className="space-y-2.5">
          {events.map((event: any) => (
            <div
              key={event.id}
              className="rounded-lg border border-border/60 bg-muted/20 p-3.5 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-foreground capitalize">
                  {String(event.event_type).replaceAll("_", " ")}
                </p>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {formatDate(event.created_at)}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Recorded by: <span className="font-mono text-foreground">{event.actor_employee_id || "Super Admin"}</span>
              </p>
              {event.note && (
                <p className="text-xs text-foreground/90 pt-1 font-medium whitespace-pre-wrap border-t border-border/40 mt-1">
                  {event.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
