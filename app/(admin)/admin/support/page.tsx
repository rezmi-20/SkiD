import Link from "next/link";
import { getAdminSupportTickets } from "@/lib/actions/support";
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Paperclip,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  return value ? new Date(String(value)).toLocaleString() : "Not recorded";
}

function age(value: unknown) {
  if (!value) return "unknown";
  const hours = Math.max(0, Math.floor((Date.now() - new Date(String(value)).getTime()) / 36e5));
  if (hours < 1) return "<1h";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  assigned: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  in_progress: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  awaiting_user: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  escalated: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  closed: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
};

const priorityStyles: Record<string, string> = {
  urgent: "bg-rose-500 text-white font-black animate-pulse",
  high: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30",
  normal: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
  low: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30",
};

export default async function AdminSupportQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const activeStatus = params.status || "open";
  const searchQuery = params.q || "";
  const tickets = await getAdminSupportTickets(activeStatus, searchQuery);

  const statuses = [
    { id: "open", label: "Open (Unassigned)", badge: "Queue" },
    { id: "assigned", label: "Assigned", badge: "Claimed" },
    { id: "in_progress", label: "In Progress", badge: "Active" },
    { id: "awaiting_user", label: "Awaiting User", badge: "Pending" },
    { id: "escalated", label: "Escalated", badge: "Dispute/Verify" },
    { id: "resolved", label: "Resolved", badge: "Done" },
    { id: "closed", label: "Closed", badge: "Archived" },
    { id: "all", label: "All Tickets", badge: "Full" },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#a4fe47] animate-pulse" />
            <p className="text-xs font-black uppercase tracking-widest text-[#a4fe47]">
              User Support Operations
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-1">
            Support Queue & Inbox
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Handle customer tickets, provide fast dispute guidance, and coordinate department escalations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-xl border border-border">
            Total Tickets: <strong className="text-foreground">{tickets.length}</strong>
          </span>
        </div>
      </div>

      {/* ── QUEUE TABS (Clean Horizontal Scrollable Pills) ─────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-border/40">
        {statuses.map((tab) => {
          const isActive = activeStatus === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/admin/support?status=${tab.id}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-[#181d24] text-white shadow-sm ring-1 ring-white/10 dark:bg-[#1e2329]"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#a4fe47]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* ── SEARCH & FILTER CONTROLS ───────────────────────────────────── */}
      <form className="flex flex-col sm:flex-row items-stretch gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            name="q"
            defaultValue={searchQuery}
            placeholder="Search reference, name, email, subject"
            className="w-full rounded-xl border border-border/60 bg-muted/30 pl-10 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
          />
        </div>

        {/* Hidden active status to preserve tab selection while searching */}
        <input type="hidden" name="status" value={activeStatus} />

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-wider text-primary-foreground hover:opacity-90 active:scale-95 transition shadow-sm"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </button>

          {searchQuery && (
            <Link
              href={`/admin/support?status=${activeStatus}`}
              className="px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition"
            >
              Reset
            </Link>
          )}
        </div>
      </form>

      {/* ── TICKETS LIST / TABLE ───────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Table Column Header (Hidden on small mobile) */}
        <div className="hidden md:grid md:grid-cols-[1.3fr_1fr_0.7fr_0.8fr_0.6fr_1fr_auto] gap-3 border-b border-border/60 bg-muted/20 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          <span>Ticket & Subject</span>
          <span>Customer</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Age</span>
          <span>Assigned Staff</span>
          <span className="text-right">Action</span>
        </div>

        {tickets.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <LifeBuoy className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-bold text-foreground">No tickets in this queue.</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? `No results matching "${searchQuery}". Try a different term or clear the filter.`
                : `Currently no tickets marked as "${activeStatus}". Great job!`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {tickets.map((ticket: any) => {
              const statusClass = statusColors[ticket.status] || "bg-zinc-500/10 text-zinc-400";
              const priorityClass = priorityStyles[ticket.priority] || "bg-zinc-500/10 text-zinc-400";

              return (
                <Link
                  key={ticket.id}
                  href={`/admin/support/${ticket.id}`}
                  className="flex flex-col md:grid md:grid-cols-[1.3fr_1fr_0.7fr_0.8fr_0.6fr_1fr_auto] gap-2 md:gap-3 p-4 text-xs transition hover:bg-muted/30 group"
                >
                  {/* Column 1: Ticket Reference & Subject */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-primary text-[11px] tracking-tight">
                        {ticket.reference}
                      </span>
                      {ticket.attachment_count ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                          <Paperclip className="h-2.5 w-2.5" />
                          <span>{ticket.attachment_count}</span>
                        </span>
                      ) : null}
                    </div>
                    <p className="font-bold text-foreground text-sm truncate mt-0.5 group-hover:text-primary transition">
                      {ticket.subject}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase font-semibold">
                      {String(ticket.category).replaceAll("_", " ")}
                    </p>
                  </div>

                  {/* Column 2: Customer Identity */}
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">
                      {ticket.owner_name || ticket.owner_email}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate capitalize">
                      {ticket.owner_role} · {ticket.owner_email}
                    </p>
                  </div>

                  {/* Column 3: Priority */}
                  <div className="flex items-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${priorityClass}`}>
                      {ticket.priority}
                    </span>
                  </div>

                  {/* Column 4: Status */}
                  <div className="flex items-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusClass}`}>
                      {String(ticket.status).replaceAll("_", " ")}
                    </span>
                  </div>

                  {/* Column 5: Age */}
                  <div className="flex items-center text-muted-foreground font-medium text-[11px]">
                    <Clock className="h-3 w-3 mr-1 shrink-0 opacity-70" />
                    <span>{age(ticket.created_at)}</span>
                  </div>

                  {/* Column 6: Assigned Staff */}
                  <div className="min-w-0 flex flex-col justify-center">
                    {ticket.assigned_admin_name ? (
                      <span className="font-bold text-foreground truncate flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{ticket.assigned_admin_name}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded w-fit">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Unassigned</span>
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      {formatDate(ticket.updated_at)}
                    </span>
                  </div>

                  {/* Column 7: Arrow button */}
                  <div className="hidden md:flex items-center justify-end">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition shrink-0">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
