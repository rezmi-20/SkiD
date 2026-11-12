import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AdminDisputeCaseTabs from "@/components/admin/AdminDisputeCaseTabs";
import { AdminDisputeCaseHeader } from "@/components/admin/disputes/AdminDisputeCaseHeader";
import {
  addInternalDisputeNote,
  claimDispute,
  declareDisputeConflict,
  getAdminDisputeDetails,
  requestDisputeResponse,
  resolveDispute,
  updateDisputeCategory,
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
  const canClaim =
    hasAdminPermission(admin, "disputes.review") &&
    isDisputePaymentAdmin &&
    !isConflicted &&
    !isTerminal &&
    !isAssignedToCurrentAdmin;
  const canDeclareConflict =
    hasAdminPermission(admin, "disputes.review") &&
    isDisputePaymentAdmin &&
    !isConflicted &&
    isAssignedToCurrentAdmin &&
    !isTerminal;
  const canOperate =
    hasAdminPermission(admin, "disputes.review") &&
    isDisputePaymentAdmin &&
    !isConflicted &&
    isAssignedToCurrentAdmin &&
    !isTerminal;
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
      redirect(
        `/admin/disputes/${id}?disputeActionError=${encodeURIComponent(result.error || "Unable to request information.")}`
      );
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
    if (!result.success) throw new Error(result.error || "Payment hold failed");
    redirect(`/admin/disputes/${id}`);
  }

  async function proposeFinancial(formData: FormData) {
    "use server";
    const action = String(formData.get("action") || "") as any;
    const amount = Number(formData.get("amount") || 0) || null;
    const reason = String(formData.get("reason") || "");
    const result = await proposeFinancialAction(id, action, reason, amount);
    if (!result.success) throw new Error((result as any).error || "Failed to propose financial action");
    redirect(`/admin/disputes/${id}`);
  }

  async function approveFinancial(formData: FormData) {
    "use server";
    const actionId = String(formData.get("actionId") || "");
    const result = await approveFinancialAction(actionId);
    if (!result.success) throw new Error(result.error || "Approval failed");
    redirect(`/admin/disputes/${id}`);
  }

  async function rejectFinancial(formData: FormData) {
    "use server";
    const actionId = String(formData.get("actionId") || "");
    const reason = String(formData.get("reason") || "");
    const result = await rejectFinancialAction(actionId, reason);
    if (!result.success) throw new Error(result.error || "Rejection failed");
    redirect(`/admin/disputes/${id}`);
  }

  async function executeRelease(formData: FormData) {
    "use server";
    const actionId = String(formData.get("actionId") || "");
    const result = await executeApprovedRelease(actionId);
    if (!result.success) throw new Error(result.error || "Execution failed");
    redirect(`/admin/disputes/${id}`);
  }

  async function reclassify(formData: FormData) {
    "use server";
    const category = String(formData.get("category") || "");
    const result = await updateDisputeCategory(id, category);
    if (!result.success) throw new Error(result.error);
    redirect(`/admin/disputes/${id}`);
  }

  return (
    <div className="w-full space-y-6 pb-24">
      {/* 1. Flush, Unboxed Header with 100% Trilingual Localization */}
      <AdminDisputeCaseHeader
        dispute={dispute}
        isDisputePaymentAdmin={isDisputePaymentAdmin}
        isTerminal={isTerminal}
        actionError={actionError}
      />

      {/* 2. Unified Case Tabs Component */}
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
        reclassify={reclassify}
      />
    </div>
  );
}
