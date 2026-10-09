"use client";

import { useMemo, useState } from "react";

type DisputeTab = "case" | "actions" | "financial" | "responses" | "evidence" | "notes" | "timeline";

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
};

function formatDate(value: string | Date | null | undefined) {
  return value ? new Date(value).toLocaleString() : "Not recorded";
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-80 overflow-auto rounded-lg border border-outline-variant bg-surface-container p-3 text-xs leading-5">
      {JSON.stringify(value || {}, null, 2)}
    </pre>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">{children}</div>;
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
}: Props) {
  const [activeTab, setActiveTab] = useState<DisputeTab>("case");
  const assignmentMessage = !hasAssignedAdmin
    ? "This dispute is unassigned. Claim the case before performing operational actions."
    : !isAssignedToCurrentAdmin
      ? "This dispute belongs to another admin. Reassign it to yourself with a reason before performing operational actions."
      : null;
  const canRequestInCurrentState =
    !isTerminal && canRequest && ["open", "under_review", "evidence_review", "escalated"].includes(String(dispute.status || ""));
  const requireReassignReason = (event: React.FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.value !== "reassign") return;

    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get("reason") || "").trim();
    if (reason.length < 10) {
      event.preventDefault();
      alert("Enter a reassignment reason with at least 10 characters.");
    }
  };
  const tabs = useMemo(
    () => [
      { id: "case" as const, label: "Case" },
      { id: "actions" as const, label: "Actions" },
      { id: "financial" as const, label: "Financial" },
      { id: "responses" as const, label: `Responses (${responses.length})` },
      { id: "evidence" as const, label: `Evidence (${evidence.length})` },
      { id: "notes" as const, label: `Notes (${notes.length})` },
      { id: "timeline" as const, label: `Timeline (${events.length})` },
    ],
    [events.length, evidence.length, notes.length, responses.length],
  );

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest p-1">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-10 rounded-lg px-4 text-xs font-black uppercase tracking-widest transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "case" && (
        <div className="space-y-4">
          <section className="grid gap-4 lg:grid-cols-3">
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest">Parties</h2>
              <p className="mt-3 text-sm font-bold">Client: {dispute.client_name || dispute.client_id}</p>
              <p className="mt-1 text-sm font-bold">Worker: {dispute.worker_name || dispute.worker_id}</p>
            </Panel>
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest">Transaction</h2>
              <p className="mt-3 text-sm font-bold">Job: {dispute.job_title}</p>
              <p className="mt-1 text-sm font-bold">Contract: {dispute.current_contract_status || "Not recorded"}</p>
              <p className="mt-1 text-sm font-bold">Payment: {dispute.current_payment_status || "Not recorded"}</p>
            </Panel>
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest">Assignment</h2>
              <p className="mt-3 text-sm font-bold">{dispute.assigned_admin_name || "Unassigned"}</p>
              <p className="mt-1 text-xs font-bold text-on-surface-variant">Assigned {formatDate(dispute.assigned_at)}</p>
            </Panel>
          </section>

          <Panel>
            <h2 className="text-sm font-black uppercase tracking-widest">Submitted Case</h2>
            <p className="mt-3 text-sm font-semibold text-on-surface-variant">{dispute.description}</p>
            <p className="mt-3 text-xs font-black uppercase tracking-widest">Requested resolution: {dispute.requested_resolution}</p>
          </Panel>

          {dispute.final_decision && (
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest">Final Resolution</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Decision</p>
                  <p className="mt-1 text-sm font-black">{String(dispute.final_decision).replaceAll("_", " ")}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Resolved By</p>
                  <p className="mt-1 text-sm font-black">{dispute.resolved_by_admin_name || dispute.assigned_admin_name || "Recorded admin"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Resolved At</p>
                  <p className="mt-1 text-sm font-black">{formatDate(dispute.resolved_at)}</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold text-on-surface-variant">{dispute.final_reason}</p>
            </Panel>
          )}

          <section className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest">Creation Snapshot</h2>
              <div className="mt-3">
                <JsonBlock value={dispute.creation_snapshot} />
              </div>
            </Panel>
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest">System Evidence</h2>
              <div className="mt-3 space-y-2 text-sm font-bold text-on-surface-variant">
                <p>Job status: {dispute.current_job_status}</p>
                <p>Contract terms: {dispute.terms_status || "Not recorded"}</p>
                <p>Contract status: {dispute.current_contract_status || "Not recorded"}</p>
                <p>Payment status: {dispute.current_payment_status || "Not recorded"}</p>
                <p>Completion rejection: {dispute.completion_rejection_reason || "None"}</p>
              </div>
            </Panel>
          </section>
        </div>
      )}

      {activeTab === "actions" && (
        <div className="space-y-4">
          {actionError && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-bold text-on-surface">
              {actionError}
            </div>
          )}

          {isTerminal && (
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest">Terminal Read-Only State</h2>
              <p className="mt-3 text-sm font-bold text-on-surface-variant">
                This dispute is {String(dispute.status).replaceAll("_", " ")}. Operational dispute, assignment, note, resolution, and routine financial controls are locked.
              </p>
            </Panel>
          )}

          {isConflicted && (
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest">Conflict Declared</h2>
              <p className="mt-3 text-sm font-bold text-on-surface-variant">
                You declared a conflict on this dispute. You can inspect the case, but you cannot reclaim it or perform operational actions.
              </p>
            </Panel>
          )}

          {!isTerminal && !isConflicted && (canClaim || canDeclareConflict) ? (
            <section className="grid gap-4 lg:grid-cols-2">
              {canClaim && (
              <form action={claim} onSubmit={requireReassignReason} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                <h2 className="text-sm font-black uppercase tracking-widest">Claim / Reassign</h2>
                <textarea name="reason" rows={3} placeholder="Reason required when reassigning another admin's case" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <button name="assignmentAction" value="claim" className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">
                    Claim Case
                  </button>
                  <button name="assignmentAction" value="reassign" className="h-11 rounded-lg border border-primary/30 bg-primary/10 px-4 text-xs font-black uppercase tracking-widest text-primary">
                    Reassign to Me
                  </button>
                </div>
              </form>
              )}

              {canDeclareConflict && (
                <form action={conflict} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                  <h2 className="text-sm font-black uppercase tracking-widest">Declare Conflict</h2>
                  <textarea name="reason" rows={3} required placeholder="Explain the conflict of interest" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
                  <button className="h-11 rounded-lg border border-error/20 bg-error/10 px-4 text-xs font-black uppercase tracking-widest text-error">Declare Conflict</button>
                </form>
              )}
            </section>
          ) : !isTerminal && !isConflicted && !canOperate ? (
            <Panel>
              <p className="text-sm font-bold text-on-surface-variant">Read-only oversight mode. You can inspect this case but cannot claim, reassign, or declare a conflict.</p>
            </Panel>
          ) : null}

          {!isTerminal && !isConflicted && assignmentMessage && canClaim && (
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest">Assignment Required</h2>
              <p className="mt-3 text-sm font-bold text-on-surface-variant">{assignmentMessage}</p>
            </Panel>
          )}

          {canRequestInCurrentState ? (
            <form action={requestInfo} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <h2 className="text-sm font-black uppercase tracking-widest">Request Information</h2>
              <div className="grid gap-3 md:grid-cols-3">
                <select name="target" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
                  <option value="client">Client</option>
                  <option value="worker">Worker</option>
                </select>
                <input name="dueAt" type="date" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
                <input name="instruction" required placeholder="Instruction to participant" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm md:col-span-1" />
              </div>
              <button className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Send Request</button>
            </form>
          ) : !isTerminal && canRequest ? (
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest">Request Information</h2>
              <p className="mt-3 text-sm font-bold text-on-surface-variant">
                This dispute is already waiting for a participant response. Review or wait for the open response before sending another request.
              </p>
            </Panel>
          ) : null}

          {!isTerminal && canResolve && (
            <form action={resolve} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <h2 className="text-sm font-black uppercase tracking-widest">Resolution Foundation</h2>
              <select name="decision" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
                <option value="resolved_for_client">Resolved for client</option>
                <option value="resolved_for_worker">Resolved for worker</option>
                <option value="resolved_by_agreement">Resolved by agreement</option>
                <option value="dismissed">Dismissed</option>
                <option value="escalated">Escalated</option>
              </select>
              <select name="operationalOutcome" required className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
                <option value="">Select post-resolution job outcome</option>
                <option value="redo_work">Redo or correct work - return job to in progress</option>
                <option value="continue_work">Continue work - return job to in progress</option>
                <option value="worker_payment_authorized">Authorize normal client payment path - mark job completed</option>
                <option value="client_no_payment_cancel">Client-favour no-payment outcome - cancel job</option>
                <option value="restore_previous_state">Restore supported previous workflow state</option>
              </select>
              <textarea name="reason" rows={4} required placeholder="Mandatory decision reason" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
              <button className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Record Decision</button>
              <p className="text-xs font-bold text-on-surface-variant">This decision will not create a payment or claim money moved. Refund outcomes remain review/provider/manual-confirmation based.</p>
            </form>
          )}
        </div>
      )}

      {activeTab === "financial" && (
        <div>
          {!financialCase ? (
            <Panel>
              <p className="text-sm font-bold text-on-surface-variant">No financial case is linked to this dispute.</p>
            </Panel>
          ) : isTerminal ? (
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest">Financial Case Read-Only</h2>
              <p className="mt-3 text-sm font-bold text-on-surface-variant">
                Terminal disputes cannot place holds, create financial proposals, approve high-risk proposals, or execute financial actions. Existing financial history remains visible below.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {[
                  ["Contract amount", `${Number(financialCase.contract_amount || 0).toLocaleString()} ETB`],
                  ["Payment amount", `${Number(financialCase.payment_amount || 0).toLocaleString()} ETB`],
                  ["Payment status", financialCase.payment_status || "Not recorded"],
                  ["Financial state", financialCase.financial_action_state || "none"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-outline-variant bg-surface-container p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</p>
                    <p className="mt-1 text-sm font-black">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-black uppercase tracking-widest">Financial History</h3>
                {financialCase.actions.length === 0 ? (
                  <p className="text-sm font-bold text-on-surface-variant">No financial actions recorded.</p>
                ) : (
                  financialCase.actions.map((action: any) => (
                    <div key={action.id} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
                      <p className="font-black uppercase tracking-wider">{String(action.action).replaceAll("_", " ")}</p>
                      <p className="mt-1 text-xs font-bold text-on-surface-variant">
                        {action.proposal_status} - {action.amount ? `${Number(action.amount).toLocaleString()} ${action.currency}` : "no amount"} - {formatDate(action.created_at)}
                      </p>
                      <p className="mt-2 text-on-surface-variant">{action.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          ) : !canOperate && !financialCase.canApproveHighRisk ? (
            <Panel>
              <h2 className="text-sm font-black uppercase tracking-widest">Assignment Required</h2>
              <p className="mt-3 text-sm font-bold text-on-surface-variant">
                {isConflicted
                  ? "You declared a conflict on this dispute. Financial operations are read-only."
                  : assignmentMessage || "Only the assigned dispute admin may perform routine financial operations."}
              </p>
            </Panel>
          ) : (
            <section className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Financial Case</p>
                <h2 className="mt-1 text-xl font-black text-on-surface">Controlled Payment Actions</h2>
                <p className="mt-1 text-sm font-semibold text-on-surface-variant">
                  Payment {financialCase.payment_id ? `#${String(financialCase.payment_id).slice(0, 8)}` : "not recorded"} - {financialCase.payment_status || "no payment"} - hold {financialCase.financial_hold_status || "none"}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                {[
                  ["Contract amount", `${Number(financialCase.contract_amount || 0).toLocaleString()} ETB`],
                  ["Payment amount", `${Number(financialCase.payment_amount || 0).toLocaleString()} ETB`],
                  ["Chapa ref", financialCase.chapa_ref_masked || "Not recorded"],
                  ["Financial state", financialCase.financial_action_state || "none"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-outline-variant bg-surface-container p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</p>
                    <p className="mt-1 text-sm font-black">{value}</p>
                  </div>
                ))}
              </div>

              {!isTerminal && canOperate && canResolve && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <form action={holdPayment} className="space-y-3 rounded-lg border border-outline-variant bg-surface-container p-4">
                    <h3 className="text-sm font-black uppercase tracking-widest">Place Hold</h3>
                    <textarea name="reason" required rows={3} placeholder="Reason for hold" className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-sm" />
                    <button className="h-11 rounded-lg border border-error/20 bg-error/10 px-4 text-xs font-black uppercase tracking-widest text-error">Hold Payment</button>
                  </form>

                  <form action={proposeFinancial} className="space-y-3 rounded-lg border border-outline-variant bg-surface-container p-4">
                    <h3 className="text-sm font-black uppercase tracking-widest">Propose Financial Action</h3>
                    <select name="action" className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-sm">
                      <option value="no_financial_action">No financial action</option>
                      <option value="release_payment">Release payment</option>
                      <option value="refund_review_required">Refund review required</option>
                      <option value="partial_refund_review_required">Partial refund review required</option>
                      <option value="payment_provider_investigation">Provider investigation</option>
                      <option value="escalate_financial_case">Escalate financial case</option>
                    </select>
                    <input name="amount" type="number" min="0" placeholder="Amount for refund review only" className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-sm" />
                    <textarea name="reason" required rows={3} placeholder="Reason" className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-sm" />
                    <button className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Submit Proposal</button>
                  </form>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-widest">Financial History</h3>
                {financialCase.actions.length === 0 ? (
                  <p className="text-sm font-bold text-on-surface-variant">No financial actions recorded.</p>
                ) : (
                  financialCase.actions.map((action: any) => (
                    <div key={action.id} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-black uppercase tracking-wider">{String(action.action).replaceAll("_", " ")}</p>
                          <p className="mt-1 text-xs font-bold text-on-surface-variant">
                            {action.proposal_status} - {action.amount ? `${Number(action.amount).toLocaleString()} ${action.currency}` : "no amount"} - {formatDate(action.created_at)}
                          </p>
                          <p className="mt-2 text-on-surface-variant">{action.reason}</p>
                        </div>
                        {!isTerminal && canOperate && canResolve && action.action === "release_payment" && action.proposal_status === "approved" && (
                          <form action={executeRelease}>
                            <input type="hidden" name="actionId" value={action.id} />
                            <button className="rounded-lg bg-primary px-3 py-2 text-[11px] font-black uppercase tracking-wider text-on-primary">Execute Release</button>
                          </form>
                        )}
                      </div>
                      {!isTerminal && financialCase.canApproveHighRisk && action.proposal_status === "proposed" && (
                        <div className="mt-3 grid gap-2 md:grid-cols-2">
                          <form action={approveFinancial}>
                            <input type="hidden" name="actionId" value={action.id} />
                            <button className="h-10 w-full rounded-lg bg-primary px-3 text-[11px] font-black uppercase tracking-wider text-on-primary">Approve</button>
                          </form>
                          <form action={rejectFinancial} className="flex gap-2">
                            <input type="hidden" name="actionId" value={action.id} />
                            <input name="reason" required placeholder="Reject reason" className="min-w-0 flex-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-xs" />
                            <button className="h-10 rounded-lg border border-error/20 bg-error/10 px-3 text-[11px] font-black uppercase tracking-wider text-error">Reject</button>
                          </form>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {activeTab === "responses" && (
        <Panel>
          <h2 className="text-sm font-black uppercase tracking-widest">Responses</h2>
          <div className="mt-3 space-y-3">
            {responses.length === 0 ? (
              <p className="text-sm font-bold text-on-surface-variant">No response requests.</p>
            ) : (
              responses.map((response: any) => (
                <div key={response.id} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
                  <p className="font-black">{response.requested_from} - {response.status}</p>
                  <p className="mt-1 text-on-surface-variant">{response.instruction}</p>
                  {response.response_text && <p className="mt-2 font-semibold">{response.response_text}</p>}
                </div>
              ))
            )}
          </div>
        </Panel>
      )}

      {activeTab === "evidence" && (
        <Panel>
          <h2 className="text-sm font-black uppercase tracking-widest">Evidence</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {evidence.length === 0 ? (
              <p className="text-sm font-bold text-on-surface-variant">No uploaded evidence.</p>
            ) : (
              evidence.map((item: any) => (
                <a key={item.id} href={`/api/disputes/${disputeId}/evidence/${item.id}`} target="_blank" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm font-bold text-primary">
                  {item.file_name || "Evidence"} - {item.mime_type}
                </a>
              ))
            )}
          </div>
        </Panel>
      )}

      {activeTab === "notes" && (
        <div className="space-y-4">
          {!isTerminal && canOperate && (
            <form action={addNote} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <h2 className="text-sm font-black uppercase tracking-widest">Internal Admin Notes</h2>
              <textarea name="note" rows={4} required placeholder="Invisible to client and worker" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
              <button className="h-11 rounded-lg bg-surface-container px-4 text-xs font-black uppercase tracking-widest">Add Internal Note</button>
            </form>
          )}
          <Panel>
            <h2 className="text-sm font-black uppercase tracking-widest">Internal Notes</h2>
            <div className="mt-3 space-y-3">
              {notes.length === 0 ? (
                <p className="text-sm font-bold text-on-surface-variant">No internal notes.</p>
              ) : (
                notes.map((note: any) => (
                  <div key={note.id} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
                    <p className="text-xs font-black uppercase tracking-widest">{note.admin_name || note.admin_employee_id} - {formatDate(note.created_at)}</p>
                    <p className="mt-2">{note.note}</p>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      )}

      {activeTab === "timeline" && (
        <Panel>
          <h2 className="text-sm font-black uppercase tracking-widest">Timeline</h2>
          <div className="mt-3 space-y-3">
            {events.map((event: any) => (
              <div key={event.id} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
                <p className="font-black uppercase tracking-wider">{String(event.event_type).replaceAll("_", " ")}</p>
                <p className="text-xs font-bold text-on-surface-variant">{formatDate(event.created_at)} - {event.actor_type}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
