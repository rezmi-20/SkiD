"use server";

import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { isTrustedUploadReference } from "@/lib/security";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { revalidatePath } from "next/cache";

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function requestWorkerAvatarChange(avatarUrl: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "worker") {
    return { success: false, error: "Only workers can request a profile photo change." };
  }
  if (!isTrustedUploadReference(avatarUrl)) {
    return { success: false, error: "Upload a valid profile photo before submitting the request." };
  }

  try {
    const rows = await sql`
      INSERT INTO worker_avatar_change_requests (worker_user_id, requested_avatar_url)
      SELECT ${session.user.id}, ${avatarUrl}
      FROM worker_profiles wp
      WHERE wp.user_id = ${session.user.id}
        AND COALESCE(wp.avatar_url, '') <> ${avatarUrl}
        AND NOT EXISTS (
          SELECT 1 FROM worker_avatar_change_requests r
          WHERE r.worker_user_id = wp.user_id AND r.status = 'pending'
        )
      RETURNING id
    `;
    if (!rows[0]) return { success: false, error: "A photo request is already pending, or the photo matches your current one." };
    revalidatePath("/worker/profile/settings");
    revalidatePath("/admin/worker-avatar-requests");
    return { success: true };
  } catch (error) {
    console.error("[WORKER_AVATAR_REQUEST_ERROR]", error);
    return { success: false, error: "Could not submit the photo change request. Please try again." };
  }
}

export async function getWorkerAvatarChangeRequests() {
  await requireAdminPermission("verification.read");
  return sql`
    SELECT
      r.id,
      r.worker_user_id,
      r.requested_avatar_url,
      r.status,
      r.created_at,
      wp.full_name,
      wp.avatar_url AS current_avatar_url,
      wp.fayda_doc_url,
      u.email,
      u.phone
    FROM worker_avatar_change_requests r
    JOIN worker_profiles wp ON wp.user_id = r.worker_user_id
    JOIN users u ON u.id = r.worker_user_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at ASC
  `;
}

export async function reviewWorkerAvatarChange(
  requestId: string,
  decision: "approved" | "rejected",
  reason = "",
) {
  const admin = await requireAdminPermission("verification.review");
  if (!ID_PATTERN.test(requestId)) return { success: false, error: "Invalid request." };
  const normalizedReason = reason.trim().slice(0, 500);
  if (decision === "rejected" && !normalizedReason) {
    return { success: false, error: "Add a reason when rejecting the photo." };
  }

  try {
    const [lockedRequests, updatedProfiles, updatedRequests] = await sql.transaction([
      sql`
        SELECT r.id, r.worker_user_id, r.requested_avatar_url
        FROM worker_avatar_change_requests r
        JOIN worker_profiles wp ON wp.user_id = r.worker_user_id
        WHERE r.id = ${requestId} AND r.status = 'pending'
        FOR UPDATE OF r
      `,
      sql`
        UPDATE worker_profiles
        SET avatar_url = (
          SELECT r.requested_avatar_url FROM worker_avatar_change_requests r
          WHERE r.id = ${requestId} AND r.status = 'pending'
        )
        WHERE user_id = (
          SELECT r.worker_user_id FROM worker_avatar_change_requests r
          WHERE r.id = ${requestId} AND r.status = 'pending'
        ) AND ${decision} = 'approved'
        RETURNING user_id
      `,
      sql`
        UPDATE worker_avatar_change_requests
        SET status = ${decision}, review_reason = ${normalizedReason || null}, reviewed_by = ${admin.id}, reviewed_at = NOW()
        WHERE id = ${requestId} AND status = 'pending'
          AND (${decision} = 'rejected' OR EXISTS (SELECT 1 FROM worker_profiles WHERE user_id = worker_avatar_change_requests.worker_user_id))
        RETURNING worker_user_id
      `,
    ]);
    if (!lockedRequests[0] || !updatedRequests[0]) {
      return { success: false, error: "This request was already handled or could not be found." };
    }
    revalidatePath("/admin/worker-avatar-requests");
    revalidatePath("/admin/verify");
    revalidatePath("/worker/profile/settings");
    return { success: true };
  } catch (error) {
    console.error("[WORKER_AVATAR_REVIEW_ERROR]", error);
    return { success: false, error: "Could not update this photo request." };
  }
}
