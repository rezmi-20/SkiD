"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { assertActiveVerifiedWorker } from "@/lib/identity-lifecycle";
import {
  CLIENT_CONTRACT_VERIFICATION_MESSAGE,
  CLIENT_PIN_VERIFICATION_MESSAGE,
  getClientIdentityStatus,
  getClientVerificationHref,
} from "@/lib/client-verification";

type SetupResult =
  | { success: true }
  | { success: false; error: string; code?: "UNAUTHORIZED" | "FORBIDDEN" | "INVALID_INPUT" | "UNKNOWN" };

type VerifyPinResult =
  | { success: true }
  | { success: false; error: string; code?: "UNAUTHORIZED" | "SETUP_REQUIRED" | "INVALID_PIN" | "UNKNOWN" };

function getSetupHref(role?: string | null) {
  return role === "worker" ? "/worker/contract-setup" : "/client/contract-setup";
}

export async function getClientIdentityVerificationStatus(userId?: string) {
  const session = await auth();
  const targetUserId = userId ?? session?.user?.id;

  if (!session?.user?.id || !targetUserId) {
    return { verified: false, status: "unauthorized", maskedFin: null, verificationHref: "/login" };
  }

  if (targetUserId !== session.user.id && session.user.role !== "admin") {
    return { verified: false, status: "forbidden", maskedFin: null, verificationHref: getClientVerificationHref() };
  }

  const profile = await getClientIdentityStatus(targetUserId);
  const verified = profile.status === "approved" && profile.isVerified && profile.hasFin;

  return {
    verified,
    status: profile.status,
    maskedFin: profile.maskedFin,
    verificationHref: getClientVerificationHref(),
  };
}

async function logAuditAction(userId: string, action: string, details: Record<string, unknown>) {
  try {
    await sql`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (${userId}, ${action}, ${JSON.stringify(details)})
    `;
  } catch (error) {
    console.warn("[AUDIT_LOG_SKIPPED]", action, error);
  }
}

export async function getContractSetupStatus(userId?: string, returnTo?: string) {
  const session = await auth();
  const targetUserId = userId ?? session?.user?.id;

  if (!targetUserId || !session?.user?.id) {
    return { completed: false, setupHref: "/login" };
  }

  if (targetUserId !== session.user.id && session.user.role !== "admin") {
    return { completed: false, setupHref: getSetupHref(session.user.role) };
  }

  try {
    if (session.user.role === "client" && targetUserId === session.user.id) {
      const identity = await getClientIdentityVerificationStatus(targetUserId);
      if (!identity.verified) {
        return {
          completed: false,
          completedAt: null,
          setupHref: getClientVerificationHref(
            returnTo,
            returnTo === "/client/contract-setup" ? CLIENT_PIN_VERIFICATION_MESSAGE : CLIENT_CONTRACT_VERIFICATION_MESSAGE,
          ),
          identityVerified: false,
          error: returnTo === "/client/contract-setup" ? CLIENT_PIN_VERIFICATION_MESSAGE : CLIENT_CONTRACT_VERIFICATION_MESSAGE,
        };
      }
    }

    if (session.user.role === "worker" && targetUserId === session.user.id) {
      const workerAccess = await assertActiveVerifiedWorker(targetUserId);
      if (!workerAccess.allowed) {
        return {
          completed: false,
          completedAt: null,
          setupHref: "/worker/pending-verification",
          identityVerified: false,
          error: workerAccess.error || "Worker verification is required before accessing contracts.",
        };
      }
    }

    const rows = await sql`
      SELECT completed_at
      FROM contract_setups
      WHERE user_id = ${targetUserId}
      LIMIT 1
    `;

    return {
      completed: rows.length > 0 && !!rows[0].completed_at,
      completedAt: rows[0]?.completed_at ?? null,
      setupHref: getSetupHref(session.user.role),
      identityVerified: true,
    };
  } catch (error) {
    console.error("[GET_CONTRACT_SETUP_STATUS_ERROR]", error);
    return { completed: false, completedAt: null, setupHref: getSetupHref(session.user.role) };
  }
}

export async function ensureContractSetupComplete(returnTo?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { completed: false, setupHref: "/login", error: "Please login to continue" };
  }

  const status = await getContractSetupStatus(session.user.id, returnTo);
  return {
    ...status,
    error: status.error || (status.completed ? null : "Complete Contract Setup before using contract features."),
  };
}

export async function completeContractSetup({
  pin,
  confirmPin,
  acceptedPolicy,
  acceptedSignatureUse,
}: {
  pin: string;
  confirmPin: string;
  acceptedPolicy: boolean;
  acceptedSignatureUse: boolean;
}): Promise<SetupResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  if (session.user.role !== "client" && session.user.role !== "worker") {
    return { success: false, error: "Only clients and workers can complete Contract Setup.", code: "FORBIDDEN" };
  }

  if (session.user.role === "client") {
    const identity = await getClientIdentityVerificationStatus(session.user.id);
    if (!identity.verified) {
      return { success: false, error: CLIENT_PIN_VERIFICATION_MESSAGE, code: "FORBIDDEN" };
    }
  }

  if (session.user.role === "worker") {
    const workerAccess = await assertActiveVerifiedWorker(session.user.id);
    if (!workerAccess.allowed) {
      return { success: false, error: workerAccess.error || "Worker verification is required before contract setup.", code: "FORBIDDEN" };
    }
  }

  if (!acceptedPolicy || !acceptedSignatureUse) {
    return { success: false, error: "Please accept the required contract confirmations.", code: "INVALID_INPUT" };
  }

  if (!/^\d{4}$/.test(pin)) {
    return { success: false, error: "Contract PIN must be exactly 4 digits.", code: "INVALID_INPUT" };
  }

  if (pin !== confirmPin) {
    return { success: false, error: "PIN confirmation does not match.", code: "INVALID_INPUT" };
  }

  try {
    const pinHash = await bcrypt.hash(pin, 12);

    await sql`
      INSERT INTO contract_setups (
        user_id,
        pin_hash,
        accepted_policy,
        accepted_signature_use,
        completed_at,
        updated_at
      )
      VALUES (
        ${session.user.id},
        ${pinHash},
        ${acceptedPolicy},
        ${acceptedSignatureUse},
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        pin_hash = EXCLUDED.pin_hash,
        accepted_policy = EXCLUDED.accepted_policy,
        accepted_signature_use = EXCLUDED.accepted_signature_use,
        completed_at = NOW(),
        updated_at = NOW()
    `;

    await logAuditAction(session.user.id, "contract_setup_completed", {
      role: session.user.role,
      acceptedPolicy,
      acceptedSignatureUse,
    });

    revalidatePath("/client/contract-setup");
    revalidatePath("/worker/contract-setup");
    revalidatePath("/client/contracts");
    revalidatePath("/worker/contracts");

    return { success: true };
  } catch (error) {
    console.error("[COMPLETE_CONTRACT_SETUP_ERROR]", error);
    return { success: false, error: "Failed to complete Contract Setup.", code: "UNKNOWN" };
  }
}

export async function verifyContractPin(pin: string): Promise<VerifyPinResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  try {
    if (session.user.role === "client") {
      const identity = await getClientIdentityVerificationStatus(session.user.id);
      if (!identity.verified) {
        return { success: false, error: CLIENT_PIN_VERIFICATION_MESSAGE, code: "UNAUTHORIZED" };
      }
    }

    if (session.user.role === "worker") {
      const workerAccess = await assertActiveVerifiedWorker(session.user.id);
      if (!workerAccess.allowed) {
        return { success: false, error: workerAccess.error || "Worker verification is required before signing.", code: "UNAUTHORIZED" };
      }
    }

    const rows = await sql`
      SELECT pin_hash
      FROM contract_setups
      WHERE user_id = ${session.user.id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return { success: false, error: "Complete Contract Setup before signing.", code: "SETUP_REQUIRED" };
    }

    const isValid = await bcrypt.compare(pin, rows[0].pin_hash);
    if (!isValid) {
      return { success: false, error: "Invalid Contract PIN.", code: "INVALID_PIN" };
    }

    return { success: true };
  } catch (error) {
    console.error("[VERIFY_CONTRACT_PIN_ERROR]", error);
    return { success: false, error: "Failed to verify Contract PIN.", code: "UNKNOWN" };
  }
}
