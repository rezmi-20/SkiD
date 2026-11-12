"use client";

import { useState } from "react";
import { Check, Image as ImageIcon, ShieldCheck, X, Camera } from "lucide-react";
import { reviewWorkerAvatarChange } from "@/lib/actions/worker-avatar";
import { useLanguage } from "@/context/LanguageContext";
import FadeContent from "@/components/ui/fade-content";

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
  const { t } = useLanguage();
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
    <div className="space-y-6 pb-24 w-full">
      {/* Header (Clean deals.tsx style: No dots, no uppercase pill badges) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("admin.avatarRequests.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("admin.avatarRequests.desc")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-card border border-border text-foreground font-mono shadow-xs">
            {requests.length} {t("admin.avatarRequests.kpi.pending")}
          </span>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold">
          {message}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-16 text-center text-xs text-muted-foreground shadow-xs">
          <Camera className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="font-semibold text-foreground text-sm">{t("admin.avatarRequests.noRequests")}</p>
        </div>
      ) : requests.map((request) => (
        <article key={request.id} className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-foreground">{request.full_name}</h2>
              <p className="text-xs text-muted-foreground font-mono">{request.email || request.phone || "Worker account"} · {new Date(request.created_at).toLocaleString()}</p>
            </div>
            <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Needs Review
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[{ label: t("admin.avatarRequests.table.current"), url: request.current_avatar_url }, { label: t("admin.avatarRequests.table.proposed"), url: request.requested_avatar_url }].map((photo) => (
              <div key={photo.label} className="space-y-1.5">
                <p className="text-[11px] font-semibold text-muted-foreground">{photo.label}</p>
                <div className="flex min-h-52 items-center justify-center overflow-hidden rounded-xl border border-border bg-secondary/30 p-2">
                  {photo.url ? <img src={photo.url} alt={photo.label} className="max-h-72 w-full object-contain rounded-lg" /> : <ImageIcon className="h-8 w-8 text-muted-foreground/40" />}
                </div>
              </div>
            ))}
          </div>

          {canReview ? (
            <div className="space-y-3 pt-3 border-t border-border">
              <label className="block text-xs font-semibold text-foreground" htmlFor={`reason-${request.id}`}>
                Reviewer note <span className="text-muted-foreground font-normal">(required if rejecting)</span>
              </label>
              <textarea
                id={`reason-${request.id}`}
                value={reasons[request.id] || ""}
                onChange={(event) => setReasons((current) => ({ ...current, [request.id]: event.target.value }))}
                maxLength={500}
                rows={2}
                className="w-full rounded-lg border border-border bg-secondary p-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-accent transition"
                placeholder="Example: Photo is blurry or does not clearly match verified identity."
              />
              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={pendingId === request.id}
                  onClick={() => void review(request, "rejected")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive px-3.5 py-1.5 text-xs font-semibold hover:bg-destructive/20 transition disabled:opacity-50 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>{t("admin.avatarRequests.action.reject")}</span>
                </button>
                <button
                  type="button"
                  disabled={pendingId === request.id}
                  onClick={() => void review(request, "approved")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent text-accent-foreground px-3.5 py-1.5 text-xs font-bold transition disabled:opacity-50 shadow-xs cursor-pointer hover:opacity-90"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{t("admin.avatarRequests.action.approve")}</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="border-t border-border pt-3 text-xs text-muted-foreground">
              You have read-only access to view photo requests.
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
