"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";
import { hasCompleteWorkerIdentity, toWorkerDisplayStatus } from "@/lib/worker-verification";

const WORKER_VERIFY_LINK = "/worker/pending-verification";
const MANUAL_WORKER_REMINDER_COOLDOWN_HOURS = 24;

function workerReminderTemplate(status: string) {
  if (status === "rejected") {
    return {
      title: "Verification Resubmission Required",
      body: "Your previous Fayda verification submission needs updates. Open verification status to upload a clear National ID and FIN.",
    };
  }
  if (status === "revoked") {
    return {
      title: "Complete Fayda Verification Again",
      body: "Your artisan verification was revoked. Please submit your Fayda National ID credentials again to reactivate work access.",
    };
  }
  return {
    title: "Action Required: Complete your Fayda National ID verification",
    body: "Please submit your Fayda ID documents and National ID number so platform moderators can review and approve your artisan profile.",
  };
}

export async function sendWorkerVerificationReminder(workerUserId: string) {
  const admin = await getAdminPrincipal();
  if (!admin || !hasAdminPermission(admin, "verification.review")) {
    return { success: false, status: 403, error: "Only verification or super administrators may send worker KYC reminders." };
  }

  try {
    const rows = await sql`
      SELECT
        u.id,
        u.is_suspended,
        wp.verification_status,
        wp.is_verified,
        wp.fin_last4,
        wp.fayda_doc_url
      FROM users u
      LEFT JOIN worker_profiles wp ON wp.user_id = u.id
      WHERE u.id = ${workerUserId}
        AND u.role = 'worker'
      LIMIT 1
    `;
    const worker = rows[0];
    if (!worker) {
      return { success: false, status: 404, error: "Artisan account not found." };
    }
    if (worker.is_suspended) {
      return { success: false, status: 409, error: "Cannot send verification reminder to a suspended artisan account." };
    }

    const identityComplete = hasCompleteWorkerIdentity({
      documentRef: worker.fayda_doc_url ? "present" : "",
      finLast4: worker.fin_last4,
      finEncrypted: worker.fin_last4 ? "present" : "",
    });
    const status = toWorkerDisplayStatus(
      worker.verification_status,
      worker.is_verified,
      worker.is_suspended,
      identityComplete,
    );
    if (status === "approved") {
      return { success: false, status: 409, error: "This artisan account is already verified." };
    }

    const template = workerReminderTemplate(status);
    const inserted = await sql`
      INSERT INTO notifications (user_id, type, title, body, link_href)
      SELECT
        ${workerUserId},
        'identity_verification_required',
        ${template.title},
        ${template.body},
        ${WORKER_VERIFY_LINK}
      WHERE NOT EXISTS (
        SELECT 1
        FROM notifications
        WHERE user_id = ${workerUserId}
          AND type = 'identity_verification_required'
          AND link_href = ${WORKER_VERIFY_LINK}
          AND created_at > NOW() - ${`${MANUAL_WORKER_REMINDER_COOLDOWN_HOURS} hours`}::interval
      )
      RETURNING id
    `;

    if (inserted.length === 0) {
      return { success: false, status: 429, error: "A verification reminder was already sent to this artisan recently." };
    }

    await sql`
      INSERT INTO audit_logs (admin_employee_id, action, details)
      VALUES (
        ${admin.id},
        'worker_verification_reminder_sent',
        ${JSON.stringify({
          adminId: admin.id,
          adminEmployeeId: admin.employeeId ?? null,
          targetUserId: workerUserId,
          status,
          channel: "in_app_notification",
          timestamp: new Date().toISOString(),
        })}
      )
    `.catch(() => undefined);

    revalidatePath(`/admin/workers/${workerUserId}`);
    revalidatePath("/admin/workers");
    revalidatePath("/worker/notifications");
    revalidatePath("/worker/pending-verification");
    return { success: true, status: 200 };
  } catch (error: any) {
    console.error("[WORKER_KYC_REMINDER_ERROR]", error);
    return { success: false, status: 500, error: "Failed to dispatch verification notification." };
  }
}

