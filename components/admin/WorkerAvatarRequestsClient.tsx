"use client";

import { useState } from "react";
import { Check, Image as ImageIcon, ShieldCheck, X } from "lucide-react";
import { reviewWorkerAvatarChange } from "@/lib/actions/worker-avatar";

type AvatarRequest = {
  id: string;
  worker_user_id: string;
  requested_avatar_url: string;
  current_avatar_url: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  created_at: string | Date;
};

export function WorkerAvatarRequestsClient({ requests: initialRequests, canReview }: { requests: AvatarRequest[]; canReview: boolean }) {
  const [requests, setRequests] = useState(initialRequests);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const review = async (request: AvatarRequest, decision: "approved" | "rejected") => {
    if (decision === "rejected" && !reasons[request.id]?.trim()) {
      setMessage("Add a reason before rejecting a photo.");
      return;
    }
    setPendingId(request.id);
    setMessage("");
    const result = await reviewWorkerAvatarChange(request.id, decision, reasons[request.id] || "");
    if (result.success) {
      setRequests((current) => current.filter((item) => item.id !== request.id));
    } else {
      setMessage(result.error || "Could not update the request.");
    }
    setPendingId(null);
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary"><ShieldCheck className="h-6 w-6" /></div>
        <div>
          <h1 className="text-2xl font-bold">Worker photo requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review photo change requests. Fayda documents are only available in the one-time verification review flow.</p>
        </div>
      </header>
      {message && <p role="status" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{message}</p>}
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">No photo change requests are waiting for review.</div>
      ) : requests.map((request) => (
        <article key={request.id} className="space-y-5 rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold">{request.full_name}</h2>
              <p className="text-xs text-muted-foreground">{request.email || request.phone || "Worker account"} · {new Date(request.created_at).toLocaleString()}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[{ label: "Current approved photo", url: request.current_avatar_url }, { label: "Requested replacement", url: request.requested_avatar_url }].map((photo) => (
              <div key={photo.label} className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">{photo.label}</p>
                <div className="flex min-h-52 items-center justify-center overflow-hidden rounded-xl border bg-muted/40">
                  {photo.url ? <img src={photo.url} alt={photo.label} className="max-h-80 w-full object-contain" /> : <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                </div>
              </div>
            ))}
          </div>
          {canReview ? (
            <div className="space-y-3 border-t pt-4">
              <label className="block text-xs font-semibold" htmlFor={`reason-${request.id}`}>Review note {"(required to reject)"}</label>
              <textarea id={`reason-${request.id}`} value={reasons[request.id] || ""} onChange={(event) => setReasons((current) => ({ ...current, [request.id]: event.target.value }))} maxLength={500} rows={2} className="w-full resize-y rounded-xl border bg-background p-3 text-sm" placeholder="For example: The face is not clear enough to compare with the Fayda ID." />
              <div className="flex flex-wrap justify-end gap-2">
                <button disabled={pendingId === request.id} onClick={() => void review(request, "rejected")} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-destructive/30 px-4 text-sm font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"><X className="h-4 w-4" /> Reject</button>
                <button disabled={pendingId === request.id} onClick={() => void review(request, "approved")} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"><Check className="h-4 w-4" /> Approve photo</button>
              </div>
            </div>
          ) : <p className="border-t pt-4 text-sm text-muted-foreground">You can view requests, but do not have permission to review them.</p>}
        </article>
      ))}
    </section>
  );
}
