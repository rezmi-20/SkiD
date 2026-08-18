import Link from "next/link";
import { getUserSupportTickets } from "@/lib/actions/support";
import UserSupportList from "@/components/support/UserSupportList";

export const dynamic = "force-dynamic";

export default async function ClientSupportPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const params = await searchParams;
  const tickets = await getUserSupportTickets(params.q || "", params.status || "all");
  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary">Support</p>
          <h1 className="text-3xl font-black text-on-surface">Your Support Tickets</h1>
        </div>
        <Link href="/client/support/new" className="rounded-lg bg-primary px-4 py-3 text-xs font-black uppercase tracking-widest text-on-primary">
          New Ticket
        </Link>
      </header>
      <form className="grid gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 md:grid-cols-[1fr_180px_auto]">
        <input name="q" defaultValue={params.q || ""} placeholder="Search reference or subject" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <select name="status" defaultValue={params.status || "all"} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
          {["all", "open", "assigned", "awaiting_user", "in_progress", "escalated", "resolved", "closed"].map((status) => (
            <option key={status} value={status}>{status.replaceAll("_", " ")}</option>
          ))}
        </select>
        <button className="rounded-lg bg-surface-container px-4 text-xs font-black uppercase tracking-widest">Filter</button>
      </form>
      <UserSupportList tickets={tickets as any[]} role="client" />
    </div>
  );
}
