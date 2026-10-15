import Link from "next/link";
import {
  MessageSquare,
  Check,
  CheckCheck,
  Clock,
  Paperclip,
  ChevronRight,
  Headphones,
  User,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

function timeAgo(value: unknown): string {
  if (!value) return "";
  const diff = Date.now() - new Date(String(value)).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function formatDate(value: unknown) {
  if (!value) return "Not recorded";
  return new Date(String(value)).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusBadges: Record<string, { label: string; style: string }> = {
  open: { label: "Ticket Open", style: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  assigned: { label: "Agent Assigned", style: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  in_progress: { label: "Staff Investigating", style: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  awaiting_user: { label: "Action Required", style: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  escalated: { label: "Escalated", style: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  resolved: { label: "Resolved", style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  closed: { label: "Closed", style: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20" },
};

export default function UserSupportList({
  tickets,
  role,
}: {
  tickets: any[];
  role: "client" | "worker";
}) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
          <MessageSquare className="h-6 w-6 opacity-60" />
        </div>
        <h3 className="text-sm font-bold text-foreground">No support tickets match this view</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Need assistance with contracts, payments, or identity verification? Submit a new ticket anytime.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => {
        const isAwaitingUser = ticket.status === "awaiting_user";
        const hasStaffReplied = ticket.last_message_actor_type === "support_admin";
        const isUnreadStaffReply = hasStaffReplied || isAwaitingUser;
        const statusCfg = statusBadges[ticket.status] || {
          label: String(ticket.status).replaceAll("_", " "),
          style: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
        };

        return (
          <Link
            key={ticket.id}
            href={`/${role}/support/${ticket.id}`}
            className={`group relative block rounded-2xl border transition-all duration-200 p-4 sm:p-5 hover:shadow-md active:scale-[0.99] touch-manipulation ${
              isUnreadStaffReply
                ? "bg-card border-emerald-500/40 dark:border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.06)]"
                : "bg-card border-border hover:border-border/80"
            }`}
          >
            <div className="flex items-start gap-3.5">
              {/* Left Indicator Avatar / Status Bubble */}
              <div className="relative shrink-0 mt-0.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${
                    isUnreadStaffReply
                      ? "bg-[#181d24] text-[#a4fe47] ring-2 ring-emerald-500/40 shadow-sm"
                      : "bg-muted/60 text-muted-foreground border border-border"
                  }`}
                >
                  <Headphones className="h-5 w-5 stroke-[2]" />
                </div>
                {/* Glowing Unread Pill */}
                {isUnreadStaffReply && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-card" />
                  </span>
                )}
              </div>

              {/* Central Information */}
              <div className="flex-1 min-w-0">
                {/* Top Row: Ref & Time */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-primary tracking-tight">
                      {ticket.reference}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusCfg.style}`}
                    >
                      {statusCfg.label}
                    </span>
                    {ticket.attachment_count ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                        <Paperclip className="h-3 w-3" />
                        <span>{ticket.attachment_count}</span>
                      </span>
                    ) : null}
                  </div>

                  <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                    {timeAgo(ticket.last_message_at || ticket.updated_at)}
                  </span>
                </div>

                {/* Subject */}
                <h3
                  className={`mt-1.5 text-sm sm:text-base leading-snug truncate transition-colors ${
                    isUnreadStaffReply
                      ? "font-extrabold text-foreground group-hover:text-primary"
                      : "font-bold text-foreground/90 group-hover:text-primary"
                  }`}
                >
                  {ticket.subject}
                </h3>

                {/* WhatsApp / Telegram Style Last Message Preview */}
                <div className="mt-1 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 min-w-0 text-xs">
                    {hasStaffReplied ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold shrink-0 text-[11px]">
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Staff reply:</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground font-medium shrink-0 text-[11px]">
                        <Check className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                        <span>You:</span>
                      </span>
                    )}

                    <p
                      className={`truncate ${
                        isUnreadStaffReply
                          ? "font-bold text-foreground text-xs"
                          : "text-muted-foreground text-xs"
                      }`}
                    >
                      {ticket.last_message_body || "No message content"}
                    </p>
                  </div>

                  {/* Unread Action Prompt Pill */}
                  {isUnreadStaffReply && (
                    <span className="shrink-0 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white dark:bg-emerald-500 dark:text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      <span>New Reply</span>
                    </span>
                  )}
                </div>

                {/* Footer Details: Category & Full Date */}
                <div className="mt-2.5 flex items-center gap-2 text-[10px] text-muted-foreground/80 font-medium border-t border-border/30 pt-2">
                  <span className="capitalize">{String(ticket.category).replaceAll("_", " ")}</span>
                  <span>·</span>
                  <span>Updated {formatDate(ticket.updated_at)}</span>
                </div>
              </div>

              {/* Right Chevron */}
              <div className="hidden sm:flex items-center self-center text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                <ChevronRight className="h-5 w-5" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
