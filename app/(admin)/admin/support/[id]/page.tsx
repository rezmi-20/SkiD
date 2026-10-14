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

  const statusColors: Record<string, string> = {
    open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    assigned: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    in_progress: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    awaiting_user: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    escalated: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    resolved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    closed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Navigation & Header */}
      <div>
        <Link
          href="/admin/support"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to support queue
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-black uppercase tracking-widest text-primary">
                {ticket.reference}
              </span>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusColors[ticket.status] || "bg-zinc-500/10 text-zinc-400"}`}>
                {String(ticket.status).replaceAll("_", " ")}
              </span>
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                {ticket.priority} priority
              </span>
              <span className="text-xs text-on-surface-variant font-medium">
                Category: {String(ticket.category).replaceAll("_", " ")}
              </span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-black text-on-surface tracking-tight">
              {ticket.subject}
            </h1>
          </div>

          {/* Quick claim if unassigned */}
          {canOperate && !isAssigned && !isTerminal && (
            <form action={claim} className="flex items-center gap-2">
              <input type="hidden" name="assignmentVersion" value={ticket.assignment_version} />
              <button className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-on-primary hover:opacity-90 shadow-sm transition">
                <span>Claim Ticket Now</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Query alerts */}
      {queryError && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-bold text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{queryError}</span>
        </div>
      )}

      {/* Super Admin Read-Only Notice */}
      {canReadOnly && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-bold text-amber-700 dark:text-amber-300">
          Super admin oversight mode. Operational support actions are read-only here.
        </div>
      )}

      {/* Clean Metadata Ribbon (No heavy boxes) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-outline-variant/40 text-xs">
        <div>
          <span className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Client / User</span>
          <span className="mt-1 block font-bold text-on-surface">{ticket.owner_name || ticket.owner_email}</span>
          <span className="text-[11px] text-on-surface-variant">{ticket.owner_role} · {ticket.owner_email}</span>
        </div>
        <div>
          <span className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Assigned Agent</span>
          <span className="mt-1 block font-bold text-on-surface">{ticket.assigned_admin_name || "Unassigned"}</span>
          <span className="text-[11px] text-on-surface-variant">Version {ticket.assignment_version}</span>
        </div>
        <div>
          <span className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Related Job</span>
          <span className="mt-1 block font-bold text-on-surface">{ticket.job_title || ticket.related_job_id || "None"}</span>
          <span className="text-[11px] text-on-surface-variant">Payment: {ticket.payment_status || "Not linked"}</span>
        </div>
        <div>
          <span className="block text-[10px] font-black uppercase tracking-wider text-on-surface-variant">Created</span>
          <span className="mt-1 block font-bold text-on-surface">{formatDate(ticket.created_at)}</span>
          <span className="text-[11px] text-on-surface-variant">Provider: {ticket.chapa_status || "Not linked"}</span>
        </div>
      </div>

      {/* Submitted Request Description */}
      <div className="rounded-xl bg-surface-container-low/50 border border-outline-variant/40 p-4 space-y-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          Original User Request
        </span>
        <p className="text-sm font-medium text-on-surface leading-relaxed whitespace-pre-wrap">
          {ticket.description}
        </p>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="pt-2 border-t border-outline-variant/30 flex flex-wrap gap-2">
            {attachments.map((item: any) => (
              <a
                key={item.id}
                href={`/api/support/${ticket.id}/attachments/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/60 bg-surface-container px-3 py-1.5 text-xs font-bold text-primary hover:bg-surface-container-high transition"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{item.file_name || "Attachment"}</span>
                <span className="text-[10px] text-on-surface-variant font-normal">({item.mime_type})</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Conversation & Operational Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Real-Time Conversational Chat */}
        <div className="lg:col-span-2">
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
          {/* Compliance note: Never request or record passwords, verification codes, full FIN, or payment credentials. */}
        </div>

        {/* Right Column: Internal Notes & Operational Controls */}
        <div className="space-y-6">
          {/* Private Internal Notes (Yellow / Amber card for Staff Eyes Only) */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Lock className="h-4 w-4" />
              <h2 className="text-xs font-black uppercase tracking-wider">Internal Notes (Staff Only)</h2>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Private notes are never visible to clients or workers.
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <p className="text-xs text-on-surface-variant/60 py-2">No internal notes yet.</p>
              ) : (
                notes.map((item: any, i: number) => (
                  <div key={`${item.admin_name}-${item.created_at}-${i}`} className="rounded-lg bg-surface-container-lowest border border-amber-500/20 p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-on-surface-variant">
                      <span>{item.admin_name}</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                    <p className="text-on-surface whitespace-pre-wrap">{item.note}</p>
                  </div>
                ))
              )}
            </div>

            {canOperate && !isTerminal && (
              <form action={note} className="space-y-2 pt-2 border-t border-amber-500/20">
                <textarea
                  name="note"
                  required
                  rows={2}
                  placeholder="Add private staff note..."
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 text-xs outline-none focus:border-primary"
                />
                <button className="rounded-lg bg-surface-container-high px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-on-surface hover:bg-surface-container-highest transition w-full">
                  Add Private Note
                </button>
              </form>
            )}
          </div>

          {/* Operational Actions (Claim / Reassign, Priority, Resolution, Escalation) */}
          {canOperate && !isTerminal && (
            <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-wider text-on-surface">Ticket Controls</h2>

              {/* Priority */}
              <form action={priority} className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-on-surface-variant">Update Priority</label>
                <div className="flex gap-2">
                  <select name="priority" defaultValue={ticket.priority} className="rounded-lg border border-outline-variant bg-surface-container p-2 text-xs font-medium text-on-surface flex-grow">
                    {SUPPORT_PRIORITIES.map((val) => (
                      <option key={val} value={val}>{val.toUpperCase()}</option>
                    ))}
                  </select>
                  <button className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-bold uppercase text-on-surface hover:bg-surface-container">
                    Update
                  </button>
                </div>
                <input type="text" name="reason" required placeholder="Reason for change..." className="w-full rounded-lg border border-outline-variant bg-surface-container p-2 text-xs" />
              </form>

              {/* Resolve */}
              <form action={resolve} className="space-y-2 pt-3 border-t border-outline-variant/40">
                <label className="text-[11px] font-bold uppercase text-on-surface-variant">Resolve Ticket</label>
                <select name="resolutionType" className="w-full rounded-lg border border-outline-variant bg-surface-container p-2 text-xs font-medium text-on-surface">
                  {SUPPORT_RESOLUTION_TYPES.map((val) => (
                    <option key={val} value={val}>{val.replaceAll("_", " ").toUpperCase()}</option>
                  ))}
                </select>
                <textarea name="summary" required rows={2} placeholder="Resolution summary for customer..." className="w-full rounded-lg border border-outline-variant bg-surface-container p-2 text-xs" />
                <button className="w-full rounded-lg bg-emerald-600 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-700 transition">
                  Resolve Ticket
                </button>
              </form>

              {/* Escalations Drawer */}
              <details className="pt-2 border-t border-outline-variant/40 text-xs">
                <summary className="font-bold cursor-pointer text-primary">Department Escalations</summary>
                <div className="space-y-3 mt-3">
                  <form action={escalateVerification} className="space-y-1.5">
                    <span className="font-bold text-[10px] uppercase text-on-surface-variant">Escalate to Verification</span>
                    <input name="reason" required placeholder="Reason for verification review..." className="w-full rounded-lg border border-outline-variant bg-surface-container p-1.5 text-xs" />
                    <button className="rounded bg-surface-container-high px-2.5 py-1 text-[10px] font-bold uppercase w-full">Escalate</button>
                  </form>
                  <form action={escalateDispute} className="space-y-1.5">
                    <span className="font-bold text-[10px] uppercase text-on-surface-variant">Escalate to Dispute</span>
                    <input name="reason" required placeholder="Reason for dispute review..." className="w-full rounded-lg border border-outline-variant bg-surface-container p-1.5 text-xs" />
                    <button className="rounded bg-surface-container-high px-2.5 py-1 text-[10px] font-bold uppercase w-full">Escalate</button>
                  </form>
                  <form action={escalateSafety} className="space-y-1.5">
                    <span className="font-bold text-[10px] uppercase text-on-surface-variant">Escalate to Safety</span>
                    <input name="reason" required placeholder="Reason for safety review..." className="w-full rounded-lg border border-outline-variant bg-surface-container p-1.5 text-xs" />
                    <button className="rounded bg-surface-container-high px-2.5 py-1 text-[10px] font-bold uppercase w-full">Escalate</button>
                  </form>
                </div>
              </details>
            </div>
          )}

          {/* Close Action */}
          {canOperate && ticket.status === "resolved" && (
            <form action={close} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
              <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Close Ticket</h3>
              <p className="text-[11px] text-on-surface-variant">Once closed, customer can no longer send replies.</p>
              <button className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-500/20 transition">
                Close Ticket
              </button>
            </form>
          )}
        </div>
      </div>

      {/* History Activity (Compact Collapsible) */}
      <details className="group rounded-xl border border-outline-variant/40 bg-surface-container-lowest/30 p-4">
        <summary className="flex cursor-pointer items-center justify-between text-xs font-bold uppercase tracking-wider text-on-surface-variant select-none">
          <span>Audit History ({events.length})</span>
          <span className="text-primary group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-3 space-y-2 pt-2 border-t border-outline-variant/20">
          {events.map((event: any, i: number) => (
            <div key={`${event.event_type}-${event.created_at}-${i}`} className="flex items-center justify-between text-xs text-on-surface-variant py-1">
              <div>
                <span className="font-bold text-on-surface">{String(event.event_type).replaceAll("_", " ").toUpperCase()}</span>
                <span className="text-[11px] text-on-surface-variant ml-2">by {event.actor_type}</span>
              </div>
              <span className="text-[11px] font-medium">{formatDate(event.created_at)}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
