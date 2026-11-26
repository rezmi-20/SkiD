"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { writeGovernanceAudit } from "@/lib/actions/governance";

export interface AdminReviewRow {
  id: string;
  jobId: string;
  jobTitle: string;
  score: number;
  comment: string | null;
  isFlagged: boolean;
  flagReason: string | null;
  isHidden: boolean;
  moderationReason: string | null;
  moderatedAt: string | null;
  moderatorName: string | null;
  moderatorEmployeeId: string | null;
  createdAt: string;
  raterId: string;
  raterName: string;
  raterRole: string;
  ratedId: string;
  ratedName: string;
  ratedRole: string;
  ratedDistrict: string | null;
  targetAvgRating: number;
  targetVisibleCount: number;
}

function cleanText(value: unknown, max = 500) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export async function recalculateVisibleRatingStats(targetUserId: string) {
  const rows = await sql`
    SELECT
      COALESCE(ROUND(AVG(score)::numeric, 1), 0)::float AS avg_rating,
      COUNT(*)::int AS visible_count
    FROM ratings
    WHERE rated_id = ${targetUserId}
      AND COALESCE(is_hidden, false) = false
  `;
  return {
    avgRating: Number(rows[0]?.avg_rating ?? 0),
    visibleCount: Number(rows[0]?.visible_count ?? 0),
  };
}

export async function getAdminReviewsForModeration() {
  await requireAdminPermission("reviews.read");

  // Privacy-minimized query: returns display names, roles, job title, and district only (no email/phone).
  const rows = await sql`
    SELECT
      r.id,
      r.job_id AS "jobId",
      j.title AS "jobTitle",
      r.score,
      r.comment,
      r.is_flagged AS "isFlagged",
      r.flag_reason AS "flagReason",
      COALESCE(r.is_hidden, false) AS "isHidden",
      r.moderation_reason AS "moderationReason",
      r.moderated_at AS "moderatedAt",
      mod_admin.full_name AS "moderatorName",
      mod_admin.admin_employee_id AS "moderatorEmployeeId",
      r.created_at AS "createdAt",
      r.rater_id AS "raterId",
      COALESCE(wp_rater.full_name, cp_rater.full_name, 'Platform User') AS "raterName",
      u_rater.role::text AS "raterRole",
      r.rated_id AS "ratedId",
      COALESCE(wp_rated.full_name, cp_rated.full_name, 'Platform User') AS "ratedName",
      u_rated.role::text AS "ratedRole",
      wp_rated.district AS "ratedDistrict",
      COALESCE(stats.avg_rating, 0)::float AS "targetAvgRating",
      COALESCE(stats.visible_count, 0)::int AS "targetVisibleCount"
    FROM ratings r
    JOIN jobs j ON j.id = r.job_id
    JOIN users u_rater ON u_rater.id = r.rater_id
    JOIN users u_rated ON u_rated.id = r.rated_id
    LEFT JOIN worker_profiles wp_rater ON wp_rater.user_id = r.rater_id
    LEFT JOIN client_profiles cp_rater ON cp_rater.user_id = r.rater_id
    LEFT JOIN worker_profiles wp_rated ON wp_rated.user_id = r.rated_id
    LEFT JOIN client_profiles cp_rated ON cp_rated.user_id = r.rated_id
    LEFT JOIN admin_employees mod_admin ON mod_admin.id = r.moderated_by
    LEFT JOIN LATERAL (
      SELECT
        COALESCE(ROUND(AVG(r2.score)::numeric, 1), 0) AS avg_rating,
        COUNT(*)::int AS visible_count
      FROM ratings r2
      WHERE r2.rated_id = r.rated_id
        AND COALESCE(r2.is_hidden, false) = false
    ) stats ON true
    ORDER BY
      r.is_flagged DESC,
      COALESCE(r.is_hidden, false) DESC,
      r.created_at DESC
    LIMIT 200
  `;

  return (rows || []).map((row: any) => ({
    ...row,
    moderatedAt: row.moderatedAt ? String(row.moderatedAt) : null,
    createdAt: String(row.createdAt),
    targetAvgRating: Number(row.targetAvgRating || 0),
    targetVisibleCount: Number(row.targetVisibleCount || 0),
  })) as AdminReviewRow[];
}

export async function moderateReviewAction(input: {
  ratingId: string;
  hide: boolean;
  reason: string;
}) {
  const admin = await requireAdminPermission("reviews.moderate");
  if (admin.role !== "content_verification_admin" || !hasAdminPermission(admin, "reviews.moderate")) {
    return { success: false, error: "Only content verification administrators may moderate reviews." };
  }

  const normalizedReason = cleanText(input.reason, 500);
  if (normalizedReason.length < 5) {
    return { success: false, error: "Please provide a clear moderation reason (at least 5 characters)." };
  }

  const existingRows = await sql`
    SELECT
      id,
      job_id,
      rater_id,
      rated_id,
      score,
      is_flagged,
      COALESCE(is_hidden, false) AS is_hidden,
      moderation_reason
    FROM ratings
    WHERE id = ${input.ratingId}
    LIMIT 1
  `;

  const existing = existingRows[0];
  if (!existing) {
    return { success: false, error: "Review record not found." };
  }

  if (existing.rater_id === admin.id || existing.rated_id === admin.id) {
    return { success: false, error: "Administrators cannot moderate reviews involving their own account." };
  }

  if (Boolean(existing.is_hidden) === Boolean(input.hide)) {
    return {
      success: false,
      error: input.hide ? "This review is already hidden." : "This review is already visible.",
    };
  }

  const beforeStats = await recalculateVisibleRatingStats(existing.rated_id);

  await sql`
    UPDATE ratings
    SET
      is_hidden = ${Boolean(input.hide)},
      moderation_reason = ${normalizedReason},
      moderated_by = ${admin.id},
      moderated_at = NOW()
    WHERE id = ${input.ratingId}
  `;

  const afterStats = await recalculateVisibleRatingStats(existing.rated_id);

  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: input.hide ? "rating_hidden" : "rating_restored",
    module: "reviews",
    targetType: "rating",
    targetId: input.ratingId,
    previousState: {
      isHidden: Boolean(existing.is_hidden),
      targetAvgRating: beforeStats.avgRating,
      targetVisibleCount: beforeStats.visibleCount,
    },
    newState: {
      isHidden: Boolean(input.hide),
      targetAvgRating: afterStats.avgRating,
      targetVisibleCount: afterStats.visibleCount,
    },
    reason: normalizedReason,
    highRisk: true,
    details: {
      jobId: existing.job_id,
      ratedUserId: existing.rated_id,
      score: existing.score,
    },
  }).catch(() => undefined);

  revalidatePath("/admin/reviews");
  revalidatePath("/admin/workers");
  revalidatePath(`/admin/workers/${existing.rated_id}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/worker/dashboard");
  revalidatePath("/worker/rate");
  revalidatePath("/client/rate");
  revalidatePath(`/client/worker/${existing.rated_id}`);

  return {
    success: true,
    ratedId: String(existing.rated_id),
    recalculated: afterStats,
  };
}

export async function flagReviewByParticipant(ratingId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Authentication required." };
  }

  const normalizedReason = cleanText(reason, 400);
  if (normalizedReason.length < 5) {
    return { success: false, error: "Please explain why this review is being reported." };
  }

  const rows = await sql`
    UPDATE ratings
    SET
      is_flagged = true,
      flag_reason = ${normalizedReason}
    WHERE id = ${ratingId}
      AND (rated_id = ${session.user.id} OR rater_id = ${session.user.id})
    RETURNING id
  `;

  if (rows.length === 0) {
    return { success: false, error: "Review not found or you are not a participant on this job." };
  }

  revalidatePath("/admin/reviews");
  return { success: true };
}
