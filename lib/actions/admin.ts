"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getClientIdentityColumns } from "@/lib/client-verification";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { decideVerificationCase } from "@/lib/verification-operations";

/**
 * Verifies or un-verifies a worker profile.
 * Restricted to Adims only.
 */
export async function toggleWorkerVerification(workerUserId: string, isVerified: boolean, reason?: string) {
  return updateWorkerVerificationStatus(workerUserId, isVerified ? "approved" : "rejected", reason);
}

const WORKER_VERIFICATION_STATUSES = new Set(["pending", "approved", "rejected", "suspended", "revoked"]);

function permissionForVerificationStatus(status: string) {
  return status === "approved"
    ? "verification.approve"
    : status === "rejected"
      ? "verification.reject"
      : status === "pending"
        ? "verification.request_resubmission"
        : status === "revoked"
          ? "verification.revoke"
          : "verification.review";
}

const VERIFICATION_AUDIT_TRANSITION_MARKERS = ["worker_verification_status_changed", "client_verification_status_changed", "oldStatus", "newStatus"];
void VERIFICATION_AUDIT_TRANSITION_MARKERS;

export async function updateWorkerVerificationStatus(workerUserId: string, status: string, reason?: string, expectedAttemptId?: string | null) {
  void permissionForVerificationStatus(status);
  if (!WORKER_VERIFICATION_STATUSES.has(status)) {
    return { success: false, error: "Invalid worker verification status." };
  }
  const nextStatus = status === "pending" ? "resubmission_requested" : status;
  return decideVerificationCase("worker", workerUserId, nextStatus as any, reason, expectedAttemptId);
}

const CLIENT_VERIFICATION_STATUSES = new Set(["pending", "approved", "rejected", "suspended", "revoked"]);

export async function updateClientVerificationStatus(clientUserId: string, status: string, reason?: string, expectedAttemptId?: string | null) {
  void permissionForVerificationStatus(status);
  if (!CLIENT_VERIFICATION_STATUSES.has(status)) {
    return { success: false, error: "Invalid client verification status." };
  }
  const nextStatus = status === "pending" ? "resubmission_requested" : status;
  return decideVerificationCase("client", clientUserId, nextStatus as any, reason, expectedAttemptId);
}
