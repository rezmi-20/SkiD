"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/actions/notifications";
import { assertCanModifyAdminAccount, hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import {
  APPEAL_OUTCOMES,
  APPEAL_REASONS,
  APPEAL_STATUSES,
  APPEAL_TYPES,
  GOVERNANCE_APPEAL_WINDOW_DAYS,
  MISCONDUCT_REVIEW_OUTCOMES,
  MISCONDUCT_REVIEW_STATUSES,
} from "@/lib/governance-constants";

type AppealType = (typeof APPEAL_TYPES)[number];
type AppealReason = (typeof APPEAL_REASONS)[number];
type AppealOutcome = (typeof APPEAL_OUTCOMES)[number];
type MisconductStatus = (typeof MISCONDUCT_REVIEW_STATUSES)[number];
type MisconductOutcome = (typeof MISCONDUCT_REVIEW_OUTCOMES)[number];

const SENSITIVE_KEY = /fin|password|hash|otp|token|secret|credential|cookie|session|jwt|chapa|file_url|document|raw/i;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cleanText(value: unknown, max = 2000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function isOneOf<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && values.includes(value as T[number]);
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function sanitizeAuditValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeAuditValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !SENSITIVE_KEY.test(key))
      .map(([key, nested]) => [key, sanitizeAuditValue(nested)]),
  );
}

function idempotencyKey(parts: Array<string | null | undefined>) {
  return crypto.createHash("sha256").update(parts.filter(Boolean).join(":")).digest("hex");
}

async function nextReference(prefix: "GOV" | "APL", sequence: "misconduct_review_ref_seq" | "appeal_ref_seq") {
  const rows = await sql.query(`SELECT nextval('${sequence}')::int AS seq`, []);
  return `${prefix}-${new Date().getFullYear()}-${String(Number(rows[0]?.seq || 1)).padStart(6, "0")}`;
}

export async function writeGovernanceAudit(input: {
  actorType: "admin" | "user" | "system";
  adminEmployeeId?: string | null;
  adminRole?: string | null;
  userId?: string | null;
  action: string;
  module: string;
  targetType?: string | null;
  targetId?: string | null;
  previousState?: Record<string, unknown> | null;
  newState?: Record<string, unknown> | null;
  reason?: string | null;
  relatedReference?: string | null;
  highRisk?: boolean;
  proposedByAdminId?: string | null;
  approvedByAdminId?: string | null;
  executedByType?: "admin" | "system" | "provider" | null;
  details?: Record<string, unknown> | null;
}) {
  await sql`
    INSERT INTO audit_logs (
      actor_type,
      admin_employee_id,
      admin_role,
      user_id,
      action,
      module,
      target_type,
      target_id,
      previous_state,
      new_state,
      reason,
      related_reference,
      high_risk,
      proposed_by_admin_id,
      approved_by_admin_id,
      executed_by_type,
      details
    )
    VALUES (
      ${input.actorType},
      ${input.adminEmployeeId ?? null},
      ${input.adminRole ?? null},
      ${input.userId ?? null},
      ${input.action},
      ${input.module},
      ${input.targetType ?? null},
      ${input.targetId ?? null},
      ${input.previousState ? JSON.stringify(sanitizeAuditValue(input.previousState)) : null},
      ${input.newState ? JSON.stringify(sanitizeAuditValue(input.newState)) : null},
      ${input.reason ? cleanText(input.reason, 1000) : null},
      ${input.relatedReference ?? null},
      ${Boolean(input.highRisk)},
      ${input.proposedByAdminId ?? null},
      ${input.approvedByAdminId ?? null},
      ${input.executedByType ?? null},
      ${input.details ? JSON.stringify(sanitizeAuditValue(input.details)) : null}
    )
  `;
}

function periodRange(period = "last_7_days", from?: string, to?: string) {
  const now = new Date();
  if (period === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  }
  if (period === "last_30_days") return { start: new Date(now.getTime() - 30 * 864e5), end: now };
  if (period === "custom") {
    const start = new Date(String(from || ""));
    const end = new Date(String(to || ""));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      return { error: "Invalid custom date range." as const, start: null, end: null };
    }
    if (end.getTime() - start.getTime() > 370 * 864e5) {
      return { error: "Custom report range is too large." as const, start: null, end: null };
    }
    return { start, end };
  }
  return { start: new Date(now.getTime() - 7 * 864e5), end: now };
}

export async function getAuditLogEntries(input: {
  q?: string;
  action?: string;
  module?: string;
  targetType?: string;
  adminEmployeeId?: string;
  adminRole?: string;
  highRiskOnly?: boolean;
  page?: number;
  from?: string;
  to?: string;
} = {}) {
  const admin = await requireAdminPermission("audit.read");
  if (admin.role !== "super_admin") return { entries: [], page: 1, pageSize: 50, error: "Only super admin may view global audit logs." };
  const page = Math.max(1, Number(input.page || 1));
  const pageSize = 50;
  const offset = (page - 1) * pageSize;
  const q = `%${cleanText(input.q, 120)}%`;
  const highRisk = Boolean(input.highRiskOnly);
  const start = input.from ? new Date(input.from) : null;
  const end = input.to ? new Date(input.to) : null;
  return {
    page,
    pageSize,
    entries: await sql`
      SELECT
        al.id,
        al.created_at,
        al.actor_type,
        al.action,
        al.module,
        al.target_type,
        al.target_id,
        al.reason,
        al.related_reference,
        al.high_risk,
        al.executed_by_type,
        actor.admin_employee_id AS actor_employee_id,
        actor.full_name AS actor_name,
        actor.admin_role AS actor_role,
        proposer.admin_employee_id AS proposed_by_employee_id,
        approver.admin_employee_id AS approved_by_employee_id
      FROM audit_logs al
      LEFT JOIN admin_employees actor ON actor.id = al.admin_employee_id
      LEFT JOIN admin_employees proposer ON proposer.id = al.proposed_by_admin_id
      LEFT JOIN admin_employees approver ON approver.id = al.approved_by_admin_id
      WHERE (${q} = '%%' OR al.action ILIKE ${q} OR al.target_id ILIKE ${q} OR al.related_reference ILIKE ${q} OR actor.full_name ILIKE ${q} OR actor.admin_employee_id ILIKE ${q})
        AND (${cleanText(input.action, 80) || null}::text IS NULL OR al.action = ${cleanText(input.action, 80) || null})
        AND (${cleanText(input.module, 80) || null}::text IS NULL OR al.module = ${cleanText(input.module, 80) || null})
        AND (${cleanText(input.targetType, 80) || null}::text IS NULL OR al.target_type = ${cleanText(input.targetType, 80) || null})
        AND (${cleanText(input.adminEmployeeId, 80) || null}::uuid IS NULL OR al.admin_employee_id = ${cleanText(input.adminEmployeeId, 80) || null})
        AND (${cleanText(input.adminRole, 80) || null}::text IS NULL OR al.admin_role = ${cleanText(input.adminRole, 80) || null})
        AND (${highRisk} = false OR al.high_risk = true)
        AND (${start ? start.toISOString() : null}::timestamp IS NULL OR al.created_at >= ${start ? start.toISOString() : null})
        AND (${end ? end.toISOString() : null}::timestamp IS NULL OR al.created_at <= ${end ? end.toISOString() : null})
      ORDER BY al.created_at DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `,
  };
}

export async function getAdminActivitySummary(employeeId: string) {
  const admin = await requireAdminPermission("audit.read");
  if (admin.role !== "super_admin") return null;
  const [employeeRows, auditRows, verificationRows, disputeRows, supportRows, financialRows] = await Promise.all([
    sql`
      SELECT id, admin_employee_id, full_name, work_email, admin_role, admin_status, created_at
      FROM admin_employees
      WHERE id = ${employeeId}
      LIMIT 1
    `,
    sql`
      SELECT action, module, target_type, target_id, high_risk, created_at, related_reference
      FROM audit_logs
      WHERE admin_employee_id = ${employeeId}
      ORDER BY created_at DESC
      LIMIT 80
    `,
    sql`SELECT COUNT(*)::int AS count FROM verification_events WHERE admin_employee_id = ${employeeId}`,
    sql`SELECT COUNT(*)::int AS count FROM disputes WHERE assigned_admin_id = ${employeeId} OR admin_id = ${employeeId}`,
    sql`SELECT COUNT(*)::int AS count FROM support_tickets WHERE assigned_admin_id = ${employeeId} OR resolved_by_admin_id = ${employeeId}`,
    sql`SELECT COUNT(*)::int AS count FROM dispute_financial_actions WHERE proposed_by_admin_id = ${employeeId} OR approved_by_admin_id = ${employeeId}`,
  ]);
  const employee = employeeRows[0] ?? null;
  if (!employee) return null;
  return {
    employee,
    counts: {
      verificationDecisions: Number(verificationRows[0]?.count || 0),
      disputesHandled: Number(disputeRows[0]?.count || 0),
      supportTicketsHandled: Number(supportRows[0]?.count || 0),
      financialActions: Number(financialRows[0]?.count || 0),
    },
    auditRows,
  };
}

export async function getMisuseIndicators() {
  const admin = await requireAdminPermission("admin_misconduct.review");
  if (admin.role !== "super_admin") return [];
  const rows = await sql`
    WITH per_admin AS (
      SELECT
        ae.id,
        ae.admin_employee_id,
        ae.full_name,
        ae.admin_role,
        COUNT(al.id) FILTER (WHERE al.action ILIKE '%rejected%' OR al.action ILIKE '%revoked%')::int AS rejection_like_count,
        COUNT(al.id) FILTER (WHERE al.action = 'verification_fin_revealed')::int AS fin_reveal_count,
        COUNT(al.id) FILTER (WHERE al.high_risk = true)::int AS high_risk_count,
        COUNT(al.id) FILTER (WHERE al.action ILIKE '%failed%' OR al.action ILIKE '%denied%')::int AS failed_access_count,
        COUNT(al.id) FILTER (WHERE al.action ILIKE '%reassigned%' OR al.action ILIKE '%assigned%')::int AS assignment_count
      FROM admin_employees ae
      LEFT JOIN audit_logs al ON al.admin_employee_id = ae.id AND al.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY ae.id
    )
    SELECT *,
      CASE
        WHEN fin_reveal_count >= 10 OR high_risk_count >= 10 OR failed_access_count >= 15 THEN 'high_risk_review'
        WHEN rejection_like_count >= 15 OR assignment_count >= 25 OR fin_reveal_count >= 5 OR high_risk_count >= 5 THEN 'attention_required'
        ELSE 'normal'
      END AS misuse_flag
    FROM per_admin
    ORDER BY
      CASE
        WHEN fin_reveal_count >= 10 OR high_risk_count >= 10 OR failed_access_count >= 15 THEN 0
        WHEN rejection_like_count >= 15 OR assignment_count >= 25 OR fin_reveal_count >= 5 OR high_risk_count >= 5 THEN 1
        ELSE 2
      END,
      full_name ASC
  `;
  return rows;
}

async function recordMisconductEvent(reviewId: string, actorAdminId: string, eventType: string, oldStatus?: string | null, newStatus?: string | null, note?: string | null, metadata?: Record<string, unknown>) {
  await sql`
    INSERT INTO admin_misconduct_events (review_id, actor_admin_id, event_type, old_status, new_status, note, metadata)
    VALUES (${reviewId}, ${actorAdminId}, ${eventType}, ${oldStatus ?? null}, ${newStatus ?? null}, ${note ?? null}, ${metadata ? JSON.stringify(sanitizeAuditValue(metadata)) : null})
  `;
}

export async function openMisconductReview(employeeId: string, reason: string, referencedAuditIds: string[] = []) {
  const admin = await requireAdminPermission("admin_misconduct.review");
  if (admin.role !== "super_admin") return { success: false, status: 403, error: "Only super admin may open misconduct reviews." };
  if (!isUuid(employeeId)) return { success: false, status: 400, error: "Invalid administrator employee identifier." };
  if (employeeId === admin.id) return { success: false, status: 403, error: "Super admin cannot open a self-review for their own account." };
  const text = cleanText(reason, 4000);
  if (text.length < 10) return { success: false, status: 400, error: "Governance review reason is required." };
  const auditIds = referencedAuditIds.map((id) => cleanText(id, 80)).filter(isUuid);
  if (auditIds.length !== referencedAuditIds.filter(Boolean).length) {
    return { success: false, status: 400, error: "Referenced audit IDs must be valid immutable audit identifiers." };
  }
  const employee = await sql`SELECT id FROM admin_employees WHERE id = ${employeeId} LIMIT 1`;
  if (!employee[0]) return { success: false, status: 404, error: "Administrator employee not found." };
  const reference = await nextReference("GOV", "misconduct_review_ref_seq");
  const rows = await sql`
    INSERT INTO admin_misconduct_reviews (reference, employee_id, opened_by_admin_id, status, reason, referenced_audit_ids)
    VALUES (${reference}, ${employeeId}, ${admin.id}, 'open', ${text}, ${auditIds})
    RETURNING id, reference
  `;
  await recordMisconductEvent(rows[0].id, admin.id, "opened", null, "open", text, { referencedAuditIds: auditIds });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "admin_misconduct_review_opened",
    module: "governance",
    targetType: "admin_employee",
    targetId: employeeId,
    reason: text,
    relatedReference: rows[0].reference,
    highRisk: true,
  });
  revalidatePath("/admin/misconduct");
  return { success: true, status: 201, reviewId: rows[0].id, reference: rows[0].reference };
}

export async function addMisconductNote(reviewId: string, note: string, status?: MisconductStatus) {
  const admin = await requireAdminPermission("admin_misconduct.review");
  if (admin.role !== "super_admin") return { success: false, status: 403, error: "Only super admin may update misconduct reviews." };
  if (!isUuid(reviewId)) return { success: false, status: 400, error: "Invalid misconduct review identifier." };
  const text = cleanText(note, 4000);
  if (text.length < 4) return { success: false, status: 400, error: "Governance note is required." };
  const reviewRows = await sql`SELECT * FROM admin_misconduct_reviews WHERE id = ${reviewId} LIMIT 1`;
  const review = reviewRows[0];
  if (!review) return { success: false, status: 404, error: "Review not found." };
  const nextStatus = status && isOneOf(MISCONDUCT_REVIEW_STATUSES, status) ? status : review.status;
  await sql`
    UPDATE admin_misconduct_reviews
    SET status = ${nextStatus}, updated_at = NOW()
    WHERE id = ${reviewId}
      AND status NOT IN ('resolved', 'dismissed')
  `;
  await recordMisconductEvent(reviewId, admin.id, "governance_note_added", review.status, nextStatus, text);
  revalidatePath(`/admin/misconduct/${reviewId}`);
  return { success: true, status: 200 };
}

export async function resolveMisconductReview(reviewId: string, outcome: MisconductOutcome, reason: string) {
  const admin = await requireAdminPermission("admin_misconduct.review");
  if (admin.role !== "super_admin") return { success: false, status: 403, error: "Only super admin may resolve misconduct reviews." };
  if (!isUuid(reviewId)) return { success: false, status: 400, error: "Invalid misconduct review identifier." };
  if (!isOneOf(MISCONDUCT_REVIEW_OUTCOMES, outcome)) return { success: false, status: 400, error: "Invalid misconduct outcome." };
  const text = cleanText(reason, 4000);
  if (text.length < 10) return { success: false, status: 400, error: "Outcome reason is required." };
  const reviewRows = await sql`SELECT * FROM admin_misconduct_reviews WHERE id = ${reviewId} LIMIT 1`;
  const review = reviewRows[0];
  if (!review) return { success: false, status: 404, error: "Review not found." };
  assertCanModifyAdminAccount(admin, review.employee_id, outcome === "revoke_admin_access" || outcome === "temporary_suspension" ? "suspend" : "assign_role");
  if (outcome === "temporary_suspension" || outcome === "revoke_admin_access") {
    await requireAdminPermission("admin_accounts.suspend");
    await sql`
      UPDATE admin_employees
      SET admin_status = ${outcome === "revoke_admin_access" ? "revoked" : "suspended"},
          session_version = session_version + 1,
          updated_at = NOW()
      WHERE id = ${review.employee_id}
        AND id <> ${admin.id}
        AND admin_role <> 'super_admin'
    `;
  }
  const nextStatus = outcome === "no_action" ? "dismissed" : "resolved";
  await sql`
    UPDATE admin_misconduct_reviews
    SET status = ${nextStatus},
        outcome = ${outcome},
        outcome_reason = ${text},
        resolved_by_admin_id = ${admin.id},
        resolved_at = NOW(),
        updated_at = NOW()
    WHERE id = ${reviewId}
      AND status NOT IN ('resolved', 'dismissed')
  `;
  await recordMisconductEvent(reviewId, admin.id, "resolved", review.status, nextStatus, text, { outcome });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "admin_misconduct_review_resolved",
    module: "governance",
    targetType: "admin_employee",
    targetId: review.employee_id,
    previousState: { status: review.status },
    newState: { status: nextStatus, outcome },
    reason: text,
    relatedReference: review.reference,
    highRisk: outcome === "temporary_suspension" || outcome === "revoke_admin_access",
    executedByType: "admin",
  });
  revalidatePath("/admin/misconduct");
  revalidatePath("/admin/users");
  return { success: true, status: 200 };
}

export async function getMisconductReviews() {
  const admin = await requireAdminPermission("admin_misconduct.review");
  if (admin.role !== "super_admin") return [];
  return sql`
    SELECT r.*, ae.admin_employee_id, ae.full_name, ae.admin_role, opener.admin_employee_id AS opened_by_employee_id
    FROM admin_misconduct_reviews r
    JOIN admin_employees ae ON ae.id = r.employee_id
    JOIN admin_employees opener ON opener.id = r.opened_by_admin_id
    ORDER BY r.created_at DESC
    LIMIT 100
  `;
}

export async function getMisconductReviewDetails(reviewId: string) {
  const admin = await requireAdminPermission("admin_misconduct.review");
  if (admin.role !== "super_admin") return null;
  if (!isUuid(reviewId)) return null;
  const rows = await sql`
    SELECT r.*, ae.admin_employee_id, ae.full_name, ae.admin_role, ae.admin_status
    FROM admin_misconduct_reviews r
    JOIN admin_employees ae ON ae.id = r.employee_id
    WHERE r.id = ${reviewId}
    LIMIT 1
  `;
  const review = rows[0] ?? null;
  if (!review) return null;
  const events = await sql`
    SELECT e.*, actor.admin_employee_id AS actor_employee_id, actor.full_name AS actor_name
    FROM admin_misconduct_events e
    LEFT JOIN admin_employees actor ON actor.id = e.actor_admin_id
    WHERE e.review_id = ${reviewId}
    ORDER BY e.created_at ASC
  `;
  return { review, events };
}

async function recordAppealEvent(appealId: string, actorType: "client" | "worker" | "super_admin" | "system", actorId: string | null, eventType: string, oldStatus?: string | null, newStatus?: string | null, metadata?: Record<string, unknown>) {
  await sql`
    INSERT INTO appeal_events (appeal_id, actor_type, actor_id, event_type, old_status, new_status, metadata)
    VALUES (${appealId}, ${actorType}, ${actorId}, ${eventType}, ${oldStatus ?? null}, ${newStatus ?? null}, ${metadata ? JSON.stringify(sanitizeAuditValue(metadata)) : null})
  `;
}

async function loadAppealableDecision(appealType: AppealType, targetId: string, userId: string) {
  if (appealType === "dispute_resolution") {
    const rows = await sql`
      SELECT
        d.id,
        d.client_id,
        d.worker_id,
        d.final_decision,
        d.final_reason,
        d.admin_id AS original_admin_id,
        d.resolved_at,
        d.status
      FROM disputes d
      WHERE d.id = ${targetId}
        AND (d.client_id = ${userId} OR d.worker_id = ${userId})
      LIMIT 1
    `;
    const decision = rows[0];
    if (!decision) return { error: "Appealable dispute decision not found." };
    if (!decision.final_decision || !decision.resolved_at) return { error: "This dispute has no final appealable decision yet." };
    return { decision, targetType: "dispute" };
  }
  const rows = await sql`
    SELECT
      ve.id,
      ve.account_user_id,
      ve.account_type,
      ve.new_status AS final_decision,
      ve.reason AS final_reason,
      ve.admin_employee_id AS original_admin_id,
      ve.created_at AS resolved_at
    FROM verification_events ve
    WHERE ve.id = ${targetId}
      AND ve.account_user_id = ${userId}
      AND ve.new_status IN ('rejected', 'revoked')
    LIMIT 1
  `;
  const decision = rows[0];
  if (!decision) return { error: "Appealable verification decision not found." };
  return { decision, targetType: "verification_event" };
}

export async function createAppeal(input: {
  appealType: AppealType;
  targetId: string;
  reason: AppealReason;
  explanation: string;
  evidenceReferences?: string[];
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, status: 401, error: "Unauthorized." };
  const appellantRole = session.user.role === "worker" ? "worker" : session.user.role === "client" ? "client" : null;
  if (!appellantRole) return { success: false, status: 403, error: "Only affected clients or workers may appeal." };
  if (!isOneOf(APPEAL_TYPES, input.appealType)) return { success: false, status: 400, error: "Invalid appeal type." };
  if (!isOneOf(APPEAL_REASONS, input.reason)) return { success: false, status: 400, error: "Invalid appeal reason." };
  if (!isUuid(input.targetId)) return { success: false, status: 400, error: "Invalid original decision identifier." };
  const explanation = cleanText(input.explanation, 5000);
  if (explanation.length < 25) return { success: false, status: 400, error: "Appeal explanation must add new context." };
  const loaded = await loadAppealableDecision(input.appealType, input.targetId, session.user.id);
  if ("error" in loaded) return { success: false, status: 404, error: loaded.error };
  const resolvedAt = new Date(String(loaded.decision.resolved_at));
  if (Date.now() - resolvedAt.getTime() > GOVERNANCE_APPEAL_WINDOW_DAYS * 864e5) {
    return { success: false, status: 409, error: "The appeal window has expired." };
  }
  const duplicate = await sql`
    SELECT id
    FROM appeals
    WHERE appellant_user_id = ${session.user.id}
      AND target_id = ${input.targetId}
      AND status IN ('appeal_requested', 'appeal_under_review')
    LIMIT 1
  `;
  if (duplicate[0]) return { success: false, status: 409, error: "An active appeal already exists for this decision." };
  const reference = await nextReference("APL", "appeal_ref_seq");
  const key = idempotencyKey([session.user.id, input.appealType, input.targetId, input.reason, explanation]);
  const rows = await sql`
    INSERT INTO appeals (
      reference,
      appeal_type,
      appellant_user_id,
      appellant_role,
      target_type,
      target_id,
      original_decision,
      original_decision_reason,
      original_admin_id,
      status,
      reason,
      explanation,
      evidence_references,
      idempotency_key
    )
    VALUES (
      ${reference},
      ${input.appealType},
      ${session.user.id},
      ${appellantRole},
      ${loaded.targetType},
      ${input.targetId},
      ${loaded.decision.final_decision ?? null},
      ${loaded.decision.final_reason ?? null},
      ${loaded.decision.original_admin_id ?? null},
      'appeal_requested',
      ${input.reason},
      ${explanation},
      ${input.evidenceReferences ?? []},
      ${key}
    )
    RETURNING id, reference
  `;
  await recordAppealEvent(rows[0].id, appellantRole, session.user.id, "appeal_requested", null, "appeal_requested", { reason: input.reason });
  await createNotification({
    userId: session.user.id,
    type: "support_update",
    title: "Appeal submitted",
    body: `Appeal ${rows[0].reference} was submitted for governance review.`,
    linkHref: `/${appellantRole}/appeals/${rows[0].id}`,
  }).catch(() => undefined);
  return { success: true, status: 201, appealId: rows[0].id, reference: rows[0].reference };
}

export async function getUserAppeals() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return sql`
    SELECT id, reference, appeal_type, target_type, target_id, status, reason, outcome, created_at, updated_at
    FROM appeals
    WHERE appellant_user_id = ${session.user.id}
    ORDER BY updated_at DESC, created_at DESC
  `;
}

export async function getUserAppealDetails(appealId: string) {
  const session = await auth();
  if (!session?.user?.id || !isUuid(appealId)) return null;
  const rows = await sql`
    SELECT id, reference, appeal_type, target_type, target_id, status, reason, explanation, outcome, outcome_reason, created_at, updated_at, resolved_at
    FROM appeals
    WHERE id = ${appealId}
      AND appellant_user_id = ${session.user.id}
    LIMIT 1
  `;
  const appeal = rows[0] ?? null;
  if (!appeal) return null;
  const events = await sql`
    SELECT event_type, old_status, new_status, metadata, created_at
    FROM appeal_events
    WHERE appeal_id = ${appealId}
    ORDER BY created_at ASC
  `;
  return { appeal, events };
}

export async function getAppealsForReview() {
  const admin = await requireAdminPermission("appeals.read");
  if (admin.role !== "super_admin") return [];
  return sql`
    SELECT
      a.id,
      a.reference,
      a.appeal_type,
      a.target_type,
      a.target_id,
      a.status,
      a.reason,
      a.outcome,
      a.created_at,
      u.email AS appellant_email,
      COALESCE(cp.full_name, wp.full_name, u.email) AS appellant_name,
      original.admin_employee_id AS original_employee_id,
      original.full_name AS original_admin_name
    FROM appeals a
    JOIN users u ON u.id = a.appellant_user_id
    LEFT JOIN client_profiles cp ON cp.user_id = u.id
    LEFT JOIN worker_profiles wp ON wp.user_id = u.id
    LEFT JOIN admin_employees original ON original.id = a.original_admin_id
    ORDER BY a.created_at DESC
    LIMIT 100
  `;
}

export async function getAppealDetails(appealId: string) {
  const admin = await requireAdminPermission("appeals.read");
  if (admin.role !== "super_admin") return null;
  if (!isUuid(appealId)) return null;
  const rows = await sql`
    SELECT
      a.*,
      u.email AS appellant_email,
      COALESCE(cp.full_name, wp.full_name, u.email) AS appellant_name,
      original.admin_employee_id AS original_employee_id,
      original.full_name AS original_admin_name,
      reviewer.admin_employee_id AS reviewer_employee_id,
      reviewer.full_name AS reviewer_name
    FROM appeals a
    JOIN users u ON u.id = a.appellant_user_id
    LEFT JOIN client_profiles cp ON cp.user_id = u.id
    LEFT JOIN worker_profiles wp ON wp.user_id = u.id
    LEFT JOIN admin_employees original ON original.id = a.original_admin_id
    LEFT JOIN admin_employees reviewer ON reviewer.id = a.reviewed_by_admin_id
    WHERE a.id = ${appealId}
    LIMIT 1
  `;
  const appeal = rows[0] ?? null;
  if (!appeal) return null;
  const [events, audit] = await Promise.all([
    sql`SELECT * FROM appeal_events WHERE appeal_id = ${appealId} ORDER BY created_at ASC`,
    sql`
      SELECT id, action, module, target_type, target_id, reason, related_reference, created_at
      FROM audit_logs
      WHERE target_id = ${String(appeal.target_id)}
         OR related_reference = ${appeal.reference}
      ORDER BY created_at DESC
      LIMIT 40
    `,
  ]);
  return { appeal, events, audit };
}

export async function reviewAppeal(appealId: string, outcome: AppealOutcome, reason: string) {
  const admin = await requireAdminPermission("appeals.resolve");
  if (admin.role !== "super_admin") return { success: false, status: 403, error: "Only super admin may resolve appeals." };
  if (!isUuid(appealId)) return { success: false, status: 400, error: "Invalid appeal identifier." };
  if (!isOneOf(APPEAL_OUTCOMES, outcome)) return { success: false, status: 400, error: "Invalid appeal outcome." };
  const text = cleanText(reason, 4000);
  if (text.length < 10) return { success: false, status: 400, error: "Appeal outcome reason is required." };
  const rows = await sql`SELECT * FROM appeals WHERE id = ${appealId} LIMIT 1`;
  const appeal = rows[0];
  if (!appeal) return { success: false, status: 404, error: "Appeal not found." };
  if (appeal.original_admin_id === admin.id) return { success: false, status: 403, error: "Original decision administrator cannot review this appeal." };
  const nextStatus = outcome === "dismissed" ? "appeal_dismissed" : "appeal_resolved";
  const updated = await sql`
    UPDATE appeals
    SET status = ${nextStatus},
        reviewed_by_admin_id = ${admin.id},
        outcome = ${outcome},
        outcome_reason = ${text},
        resolved_at = NOW(),
        updated_at = NOW()
    WHERE id = ${appealId}
      AND status IN ('appeal_requested', 'appeal_under_review')
    RETURNING id
  `;
  if (updated.length === 0) return { success: false, status: 409, error: "This appeal has already been resolved or dismissed." };
  await recordAppealEvent(appealId, "super_admin", admin.id, outcome === "returned_for_re_review" ? "returned_for_re_review" : "appeal_resolved", appeal.status, nextStatus, { outcome });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "appeal_review_resolved",
    module: "appeals",
    targetType: appeal.target_type,
    targetId: appeal.target_id,
    previousState: { status: appeal.status, originalDecision: appeal.original_decision },
    newState: { status: nextStatus, outcome },
    reason: text,
    relatedReference: appeal.reference,
    highRisk: outcome === "overturned",
    approvedByAdminId: admin.id,
    executedByType: outcome === "overturned" ? "system" : "admin",
    details: { correctiveEventOnly: outcome === "overturned", noDirectPaymentMutation: true },
  });
  await createNotification({
    userId: appeal.appellant_user_id,
    type: "support_update",
    title: "Appeal resolved",
    body: `Your appeal ${appeal.reference} was resolved: ${outcome.replaceAll("_", " ")}.`,
    linkHref: `/${appeal.appellant_role}/appeals/${appeal.id}`,
  }).catch(() => undefined);
  revalidatePath("/admin/appeals");
  return { success: true, status: 200 };
}

export async function getGovernanceReport(period = "last_7_days", from?: string, to?: string) {
  const admin = await requireAdminPermission("reports.read");
  if (admin.role !== "super_admin") return { error: "Only super admin may view governance reports." };
  const range = periodRange(period, from, to);
  if ("error" in range) return { error: range.error };
  const start = range.start!.toISOString();
  const end = range.end!.toISOString();
  const [users, jobs, payments, disputes, support, adminOps] = await Promise.all([
    sql`
      SELECT
        COUNT(*) FILTER (WHERE role = 'client')::int AS total_clients,
        COUNT(*) FILTER (WHERE role = 'worker')::int AS total_workers,
        COUNT(*) FILTER (WHERE is_suspended = true)::int AS suspended_accounts,
        (SELECT COUNT(*)::int FROM worker_profiles WHERE is_verified = true) AS verified_workers,
        (SELECT COUNT(*)::int FROM client_profiles WHERE is_verified = true) AS verified_clients,
        (SELECT COUNT(*)::int FROM verification_attempts WHERE status = 'pending' AND is_current = true) AS pending_verification
      FROM users
    `,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE created_at BETWEEN ${start} AND ${end})::int AS jobs_created,
        COUNT(*) FILTER (WHERE status IN ('accepted', 'active', 'in_progress'))::int AS jobs_active,
        COUNT(*) FILTER (WHERE status IN ('completed', 'paid', 'closed'))::int AS jobs_completed,
        COUNT(*) FILTER (WHERE status = 'disputed')::int AS jobs_disputed
      FROM jobs
    `,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE chapa_status = 'success')::int AS verified_payments,
        COUNT(*) FILTER (WHERE status = 'released')::int AS released_payments,
        COUNT(*) FILTER (WHERE financial_hold_status = 'held')::int AS held_payments,
        (SELECT COUNT(*)::int FROM dispute_financial_actions WHERE proposal_status IN ('proposed', 'approved')) AS financial_review_cases
      FROM payments
    `,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'open')::int AS open_disputes,
        COUNT(*) FILTER (WHERE status IN ('under_review', 'evidence_review'))::int AS under_review_disputes,
        COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved_disputes,
        COUNT(*) FILTER (WHERE status = 'escalated')::int AS escalated_disputes,
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) FILTER (WHERE resolved_at IS NOT NULL)::numeric AS avg_resolution_hours
      FROM disputes
    `,
    sql`
      SELECT
        COUNT(*) FILTER (WHERE status IN ('open', 'assigned', 'awaiting_user', 'in_progress'))::int AS open_tickets,
        COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved_tickets,
        COUNT(*) FILTER (WHERE status = 'escalated')::int AS escalations,
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) FILTER (WHERE resolved_at IS NOT NULL)::numeric AS avg_resolution_hours
      FROM support_tickets
    `,
    sql`
      SELECT
        ae.id,
        ae.admin_employee_id,
        ae.full_name,
        ae.admin_role,
        COUNT(al.id) FILTER (WHERE al.module = 'verification')::int AS verification_decisions,
        COUNT(al.id) FILTER (WHERE al.module = 'disputes')::int AS disputes_handled,
        COUNT(al.id) FILTER (WHERE al.module = 'support')::int AS support_tickets_handled,
        COUNT(al.id) FILTER (WHERE al.high_risk = true)::int AS sensitive_access_count
      FROM admin_employees ae
      LEFT JOIN audit_logs al ON al.admin_employee_id = ae.id AND al.created_at BETWEEN ${start} AND ${end}
      GROUP BY ae.id
      ORDER BY ae.admin_role, ae.full_name
      LIMIT 80
    `,
  ]);
  return {
    period,
    start,
    end,
    users: users[0],
    jobs: jobs[0],
    payments: payments[0],
    disputes: disputes[0],
    support: support[0],
    adminOps,
    note: "Neutral operational metrics require human interpretation and are not rankings.",
  };
}
