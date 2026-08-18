import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  addInternalDisputeNote,
  claimDispute,
  declareDisputeConflict,
  getAdminDisputeDetails,
  requestDisputeResponse,
  resolveDispute,
} from "@/lib/actions/disputes";
import {
  approveFinancialAction,
  executeApprovedRelease,
  getDisputeFinancialCase,
  placePaymentHold,
  proposeFinancialAction,
  rejectFinancialAction,
} from "@/lib/actions/dispute-financial-actions";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

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

export default async function AdminDisputeCasePage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPermission("disputes.read");
  const { id } = await params;
  const data = await getAdminDisputeDetails(id);
  if (!data) notFound();
  const financialCase = await getDisputeFinancialCase(id);

  const { dispute, events, evidence, responses, notes } = data;
  const canReview = hasAdminPermission(admin, "disputes.review") && admin.role === "dispute_payment_admin";
  const canRequest = hasAdminPermission(admin, "disputes.request_evidence") && admin.role === "dispute_payment_admin";
  const canResolve = hasAdminPermission(admin, "disputes.resolve") && admin.role === "dispute_payment_admin";

  async function claim(formData: FormData) {
    "use server";
    const reason = String(formData.get("reason") || "");
    const result = await claimDispute(id, reason);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/disputes/${id}`);
  }

  async function requestInfo(formData: FormData) {
    "use server";
    const target = String(formData.get("target") || "") as "client" | "worker";
    const instruction = String(formData.get("instruction") || "");
    const dueAt = String(formData.get("dueAt") || "") || null;
    const result = await requestDisputeResponse(id, target, instruction, dueAt);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/disputes/${id}`);
  }

  async function addNote(formData: FormData) {
    "use server";
    const note = String(formData.get("note") || "");
    const result = await addInternalDisputeNote(id, note);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/disputes/${id}`);
  }

  async function conflict(formData: FormData) {
    "use server";
    const reason = String(formData.get("reason") || "");
    const result = await declareDisputeConflict(id, reason);
    if (!result.success) throw new Error(result.error);
    redirect("/admin/disputes");
  }

  async function resolve(formData: FormData) {
    "use server";
    const decision = String(formData.get("decision") || "") as any;
    const reason = String(formData.get("reason") || "");
    const result = await resolveDispute(id, decision, reason);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/disputes/${id}`);
  }

  async function holdPayment(formData: FormData) {
    "use server";
    const reason = String(formData.get("reason") || "");
    const result = await placePaymentHold(id, reason);
    if (!result.success) throw new Error(result.error ?? "Unable to place payment hold.");
    redirect(`/admin/disputes/${id}`);
  }

  async function proposeFinancial(formData: FormData) {
    "use server";
    const action = String(formData.get("action") || "") as any;
    const reason = String(formData.get("reason") || "");
    const amount = formData.get("amount") ? Number(formData.get("amount")) : null;
    const result = await proposeFinancialAction(id, action, reason, amount);
    if (!result.success) {
      throw new Error(("error" in result ? result.error : null) ?? "Unable to propose financial action.");
    }
    redirect(`/admin/disputes/${id}`);
  }

  async function approveFinancial(formData: FormData) {
    "use server";
    const actionId = String(formData.get("actionId") || "");
    const result = await approveFinancialAction(actionId);
    if (!result.success) throw new Error(result.error ?? "Unable to approve financial action.");
    redirect(`/admin/disputes/${id}`);
  }

  async function rejectFinancial(formData: FormData) {
    "use server";
    const actionId = String(formData.get("actionId") || "");
    const reason = String(formData.get("reason") || "");
    const result = await rejectFinancialAction(actionId, reason);
    if (!result.success) throw new Error(result.error ?? "Unable to reject financial action.");
    redirect(`/admin/disputes/${id}`);
  }

  async function executeRelease(formData: FormData) {
    "use server";
    const actionId = String(formData.get("actionId") || "");
    const result = await executeApprovedRelease(actionId);
    if (!result.success) throw new Error(result.error ?? "Unable to execute payment release.");
    redirect(`/admin/disputes/${id}`);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      <Link href="/admin/disputes" className="text-xs font-black uppercase tracking-widest text-primary">
        Back to dispute queue
      </Link>

      <header className="rounded-2xl border border-outline-variant bg-surface-container-low p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Dispute Case</p>
        <h1 className="mt-2 text-3xl font-black text-on-surface">{dispute.title || dispute.job_title}</h1>
        <p className="mt-2 text-sm font-semibold text-on-surface-variant">
          #{String(dispute.id).slice(0, 8)} · {String(dispute.status).replaceAll("_", " ")} · {dispute.category || "other"}
        </p>
      </header>

      {!canReview && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-bold">
          Read-only oversight mode. Super admin can inspect this case but cannot perform ordinary dispute operations.
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest">Parties</h2>
          <p className="mt-3 text-sm font-bold">Client: {dispute.client_name || dispute.client_id}</p>
          <p className="mt-1 text-sm font-bold">Worker: {dispute.worker_name || dispute.worker_id}</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest">Transaction</h2>
          <p className="mt-3 text-sm font-bold">Job: {dispute.job_title}</p>
          <p className="mt-1 text-sm font-bold">Contract: {dispute.current_contract_status || "Not recorded"}</p>
          <p className="mt-1 text-sm font-bold">Payment: {dispute.current_payment_status || "Not recorded"}</p>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest">Assignment</h2>
          <p className="mt-3 text-sm font-bold">{dispute.assigned_admin_name || "Unassigned"}</p>
          <p className="mt-1 text-xs font-bold text-on-surface-variant">Assigned {formatDate(dispute.assigned_at)}</p>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <h2 className="text-sm font-black uppercase tracking-widest">Submitted Case</h2>
        <p className="mt-3 text-sm font-semibold text-on-surface-variant">{dispute.description}</p>
        <p className="mt-3 text-xs font-black uppercase tracking-widest">Requested resolution: {dispute.requested_resolution}</p>
      </section>

      {canReview && (
        <section className="grid gap-4 lg:grid-cols-2">
          <form action={claim} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h2 className="text-sm font-black uppercase tracking-widest">Claim / Reassign</h2>
            <textarea name="reason" rows={3} placeholder="Reason required only when reassigning another admin's case" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
            <button className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Claim Case</button>
          </form>

          <form action={conflict} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h2 className="text-sm font-black uppercase tracking-widest">Declare Conflict</h2>
            <textarea name="reason" rows={3} required placeholder="Explain the conflict of interest" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
            <button className="h-11 rounded-lg border border-error/20 bg-error/10 px-4 text-xs font-black uppercase tracking-widest text-error">Declare Conflict</button>
          </form>
        </section>
      )}

      {canRequest && (
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
      )}

      {canReview && (
        <form action={addNote} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest">Internal Admin Notes</h2>
          <textarea name="note" rows={4} required placeholder="Invisible to client and worker" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
          <button className="h-11 rounded-lg bg-surface-container px-4 text-xs font-black uppercase tracking-widest">Add Internal Note</button>
        </form>
      )}

      {canResolve && (
        <form action={resolve} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest">Resolution Foundation</h2>
          <select name="decision" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
            <option value="resolved_for_client">Resolved for client</option>
            <option value="resolved_for_worker">Resolved for worker</option>
            <option value="resolved_by_agreement">Resolved by agreement</option>
            <option value="dismissed">Dismissed</option>
            <option value="escalated">Escalated</option>
          </select>
          <textarea name="reason" rows={4} required placeholder="Mandatory decision reason" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
          <button className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Record Decision</button>
          <p className="text-xs font-bold text-on-surface-variant">Refund outcomes remain review-required and are not marked complete until a provider/manual finance confirmation exists.</p>
        </form>
      )}

      {financialCase && (
        <section className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Financial Case</p>
            <h2 className="mt-1 text-xl font-black text-on-surface">Controlled Payment Actions</h2>
            <p className="mt-1 text-sm font-semibold text-on-surface-variant">
              Payment {financialCase.payment_id ? `#${String(financialCase.payment_id).slice(0, 8)}` : "not recorded"} ·
              {" "}{financialCase.payment_status || "no payment"} · hold {financialCase.financial_hold_status || "none"}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-outline-variant bg-surface-container p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Contract amount</p>
              <p className="mt-1 text-sm font-black">{Number(financialCase.contract_amount || 0).toLocaleString()} ETB</p>
            </div>
            <div className="rounded-lg border border-outline-variant bg-surface-container p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Payment amount</p>
              <p className="mt-1 text-sm font-black">{Number(financialCase.payment_amount || 0).toLocaleString()} ETB</p>
            </div>
            <div className="rounded-lg border border-outline-variant bg-surface-container p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Chapa ref</p>
              <p className="mt-1 text-sm font-black">{financialCase.chapa_ref_masked || "Not recorded"}</p>
            </div>
            <div className="rounded-lg border border-outline-variant bg-surface-container p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Financial state</p>
              <p className="mt-1 text-sm font-black">{financialCase.financial_action_state || "none"}</p>
            </div>
          </div>

          {canResolve && (
            <div className="grid gap-4 lg:grid-cols-2">
              <form action={holdPayment} className="space-y-3 rounded-lg border border-outline-variant bg-surface-container p-4">
                <h3 className="text-sm font-black uppercase tracking-widest">Place Hold</h3>
                <textarea name="reason" required rows={3} placeholder="Reason for hold" className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-sm" />
                <button className="h-11 rounded-lg border border-error/20 bg-error/10 px-4 text-xs font-black uppercase tracking-widest text-error">
                  Hold Payment
                </button>
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
                <button className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">
                  Submit Proposal
                </button>
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
                        {action.proposal_status} · {action.amount ? `${Number(action.amount).toLocaleString()} ${action.currency}` : "no amount"} · {formatDate(action.created_at)}
                      </p>
                      <p className="mt-2 text-on-surface-variant">{action.reason}</p>
                    </div>
                    {canResolve && action.action === "release_payment" && action.proposal_status === "approved" && (
                      <form action={executeRelease}>
                        <input type="hidden" name="actionId" value={action.id} />
                        <button className="rounded-lg bg-primary px-3 py-2 text-[11px] font-black uppercase tracking-wider text-on-primary">Execute Release</button>
                      </form>
                    )}
                  </div>
                  {financialCase.canApproveHighRisk && action.proposal_status === "proposed" && (
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

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest">Creation Snapshot</h2>
          <div className="mt-3"><JsonBlock value={dispute.creation_snapshot} /></div>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <h2 className="text-sm font-black uppercase tracking-widest">System Evidence</h2>
          <div className="mt-3 space-y-2 text-sm font-bold text-on-surface-variant">
            <p>Job status: {dispute.current_job_status}</p>
            <p>Contract terms: {dispute.terms_status || "Not recorded"}</p>
            <p>Payment status: {dispute.current_payment_status || "Not recorded"}</p>
            <p>Completion rejection: {dispute.completion_rejection_reason || "None"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <h2 className="text-sm font-black uppercase tracking-widest">Evidence</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {evidence.length === 0 ? <p className="text-sm font-bold text-on-surface-variant">No uploaded evidence.</p> : evidence.map((item: any) => (
            <a key={item.id} href={`/api/disputes/${id}/evidence/${item.id}`} target="_blank" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm font-bold text-primary">
              {item.file_name || "Evidence"} · {item.mime_type}
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <h2 className="text-sm font-black uppercase tracking-widest">Responses</h2>
        <div className="mt-3 space-y-3">
          {responses.length === 0 ? <p className="text-sm font-bold text-on-surface-variant">No response requests.</p> : responses.map((response: any) => (
            <div key={response.id} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
              <p className="font-black">{response.requested_from} · {response.status}</p>
              <p className="mt-1 text-on-surface-variant">{response.instruction}</p>
              {response.response_text && <p className="mt-2 font-semibold">{response.response_text}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <h2 className="text-sm font-black uppercase tracking-widest">Internal Notes</h2>
        <div className="mt-3 space-y-3">
          {notes.length === 0 ? <p className="text-sm font-bold text-on-surface-variant">No internal notes.</p> : notes.map((note: any) => (
            <div key={note.id} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
              <p className="text-xs font-black uppercase tracking-widest">{note.admin_name || note.admin_employee_id} · {formatDate(note.created_at)}</p>
              <p className="mt-2">{note.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
        <h2 className="text-sm font-black uppercase tracking-widest">Timeline</h2>
        <div className="mt-3 space-y-3">
          {events.map((event: any) => (
            <div key={event.id} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
              <p className="font-black uppercase tracking-wider">{String(event.event_type).replaceAll("_", " ")}</p>
              <p className="text-xs font-bold text-on-surface-variant">{formatDate(event.created_at)} · {event.actor_type}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
