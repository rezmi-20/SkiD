import Link from "next/link";
import { getAuditLogEntries } from "@/lib/actions/governance";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  return value ? new Date(String(value)).toLocaleString() : "Not recorded";
}

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const result = await getAuditLogEntries({
    q: params.q,
    action: params.action,
    module: params.module,
    targetType: params.targetType,
    adminRole: params.adminRole,
    highRiskOnly: params.highRisk === "1",
    page: Number(params.page || 1),
    from: params.from,
    to: params.to,
  });
  const entries = result.entries || [];
  return (
    <div className="space-y-6 pb-16">
      <header>
        <p className="text-xs font-black uppercase tracking-widest text-primary">Governance</p>
        <h1 className="text-3xl font-black text-on-surface">Audit Logs</h1>
      </header>
      <form className="grid gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 md:grid-cols-6">
        <input name="q" defaultValue={params.q || ""} placeholder="Search action, actor, target, reference" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm md:col-span-2" />
        <input name="module" defaultValue={params.module || ""} placeholder="Module" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <input name="targetType" defaultValue={params.targetType || ""} placeholder="Target type" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <input name="from" type="date" defaultValue={params.from || ""} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <input name="to" type="date" defaultValue={params.to || ""} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <label className="flex items-center gap-2 text-xs font-bold">
          <input type="checkbox" name="highRisk" value="1" defaultChecked={params.highRisk === "1"} />
          High-risk only
        </label>
        <button className="rounded-lg bg-surface-container px-4 py-3 text-xs font-black uppercase tracking-widest">Filter</button>
      </form>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-3 border-b border-outline-variant p-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          <span>Timestamp</span>
          <span>Actor</span>
          <span>Action</span>
          <span>Target</span>
          <span>Reference</span>
        </div>
        {entries.length === 0 ? <p className="p-5 text-sm font-bold text-on-surface-variant">No audit entries found.</p> : entries.map((entry: any) => (
          <div key={entry.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-3 border-b border-outline-variant p-3 text-sm">
            <span className="text-xs font-bold">{formatDate(entry.created_at)}</span>
            <span className="min-w-0">
              <span className="block truncate font-bold">{entry.actor_name || entry.actor_employee_id || entry.actor_type || "system"}</span>
              <span className="block text-xs text-on-surface-variant">{entry.actor_role || "system"}</span>
            </span>
            <span>
              <span className="block font-black">{entry.action}</span>
              <span className="block text-xs text-on-surface-variant">{entry.module || "legacy"} {entry.high_risk ? "- high risk" : ""}</span>
            </span>
            <span className="truncate">{entry.target_type || "target"} - {entry.target_id || "none"}</span>
            <span className="truncate">
              {entry.related_reference || "None"}
              {entry.proposed_by_employee_id && <span className="block text-xs text-on-surface-variant">Proposed by {entry.proposed_by_employee_id}</span>}
              {entry.approved_by_employee_id && <span className="block text-xs text-on-surface-variant">Approved by {entry.approved_by_employee_id}</span>}
            </span>
          </div>
        ))}
      </section>
      <div className="flex gap-3">
        {result.page > 1 && <Link href={`/admin/audit?page=${result.page - 1}`} className="text-xs font-black uppercase tracking-widest text-primary">Previous</Link>}
        {entries.length === result.pageSize && <Link href={`/admin/audit?page=${result.page + 1}`} className="text-xs font-black uppercase tracking-widest text-primary">Next</Link>}
      </div>
    </div>
  );
}
