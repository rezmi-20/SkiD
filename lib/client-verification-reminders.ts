"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";
import { toClientDisplayStatus } from "@/lib/client-verification";
import { evaluateClientApprovedConsistency } from "@/lib/client-verification-consistency";

export type ClientReminderState = "not_started" | "rejected" | "revoked";

const CLIENT_VERIFY_LINK = "/client/profile/settings?verify=1";
const MANUAL_REMINDER_COOLDOWN_HOURS = 24;

function reminderTemplate(status: ClientReminderState) {
  if (status === "rejected") {
    return {
      title: "Your verification needs a new submission",
      body: "Review the reason and resubmit your FIN and Fayda document to use contracts.",
    };
  }
  if (status === "revoked") {
    return {
      title: "Complete identity verification again",
      body: "Your verification was revoked. Please complete identity verification again before using contracts.",
    };
  }
  return {
    title: "Complete your Fayda verification",
    body: "Your account is still unverified. Fayda verification is required before you can set up a contract PIN or use contracts.",
  };
}

export async function getClientVerificationReminderSummary(clientUserId: string) {
  const rows = await sql`
    SELECT
      MAX(created_at) AS last_reminder_at,
      COUNT(*) AS reminder_count
    FROM notifications
    WHERE user_id = ${clientUserId}
      AND type = 'identity_verification_required'
      AND link_href = ${CLIENT_VERIFY_LINK}
  `;
  return {
    lastReminderAt: rows[0]?.last_reminder_at ? String(rows[0].last_reminder_at) : null,
    reminderCount: Number(rows[0]?.reminder_count || 0),
  };
}

async function resolveClientReminderState(clientUserId: string): Promise<ClientReminderState | null> {
  const rows = await sql`
    SELECT
      u.id,
      u.role,
      u.is_suspended,
      cp.is_verified,
      cp.verification_status,
      cp.fin_last4,
      cp.fayda_doc_url,
      cp.verified_at,
      va.decided_by,
      EXISTS (
        SELECT 1
        FROM verification_events ve
        WHERE ve.account_user_id = u.id
          AND ve.account_type = 'client'
          AND ve.new_status = 'approved'
      ) AS has_approved_history
    FROM users u
    LEFT JOIN client_profiles cp ON cp.user_id = u.id
    LEFT JOIN verification_attempts va
      ON va.account_user_id = u.id
      AND va.account_type = 'client'
      AND va.is_current = true
    WHERE u.id = ${clientUserId}
      AND u.role = 'client'
    LIMIT 1
  `;
  const client = rows[0];
  if (!client || client.is_suspended) return null;
  const rawStatus = toClientDisplayStatus(client.verification_status, client.is_verified);
  const consistency = evaluateClientApprovedConsistency({
    status: rawStatus,
    finLast4: client.fin_last4,
    documentRef: client.fayda_doc_url,
    verifiedAt: client.verified_at,
    reviewerId: client.decided_by,
    hasApprovedHistory: client.has_approved_history,
  });
  const status = rawStatus === "approved" && !consistency.isValidApproved ? "not_started" : rawStatus;
  if (status === "not_started" || status === "rejected" || status === "revoked") return status;
  return null;
}

async function hasRecentReminder(clientUserId: string, cooldownHours: number) {
  const rows = await sql`
    SELECT id
    FROM notifications
    WHERE user_id = ${clientUserId}
      AND type = 'identity_verification_required'
      AND link_href = ${CLIENT_VERIFY_LINK}
      AND created_at > NOW() - ${`${cooldownHours} hours`}::interval
    LIMIT 1
  `;
  return rows.length > 0;
}

async function insertReminderNotificationOnce({
  clientUserId,
  title,
  body,
  cooldownInterval,
}: {
  clientUserId: string;
  title: string;
  body: string;
  cooldownInterval: string;
}) {
  const rows = await sql`
    INSERT INTO notifications (user_id, type, title, body, link_href)
    SELECT
      ${clientUserId},
      'identity_verification_required',
      ${title},
      ${body},
      ${CLIENT_VERIFY_LINK}
    WHERE NOT EXISTS (
      SELECT 1
      FROM notifications
      WHERE user_id = ${clientUserId}
        AND type = 'identity_verification_required'
        AND link_href = ${CLIENT_VERIFY_LINK}
        AND created_at > NOW() - ${cooldownInterval}::interval
    )
    RETURNING id
  `;
  return rows.length > 0;
}

export async function sendClientVerificationReminder(clientUserId: string) {
  const admin = await getAdminPrincipal();
  if (!admin || !hasAdminPermission(admin, "verification.review") || admin.role !== "content_verification_admin") {
    return { success: false, status: 403, error: "Only content verification administrators may send verification reminders." };
  }

  const status = await resolveClientReminderState(clientUserId);
  if (!status) {
    return { success: false, status: 409, error: "Reminder is only available for not-started, rejected, or revoked clients." };
  }
  if (await hasRecentReminder(clientUserId, MANUAL_REMINDER_COOLDOWN_HOURS)) {
    return { success: false, status: 429, error: "A verification reminder was already sent recently." };
  }

  const template = reminderTemplate(status);
  const inserted = await insertReminderNotificationOnce({
    clientUserId,
    title: template.title,
    body: template.body,
    cooldownInterval: `${MANUAL_REMINDER_COOLDOWN_HOURS} hours`,
  });
  if (!inserted) {
    return { success: false, status: 429, error: "A verification reminder was already sent recently." };
  }

  await sql`
    INSERT INTO audit_logs (admin_employee_id, action, details)
    VALUES (
      ${admin.id},
      'client_verification_reminder_sent',
      ${JSON.stringify({
        adminId: admin.id,
        adminEmployeeId: admin.employeeId ?? null,
        targetUserId: clientUserId,
        status,
        channel: "in_app_notification",
        pushDelivery: "not_configured",
        timestamp: new Date().toISOString(),
      })}
    )
  `.catch(() => undefined);

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientUserId}/verify`);
  return { success: true, status: 200 };
}

export async function maybeSendClientVerificationReminder(clientUserId: string) {
  const status = await resolveClientReminderState(clientUserId);
  if (!status) return { sent: false, reason: "not_eligible" };

  const summary = await getClientVerificationReminderSummary(clientUserId);
  const lastReminder = summary.lastReminderAt ? new Date(summary.lastReminderAt).getTime() : 0;
  const ageMs = Date.now() - lastReminder;
  const dayMs = 86_400_000;
  const nextIntervalDays =
    summary.reminderCount <= 0 ? 0 :
    summary.reminderCount === 1 ? 3 :
    summary.reminderCount === 2 ? 7 :
    summary.reminderCount === 3 ? 14 : 30;

  if (summary.reminderCount > 0 && ageMs < nextIntervalDays * dayMs) {
    return { sent: false, reason: "cooldown" };
  }

  const template = reminderTemplate(status);
  const inserted = await insertReminderNotificationOnce({
    clientUserId,
    title: template.title,
    body: template.body,
    cooldownInterval: summary.reminderCount <= 0 ? "24 hours" : `${nextIntervalDays} days`,
  });
  return inserted ? { sent: true, reason: "eligible" } : { sent: false, reason: "cooldown" };
}
