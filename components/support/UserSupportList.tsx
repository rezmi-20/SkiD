import Link from "next/link";

function formatDate(value: unknown) {
  return value ? new Date(String(value)).toLocaleString() : "Not recorded";
}

export default function UserSupportList({ tickets, role }: { tickets: any[]; role: "client" | "worker" }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-sm font-bold text-on-surface-variant">
        No support tickets match this view.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <Link
          key={ticket.id}
          href={`/${role}/support/${ticket.id}`}
          className="block rounded-xl border border-outline-variant bg-surface-container-lowest p-4 transition hover:border-primary/50"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">{ticket.reference}</p>
              <h2 className="mt-1 text-base font-black text-on-surface">{ticket.subject}</h2>
              <p className="mt-1 text-xs font-bold text-on-surface-variant">
                {String(ticket.category).replaceAll("_", " ")} · {ticket.attachment_count ? `${ticket.attachment_count} attachment` : "no attachment"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black uppercase tracking-widest">{String(ticket.status).replaceAll("_", " ")}</p>
              <p className="mt-1 text-[11px] font-bold text-on-surface-variant">{formatDate(ticket.updated_at)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
