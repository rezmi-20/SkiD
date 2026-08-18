import Link from "next/link";
import { getMisconductReviews, getMisuseIndicators, openMisconductReview } from "@/lib/actions/governance";

export const dynamic = "force-dynamic";

export default async function MisconductReviewsPage() {
  const [reviews, indicators] = await Promise.all([getMisconductReviews(), getMisuseIndicators()]);

  async function open(formData: FormData) {
    "use server";
    const result = await openMisconductReview(
      String(formData.get("employeeId") || ""),
      String(formData.get("reason") || ""),
      String(formData.get("auditIds") || "").split(",").map((v) => v.trim()).filter(Boolean),
    );
    if (!result.success) throw new Error(result.error);
  }

  return (
    <div className="space-y-6 pb-16">
      <header>
        <p className="text-xs font-black uppercase tracking-widest text-primary">Governance</p>
        <h1 className="text-3xl font-black text-on-surface">Administrator Misconduct Reviews</h1>
      </header>
      <form action={open} className="grid gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
        <input name="employeeId" required placeholder="Admin employee UUID" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <input name="auditIds" placeholder="Audit IDs, comma separated" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <input name="reason" required placeholder="Review reason" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <button className="rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Open</button>
      </form>
      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Misuse Indicators</h2>
        <div className="mt-3 space-y-2">
          {indicators.map((row: any) => (
            <div key={row.id} className="grid gap-3 rounded-lg border border-outline-variant bg-surface-container p-3 text-sm md:grid-cols-5">
              <span className="font-black">{row.admin_employee_id}</span>
              <span>{row.full_name}</span>
              <span>{row.admin_role}</span>
              <span>{row.misuse_flag}</span>
              <span className="text-xs text-on-surface-variant">{row.id}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        {reviews.length === 0 ? <p className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-sm font-bold">No governance reviews.</p> : reviews.map((review: any) => (
          <Link key={review.id} href={`/admin/misconduct/${review.id}`} className="block rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">{review.reference}</p>
            <h2 className="mt-1 text-base font-black">{review.full_name} - {review.admin_employee_id}</h2>
            <p className="mt-1 text-xs font-bold text-on-surface-variant">{review.status} - {review.outcome || "no outcome"}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
