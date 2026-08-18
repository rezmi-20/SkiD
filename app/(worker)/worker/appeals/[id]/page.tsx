import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserAppealDetails } from "@/lib/actions/governance";

export const dynamic = "force-dynamic";

export default async function WorkerAppealDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const details = await getUserAppealDetails(id);
  if (!details) notFound();
  const { appeal, events } = details;
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <Link href="/worker/appeals" className="text-xs font-black uppercase tracking-widest text-primary">Back to appeals</Link>
      <header>
        <p className="text-xs font-black uppercase tracking-widest text-primary">{appeal.reference}</p>
        <h1 className="text-3xl font-black">Appeal History</h1>
      </header>
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <Info label="Type" value={appeal.appeal_type} />
          <Info label="Status" value={appeal.status} />
          <Info label="Original Decision" value={appeal.target_id} />
          <Info label="Reason" value={appeal.reason} />
          <Info label="Outcome" value={appeal.outcome || "Pending"} />
          <Info label="Resolved" value={appeal.resolved_at ? new Date(appeal.resolved_at).toLocaleString() : "Pending"} />
        </div>
        <div className="mt-5 space-y-2">
          <h2 className="text-sm font-black uppercase tracking-widest">Explanation</h2>
          <p className="whitespace-pre-wrap text-sm font-medium text-on-surface-variant">{appeal.explanation}</p>
          {appeal.outcome_reason ? <p className="whitespace-pre-wrap text-sm font-bold">{appeal.outcome_reason}</p> : null}
        </div>
      </section>
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Events</h2>
        <div className="mt-4 space-y-2">
          {events.map((event: any) => (
            <div key={`${event.event_type}-${event.created_at}`} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
              <p className="font-black">{event.event_type.replaceAll("_", " ")}</p>
              <p className="text-xs font-bold text-on-surface-variant">{new Date(event.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-1 font-bold">{String(value || "-").replaceAll("_", " ")}</p>
    </div>
  );
}
