"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isTrustedUploadReference } from "@/lib/security";
import { createNotification } from "@/lib/actions/notifications";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { writeGovernanceAudit } from "@/lib/actions/governance";
import {
  SUPPORT_ATTACHMENT_MIME_TYPES,
  SUPPORT_CATEGORIES,
  SUPPORT_MAX_ATTACHMENT_BYTES,
  SUPPORT_PRIORITIES,
  SUPPORT_REOPEN_WINDOW_DAYS,
  SUPPORT_RESOLUTION_TYPES,
  SUPPORT_STATUSES,
} from "@/lib/support-constants";

type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];
type SupportPriority = (typeof SUPPORT_PRIORITIES)[number];
type SupportStatus = (typeof SUPPORT_STATUSES)[number];
type ResolutionType = (typeof SUPPORT_RESOLUTION_TYPES)[number];

type SupportAttachmentInput = {
  url: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
};

const SENSITIVE_KEY = /fin|password|hash|otp|token|secret|credential|cookie|session|chapa_response|file_url/i;
const ATTACHMENT_MIME_SET = new Set<string>(SUPPORT_ATTACHMENT_MIME_TYPES);

function cleanText(value: unknown, maxLength = 2000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function isOneOf<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && values.includes(value as T[number]);
}

function safeMetadata(value: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !SENSITIVE_KEY.test(key)));
}

function fingerprint(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function idempotencyKey(parts: Array<string | null | undefined>) {
  return crypto.createHash("sha256").update(parts.filter(Boolean).join(":")).digest("hex");
}

function normalizeAttachment(input: SupportAttachmentInput | null | undefined) {
  if (!input?.url) return null;
  return input;
}

function validateAttachment(input: SupportAttachmentInput) {
  if (!isTrustedUploadReference(input.url)) return "Attachment must use trusted upload storage.";
  const mime = String(input.mimeType || "").toLowerCase();
  if (!ATTACHMENT_MIME_SET.has(mime)) return "Unsupported attachment file type.";
  const size = Number(input.fileSize || 0);
  if (!Number.isFinite(size) || size <= 0 || size > SUPPORT_MAX_ATTACHMENT_BYTES) return "Attachment file is too large.";
  return null;
}

async function notifyUser(userId: string, title: string, body: string, linkHref: string) {
  await createNotification({ userId, type: "support_update", title, body, linkHref }).catch(() => undefined);
}

async function recordSupportEvent(input: {
  ticketId: string;
  actorType: "client" | "worker" | "support_admin" | "system";
  actorId?: string | null;
  eventType: string;
  oldStatus?: string | null;
  newStatus?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await sql`
    INSERT INTO support_events (ticket_id, actor_type, actor_id, event_type, old_status, new_status, metadata)
    VALUES (
      ${input.ticketId},
      ${input.actorType},
      ${input.actorId ?? null},
      ${input.eventType},
      ${input.oldStatus ?? null},
      ${input.newStatus ?? null},
      ${input.metadata ? JSON.stringify(safeMetadata(input.metadata)) : null}
    )
  `;
}

async function nextSupportReference() {
  const rows = await sql`SELECT nextval('support_ticket_ref_seq')::int AS seq`;
  const seq = Number(rows[0]?.seq || 1);
  return `SUP-${new Date().getFullYear()}-${String(seq).padStart(6, "0")}`;
}

async function validateRelatedRecords(input: {
  ownerId: string;
  relatedJobId?: string | null;
  relatedContractId?: string | null;
  relatedPaymentId?: string | null;
}) {
  const { ownerId, relatedJobId, relatedContractId, relatedPaymentId } = input;
  if (relatedJobId) {
    const rows = await sql`
      SELECT id FROM jobs
      WHERE id = ${relatedJobId}
        AND (client_id = ${ownerId} OR worker_id = ${ownerId})
      LIMIT 1
    `;
    if (!rows[0]) return "Related job does not belong to your account.";
  }
  if (relatedContractId) {
    const rows = await sql`
      SELECT c.id, c.job_id
      FROM contracts c
      JOIN jobs j ON j.id = c.job_id
      WHERE c.id = ${relatedContractId}
        AND (j.client_id = ${ownerId} OR j.worker_id = ${ownerId})
      LIMIT 1
    `;
    if (!rows[0]) return "Related contract does not belong to your account.";
    if (relatedJobId && rows[0].job_id !== relatedJobId) return "Related contract does not match the selected job.";
  }
  if (relatedPaymentId) {
    const rows = await sql`
      SELECT p.id, p.job_id
      FROM payments p
      JOIN jobs j ON j.id = p.job_id
      WHERE p.id = ${relatedPaymentId}
        AND (j.client_id = ${ownerId} OR j.worker_id = ${ownerId})
      LIMIT 1
    `;
    if (!rows[0]) return "Related payment does not belong to your account.";
    if (relatedJobId && rows[0].job_id !== relatedJobId) return "Related payment does not match the selected job.";
  }
  return null;
}

async function requireSupportOperator(permission: "support.claim" | "support.reply" | "support.request_information" | "support.note" | "support.resolve" | "support.escalate") {
  const admin = await requireAdminPermission(permission);
  if (admin.role !== "user_support_admin") {
    return { admin, error: "Only User Support Admins may perform operational support actions." };
  }
  return { admin, error: null };
}

async function getTicketForAdmin(ticketId: string) {
  const rows = await sql`SELECT * FROM support_tickets WHERE id = ${ticketId} LIMIT 1`;
  return rows[0] ?? null;
}

async function ensureAssignedSupportAdmin(ticket: any, adminId: string) {
  if (!ticket.assigned_admin_id) return "Claim this ticket before replying or changing its operational state.";
  if (ticket.assigned_admin_id !== adminId) return "Only the assigned support admin may perform this action.";
  return null;
}

export async function createSupportTicket(input: {
  category: SupportCategory;
  subject: string;
  description: string;
  relatedJobId?: string | null;
  relatedContractId?: string | null;
  relatedPaymentId?: string | null;
  attachment?: SupportAttachmentInput | null;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, status: 401, error: "Unauthorized." };
  const ownerRole = session.user.role === "worker" ? "worker" : session.user.role === "client" ? "client" : null;
  if (!ownerRole) return { success: false, status: 403, error: "Only clients and workers can create support tickets." };
  if (!isOneOf(SUPPORT_CATEGORIES, input.category)) return { success: false, status: 400, error: "Invalid support category." };

  const subject = cleanText(input.subject, 180);
  const description = cleanText(input.description, 5000);
  if (subject.length < 4) return { success: false, status: 400, error: "Subject is required." };
  if (description.length < 20) return { success: false, status: 400, error: "Detailed description is required." };

  const relatedJobId = cleanText(input.relatedJobId, 80) || null;
  const relatedContractId = cleanText(input.relatedContractId, 80) || null;
  const relatedPaymentId = cleanText(input.relatedPaymentId, 80) || null;
  const relationError = await validateRelatedRecords({ ownerId: session.user.id, relatedJobId, relatedContractId, relatedPaymentId });
  if (relationError) return { success: false, status: 400, error: relationError };

  const attachment = normalizeAttachment(input.attachment);
  if (attachment) {
    const attachmentError = validateAttachment(attachment);
    if (attachmentError) return { success: false, status: 400, error: attachmentError };
  }

  const key = idempotencyKey([session.user.id, input.category, subject, description, relatedJobId, relatedContractId, relatedPaymentId]);
  const reference = await nextSupportReference();
  try {
    const rows = await sql`
      INSERT INTO support_tickets (
        reference,
        owner_id,
        owner_role,
        category,
        priority,
        status,
        subject,
        description,
        related_job_id,
        related_contract_id,
        related_payment_id,
        idempotency_key
      )
      VALUES (
        ${reference},
        ${session.user.id},
        ${ownerRole},
        ${input.category},
        'normal',
        'open',
        ${subject},
        ${description},
        ${relatedJobId},
        ${relatedContractId},
        ${relatedPaymentId},
        ${key}
      )
      RETURNING id, reference
    `;
    const ticket = rows[0];
    if (attachment) {
      await sql`
        INSERT INTO support_attachments (
          ticket_id, uploaded_by, uploader_role, file_url, file_name, mime_type, file_size, storage_fingerprint
        )
        VALUES (
          ${ticket.id},
          ${session.user.id},
          ${ownerRole},
          ${attachment.url},
          ${cleanText(attachment.fileName || "Support attachment", 255)},
          ${String(attachment.mimeType || "").toLowerCase()},
          ${Number(attachment.fileSize || 0)},
          ${fingerprint(attachment.url)}
        )
      `;
    }
    await recordSupportEvent({
      ticketId: ticket.id,
      actorType: ownerRole,
      actorId: session.user.id,
      eventType: "ticket_created",
      newStatus: "open",
      metadata: { category: input.category, hasAttachment: Boolean(attachment) },
    });
    await notifyUser(session.user.id, "Support ticket created", `Your support ticket ${ticket.reference} was created.`, `/${ownerRole}/support/${ticket.id}`);
    revalidatePath(`/${ownerRole}/support`);
    return { success: true, status: 201, ticketId: ticket.id, reference: ticket.reference };
  } catch (error: any) {
    if (String(error?.message || "").includes("support_tickets_idempotency_unique_idx")) {
      const existing = await sql`SELECT id, reference FROM support_tickets WHERE idempotency_key = ${key} LIMIT 1`;
      return { success: false, status: 409, error: "A matching support ticket already exists.", ticketId: existing[0]?.id, reference: existing[0]?.reference };
    }
    throw error;
  }
}

export async function getUserSupportTickets(query = "", status = "all") {
  const session = await auth();
  if (!session?.user?.id) return [];
  const q = `%${cleanText(query, 120)}%`;
  const statusFilter = isOneOf(SUPPORT_STATUSES, status) ? status : null;
  return sql`
    SELECT
      t.id,
      t.reference,
      t.category,
      t.priority,
      t.status,
      t.subject,
      t.escalation_type,
      t.resolution_type,
      t.created_at,
      t.updated_at,
      COUNT(a.id)::int AS attachment_count
    FROM support_tickets t
    LEFT JOIN support_attachments a ON a.ticket_id = t.id AND a.is_removed = false
    WHERE t.owner_id = ${session.user.id}
      AND (${statusFilter}::text IS NULL OR t.status = ${statusFilter})
      AND (${q} = '%%' OR t.reference ILIKE ${q} OR t.subject ILIKE ${q})
    GROUP BY t.id
    ORDER BY t.updated_at DESC, t.created_at DESC
  `;
}

export async function getUserSupportTicketDetails(ticketId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const rows = await sql`
    SELECT
      t.id,
      t.reference,
      t.owner_id,
      t.owner_role,
      t.category,
      t.priority,
      t.status,
      t.subject,
      t.description,
      t.related_job_id,
      t.related_contract_id,
      t.related_payment_id,
      t.linked_dispute_id,
      t.escalation_type,
      t.escalation_reason,
      t.resolution_type,
      t.resolution_summary,
      t.resolved_at,
      t.closed_at,
      t.created_at,
      t.updated_at,
      j.title AS job_title,
      COUNT(a.id)::int AS attachment_count
    FROM support_tickets t
    LEFT JOIN jobs j ON j.id = t.related_job_id
    LEFT JOIN support_attachments a ON a.ticket_id = t.id AND a.is_removed = false
    WHERE t.id = ${ticketId}
      AND t.owner_id = ${session.user.id}
    GROUP BY t.id, j.title
    LIMIT 1
  `;
  const ticket = rows[0] ?? null;
  if (!ticket) return null;
  const [messages, events, attachments] = await Promise.all([
    sql`
      SELECT actor_type, message, created_at
      FROM support_messages
      WHERE ticket_id = ${ticketId}
      ORDER BY created_at ASC
    `,
    sql`
      SELECT event_type, actor_type, old_status, new_status, metadata, created_at
      FROM support_events
      WHERE ticket_id = ${ticketId}
      ORDER BY created_at ASC
    `,
    sql`
      SELECT id, file_name, mime_type, file_size, created_at
      FROM support_attachments
      WHERE ticket_id = ${ticketId}
        AND is_removed = false
      ORDER BY created_at ASC
    `,
  ]);
  return { ticket, messages, events, attachments };
}

export async function submitSupportReply(ticketId: string, message: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, status: 401, error: "Unauthorized." };
  const rows = await sql`SELECT * FROM support_tickets WHERE id = ${ticketId} AND owner_id = ${session.user.id} LIMIT 1`;
  const ticket = rows[0];
  if (!ticket) return { success: false, status: 404, error: "Support ticket not found." };
  if (["closed"].includes(String(ticket.status))) return { success: false, status: 409, error: "Closed tickets cannot receive replies." };
  const text = cleanText(message, 5000);
  if (text.length < 2) return { success: false, status: 400, error: "Reply message is required." };
  const nextStatus = ticket.status === "awaiting_user" ? "in_progress" : ticket.status;
  const updated = await sql`
    UPDATE support_tickets
    SET status = ${nextStatus},
        updated_at = NOW()
    WHERE id = ${ticketId}
      AND owner_id = ${session.user.id}
      AND status <> 'closed'
    RETURNING id
  `;
  if (updated.length === 0) return { success: false, status: 409, error: "This ticket changed while replying." };
  await sql`INSERT INTO support_messages (ticket_id, actor_type, actor_id, message) VALUES (${ticketId}, ${ticket.owner_role}, ${session.user.id}, ${text})`;
  await recordSupportEvent({ ticketId, actorType: ticket.owner_role, actorId: session.user.id, eventType: "user_replied", oldStatus: ticket.status, newStatus: nextStatus });
  revalidatePath(`/${ticket.owner_role}/support/${ticketId}`);
  return { success: true, status: 200 };
}

export async function reopenSupportTicket(ticketId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, status: 401, error: "Unauthorized." };
  const text = cleanText(reason, 2000);
  if (text.length < 10) return { success: false, status: 400, error: "Reopening reason is required." };
  const rows = await sql`
    UPDATE support_tickets
    SET status = 'open',
        resolution_type = NULL,
        resolution_summary = NULL,
        resolved_by_admin_id = NULL,
        resolved_at = NULL,
        updated_at = NOW()
    WHERE id = ${ticketId}
      AND owner_id = ${session.user.id}
      AND status = 'resolved'
      AND resolved_at >= NOW() - (${SUPPORT_REOPEN_WINDOW_DAYS} || ' days')::interval
    RETURNING id, owner_role
  `;
  if (rows.length === 0) return { success: false, status: 409, error: "This ticket cannot be reopened. Closed tickets require a new support request." };
  await sql`INSERT INTO support_messages (ticket_id, actor_type, actor_id, message) VALUES (${ticketId}, ${rows[0].owner_role}, ${session.user.id}, ${text})`;
  await recordSupportEvent({ ticketId, actorType: rows[0].owner_role, actorId: session.user.id, eventType: "reopened", oldStatus: "resolved", newStatus: "open" });
  revalidatePath(`/${rows[0].owner_role}/support/${ticketId}`);
  return { success: true, status: 200 };
}

export async function getAdminSupportTickets(status = "open", query = "") {
  await requireAdminPermission("support.read");
  const statusFilter = status === "all" ? null : isOneOf(SUPPORT_STATUSES, status) ? status : "open";
  const q = `%${cleanText(query, 120)}%`;
  return sql`
    SELECT
      t.id,
      t.reference,
      t.category,
      t.subject,
      t.owner_role,
      t.priority,
      t.status,
      t.assigned_at,
      t.created_at,
      t.updated_at,
      u.email AS owner_email,
      COALESCE(cp.full_name, wp.full_name, u.email) AS owner_name,
      ae.full_name AS assigned_admin_name,
      COUNT(a.id)::int AS attachment_count,
      COUNT(a.id) > 0 AS has_attachment
    FROM support_tickets t
    JOIN users u ON u.id = t.owner_id
    LEFT JOIN client_profiles cp ON cp.user_id = t.owner_id
    LEFT JOIN worker_profiles wp ON wp.user_id = t.owner_id
    LEFT JOIN admin_employees ae ON ae.id = t.assigned_admin_id
    LEFT JOIN support_attachments a ON a.ticket_id = t.id AND a.is_removed = false
    WHERE (${statusFilter}::text IS NULL OR t.status = ${statusFilter})
      AND (
        ${q} = '%%'
        OR t.reference ILIKE ${q}
        OR t.subject ILIKE ${q}
        OR u.email ILIKE ${q}
        OR cp.full_name ILIKE ${q}
        OR wp.full_name ILIKE ${q}
      )
    GROUP BY t.id, u.email, cp.full_name, wp.full_name, ae.full_name
    ORDER BY t.updated_at DESC, t.created_at DESC
    LIMIT 100
  `;
}

export async function getAdminSupportTicketDetails(ticketId: string) {
  const admin = await requireAdminPermission("support.read");
  const rows = await sql`
    SELECT
      t.*,
      u.email AS owner_email,
      COALESCE(cp.full_name, wp.full_name, u.email) AS owner_name,
      j.title AS job_title,
      p.status AS payment_status,
      p.chapa_status,
      ae.full_name AS assigned_admin_name
    FROM support_tickets t
    JOIN users u ON u.id = t.owner_id
    LEFT JOIN client_profiles cp ON cp.user_id = t.owner_id
    LEFT JOIN worker_profiles wp ON wp.user_id = t.owner_id
    LEFT JOIN jobs j ON j.id = t.related_job_id
    LEFT JOIN payments p ON p.id = t.related_payment_id
    LEFT JOIN admin_employees ae ON ae.id = t.assigned_admin_id
    WHERE t.id = ${ticketId}
    LIMIT 1
  `;
  const ticket = rows[0] ?? null;
  if (!ticket) return null;
  const [messages, events, notes, attachments] = await Promise.all([
    sql`SELECT actor_type, message, created_at FROM support_messages WHERE ticket_id = ${ticketId} ORDER BY created_at ASC`,
    sql`SELECT event_type, actor_type, old_status, new_status, metadata, created_at FROM support_events WHERE ticket_id = ${ticketId} ORDER BY created_at ASC`,
    sql`
      SELECT n.note, n.created_at, ae.full_name AS admin_name
      FROM support_internal_notes n
      JOIN admin_employees ae ON ae.id = n.admin_employee_id
      WHERE n.ticket_id = ${ticketId}
      ORDER BY n.created_at ASC
    `,
    sql`
      SELECT id, file_name, mime_type, file_size, created_at
      FROM support_attachments
      WHERE ticket_id = ${ticketId}
        AND is_removed = false
      ORDER BY created_at ASC
    `,
  ]);
  return {
    ticket,
    messages,
    events,
    notes,
    attachments,
    canOperate: admin.role === "user_support_admin",
    canReadOnly: admin.role === "super_admin" && hasAdminPermission(admin, "support.read"),
  };
}

export async function claimSupportTicket(ticketId: string, expectedVersion: number, reason?: string) {
  const { admin, error } = await requireSupportOperator("support.claim");
  if (error) return { success: false, status: 403, error };
  const ticket = await getTicketForAdmin(ticketId);
  if (!ticket) return { success: false, status: 404, error: "Support ticket not found." };
  const assignedToOther = ticket.assigned_admin_id && ticket.assigned_admin_id !== admin.id;
  const text = cleanText(reason, 1000);
  if (assignedToOther && text.length < 10) return { success: false, status: 409, error: "Reassignment requires a reason." };
  const nextStatus = ticket.status === "open" ? "assigned" : ticket.status;
  const rows = await sql`
    UPDATE support_tickets
    SET assigned_admin_id = ${admin.id},
        assigned_at = NOW(),
        assignment_version = assignment_version + 1,
        status = ${nextStatus},
        updated_at = NOW()
    WHERE id = ${ticketId}
      AND assignment_version = ${expectedVersion}
      AND status NOT IN ('resolved', 'closed')
      AND (
        assigned_admin_id IS NULL
        OR assigned_admin_id = ${admin.id}
        OR ${Boolean(assignedToOther && text.length >= 10)}
      )
    RETURNING id, status
  `;
  if (rows.length === 0) return { success: false, status: 409, error: "This support ticket was claimed or changed. Reload and try again." };
  await recordSupportEvent({
    ticketId,
    actorType: "support_admin",
    actorId: admin.id,
    eventType: assignedToOther ? "reassigned" : "assigned",
    oldStatus: ticket.status,
    newStatus: rows[0].status,
    metadata: { reason: text || null },
  });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: assignedToOther ? "support_ticket_reassigned" : "support_ticket_claimed",
    module: "support",
    targetType: "support_ticket",
    targetId: ticketId,
    previousState: { assignedAdminId: ticket.assigned_admin_id, status: ticket.status },
    newState: { assignedAdminId: admin.id, status: rows[0].status },
    reason: text || null,
    relatedReference: ticket.reference,
  });
  revalidatePath("/admin/support");
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true, status: 200 };
}

export async function changeSupportPriority(ticketId: string, priority: SupportPriority, reason: string) {
  const { admin, error } = await requireSupportOperator("support.claim");
  if (error) return { success: false, status: 403, error };
  if (!isOneOf(SUPPORT_PRIORITIES, priority)) return { success: false, status: 400, error: "Invalid priority." };
  const ticket = await getTicketForAdmin(ticketId);
  if (!ticket) return { success: false, status: 404, error: "Support ticket not found." };
  const assignedError = await ensureAssignedSupportAdmin(ticket, admin.id);
  if (assignedError) return { success: false, status: 409, error: assignedError };
  const text = cleanText(reason, 1000);
  if (text.length < 10) return { success: false, status: 400, error: "Priority change reason is required." };
  const rows = await sql`
    UPDATE support_tickets
    SET priority = ${priority}, updated_at = NOW()
    WHERE id = ${ticketId}
      AND priority <> ${priority}
      AND status NOT IN ('closed')
    RETURNING id
  `;
  if (rows.length === 0) return { success: false, status: 409, error: "Priority was already changed or ticket is closed." };
  await recordSupportEvent({ ticketId, actorType: "support_admin", actorId: admin.id, eventType: "priority_changed", metadata: { oldPriority: ticket.priority, priority, reason: text } });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "support_priority_changed",
    module: "support",
    targetType: "support_ticket",
    targetId: ticketId,
    previousState: { priority: ticket.priority },
    newState: { priority },
    reason: text,
    relatedReference: ticket.reference,
  });
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true, status: 200 };
}

export async function adminReplySupportTicket(ticketId: string, message: string, awaitUser = false) {
  const { admin, error } = await requireSupportOperator(awaitUser ? "support.request_information" : "support.reply");
  if (error) return { success: false, status: 403, error };
  const ticket = await getTicketForAdmin(ticketId);
  if (!ticket) return { success: false, status: 404, error: "Support ticket not found." };
  const assignedError = await ensureAssignedSupportAdmin(ticket, admin.id);
  if (assignedError) return { success: false, status: 409, error: assignedError };
  if (["resolved", "closed"].includes(String(ticket.status))) return { success: false, status: 409, error: "Resolved or closed tickets cannot receive admin replies." };
  const text = cleanText(message, 5000);
  if (text.length < 2) return { success: false, status: 400, error: "Reply message is required." };
  const nextStatus = awaitUser ? "awaiting_user" : "in_progress";
  const rows = await sql`
    UPDATE support_tickets
    SET status = ${nextStatus}, updated_at = NOW()
    WHERE id = ${ticketId}
      AND assigned_admin_id = ${admin.id}
      AND status NOT IN ('resolved', 'closed')
    RETURNING id
  `;
  if (rows.length === 0) return { success: false, status: 409, error: "This ticket changed while replying." };
  await sql`INSERT INTO support_messages (ticket_id, actor_type, actor_id, message) VALUES (${ticketId}, 'support_admin', ${admin.id}, ${text})`;
  await recordSupportEvent({ ticketId, actorType: "support_admin", actorId: admin.id, eventType: awaitUser ? "awaiting_user" : "admin_replied", oldStatus: ticket.status, newStatus: nextStatus });
  await notifyUser(ticket.owner_id, awaitUser ? "Support needs more information" : "Support replied", text.slice(0, 180), `/${ticket.owner_role}/support/${ticketId}`);
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true, status: 200 };
}

export async function addSupportInternalNote(ticketId: string, note: string) {
  const { admin, error } = await requireSupportOperator("support.note");
  if (error) return { success: false, status: 403, error };
  const ticket = await getTicketForAdmin(ticketId);
  if (!ticket) return { success: false, status: 404, error: "Support ticket not found." };
  const assignedError = await ensureAssignedSupportAdmin(ticket, admin.id);
  if (assignedError) return { success: false, status: 409, error: assignedError };
  const text = cleanText(note, 4000);
  if (text.length < 4) return { success: false, status: 400, error: "Internal note is required." };
  await sql`INSERT INTO support_internal_notes (ticket_id, admin_employee_id, note) VALUES (${ticketId}, ${admin.id}, ${text})`;
  await recordSupportEvent({ ticketId, actorType: "support_admin", actorId: admin.id, eventType: "internal_note_added" });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "support_internal_note_added",
    module: "support",
    targetType: "support_ticket",
    targetId: ticketId,
    relatedReference: ticket.reference,
  });
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true, status: 200 };
}

export async function escalateSupportToVerification(ticketId: string, reason: string) {
  const { admin, error } = await requireSupportOperator("support.escalate");
  if (error) return { success: false, status: 403, error };
  const ticket = await getTicketForAdmin(ticketId);
  if (!ticket) return { success: false, status: 404, error: "Support ticket not found." };
  const assignedError = await ensureAssignedSupportAdmin(ticket, admin.id);
  if (assignedError) return { success: false, status: 409, error: assignedError };
  const text = cleanText(reason, 2000);
  if (text.length < 10) return { success: false, status: 400, error: "Escalation reason is required." };
  const rows = await sql`
    UPDATE support_tickets
    SET status = 'escalated',
        escalation_type = 'verification',
        escalation_reason = ${text},
        updated_at = NOW()
    WHERE id = ${ticketId}
      AND escalation_type IS DISTINCT FROM 'verification'
      AND status NOT IN ('resolved', 'closed')
    RETURNING id
  `;
  if (rows.length === 0) return { success: false, status: 409, error: "This ticket has already been escalated or finalized." };
  await recordSupportEvent({ ticketId, actorType: "support_admin", actorId: admin.id, eventType: "escalated_verification", oldStatus: ticket.status, newStatus: "escalated", metadata: { reason: text } });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "support_escalated_verification",
    module: "support",
    targetType: "support_ticket",
    targetId: ticketId,
    previousState: { status: ticket.status },
    newState: { status: "escalated", escalationType: "verification" },
    reason: text,
    relatedReference: ticket.reference,
  });
  await notifyUser(ticket.owner_id, "Support ticket escalated", "Your ticket was referred to the verification queue for authorized review.", `/${ticket.owner_role}/support/${ticketId}`);
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true, status: 200 };
}

export async function escalateSupportSafety(ticketId: string, reason: string) {
  const { admin, error } = await requireSupportOperator("support.escalate");
  if (error) return { success: false, status: 403, error };
  const ticket = await getTicketForAdmin(ticketId);
  if (!ticket) return { success: false, status: 404, error: "Support ticket not found." };
  const assignedError = await ensureAssignedSupportAdmin(ticket, admin.id);
  if (assignedError) return { success: false, status: 409, error: assignedError };
  const text = cleanText(reason, 2000);
  if (text.length < 10) return { success: false, status: 400, error: "Safety escalation reason is required." };
  const rows = await sql`
    UPDATE support_tickets
    SET status = 'escalated',
        escalation_type = 'safety',
        escalation_reason = ${text},
        updated_at = NOW()
    WHERE id = ${ticketId}
      AND escalation_type IS DISTINCT FROM 'safety'
      AND status NOT IN ('resolved', 'closed')
    RETURNING id
  `;
  if (rows.length === 0) return { success: false, status: 409, error: "This ticket has already been escalated or finalized." };
  await recordSupportEvent({ ticketId, actorType: "support_admin", actorId: admin.id, eventType: "safety_escalated", oldStatus: ticket.status, newStatus: "escalated", metadata: { reason: text } });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "support_escalated_safety",
    module: "support",
    targetType: "support_ticket",
    targetId: ticketId,
    previousState: { status: ticket.status },
    newState: { status: "escalated", escalationType: "safety" },
    reason: text,
    relatedReference: ticket.reference,
  });
  await notifyUser(ticket.owner_id, "Safety support escalated", "Your safety concern was escalated for authorized review.", `/${ticket.owner_role}/support/${ticketId}`);
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true, status: 200 };
}

export async function escalateSupportToDispute(ticketId: string, reason: string) {
  const { admin, error } = await requireSupportOperator("support.escalate");
  if (error) return { success: false, status: 403, error };
  const ticket = await getTicketForAdmin(ticketId);
  if (!ticket) return { success: false, status: 404, error: "Support ticket not found." };
  const assignedError = await ensureAssignedSupportAdmin(ticket, admin.id);
  if (assignedError) return { success: false, status: 409, error: assignedError };
  const text = cleanText(reason, 2000);
  if (text.length < 10) return { success: false, status: 400, error: "Dispute escalation reason is required." };
  if (!ticket.related_job_id) return { success: false, status: 409, error: "Dispute escalation requires a related job." };

  const jobRows = await sql`
    SELECT id, client_id, worker_id, status
    FROM jobs
    WHERE id = ${ticket.related_job_id}
      AND (client_id = ${ticket.owner_id} OR worker_id = ${ticket.owner_id})
      AND worker_id IS NOT NULL
    LIMIT 1
  `;
  const job = jobRows[0];
  if (!job) return { success: false, status: 409, error: "Related job is not valid for dispute escalation." };
  const existing = await sql`
    SELECT id
    FROM disputes
    WHERE job_id = ${ticket.related_job_id}
      AND status IN ('open', 'under_review', 'awaiting_client_response', 'awaiting_worker_response', 'evidence_review', 'escalated')
    LIMIT 1
  `;
  const disputeId = existing[0]?.id ?? null;
  let linkedDisputeId = disputeId;
  if (!linkedDisputeId) {
    const rows = await sql`
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
        ${job.id},
        ${job.client_id},
        ${job.worker_id},
        'Support escalation',
        'other',
        ${ticket.category === "payment_help" ? "payment_review" : "other"},
        ${ticket.owner_id},
        ${ticket.owner_role},
        ${ticket.related_contract_id ?? null},
        ${ticket.related_payment_id ?? null},
        ${`Support ticket ${ticket.reference} was escalated for dispute review. ${text}`},
        'open',
        ${JSON.stringify({ supportTicketId: ticket.id, supportReference: ticket.reference, jobStatusAtEscalation: job.status })},
        true
      )
      RETURNING id
    `;
    linkedDisputeId = rows[0].id;
  }
  const updated = await sql`
    UPDATE support_tickets
    SET status = 'escalated',
        escalation_type = 'dispute',
        escalation_reason = ${text},
        linked_dispute_id = ${linkedDisputeId},
        updated_at = NOW()
    WHERE id = ${ticketId}
      AND linked_dispute_id IS NULL
      AND status NOT IN ('resolved', 'closed')
    RETURNING id
  `;
  if (updated.length === 0) return { success: false, status: 409, error: "This support ticket was already linked to a dispute." };
  await recordSupportEvent({ ticketId, actorType: "support_admin", actorId: admin.id, eventType: "escalated_dispute", oldStatus: ticket.status, newStatus: "escalated", metadata: { linkedDisputeId, reusedExistingDispute: Boolean(disputeId) } });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "support_escalated_dispute",
    module: "support",
    targetType: "support_ticket",
    targetId: ticketId,
    previousState: { status: ticket.status },
    newState: { status: "escalated", linkedDisputeId },
    reason: text,
    relatedReference: ticket.reference,
    details: { linkedDisputeId, reusedExistingDispute: Boolean(disputeId) },
  });
  await notifyUser(ticket.owner_id, "Support ticket escalated", "Your ticket was escalated to the dispute workflow for authorized review.", `/${ticket.owner_role}/support/${ticketId}`);
  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath("/admin/disputes");
  return { success: true, status: 200, disputeId: linkedDisputeId };
}

export async function resolveSupportTicket(ticketId: string, resolutionType: ResolutionType, summary: string) {
  const { admin, error } = await requireSupportOperator("support.resolve");
  if (error) return { success: false, status: 403, error };
  if (!isOneOf(SUPPORT_RESOLUTION_TYPES, resolutionType)) return { success: false, status: 400, error: "Invalid resolution type." };
  const ticket = await getTicketForAdmin(ticketId);
  if (!ticket) return { success: false, status: 404, error: "Support ticket not found." };
  const assignedError = await ensureAssignedSupportAdmin(ticket, admin.id);
  if (assignedError) return { success: false, status: 409, error: assignedError };
  const text = cleanText(summary, 4000);
  if (text.length < 10) return { success: false, status: 400, error: "Resolution summary is required." };
  const rows = await sql`
    UPDATE support_tickets
    SET status = 'resolved',
        resolution_type = ${resolutionType},
        resolution_summary = ${text},
        resolved_by_admin_id = ${admin.id},
        resolved_at = NOW(),
        updated_at = NOW()
    WHERE id = ${ticketId}
      AND assigned_admin_id = ${admin.id}
      AND status NOT IN ('resolved', 'closed')
    RETURNING id
  `;
  if (rows.length === 0) return { success: false, status: 409, error: "This support ticket was already resolved or closed." };
  await recordSupportEvent({ ticketId, actorType: "support_admin", actorId: admin.id, eventType: "resolved", oldStatus: ticket.status, newStatus: "resolved", metadata: { resolutionType } });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "support_ticket_resolved",
    module: "support",
    targetType: "support_ticket",
    targetId: ticketId,
    previousState: { status: ticket.status },
    newState: { status: "resolved", resolutionType },
    reason: text,
    relatedReference: ticket.reference,
  });
  await notifyUser(ticket.owner_id, "Support ticket resolved", text.slice(0, 180), `/${ticket.owner_role}/support/${ticketId}`);
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true, status: 200 };
}

export async function closeSupportTicket(ticketId: string) {
  const { admin, error } = await requireSupportOperator("support.resolve");
  if (error) return { success: false, status: 403, error };
  const ticket = await getTicketForAdmin(ticketId);
  if (!ticket) return { success: false, status: 404, error: "Support ticket not found." };
  const assignedError = await ensureAssignedSupportAdmin(ticket, admin.id);
  if (assignedError) return { success: false, status: 409, error: assignedError };
  const rows = await sql`
    UPDATE support_tickets
    SET status = 'closed',
        closed_at = NOW(),
        updated_at = NOW()
    WHERE id = ${ticketId}
      AND assigned_admin_id = ${admin.id}
      AND status = 'resolved'
    RETURNING id
  `;
  if (rows.length === 0) return { success: false, status: 409, error: "Only resolved tickets can be closed." };
  await recordSupportEvent({ ticketId, actorType: "support_admin", actorId: admin.id, eventType: "closed", oldStatus: "resolved", newStatus: "closed" });
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "support_ticket_closed",
    module: "support",
    targetType: "support_ticket",
    targetId: ticketId,
    previousState: { status: "resolved" },
    newState: { status: "closed" },
    relatedReference: ticket.reference,
  });
  await notifyUser(ticket.owner_id, "Support ticket closed", `Your support ticket ${ticket.reference} was closed.`, `/${ticket.owner_role}/support/${ticketId}`);
  revalidatePath(`/admin/support/${ticketId}`);
  return { success: true, status: 200 };
}
