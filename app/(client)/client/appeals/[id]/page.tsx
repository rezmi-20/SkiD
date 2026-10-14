import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserAppealDetails } from "@/lib/actions/governance";
import AppealEvidenceList from "@/components/governance/AppealEvidenceList";
import { ArrowLeft, Scale, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientAppealDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const details = await getUserAppealDetails(id);
  if (!details) notFound();
  const { appeal, events } = details;

  const isResolved = ["appeal_resolved", "appeal_dismissed"].includes(appeal.status);

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <Link
        href="/client/appeals"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to appeals
      </Link>

      <header className="rounded-xl border border-border/80 bg-card p-6 shadow-2xs space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary tracking-wide uppercase">
          <Scale className="h-3 w-3" />
          {appeal.reference}
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Governance Appeal History
        </h1>
        <p className="text-xs font-medium text-muted-foreground">
          Filed on {new Date(appeal.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} · Category: <span className="font-semibold text-foreground">{String(appeal.appeal_type).replaceAll("_", " ")}</span>
        </p>
      </header>

      {/* Primary Details Card */}
      <section className="rounded-xl border border-border/80 bg-card p-6 shadow-2xs space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Info label="Appeal Status" value={appeal.status} highlight={appeal.status === "appeal_requested" ? "pending" : "done"} />
          <Info label="Target Decision ID" value={String(appeal.target_id).slice(0, 16) + "..."} />
          <Info label="Primary Grounds" value={appeal.reason} />
          <Info label="Governance Ruling" value={appeal.outcome || "Pending Independent Review"} />
          <Info label="Resolved Date" value={appeal.resolved_at ? new Date(appeal.resolved_at).toLocaleString() : "Awaiting Review"} />
          <Info label="Case Type" value={appeal.target_type || "Dispute Decision"} />
        </div>

        <div className="space-y-1.5 border-t border-border/70 pt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Submitted Grounds & Justification
          </h2>
          <p className="whitespace-pre-wrap rounded-md bg-muted/30 p-3.5 text-xs text-foreground/90 leading-relaxed font-medium border border-border/60">
            {appeal.explanation}
          </p>
        </div>

        {appeal.outcome_reason && (
          <div className="space-y-1.5 border-t border-border/70 pt-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Official Super Admin Governance Determination
            </h2>
            <div className="rounded-md bg-emerald-500/10 p-4 border border-emerald-500/25 text-xs text-foreground leading-relaxed">
              <p className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide text-[11px] mb-1">
                Outcome: {String(appeal.outcome).replaceAll("_", " ")}
              </p>
              <p className="whitespace-pre-wrap">{appeal.outcome_reason}</p>
            </div>
          </div>
        )}
      </section>

      {/* Submitted Evidence */}
      <AppealEvidenceList evidenceReferences={appeal.evidence_references} title="Your Attached Evidence Files" />

      {/* Events / Timeline */}
      <section className="rounded-xl border border-border/80 bg-card p-6 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Procedural Timeline ({events.length})
        </h2>
        <div className="space-y-2">
          {events.map((event: any, idx: number) => (
            <div
              key={`${event.event_type}-${event.created_at}-${idx}`}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs"
            >
              <div className="rounded-full bg-primary/10 p-1.5 text-primary shrink-0 mt-0.5">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="font-bold text-foreground capitalize">
                  {event.event_type.replaceAll("_", " ")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(event.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Info({
  label,
  value,
  highlight,
}: {
  label: string;
  value: unknown;
  highlight?: "pending" | "done";
}) {
  return (
    <div className="rounded-md bg-muted/20 p-3 border border-border/60">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-xs font-bold capitalize truncate ${
          highlight === "pending"
            ? "text-blue-600 dark:text-blue-400"
            : highlight === "done"
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-foreground"
        }`}
      >
        {String(value || "-").replaceAll("_", " ")}
      </p>
    </div>
  );
}

