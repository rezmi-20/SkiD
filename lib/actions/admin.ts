"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/actions/notifications";

/**
 * Verifies or un-verifies a worker profile.
 * Restricted to Adims only.
 */
export async function toggleWorkerVerification(workerUserId: string, isVerified: boolean, reason?: string) {
  const session = await auth();

  // Basic security check
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized. Admin access required.");
  }

  try {
    const normalizedReason = typeof reason === "string" ? reason.trim().slice(0, 1000) : null;

    const rows = await sql`
      UPDATE worker_profiles 
      SET
        is_verified = ${isVerified},
        verification_status = ${isVerified ? "approved" : "rejected"},
        verification_reason = ${isVerified ? null : normalizedReason},
        verified_by = ${session.user.id},
        verified_at = NOW()
      WHERE user_id = ${workerUserId}
      RETURNING user_id, full_name
    `;

    if (rows.length === 0) {
      return { success: false, error: "Worker not found." };
    }

    await createNotification({
      userId: workerUserId,
      type: isVerified ? "fayda_approved" : "fayda_rejected",
      title: isVerified ? "Verification Approved" : "Verification Rejected",
      body: isVerified
        ? "Your Fayda verification was approved. You can now receive hiring requests."
        : normalizedReason || "Your Fayda verification was rejected. Please resubmit a clearer document.",
      linkHref: isVerified ? "/worker/dashboard" : "/worker/pending-verification",
    });
    
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/verify");
    revalidatePath(`/admin/verify/${workerUserId}`);
    revalidatePath("/worker/pending-verification");
    return { success: true };
  } catch (error) {
    console.error("[ADMIN_VERIFY_ERROR]", error);
    return { success: false, error: "Failed to update verification status." };
  }
}
