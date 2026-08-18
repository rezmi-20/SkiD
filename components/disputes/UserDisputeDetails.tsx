import { submitDisputeResponse } from "@/lib/actions/disputes";

function formatDate(value: string | Date | null | undefined) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

export default function UserDisputeDetails({ data, role }: { data: any; role: "client" | "worker" }) {
  const { dispute, events, evidence, responses } = data;

  async function submitResponse(formData: FormData) {
    "use server";
    const responseId = String(formData.get("responseId") || "");
    const responseText = String(formData.get("responseText") || "");
    const result = await submitDisputeResponse(responseId, responseText);
    if (!result.success) throw new Error(result.error);
  }

  return (
    <div className="space-y-6 pb-20">
      <header className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Dispute Case</p>
        <h1 className="mt-2 text-3xl font-black text-on-surface">{dispute.title || dispute.job_title}</h1>
        <p className="mt-2 text-sm font-bold text-on-surface-variant">
          #{String(dispute.id).slice(0, 8)} · {String(dispute.status).replaceAll("_", " ")}
        </p>
      </header>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Your submitted case</h2>
        <p className="mt-3 text-sm font-semibold text-on-surface-variant">{dispute.description}</p>
        <p className="mt-3 text-xs font-black uppercase tracking-widest">Requested resolution: {dispute.requested_resolution}</p>
        {dispute.final_decision && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm">
            <p className="font-black uppercase tracking-widest">Final decision: {String(dispute.final_decision).replaceAll("_", " ")}</p>
            <p className="mt-2 font-semibold">{dispute.final_reason}</p>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Evidence</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {evidence.length === 0 ? <p className="text-sm font-bold text-on-surface-variant">No evidence uploaded.</p> : evidence.map((item: any) => (
            <a key={item.id} href={`/api/disputes/${dispute.id}/evidence/${item.id}`} target="_blank" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm font-bold text-primary">
              {item.file_name || "Evidence"} · {item.mime_type}
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Admin requests and responses</h2>
        <div className="mt-3 space-y-3">
          {responses.length === 0 ? <p className="text-sm font-bold text-on-surface-variant">No response requested.</p> : responses.map((response: any) => {
            const canRespond = response.status === "requested" && response.requested_from === role;
            return (
              <div key={response.id} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
                <p className="font-black uppercase tracking-wider">{response.requested_from} response · {response.status}</p>
                <p className="mt-2 text-on-surface-variant">{response.instruction}</p>
                <p className="mt-1 text-xs font-bold text-on-surface-variant">Due: {formatDate(response.due_at)}</p>
                {response.response_text && <p className="mt-3 font-semibold">{response.response_text}</p>}
                {canRespond && (
                  <form action={submitResponse} className="mt-3 space-y-2">
                    <input type="hidden" name="responseId" value={response.id} />
                    <textarea name="responseText" required rows={4} className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3" />
                    <button className="h-10 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Submit Response</button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Timeline</h2>
        <div className="mt-3 space-y-3">
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
