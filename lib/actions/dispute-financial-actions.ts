"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { verifyAndReleasePayment } from "@/lib/payment-processing";
import { writeGovernanceAudit } from "@/lib/actions/governance";

const FINANCIAL_OUTCOMES = [
  "no_financial_action",
  "release_payment",
  "hold_payment",
  "refund_review_required",
  "partial_refund_review_required",
  "payment_provider_investigation",
  "escalate_financial_case",
] as const;

const HIGH_RISK_ACTIONS = new Set([
  "release_payment",
  "refund_review_required",
  "partial_refund_review_required",
  "payment_provider_investigation",
  "escalate_financial_case",
]);

type FinancialOutcome = (typeof FINANCIAL_OUTCOMES)[number];

function cleanText(value: unknown, maxLength = 2000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function isOutcome(value: unknown): value is FinancialOutcome {
  return typeof value === "string" && FINANCIAL_OUTCOMES.includes(value as FinancialOutcome);
}

function idempotencyKey(parts: Array<string | null | undefined>) {
  return crypto.createHash("sha256").update(parts.filter(Boolean).join(":")).digest("hex");
}

function maskReference(value: unknown) {
  const text = String(value || "");
  if (!text) return null;
  if (text.length <= 10) return `${text.slice(0, 2)}...${text.slice(-2)}`;
  return `${text.slice(0, 6)}...${text.slice(-4)}`;
}

function isProviderSuccess(value: unknown) {
  return String(value || "").toLowerCase() === "success";
}

async function notifyParticipant(userId: string, title: string, body: string, linkHref: string) {
  await sql`
    INSERT INTO notifications (user_id, type, title, body, link_href)
    VALUES (${userId}, 'dispute_update', ${title}, ${body}, ${linkHref})
  `.catch(() => undefined);
}

async function recordFinancialEvent(input: {
  disputeId: string;
  actorId: string;
  eventType: string;
  oldStatus?: string | null;
  newStatus?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await sql`
    INSERT INTO dispute_events (
      dispute_id,
      actor_type,
      actor_id,
      event_type,
      old_status,
      new_status,
      metadata
    )
    VALUES (
      ${input.disputeId},
      'admin',
      ${input.actorId},
      ${input.eventType},
      ${input.oldStatus ?? null},
      ${input.newStatus ?? null},
      ${input.metadata ? JSON.stringify(input.metadata) : null}
    )
  `;
}

async function getFinancialCase(disputeId: string) {
  const rows = await sql`
    SELECT
      d.id AS dispute_id,
      d.status AS dispute_status,
      d.final_decision,
      d.final_reason,
      d.requested_resolution,
      d.assigned_admin_id,
      d.client_id,
      d.worker_id,
      d.financial_action_state,
      j.id AS job_id,
      j.title AS job_title,
      j.status AS job_status,
      c.id AS contract_id,
      COALESCE(c.payment_amount, j.budget) AS contract_amount,
      p.id AS payment_id,
      p.amount AS payment_amount,
      p.status AS payment_status,
      p.chapa_ref,
      p.chapa_reference,
      p.chapa_status,
      p.financial_hold_status,
      p.hold_dispute_id,
      p.hold_reason,
      p.held_at
    FROM disputes d
    JOIN jobs j ON j.id = d.job_id
    LEFT JOIN contracts c ON c.id = d.contract_id
    LEFT JOIN payments p ON p.id = d.payment_id OR (d.payment_id IS NULL AND p.job_id = j.id)
    WHERE d.id = ${disputeId}
    ORDER BY p.created_at DESC NULLS LAST
    LIMIT 1
  `;
  return rows[0] ?? null;
}

async function getFinancialCaseReadiness(disputeId: string) {
  const rows = await sql`
    SELECT
      COUNT(DISTINCT e.id)::int AS evidence_count,
      COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'submitted')::int AS submitted_response_count,
      COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'requested')::int AS pending_response_count
    FROM disputes d
    LEFT JOIN dispute_evidence e ON e.dispute_id = d.id AND e.is_removed = false
    LEFT JOIN dispute_responses r ON r.dispute_id = d.id
    WHERE d.id = ${disputeId}
    GROUP BY d.id
  `;
  return {
    evidenceCount: Number(rows[0]?.evidence_count ?? 0),
    submittedResponseCount: Number(rows[0]?.submitted_response_count ?? 0),
    pendingResponseCount: Number(rows[0]?.pending_response_count ?? 0),
  };
}

async function requireFinancialDecisionReadiness(disputeId: string) {
  const readiness = await getFinancialCaseReadiness(disputeId);
  if (readiness.evidenceCount < 1) {
    return "Financial action requires recorded dispute evidence.";
  }
  if (readiness.submittedResponseCount < 1) {
    return "Financial action requires at least one recorded participant response.";
  }
  if (readiness.pendingResponseCount > 0) {
    return "Financial action cannot proceed while requested responses are pending.";
  }
  return null;
}

async function requireOperationalFinancialAdmin(disputeId: string) {
  const admin = await requireAdminPermission("disputes.resolve");
  if (admin.role !== "dispute_payment_admin") {
    return { admin, financialCase: null, error: "Only dispute and payment admins may perform financial case operations." };
  }
  const financialCase = await getFinancialCase(disputeId);
  if (!financialCase) return { admin, financialCase: null, error: "Dispute financial case not found." };
  if (!financialCase.assigned_admin_id) {
    return { admin, financialCase: null, error: "Financial case operations require assignment to a dispute and payment admin." };
  }
  if (financialCase.assigned_admin_id !== admin.id) {
    return { admin, financialCase: null, error: "Only the assigned dispute admin may perform this financial action." };
  }
  return { admin, financialCase, error: null };
}

export async function getDisputeFinancialCase(disputeId: string) {
  const admin = await requireAdminPermission("disputes.read");
  const financialCase = await getFinancialCase(disputeId);
  if (!financialCase) return null;
  const actions = await sql`
    SELECT
      fa.id,
      fa.action,
      fa.proposal_status,
      fa.amount,
      fa.currency,
      fa.reason,
      fa.previous_financial_state,
      fa.new_financial_state,
      fa.provider_action_reference,
      fa.provider_action_status,
      fa.created_at,
      fa.approved_at,
      fa.executed_at,
      proposer.full_name AS proposed_by_name,
      approver.full_name AS approved_by_name
    FROM dispute_financial_actions fa
    LEFT JOIN admin_employees proposer ON proposer.id = fa.proposed_by_admin_id
    LEFT JOIN admin_employees approver ON approver.id = fa.approved_by_admin_id
    WHERE fa.dispute_id = ${disputeId}
    ORDER BY fa.created_at DESC
  `;
  return {
    ...financialCase,
    chapa_ref_masked: maskReference(financialCase.chapa_ref),
    chapa_reference_masked: maskReference(financialCase.chapa_reference),
    canOperate: admin.role === "dispute_payment_admin" && hasAdminPermission(admin, "disputes.resolve"),
    canApproveHighRisk: admin.role === "super_admin" && hasAdminPermission(admin, "disputes.read"),
    actions,
  };
}

export async function placePaymentHold(disputeId: string, reason: string) {
  const { admin, financialCase, error } = await requireOperationalFinancialAdmin(disputeId);
  if (error || !financialCase) return { success: false, status: 403, error };
  const text = cleanText(reason);
  if (text.length < 10) return { success: false, status: 400, error: "Hold reason is required." };
  if (!financialCase.payment_id) return { success: false, status: 409, error: "This dispute has no payment to hold." };
  if (financialCase.payment_status === "released") return { success: false, status: 409, error: "Released payments cannot be placed on platform hold." };
  const readiness = await getFinancialCaseReadiness(disputeId);
  if (readiness.evidenceCount < 1) return { success: false, status: 409, error: "Payment hold requires recorded dispute evidence." };

  const key = idempotencyKey(["hold_payment", financialCase.payment_id, disputeId]);
  const updated = await sql`
    UPDATE payments
    SET financial_hold_status = 'held',
        hold_dispute_id = ${disputeId},
        hold_reason = ${text},
        held_by_admin_id = ${admin.id},
        held_at = COALESCE(held_at, NOW()),
        updated_at = NOW()
    WHERE id = ${financialCase.payment_id}
      AND financial_hold_status IS DISTINCT FROM 'held'
      AND status <> 'released'
    RETURNING id
  `;
  if (updated.length === 0) return { success: false, status: 409, error: "This payment already has an active hold or was released." };

  await sql`
    INSERT INTO dispute_financial_actions (
      dispute_id,
      payment_id,
      action,
      proposal_status,
      reason,
      proposed_by_admin_id,
      previous_financial_state,
      new_financial_state,
      dispute_status_snapshot,
      decision_snapshot,
      payment_status_snapshot,
      hold_status_snapshot,
      idempotency_key,
      executed_at
    )
    VALUES (
      ${disputeId},
      ${financialCase.payment_id},
      'hold_payment',
      'executed',
      ${text},
      ${admin.id},
      ${financialCase.financial_hold_status || "none"},
      'held',
      ${financialCase.dispute_status ?? null},
      ${financialCase.final_decision ?? null},
      ${financialCase.payment_status ?? null},
      ${financialCase.financial_hold_status ?? null},
      ${key},
      NOW()
    )
    ON CONFLICT (idempotency_key) DO NOTHING
  `;
  await sql`
    UPDATE disputes
    SET financial_action_state = 'held',
        financial_action_updated_at = NOW(),
        updated_at = NOW()
    WHERE id = ${disputeId}
  `;
  await recordFinancialEvent({ disputeId, actorId: admin.id, eventType: "payment_hold_placed", newStatus: "held", metadata: { paymentId: financialCase.payment_id } });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "financial_payment_hold_applied",
    module: "financial_disputes",
    targetType: "payment",
    targetId: financialCase.payment_id,
    previousState: { financialHoldStatus: financialCase.financial_hold_status || "none" },
    newState: { financialHoldStatus: "held" },
    reason: text,
    relatedReference: disputeId,
    highRisk: true,
    proposedByAdminId: admin.id,
    executedByType: "admin",
  });
  await Promise.all([
    notifyParticipant(financialCase.client_id, "Payment placed on hold", "A dispute hold was placed on the related payment.", `/client/disputes/${disputeId}`),
    notifyParticipant(financialCase.worker_id, "Payment placed on hold", "A dispute hold was placed on the related payment.", `/worker/disputes/${disputeId}`),
  ]);
  revalidatePath(`/admin/disputes/${disputeId}`);
  return { success: true, status: 200 };
}

export async function proposeFinancialAction(disputeId: string, action: FinancialOutcome, reason: string, amount?: number | null) {
  const { admin, financialCase, error } = await requireOperationalFinancialAdmin(disputeId);
  if (error || !financialCase) return { success: false, status: 403, error };
  if (!isOutcome(action)) return { success: false, status: 400, error: "Invalid financial action." };
  if (action === "hold_payment") return placePaymentHold(disputeId, reason);
  const text = cleanText(reason);
  if (text.length < 10) return { success: false, status: 400, error: "Financial action reason is required." };
  if (!financialCase.payment_id && action !== "no_financial_action") return { success: false, status: 409, error: "This dispute has no payment record." };
  if (!["resolved_for_client", "resolved_for_worker", "resolved_by_agreement", "dismissed", "escalated"].includes(String(financialCase.final_decision || ""))) {
    return { success: false, status: 409, error: "A dispute decision must be recorded before proposing financial action." };
  }
  const readinessError = await requireFinancialDecisionReadiness(disputeId);
  if (readinessError) return { success: false, status: 409, error: readinessError };
  const requestedAmount = amount == null ? null : Math.round(Number(amount));
  if (["partial_refund_review_required", "refund_review_required"].includes(action)) {
    if (financialCase.payment_status !== "released" || !isProviderSuccess(financialCase.chapa_status)) {
      return { success: false, status: 409, error: "Refund review requires a released provider-confirmed payment." };
    }
    if (requestedAmount == null || requestedAmount <= 0 || requestedAmount > Number(financialCase.payment_amount || 0)) {
      return { success: false, status: 400, error: "Refund amount must be greater than zero and not exceed the paid amount." };
    }
  }
  if (action === "release_payment") {
    if (!financialCase.chapa_ref) {
      return { success: false, status: 409, error: "Release requires an existing Chapa transaction reference." };
    }
    if (financialCase.payment_status === "released") {
      return { success: false, status: 409, error: "This payment has already been released." };
    }
    if (financialCase.financial_hold_status !== "held" || String(financialCase.hold_dispute_id || "") !== disputeId) {
      return { success: false, status: 409, error: "Release requires an active hold for this dispute." };
    }
    if (!isProviderSuccess(financialCase.chapa_status)) {
      return { success: false, status: 409, error: "Release requires provider-verified successful payment status." };
    }
  }

  const requiresApproval = HIGH_RISK_ACTIONS.has(action);
  const key = idempotencyKey([action, disputeId, financialCase.payment_id, String(requestedAmount || ""), financialCase.final_decision]);
  try {
    const rows = await sql`
      INSERT INTO dispute_financial_actions (
        dispute_id,
        payment_id,
        action,
        proposal_status,
        amount,
        reason,
        proposed_by_admin_id,
        previous_financial_state,
        new_financial_state,
        provider_action_status,
        dispute_status_snapshot,
        decision_snapshot,
        payment_status_snapshot,
        hold_status_snapshot,
        idempotency_key,
        executed_at
      )
      VALUES (
        ${disputeId},
        ${financialCase.payment_id ?? null},
        ${action},
        ${requiresApproval ? "proposed" : "executed"},
        ${requestedAmount},
        ${text},
        ${admin.id},
        ${financialCase.financial_action_state || "none"},
        ${action},
        ${action.includes("refund") || action.includes("investigation") ? "provider_action_pending" : null},
        ${financialCase.dispute_status ?? null},
        ${financialCase.final_decision ?? null},
        ${financialCase.payment_status ?? null},
        ${financialCase.financial_hold_status ?? null},
        ${key},
        ${requiresApproval ? null : new Date()}
      )
      RETURNING id
    `;
    await sql`
      UPDATE disputes
      SET financial_action_state = ${requiresApproval ? "proposal_pending" : action},
          financial_action_required = ${requiresApproval},
          financial_action_updated_at = NOW(),
          updated_at = NOW()
      WHERE id = ${disputeId}
    `;
    await recordFinancialEvent({
      disputeId,
      actorId: admin.id,
      eventType: requiresApproval ? "financial_action_proposed" : "financial_action_recorded",
      metadata: { action, financialActionId: rows[0]?.id, amount: requestedAmount },
    });
    await writeGovernanceAudit({
      actorType: "admin",
      adminEmployeeId: admin.id,
      adminRole: admin.role,
      action: `financial_${action}_${requiresApproval ? "proposed" : "recorded"}`,
      module: "financial_disputes",
      targetType: "dispute",
      targetId: disputeId,
      previousState: { financialActionState: financialCase.financial_action_state || "none" },
      newState: { financialActionState: requiresApproval ? "proposal_pending" : action, amount: requestedAmount },
      reason: text,
      relatedReference: rows[0]?.id ?? disputeId,
      highRisk: requiresApproval,
      proposedByAdminId: admin.id,
      executedByType: requiresApproval ? null : "admin",
      details: { paymentId: financialCase.payment_id, proposedAction: action },
    });
    if (action === "refund_review_required" || action === "partial_refund_review_required") {
      await Promise.all([
        notifyParticipant(financialCase.client_id, "Refund review initiated", "A refund review was opened for your dispute. No refund is marked complete yet.", `/client/disputes/${disputeId}`),
        notifyParticipant(financialCase.worker_id, "Refund review initiated", "A refund review was opened for your dispute. No refund is marked complete yet.", `/worker/disputes/${disputeId}`),
      ]);
    } else if (action === "escalate_financial_case" || action === "payment_provider_investigation") {
      await Promise.all([
        notifyParticipant(financialCase.client_id, "Financial case escalated", "The financial dispute case was escalated for further review.", `/client/disputes/${disputeId}`),
        notifyParticipant(financialCase.worker_id, "Financial case escalated", "The financial dispute case was escalated for further review.", `/worker/disputes/${disputeId}`),
      ]);
    } else if (action === "no_financial_action") {
      await Promise.all([
        notifyParticipant(financialCase.client_id, "Financial decision finalized", "The dispute was finalized with no financial action.", `/client/disputes/${disputeId}`),
        notifyParticipant(financialCase.worker_id, "Financial decision finalized", "The dispute was finalized with no financial action.", `/worker/disputes/${disputeId}`),
      ]);
    }
    revalidatePath(`/admin/disputes/${disputeId}`);
    return { success: true, status: 200, actionId: rows[0]?.id, requiresApproval };
  } catch (err: any) {
    if (String(err?.message || "").includes("dispute_financial")) {
      return { success: false, status: 409, error: "A pending financial action already exists for this dispute." };
    }
    throw err;
  }
}

export async function rejectFinancialAction(actionId: string, reason: string) {
  const admin = await requireAdminPermission("disputes.read");
  if (admin.role !== "super_admin") return { success: false, status: 403, error: "Only super admin may reject high-risk financial proposals." };
  const text = cleanText(reason);
  if (text.length < 10) return { success: false, status: 400, error: "Rejection reason is required." };
  const rows = await sql`
    UPDATE dispute_financial_actions
    SET proposal_status = 'rejected',
        rejected_by_admin_id = ${admin.id},
        rejected_at = NOW(),
        provider_action_status = 'not_executed',
        updated_at = NOW()
    WHERE id = ${actionId}
      AND proposal_status = 'proposed'
    RETURNING dispute_id
  `;
  if (rows.length === 0) return { success: false, status: 409, error: "This proposal is no longer pending." };
  await recordFinancialEvent({ disputeId: rows[0].dispute_id, actorId: admin.id, eventType: "financial_action_rejected", metadata: { actionId, reason: text } });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "financial_high_risk_action_rejected",
    module: "financial_disputes",
    targetType: "financial_action",
    targetId: actionId,
    reason: text,
    relatedReference: rows[0].dispute_id,
    highRisk: true,
    approvedByAdminId: admin.id,
    executedByType: "admin",
  });
  revalidatePath(`/admin/disputes/${rows[0].dispute_id}`);
  return { success: true, status: 200 };
}

export async function approveFinancialAction(actionId: string) {
  const admin = await requireAdminPermission("disputes.read");
  if (admin.role !== "super_admin") return { success: false, status: 403, error: "Only super admin may approve high-risk financial proposals." };

  const rows = await sql`
    SELECT fa.*, d.client_id, d.worker_id, d.final_decision, d.financial_action_state
    FROM dispute_financial_actions fa
    JOIN disputes d ON d.id = fa.dispute_id
    WHERE fa.id = ${actionId}
    LIMIT 1
  `;
  const action = rows[0];
  if (!action) return { success: false, status: 404, error: "Financial proposal not found." };
  if (action.proposal_status !== "proposed") return { success: false, status: 409, error: "This proposal is no longer pending." };
  if (action.decision_snapshot && String(action.decision_snapshot) !== String(action.final_decision || "")) {
    return { success: false, status: 409, error: "The dispute decision changed after this proposal was created." };
  }
  if (action.financial_action_state !== "proposal_pending") {
    return { success: false, status: 409, error: "The financial case state changed after this proposal was created." };
  }

  const approved = await sql`
    UPDATE dispute_financial_actions
    SET proposal_status = 'approved',
        approved_by_admin_id = ${admin.id},
        approved_at = NOW(),
        provider_action_status = CASE
          WHEN action IN ('refund_review_required', 'partial_refund_review_required', 'payment_provider_investigation', 'escalate_financial_case')
          THEN 'provider_action_pending'
          ELSE provider_action_status
        END,
        updated_at = NOW()
    WHERE id = ${actionId}
      AND proposal_status = 'proposed'
    RETURNING *
  `;
  if (approved.length === 0) return { success: false, status: 409, error: "This proposal changed while approving." };

  await sql`
    UPDATE disputes
    SET financial_action_state = ${String(action.action) === "release_payment" ? "release_approved" : String(action.action)},
        financial_action_required = ${String(action.action) !== "release_payment"},
        financial_action_updated_at = NOW(),
        updated_at = NOW()
    WHERE id = ${action.dispute_id}
  `;
  await recordFinancialEvent({ disputeId: action.dispute_id, actorId: admin.id, eventType: "financial_action_approved", metadata: { actionId, action: action.action } });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "financial_high_risk_action_approved",
    module: "financial_disputes",
    targetType: "financial_action",
    targetId: actionId,
    previousState: { proposalStatus: "proposed" },
    newState: { proposalStatus: "approved", action: action.action },
    relatedReference: action.dispute_id,
    highRisk: true,
    proposedByAdminId: action.proposed_by_admin_id,
    approvedByAdminId: admin.id,
    executedByType: "admin",
  });
  await Promise.all([
    notifyParticipant(action.client_id, "Financial dispute action approved", "A financial action was approved for your dispute.", `/client/disputes/${action.dispute_id}`),
    notifyParticipant(action.worker_id, "Financial dispute action approved", "A financial action was approved for your dispute.", `/worker/disputes/${action.dispute_id}`),
  ]);
  revalidatePath(`/admin/disputes/${action.dispute_id}`);
  return { success: true, status: 200 };
}

export async function executeApprovedRelease(actionId: string) {
  const admin = await requireAdminPermission("disputes.resolve");
  if (admin.role !== "dispute_payment_admin") return { success: false, status: 403, error: "Only dispute and payment admins may execute approved release." };
  const rows = await sql`
    SELECT fa.*, d.assigned_admin_id, d.job_id, d.client_id, d.worker_id, d.final_decision, p.chapa_ref, p.chapa_status, p.financial_hold_status, p.hold_dispute_id
    FROM dispute_financial_actions fa
    JOIN disputes d ON d.id = fa.dispute_id
    JOIN payments p ON p.id = fa.payment_id
    WHERE fa.id = ${actionId}
      AND fa.action = 'release_payment'
    LIMIT 1
  `;
  const action = rows[0];
  if (!action) return { success: false, status: 404, error: "Release action not found." };
  if (action.assigned_admin_id && action.assigned_admin_id !== admin.id) return { success: false, status: 409, error: "Only the assigned dispute admin can execute this release." };
  if (action.proposal_status !== "approved") return { success: false, status: 409, error: "Release must be approved by super admin first." };
  if (!action.chapa_ref) return { success: false, status: 409, error: "Release requires Chapa transaction reference." };
  if (action.decision_snapshot && String(action.decision_snapshot) !== String(action.final_decision || "")) {
    return { success: false, status: 409, error: "The dispute decision changed after this release was approved." };
  }
  if (!isProviderSuccess(action.chapa_status)) {
    return { success: false, status: 409, error: "Release requires provider-verified successful payment status." };
  }
  if (action.financial_hold_status === "held" && String(action.hold_dispute_id || "") !== String(action.dispute_id)) {
    return { success: false, status: 409, error: "Release is blocked by another active dispute hold." };
  }
  if (action.executed_at) return { success: false, status: 409, error: "This release action was already executed." };

  const result = await verifyAndReleasePayment({
    txRef: action.chapa_ref,
    jobId: action.job_id,
    source: "dispute_resolution",
    actorUserId: admin.id,
    authorizedDisputeId: action.dispute_id,
  });

  if (!result.success) {
    await sql`
      UPDATE dispute_financial_actions
      SET provider_action_status = 'provider_verification_failed',
          provider_action_response = ${JSON.stringify({ message: result.message, status: result.status })},
          updated_at = NOW()
      WHERE id = ${actionId}
    `;
    return { success: false, status: 409, error: result.message };
  }

  await sql`
    UPDATE payments
    SET financial_hold_status = 'none',
        hold_released_at = NOW(),
        hold_release_reason = 'Approved dispute release',
        updated_at = NOW()
    WHERE id = ${action.payment_id}
  `;
  await sql`
    UPDATE dispute_financial_actions
    SET proposal_status = 'executed',
        provider_action_status = 'released',
        provider_action_reference = ${result.chapaReference ?? null},
        provider_action_response = ${JSON.stringify({ paymentId: result.paymentId, idempotent: result.idempotent })},
        executed_at = NOW(),
        updated_at = NOW()
    WHERE id = ${actionId}
      AND proposal_status = 'approved'
  `;
  await sql`
    UPDATE disputes
    SET financial_action_state = 'release_executed',
        financial_action_required = false,
        financial_action_updated_at = NOW(),
        updated_at = NOW()
    WHERE id = ${action.dispute_id}
  `;
  await recordFinancialEvent({ disputeId: action.dispute_id, actorId: admin.id, eventType: "payment_released_after_dispute", metadata: { actionId, paymentId: action.payment_id } });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "financial_release_payment_executed",
    module: "financial_disputes",
    targetType: "payment",
    targetId: action.payment_id,
    previousState: { proposalStatus: "approved" },
    newState: { proposalStatus: "executed", providerActionStatus: "released" },
    relatedReference: action.dispute_id,
    highRisk: true,
    proposedByAdminId: action.proposed_by_admin_id,
    approvedByAdminId: action.approved_by_admin_id,
    executedByType: "admin",
    details: { providerReference: result.chapaReference ?? null, idempotent: result.idempotent },
  });
  await Promise.all([
    notifyParticipant(action.client_id, "Payment released", "The disputed payment was released after review.", `/client/disputes/${action.dispute_id}`),
    notifyParticipant(action.worker_id, "Payment released", "The disputed payment was released after review.", `/worker/disputes/${action.dispute_id}`),
  ]);
  revalidatePath(`/admin/disputes/${action.dispute_id}`);
  return { success: true, status: 200 };
}
