import crypto from "node:crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { sql } from "@/lib/db";
import { createNotification } from "@/lib/actions/notifications";

function formatDate(value: unknown) {
  if (!value) return "Not recorded";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(value: unknown) {
  if (!value) return "Not recorded";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleString();
}

function formatMoney(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not recorded";
  return `${Math.round(Number(value)).toLocaleString()} ETB`;
}

function maskFan(value: unknown) {
  const fan = String(value || "").trim();
  if (!fan) return "Not recorded";
  if (fan.length <= 6) return `${fan.slice(0, 2)}••${fan.slice(-2)}`;
  return `${fan.slice(0, 6)}••••••••${fan.slice(-2)}`;
}

function writeLabelValue(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number, width = 220) {
  doc.fillColor("#6b7280").fontSize(8).text(label.toUpperCase(), x, y, { width });
  doc.fillColor("#111827").fontSize(10).text(value || "Not recorded", x, y + 13, { width, lineGap: 2 });
}

function drawDireSkillSeal(doc: PDFKit.PDFDocument, x: number, y: number, size: number, opacity = 0.16) {
  doc.save();
  doc.opacity(opacity);
  doc.circle(x + size / 2, y + size / 2, size / 2).lineWidth(2).strokeColor("#047857").stroke();
  doc.circle(x + size / 2, y + size / 2, size / 2 - 10).lineWidth(1).strokeColor("#047857").stroke();
  doc.fillColor("#047857").fontSize(15).font("Helvetica-Bold").text("DIRESKILL", x, y + 28, { width: size, align: "center" });
  doc.fontSize(8).font("Helvetica").text("Digital Services", x, y + 48, { width: size, align: "center" });
  doc.fontSize(7).text("Official Company Seal", x, y + 62, { width: size, align: "center" });
  doc.text("Dire Dawa, Ethiopia", x, y + 76, { width: size, align: "center" });
  doc.font("Helvetica-Bold").text("EST. 2026", x, y + 90, { width: size, align: "center" });
  doc.restore();
}

async function buildContractPdfBuffer(contract: any, signatures: any[], qrDataUrl: string, documentHash: string) {
  const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const qrBase64 = qrDataUrl.split(",")[1] || "";
  const qrBuffer = Buffer.from(qrBase64, "base64");

  drawDireSkillSeal(doc, 398, 42, 108, 0.55);
  drawDireSkillSeal(doc, 170, 320, 250, 0.06);

  doc.fillColor("#065f46").fontSize(10).font("Helvetica-Bold").text("DIRESKILL DIGITAL CONTRACT", 48, 48);
  doc.fillColor("#111827").fontSize(24).font("Helvetica-Bold").text(contract.job_title || "Service Agreement", 48, 68, { width: 330 });
  doc.fillColor("#6b7280").fontSize(9).font("Helvetica").text(`Contract ID: ${contract.id}`, 48, 126);
  doc.text(`Created: ${formatDate(contract.created_at)} • Finalized: ${formatDate(contract.finalized_at)}`, 48, 141);
  doc.moveTo(48, 166).lineTo(547, 166).strokeColor("#e5e7eb").stroke();

  writeLabelValue(doc, "Client", contract.client_name || "Client", 48, 190);
  writeLabelValue(doc, "Client Identity", contract.client_verified ? "Verified Identity" : "Not verified", 48, 242);
  writeLabelValue(doc, "Client Fayda FAN", maskFan(contract.client_fan), 48, 294);
  writeLabelValue(doc, "Worker", contract.worker_name || "Worker", 315, 190);
  writeLabelValue(doc, "Worker Identity", contract.worker_verified ? "Verified Identity" : "Not verified", 315, 242);
  writeLabelValue(doc, "Worker Fayda FAN", maskFan(contract.worker_fan), 315, 294);

  doc.roundedRect(48, 354, 499, 144, 8).fillAndStroke("#f9fafb", "#e5e7eb");
  doc.fillColor("#111827").fontSize(13).font("Helvetica-Bold").text("Job Details", 68, 374);
  writeLabelValue(doc, "Work Location", contract.work_location || "Not recorded", 68, 402, 210);
  writeLabelValue(doc, "Estimated Completion", formatDate(contract.estimated_completion_date), 315, 402, 190);
  writeLabelValue(doc, "Payment Amount", formatMoney(contract.payment_amount ?? contract.budget), 68, 454, 210);
  writeLabelValue(doc, "Materials Responsibility", contract.materials_responsibility || "Not recorded", 315, 454, 190);

  doc.fillColor("#111827").fontSize(13).font("Helvetica-Bold").text("Scope of Work", 48, 526);
  doc.fillColor("#374151").fontSize(10).font("Helvetica").text(contract.job_description || "Not recorded", 48, 548, {
    width: 499,
    lineGap: 3,
  });

  doc.addPage();
  drawDireSkillSeal(doc, 170, 300, 250, 0.06);

  doc.fillColor("#111827").fontSize(13).font("Helvetica-Bold").text("Additional Notes", 48, 48);
  doc.fillColor("#374151").fontSize(10).font("Helvetica").text(contract.additional_notes || "None recorded.", 48, 70, {
    width: 499,
    lineGap: 3,
  });

  doc.fillColor("#111827").fontSize(13).font("Helvetica-Bold").text("Terms and Conditions", 48, 130);
  doc.fillColor("#374151").fontSize(10).font("Helvetica").text(
    "Work must begin only after both parties electronically sign this finalized agreement. Payment, communications, dispute handling, and completion records should remain inside DireSkill for safety and platform support.",
    48,
    152,
    { width: 499, lineGap: 3 },
  );

  doc.fillColor("#111827").fontSize(13).font("Helvetica-Bold").text("Declaration", 48, 224);
  const declarations = [
    "They have read this agreement.",
    "They understand its terms.",
    "They voluntarily entered this agreement.",
    "They electronically signed using their personal Contract PIN.",
  ];
  declarations.forEach((item, index) => {
    doc.fillColor("#047857").fontSize(10).text("✓", 56, 250 + index * 22);
    doc.fillColor("#374151").fontSize(10).text(item, 76, 250 + index * 22);
  });

  doc.fillColor("#111827").fontSize(13).font("Helvetica-Bold").text("Electronic Signatures", 48, 360);
  signatures.forEach((signature, index) => {
    const x = index === 0 ? 48 : 315;
    doc.roundedRect(x, 386, 220, 82, 8).strokeColor("#d1d5db").stroke();
    doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text(signature.role === "client" ? "Client Signature" : "Worker Signature", x + 14, 402);
    doc.fillColor("#374151").fontSize(10).font("Helvetica").text(signature.name || signature.user_id, x + 14, 424, { width: 190 });
    doc.fillColor("#6b7280").fontSize(8).text(formatDateTime(signature.signed_at), x + 14, 446, { width: 190 });
  });

  doc.image(qrBuffer, 48, 520, { width: 92, height: 92 });
  writeLabelValue(doc, "QR Code", "Scan to verify contract details in DireSkill.", 156, 526, 260);
  writeLabelValue(doc, "SHA-256 Document Hash", documentHash, 156, 578, 360);

  doc.fillColor("#6b7280").fontSize(8).text(
    "Legal Notice: This PDF is generated by DireSkill as evidence of a finalized and electronically signed digital service agreement. It is not a government-issued certificate.",
    48,
    730,
    { width: 499, align: "center" },
  );

  doc.end();
  return done;
}

export async function activateContractAfterFullSignature(contractId: string) {
  const rows = await sql`
    SELECT
      c.*,
      j.client_id,
      j.worker_id,
      j.budget,
      cp.full_name as client_name,
      cp.is_verified as client_verified,
      NULL::text as client_fan,
      wp.full_name as worker_name,
      wp.is_verified as worker_verified,
      NULL::text as worker_fan
    FROM contracts c
    JOIN jobs j ON c.job_id = j.id
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

  const canonicalPayload = JSON.stringify({
    contractId,
    finalizedSnapshot: contract.finalized_snapshot,
    signatures: signatures.map((signature: any) => ({
      userId: signature.user_id,
      role: signature.role,
      signedAt: signature.signed_at,
      consentConfirmed: signature.consent_confirmed,
    })),
  });
  const documentHash = crypto.createHash("sha256").update(canonicalPayload).digest("hex");
  const publicBaseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL;
  if (!publicBaseUrl) {
    throw new Error("Public application URL is not configured.");
  }
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

  await createNotification({
    userId: contract.client_id,
    type: "contract_signed",
    title: "Contract Activated",
    body: `The final PDF is ready and work for "${contract.job_title}" is now in progress.`,
    linkHref: `/contracts/${contractId}`,
  });

  await createNotification({
    userId: contract.worker_id,
    type: "contract_signed",
    title: "Contract Activated",
    body: `The final PDF is ready and work for "${contract.job_title}" is now in progress.`,
    linkHref: `/contracts/${contractId}`,
  });

  return updatedRows[0];
}
