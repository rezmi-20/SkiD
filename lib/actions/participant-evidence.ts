"use server";

import crypto from "node:crypto";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { generateEvidencePdfBuffer, type EvidenceDossierManifest } from "@/lib/evidence-pdf-generator";
import { recordAuditEvent } from "@/lib/audit-ledger";
import { maskFinLast4 } from "@/lib/fin-protection";

export interface ParticipantEvidenceResult {
  success: boolean;
  error?: string;
  downloadUrl?: string;
  evidenceHash?: string;
}

export async function requestParticipantEvidencePackage(
  contractId: string,
  purpose: string = "Personal Legal & Arbitration Records"
): Promise<ParticipantEvidenceResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Please log in to export your legal evidence." };
  }

  const userId = session.user.id;
  const userRole = session.user.role;

  // 1. Verify that the requesting user is an authorized participant (Client or Worker) of this contract
  const contractRows = await sql`
    SELECT 
      c.id AS "contractId",
      c.job_id AS "jobId",
      c.client_id AS "clientId",
      c.worker_id AS "workerId",
      c.status AS "contractStatus",
      c.terms,
      c.payment_amount AS "paymentAmount",
      c.work_location AS "workLocation",
      c.document_hash AS "documentHash",
      c.client_signed_at AS "clientSignedAt",
      c.worker_signed_at AS "workerSignedAt",
      c.signed_at AS "signedAt",
      c.activated_at AS "activatedAt",
      c.created_at AS "contractCreatedAt",
      j.title AS "jobTitle",
      j.description AS "jobDescription"
    FROM contracts c
    JOIN jobs j ON j.id = c.job_id
    WHERE c.id = ${contractId}
    LIMIT 1
  `;

  if (contractRows.length === 0) {
    return { success: false, error: "Contract record not found." };
  }

  const contract = contractRows[0];
  const isClient = contract.clientId === userId;
  const isWorker = contract.workerId === userId;

  if (!isClient && !isWorker) {
    // Record unauthorized export attempt
    await recordAuditEvent({
      actorType: "user",
      userId,
      action: "unauthorized_evidence_access_attempt",
      module: "legal_compliance",
      targetType: "contract",
      targetId: contractId,
      highRisk: true,
      reason: "User attempted to export evidence for a contract they do not participate in",
    });

    return { success: false, error: "Access denied. You can only export evidence for your own contracts." };
  }

  // 2. Fetch Client Info (Safely Redacted)
  const clientRows = await sql`
    SELECT 
      u.id,
      u.full_name AS "fullName",
      u.email,
      u.phone,
      u.is_verified AS "isVerified",
      cp.verification_status AS "verificationStatus",
      cp.verification_provider AS "verificationProvider",
      cp.fin_last4 AS "finLast4"
    FROM users u
    LEFT JOIN client_profiles cp ON cp.user_id = u.id
    WHERE u.id = ${contract.clientId}
    LIMIT 1
  `;

  // 3. Fetch Worker Info (Safely Redacted)
  const workerRows = await sql`
    SELECT 
      u.id,
      u.full_name AS "fullName",
      u.email,
      u.phone,
      u.is_verified AS "isVerified",
      wp.skills,
      wp.district,
      wp.hourly_rate AS "hourlyRate",
      wp.verification_status AS "verificationStatus",
      wp.verification_provider AS "verificationProvider",
      wp.fin_last4 AS "finLast4"
    FROM users u
    LEFT JOIN worker_profiles wp ON wp.user_id = u.id
    WHERE u.id = ${contract.workerId}
    LIMIT 1
  `;

  const clientData = clientRows[0] || {};
  const workerData = workerRows[0] || {};

  // Redact FINs based on who is asking
  const safeClientFin = isClient ? maskFinLast4(clientData.finLast4) : maskFinLast4(clientData.finLast4);
  const safeWorkerFin = isWorker ? maskFinLast4(workerData.finLast4) : maskFinLast4(workerData.finLast4);

  // 4. Fetch Worker Certificates
  const certificateRows = await sql`
    SELECT id, file_name AS "fileName", mime_type AS "mimeType", file_size AS "fileSize", created_at AS "createdAt"
    FROM worker_documents
    WHERE worker_profile_id = ${contract.workerId}
    ORDER BY created_at DESC
  `;

  // 5. Fetch Conversational Chat (Filtered from system messages)
  const conversationRows = await sql`
    SELECT id 
    FROM conversations 
    WHERE (client_id = ${contract.clientId} AND worker_id = ${contract.workerId})
       OR (client_id = ${contract.workerId} AND worker_id = ${contract.clientId})
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
        AND (m.is_system IS FALSE OR m.is_system IS NULL)
      ORDER BY m.created_at ASC
    `;

    chatTranscript = (messageRows || []).map((m: any) => {
      const isMsgClient = m.senderId === contract.clientId;
      return {
        id: m.id,
        senderId: m.senderId,
        senderRole: isMsgClient ? "CLIENT" : "WORKER",
        senderName: isMsgClient ? (clientData?.fullName || "Client") : (workerData?.fullName || "Worker"),
        body: m.body,
        imageUrl: m.imageUrl,
        createdAt: new Date(m.createdAt).toISOString(),
      };
    });
  }

  // 6. Fetch System-Generated Audit Events (Pure timeline)
  const auditRows = await sql`
    SELECT 
      action,
      module,
      actor_type AS "actorType",
      details,
      created_at AS "createdAt"
    FROM audit_logs
    WHERE (target_id = ${contractId} OR target_id = ${contract.jobId})
    ORDER BY created_at ASC
  `;

  const systemTimeline: Array<{
    timestamp: string;
    actor: string;
    actorRole: string;
    eventType: string;
    title: string;
    description: string;
    recordId?: string;
    verified: boolean;
  }> = [];

  if (contract.contractCreatedAt) {
    systemTimeline.push({
      timestamp: new Date(contract.contractCreatedAt).toISOString(),
      actor: "Client",
      actorRole: "CLIENT",
      eventType: "contract_created",
      title: "Contract Agreement Initiated",
      description: `Contract initiated for job "${contract.jobTitle || "Skilled Labor"}" with agreed consideration ${contract.paymentAmount || 0} ETB`,
      verified: true,
    });
  }
  if (contract.clientSignedAt) {
    systemTimeline.push({
      timestamp: new Date(contract.clientSignedAt).toISOString(),
      actor: "Client",
      actorRole: "CLIENT",
      eventType: "contract_signed_client",
      title: "Client Electronic Signature & PIN Verification",
      description: "Client submitted digital PIN signature and agreed to contract terms",
      verified: true,
    });
  }
  if (contract.workerSignedAt) {
    systemTimeline.push({
      timestamp: new Date(contract.workerSignedAt).toISOString(),
      actor: "Worker",
      actorRole: "WORKER",
      eventType: "contract_signed_worker",
      title: "Worker Electronic Signature & PIN Verification",
      description: "Worker submitted digital PIN signature and accepted contractual terms",
      verified: true,
    });
  }
  if (contract.activatedAt) {
    systemTimeline.push({
      timestamp: new Date(contract.activatedAt).toISOString(),
      actor: "System",
      actorRole: "SYSTEM",
      eventType: "contract_activated",
      title: "Contract Fully Executed & Activated",
      description: "Both parties executed agreement; contract transitioned to ACTIVE status",
      verified: true,
    });
  }

  for (const row of auditRows || []) {
    // Exclude internal admin misconduct / administrative reviews
    if (row.module === "governance" && row.details?.isInternal) continue;

    systemTimeline.push({
      timestamp: new Date(row.createdAt).toISOString(),
      actor: row.actorType || "System",
      actorRole: String(row.actorType || "SYSTEM").toUpperCase(),
      eventType: row.action,
      title: String(row.action).replaceAll("_", " ").toUpperCase(),
      description: (row.details?.reason as string) || (row.details?.description as string) || `System audit event: ${row.action}`,
      verified: true,
    });
  }

  systemTimeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // 7. Fetch Payments (Chapa Gateway Records)
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
    WHERE job_id = ${contract.jobId}
    ORDER BY created_at ASC
  `;

  // 8. Fetch Disputes & Claims
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
    WHERE d.contract_id = ${contractId} OR d.job_id = ${contract.jobId}
    ORDER BY d.created_at ASC
  `;

  // 9. Build Case Reference & Manifest
  const caseNumber = `PARTICIPANT-${contractId.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const manifest: EvidenceDossierManifest = {
    metadata: {
      generatedAt: new Date().toISOString(),
      caseNumber,
      courtName: "Dire Dawa Administration Statutory & Arbitral Registry",
      purpose: purpose || "Participant Legal Evidence Package",
      requestedBy: {
        userId,
        name: isClient ? clientData.fullName : workerData.fullName,
        role: userRole,
      },
      proclamationReference: "Ethiopian Labour Proclamation No. 1156/2019 & Electronic Transactions Proclamation No. 1205/2020",
    },
    contract: {
      contractId: contract.contractId,
      jobId: contract.jobId,
      jobTitle: contract.jobTitle,
      jobDescription: contract.jobDescription,
      workLocation: contract.workLocation,
      paymentAmount: contract.paymentAmount,
      contractStatus: contract.contractStatus,
      terms: contract.terms,
      documentHash: contract.documentHash,
      clientSignedAt: contract.clientSignedAt,
      workerSignedAt: contract.workerSignedAt,
      signedAt: contract.signedAt,
      activatedAt: contract.activatedAt,
      contractCreatedAt: contract.contractCreatedAt,
    },
    client: {
      userId: clientData.id,
      email: clientData.email,
      phone: clientData.phone,
      fullName: clientData.fullName,
      verificationStatus: clientData.verificationStatus,
      verificationProvider: clientData.verificationProvider,
      finLast4: safeClientFin,
      isVerified: clientData.isVerified,
    },
    worker: {
      userId: workerData.id,
      email: workerData.email,
      phone: workerData.phone,
      fullName: workerData.fullName,
      skills: workerData.skills,
      district: workerData.district,
      verificationStatus: workerData.verificationStatus,
      verificationProvider: workerData.verificationProvider,
      finLast4: safeWorkerFin,
      isVerified: workerData.isVerified,
      hourlyRate: workerData.hourlyRate,
      certificates: certificateRows,
    },
    systemTimeline,
    chatTranscript,
    payments: paymentRows as any,
    disputes: disputeRows as any,
  };

  const manifestString = JSON.stringify(manifest);
  const evidenceHash = crypto.createHash("sha256").update(manifestString).digest("hex");

  // 10. Generate PDF Buffer
  let pdfBase64: string | null = null;
  try {
    const pdfBuffer = await generateEvidencePdfBuffer(manifest);
    pdfBase64 = pdfBuffer.toString("base64");
  } catch (pdfErr) {
    console.error("[PARTICIPANT_EVIDENCE_PDF_GEN_ERROR]", pdfErr);
  }

  // 11. Persist in court_evidence_records
  const [evidenceRecord] = await sql`
    INSERT INTO court_evidence_records (
      contract_id,
      case_number,
      court_name,
      purpose,
      evidence_hash,
      evidence_manifest,
      pdf_base64,
      requested_by_user_id,
      participant_role,
      status
    ) VALUES (
      ${contractId},
      ${caseNumber},
      ${manifest.metadata.courtName},
      ${manifest.metadata.purpose},
      ${evidenceHash},
      ${manifest},
      ${pdfBase64},
      ${userId},
      ${userRole},
      'participant_export'
    )
    RETURNING id
  `;

  // 12. Record append-only audit event
  await recordAuditEvent({
    actorType: "user",
    userId,
    action: "participant_evidence_exported",
    module: "legal_compliance",
    targetType: "contract",
    targetId: contractId,
    highRisk: false,
    reason: `Participant exported evidence package for case ${caseNumber}`,
    details: {
      disclosureId: evidenceRecord.id,
      caseNumber,
      contractId,
      evidenceHash,
      role: userRole,
      hasPdf: Boolean(pdfBase64),
    },
  });

  return {
    success: true,
    downloadUrl: `/api/contracts/${contractId}/evidence/pdf?recordId=${evidenceRecord.id}`,
    evidenceHash,
  };
}
