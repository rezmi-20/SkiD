import { reopenSupportTicket, submitSupportReply } from "@/lib/actions/support";

function formatDate(value: unknown) {
  return value ? new Date(String(value)).toLocaleString() : "Not recorded";
}

export default function UserSupportDetails({ data, role }: { data: any; role: "client" | "worker" }) {
  const { ticket, messages, events, attachments } = data;
  const canReply = ticket.status !== "closed";
  const canReopen = ticket.status === "resolved";

  async function reply(formData: FormData) {
    "use server";
    const result = await submitSupportReply(ticket.id, String(formData.get("message") || ""));
    if (!result.success) throw new Error(result.error);
  }

  async function reopen(formData: FormData) {
    "use server";
    const result = await reopenSupportTicket(ticket.id, String(formData.get("reason") || ""));
    if (!result.success) throw new Error(result.error);
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">{ticket.reference}</p>
        <h1 className="mt-2 text-3xl font-black text-on-surface">{ticket.subject}</h1>
        <p className="mt-2 text-sm font-bold text-on-surface-variant">
          {String(ticket.status).replaceAll("_", " ")} · {String(ticket.category).replaceAll("_", " ")} · {ticket.priority}
        </p>
      </header>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Your request</h2>
        <p className="mt-3 text-sm font-semibold text-on-surface-variant">{ticket.description}</p>
        {ticket.job_title && <p className="mt-3 text-xs font-black uppercase tracking-widest">Related job: {ticket.job_title}</p>}
        {ticket.escalation_type && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm font-bold">
            Escalated to {String(ticket.escalation_type).replaceAll("_", " ")} review.
          </div>
        )}
        {ticket.resolution_summary && (
          <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm">
            <p className="font-black uppercase tracking-widest">Resolution: {String(ticket.resolution_type).replaceAll("_", " ")}</p>
            <p className="mt-2 font-semibold">{ticket.resolution_summary}</p>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Attachments</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {attachments.length === 0 ? <p className="text-sm font-bold text-on-surface-variant">No attachments.</p> : attachments.map((item: any) => (
            <a key={item.id} href={`/api/support/${ticket.id}/attachments/${item.id}`} target="_blank" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm font-bold text-primary">
              {item.file_name || "Attachment"} · {item.mime_type}
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Conversation</h2>
        <div className="mt-3 space-y-3">
          {messages.length === 0 ? <p className="text-sm font-bold text-on-surface-variant">No replies yet.</p> : messages.map((message: any) => (
            <div key={`${message.actor_type}-${message.created_at}`} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
              <p className="text-xs font-black uppercase tracking-widest">{String(message.actor_type).replaceAll("_", " ")} · {formatDate(message.created_at)}</p>
              <p className="mt-2 font-semibold text-on-surface-variant">{message.message}</p>
            </div>
          ))}
        </div>
        {canReply && (
          <form action={reply} className="mt-4 space-y-3">
            <p className="text-xs font-bold text-on-surface-variant">Do not include passwords, verification codes, full FIN, or payment credentials.</p>
            <textarea name="message" required rows={4} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
            <button className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Send Reply</button>
          </form>
        )}
        {canReopen && (
          <form action={reopen} className="mt-4 space-y-3 rounded-lg border border-outline-variant bg-surface-container p-3">
            <h3 className="text-xs font-black uppercase tracking-widest">Reopen this ticket</h3>
            <textarea name="reason" required rows={3} className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-sm" />
            <button className="h-10 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Reopen</button>
          </form>
        )}
      </section>

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
