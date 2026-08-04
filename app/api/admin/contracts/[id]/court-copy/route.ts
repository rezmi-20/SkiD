import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { decryptFin, maskFinLast4 } from "@/lib/fin-protection";
import { AdminAuthorizationError, requireAdmin } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

function allowedLegalExportAdmin(userId: string) {
  const configured = process.env.LEGAL_DOCUMENT_EXPORT_ADMIN_IDS || "";
  const allowed = configured.split(",").map((entry) => entry.trim()).filter(Boolean);
  return allowed.includes("*") || allowed.includes(userId);
}

function courtCopyFeatureEnabled() {
  return process.env.COURT_COPY_EXPORT_ENABLED === "true";
}

async function hasTrustedReauthEvidence(adminId: string, challengeId: unknown) {
  if (typeof challengeId !== "string" || !challengeId.trim()) return false;

  const rows = await sql`
    SELECT id
    FROM legal_reauth_challenges
    WHERE id = ${challengeId.trim()}
      AND user_id = ${adminId}
      AND purpose = 'court_copy_export'
      AND consumed_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
  `;
  return rows.length > 0;
}

async function audit(userId: string | null, action: string, details: Record<string, unknown>, req: NextRequest) {
  await sql`
    INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
    VALUES (
      ${userId},
      ${action},
      ${JSON.stringify(details)},
      ${req.headers.get("x-forwarded-for") || null},
      ${req.headers.get("user-agent") || null}
    )
  `;
}

async function buildCourtCopyPdf(contract: any, clientFin: string, workerFin: string, request: any) {
  const doc = new PDFDocument({ size: "A4", margin: 56 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fillColor("#991b1b").fontSize(18).text("CONFIDENTIAL - COURT/AUTHORIZED DISCLOSURE COPY");
  doc.moveDown(0.4);
  doc.fillColor("#374151").fontSize(10).text("Contains full Fayda Identification Numbers. Do not distribute outside the authorized legal request.");
  doc.moveDown(1.2);

  doc.fillColor("#111827").fontSize(20).text(contract.job_title || "DireSkill Contract");
  doc.moveDown(0.8);
  doc.fillColor("#6b7280").fontSize(9).text(`Contract ID: ${contract.contract_id}`);
  doc.text(`Job ID: ${contract.job_id}`);
  doc.text(`Export reason: ${request.reason}`);
  doc.text(`Requesting authority: ${request.requestingAuthority}`);
  doc.text(`Case/reference: ${request.caseReference}`);
  doc.moveDown(1.2);

  doc.fillColor("#111827").fontSize(13).text("Identity Disclosure");
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Client: ${contract.client_name || "Client"}`);
  doc.text(`Client FIN: ${clientFin}`);
  doc.text(`Client verification: ${contract.client_verification_status || "Not recorded"}`);
  doc.moveDown(0.5);
  doc.text(`Worker: ${contract.worker_name || "Worker"}`);
  doc.text(`Worker FIN: ${workerFin}`);
  doc.text(`Worker verification: ${contract.worker_verification_status || "Not recorded"}`);
  doc.moveDown(1.2);

  doc.fillColor("#111827").fontSize(13).text("Masked Normal-Use Reference");
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Client masked FIN: ${maskFinLast4(contract.client_fin_last4) || "Not recorded"}`);
  doc.text(`Worker masked FIN: ${maskFinLast4(contract.worker_fin_last4) || "Not recorded"}`);
  doc.moveDown(1.2);

  doc.fillColor("#6b7280").fontSize(9).text(
    "Audit note: this export is restricted to admins listed in LEGAL_DOCUMENT_EXPORT_ADMIN_IDS with recent re-authentication confirmation.",
    { align: "left" },
  );

  doc.end();
  return done;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<unknown> },
) {
  const session = await auth();
  const adminId = session?.user?.id || null;
  const { id: contractId } = (await params) as { id: string };

  try {
    if (!courtCopyFeatureEnabled()) {
      await audit(adminId, "court_copy_denied", { contractId, reason: "feature_disabled" }, req);
      return NextResponse.json({ error: "Court copy export is temporarily disabled." }, { status: 503 });
    }

    const admin = await requireAdmin();
    if (!session?.user?.id || admin.id !== session.user.id) {
      await audit(adminId, "court_copy_denied", { contractId, reason: "not_admin" }, req);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!allowedLegalExportAdmin(admin.id)) {
      await audit(admin.id, "court_copy_denied", { contractId, reason: "missing_legal_export_permission" }, req);
      return NextResponse.json({ error: "Legal document export permission is required." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const reauthConfirmed = await hasTrustedReauthEvidence(admin.id, body.reauthChallengeId);
    if (!reauthConfirmed) {
      await audit(admin.id, "court_copy_denied", { contractId, reason: "reauth_required" }, req);
      return NextResponse.json({ error: "Recent admin re-authentication is required." }, { status: 403 });
    }

    const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : "";
    const requestingAuthority = typeof body.requestingAuthority === "string" ? body.requestingAuthority.trim().slice(0, 200) : "";
    const caseReference = typeof body.caseReference === "string" ? body.caseReference.trim().slice(0, 200) : "";

    if (!body.authorizationConfirmed || !reason || !requestingAuthority || !caseReference) {
      await audit(admin.id, "court_copy_denied", { contractId, reason: "missing_legal_request_context" }, req);
      return NextResponse.json(
        { error: "Court/legal export requires authority, case reference, reason, and confirmation." },
        { status: 400 },
      );
    }

    const rows = await sql`
      SELECT
        c.id as contract_id,
        c.job_id,
        c.status as contract_status,
        j.title as job_title,
        j.client_id,
        j.worker_id,
        cp.full_name as client_name,
        cp.fin_encrypted as client_fin_encrypted,
        cp.fin_encryption_key_id as client_fin_encryption_key_id,
        cp.fin_last4 as client_fin_last4,
        cp.verification_status as client_verification_status,
        wp.full_name as worker_name,
        wp.fin_encrypted as worker_fin_encrypted,
        wp.fin_encryption_key_id as worker_fin_encryption_key_id,
        wp.fin_last4 as worker_fin_last4,
        wp.verification_status as worker_verification_status
      FROM contracts c
      JOIN jobs j ON c.job_id = j.id
      JOIN client_profiles cp ON j.client_id = cp.user_id
      JOIN worker_profiles wp ON j.worker_id = wp.user_id
      WHERE c.id = ${contractId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      await audit(admin.id, "court_copy_denied", { contractId, reason: "not_found" }, req);
      return NextResponse.json({ error: "Contract not found" }, { status: 404 });
    }

    const contract = rows[0];
    if (!contract.client_fin_encrypted || !contract.client_fin_encryption_key_id || !contract.worker_fin_encrypted || !contract.worker_fin_encryption_key_id) {
      await audit(admin.id, "court_copy_denied", { contractId, reason: "missing_protected_fin" }, req);
      return NextResponse.json({ error: "Protected identity data is incomplete." }, { status: 409 });
    }

    const clientFin = decryptFin({
      finEncrypted: contract.client_fin_encrypted,
      finEncryptionKeyId: contract.client_fin_encryption_key_id,
      userId: contract.client_id,
      scope: "profile",
    });
    const workerFin = decryptFin({
      finEncrypted: contract.worker_fin_encrypted,
      finEncryptionKeyId: contract.worker_fin_encryption_key_id,
      userId: contract.worker_id,
      scope: "profile",
    });

    const pdf = await buildCourtCopyPdf(contract, clientFin, workerFin, { reason, requestingAuthority, caseReference });
    const documentHash = crypto.createHash("sha256").update(pdf).digest("hex");

    await audit(admin.id, "court_copy_exported", {
      contractId,
      jobId: contract.job_id,
      caseReference,
      requestingAuthority,
      reason,
      documentHash,
    }, req);

    const responseBody = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer;
    return new NextResponse(responseBody, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="direskill-court-copy-${contractId}.pdf"`,
        "Cache-Control": "no-store, private",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      await audit(adminId, "court_copy_denied", { contractId, reason: "admin_authorization_failed" }, req).catch(() => undefined);
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[COURT_COPY_EXPORT_ERROR]", error instanceof Error ? error.message : "Unknown error");
    if (adminId) {
      await audit(adminId, "court_copy_failed", { contractId }, req).catch(() => undefined);
    }
    return NextResponse.json({ error: "Failed to export court copy." }, { status: 500 });
  }
}
