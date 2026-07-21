"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/actions/notifications";
import { ensureContractSetupComplete, verifyContractPin } from "@/lib/actions/contract-setup";
import { revalidatePath } from "next/cache";
import { activateContractAfterFullSignature } from "@/lib/contract-documents";

type ContractActionResult =
  | { success: true; contract?: any }
  | {
      success: false;
      error: string;
      code?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "INVALID_STATE" | "DUPLICATE" | "CONTRACT_SETUP_REQUIRED" | "UNKNOWN";
    };

interface ContractDraftInput {
  jobTitle: string;
  jobDescription: string;
  workLocation: string;
  paymentAmount: string | number | null;
  estimatedCompletionDate: string;
  materialsResponsibility: string;
  additionalNotes: string;
}

function optionalText(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function parsePaymentAmount(value: string | number | null) {
  if (value === null || value === "") return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return NaN;
  return Math.round(amount);
}

function parseOptionalDate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
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

export async function saveContractDraft(contractId: string, draft: ContractDraftInput): Promise<ContractActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  if (session.user.role !== "client") {
    return { success: false, error: "Only the client can edit the contract draft.", code: "FORBIDDEN" };
  }

  const setup = await ensureContractSetupComplete();
  if (!setup.completed) {
    return {
      success: false,
      error: setup.error || "Complete Contract Setup before editing contract drafts.",
      code: "CONTRACT_SETUP_REQUIRED",
    };
  }

  const paymentAmount = parsePaymentAmount(draft.paymentAmount);
  if (Number.isNaN(paymentAmount)) {
    return { success: false, error: "Payment amount must be a valid positive number.", code: "INVALID_STATE" };
  }

  const estimatedDate = parseOptionalDate(draft.estimatedCompletionDate);
  if (estimatedDate === undefined) {
    return { success: false, error: "Estimated completion date is invalid.", code: "INVALID_STATE" };
  }

  try {
    const contractRows = await sql`
      SELECT
        c.id,
        c.status,
        c.job_id,
        j.client_id,
        j.worker_id
      FROM contracts c
      JOIN jobs j ON c.job_id = j.id
      WHERE c.id = ${contractId}
      LIMIT 1
    `;

    if (contractRows.length === 0) {
      return { success: false, error: "Contract not found", code: "NOT_FOUND" };
    }

    const contract = contractRows[0];
    if (contract.client_id !== session.user.id) {
      return { success: false, error: "You don't have permission to edit this draft.", code: "FORBIDDEN" };
    }

    if ((contract.status || "DRAFT") !== "DRAFT") {
      return { success: false, error: "Only draft contracts can be edited.", code: "INVALID_STATE" };
    }

    const updatedRows = await sql`
      UPDATE contracts
      SET
        job_title = ${optionalText(draft.jobTitle)},
        job_description = ${optionalText(draft.jobDescription)},
        work_location = ${optionalText(draft.workLocation)},
        payment_amount = ${paymentAmount},
        estimated_completion_date = ${estimatedDate},
        materials_responsibility = ${optionalText(draft.materialsResponsibility)},
        additional_notes = ${optionalText(draft.additionalNotes)},
        terms_status = 'submitted',
        terms_submitted_at = NOW(),
        terms_submitted_by = ${session.user.id},
        terms_rejected_at = NULL,
        terms_rejected_by = NULL,
        terms_rejection_reason = NULL,
        updated_at = NOW()
      WHERE id = ${contractId}
        AND status = 'DRAFT'
      RETURNING *
    `;

    if (updatedRows.length === 0) {
      return { success: false, error: "Draft could not be saved because its status changed.", code: "INVALID_STATE" };
    }

    await logAuditAction(session.user.id, "contract_draft_saved", {
      contractId,
      jobId: contract.job_id,
    });

    if (contract.worker_id) {
      await createNotification({
        userId: contract.worker_id,
        type: "contract_terms_submitted",
        title: "Contract Terms Submitted",
        body: "The client submitted contract terms for your review.",
        linkHref: `/contracts/${contractId}`,
      });
    }

    revalidatePath(`/contracts/${contractId}`);
    revalidatePath("/client/contracts");
    revalidatePath("/worker/contracts");

    return { success: true, contract: updatedRows[0] };
  } catch (error) {
    console.error("[SAVE_CONTRACT_DRAFT_ERROR]", error);
    return { success: false, error: "Failed to save contract draft", code: "UNKNOWN" };
  }
}

export async function acceptContractTerms(contractId: string): Promise<ContractActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  if (session.user.role !== "worker") {
    return { success: false, error: "Only the assigned worker can accept contract terms.", code: "FORBIDDEN" };
  }

  const setup = await ensureContractSetupComplete();
  if (!setup.completed) {
    return {
      success: false,
      error: setup.error || "Complete Contract Setup before accepting contract terms.",
      code: "CONTRACT_SETUP_REQUIRED",
    };
  }

  try {
    const rows = await sql`
      SELECT c.id, c.job_id, c.status, c.terms_status, j.client_id, j.worker_id, j.title
      FROM contracts c
      JOIN jobs j ON c.job_id = j.id
      WHERE c.id = ${contractId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return { success: false, error: "Contract not found", code: "NOT_FOUND" };
    }

    const contract = rows[0];
    if (contract.worker_id !== session.user.id) {
      return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
    }

    if (contract.status !== "DRAFT" || contract.terms_status !== "submitted") {
      return { success: false, error: "There are no submitted terms ready for acceptance.", code: "INVALID_STATE" };
    }

    const updatedRows = await sql`
      UPDATE contracts
      SET
        terms_status = 'accepted',
        terms_accepted_at = NOW(),
        terms_accepted_by = ${session.user.id},
        terms_rejected_at = NULL,
        terms_rejected_by = NULL,
        terms_rejection_reason = NULL,
        updated_at = NOW()
      WHERE id = ${contractId}
        AND status = 'DRAFT'
        AND terms_status = 'submitted'
      RETURNING *
    `;

    if (updatedRows.length === 0) {
      return { success: false, error: "Terms could not be accepted because the contract changed.", code: "INVALID_STATE" };
    }

    await logAuditAction(session.user.id, "contract_terms_accepted", {
      contractId,
      jobId: contract.job_id,
    });

    await createNotification({
      userId: contract.client_id,
      type: "contract_terms_accepted",
      title: "Contract Terms Accepted",
      body: `The worker accepted the terms for "${contract.title}". You can now finalize the contract.`,
      linkHref: `/contracts/${contractId}`,
    });

    revalidatePath(`/contracts/${contractId}`);
    revalidatePath("/client/contracts");
    revalidatePath("/worker/contracts");

    return { success: true, contract: updatedRows[0] };
  } catch (error) {
    console.error("[ACCEPT_CONTRACT_TERMS_ERROR]", error);
    return { success: false, error: "Failed to accept terms", code: "UNKNOWN" };
  }
}

export async function rejectContractTerms(contractId: string, reason?: string): Promise<ContractActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  if (session.user.role !== "worker") {
    return { success: false, error: "Only the assigned worker can reject contract terms.", code: "FORBIDDEN" };
  }

  const rejectionReason = typeof reason === "string" ? reason.trim().slice(0, 1000) : "";
  if (!rejectionReason) {
    return { success: false, error: "A rejection reason is required.", code: "INVALID_STATE" };
  }

  try {
    const rows = await sql`
      SELECT c.id, c.job_id, c.status, c.terms_status, j.client_id, j.worker_id, j.title
      FROM contracts c
      JOIN jobs j ON c.job_id = j.id
      WHERE c.id = ${contractId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return { success: false, error: "Contract not found", code: "NOT_FOUND" };
    }

    const contract = rows[0];
    if (contract.worker_id !== session.user.id) {
      return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
    }

    if (contract.status !== "DRAFT" || contract.terms_status !== "submitted") {
      return { success: false, error: "There are no submitted terms ready for rejection.", code: "INVALID_STATE" };
    }

    const updatedRows = await sql`
      UPDATE contracts
      SET
        terms_status = 'rejected',
        terms_rejected_at = NOW(),
        terms_rejected_by = ${session.user.id},
        terms_rejection_reason = ${rejectionReason},
        updated_at = NOW()
      WHERE id = ${contractId}
        AND status = 'DRAFT'
        AND terms_status = 'submitted'
      RETURNING *
    `;

    if (updatedRows.length === 0) {
      return { success: false, error: "Terms could not be rejected because the contract changed.", code: "INVALID_STATE" };
    }

    await logAuditAction(session.user.id, "contract_terms_rejected", {
      contractId,
      jobId: contract.job_id,
      reason: rejectionReason,
    });

    await createNotification({
      userId: contract.client_id,
      type: "contract_terms_rejected",
      title: "Contract Terms Rejected",
      body: rejectionReason,
      linkHref: `/contracts/${contractId}`,
    });

    revalidatePath(`/contracts/${contractId}`);
    revalidatePath("/client/contracts");
    revalidatePath("/worker/contracts");

    return { success: true, contract: updatedRows[0] };
  } catch (error) {
    console.error("[REJECT_CONTRACT_TERMS_ERROR]", error);
    return { success: false, error: "Failed to reject terms", code: "UNKNOWN" };
  }
}

export async function finalizeContractDraft(contractId: string): Promise<ContractActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  if (session.user.role !== "client") {
    return { success: false, error: "Only the client can finalize the contract draft.", code: "FORBIDDEN" };
  }

  const setup = await ensureContractSetupComplete();
  if (!setup.completed) {
    return {
      success: false,
      error: setup.error || "Complete Contract Setup before finalizing contract drafts.",
      code: "CONTRACT_SETUP_REQUIRED",
    };
  }

  try {
    const contractRows = await sql`
      SELECT
        c.*,
        j.client_id,
        j.worker_id,
        j.title as fallback_job_title,
        j.description as fallback_job_description,
        j.budget as fallback_payment_amount,
        cp.full_name as client_name,
        wp.full_name as worker_name
      FROM contracts c
      JOIN jobs j ON c.job_id = j.id
      LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      WHERE c.id = ${contractId}
      LIMIT 1
    `;

    if (contractRows.length === 0) {
      return { success: false, error: "Contract not found", code: "NOT_FOUND" };
    }

    const contract = contractRows[0];
    if (contract.client_id !== session.user.id) {
      return { success: false, error: "You don't have permission to finalize this draft.", code: "FORBIDDEN" };
    }

    if ((contract.status || "DRAFT") !== "DRAFT") {
      return { success: false, error: "Only draft contracts can be finalized.", code: "INVALID_STATE" };
    }

    if (contract.terms_status !== "accepted") {
      return { success: false, error: "The worker must accept the proposed terms before finalization.", code: "INVALID_STATE" };
    }

    const snapshot = {
      contractId,
      jobId: contract.job_id,
      clientId: contract.client_id,
      workerId: contract.worker_id,
      clientName: contract.client_name,
      workerName: contract.worker_name,
      jobTitle: contract.job_title || contract.fallback_job_title || "",
      jobDescription: contract.job_description || contract.fallback_job_description || "",
      workLocation: contract.work_location || "",
      paymentAmount: contract.payment_amount ?? contract.fallback_payment_amount ?? null,
      estimatedCompletionDate: contract.estimated_completion_date,
      materialsResponsibility: contract.materials_responsibility || "",
      additionalNotes: contract.additional_notes || "",
      finalizedAt: new Date().toISOString(),
    };

    if (!snapshot.jobTitle || !snapshot.jobDescription || snapshot.paymentAmount === null) {
      return {
        success: false,
        error: "Job title, job description, and payment amount are required before finalizing.",
        code: "INVALID_STATE",
      };
    }

    const updatedRows = await sql`
      UPDATE contracts
      SET
        status = 'READY_FOR_SIGNATURE',
        finalized_at = NOW(),
        finalized_by = ${session.user.id},
        finalized_snapshot = ${JSON.stringify(snapshot)},
        updated_at = NOW()
      WHERE id = ${contractId}
        AND status = 'DRAFT'
      RETURNING *
    `;

    if (updatedRows.length === 0) {
      return { success: false, error: "Draft could not be finalized because its status changed.", code: "INVALID_STATE" };
    }

    await logAuditAction(session.user.id, "contract_draft_finalized", {
      contractId,
      jobId: contract.job_id,
    });

    revalidatePath(`/contracts/${contractId}`);
    revalidatePath("/client/contracts");
    revalidatePath("/worker/contracts");

    return { success: true, contract: updatedRows[0] };
  } catch (error) {
    console.error("[FINALIZE_CONTRACT_DRAFT_ERROR]", error);
    return { success: false, error: "Failed to finalize contract draft", code: "UNKNOWN" };
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
          c.status as contract_status,
          c.created_at as contract_created_at,
          j.id as job_id,
          COALESCE(c.job_title, j.title) as job_title,
          j.status as job_status,
          COALESCE(c.payment_amount, j.budget) as budget,
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
          c.status as contract_status,
          c.created_at as contract_created_at,
          j.id as job_id,
          COALESCE(c.job_title, j.title) as job_title,
          j.status as job_status,
          COALESCE(c.payment_amount, j.budget) as budget,
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
        COALESCE(c.job_title, j.title) as job_title,
        COALESCE(c.job_description, j.description) as job_description,
        j.status as job_status,
        COALESCE(c.payment_amount, j.budget) as budget,
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
    const contractStatus = contract.status || "DRAFT";

    return {
      ...contract,
      user_role: isClient ? "client" : isWorker ? "worker" : "admin",
      user_has_signed: isClient ? clientSigned : isWorker ? workerSigned : false,
      signature_status: contractStatus,
    };
  } catch (error) {
    console.error("[GET_CONTRACT_FOR_SIGNING_ERROR]", error);
    return null;
  }
}

export async function signContractAsClient(contractId: string, pin?: string, consentConfirmed = false): Promise<ContractActionResult> {
  return signContractForRole(contractId, "client", pin, consentConfirmed);
}

export async function signContractAsWorker(contractId: string, pin?: string, consentConfirmed = false): Promise<ContractActionResult> {
  return signContractForRole(contractId, "worker", pin, consentConfirmed);
}

export async function signContract(contractId: string, pin?: string, consentConfirmed = false): Promise<ContractActionResult> {
  const session = await auth();

  if (session?.user?.role === "client") {
    return signContractAsClient(contractId, pin, consentConfirmed);
  }

  if (session?.user?.role === "worker") {
    return signContractAsWorker(contractId, pin, consentConfirmed);
  }

  return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
}

async function signContractForRole(
  contractId: string,
  role: "client" | "worker",
  pin?: string,
  consentConfirmed = false
): Promise<ContractActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please login to continue", code: "UNAUTHORIZED" };
  }

  if (session.user.role !== role) {
    return { success: false, error: "You don't have permission", code: "FORBIDDEN" };
  }

  const setup = await ensureContractSetupComplete();
  if (!setup.completed) {
    return {
      success: false,
      error: setup.error || "Complete Contract Setup before signing contracts.",
      code: "CONTRACT_SETUP_REQUIRED",
    };
  }

  if (!pin) {
    return { success: false, error: "Contract PIN is required", code: "FORBIDDEN" };
  }

  if (!consentConfirmed) {
    return { success: false, error: "You must confirm all signing consent statements before signing.", code: "INVALID_STATE" };
  }

  const pinResult = await verifyContractPin(pin);
  if (!pinResult.success) {
    return {
      success: false,
      error: pinResult.error,
      code: pinResult.code === "SETUP_REQUIRED" ? "CONTRACT_SETUP_REQUIRED" : "FORBIDDEN",
    };
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

    const allowedSigningStatuses = isClient
      ? ["READY_FOR_SIGNATURE", "WORKER_SIGNED"]
      : ["READY_FOR_SIGNATURE", "CLIENT_SIGNED"];

    if (!allowedSigningStatuses.includes(contract.status || "DRAFT")) {
      return {
        success: false,
        error: "This contract must be finalized before it can be signed.",
        code: "INVALID_STATE",
      };
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

    await sql`
      INSERT INTO contract_signatures (contract_id, user_id, role, consent_confirmed, signed_at)
      VALUES (${contractId}, ${session.user.id}, ${role}, ${consentConfirmed}, NOW())
    `;

    const updatedRows = isClient
      ? await sql`
          UPDATE contracts
          SET
            client_signed_at = NOW(),
            status = 'CLIENT_SIGNED'
          WHERE id = ${contractId}
            AND client_signed_at IS NULL
          RETURNING *
        `
      : await sql`
          UPDATE contracts
          SET
            worker_signed_at = NOW(),
            status = 'WORKER_SIGNED'
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
        SET
          signed_at = COALESCE(signed_at, NOW()),
          status = 'FULLY_SIGNED'
        WHERE id = ${contractId}
        RETURNING *
      `;
      updatedContract = signedRows[0] ?? updatedContract;

      updatedContract = await activateContractAfterFullSignature(contractId);

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
