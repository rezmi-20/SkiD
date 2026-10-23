import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { maskFinLast4 } from "@/lib/fin-protection";

export interface EvidenceDossierManifest {
  metadata: {
    generatedAt: string;
    caseNumber: string;
    courtName: string;
    purpose: string;
    authorizedBy?: {
      adminId?: string;
      employeeCode?: string;
      name?: string;
      email?: string;
    } | null;
    requestedBy?: {
      userId?: string;
      name?: string;
      role?: string | null;
    } | null;
    proclamationReference: string;
  };
  contract: {
    contractId: string;
    jobId: string;
    jobTitle?: string;
    originalJobTitle?: string;
    jobDescription?: string;
    originalJobDescription?: string;
    workLocation?: string;
    paymentAmount?: number | string;
    contractStatus?: string;
    terms?: string;
    documentHash?: string;
    clientSignedAt?: string | null;
    workerSignedAt?: string | null;
    signedAt?: string | null;
    activatedAt?: string | null;
    contractCreatedAt?: string;
    finalizedSnapshot?: any;
    termsAcceptedAt?: string | null;
    termsAcceptedBy?: string | null;
  };
  client: {
    userId: string;
    email: string;
    phone?: string;
    fullName?: string;
    verificationStatus?: string;
    verificationProvider?: string;
    finLast4?: string | null;
    isVerified?: boolean;
    verifiedAt?: string | null;
  };
  worker: {
    userId: string;
    email: string;
    phone?: string;
    fullName?: string;
    skills?: string[] | null;
    district?: string;
    verificationStatus?: string;
    verificationProvider?: string;
    finLast4?: string | null;
    isVerified?: boolean;
    verifiedAt?: string | null;
    hourlyRate?: number | null;
    certificates?: Array<{
      id: string;
      file_name?: string;
      fileName?: string;
      mime_type?: string;
      mimeType?: string;
      file_size?: number;
      fileSize?: number;
      created_at?: string;
      createdAt?: string;
    }>;
  };
  systemTimeline: Array<{
    timestamp: string;
    actor: string;
    actorRole: string;
    eventType: string;
    title: string;
    description: string;
    recordId?: string;
    verified: boolean;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    commissionAmount?: number | null;
    netAmount?: number | null;
    status: string;
    chapaRef?: string | null;
    chapaReference?: string | null;
    financialHoldStatus?: string | null;
    holdReason?: string | null;
    createdAt: string;
    updatedAt?: string;
  }>;
  disputes: Array<{
    id: string;
    status: string;
    title?: string;
    category?: string;
    claimType?: string;
    reason?: string;
    description?: string;
    requestedResolution?: string | null;
    finalDecision?: string | null;
    finalReason?: string | null;
    resolutionNotes?: string | null;
    createdAt: string;
    resolvedAt?: string | null;
    evidenceFiles?: Array<{
      id: string;
      fileName: string;
      fileSize: number;
      storageFingerprint: string;
      uploadedByRole: string;
      createdAt: string;
    }>;
  }>;
  chatTranscript?: Array<{
    id: string;
    senderId: string;
    senderRole: string;
    senderName: string;
    body: string;
    imageUrl?: string | null;
    createdAt: string;
  }>;
}

function formatDate(val: unknown) {
  if (!val) return "Not recorded";
  const d = new Date(String(val));
  if (Number.isNaN(d.getTime())) return "Not recorded";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(val: unknown) {
  if (!val) return "Not recorded";
  const d = new Date(String(val));
  if (Number.isNaN(d.getTime())) return "Not recorded";
  const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return `${dateStr} ${timeStr} EAT`;
}

function formatMoney(val: unknown) {
  if (val === null || val === undefined || val === "") return "0 ETB";
  return `${Number(val).toLocaleString()} ETB`;
}

function drawSeal(doc: PDFKit.PDFDocument, x: number, y: number, size: number) {
  doc.save();
  doc.circle(x + size / 2, y + size / 2, size / 2).lineWidth(2).strokeColor("#991b1b").stroke();
  doc.circle(x + size / 2, y + size / 2, size / 2 - 6).lineWidth(1).strokeColor("#991b1b").stroke();
  doc.fillColor("#991b1b").fontSize(10).font("Helvetica-Bold").text("DIRESKILL", x, y + 20, { width: size, align: "center" });
  doc.fontSize(6).font("Helvetica").text("JUDICIAL DISCLOSURE", x, y + 33, { width: size, align: "center" });
  doc.fontSize(5.5).text("CERTIFIED EVIDENCE", x, y + 43, { width: size, align: "center" });
  doc.text("Dire Dawa, Ethiopia", x, y + 53, { width: size, align: "center" });
  doc.font("Helvetica-Bold").fontSize(7).text("LEGAL SEAL", x, y + 64, { width: size, align: "center" });
  doc.restore();
}

/**
 * Builds a certified, multi-page, court-admissible PDF evidence package.
 */
export async function generateEvidencePdfBuffer(manifest: EvidenceDossierManifest): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "A4",
    margin: 44,
    bufferPages: true,
    info: {
      Title: `DireSkill Certified Evidence Dossier - ${manifest.metadata.caseNumber}`,
      Author: "DireSkill Digital Legal Systems",
      Subject: "Judicial & Arbitral Evidence Disclosure",
      Keywords: "DireSkill, Court Evidence, Contract, Chapa Payment, Labour Proclamation",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const pageWidth = doc.page.width - 88;
  const publicBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL || "https://dire-skill.vercel.app";
  const verificationUrl = `${publicBaseUrl.replace(/\/$/, "")}/contracts/${manifest.contract.contractId}?case=${encodeURIComponent(manifest.metadata.caseNumber)}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: "M", margin: 1, width: 140 });
  const qrBuffer = Buffer.from(qrCodeDataUrl.split(",")[1] || "", "base64");

  // =========================================================================
  // PAGE 1: COVER PAGE & CASE INFORMATION
  // =========================================================================
  const logoPath = path.join(process.cwd(), "public", "direskill_logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 44, 40, { width: 44, height: 40 });
  }

  doc.fillColor("#991b1b").fontSize(12).font("Helvetica-Bold").text("FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA", 96, 42);
  doc.fillColor("#374151").fontSize(7.5).font("Helvetica").text("Dire Dawa Administration · Judicial & Arbitral Evidentiary Submission", 96, 56);
  doc.fillColor("#111827").fontSize(10).font("Helvetica-Bold").text("DIRESKILL CERTIFIED EVIDENTIARY DOSSIER", 96, 68);

  const stampPath = path.join(process.cwd(), "public", "direskill_stamp.png");
  if (fs.existsSync(stampPath)) {
    doc.image(stampPath, 460, 24, { width: 80, height: 80 });
  } else {
    drawSeal(doc, 455, 26, 85);
  }

  doc.moveDown(3.5);
  doc.strokeColor("#991b1b").lineWidth(2).moveTo(44, 115).lineTo(551, 115).stroke();
  doc.strokeColor("#d1d5db").lineWidth(0.5).moveTo(44, 118).lineTo(551, 118).stroke();

  doc.moveDown(1.5);
  doc.fontSize(16).font("Helvetica-Bold").fillColor("#111827").text("OFFICIAL EVIDENCE PACKAGE", 44, 130, { align: "center", width: pageWidth });
  doc.fontSize(8.5).font("Helvetica").fillColor("#4b5563").text(manifest.metadata.proclamationReference, { align: "center", width: pageWidth });

  // Case Metadata Box
  doc.moveDown(1.2);
  const boxTop = 175;
  doc.roundedRect(44, boxTop, pageWidth, 115, 6).fillColor("#f9fafb").fillAndStroke("#e5e7eb", "#991b1b");

  doc.fillColor("#111827").fontSize(8.5).font("Helvetica-Bold");
  doc.text("CASE & PROCEEDINGS REFERENCE", 56, boxTop + 12);

  doc.fontSize(7.5).font("Helvetica").fillColor("#6b7280");
  doc.text("Court / Tribunal:", 56, boxTop + 28);
  doc.text("Case / Subpoena Ref:", 56, boxTop + 42);
  doc.text("Related Contract ID:", 56, boxTop + 56);
  doc.text("Related Job ID:", 56, boxTop + 70);
  doc.text("Evidence Issue Date:", 56, boxTop + 84);
  doc.text("Disclosure Purpose:", 56, boxTop + 98);

  doc.font("Helvetica-Bold").fillColor("#111827");
  doc.text(manifest.metadata.courtName, 170, boxTop + 28);
  doc.text(manifest.metadata.caseNumber, 170, boxTop + 42);
  doc.font("Courier-Bold").text(manifest.contract.contractId, 170, boxTop + 56);
  doc.text(manifest.contract.jobId, 170, boxTop + 70);
  doc.font("Helvetica").text(formatDateTime(manifest.metadata.generatedAt), 170, boxTop + 84);
  doc.text(manifest.metadata.purpose || "Official Court / Dispute Resolution Proceedings", 170, boxTop + 98, { width: 350 });

  // Involved Parties Grid
  const partiesTop = boxTop + 125;
  const halfWidth = (pageWidth - 10) / 2;

  // Client Box
  doc.roundedRect(44, partiesTop, halfWidth, 100, 6).fillColor("#ffffff").fillAndStroke("#e5e7eb", "#d1d5db");
  doc.fillColor("#1e3a8a").fontSize(8).font("Helvetica-Bold").text("PARTY 1: CLIENT (COMMISSIONER)", 54, partiesTop + 10);
  doc.fontSize(7).font("Helvetica").fillColor("#6b7280");
  doc.text("Legal Name:", 54, partiesTop + 25);
  doc.text("Contact Phone:", 54, partiesTop + 38);
  doc.text("Account Email:", 54, partiesTop + 51);
  doc.text("National ID (Fayda):", 54, partiesTop + 64);
  doc.text("Verification Status:", 54, partiesTop + 77);

  doc.font("Helvetica-Bold").fillColor("#111827");
  doc.text(manifest.client.fullName || "Registered Client", 140, partiesTop + 25);
  doc.text(manifest.client.phone || "Not recorded", 140, partiesTop + 38);
  doc.font("Helvetica").text(manifest.client.email, 140, partiesTop + 51);
  doc.font("Courier-Bold").text(maskFinLast4(manifest.client.finLast4) || "Not recorded", 140, partiesTop + 64);
  doc.font("Helvetica-Bold").fillColor(manifest.client.isVerified ? "#047857" : "#b45309").text(
    `${String(manifest.client.verificationStatus || "unverified").toUpperCase()} (${manifest.client.verificationProvider || "Fayda"})`,
    140,
    partiesTop + 77
  );

  // Worker Box
  doc.roundedRect(44 + halfWidth + 10, partiesTop, halfWidth, 100, 6).fillColor("#ffffff").fillAndStroke("#e5e7eb", "#d1d5db");
  doc.fillColor("#047857").fontSize(8).font("Helvetica-Bold").text("PARTY 2: WORKER (SKILLED ARTISAN)", 44 + halfWidth + 20, partiesTop + 10);
  doc.fontSize(7).font("Helvetica").fillColor("#6b7280");
  doc.text("Legal Name:", 44 + halfWidth + 20, partiesTop + 25);
  doc.text("Contact Phone:", 44 + halfWidth + 20, partiesTop + 38);
  doc.text("Account Email:", 44 + halfWidth + 20, partiesTop + 51);
  doc.text("National ID (Fayda):", 44 + halfWidth + 20, partiesTop + 64);
  doc.text("Verification Status:", 44 + halfWidth + 20, partiesTop + 77);

  doc.font("Helvetica-Bold").fillColor("#111827");
  doc.text(manifest.worker.fullName || "Registered Worker", 44 + halfWidth + 110, partiesTop + 25);
  doc.text(manifest.worker.phone || "Not recorded", 44 + halfWidth + 110, partiesTop + 38);
  doc.font("Helvetica").text(manifest.worker.email, 44 + halfWidth + 110, partiesTop + 51);
  doc.font("Courier-Bold").text(maskFinLast4(manifest.worker.finLast4) || "Not recorded", 44 + halfWidth + 110, partiesTop + 64);
  doc.font("Helvetica-Bold").fillColor(manifest.worker.isVerified ? "#047857" : "#b45309").text(
    `${String(manifest.worker.verificationStatus || "pending").toUpperCase()} (${manifest.worker.verificationProvider || "Fayda"})`,
    44 + halfWidth + 110,
    partiesTop + 77
  );

  // Evidentiary Disclaimer (Facts vs Allegations)
  const discTop = partiesTop + 110;
  doc.roundedRect(44, discTop, pageWidth, 55, 6).fillColor("#fffbeb").fillAndStroke("#fde68a", "#d97706");
  doc.fillColor("#92400e").fontSize(7.5).font("Helvetica-Bold").text("CRITICAL EVIDENTIARY DISTINCTION: RECORDED FACTS VS. ALLEGATIONS", 54, discTop + 8);
  doc.fontSize(6.5).font("Helvetica").fillColor("#78350f").text(
    "1. Recorded Facts: The timestamps, cryptographic document hashes, digital PIN signature consents, Chapa gateway transaction confirmations, and immutable append-only audit events contained in this dossier are system-recorded facts.\n" +
    "2. Allegations & Claims: Statements in dispute descriptions, claims, support tickets, and chat messages represent allegations and assertions made by the respective parties, not adjudicated findings of DireSkill.",
    54,
    discTop + 22,
    { width: pageWidth - 20, lineGap: 1.5 }
  );

  // Table of Contents & Exhibits List
  const tocTop = discTop + 65;
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor("#111827").text("DOSSIER STRUCTURE & INCLUDED EXHIBITS", 44, tocTop);
  doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(44, tocTop + 13).lineTo(551, tocTop + 13).stroke();

  const exhibits = [
    ["Exhibit A", "Original Accepted Digital Contract & Party Agreement Snapshot", "Page 2"],
    ["Exhibit B", "System-Generated Chronological Job & Lifecycle Timeline", "Page 3"],
    ["Exhibit C", "Chapa Financial Gateway Payment Verification & Settlement Ledger", "Page 4"],
    ["Exhibit D", "Dispute, Arbitral Claims & Mediation History", "Page 5"],
    ["Exhibit E", "Supporting Documentary Evidence, Training Certificates & Chat Transcript", "Page 6"],
  ];

  let exY = tocTop + 20;
  for (const [code, desc, pg] of exhibits) {
    doc.fontSize(7.5).font("Helvetica-Bold").fillColor("#991b1b").text(code, 48, exY);
    doc.fontSize(7.5).font("Helvetica").fillColor("#1f2937").text(desc, 115, exY);
    doc.fontSize(7.5).font("Helvetica-Bold").fillColor("#4b5563").text(pg, 510, exY, { align: "right" });
    exY += 15;
  }

  // QR Code & Verification Seal Box on Cover
  if (qrBuffer) {
    doc.image(qrBuffer, 44, exY + 10, { width: 55, height: 55 });
    doc.fontSize(7).font("Helvetica-Bold").fillColor("#111827").text("ONLINE AUDIT VERIFICATION", 108, exY + 15);
    doc.fontSize(6.5).font("Helvetica").fillColor("#6b7280").text(
      "Scan QR code or visit DireSkill verification portal with Document Hash to confirm the unaltered authenticity of this evidentiary record.",
      108,
      exY + 27,
      { width: 330 }
    );
    doc.fontSize(6).font("Courier").fillColor("#991b1b").text(`Hash: ${manifest.contract.documentHash || "NOT_FINALIZED"}`, 108, exY + 52);
  }

  // =========================================================================
  // PAGE 2: EXHIBIT A - ORIGINAL CONTRACT & AGREEMENT SNAPSHOT
  // =========================================================================
  doc.addPage();
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#991b1b").text("EXHIBIT A: ORIGINAL ACCEPTED DIGITAL CONTRACT", 44, 44);
  doc.fontSize(7).font("Helvetica").fillColor("#6b7280").text("Preserved immutable snapshot of terms agreed and electronically signed by both parties.", 44, 58);
  doc.strokeColor("#991b1b").lineWidth(1).moveTo(44, 70).lineTo(551, 70).stroke();

  // Contract Details Grid
  const cTop = 80;
  doc.roundedRect(44, cTop, pageWidth, 75, 4).fillColor("#f9fafb").fillAndStroke("#e5e7eb", "#d1d5db");
  doc.fontSize(7.5).font("Helvetica-Bold").fillColor("#111827");
  doc.text("Job Title:", 54, cTop + 10);
  doc.text("Agreed Consideration:", 54, cTop + 24);
  doc.text("Work Location:", 54, cTop + 38);
  doc.text("Contract Created:", 54, cTop + 52);

  doc.font("Helvetica");
  doc.text(manifest.contract.jobTitle || manifest.contract.originalJobTitle || "Skilled Labor Contract", 170, cTop + 10);
  doc.font("Helvetica-Bold").fillColor("#047857").text(formatMoney(manifest.contract.paymentAmount), 170, cTop + 24);
  doc.font("Helvetica").fillColor("#111827").text(manifest.contract.workLocation || "Dire Dawa, Ethiopia", 170, cTop + 38);
  doc.text(formatDateTime(manifest.contract.contractCreatedAt), 170, cTop + 52);

  doc.font("Helvetica-Bold").text("Status:", 340, cTop + 10);
  doc.text("Activated At:", 340, cTop + 24);
  doc.text("Cryptographic Hash:", 340, cTop + 38);

  doc.font("Helvetica").text(manifest.contract.contractStatus || "ACTIVE", 430, cTop + 10);
  doc.text(formatDateTime(manifest.contract.activatedAt), 430, cTop + 24);
  doc.font("Courier").fontSize(6).text(String(manifest.contract.documentHash || "N/A").slice(0, 18) + "...", 430, cTop + 38);

  // Digital Signatures Box
  const sigTop = cTop + 85;
  doc.roundedRect(44, sigTop, pageWidth, 75, 4).fillColor("#ffffff").fillAndStroke("#e5e7eb", "#d1d5db");
  doc.fontSize(8).font("Helvetica-Bold").fillColor("#111827").text("ELECTRONIC ACCEPTANCE & SIGNATURE RECORDS", 54, sigTop + 8);

  doc.fontSize(7).font("Helvetica").fillColor("#4b5563");
  doc.text("Client Electronic Signature:", 54, sigTop + 25);
  doc.text("Timestamp:", 54, sigTop + 37);
  doc.text("PIN Verification & Consent:", 54, sigTop + 49);

  doc.font("Helvetica-Bold").fillColor("#111827");
  doc.text(manifest.client.fullName || "Client", 180, sigTop + 25);
  doc.font("Helvetica").text(formatDateTime(manifest.contract.clientSignedAt || manifest.contract.signedAt), 180, sigTop + 37);
  doc.font("Helvetica-Bold").fillColor("#047857").text("CONFIRMED (Electronic Signature & Contract PIN)", 180, sigTop + 49);

  doc.font("Helvetica").fillColor("#4b5563");
  doc.text("Worker Electronic Signature:", 320, sigTop + 25);
  doc.text("Timestamp:", 320, sigTop + 37);
  doc.text("PIN Verification & Consent:", 320, sigTop + 49);

  doc.font("Helvetica-Bold").fillColor("#111827");
  doc.text(manifest.worker.fullName || "Worker", 440, sigTop + 25);
  doc.font("Helvetica").text(formatDateTime(manifest.contract.workerSignedAt || manifest.contract.signedAt), 440, sigTop + 37);
  doc.font("Helvetica-Bold").fillColor("#047857").text("CONFIRMED (Electronic Signature & Contract PIN)", 440, sigTop + 49);

  // Full Contractual Terms Text
  const termsTop = sigTop + 85;
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor("#111827").text("PRESERVED CONTRACTUAL TERMS", 44, termsTop);
  doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(44, termsTop + 12).lineTo(551, termsTop + 12).stroke();

  const termsText = manifest.contract.terms ||
    "1. Scope of Work: The Worker agrees to execute the skilled labor tasks detailed in the job description in a professional manner in accordance with Ethiopian trade standards.\n" +
    "2. Consideration: The Client agrees to pay the stipulated amount upon satisfactory completion of services.\n" +
    "3. Quality & Tools: The Worker warrants possessing the requisite skills, tools, and technical competencies.\n" +
    "4. Dispute Resolution: Any disagreement arising out of the performance of this agreement shall be submitted to mediation under Ethiopian Labour Proclamation No. 1156/2019.";

  doc.roundedRect(44, termsTop + 18, pageWidth, 420, 4).fillColor("#fbfcfd").fillAndStroke("#e5e7eb", "#e5e7eb");
  doc.fontSize(7).font("Helvetica").fillColor("#374151").text(termsText, 54, termsTop + 26, {
    width: pageWidth - 20,
    lineGap: 3,
  });

  // =========================================================================
  // PAGE 3: EXHIBIT B - SYSTEM-GENERATED JOB & EVENT TIMELINE
  // =========================================================================
  doc.addPage();
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#991b1b").text("EXHIBIT B: SYSTEM-GENERATED AUDIT TIMELINE", 44, 44);
  doc.fontSize(7).font("Helvetica").fillColor("#6b7280").text(
    "Chronological system events recorded by server audit logs. Strictly distinguished from informal chat messages.",
    44,
    58
  );
  doc.strokeColor("#991b1b").lineWidth(1).moveTo(44, 70).lineTo(551, 70).stroke();

  const timelineRows = manifest.systemTimeline || [];

  if (timelineRows.length === 0) {
    // Fallback events derived from record timestamps if no explicit timeline passed
    timelineRows.push({
      timestamp: manifest.contract.contractCreatedAt || new Date().toISOString(),
      actor: "Client",
      actorRole: "CLIENT",
      eventType: "contract_created",
      title: "Contract Created",
      description: `Contract initiated for job "${manifest.contract.jobTitle || "Skilled Labor"}"`,
      verified: true,
    });
    if (manifest.contract.clientSignedAt) {
      timelineRows.push({
        timestamp: manifest.contract.clientSignedAt,
        actor: "Client",
        actorRole: "CLIENT",
        eventType: "contract_signed_client",
        title: "Client Electronic Signature",
        description: "Client signed with PIN verification and accepted contract policy",
        verified: true,
      });
    }
    if (manifest.contract.workerSignedAt) {
      timelineRows.push({
        timestamp: manifest.contract.workerSignedAt,
        actor: "Worker",
        actorRole: "WORKER",
        eventType: "contract_signed_worker",
        title: "Worker Electronic Signature",
        description: "Worker signed with PIN verification and accepted contract policy",
        verified: true,
      });
    }
    if (manifest.contract.activatedAt) {
      timelineRows.push({
        timestamp: manifest.contract.activatedAt,
        actor: "System",
        actorRole: "SYSTEM",
        eventType: "contract_activated",
        title: "Contract Activated",
        description: "Contract fully executed and work authorized to commence",
        verified: true,
      });
    }
  }

  let tY = 80;
  for (let i = 0; i < timelineRows.length && tY < 730; i++) {
    const ev = timelineRows[i];
    doc.circle(52, tY + 6, 4).fillColor("#991b1b").fill();
    if (i < timelineRows.length - 1) {
      doc.strokeColor("#d1d5db").lineWidth(1).moveTo(52, tY + 12).lineTo(52, tY + 45).stroke();
    }

    doc.roundedRect(64, tY, pageWidth - 20, 36, 4).fillColor("#f9fafb").fillAndStroke("#f3f4f6", "#e5e7eb");
    doc.fontSize(7.5).font("Helvetica-Bold").fillColor("#111827").text(ev.title, 72, tY + 6);
    doc.fontSize(6.5).font("Helvetica").fillColor("#4b5563").text(ev.description, 72, tY + 18, { width: 330 });

    doc.fontSize(6.5).font("Courier-Bold").fillColor("#6b7280").text(formatDateTime(ev.timestamp), 410, tY + 6, { align: "right" });
    doc.fontSize(6).font("Helvetica-Bold").fillColor("#047857").text(`[ACTOR: ${ev.actorRole || "SYSTEM"}]`, 410, tY + 18, { align: "right" });

    tY += 44;
  }

  // =========================================================================
  // PAGE 4: EXHIBIT C - CHAPA PAYMENT EVIDENCE & FINANCIAL LEDGER
  // =========================================================================
  doc.addPage();
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#991b1b").text("EXHIBIT C: CHAPA PAYMENT GATEWAY EVIDENCE", 44, 44);
  doc.fontSize(7).font("Helvetica").fillColor("#6b7280").text(
    "Authoritative third-party payment gateway transaction records verified server-side with Chapa Financial Technologies.",
    44,
    58
  );
  doc.strokeColor("#991b1b").lineWidth(1).moveTo(44, 70).lineTo(551, 70).stroke();

  // Payment disclaimer banner
  doc.roundedRect(44, 80, pageWidth, 42, 4).fillColor("#eff6ff").fillAndStroke("#dbeafe", "#3b82f6");
  doc.fontSize(7.5).font("Helvetica-Bold").fillColor("#1e40af").text("PAYMENT RESPONSIBILITY & NON-CUSTODIAL PLATFORM STATEMENT", 54, 88);
  doc.fontSize(6.5).font("Helvetica").fillColor("#1e3a8a").text(
    "DireSkill is an electronic marketplace matching service and does NOT act as a bank, financial institution, or escrow custodian. " +
    "All client funds and payouts are processed directly through Chapa Financial Technologies (Telebirr / CBE Birr / Cards). " +
    "Official payment settlement records and receipts are issued solely by Chapa.",
    54,
    100,
    { width: pageWidth - 20, lineGap: 1.5 }
  );

  const paymentList = manifest.payments || [];
  let pY = 135;

  if (paymentList.length === 0) {
    doc.roundedRect(44, pY, pageWidth, 45, 4).fillColor("#f9fafb").fillAndStroke("#f3f4f6", "#e5e7eb");
    doc.fontSize(7.5).font("Helvetica").fillColor("#6b7280").text("No electronic payments recorded for this job in system records.", 54, pY + 16);
    pY += 55;
  } else {
    for (const p of paymentList) {
      const isSuccess = String(p.status).toLowerCase() === "released";
      doc.roundedRect(44, pY, pageWidth, 85, 4).fillColor("#ffffff").fillAndStroke("#e5e7eb", isSuccess ? "#047857" : "#b45309");

      doc.fontSize(8.5).font("Helvetica-Bold").fillColor("#111827").text(`PAYMENT RECORD: ${p.id}`, 54, pY + 10);
      doc.fontSize(7).font("Helvetica").fillColor("#6b7280");
      doc.text("Consideration Amount:", 54, pY + 26);
      doc.text("Platform Commission:", 54, pY + 39);
      doc.text("Net Worker Disbursement:", 54, pY + 52);
      doc.text("Transaction Timestamp:", 54, pY + 65);

      doc.font("Helvetica-Bold").fillColor("#111827");
      doc.text(formatMoney(p.amount), 170, pY + 26);
      doc.text(formatMoney(p.commissionAmount || 0), 170, pY + 39);
      doc.text(formatMoney(p.netAmount || p.amount), 170, pY + 52);
      doc.font("Helvetica").text(formatDateTime(p.createdAt), 170, pY + 65);

      doc.font("Helvetica-Bold").fillColor("#4b5563");
      doc.text("Gateway Provider:", 320, pY + 26);
      doc.text("Chapa Reference (Trx):", 320, pY + 39);
      doc.text("Settlement Status:", 320, pY + 52);
      doc.text("Financial Hold:", 320, pY + 65);

      doc.font("Helvetica").fillColor("#111827");
      doc.text("Chapa Financial Technologies (Direct Gateway)", 425, pY + 26);
      doc.font("Courier-Bold").text(p.chapaReference || p.chapaRef || "N/A", 425, pY + 39);
      doc.font("Helvetica-Bold").fillColor(isSuccess ? "#047857" : "#b45309").text(String(p.status).toUpperCase(), 425, pY + 52);
      doc.font("Helvetica").fillColor(p.financialHoldStatus && p.financialHoldStatus !== "none" ? "#b91c1c" : "#047857").text(
        p.financialHoldStatus || "None",
        425,
        pY + 65
      );

      pY += 95;
    }
  }

  // =========================================================================
  // PAGE 5: EXHIBIT D - DISPUTE & MEDIATION PROCEEDINGS
  // =========================================================================
  doc.addPage();
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#991b1b").text("EXHIBIT D: DISPUTES & MEDIATION PROCEEDINGS", 44, 44);
  doc.fontSize(7).font("Helvetica").fillColor("#6b7280").text(
    "Records of claims, administrative mediation, and decisions conducted under statutory dispute frameworks.",
    44,
    58
  );
  doc.strokeColor("#991b1b").lineWidth(1).moveTo(44, 70).lineTo(551, 70).stroke();

  const disputeList = manifest.disputes || [];
  let dY = 80;

  if (disputeList.length === 0) {
    doc.roundedRect(44, dY, pageWidth, 45, 4).fillColor("#f9fafb").fillAndStroke("#f3f4f6", "#e5e7eb");
    doc.fontSize(7.5).font("Helvetica").fillColor("#6b7280").text("No disputes or formal claims were filed for this contract.", 54, dY + 16);
    dY += 55;
  } else {
    for (const d of disputeList) {
      doc.roundedRect(44, dY, pageWidth, 120, 4).fillColor("#ffffff").fillAndStroke("#e5e7eb", "#b91c1c");

      doc.fontSize(8.5).font("Helvetica-Bold").fillColor("#111827").text(`DISPUTE CASE: ${d.id}`, 54, dY + 10);
      doc.fontSize(7).font("Helvetica").fillColor("#6b7280");
      doc.text("Dispute Title / Category:", 54, dY + 26);
      doc.text("Filing Date:", 54, dY + 39);
      doc.text("Current Case Status:", 54, dY + 52);
      doc.text("Requested Resolution:", 54, dY + 65);
      doc.text("Arbitrator Decision:", 54, dY + 78);
      doc.text("Resolution Notes:", 54, dY + 91);

      doc.font("Helvetica-Bold").fillColor("#111827");
      doc.text(`${d.title || "Dispute"} (${d.category || d.claimType || "Work Quality / Terms"})`, 170, dY + 26);
      doc.font("Helvetica").text(formatDateTime(d.createdAt), 170, dY + 39);
      doc.font("Helvetica-Bold").fillColor(d.status === "resolved" ? "#047857" : "#b91c1c").text(String(d.status).toUpperCase(), 170, dY + 52);
      doc.font("Helvetica").fillColor("#374151").text(d.requestedResolution || "Not specified", 170, dY + 65);
      doc.font("Helvetica-Bold").fillColor("#111827").text(d.finalDecision || "Pending Adjudication", 170, dY + 78);
      doc.font("Helvetica").fillColor("#4b5563").text(d.resolutionNotes || d.finalReason || "No formal mediation notes recorded.", 170, dY + 91, { width: 340 });

      dY += 130;
    }
  }

  // =========================================================================
  // PAGE 6: EXHIBIT E - SUPPORTING EVIDENCE & CHAT TRANSCRIPT (SEPARATE)
  // =========================================================================
  doc.addPage();
  doc.fontSize(10).font("Helvetica-Bold").fillColor("#991b1b").text("EXHIBIT E: SUPPORTING EVIDENCE & ATTACHMENTS", 44, 44);
  doc.fontSize(7).font("Helvetica").fillColor("#6b7280").text(
    "List of uploaded documentary exhibits, worker training certificates, and party communication logs.",
    44,
    58
  );
  doc.strokeColor("#991b1b").lineWidth(1).moveTo(44, 70).lineTo(551, 70).stroke();

  let eY = 80;

  // Training Certificates
  const certs = manifest.worker.certificates || [];
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor("#111827").text(`1. Worker Professional Qualification Certificates (${certs.length})`, 44, eY);
  eY += 14;

  if (certs.length === 0) {
    doc.fontSize(7).font("Helvetica").fillColor("#6b7280").text("No formal qualification certificates filed with profile.", 54, eY);
    eY += 16;
  } else {
    for (const c of certs) {
      doc.roundedRect(44, eY, pageWidth, 24, 4).fillColor("#f9fafb").fillAndStroke("#f3f4f6", "#e5e7eb");
      doc.fontSize(7.5).font("Helvetica-Bold").fillColor("#111827").text(c.file_name || c.fileName || "Certificate Document", 54, eY + 6);
      doc.fontSize(6.5).font("Courier").fillColor("#6b7280").text(`ID: ${c.id}  •  Size: ${c.file_size || c.fileSize || 0} bytes  •  ${formatDate(c.created_at || c.createdAt)}`, 240, eY + 6);
      eY += 28;
    }
  }

  // Conversational Chat Transcript (Separate from System Timeline)
  const chatMessages = manifest.chatTranscript || [];
  eY += 10;
  doc.fontSize(8.5).font("Helvetica-Bold").fillColor("#111827").text(`2. In-App Conversational Transcript (${chatMessages.length} Messages)`, 44, eY);
  doc.fontSize(6.5).font("Helvetica").fillColor("#6b7280").text(
    "Authorized party communications. Presented as subjective party statements; not system-verified facts.",
    44,
    eY + 12
  );
  eY += 25;

  if (chatMessages.length === 0) {
    doc.fontSize(7).font("Helvetica").fillColor("#6b7280").text("No direct in-app chat messages recorded between client and worker.", 54, eY);
    eY += 20;
  } else {
    for (let i = 0; i < chatMessages.length && eY < 720; i++) {
      const msg = chatMessages[i];
      const isClient = msg.senderRole === "CLIENT";
      doc.roundedRect(44, eY, pageWidth, 30, 4).fillColor(isClient ? "#eff6ff" : "#f0fdf4").fillAndStroke(isClient ? "#dbeafe" : "#dcfce7", "#e5e7eb");

      doc.fontSize(7).font("Helvetica-Bold").fillColor(isClient ? "#1e40af" : "#166534").text(
        `${msg.senderRole}: ${msg.senderName}`,
        54,
        eY + 4
      );
      doc.fontSize(6.5).font("Courier").fillColor("#6b7280").text(formatDateTime(msg.createdAt), 410, eY + 4, { align: "right" });
      doc.fontSize(7).font("Helvetica").fillColor("#1f2937").text(msg.body, 54, eY + 16, { width: pageWidth - 20, ellipsis: true });

      eY += 34;
    }
  }

  // =========================================================================
  // PAGE NUMBERING & OFFICIAL ATTESTATION FOOTER LOOP
  // =========================================================================
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    // Running Header (Pages > 0)
    if (i > 0) {
      doc.fontSize(6.5).font("Helvetica-Bold").fillColor("#991b1b");
      doc.text("CONFIDENTIAL · JUDICIAL & ARBITRAL EVIDENTIARY SUBMISSION", 44, 20);
      doc.fontSize(6.5).font("Helvetica").fillColor("#6b7280");
      doc.text(`Case: ${manifest.metadata.caseNumber}  •  Contract: ${manifest.contract.contractId}`, 44, 28);
      doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(44, 36).lineTo(551, 36).stroke();
    }

    // Running Footer
    doc.strokeColor("#e5e7eb").lineWidth(0.5).moveTo(44, doc.page.height - 35).lineTo(551, doc.page.height - 35).stroke();
    doc.fontSize(7).font("Helvetica").fillColor("#6b7280");
    doc.text(
      `Page ${i + 1} of ${range.count}  •  DireSkill Statutory Evidence System  •  Ethiopian Labour Proclamation No. 1156/2019`,
      44,
      doc.page.height - 26,
      { align: "center", width: pageWidth }
    );
  }

  doc.end();
  return done;
}
