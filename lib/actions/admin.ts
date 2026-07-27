"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/actions/notifications";
import { getClientIdentityColumns, toClientDisplayStatus } from "@/lib/client-verification";
import { getWorkerIdentityColumns } from "@/lib/worker-verification-server";

/**
 * Verifies or un-verifies a worker profile.
 * Restricted to Adims only.
 */
export async function toggleWorkerVerification(workerUserId: string, isVerified: boolean, reason?: string) {
  return updateWorkerVerificationStatus(workerUserId, isVerified ? "approved" : "rejected", reason);
}

const WORKER_VERIFICATION_STATUSES = new Set(["pending", "approved", "rejected", "suspended", "revoked"]);

export async function updateWorkerVerificationStatus(workerUserId: string, status: string, reason?: string) {
  const session = await auth();

  // Basic security check
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized. Admin access required.");
  }

  if (!WORKER_VERIFICATION_STATUSES.has(status)) {
    return { success: false, error: "Invalid worker verification status." };
  }

  try {
    const normalizedReason = typeof reason === "string" ? reason.trim().slice(0, 1000) : null;
    if (status === "rejected" && !normalizedReason) {
      return { success: false, error: "A rejection reason is required." };
    }
    if ((status === "revoked" || status === "suspended") && !normalizedReason) {
      return { success: false, error: "A reason is required for this verification decision." };
    }

    const isVerified = status === "approved";
    const columns = await getWorkerIdentityColumns();
    const selected = [
      "user_id",
      "is_verified",
      ...(columns.has("verification_status") ? ["verification_status"] : []),
    ];
    const currentRows = await sql.query(
      `SELECT ${selected.map((column) => `"${column}"`).join(", ")} FROM worker_profiles WHERE user_id = $1 LIMIT 1`,
      [workerUserId],
    );

    if (currentRows.length === 0) {
      return { success: false, error: "Worker not found." };
    }

    const oldStatus = currentRows[0].verification_status || (currentRows[0].is_verified ? "approved" : "pending");
    const setClauses = ["is_verified = $1"];
    const values: unknown[] = [isVerified];

    if (columns.has("verification_status")) {
      values.push(status);
      setClauses.push(`verification_status = $${values.length}`);
    }
    if (columns.has("verification_reason")) {
      values.push(isVerified || status === "pending" ? null : normalizedReason);
      setClauses.push(`verification_reason = $${values.length}`);
    }
    if (columns.has("verified_by")) {
      values.push(isVerified ? session.user.id : null);
      setClauses.push(`verified_by = $${values.length}`);
    }
    if (columns.has("verified_at")) {
      setClauses.push(`verified_at = ${isVerified ? "NOW()" : "NULL"}`);
    }

    values.push(workerUserId);
    const rows = await sql.query(
      `UPDATE worker_profiles SET ${setClauses.join(", ")} WHERE user_id = $${values.length} RETURNING user_id, full_name`,
      values,
    );

    try {
      await sql`
        INSERT INTO audit_logs (user_id, action, details)
        VALUES (
          ${session.user.id},
          'worker_verification_status_changed',
          ${JSON.stringify({
            adminId: session.user.id,
            userId: workerUserId,
            oldStatus,
            newStatus: status,
            reason: normalizedReason,
            timestamp: new Date().toISOString(),
          })}
        )
      `;
    } catch (auditError) {
      console.warn("[ADMIN_VERIFY_AUDIT_WARN]", auditError);
    }

    try {
      await createNotification({
        userId: workerUserId,
        type: isVerified ? "fayda_approved" : "fayda_rejected",
        title: isVerified ? "Verification Approved" : "Verification Updated",
        body: isVerified
          ? "Your Fayda verification was approved. You can now receive hiring requests."
          : normalizedReason || `Your Fayda verification status is now ${status}.`,
        linkHref: isVerified ? "/worker/dashboard" : "/worker/pending-verification",
      });
    } catch (notificationError) {
      console.warn("[ADMIN_VERIFY_NOTIFICATION_WARN]", notificationError);
    }
    
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/verify");
    revalidatePath("/admin/workers");
    revalidatePath(`/admin/verify/${workerUserId}`);
    revalidatePath(`/admin/workers/${workerUserId}`);
    revalidatePath("/worker/pending-verification");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN_VERIFY_ERROR]", error);
    return { success: false, error: "Failed to update verification status." };
  }
}

const CLIENT_VERIFICATION_STATUSES = new Set(["pending", "approved", "rejected", "suspended", "revoked"]);

export async function updateClientVerificationStatus(clientUserId: string, status: string, reason?: string) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized. Admin access required.");
  }

  if (!CLIENT_VERIFICATION_STATUSES.has(status)) {
    return { success: false, error: "Invalid client verification status." };
  }

  const normalizedReason = typeof reason === "string" ? reason.trim().slice(0, 1000) : null;
  if (status === "rejected" && !normalizedReason) {
    return { success: false, error: "A rejection reason is required." };
  }
  if ((status === "revoked" || status === "suspended") && !normalizedReason) {
    return { success: false, error: "A reason is required for this verification decision." };
  }

  try {
    const columns = await getClientIdentityColumns();
    const selected = [
      "user_id",
      "is_verified",
      ...(columns.has("verification_status") ? ["verification_status"] : []),
      ...(columns.has("fin_last4") ? ["fin_last4"] : []),
      ...(columns.has("fayda_doc_url") ? ["fayda_doc_url"] : []),
    ];
    const currentRows = await sql.query(
      `SELECT ${selected.map((column) => `"${column}"`).join(", ")} FROM client_profiles WHERE user_id = $1 LIMIT 1`,
      [clientUserId],
    );

    if (currentRows.length === 0) {
      return { success: false, error: "Client not found." };
    }

    const oldStatus = currentRows[0].verification_status
      ? toClientDisplayStatus(currentRows[0].verification_status, currentRows[0].is_verified)
      : currentRows[0].is_verified
        ? "approved"
        : currentRows[0].fin_last4 || currentRows[0].fayda_doc_url
          ? "pending"
          : "not_started";
    const isVerified = status === "approved";
    if (isVerified && (!currentRows[0].fin_last4 || !currentRows[0].fayda_doc_url)) {
      return { success: false, error: "Client must submit FIN and Fayda document before approval." };
    }

    if (columns.has("verification_status")) {
      const setClauses = ["is_verified = $1", "verification_status = $2"];
      const values: unknown[] = [isVerified, status];

      if (columns.has("verification_reason")) {
        values.push(normalizedReason);
        setClauses.push(`verification_reason = $${values.length}`);
      }
      if (columns.has("verified_by")) {
        values.push(isVerified ? session.user.id : null);
        setClauses.push(`verified_by = $${values.length}`);
      }
      if (columns.has("verified_at")) {
        setClauses.push(`verified_at = ${isVerified ? "NOW()" : "NULL"}`);
      }

      values.push(clientUserId);
      await sql.query(
        `UPDATE client_profiles SET ${setClauses.join(", ")} WHERE user_id = $${values.length}`,
        values,
      );
    } else {
      await sql`
        UPDATE client_profiles
        SET is_verified = ${isVerified}
        WHERE user_id = ${clientUserId}
      `;
    }

    try {
      await sql`
        INSERT INTO audit_logs (user_id, action, details)
        VALUES (
          ${session.user.id},
          'client_verification_status_changed',
          ${JSON.stringify({
            adminId: session.user.id,
            userId: clientUserId,
            oldStatus,
            newStatus: status,
            reason: normalizedReason,
            timestamp: new Date().toISOString(),
          })}
        )
      `;
    } catch (auditError) {
      console.warn("[CLIENT_VERIFY_AUDIT_WARN]", auditError);
    }

    try {
      await createNotification({
        userId: clientUserId,
        type: isVerified ? "fayda_approved" : "fayda_rejected",
        title: isVerified ? "Verification Approved" : "Verification Updated",
        body: isVerified
          ? "Your Fayda verification was approved. You can now access contracts."
          : normalizedReason || `Your Fayda verification status is now ${status}.`,
        linkHref: isVerified ? "/client/contracts" : "/client/profile/settings?verify=1",
      });
    } catch (notificationError) {
      console.warn("[CLIENT_VERIFY_NOTIFICATION_WARN]", notificationError);
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin/verify");
    revalidatePath(`/admin/clients/${clientUserId}/verify`);
    revalidatePath(`/client/profile`);
    revalidatePath(`/client/profile/settings`);
    return { success: true };
  } catch (error) {
    console.error("[CLIENT_VERIFY_ERROR]", error instanceof Error ? error.message : "Unknown error");
    return { success: false, error: "Failed to update client verification status." };
  }
}
