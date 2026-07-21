"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

type SetupResult =
  | { success: true }
  | { success: false; error: string; code?: "UNAUTHORIZED" | "FORBIDDEN" | "INVALID_INPUT" | "UNKNOWN" };

type VerifyPinResult =
  | { success: true }
  | { success: false; error: string; code?: "UNAUTHORIZED" | "SETUP_REQUIRED" | "INVALID_PIN" | "UNKNOWN" };

function getSetupHref(role?: string | null) {
  return role === "worker" ? "/worker/contract-setup" : "/client/contract-setup";
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

export async function getContractSetupStatus(userId?: string) {
  const session = await auth();
  const targetUserId = userId ?? session?.user?.id;

  if (!targetUserId || !session?.user?.id) {
    return { completed: false, setupHref: "/login" };
  }

  if (targetUserId !== session.user.id && session.user.role !== "admin") {
    return { completed: false, setupHref: getSetupHref(session.user.role) };
  }

  try {
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
    };
  } catch (error) {
    console.error("[GET_CONTRACT_SETUP_STATUS_ERROR]", error);
    return { completed: false, completedAt: null, setupHref: getSetupHref(session.user.role) };
  }
}

export async function ensureContractSetupComplete() {
  const session = await auth();
  if (!session?.user?.id) {
    return { completed: false, setupHref: "/login", error: "Please login to continue" };
  }

  const status = await getContractSetupStatus(session.user.id);
  return {
    ...status,
    error: status.completed ? null : "Complete Contract Setup before using contract features.",
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
