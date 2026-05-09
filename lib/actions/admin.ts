"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Verifies or un-verifies a worker profile.
 * Restricted to Adims only.
 */
export async function toggleWorkerVerification(workerUserId: string, isVerified: boolean) {
  const session = await auth();

  // Basic security check
  if (session?.user?.role !== "admin") {
    throw new Error("Unauthorized. Admin access required.");
  }

  try {
    await sql`
      UPDATE worker_profiles 
      SET is_verified = ${isVerified} 
      WHERE user_id = ${workerUserId}
    `;
    
    revalidatePath("/admin/dashboard");
    revalidatePath(`/admin/verify/${workerUserId}`);
    return { success: true };
  } catch (error) {
    console.error("[ADMIN_VERIFY_ERROR]", error);
    return { success: false, error: "Failed to update verification status." };
  }
}
