"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/actions/notifications";

type ContractActionResult =
  | { success: true; contract?: any }
  | {
      success: false;
      error: string;
      code?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INVALID_STATE" | "DUPLICATE" | "UNKNOWN";
    };

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

export async function getUserContracts() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const role = session.user.role;

  try {
    if (role === "client") {
      return await sql`
        SELECT
          c.id as contract_id,
          c.client_signed_at,
          c.worker_signed_at,
          c.signed_at,
          c.pdf_url,
          c.created_at as contract_created_at,
          j.id as job_id,
          j.title as job_title,
          j.status as job_status,
          j.budget,
          wp.full_name as partner_name,
          wp.avatar_url as partner_avatar,
          wp.is_verified as partner_verified
        FROM contracts c
        JOIN jobs j ON c.job_id = j.id
        LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
        WHERE j.client_id = ${userId}
        ORDER BY c.created_at DESC
      `;
    }

    if (role === "worker") {
      return await sql`
        SELECT
          c.id as contract_id,
          c.client_signed_at,
          c.worker_signed_at,
          c.signed_at,
          c.pdf_url,
          c.created_at as contract_created_at,
          j.id as job_id,
          j.title as job_title,
          j.status as job_status,
          j.budget,
          cp.full_name as partner_name,
          cp.avatar_url as partner_avatar
        FROM contracts c
        JOIN jobs j ON c.job_id = j.id
        LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
        WHERE j.worker_id = ${userId}
        ORDER BY c.created_at DESC
      `;
    }

    return [];
  } catch (error) {
    console.error("[GET_USER_CONTRACTS_ERROR]", error);
    return [];
  }
}

export async function getContractDetails(contractId: string) {
  return getContractForSigning(contractId);
}

export async function getContractForSigning(contractId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const contracts = await sql`
      SELECT
        c.*,
        c.client_signed_at,
        c.worker_signed_at,
        j.title as job_title,
        j.description as job_description,
        j.status as job_status,
        j.budget,
        j.client_id,
        j.worker_id,
        wp.full_name as worker_name,
        wp.avatar_url as worker_avatar,
        u_worker.phone as worker_phone,
        wp.is_verified as worker_verified,
        cp.full_name as client_name,
        cp.avatar_url as client_avatar,
        u_client.phone as client_phone
      FROM contracts c
      JOIN jobs j ON c.job_id = j.id
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
      LEFT JOIN users u_worker ON j.worker_id = u_worker.id
      LEFT JOIN users u_client ON j.client_id = u_client.id
      WHERE c.id = ${contractId}
    `;

    if (contracts.length === 0) return null;
    const contract = contracts[0];

    const isClient = session.user.id === contract.client_id;
    const isWorker = session.user.id === contract.worker_id;
    const isAdmin = session.user.role === "admin";

    if (!isClient && !isWorker && !isAdmin) {
      throw new Error("Forbidden");
    }

    const clientSigned = !!contract.client_signed_at;
    const workerSigned = !!contract.worker_signed_at;

    return {
      ...contract,
      user_role: isClient ? "client" : isWorker ? "worker" : "admin",
      user_has_signed: isClient ? clientSigned : isWorker ? workerSigned : false,
      signature_status: clientSigned && workerSigned
        ? "active"
        : clientSigned
          ? "pending_worker"
          : "pending_client",
    };
  } catch (error) {
    console.error("[GET_CONTRACT_FOR_SIGNING_ERROR]", error);
    return null;
  }
}

export async function signContractAsClient(contractId: string, pin?: string): Promise<ContractActionResult> {
  return signContractForRole(contractId, "client", pin);
}

export async function signContractAsWorker(contractId: string, pin?: string): Promise<ContractActionResult> {
  return signContractForRole(contractId, "worker", pin);
}

export async function signContract(contractId: string, pin?: string): Promise<ContractActionResult> {
  const session = await auth();

  if (session?.user?.role === "client") {
    return signContractAsClient(contractId, pin);
  }

  if (session?.user?.role === "worker") {
    return signContractAsWorker(contractId, pin);
  }

  return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
}

async function signContractForRole(
  contractId: string,
  role: "client" | "worker",
  pin?: string
): Promise<ContractActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  if (session.user.role !== role) {
    return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
  }

  if (pin !== undefined && pin !== "1234") {
    return { success: false, error: "Invalid PIN", code: "FORBIDDEN" };
  }

  try {
    const contractRows = await sql`
      SELECT
        c.*,
        j.id as job_id,
        j.client_id,
        j.worker_id,
        j.title as job_title,
        j.status as job_status
      FROM contracts c
      JOIN jobs j ON c.job_id = j.id
      WHERE c.id = ${contractId}
      LIMIT 1
    `;

    if (contractRows.length === 0) {
      return { success: false, error: "Contract not found", code: "NOT_FOUND" };
    }

    const contract = contractRows[0];
    const isClient = role === "client";
    const isWorker = role === "worker";

    if (isClient && contract.client_id !== session.user.id) {
      return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
    }

    if (isWorker && contract.worker_id !== session.user.id) {
      return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
    }

    if (!contract.signed_at && !["accepted", "pending"].includes(contract.job_status)) {
      return {
        success: false,
        error: `Cannot sign while job is in ${contract.job_status} state`,
        code: "INVALID_STATE",
      };
    }

    if (isClient && contract.client_signed_at) {
      return { success: false, error: "Already completed this action", code: "DUPLICATE" };
    }

    if (isWorker && contract.worker_signed_at) {
      return { success: false, error: "Already completed this action", code: "DUPLICATE" };
    }

    const updatedRows = isClient
      ? await sql`
          UPDATE contracts
          SET client_signed_at = NOW()
          WHERE id = ${contractId}
            AND client_signed_at IS NULL
          RETURNING *
        `
      : await sql`
          UPDATE contracts
          SET worker_signed_at = NOW()
          WHERE id = ${contractId}
            AND worker_signed_at IS NULL
          RETURNING *
        `;

    if (updatedRows.length === 0) {
      return { success: false, error: "Already completed this action", code: "DUPLICATE" };
    }

    let updatedContract = updatedRows[0];
    const bothSigned = !!updatedContract.client_signed_at && !!updatedContract.worker_signed_at;

    await logAuditAction(
      session.user.id,
      isClient ? "contract_signed_client" : "contract_signed_worker",
      { contractId, jobId: contract.job_id }
    );

    if (bothSigned) {
      const signedRows = await sql`
        UPDATE contracts
        SET signed_at = COALESCE(signed_at, NOW())
        WHERE id = ${contractId}
        RETURNING *
      `;
      updatedContract = signedRows[0] ?? updatedContract;

      await sql`
        UPDATE jobs
        SET status = 'active', updated_at = NOW()
        WHERE id = ${contract.job_id}
      `;

      await createNotification({
        userId: contract.client_id,
        type: "contract_signed",
        title: "Contract is Now Active!",
        body: `Both parties have signed. The job "${contract.job_title}" is now in progress.`,
        linkHref: `/contracts/${contractId}`,
      });

      await createNotification({
        userId: contract.worker_id,
        type: "contract_signed",
        title: "Contract is Now Active!",
        body: `Both parties have signed. The job "${contract.job_title}" is now in progress.`,
        linkHref: `/contracts/${contractId}`,
      });
    } else {
      const notifyId = isClient ? contract.worker_id : contract.client_id;
      const signerLabel = isClient ? "Client" : "Worker";
      await createNotification({
        userId: notifyId,
        type: "contract_signed",
        title: `${signerLabel} Signed the Contract`,
        body: `The ${signerLabel.toLowerCase()} has signed for "${contract.job_title}". Waiting for your signature.`,
        linkHref: `/contracts/${contractId}`,
      });
    }

    return { success: true, contract: updatedContract };
  } catch (error) {
    console.error("[SIGN_CONTRACT_ERROR]", error);
    return { success: false, error: "Failed to sign contract", code: "UNKNOWN" };
  }
}
