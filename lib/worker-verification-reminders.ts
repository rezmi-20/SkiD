"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";

const WORKER_VERIFY_LINK = "/worker/pending-verification";

export async function sendWorkerVerificationReminder(workerUserId: string) {
  const admin = await getAdminPrincipal();
  if (!admin || !hasAdminPermission(admin, "verification.review")) {
    return { success: false, error: "Unauthorized to dispatch KYC reminders." };
  }

  try {
    await sql`
      INSERT INTO notifications (user_id, type, title, body, link_href)
      VALUES (
        ${workerUserId},
        'identity_verification_required',
        'Action Required: Complete your Fayda National ID verification',
        'Please submit your Fayda ID documents and National ID number so platform moderators can review and approve your artisan profile.',
        ${WORKER_VERIFY_LINK}
      )
    `;

    revalidatePath(`/admin/workers/${workerUserId}`);
    revalidatePath("/admin/workers");
    return { success: true };
  } catch (error: any) {
    console.error("[WORKER_KYC_REMINDER_ERROR]", error);
    return { success: false, error: "Failed to dispatch verification notification." };
  }
}

