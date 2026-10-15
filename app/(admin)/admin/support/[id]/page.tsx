import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  addSupportInternalNote,
  adminReplySupportTicket,
  changeSupportPriority,
  claimSupportTicket,
  closeSupportTicket,
  escalateSupportSafety,
  escalateSupportToDispute,
  escalateSupportToVerification,
  getAdminSupportTicketDetails,
  resolveSupportTicket,
} from "@/lib/actions/support";
import { SUPPORT_PRIORITIES, SUPPORT_RESOLUTION_TYPES } from "@/lib/support-constants";
import AdminSupportChat from "@/components/support/AdminSupportChat";
import {
  ArrowLeft,
  Send,
  Lock,
  AlertCircle,
  FileText,
  User,
  Headphones,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ChevronRight,
  LifeBuoy,
  Paperclip,
  ShieldCheck,
  AlertTriangle,
  FolderSync,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  if (!value) return "Not recorded";
  return new Date(String(value)).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

function fullDate(value: unknown) {
  if (!value) return "Not recorded";
  return new Date(String(value)).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusBadgeStyles: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  assigned: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  awaiting_user: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  escalated: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  resolved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  closed: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
};

const priorityStyles: Record<string, string> = {
  urgent: "bg-rose-500 text-white font-black animate-pulse shadow-sm",
  high: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30",
  normal: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
  low: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30",
};

export default async function AdminSupportDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const { error: queryError, success: querySuccess } = await searchParams;
  const data = await getAdminSupportTicketDetails(id);
  if (!data) notFound();
  const { ticket, messages, events, notes, attachments, canOperate, canReadOnly } = data;

  const isAssigned = Boolean(ticket.assigned_admin_id);
  const isTerminal = ["resolved", "closed"].includes(ticket.status);

  async function claim(formData: FormData) {
    "use server";
    const result = await claimSupportTicket(id, Number(formData.get("assignmentVersion") || 0), String(formData.get("reason") || ""));
    if (!result.success) {
      redirect(`/admin/support/${id}?error=${encodeURIComponent(result.error || "Claim failed")}`);
    }
    redirect(`/admin/support/${id}`);
  }

  async function priority(formData: FormData) {
    "use server";
    const result = await changeSupportPriority(id, String(formData.get("priority") || "normal") as any, String(formData.get("reason") || ""));
    if (!result.success) {
      redirect(`/admin/support/${id}?error=${encodeURIComponent(result.error || "Priority change failed")}`);
    }
    redirect(`/admin/support/${id}`);
  }

  async function reply(formData: FormData) {
    "use server";
    const result = await adminReplySupportTicket(id, String(formData.get("message") || ""), Boolean(formData.get("awaitUser")));
    if (!result.success) {
      redirect(`/admin/support/${id}?error=${encodeURIComponent(result.error || "Reply failed")}`);
    }
    redirect(`/admin/support/${id}`);
  }

  async function note(formData: FormData) {
    "use server";
    const result = await addSupportInternalNote(id, String(formData.get("note") || ""));
    if (!result.success) {
      redirect(`/admin/support/${id}?error=${encodeURIComponent(result.error || "Note failed")}`);
    }
    redirect(`/admin/support/${id}`);
  }

  async function escalateVerification(formData: FormData) {
    "use server";
    const result = await escalateSupportToVerification(id, String(formData.get("reason") || ""));
    if (!result.success) {
      redirect(`/admin/support/${id}?error=${encodeURIComponent(result.error || "Escalation failed")}`);
    }
    redirect(`/admin/support/${id}`);
  }

  async function escalateDispute(formData: FormData) {
    "use server";
    const result = await escalateSupportToDispute(id, String(formData.get("reason") || ""));
    if (!result.success) {
      redirect(`/admin/support/${id}?error=${encodeURIComponent(result.error || "Escalation failed")}`);
    }
    redirect(`/admin/support/${id}`);
  }

  async function escalateSafety(formData: FormData) {
    "use server";
    const result = await escalateSupportSafety(id, String(formData.get("reason") || ""));
    if (!result.success) {
      redirect(`/admin/support/${id}?error=${encodeURIComponent(result.error || "Escalation failed")}`);
    }
    redirect(`/admin/support/${id}`);
  }

  async function resolve(formData: FormData) {
    "use server";
    const result = await resolveSupportTicket(id, String(formData.get("resolutionType") || "") as any, String(formData.get("summary") || ""));
    if (!result.success) {
      redirect(`/admin/support/${id}?error=${encodeURIComponent(result.error || "Resolution failed")}`);
    }
    redirect(`/admin/support/${id}`);
  }

  async function close() {
    "use server";
    const result = await closeSupportTicket(id);
    if (!result.success) {
      redirect(`/admin/support/${id}?error=${encodeURIComponent(result.error || "Close failed")}`);
    }
    redirect(`/admin/support/${id}`);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-24 animate-in fade-in duration-300">
      
      {/* ── BREADCRUMB & HEADER COMMAND BAR ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <Link
            href="/admin/support"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Support Queue</span>
          </Link>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg tracking-tight">
              {ticket.reference}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusBadgeStyles[ticket.status] || "bg-zinc-500/10 text-zinc-400"}`}>
              {String(ticket.status).replaceAll("_", " ")}
            </span>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${priorityStyles[ticket.priority] || "bg-zinc-500/10 text-zinc-400"}`}>
              {ticket.priority} priority
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              Category: <strong className="text-foreground capitalize">{String(ticket.category).replaceAll("_", " ")}</strong>
            </span>
          </div>

          <h1 className="mt-2 text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {ticket.subject}
          </h1>
        </div>

        {/* Quick Action Header Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {canOperate && !isAssigned && !isTerminal && (
            <form action={claim}>
              <input type="hidden" name="assignmentVersion" value={ticket.assignment_version} />
              <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-wider text-primary-foreground hover:opacity-90 active:scale-95 shadow-md transition">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Claim Ticket Now</span>
              </button>
            </form>
          )}

          {canOperate && isAssigned && !isTerminal && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-xl border border-border">
                Assigned: <strong className="text-foreground">{ticket.assigned_admin_name || "You"}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Query error/success alerts */}
      {queryError && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-bold text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{queryError}</span>
        </div>
      )}

      {/* Super Admin Read-Only Notice */}
      {canReadOnly && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2.5 shadow-sm">
          <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
          <span>Super admin oversight mode. Operational support actions are read-only here.</span>
        </div>
      )}

      {/* ── MAIN WORKSPACE GRID (Left 8 cols, Right 4 cols) ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN: Issue Context & Live Conversation ─────────── */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          
          {/* Card 1: User Request & Context Banner */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#181d24] text-white flex items-center justify-center font-bold text-sm">
                  {ticket.owner_name ? ticket.owner_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-foreground text-sm">
                      {ticket.owner_name || ticket.owner_email}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                      {ticket.owner_role}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{ticket.owner_email}</p>
                </div>
              </div>

              <div className="text-right text-xs text-muted-foreground">
                <span className="block font-semibold">Submitted</span>
                <span>{fullDate(ticket.created_at)}</span>
              </div>
            </div>

            {/* Ticket Description */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Original Customer Statement
              </span>
              <p className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap bg-muted/20 p-3.5 rounded-xl border border-border/40">
                {ticket.description}
              </p>
            </div>

            {/* Related Context Chips (Job, Contract, Payment) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {ticket.job_title && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/60">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span className="text-muted-foreground font-medium">Job:</span>
                  <span className="font-bold text-foreground truncate max-w-[200px]">{ticket.job_title}</span>
                </div>
              )}
              {ticket.related_contract_id && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/60">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-muted-foreground font-medium">Contract:</span>
                  <span className="font-mono font-bold text-foreground truncate">{ticket.related_contract_id.slice(0, 8)}...</span>
                </div>
              )}
              {ticket.payment_status && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-muted-foreground font-medium">Payment:</span>
                  <span className="font-bold text-foreground capitalize">{ticket.payment_status}</span>
                </div>
              )}
            </div>

            {/* Uploaded Customer Attachments */}
            {attachments.length > 0 && (
              <div className="pt-2 border-t border-border/40">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                  Uploaded Evidence & Documents ({attachments.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((item: any) => (
                    <a
                      key={item.id}
                      href={`/api/support/${ticket.id}/attachments/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3.5 py-2 text-xs font-bold text-primary hover:bg-muted/70 transition shadow-sm"
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      <span>{item.file_name || "Attachment"}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">({item.mime_type})</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Live Conversation Thread with Customer */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <AdminSupportChat
              ticketId={ticket.id}
              initialMessages={messages}
              ticketStatus={ticket.status}
              isAssigned={isAssigned}
              canOperate={canOperate}
              isTerminal={isTerminal}
              ownerName={ticket.owner_name}
              assignmentVersion={ticket.assignment_version}
              claimAction={claim}
            />
            
            {/* Required Security Warning */}
            <p className="text-[11px] text-muted-foreground font-medium pt-2 border-t border-border/40">
              Never request or record passwords, verification codes, full FIN, or payment credentials.
            </p>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Staff Notes & Operational Controls ───────── */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          
          {/* Card 1: Internal Staff Notes (Restricted & Secure) */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Lock className="h-4 w-4" />
                <h2 className="text-xs font-black uppercase tracking-wider">
                  Internal Notes (Staff Only)
                </h2>
              </div>
              <span className="text-[10px] font-bold text-amber-700/80 dark:text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded">
                Hidden from User
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Staff notes and investigation logs are completely private and never visible to the client or worker.
            </p>

            {/* Notes Stream */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground/60 italic rounded-xl bg-background/50 border border-amber-500/10">
                  No internal notes recorded yet.
                </div>
              ) : (
                notes.map((item: any, i: number) => (
                  <div
                    key={`${item.admin_name}-${item.created_at}-${i}`}
                    className="rounded-xl bg-card border border-amber-500/20 p-3 text-xs space-y-1 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                      <span className="text-foreground font-black">{item.admin_name}</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap font-medium">{item.note}</p>
                  </div>
                ))
              )}
            </div>

            {/* Note Composer */}
            {canOperate && !isTerminal && (
              <form action={note} className="space-y-2 pt-2 border-t border-amber-500/20">
                <textarea
                  name="note"
                  required
                  rows={2}
                  placeholder="Record private staff observation or investigation..."
                  className="w-full rounded-xl border border-border bg-card p-3 text-xs outline-none focus:border-amber-500 transition text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#181d24] text-white hover:bg-[#252b35] dark:bg-[#1e2329] px-4 py-2 text-xs font-black uppercase tracking-wider transition w-full shadow-sm"
                >
                  Add Private Staff Note
                </button>
              </form>
            )}
          </div>

          {/* Card 2: Operational Controls (Priority, Resolution, Escalations) */}
          {canOperate && !isTerminal && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                Ticket Controls & Actions
              </h2>

              {/* Priority Update */}
              <form action={priority} className="space-y-2.5 bg-muted/20 p-3.5 rounded-xl border border-border/40">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Ticket Priority
                  </label>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${priorityStyles[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="flex gap-2">
                  <select
                    name="priority"
                    defaultValue={ticket.priority}
                    className="rounded-xl border border-border bg-card p-2.5 text-xs font-bold text-foreground flex-grow outline-none focus:border-primary"
                  >
                    {SUPPORT_PRIORITIES.map((val) => (
                      <option key={val} value={val}>
                        {val.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <button className="rounded-xl bg-[#181d24] text-white dark:bg-[#1e2329] px-4 py-2 text-xs font-black uppercase hover:opacity-90 transition">
                    Update
                  </button>
                </div>
                <input
                  type="text"
                  name="reason"
                  required
                  placeholder="Reason for priority change..."
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
              </form>

              {/* Resolution Form */}
              <form action={resolve} className="space-y-2.5 bg-emerald-500/5 p-3.5 rounded-xl border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <label className="text-[10px] font-black uppercase tracking-wider">
                    Resolve Ticket
                  </label>
                </div>
                <select
                  name="resolutionType"
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-bold text-foreground outline-none focus:border-emerald-500"
                >
                  {SUPPORT_RESOLUTION_TYPES.map((val) => (
                    <option key={val} value={val}>
                      {val.replaceAll("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
                <textarea
                  name="summary"
                  required
                  rows={2}
                  placeholder="Resolution summary to be presented to customer..."
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  Confirm & Resolve Ticket
                </button>
              </form>

              {/* Department Escalations Accordion */}
              <details className="rounded-xl border border-border/60 bg-muted/10 p-3 text-xs group">
                <summary className="font-bold text-primary cursor-pointer select-none flex items-center justify-between">
                  <span>Escalate to Another Department</span>
                  <span className="group-open:rotate-180 transition-transform text-muted-foreground">▼</span>
                </summary>
                
                <div className="space-y-3 mt-3 pt-3 border-t border-border/40">
                  <form action={escalateVerification} className="space-y-1.5 p-2 rounded-lg bg-card border border-border">
                    <span className="font-bold text-[10px] uppercase text-muted-foreground block">Verification Department</span>
                    <input name="reason" required placeholder="Reason for verification review..." className="w-full rounded-lg border border-border bg-muted/20 p-2 text-xs" />
                    <button className="rounded-lg bg-muted hover:bg-muted/80 text-foreground py-1.5 text-[10px] font-black uppercase w-full">Escalate to Verification</button>
                  </form>

                  <form action={escalateDispute} className="space-y-1.5 p-2 rounded-lg bg-card border border-border">
                    <span className="font-bold text-[10px] uppercase text-muted-foreground block">Disputes & Payments Department</span>
                    <input name="reason" required placeholder="Reason for dispute review..." className="w-full rounded-lg border border-border bg-muted/20 p-2 text-xs" />
                    <button className="rounded-lg bg-muted hover:bg-muted/80 text-foreground py-1.5 text-[10px] font-black uppercase w-full">Escalate to Dispute</button>
                  </form>

                  <form action={escalateSafety} className="space-y-1.5 p-2 rounded-lg bg-card border border-border">
                    <span className="font-bold text-[10px] uppercase text-muted-foreground block">Trust & Safety Department</span>
                    <input name="reason" required placeholder="Reason for safety review..." className="w-full rounded-lg border border-border bg-muted/20 p-2 text-xs" />
                    <button className="rounded-lg bg-muted hover:bg-muted/80 text-foreground py-1.5 text-[10px] font-black uppercase w-full">Escalate to Safety</button>
                  </form>
                </div>
              </details>
            </div>
          )}

          {/* Close Action (When Resolved) */}
          {canOperate && ticket.status === "resolved" && (
            <form action={close} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 space-y-2 shadow-sm">
              <h3 className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                Permanent Ticket Closure
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Once closed, the ticket is archived and the user will not be able to reply.
              </p>
              <button
                type="submit"
                className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-black uppercase tracking-wider text-red-600 hover:bg-red-500/20 transition"
              >
                Permanently Close Ticket
              </button>
            </form>
          )}

          {/* Audit History Card */}
          <details className="group rounded-2xl border border-border bg-card p-4 shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground select-none">
              <span>Audit Trail History ({events.length})</span>
              <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-3 space-y-2 pt-2 border-t border-border/40 max-h-56 overflow-y-auto">
              {events.map((event: any, i: number) => (
                <div key={`${event.event_type}-${event.created_at}-${i}`} className="flex items-center justify-between text-xs py-1 border-b border-border/20 last:border-none">
                  <div>
                    <span className="font-bold text-foreground">{String(event.event_type).replaceAll("_", " ").toUpperCase()}</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5">by {event.actor_type}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{formatDate(event.created_at)}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
