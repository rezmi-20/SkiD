import Link from "next/link";
import { getUserSupportTickets } from "@/lib/actions/support";
import UserSupportList from "@/components/support/UserSupportList";
import { LifeBuoy, Plus, Search, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const tickets = await getUserSupportTickets(params.q || "", params.status || "all");

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary tracking-wide uppercase mb-1.5">
            <LifeBuoy className="h-3.5 w-3.5" />
            Support & Help Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Your Support Tickets
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Get help with contracts, identity verification, payments, or report platform issues.
          </p>
        </div>
        <Link
          href="/client/support/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Ticket</span>
        </Link>
      </header>

      <form className="flex flex-col sm:flex-row items-stretch gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            name="q"
            defaultValue={params.q || ""}
            placeholder="Search reference or subject"
            className="w-full rounded-xl border border-border/60 bg-muted/30 pl-10 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={params.status || "all"}
            className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary transition"
          >
            {["all", "open", "assigned", "awaiting_user", "in_progress", "escalated", "resolved", "closed"].map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All Statuses" : status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground hover:bg-secondary/80 active:scale-95 transition"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </form>

      <UserSupportList tickets={tickets as any[]} role="client" />
    </div>
  );
}

