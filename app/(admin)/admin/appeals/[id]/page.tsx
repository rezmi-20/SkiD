import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAppealDetails, reviewAppeal } from "@/lib/actions/governance";
import { APPEAL_OUTCOMES } from "@/lib/governance-constants";

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
      <Link href="/admin/appeals" className="text-xs font-black uppercase tracking-widest text-primary">Back to appeals</Link>
      <header className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">{appeal.reference}</p>
        <h1 className="mt-2 text-3xl font-black">Appeal Review</h1>
        <p className="mt-2 text-sm font-bold text-on-surface-variant">{appeal.status} - {String(appeal.appeal_type).replaceAll("_", " ")}</p>
      </header>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest">Original Decision</h2>
          <p className="mt-3 text-sm font-bold">{appeal.original_decision || "Not recorded"}</p>
          <p className="mt-2 text-sm text-on-surface-variant">{appeal.original_decision_reason || "No reason recorded."}</p>
          <p className="mt-2 text-xs font-bold text-on-surface-variant">Original admin: {appeal.original_employee_id || "Not recorded"}</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest">Appeal</h2>
          <p className="mt-3 text-sm font-bold">{appeal.reason}</p>
          <p className="mt-2 text-sm text-on-surface-variant">{appeal.explanation}</p>
          <p className="mt-2 text-xs font-bold text-on-surface-variant">Appellant: {appeal.appellant_name}</p>
        </div>
      </section>
      {["appeal_requested", "appeal_under_review"].includes(appeal.status) && (
        <form action={resolve} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest">Resolve Appeal</h2>
          <select name="outcome" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
            {APPEAL_OUTCOMES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
          </select>
          <textarea name="reason" required rows={4} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
          <p className="text-xs font-bold text-on-surface-variant">Overturning records a corrective governance event and does not directly mutate unrelated payment/provider records.</p>
          <button className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Resolve Appeal</button>
        </form>
      )}
      <section className="grid gap-4 lg:grid-cols-2">
        <History title="Appeal History" rows={events} />
        <History title="Relevant Audit Events" rows={audit} />
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
