import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminDisputeCaseTabs from "@/components/admin/AdminDisputeCaseTabs";
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

export default async function AdminDisputeCasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminPermission("disputes.read");
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const actionError = typeof query.disputeActionError === "string" ? query.disputeActionError : null;
  const data = await getAdminDisputeDetails(id);
  if (!data) notFound();

  const financialCase = await getDisputeFinancialCase(id);
  const { dispute, events, evidence, responses, notes } = data;
  const conflictAdminIds = Array.isArray(dispute.conflict_admin_ids) ? dispute.conflict_admin_ids.map(String) : [];
  const isConflicted = conflictAdminIds.includes(admin.id);
  const isDisputePaymentAdmin = admin.role === "dispute_payment_admin";
  const isAssignedToCurrentAdmin = dispute.assigned_admin_id === admin.id;
  const isTerminal = ["resolved", "dismissed"].includes(String(dispute.status || ""));
  const canClaim = hasAdminPermission(admin, "disputes.review") && isDisputePaymentAdmin && !isConflicted && !isTerminal && !isAssignedToCurrentAdmin;
  const canDeclareConflict = hasAdminPermission(admin, "disputes.review") && isDisputePaymentAdmin && !isConflicted && isAssignedToCurrentAdmin && !isTerminal;
  const canOperate = hasAdminPermission(admin, "disputes.review") && isDisputePaymentAdmin && !isConflicted && isAssignedToCurrentAdmin && !isTerminal;
  const canRequest = canOperate && hasAdminPermission(admin, "disputes.request_evidence");
  const canResolve = canOperate && hasAdminPermission(admin, "disputes.resolve");

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
    if (!result.success) {
      redirect(`/admin/disputes/${id}?disputeActionError=${encodeURIComponent(result.error || "Unable to request information.")}`);
    }
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
    const operationalOutcome = String(formData.get("operationalOutcome") || "") || null;
    const result = await resolveDispute(id, decision, reason, operationalOutcome);
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
          #{String(dispute.id).slice(0, 8)} - {String(dispute.status).replaceAll("_", " ")} - {dispute.category || "other"}
        </p>
      </header>

      {!isDisputePaymentAdmin && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-bold">
          Read-only oversight mode. Super admin can inspect this case but cannot perform ordinary dispute operations.
        </div>
      )}

      {isTerminal && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm font-bold">
          This dispute is terminal and read-only. Final decision, timeline, evidence, responses, internal notes, and resulting job/payment state remain available for review.
        </div>
      )}

      <AdminDisputeCaseTabs
        dispute={dispute}
        financialCase={financialCase}
        events={events}
        evidence={evidence}
        responses={responses}
        notes={notes}
        disputeId={id}
        actionError={actionError}
        isConflicted={isConflicted}
        isAssignedToCurrentAdmin={isAssignedToCurrentAdmin}
        hasAssignedAdmin={Boolean(dispute.assigned_admin_id)}
        isTerminal={isTerminal}
        canClaim={canClaim}
        canDeclareConflict={canDeclareConflict}
        canOperate={canOperate}
        canRequest={canRequest}
        canResolve={canResolve}
        claim={claim}
        conflict={conflict}
        requestInfo={requestInfo}
        addNote={addNote}
        resolve={resolve}
        holdPayment={holdPayment}
        proposeFinancial={proposeFinancial}
        approveFinancial={approveFinancial}
        rejectFinancial={rejectFinancial}
        executeRelease={executeRelease}
      />
    </div>
  );
}
