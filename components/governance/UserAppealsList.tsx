import Link from "next/link";

export default function UserAppealsList({ appeals, role }: { appeals: any[]; role: "client" | "worker" }) {
  if (appeals.length === 0) {
    return <p className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-sm font-bold">No appeals submitted.</p>;
  }
  return (
    <div className="space-y-3">
      {appeals.map((appeal) => (
        <Link key={appeal.id} href={`/${role}/appeals/${appeal.id}`} className="block rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">{appeal.reference}</p>
          <h2 className="mt-1 text-base font-black">{String(appeal.appeal_type).replaceAll("_", " ")}</h2>
          <p className="mt-1 text-xs font-bold text-on-surface-variant">{appeal.status} - {appeal.outcome || "pending"}</p>
        </Link>
      ))}
    </div>
  );
}
