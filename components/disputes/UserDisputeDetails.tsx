import Link from "next/link";
import { addDisputeEvidence, submitDisputeResponse } from "@/lib/actions/disputes";
import DisputeResponseForm from "@/components/disputes/DisputeResponseForm";
import DisputeEvidenceUploadForm from "@/components/disputes/DisputeEvidenceUploadForm";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  FileSpreadsheet,
  Film,
  Image as ImageIcon,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  Scale,
} from "lucide-react";
import { GOVERNANCE_APPEAL_WINDOW_DAYS } from "@/lib/governance-constants";
import ParticipantEvidenceExportButton from "@/components/contract/ParticipantEvidenceExportButton";

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEvidenceIcon(mimeType: string = "") {
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-primary shrink-0" />;
  if (mimeType.startsWith("video/")) return <Film className="h-4 w-4 text-blue-500 shrink-0" />;
  if (mimeType === "application/pdf") return <FileText className="h-4 w-4 text-amber-500 shrink-0" />;
  return <FileSpreadsheet className="h-4 w-4 text-muted-foreground shrink-0" />;
}

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UserDisputeDetails({ data, role }: { data: any; role: "client" | "worker" }) {
  const { dispute, events, evidence, responses } = data;
  const isTerminal = ["resolved", "dismissed"].includes(String(dispute.status || ""));

  const resolvedAt = dispute.resolved_at ? new Date(dispute.resolved_at) : null;
  const isAppealWindowOpen =
    Boolean(resolvedAt) &&
    Date.now() - (resolvedAt?.getTime() || 0) <= GOVERNANCE_APPEAL_WINDOW_DAYS * 864e5;

  async function submitResponse(formData: FormData) {
    "use server";
    const responseId = String(formData.get("responseId") || "");
    const responseText = String(formData.get("responseText") || "");
    const result = await submitDisputeResponse(responseId, responseText);
    if (!result.success) throw new Error(result.error);
  }

  async function uploadEvidence(formData: FormData) {
    "use server";
    const url = String(formData.get("evidenceUrl") || "").trim();
    const fileName = String(formData.get("fileName") || "Uploaded Evidence").trim();
    const mimeType = String(formData.get("mimeType") || "image/png").trim();
    const fileSize = Number(formData.get("fileSize") || 1);

    const result = await addDisputeEvidence(dispute.id, {
      url,
      fileName,
      mimeType,
      fileSize,
    });
    return result;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* Header & Status */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/${role}/disputes`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to disputes
          </Link>

          <div className="flex items-center gap-2">
            <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
              #{String(dispute.id).slice(0, 8)}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                dispute.status === "resolved"
                  ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : dispute.status === "dismissed"
                  ? "border border-border bg-muted text-muted-foreground"
                  : "border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              }`}
            >
              {dispute.status === "resolved" && <CheckCircle2 className="h-3.5 w-3.5" />}
              {dispute.status !== "resolved" && <Clock className="h-3.5 w-3.5" />}
              {String(dispute.status).replaceAll("_", " ")}
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {dispute.title || dispute.job_title || "Dispute Case"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Opened on {formatDate(dispute.created_at)} by {dispute.opened_by_role || "user"}
            {dispute.category && ` · Category: ${String(dispute.category).replaceAll("_", " ")}`}
          </p>
        </div>
      </div>

      {dispute.contract_id && (
        <ParticipantEvidenceExportButton contractId={dispute.contract_id} />
      )}

      {/* Main Unified Case Card */}
      <div className="divide-y divide-border/60 rounded-xl border border-border/80 bg-card shadow-xs">
        {/* Case Description & Requested Resolution */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Submitted Case Details
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
              {dispute.description}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs font-medium">
            <span className="text-muted-foreground">Requested Resolution:</span>
            <span className="rounded-md border border-border bg-muted/60 px-2.5 py-1 font-semibold uppercase tracking-wider text-foreground text-[11px]">
              {String(dispute.requested_resolution || "Not specified").replaceAll("_", " ")}
            </span>
          </div>

          {/* Final Decision Banner */}
          {dispute.final_decision && (
            <div className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-emerald-500/15 p-1.5 text-emerald-700 dark:text-emerald-300 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Final Decision: {String(dispute.final_decision).replaceAll("_", " ")}
                  </p>
                  <p className="text-sm font-medium text-foreground/90 leading-relaxed">
                    {dispute.final_reason}
                  </p>
                </div>
              </div>

              {/* Status Chips */}
              <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-3 text-xs border-t border-emerald-500/20">
                <div className="rounded-md bg-background/60 p-2 border border-emerald-500/15">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Job Status</span>
                  <span className="font-semibold text-foreground">{dispute.current_job_status || "Active"}</span>
                </div>
                <div className="rounded-md bg-background/60 p-2 border border-emerald-500/15">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contract</span>
                  <span className="font-semibold text-foreground">{dispute.current_contract_status || "Active"}</span>
                </div>
                <div className="rounded-md bg-background/60 p-2 border border-emerald-500/15">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment</span>
                  <span className="font-semibold text-foreground">{dispute.current_payment_status || "Not recorded"}</span>
                </div>
              </div>

              {/* Appeal Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-muted-foreground">
                  {isAppealWindowOpen ? (
                    <span>If you disagree with this decision, you can request an independent governance review within 7 days.</span>
                  ) : (
                    <span>The 7-day governance appeal window for this decision has expired.</span>
                  )}
                </div>

                {isAppealWindowOpen && (
                  <Link
                    href={`/${role}/appeals/new?targetId=${dispute.id}&appealType=dispute_resolution`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
                  >
                    <Scale className="h-3.5 w-3.5" />
                    Appeal Decision
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Evidence Section */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Submitted Evidence ({evidence.length})
            </h2>
          </div>

          {evidence.length === 0 ? (
            <p className="text-xs font-medium text-muted-foreground italic py-1">
              No evidence files uploaded for this case yet.
            </p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {evidence.map((item: any) => (
                <a
                  key={item.id}
                  href={`/api/disputes/${dispute.id}/evidence/${item.id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-background/50 p-3 hover:bg-accent/40 hover:border-primary/40 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getEvidenceIcon(item.mime_type)}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary">
                        {item.file_name || "Evidence Document"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.mime_type} {formatBytes(item.file_size)}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                </a>
              ))}
            </div>
          )}

          {!isTerminal && (
            <div className="pt-2">
              <DisputeEvidenceUploadForm disputeId={dispute.id} action={uploadEvidence} />
            </div>
          )}
        </div>

        {/* Admin Requests and Responses */}
        <div className="p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Admin Inquiries & Responses
          </h2>

          {responses.length === 0 ? (
            <p className="text-xs font-medium text-muted-foreground italic py-1">
              No official information requests recorded by the dispute admin.
            </p>
          ) : (
            <div className="space-y-3">
              {responses.map((response: any) => {
                const canRespond = !isTerminal && response.status === "requested" && response.requested_from === role;
                return (
                  <div
                    key={response.id}
                    className="rounded-lg border border-border/70 bg-background/60 p-4 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold uppercase tracking-wider text-foreground">
                        {response.requested_from} Response Request
                      </span>
                      <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                        {response.status}
                      </span>
                    </div>

                    <p className="text-foreground/90 font-medium leading-relaxed">{response.instruction}</p>
                    <p className="text-[11px] text-muted-foreground">Due: {formatDate(response.due_at)}</p>

                    {response.response_text && (
                      <div className="mt-2 rounded-md bg-muted/40 p-3 border border-border/50">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          Submitted Response
                        </span>
                        <p className="text-xs font-medium text-foreground">{response.response_text}</p>
                      </div>
                    )}

                    {canRespond && (
                      <div className="pt-2">
                        <DisputeResponseForm responseId={response.id} action={submitResponse} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Activity History
          </h2>

          <div className="relative border-l border-border/70 ml-2.5 pl-4 space-y-4 my-2">
            {events.map((event: any, idx: number) => (
              <div key={`${event.event_type}-${event.created_at}-${idx}`} className="relative">
                <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary ring-4 ring-card" />
                <p className="text-xs font-bold text-foreground capitalize">
                  {String(event.event_type).replaceAll("_", " ")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatDate(event.created_at)} · {event.actor_type || "system"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
