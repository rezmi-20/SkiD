import Link from "next/link";
import { getAppealsForReview } from "@/lib/actions/governance";

export const dynamic = "force-dynamic";

export default async function AdminAppealsPage() {
  const appeals = await getAppealsForReview();
  return (
    <div className="space-y-6 pb-16">
      <header>
        <p className="text-xs font-black uppercase tracking-widest text-primary">Governance</p>
        <h1 className="text-3xl font-black text-on-surface">Appeals</h1>
      </header>
      <div className="space-y-3">
        {appeals.length === 0 ? <p className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-sm font-bold">No appeals pending.</p> : appeals.map((appeal: any) => (
          <Link key={appeal.id} href={`/admin/appeals/${appeal.id}`} className="block rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">{appeal.reference}</p>
            <h2 className="mt-1 text-base font-black">{String(appeal.appeal_type).replaceAll("_", " ")}</h2>
            <p className="mt-1 text-xs font-bold text-on-surface-variant">
              {appeal.status} - {appeal.appellant_name} - original admin {appeal.original_employee_id || "not recorded"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
