import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { sql } from "@/lib/db";
import { maskFinLast4 } from "@/lib/fin-protection";

function formatDate(value: unknown) {
  if (!value) return "Not recorded";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(value: unknown) {
  if (!value) return "12:00:00 EAT";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "12:00:00 EAT";
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " EAT";
}

function formatDateTime(value: unknown) {
  if (!value) return "Not recorded";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "Not recorded";
  const d = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const t = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return `${d} ${t} EAT`;
}

function formatMoney(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not recorded";
  return `${Math.round(Number(value)).toLocaleString()} ETB`;
}

function maskPhone(phone: unknown) {
  const p = String(phone || "").trim();
  if (!p) return "09********";
  if (p.length <= 4) return p;
  return `${p.slice(0, 2)}••••••${p.slice(-2)}`;
}

function drawDireSkillSeal(doc: PDFKit.PDFDocument, x: number, y: number, size: number, opacity = 0.85) {
  doc.save();
  doc.opacity(opacity);
  doc.circle(x + size / 2, y + size / 2, size / 2).lineWidth(2).strokeColor("#047857").stroke();
  doc.circle(x + size / 2, y + size / 2, size / 2 - 8).lineWidth(1).strokeColor("#047857").stroke();
  doc.fillColor("#047857").fontSize(11).font("Helvetica-Bold").text("DIRESKILL", x, y + 23, { width: size, align: "center" });
  doc.fontSize(6.5).font("Helvetica").text("DIGITAL SERVICES", x, y + 38, { width: size, align: "center" });
  doc.fontSize(6).text("OFFICIAL COMPANY SEAL", x, y + 50, { width: size, align: "center" });
  doc.text("Dire Dawa, Ethiopia", x, y + 62, { width: size, align: "center" });
  doc.font("Helvetica-Bold").text("EST. 2026", x, y + 74, { width: size, align: "center" });
  doc.restore();
}

async function createContractNotification(userId: string, title: string, body: string, linkHref: string) {
  try {
    await sql`
      INSERT INTO notifications (user_id, type, title, body, link_href)
      VALUES (${userId}, 'contract_signed', ${title}, ${body}, ${linkHref})
    `;
  } catch (error) {
    console.error("[CREATE_CONTRACT_NOTIFICATION_ERROR]", error);
  }
}

async function buildContractPdfBuffer(contract: any, signatures: any[], qrDataUrl: string, documentHash: string) {
  const doc = new PDFDocument({ size: "A4", margin: 44, bufferPages: true });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const qrBase64 = qrDataUrl.split(",")[1] || "";
  const qrBuffer = Buffer.from(qrBase64, "base64");

  const contractCode = `SKD-${String(contract.id).slice(0, 8).toUpperCase()}`;
  const issueDate = formatDate(contract.activated_at || contract.finalized_at || contract.created_at);
  const issueTime = formatTime(contract.activated_at || contract.finalized_at || contract.created_at);

  // ================= PAGE 1 =================
  const logoPath = path.join(process.cwd(), "public", "direskill_logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 44, 40, { width: 44, height: 40 });
  }

  doc.fillColor("#047857").fontSize(13).font("Helvetica-Bold").text("DIRESKILL DIGITAL CONTRACT", 96, 42);
  doc.fillColor("#4b5563").fontSize(7.5).font("Helvetica").text("Web-Based Informal Worker Hiring, Contract, and Reputation System", 96, 57);
  doc.fillColor("#111827").fontSize(8.5).font("Helvetica-Bold").text("OFFICIAL ELECTRONIC AGREEMENT", 96, 69);

  const stampPath = path.join(process.cwd(), "public", "direskill_stamp.png");
  if (fs.existsSync(stampPath)) {
    doc.image(stampPath, 460, 24, { width: 80, height: 80 });
  } else {
    drawDireSkillSeal(doc, 445, 30, 95, 0.85);
  }

  doc.fillColor("#6b7280").fontSize(7.5).font("Helvetica").text(
    `Issue Date: ${issueDate}   •   Issue Time: ${issueTime}   •   Contract ID: ${contractCode}   •   Status: ✓ Active`,
    96,
    84
  );
  doc.moveTo(44, 108).lineTo(551, 108).strokeColor("#e5e7eb").stroke();

  // 1. PARTIES
  doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text("1. PARTIES", 44, 120);

  // Client Box
  doc.roundedRect(44, 136, 245, 115, 6).fillAndStroke("#f9fafb", "#e5e7eb");
  doc.fillColor("#047857").fontSize(9).font("Helvetica-Bold").text("CLIENT", 56, 146);
  doc.fillColor("#6b7280").fontSize(8).font("Helvetica").text("Name:", 56, 162);
  doc.fillColor("#111827").font("Helvetica-Bold").text(contract.client_name || "Client", 110, 162);
  doc.fillColor("#6b7280").font("Helvetica").text("Identity:", 56, 178);
  doc.fillColor(contract.client_verified ? "#047857" : "#b91c1c").font("Helvetica-Bold").text(
    contract.client_verified ? "✓ Fayda Verified" : "Not verified",
    110,
    178
  );
  doc.fillColor("#6b7280").font("Helvetica").text("FAN:", 56, 194);
  doc.fillColor("#111827").font("Helvetica").text(
    contract.client_fin_last4 ? `FAN-${maskFinLast4(contract.client_fin_last4)}` : "FAN-••••••••••••",
    110,
    194
  );
  doc.fillColor("#6b7280").text("Phone:", 56, 210);
  doc.fillColor("#111827").text(contract.client_phone || "09********", 110, 210);
  doc.fillColor("#6b7280").text("Client ID:", 56, 226);
  doc.fillColor("#4b5563").font("Helvetica-Bold").text(`CLI-${String(contract.client_id || "").slice(0, 8).toUpperCase()}`, 110, 226);

  // Worker Box
  doc.roundedRect(306, 136, 245, 115, 6).fillAndStroke("#f9fafb", "#e5e7eb");
  doc.fillColor("#047857").fontSize(9).font("Helvetica-Bold").text("WORKER", 318, 146);
  doc.fillColor("#6b7280").fontSize(8).font("Helvetica").text("Name:", 318, 162);
  doc.fillColor("#111827").font("Helvetica-Bold").text(contract.worker_name || "Worker", 375, 162);
  doc.fillColor("#6b7280").font("Helvetica").text("Occupation:", 318, 178);
  doc.fillColor("#111827").font("Helvetica").text(contract.worker_occupation || "Skilled Professional", 375, 178);
  doc.fillColor("#6b7280").font("Helvetica").text("Identity:", 318, 194);
  doc.fillColor(contract.worker_verified ? "#047857" : "#b91c1c").font("Helvetica-Bold").text(
    contract.worker_verified ? "✓ Fayda Verified" : "Not verified",
    375,
    194
  );
  doc.fillColor("#6b7280").font("Helvetica").text("FAN:", 318, 210);
  doc.fillColor("#111827").font("Helvetica").text(
    contract.worker_fin_last4 ? `FAN-${maskFinLast4(contract.worker_fin_last4)}` : "FAN-••••••••••••",
    375,
    210
  );
  doc.fillColor("#6b7280").text("Phone:", 318, 226);
  doc.fillColor("#111827").text(contract.worker_phone || "09********", 375, 226);

  doc.fillColor("#9ca3af").fontSize(7).font("Helvetica-Oblique").text(
    "Note: Full FAN numbers are stored securely and visible only to system administrators and authorized authorities.",
    44,
    258
  );

  // 2. SERVICE & 3. PAYMENT DETAILS
  doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text("2. SERVICE DETAILS", 44, 280);
  doc.text("3. PAYMENT DETAILS", 306, 280);

  // Service Box
  doc.roundedRect(44, 296, 245, 140, 6).fillAndStroke("#ffffff", "#e5e7eb");
  doc.fillColor("#6b7280").fontSize(8).font("Helvetica").text("Job Title:", 56, 308);
  doc.fillColor("#111827").font("Helvetica-Bold").text(contract.job_title || "Service Job", 115, 308, { width: 160 });
  doc.fillColor("#6b7280").font("Helvetica").text("Description:", 56, 324);
  doc.fillColor("#374151").text(
    contract.job_description || "As specified in contract draft.",
    115,
    324,
    { width: 160, height: 42, ellipsis: true }
  );
  doc.fillColor("#6b7280").text("Location:", 56, 372);
  doc.fillColor("#111827").text(contract.work_location || "Dire Dawa", 115, 372);
  doc.fillColor("#6b7280").text("Target Date:", 56, 388);
  doc.fillColor("#111827").text(formatDateTime(contract.estimated_completion_date), 115, 388);
  doc.fillColor("#6b7280").text("Materials:", 56, 404);
  doc.fillColor("#374151").text(contract.materials_responsibility || "Standard agreement terms apply", 115, 404, { width: 160, ellipsis: true });

  // Payment Box
  doc.roundedRect(306, 296, 245, 140, 6).fillAndStroke("#ffffff", "#e5e7eb");
  doc.fillColor("#6b7280").fontSize(8).font("Helvetica").text("Amount:", 318, 308);
  doc.fillColor("#047857").fontSize(11).font("Helvetica-Bold").text(
    formatMoney(contract.payment_amount ?? contract.budget),
    395,
    307
  );
  doc.fillColor("#6b7280").fontSize(8).font("Helvetica").text("Payment Method:", 318, 328);
  doc.fillColor("#111827").text("Chapa Digital Escrow", 395, 328);
  doc.fillColor("#6b7280").text("Schedule:", 318, 348);
  doc.fillColor("#111827").text("After verified job completion", 395, 348);
  doc.fillColor("#6b7280").text("Escrow Security:", 318, 368);
  doc.fillColor("#047857").font("Helvetica-Bold").text("Secured in Escrow", 395, 368);
  doc.fillColor("#6b7280").font("Helvetica").text("Site Notes:", 318, 388);
  doc.fillColor("#374151").text(contract.additional_notes || "None recorded.", 395, 388, { width: 145, ellipsis: true });

  // Bottom Notice on Page 1
  doc.fillColor("#6b7280").fontSize(7.5).font("Helvetica").text(
    "Contract terms continue on page 2 with binding conditions, electronic signatures, and official digital stamp.",
    44,
    460,
    { width: 507, align: "center" }
  );

  // ================= PAGE 2 =================
  doc.addPage();
  drawDireSkillSeal(doc, 185, 270, 220, 0.04);

  // 4. TERMS AND CONDITIONS
  doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text("4. TERMS AND CONDITIONS", 44, 44);
  const terms = [
    "The worker agrees to complete the work described above with good professional quality, safety standards, and skill.",
    "The client agrees to pay the agreed amount into DireSkill Escrow, to be released after verified job completion.",
    "Any additional work, material variation, or schedule change must be mutually agreed upon in the DireSkill platform.",
    "Either party must promptly inform the other party in case of any technical or site issue before work commences.",
    "Disputes will be mediated through the DireSkill platform using system timestamped records and evidence.",
    "Both parties confirm they are 18 years or older and possess full legal capacity to enter this binding agreement.",
    "The services described herein are lawful under the laws of the Federal Democratic Republic of Ethiopia, including the Electronic Transactions Proclamation No. 1205/2020."
  ];
  terms.forEach((t, i) => {
    doc.fillColor("#047857").fontSize(8).font("Helvetica-Bold").text(`${i + 1}.`, 44, 62 + i * 19);
    doc.fillColor("#374151").font("Helvetica").text(t, 58, 62 + i * 19, { width: 493 });
  });

  // 5. CONSENT & DECLARATION
  doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text("5. CONSENT & DECLARATION", 44, 210);
  const consents = [
    "I have read and understood this agreement and all governing terms and conditions.",
    "I voluntarily accept all terms, deliverables, schedule milestones, and conditions stated above.",
    "I understand that entering my private Contract PIN acts as my binding electronic signature."
  ];
  consents.forEach((c, i) => {
    doc.fillColor("#047857").fontSize(9).font("Helvetica-Bold").text("☑", 48, 228 + i * 18);
    doc.fillColor("#374151").fontSize(8).font("Helvetica").text(c, 64, 229 + i * 18);
  });

  // 6. ELECTRONIC SIGNATURES
  doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text("6. ELECTRONIC SIGNATURES", 44, 295);

  const clientSig = signatures.find((s: any) => s.role === "client") || signatures[0];
  const workerSig = signatures.find((s: any) => s.role === "worker") || signatures[1] || signatures[0];

  doc.roundedRect(44, 311, 245, 68, 6).fillAndStroke("#ffffff", "#e5e7eb");
  doc.fillColor("#111827").fontSize(8).font("Helvetica-Bold").text("CLIENT SIGNATURE", 56, 320);
  doc.fillColor("#374151").font("Helvetica").text(contract.client_name || clientSig?.name || "Client", 56, 334);
  doc.fillColor("#047857").font("Helvetica-Bold").text("✓ PIN Verified", 56, 348);
  doc.fillColor("#6b7280").font("Helvetica").text(formatDateTime(clientSig?.signed_at || contract.client_signed_at), 56, 360);

  doc.roundedRect(306, 311, 245, 68, 6).fillAndStroke("#ffffff", "#e5e7eb");
  doc.fillColor("#111827").fontSize(8).font("Helvetica-Bold").text("WORKER SIGNATURE", 318, 320);
  doc.fillColor("#374151").font("Helvetica").text(contract.worker_name || workerSig?.name || "Worker", 318, 334);
  doc.fillColor("#047857").font("Helvetica-Bold").text("✓ PIN Verified", 318, 348);
  doc.fillColor("#6b7280").font("Helvetica").text(formatDateTime(workerSig?.signed_at || contract.worker_signed_at), 318, 360);

  // 7. DOCUMENT SECURITY & DIGITAL STAMP TABLE
  doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text("7. DIGITAL STAMP & VERIFICATION", 44, 396);

  // Stamp Table Outer
  doc.roundedRect(44, 412, 507, 108, 6).fillAndStroke("#f9fafb", "#0f62ac");

  // Left Cell: Official DireSkill Company Stamp
  doc.roundedRect(56, 422, 140, 88, 4).fillAndStroke("#ffffff", "#0f62ac");
  if (fs.existsSync(stampPath)) {
    doc.image(stampPath, 84, 424, { width: 84, height: 84 });
  } else {
    doc.fillColor("#0f62ac").fontSize(12).font("Helvetica-Bold").text("Dire Skill", 56, 432, { width: 140, align: "center" });
    doc.fontSize(7).font("Helvetica-Bold").text("DIGITAL CONTRACT", 56, 450, { width: 140, align: "center" });
    doc.fillColor("#047857").fontSize(9).text("✓ VERIFIED", 56, 464, { width: 140, align: "center" });
    doc.fillColor("#111827").fontSize(8).font("Helvetica-Bold").text(contractCode, 56, 478, { width: 140, align: "center" });
    doc.fillColor("#6b7280").fontSize(6).font("Helvetica").text("ELECTRONICALLY GENERATED", 56, 492, { width: 140, align: "center" });
  }

  // Right Cell: QR and Hash
  doc.image(qrBuffer, 210, 420, { width: 88, height: 88 });
  doc.fillColor("#047857").fontSize(9).font("Helvetica-Bold").text("✓ VALID CONTRACT – Status: Active", 310, 424);
  doc.fillColor("#6b7280").fontSize(7.5).font("Helvetica").text(`Contract ID: ${contractCode}`, 310, 439);
  doc.text(`Signed: ${issueDate} ${issueTime}`, 310, 452);
  doc.text("SHA-256 Hash:", 310, 465);
  doc.fillColor("#111827").fontSize(6.5).font("Helvetica").text(documentHash, 310, 477, { width: 230 });
  doc.fillColor("#047857").fontSize(7).font("Helvetica-Bold").text("Fayda Verified  •  PIN e-Signed  •  Timestamped  •  SHA-256 Protected", 310, 495);

  // 8. LEGAL NOTICE
  doc.fillColor("#6b7280").fontSize(7).font("Helvetica").text(
    "Legal Notice: This agreement is created electronically through the Dire Skill Platform after verified identity confirmation, voluntary acceptance, and electronic signatures by both parties. Governed by the Electronic Transactions Proclamation No. 1205/2020 of the Federal Democratic Republic of Ethiopia. System-generated document; no manual alterations are valid.",
    44,
    538,
    { width: 507, align: "center", lineGap: 2 }
  );

  doc.end();
  return done;
}

export async function ensureStoredContractPdf(contractId: string, publicBaseUrl?: string) {
  const rows = await sql`
    SELECT
      c.*,
      j.client_id,
      j.worker_id,
      j.budget,
      COALESCE(wp.skills[1], 'Skilled Professional') as worker_occupation,
      u_client.phone as client_phone,
      u_worker.phone as worker_phone,
      cp.full_name as client_name,
      cp.is_verified as client_verified,
      cp.fin_last4 as client_fin_last4,
      cp.verification_provider as client_verification_provider,
      cp.verification_reference as client_verification_reference,
      cp.verification_status as client_verification_status,
      cp.verified_at as client_verified_at,
      wp.full_name as worker_name,
      wp.is_verified as worker_verified,
      wp.fin_last4 as worker_fin_last4,
      wp.verification_provider as worker_verification_provider,
      wp.verification_reference as worker_verification_reference,
      wp.verification_status as worker_verification_status,
      wp.verified_at as worker_verified_at
    FROM contracts c
    JOIN jobs j ON c.job_id = j.id
    LEFT JOIN users u_client ON j.client_id = u_client.id
    LEFT JOIN users u_worker ON j.worker_id = u_worker.id
    LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
    LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
    WHERE c.id = ${contractId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new Error("Contract not found");
  }

  const contract = rows[0];
  if (contract.final_pdf_base64 && contract.pdf_url) {
    return contract;
  }

  if (!["ACTIVE", "FULLY_SIGNED"].includes(contract.status)) {
    return contract;
  }

  const signatures = await sql`
    SELECT
      cs.*,
      COALESCE(cp.full_name, wp.full_name, u.email) as name
    FROM contract_signatures cs
    JOIN users u ON cs.user_id = u.id
    LEFT JOIN client_profiles cp ON cs.user_id = cp.user_id
    LEFT JOIN worker_profiles wp ON cs.user_id = wp.user_id
    WHERE cs.contract_id = ${contractId}
    ORDER BY cs.signed_at ASC
  `;

  if (signatures.length < 2) {
    return contract;
  }

  const signatureByRole = new Map<string, any>(signatures.map((signature: any) => [signature.role, signature]));
  const identityVerificationSnapshot = [
    {
      partyUserId: contract.client_id,
      role: "client",
      verifiedLegalName: contract.client_name,
      maskedFin: maskFinLast4(contract.client_fin_last4),
      verificationProvider: contract.client_verification_provider || "Fayda",
      verificationReference: contract.client_verification_reference || null,
      verificationStatus: contract.client_verification_status || (contract.client_verified ? "approved" : "incomplete"),
      verificationTimestamp: contract.client_verified_at || null,
      signingTimestamp: signatureByRole.get("client")?.signed_at || null,
    },
    {
      partyUserId: contract.worker_id,
      role: "worker",
      verifiedLegalName: contract.worker_name,
      maskedFin: maskFinLast4(contract.worker_fin_last4),
      verificationProvider: contract.worker_verification_provider || "Fayda",
      verificationReference: contract.worker_verification_reference || null,
      verificationStatus: contract.worker_verification_status || (contract.worker_verified ? "approved" : "pending"),
      verificationTimestamp: contract.worker_verified_at || null,
      signingTimestamp: signatureByRole.get("worker")?.signed_at || null,
    },
  ];
  const finalizedSnapshot = {
    ...(contract.finalized_snapshot && typeof contract.finalized_snapshot === "object" ? contract.finalized_snapshot : {}),
    identityVerificationSnapshot,
  };

  const canonicalPayload = JSON.stringify({
    contractId,
    finalizedSnapshot,
    signatures: signatures.map((signature: any) => ({
      userId: signature.user_id,
      role: signature.role,
      signedAt: signature.signed_at,
      consentConfirmed: signature.consent_confirmed,
    })),
  });
  const documentHash = crypto.createHash("sha256").update(canonicalPayload).digest("hex");
  const appUrl =
    publicBaseUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BASE_URL ||
    "http://localhost:3000";
  const verificationUrl = `${appUrl.replace(/\/$/, "")}/contracts/${contractId}?hash=${documentHash}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
  });

  const pdfBuffer = await buildContractPdfBuffer(contract, signatures, qrCodeDataUrl, documentHash);
  const pdfUrl = `/api/contracts/${contractId}/pdf`;
  const updatedRows = await sql`
    UPDATE contracts
    SET
      status = CASE WHEN status = 'FULLY_SIGNED' THEN 'ACTIVE' ELSE status END,
      finalized_snapshot = ${JSON.stringify(finalizedSnapshot)},
      pdf_url = ${pdfUrl},
      final_pdf_base64 = ${pdfBuffer.toString("base64")},
      document_hash = ${documentHash},
      qr_code_data_url = ${qrCodeDataUrl},
      activated_at = COALESCE(activated_at, NOW()),
      updated_at = NOW()
    WHERE id = ${contractId}
      AND status IN ('ACTIVE', 'FULLY_SIGNED')
    RETURNING *
  `;

  if (contract.status === "FULLY_SIGNED" && updatedRows.length > 0) {
    await sql`
      UPDATE jobs
      SET status = 'active', updated_at = NOW()
      WHERE id = ${contract.job_id}
    `;
  }

  return updatedRows[0] ?? contract;
}

export async function activateContractAfterFullSignature(contractId: string) {
  const rows = await sql`
    SELECT
      c.*,
      j.client_id,
      j.worker_id,
      j.budget,
      COALESCE(wp.skills[1], 'Skilled Professional') as worker_occupation,
      u_client.phone as client_phone,
      u_worker.phone as worker_phone,
      cp.full_name as client_name,
      cp.is_verified as client_verified,
      cp.fin_last4 as client_fin_last4,
      cp.verification_provider as client_verification_provider,
      cp.verification_reference as client_verification_reference,
      cp.verification_status as client_verification_status,
      cp.verified_at as client_verified_at,
      wp.full_name as worker_name,
      wp.is_verified as worker_verified,
      wp.fin_last4 as worker_fin_last4,
      wp.verification_provider as worker_verification_provider,
      wp.verification_reference as worker_verification_reference,
      wp.verification_status as worker_verification_status,
      wp.verified_at as worker_verified_at
    FROM contracts c
    JOIN jobs j ON c.job_id = j.id
    LEFT JOIN users u_client ON j.client_id = u_client.id
    LEFT JOIN users u_worker ON j.worker_id = u_worker.id
    LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
    LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
    WHERE c.id = ${contractId}
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new Error("Contract not found");
  }

  const contract = rows[0];
  if (contract.status !== "FULLY_SIGNED") {
    return contract;
  }

  const signatures = await sql`
    SELECT
      cs.*,
      COALESCE(cp.full_name, wp.full_name, u.email) as name
    FROM contract_signatures cs
    JOIN users u ON cs.user_id = u.id
    LEFT JOIN client_profiles cp ON cs.user_id = cp.user_id
    LEFT JOIN worker_profiles wp ON cs.user_id = wp.user_id
    WHERE cs.contract_id = ${contractId}
    ORDER BY cs.signed_at ASC
  `;

  if (signatures.length < 2) {
    return contract;
  }

  const signatureByRole = new Map<string, any>(signatures.map((signature: any) => [signature.role, signature]));
  const identityVerificationSnapshot = [
    {
      partyUserId: contract.client_id,
      role: "client",
      verifiedLegalName: contract.client_name,
      maskedFin: maskFinLast4(contract.client_fin_last4),
      verificationProvider: contract.client_verification_provider || "Fayda",
      verificationReference: contract.client_verification_reference || null,
      verificationStatus: contract.client_verification_status || (contract.client_verified ? "approved" : "incomplete"),
      verificationTimestamp: contract.client_verified_at || null,
      signingTimestamp: signatureByRole.get("client")?.signed_at || null,
    },
    {
      partyUserId: contract.worker_id,
      role: "worker",
      verifiedLegalName: contract.worker_name,
      maskedFin: maskFinLast4(contract.worker_fin_last4),
      verificationProvider: contract.worker_verification_provider || "Fayda",
      verificationReference: contract.worker_verification_reference || null,
      verificationStatus: contract.worker_verification_status || (contract.worker_verified ? "approved" : "pending"),
      verificationTimestamp: contract.worker_verified_at || null,
      signingTimestamp: signatureByRole.get("worker")?.signed_at || null,
    },
  ];
  const finalizedSnapshot = {
    ...(contract.finalized_snapshot && typeof contract.finalized_snapshot === "object" ? contract.finalized_snapshot : {}),
    identityVerificationSnapshot,
  };

  const canonicalPayload = JSON.stringify({
    contractId,
    finalizedSnapshot,
    signatures: signatures.map((signature: any) => ({
      userId: signature.user_id,
      role: signature.role,
      signedAt: signature.signed_at,
      consentConfirmed: signature.consent_confirmed,
    })),
  });
  const documentHash = crypto.createHash("sha256").update(canonicalPayload).digest("hex");
  const publicBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BASE_URL ||
    "http://localhost:3000";
  const verificationUrl = `${publicBaseUrl.replace(/\/$/, "")}/contracts/${contractId}?hash=${documentHash}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
  });

  const pdfBuffer = await buildContractPdfBuffer(contract, signatures, qrCodeDataUrl, documentHash);
  const pdfBase64 = pdfBuffer.toString("base64");
  const pdfUrl = `/api/contracts/${contractId}/pdf`;

  const updatedRows = await sql`
    UPDATE contracts
    SET
      status = 'ACTIVE',
      finalized_snapshot = ${JSON.stringify(finalizedSnapshot)},
      pdf_url = ${pdfUrl},
      final_pdf_base64 = ${pdfBase64},
      document_hash = ${documentHash},
      qr_code_data_url = ${qrCodeDataUrl},
      activated_at = NOW(),
      updated_at = NOW()
    WHERE id = ${contractId}
      AND status = 'FULLY_SIGNED'
    RETURNING *
  `;

  if (updatedRows.length === 0) {
    return contract;
  }

  await sql`
    UPDATE jobs
    SET status = 'active', updated_at = NOW()
    WHERE id = ${contract.job_id}
  `;

  await sql`
    INSERT INTO audit_logs (user_id, action, details)
    VALUES (${contract.client_id}, 'contract_pdf_generated', ${JSON.stringify({ contractId, documentHash })})
  `;

  await sql`
    INSERT INTO audit_logs (user_id, action, details)
    VALUES (${contract.client_id}, 'contract_activated', ${JSON.stringify({ contractId, jobId: contract.job_id })})
  `;

  await createContractNotification(
    contract.client_id,
    "Contract Activated",
    `The final PDF is ready and work for "${contract.job_title}" is now in progress.`,
    `/contracts/${contractId}`,
  );

  await createContractNotification(
    contract.worker_id,
    "Contract Activated",
    `The final PDF is ready and work for "${contract.job_title}" is now in progress.`,
    `/contracts/${contractId}`,
  );

  return updatedRows[0];
}
