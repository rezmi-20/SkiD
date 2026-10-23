import { NextRequest, NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-authorization";
import { sql } from "@/lib/db";
import { generateEvidencePdfBuffer } from "@/lib/evidence-pdf-generator";
import { recordAuditEvent } from "@/lib/audit-ledger";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ recordId: string }> },
) {
  try {
    const admin = await requireAdminRole("super_admin");
    const { recordId } = await params;

    const rows = await sql`
      SELECT id, case_number, contract_id, pdf_base64, evidence_manifest
      FROM court_evidence_records
      WHERE id = ${recordId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Court evidence record not found." }, { status: 404 });
    }

    const record = rows[0];
    let pdfBuffer: Buffer;

    if (record.pdf_base64) {
      pdfBuffer = Buffer.from(record.pdf_base64, "base64");
    } else if (record.evidence_manifest) {
      pdfBuffer = await generateEvidencePdfBuffer(record.evidence_manifest as any);
      // Cache base64 back into database
      await sql`
        UPDATE court_evidence_records
        SET pdf_base64 = ${pdfBuffer.toString("base64")}
        WHERE id = ${recordId}
      `;
    } else {
      return NextResponse.json({ error: "Evidence manifest data missing." }, { status: 500 });
    }

    const safeCase = String(record.case_number || "evidence").replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `DireSkill-Court-Evidence-${safeCase}.pdf`;

    // Audit log evidence package export
    await recordAuditEvent({
      actorType: "admin_employee",
      adminEmployeeId: admin.id,
      adminRole: admin.role,
      action: "court_evidence_pdf_downloaded",
      module: "legal_compliance",
      targetType: "court_evidence_record",
      targetId: recordId,
      highRisk: true,
      reason: `Super admin downloaded certified PDF for case ${record.case_number}`,
    });

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("[COURT_EVIDENCE_PDF_DOWNLOAD_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate or download court evidence PDF." },
      { status: 403 },
    );
  }
}
