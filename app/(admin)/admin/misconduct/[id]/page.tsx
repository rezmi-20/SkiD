import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { addMisconductNote, getMisconductReviewDetails, resolveMisconductReview } from "@/lib/actions/governance";
import { MISCONDUCT_REVIEW_OUTCOMES, MISCONDUCT_REVIEW_STATUSES } from "@/lib/governance-constants";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  return value ? new Date(String(value)).toLocaleString() : "Not recorded";
}

export default async function MisconductReviewDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getMisconductReviewDetails(id);
  if (!data) notFound();
  const { review, events } = data;

  async function note(formData: FormData) {
    "use server";
    const result = await addMisconductNote(id, String(formData.get("note") || ""), String(formData.get("status") || "") as any);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/misconduct/${id}`);
  }

  async function resolve(formData: FormData) {
    "use server";
    const result = await resolveMisconductReview(id, String(formData.get("outcome") || "") as any, String(formData.get("reason") || ""));
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/misconduct/${id}`);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <Link href="/admin/misconduct" className="text-xs font-black uppercase tracking-widest text-primary">Back to misconduct reviews</Link>
      <header className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">{review.reference}</p>
        <h1 className="mt-2 text-3xl font-black">{review.full_name}</h1>
        <p className="mt-2 text-sm font-bold text-on-surface-variant">{review.admin_employee_id} - {review.admin_role} - {review.status}</p>
      </header>
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Reason</h2>
        <p className="mt-3 text-sm font-semibold text-on-surface-variant">{review.reason}</p>
        {review.outcome && <p className="mt-3 text-sm font-black">Outcome: {review.outcome}</p>}
      </section>
      {!["resolved", "dismissed"].includes(review.status) && (
        <section className="grid gap-4 lg:grid-cols-2">
          <form action={note} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h2 className="text-sm font-black uppercase tracking-widest">Governance Note</h2>
            <select name="status" defaultValue={review.status} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
              {MISCONDUCT_REVIEW_STATUSES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
            </select>
            <textarea name="note" required rows={4} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
            <button className="h-11 rounded-lg bg-surface-container px-4 text-xs font-black uppercase tracking-widest">Add Note</button>
          </form>
          <form action={resolve} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h2 className="text-sm font-black uppercase tracking-widest">Resolve</h2>
            <select name="outcome" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
              {MISCONDUCT_REVIEW_OUTCOMES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
            </select>
            <textarea name="reason" required rows={4} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
            <button className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Resolve Review</button>
          </form>
        </section>
      )}
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Append-only History</h2>
        <div className="mt-3 space-y-2">
          {events.map((event: any) => (
            <div key={event.id} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
              <p className="font-black uppercase tracking-wider">{String(event.event_type).replaceAll("_", " ")}</p>
              <p className="text-xs font-bold text-on-surface-variant">{formatDate(event.created_at)} - {event.actor_employee_id || "system"}</p>
              {event.note && <p className="mt-2">{event.note}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
