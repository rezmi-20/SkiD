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

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  return value ? new Date(String(value)).toLocaleString() : "Not recorded";
}

export default async function AdminSupportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAdminSupportTicketDetails(id);
  if (!data) notFound();
  const { ticket, messages, events, notes, attachments, canOperate, canReadOnly } = data;

  async function claim(formData: FormData) {
    "use server";
    const result = await claimSupportTicket(id, Number(formData.get("assignmentVersion") || 0), String(formData.get("reason") || ""));
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/support/${id}`);
  }

  async function priority(formData: FormData) {
    "use server";
    const result = await changeSupportPriority(id, String(formData.get("priority") || "normal") as any, String(formData.get("reason") || ""));
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/support/${id}`);
  }

  async function reply(formData: FormData) {
    "use server";
    const result = await adminReplySupportTicket(id, String(formData.get("message") || ""), Boolean(formData.get("awaitUser")));
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/support/${id}`);
  }

  async function note(formData: FormData) {
    "use server";
    const result = await addSupportInternalNote(id, String(formData.get("note") || ""));
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/support/${id}`);
  }

  async function escalateVerification(formData: FormData) {
    "use server";
    const result = await escalateSupportToVerification(id, String(formData.get("reason") || ""));
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/support/${id}`);
  }

  async function escalateDispute(formData: FormData) {
    "use server";
    const result = await escalateSupportToDispute(id, String(formData.get("reason") || ""));
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/support/${id}`);
  }

  async function escalateSafety(formData: FormData) {
    "use server";
    const result = await escalateSupportSafety(id, String(formData.get("reason") || ""));
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/support/${id}`);
  }

  async function resolve(formData: FormData) {
    "use server";
    const result = await resolveSupportTicket(id, String(formData.get("resolutionType") || "") as any, String(formData.get("summary") || ""));
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/support/${id}`);
  }

  async function close() {
    "use server";
    const result = await closeSupportTicket(id);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/support/${id}`);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      <Link href="/admin/support" className="text-xs font-black uppercase tracking-widest text-primary">Back to support queue</Link>

      <header className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">{ticket.reference}</p>
        <h1 className="mt-2 text-3xl font-black text-on-surface">{ticket.subject}</h1>
        <p className="mt-2 text-sm font-bold text-on-surface-variant">
          {String(ticket.status).replaceAll("_", " ")} · {String(ticket.category).replaceAll("_", " ")} · {ticket.priority}
        </p>
      </header>

      {canReadOnly && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-bold">
          Super admin oversight mode. Operational support actions are read-only here.
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest">User</h2>
          <p className="mt-3 text-sm font-bold">{ticket.owner_name || ticket.owner_email}</p>
          <p className="mt-1 text-xs font-bold text-on-surface-variant">{ticket.owner_role} · {ticket.owner_email}</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest">Related records</h2>
          <p className="mt-3 text-sm font-bold">Job: {ticket.job_title || ticket.related_job_id || "None"}</p>
          <p className="mt-1 text-xs font-bold text-on-surface-variant">Payment status: {ticket.payment_status || "Not linked"} · Provider: {ticket.chapa_status || "Not linked"}</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest">Assignment</h2>
          <p className="mt-3 text-sm font-bold">{ticket.assigned_admin_name || "Unassigned"}</p>
          <p className="mt-1 text-xs font-bold text-on-surface-variant">Version {ticket.assignment_version} · {formatDate(ticket.assigned_at)}</p>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Submitted request</h2>
        <p className="mt-3 text-sm font-semibold text-on-surface-variant">{ticket.description}</p>
        {ticket.escalation_type && <p className="mt-3 text-xs font-black uppercase tracking-widest">Escalated: {ticket.escalation_type}</p>}
        {ticket.linked_dispute_id && <p className="mt-1 text-xs font-bold text-on-surface-variant">Linked dispute: {ticket.linked_dispute_id}</p>}
      </section>

      {canOperate && (
        <section className="grid gap-4 lg:grid-cols-2">
          <form action={claim} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h2 className="text-sm font-black uppercase tracking-widest">Claim / Reassign</h2>
            <input type="hidden" name="assignmentVersion" value={ticket.assignment_version} />
            <textarea name="reason" rows={3} placeholder="Reason required when reassigning another admin's ticket" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
            <button className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Claim Ticket</button>
          </form>

          <form action={priority} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h2 className="text-sm font-black uppercase tracking-widest">Priority</h2>
            <select name="priority" defaultValue={ticket.priority} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
              {SUPPORT_PRIORITIES.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <textarea name="reason" rows={3} required placeholder="Reason for priority change" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
            <button className="h-11 rounded-lg bg-surface-container px-4 text-xs font-black uppercase tracking-widest">Update Priority</button>
          </form>
        </section>
      )}

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Conversation</h2>
        <div className="mt-3 space-y-3">
          {messages.length === 0 ? <p className="text-sm font-bold text-on-surface-variant">No messages yet.</p> : messages.map((message: any) => (
            <div key={`${message.actor_type}-${message.created_at}`} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
              <p className="text-xs font-black uppercase tracking-widest">{String(message.actor_type).replaceAll("_", " ")} · {formatDate(message.created_at)}</p>
              <p className="mt-2 font-semibold text-on-surface-variant">{message.message}</p>
            </div>
          ))}
        </div>
        {canOperate && (
          <form action={reply} className="mt-4 space-y-3">
            <p className="text-xs font-bold text-on-surface-variant">Never request or record passwords, verification codes, full FIN, or payment credentials.</p>
            <textarea name="message" required rows={4} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
            <label className="flex items-center gap-2 text-xs font-bold">
              <input type="checkbox" name="awaitUser" value="1" />
              Request information and mark awaiting user
            </label>
            <button className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Send Reply</button>
          </form>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="text-sm font-black uppercase tracking-widest">Attachments</h2>
          <div className="mt-3 space-y-2">
            {attachments.length === 0 ? <p className="text-sm font-bold text-on-surface-variant">No attachments.</p> : attachments.map((item: any) => (
              <a key={item.id} href={`/api/support/${ticket.id}/attachments/${item.id}`} target="_blank" className="block rounded-lg border border-outline-variant bg-surface-container p-3 text-sm font-bold text-primary">
                {item.file_name || "Attachment"} · {item.mime_type} · {Number(item.file_size || 0).toLocaleString()} bytes
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <h2 className="text-sm font-black uppercase tracking-widest">Internal notes</h2>
          <div className="mt-3 space-y-2">
            {notes.length === 0 ? <p className="text-sm font-bold text-on-surface-variant">No internal notes.</p> : notes.map((item: any) => (
              <div key={`${item.admin_name}-${item.created_at}`} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
                <p className="text-xs font-black uppercase tracking-widest">{item.admin_name} · {formatDate(item.created_at)}</p>
                <p className="mt-2">{item.note}</p>
              </div>
            ))}
          </div>
          {canOperate && (
            <form action={note} className="mt-4 space-y-3">
              <p className="text-xs font-bold text-on-surface-variant">Never request or record passwords, verification codes, full FIN, or payment credentials.</p>
              <textarea name="note" required rows={4} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
              <button className="h-10 rounded-lg bg-surface-container px-4 text-xs font-black uppercase tracking-widest">Add Note</button>
            </form>
          )}
        </div>
      </section>

      {canOperate && (
        <section className="grid gap-4 lg:grid-cols-3">
          <form action={escalateVerification} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h2 className="text-sm font-black uppercase tracking-widest">Verification Escalation</h2>
            <textarea name="reason" required rows={3} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
            <button className="h-10 rounded-lg bg-surface-container px-4 text-xs font-black uppercase tracking-widest">Escalate</button>
          </form>
          <form action={escalateDispute} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h2 className="text-sm font-black uppercase tracking-widest">Dispute Escalation</h2>
            <textarea name="reason" required rows={3} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
            <button className="h-10 rounded-lg bg-surface-container px-4 text-xs font-black uppercase tracking-widest">Escalate</button>
          </form>
          <form action={escalateSafety} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h2 className="text-sm font-black uppercase tracking-widest">Safety Escalation</h2>
            <textarea name="reason" required rows={3} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
            <button className="h-10 rounded-lg bg-surface-container px-4 text-xs font-black uppercase tracking-widest">Escalate</button>
          </form>
        </section>
      )}

      {canOperate && (
        <section className="grid gap-4 lg:grid-cols-2">
          <form action={resolve} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h2 className="text-sm font-black uppercase tracking-widest">Resolve</h2>
            <select name="resolutionType" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
              {SUPPORT_RESOLUTION_TYPES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
            </select>
            <textarea name="summary" required rows={4} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
            <button className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Resolve Ticket</button>
          </form>
          <form action={close} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h2 className="text-sm font-black uppercase tracking-widest">Close</h2>
            <p className="text-sm font-bold text-on-surface-variant">Only resolved support tickets can be closed.</p>
            <button className="h-11 rounded-lg border border-error/20 bg-error/10 px-4 text-xs font-black uppercase tracking-widest text-error">Close Ticket</button>
          </form>
        </section>
      )}

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">History</h2>
        <div className="mt-3 space-y-2">
          {events.map((event: any) => (
            <div key={`${event.event_type}-${event.created_at}`} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
              <p className="font-black uppercase tracking-wider">{String(event.event_type).replaceAll("_", " ")}</p>
              <p className="text-xs font-bold text-on-surface-variant">{formatDate(event.created_at)} · {event.actor_type}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
