import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAppealDetails, reviewAppeal } from "@/lib/actions/governance";
import { APPEAL_OUTCOMES } from "@/lib/governance-constants";

import AppealEvidenceList from "@/components/governance/AppealEvidenceList";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  return value ? new Date(String(value)).toLocaleString() : "Not recorded";
}

export default async function AdminAppealDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAppealDetails(id);
  if (!data) notFound();
  const { appeal, events, audit } = data;

  async function resolve(formData: FormData) {
    "use server";
    const result = await reviewAppeal(id, String(formData.get("outcome") || "") as any, String(formData.get("reason") || ""));
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/appeals/${id}`);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <Link href="/admin/appeals" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
        ← Back to appeals queue
      </Link>
      <header className="rounded-xl border border-border/80 bg-card p-6 shadow-2xs space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary tracking-wide uppercase">
          {appeal.reference}
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">Independent Governance Appeal Review</h1>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Status: <span className="text-foreground">{appeal.status}</span> · Category: <span className="text-foreground">{String(appeal.appeal_type).replaceAll("_", " ")}</span>
        </p>
      </header>

      {/* Case Details */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Original Decision Under Appeal</h2>
          <div className="rounded-md bg-muted/30 p-3 border border-border/60">
            <p className="text-sm font-bold text-foreground capitalize">{String(appeal.original_decision || "Not recorded").replaceAll("_", " ")}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{appeal.original_decision_reason || "No reason recorded."}</p>
          </div>
          <p className="text-[11px] font-medium text-muted-foreground">Original Adjudicator ID: <span className="font-mono text-foreground">{appeal.original_employee_id || "Unassigned / Platform"}</span></p>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Appellant Grounds & Narrative</h2>
          <div className="rounded-md bg-muted/30 p-3 border border-border/60">
            <p className="text-sm font-bold text-foreground capitalize">{String(appeal.reason || "Appeal").replaceAll("_", " ")}</p>
            <p className="mt-1 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">{appeal.explanation}</p>
          </div>
          <p className="text-[11px] font-medium text-muted-foreground">Appellant: <span className="font-semibold text-foreground">{appeal.appellant_name}</span> ({appeal.appellant_email})</p>
        </div>
      </section>

      {/* Submitted Evidence Section */}
      <AppealEvidenceList appealId={appeal.id} evidenceReferences={appeal.evidence_references} title="Appellant Submitted Evidence Files" />

      {/* Decision / Adjudication Form */}
      {["appeal_requested", "appeal_under_review"].includes(appeal.status) && (
        <form action={resolve} className="space-y-4 rounded-xl border border-border/80 bg-card p-6 shadow-2xs">
          <div className="space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Render Super Admin Governance Ruling</h2>
            <p className="text-xs text-muted-foreground">
              Review the grounds and submitted evidence above. Choose a final determination and provide an official governance justification.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Determination Outcome</label>
            <select name="outcome" className="w-full rounded-md border border-input bg-background p-2.5 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary">
              {APPEAL_OUTCOMES.map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Official Adjudication Reason & Findings</label>
            <textarea
              name="reason"
              required
              rows={4}
              placeholder="State the factual basis and platform policy grounds for upholding, overturning, or returning this case..."
              className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>

          <p className="text-[11px] text-muted-foreground italic">
            Overturning records a corrective governance event and does not directly mutate unrelated payment/provider records.
          </p>

          <button className="h-9 inline-flex items-center justify-center rounded-md bg-primary px-5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs">
            Submit Governance Ruling
          </button>
        </form>
      )}

      {/* Events & Audit Logs */}
      <section className="grid gap-4 lg:grid-cols-2">
        <History title="Appeal Event Timeline" rows={events} />
        <History title="Related Audit Ledger Events" rows={audit} />
      </section>
    </div>
  );
}

function History({ title, rows }: { title: string; rows: any[] }) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
      <h2 className="text-sm font-black uppercase tracking-widest">{title}</h2>
      <div className="mt-3 space-y-2">
        {rows.length === 0 ? <p className="text-sm font-bold text-on-surface-variant">No entries.</p> : rows.map((row: any) => (
          <div key={row.id} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
            <p className="font-black uppercase tracking-wider">{String(row.event_type || row.action).replaceAll("_", " ")}</p>
            <p className="text-xs font-bold text-on-surface-variant">{formatDate(row.created_at)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
