"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isTrustedUploadReference } from "@/lib/security";
import { getAdminPrincipal, hasAdminPermission, requireAdminPermission, type AdminPermission } from "@/lib/admin-authorization";
import {
  DISPUTE_ACTIVE_STATUSES,
  DISPUTE_ALLOWED_JOB_STATUSES,
  DISPUTE_CATEGORIES,
  DISPUTE_REQUESTED_RESOLUTIONS,
  DISPUTE_RESOLUTION_DECISIONS,
} from "@/lib/dispute-constants";

const ALLOWED_EVIDENCE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);
const MAX_EVIDENCE_BYTES = 8 * 1024 * 1024;

type DisputeCategory = (typeof DISPUTE_CATEGORIES)[number];
type RequestedResolution = (typeof DISPUTE_REQUESTED_RESOLUTIONS)[number];
type ResolutionDecision = (typeof DISPUTE_RESOLUTION_DECISIONS)[number];

type EvidenceInput = {
  url: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
};

function cleanText(value: unknown, maxLength: number) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function isOneOf<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && values.includes(value as T[number]);
}

function sanitizeMetadata(value: Record<string, unknown>) {
  const blocked = /fin|password|token|secret|credential|chapa_response/i;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !blocked.test(key)));
}

function evidenceFingerprint(url: string) {
  return crypto.createHash("sha256").update(url).digest("hex");
}

function normalizeEvidence(input: EvidenceInput[] | string[] | undefined | null): EvidenceInput[] {
  if (!input) return [];
  return input.map((item) => (typeof item === "string" ? { url: item } : item));
}

function validateEvidence(item: EvidenceInput) {
  if (!isTrustedUploadReference(item.url)) return "Evidence must use trusted upload storage.";
  const mime = String(item.mimeType || "").toLowerCase();
  if (mime && !ALLOWED_EVIDENCE_MIME_TYPES.has(mime)) return "Unsupported evidence file type.";
  const size = Number(item.fileSize || 1);
  if (!Number.isFinite(size) || size <= 0 || size > MAX_EVIDENCE_BYTES) return "Evidence file is too large.";
  return null;
}

async function notifyUser(userId: string, title: string, body: string, linkHref: string) {
  await sql`
    INSERT INTO notifications (user_id, type, title, body, link_href)
    VALUES (${userId}, 'dispute_update', ${title}, ${body}, ${linkHref})
  `.catch(() => undefined);
}

async function recordDisputeEvent(input: {
  disputeId: string;
  actorType: "client" | "worker" | "admin" | "system";
  actorId?: string | null;
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
      ${input.actorType},
      ${input.actorId ?? null},
      ${input.eventType},
      ${input.oldStatus ?? null},
      ${input.newStatus ?? null},
      ${input.metadata ? JSON.stringify(sanitizeMetadata(input.metadata)) : null}
    )
  `;
}

async function getParticipantDispute(disputeId: string, userId: string) {
  const rows = await sql`
    SELECT d.*, j.title AS job_title
    FROM disputes d
    JOIN jobs j ON j.id = d.job_id
    WHERE d.id = ${disputeId}
      AND (d.client_id = ${userId} OR d.worker_id = ${userId})
    LIMIT 1
  `;
  return rows[0] ?? null;
}

async function ensureAdminCanReviewDispute(disputeId: string, permission: AdminPermission = "disputes.review") {
  const admin = await requireAdminPermission(permission);
  const rows = await sql`SELECT * FROM disputes WHERE id = ${disputeId} LIMIT 1`;
  const dispute = rows[0] ?? null;
  if (!dispute) return { admin, dispute: null };
  const conflicts = Array.isArray(dispute.conflict_admin_ids) ? dispute.conflict_admin_ids.map(String) : [];
  if (conflicts.includes(admin.id)) {
    return { admin, dispute: null, error: "You declared a conflict on this dispute." };
  }
  return { admin, dispute };
}

async function insertEvidenceRecords(dispute: any, actorId: string, actorRole: "client" | "worker", evidence: EvidenceInput[]) {
  for (const item of evidence) {
    const error = validateEvidence(item);
    if (error) throw new Error(error);
    const rows = await sql`
      INSERT INTO dispute_evidence (
        dispute_id,
        uploaded_by,
        uploader_role,
        file_url,
        file_name,
        mime_type,
        file_size,
        storage_fingerprint
      )
      VALUES (
        ${dispute.id},
        ${actorId},
        ${actorRole},
        ${item.url},
        ${cleanText(item.fileName || "Evidence", 255)},
        ${String(item.mimeType || "application/octet-stream").toLowerCase()},
        ${Number(item.fileSize || 1)},
        ${evidenceFingerprint(item.url)}
      )
      RETURNING id
    `;
    await recordDisputeEvent({
      disputeId: dispute.id,
      actorType: actorRole,
      actorId,
      eventType: "evidence_uploaded",
      metadata: { evidenceId: rows[0]?.id, fileName: item.fileName || null, mimeType: item.mimeType || null },
    });
  }
}

export async function createDispute(data: {
  jobId: string;
  category: DisputeCategory;
  title: string;
  description: string;
  requestedResolution: RequestedResolution;
  evidence?: EvidenceInput[] | string[];
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, status: 401, error: "Unauthorized" };

  const actorId = session.user.id;
  const actorRole = session.user.role === "worker" ? "worker" : session.user.role === "client" ? "client" : null;
  if (!actorRole) return { success: false, status: 403, error: "Only job participants can create disputes." };

  const category = data.category;
  const requestedResolution = data.requestedResolution;
  const title = cleanText(data.title, 160);
  const description = cleanText(data.description, 4000);
  if (!isOneOf(DISPUTE_CATEGORIES, category)) return { success: false, status: 400, error: "Invalid dispute category." };
  if (!isOneOf(DISPUTE_REQUESTED_RESOLUTIONS, requestedResolution)) return { success: false, status: 400, error: "Invalid requested resolution." };
  if (title.length < 4) return { success: false, status: 400, error: "A short title is required." };
  if (description.length < 20) return { success: false, status: 400, error: "A detailed explanation is required." };

  const evidence = normalizeEvidence(data.evidence);
  for (const item of evidence) {
    const error = validateEvidence(item);
    if (error) return { success: false, status: 400, error };
  }

  const rows = await sql`
    SELECT
      j.id AS job_id,
      j.client_id,
      j.worker_id,
      j.title AS job_title,
      j.status AS job_status,
      j.budget,
      j.completion_rejection_reason,
      c.id AS contract_id,
      c.status AS contract_status,
      c.payment_amount,
      p.id AS payment_id,
      p.status AS payment_status,
      p.chapa_reference
    FROM jobs j
    LEFT JOIN contracts c ON c.job_id = j.id
    LEFT JOIN LATERAL (
      SELECT id, status, chapa_reference
      FROM payments
      WHERE job_id = j.id
      ORDER BY created_at DESC
      LIMIT 1
    ) p ON true
    WHERE j.id = ${data.jobId}
    LIMIT 1
  `;
  const job = rows[0];
  if (!job) return { success: false, status: 404, error: "Job not found." };
  if (job.client_id !== actorId && job.worker_id !== actorId) {
    return { success: false, status: 403, error: "Only the job client or worker can open this dispute." };
  }
  if (!job.worker_id) return { success: false, status: 400, error: "This job has no worker relationship yet." };
  if (!DISPUTE_ALLOWED_JOB_STATUSES.includes(String(job.job_status) as any)) {
    return { success: false, status: 409, error: "A dispute cannot be opened for this job state." };
  }

  const existing = await sql`
    SELECT id, status
    FROM disputes
    WHERE job_id = ${job.job_id}
      AND status IN ('open', 'under_review', 'awaiting_client_response', 'awaiting_worker_response', 'evidence_review', 'escalated')
    LIMIT 1
  `;
  if (existing[0]) {
    return { success: false, status: 409, error: "An active dispute already exists for this job.", disputeId: existing[0].id };
  }

  const snapshot = {
    disputeId: null,
    jobId: job.job_id,
    contractId: job.contract_id,
    paymentId: job.payment_id,
    clientId: job.client_id,
    workerId: job.worker_id,
    jobStatus: job.job_status,
    contractStatus: job.contract_status,
    paymentStatus: job.payment_status,
    contractAmount: job.payment_amount ?? job.budget ?? null,
    completionRejectionReason: job.completion_rejection_reason ?? null,
    paymentReferencePresent: Boolean(job.chapa_reference),
    createdAt: new Date().toISOString(),
  };

  try {
    const disputeRows = await sql`
      INSERT INTO disputes (
        job_id,
        client_id,
        worker_id,
        title,
        category,
        requested_resolution,
        opened_by,
        opened_by_role,
        contract_id,
        payment_id,
        description,
        status,
        creation_snapshot,
        workflow_frozen
      )
      VALUES (
        ${job.job_id},
        ${job.client_id},
        ${job.worker_id},
        ${title},
        ${category},
        ${requestedResolution},
        ${actorId},
        ${actorRole},
        ${job.contract_id ?? null},
        ${job.payment_id ?? null},
        ${description},
        'open',
        ${JSON.stringify(snapshot)},
        true
      )
      RETURNING *
    `;
    const dispute = disputeRows[0];
    await sql`UPDATE jobs SET status = 'disputed', updated_at = NOW() WHERE id = ${job.job_id}`;
    await recordDisputeEvent({
      disputeId: dispute.id,
      actorType: actorRole,
      actorId,
      eventType: "opened",
      newStatus: "open",
      metadata: { category, requestedResolution, jobStatusAtOpen: job.job_status },
    });
    await insertEvidenceRecords(dispute, actorId, actorRole, evidence);
    await Promise.all([
      notifyUser(job.client_id, "Dispute opened", "A dispute has been opened for your job.", `/client/disputes/${dispute.id}`),
      notifyUser(job.worker_id, "Dispute opened", "A dispute has been opened for your job.", `/worker/disputes/${dispute.id}`),
    ]);
    revalidatePath("/admin/disputes");
    revalidatePath("/client/disputes");
    revalidatePath("/worker/disputes");
    revalidatePath("/client/contracts");
    revalidatePath("/worker/contracts");
    return { success: true, status: 201, disputeId: dispute.id };
  } catch (error: any) {
    if (String(error?.message || "").includes("dispute_active_job_unique_idx")) {
      const duplicate = await sql`SELECT id FROM disputes WHERE job_id = ${job.job_id} ORDER BY created_at DESC LIMIT 1`;
      return { success: false, status: 409, error: "An active dispute already exists for this job.", disputeId: duplicate[0]?.id };
    }
    console.error("[CREATE_DISPUTE_ERROR]", error);
    return { success: false, status: 500, error: "Failed to create dispute." };
  }
}

export async function getUserDisputes() {
  const session = await auth();
  if (!session?.user?.id) return [];
  return sql`
    SELECT
      d.id,
      d.job_id,
      d.title,
      d.category,
      d.requested_resolution,
      d.status,
      d.created_at,
      d.updated_at,
      d.final_decision,
      d.final_reason,
      j.title AS job_title,
      CASE
        WHEN d.status = 'awaiting_client_response' AND d.client_id = ${session.user.id} THEN 'client_response_required'
        WHEN d.status = 'awaiting_worker_response' AND d.worker_id = ${session.user.id} THEN 'worker_response_required'
        ELSE 'none'
      END AS required_action
    FROM disputes d
    JOIN jobs j ON j.id = d.job_id
    WHERE d.client_id = ${session.user.id}
       OR d.worker_id = ${session.user.id}
    ORDER BY d.updated_at DESC NULLS LAST, d.created_at DESC
  `;
}

export async function getEligibleDisputeJobs() {
  const session = await auth();
  if (!session?.user?.id) return [];
  const column = session.user.role === "worker" ? "worker_id" : "client_id";
  return sql.query(
    `SELECT
       j.id,
       j.title,
       j.status,
       COALESCE(c.payment_amount, j.budget) AS amount,
       EXISTS (
         SELECT 1 FROM disputes d
         WHERE d.job_id = j.id
           AND d.status IN ('open', 'under_review', 'awaiting_client_response', 'awaiting_worker_response', 'evidence_review', 'escalated')
       ) AS has_active_dispute
     FROM jobs j
     LEFT JOIN contracts c ON c.job_id = j.id
     WHERE j.${column} = $1
       AND j.status = ANY($2::job_status[])
     ORDER BY j.updated_at DESC`,
    [session.user.id, DISPUTE_ALLOWED_JOB_STATUSES],
  );
}

export async function getUserDisputeDetails(disputeId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const dispute = await getParticipantDispute(disputeId, session.user.id);
  if (!dispute) return null;
  const [events, evidence, responses] = await Promise.all([
    sql`
      SELECT event_type, actor_type, old_status, new_status, metadata, created_at
      FROM dispute_events
      WHERE dispute_id = ${disputeId}
      ORDER BY created_at ASC
    `,
    sql`
      SELECT id, file_name, mime_type, file_size, uploader_role, created_at
      FROM dispute_evidence
      WHERE dispute_id = ${disputeId}
        AND is_removed = false
      ORDER BY created_at ASC
    `,
    sql`
      SELECT id, requested_from, instruction, due_at, status, response_text, responded_at, created_at
      FROM dispute_responses
      WHERE dispute_id = ${disputeId}
      ORDER BY created_at ASC
    `,
  ]);
  return { dispute, events, evidence, responses };
}

export async function submitDisputeResponse(responseId: string, responseText: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, status: 401, error: "Unauthorized" };
  const rows = await sql`
    SELECT r.*, d.client_id, d.worker_id
    FROM dispute_responses r
    JOIN disputes d ON d.id = r.dispute_id
    WHERE r.id = ${responseId}
    LIMIT 1
  `;
  const request = rows[0];
  if (!request) return { success: false, status: 404, error: "Response request not found." };
  const targetUserId = request.requested_from === "client" ? request.client_id : request.worker_id;
  if (targetUserId !== session.user.id) return { success: false, status: 403, error: "This response request is not assigned to you." };
  if (request.status !== "requested") return { success: false, status: 409, error: "This response request was already answered." };
  const text = cleanText(responseText, 4000);
  if (text.length < 10) return { success: false, status: 400, error: "Response detail is required." };

  const updated = await sql`
    UPDATE dispute_responses
    SET status = 'submitted',
        response_text = ${text},
        responded_by = ${session.user.id},
        responded_at = NOW()
    WHERE id = ${responseId}
      AND status = 'requested'
    RETURNING dispute_id, requested_from
  `;
  if (updated.length === 0) return { success: false, status: 409, error: "This response request changed. Reload and try again." };
  await sql`
    UPDATE disputes
    SET status = 'evidence_review',
        updated_at = NOW()
    WHERE id = ${updated[0].dispute_id}
      AND status IN ('awaiting_client_response', 'awaiting_worker_response')
  `;
  await recordDisputeEvent({
    disputeId: updated[0].dispute_id,
    actorType: updated[0].requested_from,
    actorId: session.user.id,
    eventType: "response_submitted",
    newStatus: "evidence_review",
    metadata: { responseId },
  });
  revalidatePath("/admin/disputes");
  revalidatePath("/client/disputes");
  revalidatePath("/worker/disputes");
  return { success: true, status: 200 };
}

export async function getDisputes() {
  await requireAdminPermission("disputes.read");
  return sql`
    SELECT
      d.id,
      d.job_id,
      d.client_id,
      d.worker_id,
      d.title,
      d.category,
      d.requested_resolution,
      d.description,
      d.status,
      d.assigned_admin_id,
      d.assigned_at,
      d.final_decision,
      d.financial_action_required,
      d.created_at,
      d.updated_at,
      j.title AS job_title,
      p.status AS payment_status,
      cp.full_name AS client_name,
      wp.full_name AS worker_name,
      ae.full_name AS assigned_admin_name
    FROM disputes d
    JOIN jobs j ON d.job_id = j.id
    LEFT JOIN payments p ON p.id = d.payment_id
    LEFT JOIN client_profiles cp ON d.client_id = cp.user_id
    LEFT JOIN worker_profiles wp ON d.worker_id = wp.user_id
    LEFT JOIN admin_employees ae ON ae.id = d.assigned_admin_id
    ORDER BY d.created_at DESC
  `;
}

export async function getAdminDisputeDetails(disputeId: string) {
  await requireAdminPermission("disputes.read");
  const rows = await sql`
    SELECT
      d.*,
      j.title AS job_title,
      j.status AS current_job_status,
      j.completion_rejection_reason,
      c.status AS current_contract_status,
      c.terms_status,
      c.payment_amount,
      p.status AS current_payment_status,
      p.chapa_reference,
      cp.full_name AS client_name,
      wp.full_name AS worker_name,
      ae.full_name AS assigned_admin_name
    FROM disputes d
    JOIN jobs j ON j.id = d.job_id
    LEFT JOIN contracts c ON c.id = d.contract_id
    LEFT JOIN payments p ON p.id = d.payment_id
    LEFT JOIN client_profiles cp ON cp.user_id = d.client_id
    LEFT JOIN worker_profiles wp ON wp.user_id = d.worker_id
    LEFT JOIN admin_employees ae ON ae.id = d.assigned_admin_id
    WHERE d.id = ${disputeId}
    LIMIT 1
  `;
  const dispute = rows[0] ?? null;
  if (!dispute) return null;
  const [events, evidence, responses, notes] = await Promise.all([
    sql`SELECT * FROM dispute_events WHERE dispute_id = ${disputeId} ORDER BY created_at ASC`,
    sql`SELECT id, uploaded_by, uploader_role, file_name, mime_type, file_size, is_removed, created_at FROM dispute_evidence WHERE dispute_id = ${disputeId} ORDER BY created_at ASC`,
    sql`SELECT * FROM dispute_responses WHERE dispute_id = ${disputeId} ORDER BY created_at ASC`,
    sql`
      SELECT n.*, ae.full_name AS admin_name, ae.admin_employee_id
      FROM dispute_admin_notes n
      JOIN admin_employees ae ON ae.id = n.admin_employee_id
      WHERE n.dispute_id = ${disputeId}
      ORDER BY n.created_at ASC
    `,
  ]);
  return { dispute, events, evidence, responses, notes };
}

export async function claimDispute(disputeId: string, reassignmentReason?: string) {
  const { admin, dispute, error } = await ensureAdminCanReviewDispute(disputeId, "disputes.review");
  if (error) return { success: false, status: 403, error };
  if (!dispute) return { success: false, status: 404, error: "Dispute not found." };
  const assignedToOther = dispute.assigned_admin_id && dispute.assigned_admin_id !== admin.id;
  const reason = cleanText(reassignmentReason, 1000);
  if (assignedToOther && reason.length < 10) {
    return { success: false, status: 409, error: "Reassignment requires a reason." };
  }
  const oldStatus = String(dispute.status || "open");
  const updated = await sql`
    UPDATE disputes
    SET assigned_admin_id = ${admin.id},
        assigned_at = NOW(),
        assignment_version = assignment_version + 1,
        status = CASE WHEN status = 'open' THEN 'under_review'::dispute_status ELSE status END,
        updated_at = NOW()
    WHERE id = ${disputeId}
      AND (
        assigned_admin_id IS NULL
        OR assigned_admin_id = ${admin.id}
        OR ${Boolean(assignedToOther && reason.length >= 10)}
      )
      AND status IN ('open', 'under_review', 'awaiting_client_response', 'awaiting_worker_response', 'evidence_review', 'escalated')
    RETURNING id, status
  `;
  if (updated.length === 0) return { success: false, status: 409, error: "This dispute assignment changed. Reload and try again." };
  await recordDisputeEvent({
    disputeId,
    actorType: "admin",
    actorId: admin.id,
    eventType: assignedToOther ? "reassigned" : "assigned",
    oldStatus,
    newStatus: updated[0].status,
    metadata: { reason: reason || null },
  });
  revalidatePath("/admin/disputes");
  revalidatePath(`/admin/disputes/${disputeId}`);
  return { success: true, status: 200 };
}

export async function requestDisputeResponse(disputeId: string, target: "client" | "worker", instruction: string, dueAt?: string | null) {
  const { admin, dispute, error } = await ensureAdminCanReviewDispute(disputeId, "disputes.request_evidence");
  if (error) return { success: false, status: 403, error };
  if (!dispute) return { success: false, status: 404, error: "Dispute not found." };
  if (target !== "client" && target !== "worker") return { success: false, status: 400, error: "Invalid response target." };
  if (dispute.assigned_admin_id && dispute.assigned_admin_id !== admin.id) {
    return { success: false, status: 409, error: "Only the assigned dispute admin can request information." };
  }
  const text = cleanText(instruction, 2000);
  if (text.length < 10) return { success: false, status: 400, error: "Request instruction is required." };
  const nextStatus = target === "client" ? "awaiting_client_response" : "awaiting_worker_response";
  const responseRows = await sql`
    INSERT INTO dispute_responses (dispute_id, requested_by_admin_id, requested_from, instruction, due_at)
    VALUES (${disputeId}, ${admin.id}, ${target}, ${text}, ${dueAt ? new Date(dueAt) : null})
    RETURNING id
  `;
  const updated = await sql`
    UPDATE disputes
    SET status = ${nextStatus}::dispute_status,
        updated_at = NOW()
    WHERE id = ${disputeId}
      AND status IN ('open', 'under_review', 'evidence_review', 'escalated')
    RETURNING id
  `;
  if (updated.length === 0) return { success: false, status: 409, error: "This dispute cannot request information in its current state." };
  await recordDisputeEvent({
    disputeId,
    actorType: "admin",
    actorId: admin.id,
    eventType: `${target}_response_requested`,
    oldStatus: dispute.status,
    newStatus: nextStatus,
    metadata: { responseId: responseRows[0]?.id, dueAt: dueAt || null },
  });
  await notifyUser(target === "client" ? dispute.client_id : dispute.worker_id, "Dispute response requested", text, `/${target}/disputes/${disputeId}`);
  revalidatePath("/admin/disputes");
  return { success: true, status: 200 };
}

export async function addInternalDisputeNote(disputeId: string, note: string) {
  const { admin, dispute, error } = await ensureAdminCanReviewDispute(disputeId, "disputes.review");
  if (error) return { success: false, status: 403, error };
  if (!dispute) return { success: false, status: 404, error: "Dispute not found." };
  const text = cleanText(note, 4000);
  if (text.length < 4) return { success: false, status: 400, error: "Internal note is required." };
  await sql`INSERT INTO dispute_admin_notes (dispute_id, admin_employee_id, note) VALUES (${disputeId}, ${admin.id}, ${text})`;
  await recordDisputeEvent({ disputeId, actorType: "admin", actorId: admin.id, eventType: "admin_note_added" });
  revalidatePath(`/admin/disputes/${disputeId}`);
  return { success: true, status: 200 };
}

export async function declareDisputeConflict(disputeId: string, reason: string) {
  const admin = await requireAdminPermission("disputes.review");
  const text = cleanText(reason, 1000);
  if (text.length < 10) return { success: false, status: 400, error: "Conflict reason is required." };
  const updated = await sql`
    UPDATE disputes
    SET assigned_admin_id = CASE WHEN assigned_admin_id = ${admin.id} THEN NULL ELSE assigned_admin_id END,
        conflict_admin_ids = CASE
          WHEN conflict_admin_ids IS NULL THEN ARRAY[${admin.id}]::uuid[]
          WHEN NOT (${admin.id} = ANY(conflict_admin_ids)) THEN array_append(conflict_admin_ids, ${admin.id})
          ELSE conflict_admin_ids
        END,
        updated_at = NOW()
    WHERE id = ${disputeId}
    RETURNING id
  `;
  if (updated.length === 0) return { success: false, status: 404, error: "Dispute not found." };
  await recordDisputeEvent({ disputeId, actorType: "admin", actorId: admin.id, eventType: "conflict_declared", metadata: { reason: text } });
  revalidatePath("/admin/disputes");
  revalidatePath(`/admin/disputes/${disputeId}`);
  return { success: true, status: 200 };
}

export async function resolveDispute(disputeId: string, decision: ResolutionDecision, reason: string) {
  const { admin, dispute, error } = await ensureAdminCanReviewDispute(disputeId, "disputes.resolve");
  if (error) return { success: false, status: 403, error };
  if (!dispute) return { success: false, status: 404, error: "Dispute not found." };
  if (!hasAdminPermission(admin, "disputes.resolve") || admin.role !== "dispute_payment_admin") {
    return { success: false, status: 403, error: "Only dispute and payment admins may resolve disputes." };
  }
  if (!isOneOf(DISPUTE_RESOLUTION_DECISIONS, decision)) return { success: false, status: 400, error: "Invalid dispute decision." };
  const text = cleanText(reason, 4000);
  if (text.length < 10) return { success: false, status: 400, error: "Resolution reason is required." };
  if (dispute.assigned_admin_id && dispute.assigned_admin_id !== admin.id) {
    return { success: false, status: 409, error: "Only the assigned dispute admin can resolve this case." };
  }
  const nextStatus = decision === "dismissed" ? "dismissed" : decision === "escalated" ? "escalated" : "resolved";
  const financialActionRequired = ["payment_review", "partial_payment", "refund_review"].includes(String(dispute.requested_resolution));
  const updated = await sql`
    UPDATE disputes
    SET status = ${nextStatus}::dispute_status,
        final_decision = ${decision},
        final_reason = ${text},
        financial_action_required = ${financialActionRequired},
        resolution_notes = ${text},
        admin_id = ${admin.id},
        resolved_at = CASE WHEN ${nextStatus !== "escalated"} THEN NOW() ELSE resolved_at END,
        updated_at = NOW()
    WHERE id = ${disputeId}
      AND status IN ('open', 'under_review', 'awaiting_client_response', 'awaiting_worker_response', 'evidence_review', 'escalated')
    RETURNING id
  `;
  if (updated.length === 0) return { success: false, status: 409, error: "This dispute has already been resolved or changed." };
  await recordDisputeEvent({
    disputeId,
    actorType: "admin",
    actorId: admin.id,
    eventType: decision === "escalated" ? "escalated" : "resolved",
    oldStatus: dispute.status,
    newStatus: nextStatus,
    metadata: { decision, financialActionRequired },
  });
  await Promise.all([
    notifyUser(dispute.client_id, "Dispute updated", "A decision was recorded for your dispute.", `/client/disputes/${disputeId}`),
    notifyUser(dispute.worker_id, "Dispute updated", "A decision was recorded for your dispute.", `/worker/disputes/${disputeId}`),
  ]);
  revalidatePath("/admin/disputes");
  revalidatePath(`/admin/disputes/${disputeId}`);
  revalidatePath("/client/disputes");
  revalidatePath("/worker/disputes");
  return { success: true, status: 200, financialActionRequired };
}
