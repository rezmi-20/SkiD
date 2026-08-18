import Link from "next/link";
import { getAdminSupportTickets } from "@/lib/actions/support";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  return value ? new Date(String(value)).toLocaleString() : "Not recorded";
}

function age(value: unknown) {
  if (!value) return "unknown";
  const hours = Math.max(0, Math.floor((Date.now() - new Date(String(value)).getTime()) / 36e5));
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default async function AdminSupportQueuePage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams;
  const tickets = await getAdminSupportTickets(params.status || "open", params.q || "");
  const statuses = ["open", "assigned", "awaiting_user", "in_progress", "escalated", "resolved", "closed", "all"];

  return (
    <div className="space-y-6 pb-16">
      <header>
        <p className="text-xs font-black uppercase tracking-widest text-primary">User Support Admin</p>
        <h1 className="text-3xl font-black text-on-surface">Support Queue</h1>
      </header>

      <form className="grid gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 md:grid-cols-[1fr_180px_auto]">
        <input name="q" defaultValue={params.q || ""} placeholder="Search reference, name, email, subject" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <select name="status" defaultValue={params.status || "open"} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
          {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
        </select>
        <button className="rounded-lg bg-surface-container px-4 text-xs font-black uppercase tracking-widest">Filter</button>
      </form>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="grid grid-cols-[1.2fr_1fr_0.7fr_0.7fr_0.8fr_0.8fr] gap-3 border-b border-outline-variant p-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          <span>Ticket</span>
          <span>User</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Age</span>
          <span>Assigned</span>
        </div>
        {tickets.length === 0 ? (
          <p className="p-5 text-sm font-bold text-on-surface-variant">No tickets in this queue.</p>
        ) : tickets.map((ticket: any) => (
          <Link key={ticket.id} href={`/admin/support/${ticket.id}`} className="grid grid-cols-[1.2fr_1fr_0.7fr_0.7fr_0.8fr_0.8fr] gap-3 border-b border-outline-variant p-3 text-sm transition hover:bg-surface-container">
            <span>
              <span className="block font-black">{ticket.reference}</span>
              <span className="block truncate text-xs font-bold text-on-surface-variant">{ticket.subject}</span>
              <span className="block text-[11px] font-bold text-on-surface-variant">{String(ticket.category).replaceAll("_", " ")} · {ticket.attachment_count ? "has attachment" : "no attachment"}</span>
            </span>
            <span className="min-w-0">
              <span className="block truncate font-bold">{ticket.owner_name || ticket.owner_email}</span>
              <span className="block truncate text-xs text-on-surface-variant">{ticket.owner_role} · {ticket.owner_email}</span>
            </span>
            <span className="font-bold">{ticket.priority}</span>
            <span className="font-bold">{String(ticket.status).replaceAll("_", " ")}</span>
            <span className="font-bold">{age(ticket.created_at)}</span>
            <span className="truncate text-xs font-bold text-on-surface-variant">{ticket.assigned_admin_name || "Unassigned"}<br />{formatDate(ticket.updated_at)}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
