"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  FileText,
  ShieldCheck,
  Scale,
  Coins,
  MessageSquare,
  Paperclip,
  StickyNote,
  History,
  AlertTriangle,
  Lock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
  Send,
  UserCheck,
  AlertCircle,
  Plus,
} from "lucide-react";

type LeftStudioTab = "case" | "evidence" | "responses" | "timeline";

type FormAction = (formData: FormData) => void | Promise<void>;

type Props = {
  dispute: any;
  financialCase: any | null;
  events: any[];
  evidence: any[];
  responses: any[];
  notes: any[];
  disputeId: string;
  actionError?: string | null;
  isConflicted: boolean;
  isAssignedToCurrentAdmin: boolean;
  hasAssignedAdmin: boolean;
  isTerminal: boolean;
  canClaim: boolean;
  canDeclareConflict: boolean;
  canOperate: boolean;
  canRequest: boolean;
  canResolve: boolean;
  claim: FormAction;
  conflict: FormAction;
  requestInfo: FormAction;
  addNote: FormAction;
  resolve: FormAction;
  holdPayment: FormAction;
  proposeFinancial: FormAction;
  approveFinancial: FormAction;
  rejectFinancial: FormAction;
  executeRelease: FormAction;
  reclassify?: FormAction;
};

function formatDate(value: string | Date | null | undefined) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

export default function AdminDisputeCaseTabs({
  dispute,
  financialCase,
  events,
  evidence,
  responses,
  notes,
  disputeId,
  actionError,
  isConflicted,
  isAssignedToCurrentAdmin,
  hasAssignedAdmin,
  isTerminal,
  canClaim,
  canDeclareConflict,
  canOperate,
  canRequest,
  canResolve,
  claim,
  conflict,
  requestInfo,
  addNote,
  resolve,
  holdPayment,
  proposeFinancial,
  approveFinancial,
  rejectFinancial,
  executeRelease,
  reclassify,
}: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<LeftStudioTab>("case");

  const canRequestInCurrentState =
    !isTerminal &&
    canRequest &&
    ["open", "under_review", "evidence_review", "escalated"].includes(String(dispute.status || ""));

  const requireReassignReason = (event: React.FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.value !== "reassign") return;

    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get("reason") || "").trim();
    if (!reason) {
      event.preventDefault();
      alert("A reason is mandatory when reassigning a dispute away from another admin.");
    }
  };

  const leftTabs = [
    { id: "case", label: t("admin.disputesDetail.tab.overview"), icon: Scale },
    { id: "evidence", label: `${t("admin.disputesDetail.tab.evidence")} (${evidence.length})`, icon: Paperclip },
    { id: "responses", label: `${t("admin.disputesDetail.tab.messages")} (${responses.length})`, icon: MessageSquare },
    { id: "timeline", label: `Timeline & Notes (${events.length + notes.length})`, icon: History },
  ] as const;

  const escrowAmount = Number(
    financialCase?.payment_amount || financialCase?.contract_amount || dispute.payment_amount || 0
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Evidence & Case Studio (7 or 8 cols) */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Error Alert */}
        {actionError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Studio Tabs Switcher */}
        <div className="flex items-center gap-1 bg-card p-1.5 rounded-xl border border-border shadow-xs overflow-x-auto no-scrollbar">
          {leftTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as LeftStudioTab)}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? "bg-secondary text-foreground border border-border/60 shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Contract & Claims */}
        {activeTab === "case" && (
          <div className="space-y-4">
            {/* Contract & Transaction Details */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Contract & Transaction Scope
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-secondary/30 border border-border space-y-0.5">
                  <span className="text-[11px] text-muted-foreground">Job Scope</span>
                  <p className="font-semibold text-foreground line-clamp-1">
                    {dispute.job_title || "Skilled trade work"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border space-y-0.5">
                  <span className="text-[11px] text-muted-foreground">Contract Standing</span>
                  <p className="font-semibold text-foreground">
                    {dispute.current_contract_status || "Standard"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border space-y-0.5">
                  <span className="text-[11px] text-muted-foreground">Escrow Custody</span>
                  <p className="font-mono font-bold text-accent">
                    ETB {escrowAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Dispute Narrative Claim */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Initiator Dispute Claim
                </span>
                <div className="rounded-xl border border-border bg-secondary/20 p-4 text-xs leading-relaxed text-foreground">
                  {dispute.description ? (
                    <p className="italic">"{dispute.description}"</p>
                  ) : (
                    <span className="text-muted-foreground italic">
                      No narrative statement filed with this claim.
                    </span>
                  )}
                </div>
              </div>

              {/* Remedy requested */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-secondary/20 border border-border text-xs">
                <span className="text-muted-foreground">Requested Remedy:</span>
                <span className="font-semibold text-foreground capitalize">
                  {dispute.requested_resolution
                    ? dispute.requested_resolution.replaceAll("_", " ")
                    : "Mutual settlement"}
                </span>
              </div>

              {/* Category Examination & Classification */}
              <div className="pt-3 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Examine & Classify Dispute Category
                  </span>
                  <span className="text-[10px] text-muted-foreground">Operational categorization</span>
                </div>
                {reclassify && !isTerminal ? (
                  <form action={reclassify} className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "work_quality", label: "Work Quality" },
                      { id: "payment_issue", label: "Milestone & Escrow" },
                      { id: "work_not_completed", label: "Non-Completion" },
                      { id: "contract_violation", label: "Contract Breach" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="submit"
                        name="category"
                        value={cat.id}
                        className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition text-center ${
                          dispute.category === cat.id
                            ? "bg-accent text-accent-foreground border-accent shadow-xs"
                            : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </form>
                ) : (
                  <span className="text-xs font-semibold text-foreground capitalize">
                    {dispute.category ? dispute.category.replaceAll("_", " ") : "Work Quality"}
                  </span>
                )}
              </div>
            </div>

            {/* Resolved Decision Banner (If Terminal) */}
            {dispute.final_decision && (
              <div className="rounded-xl border border-success/30 bg-success/10 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-success" />
                    <h3 className="text-sm font-bold text-success">
                      Binding Determination Issued
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDate(dispute.resolved_at)}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-card/60 border border-success/20">
                    <span className="text-[11px] text-muted-foreground">Determination Ruling</span>
                    <p className="font-bold text-foreground mt-0.5 capitalize">
                      {String(dispute.final_decision).replaceAll("_", " ")}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-card/60 border border-success/20">
                    <span className="text-[11px] text-muted-foreground">Decided By</span>
                    <p className="font-semibold text-foreground mt-0.5">
                      {dispute.resolved_by_admin_name || dispute.assigned_admin_name || "Mediator"}
                    </p>
                  </div>
                </div>
                {dispute.final_reason && (
                  <p className="text-xs text-muted-foreground italic bg-card/40 p-3 rounded-lg border border-success/20">
                    "{dispute.final_reason}"
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Uploaded Evidence Files */}
        {activeTab === "evidence" && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Evidence Repository ({evidence.length})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Photos, service proofs, and documents uploaded by the disputing parties.
                </p>
              </div>
            </div>

            {evidence.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
                <Paperclip className="w-8 h-8 opacity-30 mx-auto mb-2" />
                <span>No photographic or document evidence uploaded for this dispute.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evidence.map((item: any) => (
                  <a
                    key={item.id}
                    href={`/api/disputes/${disputeId}/evidence/${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/70 transition text-xs group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Paperclip className="w-4 h-4 text-accent shrink-0" />
                      <span className="font-semibold text-foreground truncate group-hover:text-accent">
                        {item.file_name || "Evidence Attachment"}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Dispatched Requests & Party Responses */}
        {activeTab === "responses" && (
          <div className="space-y-4">
            {/* Request Information Form (Active Mediators) */}
            {canRequestInCurrentState && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Dispatch Formal Information Request
                </h3>
                <form action={requestInfo} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Recipient</label>
                      <select
                        name="target"
                        className="w-full mt-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground"
                      >
                        <option value="client">Client ({dispute.client_name || "Client"})</option>
                        <option value="worker">Artisan ({dispute.worker_name || "Worker"})</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Deadline</label>
                      <input
                        name="dueAt"
                        type="date"
                        className="w-full mt-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground">Required Detail</label>
                      <input
                        name="instruction"
                        required
                        placeholder="e.g. Upload photo of corrected pipe joint"
                        className="w-full mt-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Request</span>
                  </button>
                </form>
              </div>
            )}

            {/* List of responses */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Participant Submissions ({responses.length})
              </h3>
              {responses.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                  No information requests or responses recorded.
                </div>
              ) : (
                <div className="space-y-3">
                  {responses.map((resp: any) => (
                    <div
                      key={resp.id}
                      className="p-3.5 rounded-xl border border-border bg-secondary/20 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground capitalize">
                          {resp.requested_from} Response Request
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary border border-border text-muted-foreground">
                          {resp.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground font-medium">{resp.instruction}</p>
                      {resp.response_text && (
                        <div className="bg-card p-3 rounded-lg border border-border text-foreground">
                          {resp.response_text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Audit Timeline & Notes */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            {/* Append Internal Note */}
            {!isTerminal && canOperate && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Record Internal Mediator Note
                </h3>
                <form action={addNote} className="space-y-3">
                  <textarea
                    name="note"
                    rows={2}
                    required
                    placeholder="Internal findings, legal assessments, or private mediation observations..."
                    className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="h-8 px-4 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold transition"
                  >
                    Save Internal Note
                  </button>
                </form>
              </div>
            )}

            {/* Notes List */}
            {notes.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Internal Notes Archive ({notes.length})
                </h3>
                <div className="space-y-2">
                  {notes.map((n: any) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl border border-border bg-secondary/20 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span className="font-semibold text-foreground">
                          {n.admin_name || n.admin_employee_id || "Mediator"}
                        </span>
                        <span className="font-mono">{formatDate(n.created_at)}</span>
                      </div>
                      <p className="text-foreground">{n.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chronological Event Timeline */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Chronological Dispute Lifecycle ({events.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar pt-1">
                {events.map((ev: any) => (
                  <div
                    key={ev.id}
                    className="relative pl-4 border-l-2 border-border space-y-1 text-xs"
                  >
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-accent" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground uppercase tracking-wide">
                        {String(ev.event_type).replaceAll("_", " ")}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatDate(ev.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Actor: <strong className="text-foreground capitalize">{ev.actor_type}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Sticky Mediation & Escrow Console (4 or 5 cols) */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-4">
        {/* Card 1: Escrow & Financial Overview */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Escrow Custody
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              <Coins className="w-3 h-3" />
              <span>ETB Protected</span>
            </span>
          </div>

          <div className="rounded-xl bg-secondary/30 p-4 border border-border space-y-1">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
              Contract Disputed Value
            </span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ETB {escrowAmount.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Standing: <span className="font-semibold text-foreground">{dispute.payment_status || "Standard Hold"}</span>
            </p>
          </div>

          {/* Immediate Escrow Hold / Financial Proposals */}
          {!isTerminal && canOperate && canResolve && (
            <div className="space-y-3 pt-1 border-t border-border">
              <form action={holdPayment}>
                <button
                  type="submit"
                  className="w-full h-9 rounded-lg border border-warning/30 bg-warning/10 hover:bg-warning/20 text-warning text-xs font-semibold transition"
                >
                  Place Immediate Escrow Hold
                </button>
              </form>

              {/* Financial Proposal Form */}
              <form action={proposeFinancial} className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Propose Financial Action
                </span>
                <select
                  name="action"
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground"
                >
                  <option value="release_payment">Release 100% to Worker</option>
                  <option value="refund_review_required">Refund 100% to Client</option>
                  <option value="partial_refund_review_required">Custom Payout Split (ETB)</option>
                  <option value="payment_provider_investigation">Gateway Investigation</option>
                </select>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  max={escrowAmount || undefined}
                  placeholder="Split amount in ETB"
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground"
                />
                <textarea
                  name="reason"
                  required
                  rows={2}
                  placeholder="Financial reasoning for payout..."
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="w-full h-9 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-semibold transition"
                >
                  Submit Financial Proposal
                </button>
              </form>
            </div>
          )}

          {/* Financial proposals log */}
          {financialCase?.actions && financialCase.actions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Financial Decisions Log
              </span>
              <div className="space-y-2">
                {financialCase.actions.map((act: any) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-lg bg-secondary/20 border border-border text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground uppercase text-[10px]">
                        {String(act.action).replaceAll("_", " ")}
                      </span>
                      <span className="font-mono text-accent font-bold">
                        {act.amount ? `ETB ${Number(act.amount).toLocaleString()}` : "Full"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">"{act.reason}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Mediation Rulings & Determinations */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Mediation Rulings
          </h3>

          {/* Case Terminal Message */}
          {isTerminal ? (
            <div className="p-3.5 rounded-xl bg-secondary/30 border border-border text-xs space-y-1">
              <p className="font-semibold text-foreground">Determination Finalized</p>
              <p className="text-muted-foreground">
                This dispute has reached final determination ({String(dispute.status).replaceAll("_", " ")}).
                Actions are permanently archived.
              </p>
            </div>
          ) : isConflicted ? (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
              You declared a conflict of interest on this dispute. You may inspect the audit history in read-only mode.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Claim / Reassign */}
              {canClaim && (
                <form action={claim} onSubmit={requireReassignReason} className="space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Mediator Assignment
                  </span>
                  <textarea
                    name="reason"
                    rows={2}
                    placeholder="Audit reason required if reassigning..."
                    className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      name="assignmentAction"
                      value="claim"
                      className="h-9 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-bold transition"
                    >
                      Claim Case
                    </button>
                    <button
                      name="assignmentAction"
                      value="reassign"
                      className="h-9 rounded-lg border border-border bg-card hover:bg-secondary text-foreground text-xs font-semibold transition"
                    >
                      Reassign to Me
                    </button>
                  </div>
                </form>
              )}

              {/* Final Determination Form */}
              {canResolve && isAssignedToCurrentAdmin && (
                <form action={resolve} className="space-y-3 pt-2 border-t border-border">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Issue Binding Ruling
                  </span>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Determination</label>
                    <select
                      name="decision"
                      className="w-full mt-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground"
                    >
                      <option value="resolved_for_client">Resolved in favour of Client</option>
                      <option value="resolved_for_worker">Resolved in favour of Worker</option>
                      <option value="resolved_by_agreement">Resolved by Mutual Settlement</option>
                      <option value="dismissed">Dismiss Case as Unsubstantiated</option>
                      <option value="escalated">Escalate to Legal Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Post-Dispute Job Workflow</label>
                    <select
                      name="operationalOutcome"
                      required
                      className="w-full mt-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground"
                    >
                      <option value="">Select post-resolution workflow</option>
                      <option value="worker_payment_authorized">Authorize payout - mark job complete</option>
                      <option value="client_no_payment_cancel">Cancel job with zero payment</option>
                      <option value="redo_work">Redo work - return job to in-progress</option>
                      <option value="continue_work">Continue work - return job to in-progress</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Rationale</label>
                    <textarea
                      name="reason"
                      rows={2}
                      required
                      placeholder="State permanent legal rationale for this determination..."
                      className="w-full mt-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition active:scale-[0.98] shadow-xs"
                  >
                    Execute Binding Determination
                  </button>
                </form>
              )}

              {/* Conflict of Interest */}
              {canDeclareConflict && (
                <form action={conflict} className="pt-2 border-t border-border space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Recusal
                  </span>
                  <textarea
                    name="reason"
                    rows={1}
                    required
                    placeholder="Nature of personal or commercial conflict..."
                    className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    className="w-full h-8 rounded-lg border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-semibold transition"
                  >
                    Declare Conflict & Recuse
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
