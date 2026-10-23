"use server";

import { createHash } from "node:crypto";
import { sql } from "@/lib/db";
import { requireAdminRole } from "@/lib/admin-authorization";
import { verifyBetterAuthPassword } from "@/lib/admin-credentials";

export interface EvidenceRequestInput {
  contractId: string;
  caseNumber: string;
  courtName: string;
  purpose: string;
  adminPassword: string;
}

export async function searchContractsForEvidence(query: string) {
  const admin = await requireAdminRole("super_admin");

  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const rows = await sql`
    SELECT 
      c.id AS "contractId",
      c.status AS "contractStatus",
      c.payment_amount AS "paymentAmount",
      c.signed_at AS "signedAt",
      c.created_at AS "createdAt",
      j.id AS "jobId",
      j.title AS "jobTitle",
      j.location AS "jobLocation",
      j.status AS "jobStatus",
      COALESCE(clp.full_name, cu.email) AS "clientName",
      cu.phone AS "clientPhone",
      cu.email AS "clientEmail",
      COALESCE(wp.full_name, wu.email) AS "workerName",
      wu.phone AS "workerPhone",
      wu.email AS "workerEmail"
    FROM contracts c
    JOIN jobs j ON c.job_id = j.id
    JOIN users cu ON j.client_id = cu.id
    LEFT JOIN users wu ON j.worker_id = wu.id
    LEFT JOIN client_profiles clp ON cu.id = clp.user_id
    LEFT JOIN worker_profiles wp ON wu.id = wp.user_id
    WHERE 
      c.id::text ILIKE ${`%${cleanQuery}%`}
      OR j.id::text ILIKE ${`%${cleanQuery}%`}
      OR j.title ILIKE ${`%${cleanQuery}%`}
      OR clp.full_name ILIKE ${`%${cleanQuery}%`}
      OR wp.full_name ILIKE ${`%${cleanQuery}%`}
      OR cu.phone ILIKE ${`%${cleanQuery}%`}
      OR wu.phone ILIKE ${`%${cleanQuery}%`}
    ORDER BY c.created_at DESC
    LIMIT 15
  `;

  return rows || [];
}

export async function generateCourtEvidenceDossier(input: EvidenceRequestInput) {
  // 1. Strictly enforce super_admin role
  const admin = await requireAdminRole("super_admin");

  const contractId = input.contractId.trim();
  const caseNumber = input.caseNumber.trim();
  const courtName = input.courtName.trim();
  const purpose = input.purpose.trim();
  const password = input.adminPassword;

  if (!contractId || !caseNumber || !courtName || !password) {
    return { success: false, error: "Contract ID, Court Case Number, Court Name, and Master Password are required." };
  }

  // 2. Cryptographic Zero-Trust Password Re-Verification against admin_employees
  const [employee] = await sql`
    SELECT id, password_hash, admin_employee_id, full_name, work_email
    FROM admin_employees
    WHERE id = ${admin.id}
  `;

  if (!employee) {
    return { success: false, error: "Administrator employee record not found." };
  }

  const isPasswordValid = await verifyBetterAuthPassword(employee.password_hash, password);
  if (!isPasswordValid) {
    return { success: false, error: "Invalid master administrator password. Evidence disclosure requires correct credential verification." };
  }

  // 3. Fetch Contract & Job Records
  const [contractData] = await sql`
    SELECT 
      c.id AS "contractId",
      c.job_id AS "jobId",
      c.status AS "contractStatus",
      c.terms,
      c.payment_amount AS "paymentAmount",
      c.job_title AS "jobTitle",
      c.job_description AS "jobDescription",
      c.work_location AS "workLocation",
      c.document_hash AS "documentHash",
      c.client_signed_at AS "clientSignedAt",
      c.worker_signed_at AS "workerSignedAt",
      c.signed_at AS "signedAt",
      c.activated_at AS "activatedAt",
      c.created_at AS "contractCreatedAt",
      c.finalized_snapshot AS "finalizedSnapshot",
      j.title AS "originalJobTitle",
      j.description AS "originalJobDescription",
      j.budget AS "jobBudget",
      j.status AS "jobStatus",
      j.location AS "jobLocation",
      j.requested_date AS "jobRequestedDate",
      j.created_at AS "jobCreatedAt",
      j.client_id AS "clientId",
      j.worker_id AS "workerId"
    FROM contracts c
    JOIN jobs j ON c.job_id = j.id
    WHERE c.id = ${contractId}
  `;

  if (!contractData) {
    return { success: false, error: "Contract record not found." };
  }

  // 4. Fetch Client Compliance Details
  const [clientData] = await sql`
    SELECT 
      u.id AS "userId",
      u.email,
      u.phone,
      clp.full_name AS "fullName",
      clp.verification_status AS "verificationStatus",
      clp.verification_provider AS "verificationProvider",
      clp.fin_last4 AS "finLast4",
      clp.is_verified AS "isVerified",
      clp.verified_at AS "verifiedAt"
    FROM users u
    LEFT JOIN client_profiles clp ON u.id = clp.user_id
    WHERE u.id = ${contractData.clientId}
  `;

  // 5. Fetch Worker Compliance Details
  const [workerData] = await sql`
    SELECT 
      u.id AS "userId",
      u.email,
      u.phone,
      wp.full_name AS "fullName",
      wp.skills,
      wp.district,
      wp.verification_status AS "verificationStatus",
      wp.verification_provider AS "verificationProvider",
      wp.fin_last4 AS "finLast4",
      wp.is_verified AS "isVerified",
      wp.verified_at AS "verifiedAt",
      wp.hourly_rate AS "hourlyRate",
      wp.chapa_subaccount_id AS "chapaSubaccount"
    FROM users u
    LEFT JOIN worker_profiles wp ON u.id = wp.user_id
    WHERE u.id = ${contractData.workerId}
  `;

  // 6. Fetch Worker Training Certificates
  const certificateRows = await sql`
    SELECT id, file_name, mime_type, file_size, created_at
    FROM worker_training_certificates
    WHERE worker_user_id = ${contractData.workerId}
    ORDER BY created_at ASC
  `;

  // 7. Fetch Full Chat History / Messaging Logs between Client and Worker
  const conversationRows = await sql`
    SELECT id 
    FROM conversations 
    WHERE (client_id = ${contractData.clientId} AND worker_id = ${contractData.workerId})
       OR (client_id = ${contractData.workerId} AND worker_id = ${contractData.clientId})
    LIMIT 1
  `;

  let chatTranscript: Array<{
    id: string;
    senderId: string;
    senderRole: string;
    senderName: string;
    body: string;
    imageUrl?: string | null;
    createdAt: string;
  }> = [];

  if (conversationRows.length > 0) {
    const messageRows = await sql`
      SELECT 
        m.id,
        m.sender_id AS "senderId",
        m.body,
        m.image_url AS "imageUrl",
        m.created_at AS "createdAt"
      FROM messages m
      WHERE m.conversation_id = ${conversationRows[0].id}
      ORDER BY m.created_at ASC
    `;

    chatTranscript = (messageRows || []).map((m: any) => {
      const isClient = m.senderId === contractData.clientId;
      return {
        id: m.id,
        senderId: m.senderId,
        senderRole: isClient ? "CLIENT" : "WORKER",
        senderName: isClient ? (clientData?.fullName || "Client") : (workerData?.fullName || "Worker"),
        body: m.body,
        imageUrl: m.imageUrl,
        createdAt: new Date(m.createdAt).toISOString(),
      };
    });
  }

  // 8. Fetch Payment & Escrow History
  const paymentRows = await sql`
    SELECT 
      id,
      amount,
      commission_amount AS "commissionAmount",
      net_amount AS "netAmount",
      status,
      chapa_ref AS "chapaRef",
      chapa_reference AS "chapaReference",
      financial_hold_status AS "financialHoldStatus",
      hold_reason AS "holdReason",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM payments
    WHERE job_id = ${contractData.jobId}
    ORDER BY created_at ASC
  `;

  // 9. Fetch Dispute & Mediation Records (if any)
  const disputeRows = await sql`
    SELECT 
      d.id,
      d.status,
      d.title,
      d.category,
      d.category AS "claimType",
      d.description AS reason,
      d.requested_resolution AS "requestedResolution",
      d.final_decision AS "finalDecision",
      d.final_reason AS "finalReason",
      d.resolution_notes AS "resolutionNotes",
      d.created_at AS "createdAt",
      d.resolved_at AS "resolvedAt"
    FROM disputes d
    WHERE d.contract_id = ${contractId} OR d.job_id = ${contractData.jobId}
    ORDER BY d.created_at ASC
  `;

  // 10. Assemble the Evidentiary Package Manifest
  const manifest = {
    metadata: {
      generatedAt: new Date().toISOString(),
      caseNumber,
      courtName,
      purpose,
      authorizedBy: {
        adminId: employee.id,
        employeeCode: employee.admin_employee_id,
        name: employee.full_name,
        email: employee.work_email,
      },
      proclamationReference: "Ethiopian Labour Proclamation No. 1156/2019 & Electronic Signature Legal Framework",
    },
    contract: {
      ...contractData,
      termsSnapshot: contractData.terms,
    },
    client: clientData,
    worker: {
      ...workerData,
      certificates: certificateRows,
    },
    chatTranscript,
    payments: paymentRows,
    disputes: disputeRows,
  };

  // 11. Compute Cryptographic SHA-256 Hash of the Complete Manifest
  const manifestString = JSON.stringify(manifest);
  const evidenceHash = createHash("sha256").update(manifestString).digest("hex");

  // 12. Persist Evidence Disclosure Record in court_evidence_records
  const [evidenceRecord] = await sql`
    INSERT INTO court_evidence_records (
      contract_id,
      case_number,
      court_name,
      purpose,
      authorized_by_admin_id,
      evidence_hash,
      evidence_manifest
    ) VALUES (
      ${contractId},
      ${caseNumber},
      ${courtName},
      ${purpose},
      ${employee.id},
      ${evidenceHash},
      ${manifest}
    )
    RETURNING id, created_at
  `;

  // 13. Audit Log with high_risk = true
  await sql`
    INSERT INTO audit_logs (
      admin_employee_id,
      actor_type,
      admin_role,
      action,
      module,
      target_type,
      target_id,
      high_risk,
      reason,
      details
    ) VALUES (
      ${employee.id},
      'admin_employee',
      ${admin.role},
      'court_evidence_disclosure',
      'legal_compliance',
      'contract',
      ${contractId},
      true,
      ${`${courtName} - Case ${caseNumber}`},
      ${JSON.stringify({
        disclosureId: evidenceRecord.id,
        caseNumber,
        courtName,
        purpose,
        evidenceHash,
        transcriptCount: chatTranscript.length,
        timestamp: new Date().toISOString(),
      })}
    )
  `;

  return {
    success: true,
    dossier: {
      disclosureId: evidenceRecord.id,
      createdAt: evidenceRecord.created_at,
      evidenceHash,
      manifest,
    },
  };
}
