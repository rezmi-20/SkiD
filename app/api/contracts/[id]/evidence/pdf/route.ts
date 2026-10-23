import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { generateEvidencePdfBuffer } from "@/lib/evidence-pdf-generator";
import { recordAuditEvent } from "@/lib/audit-ledger";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { id: contractId } = await params;
    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get("recordId");

    // Verify contract access
    const contractRows = await sql`
      SELECT id, client_id, worker_id, status
      FROM contracts
      WHERE id = ${contractId}
      LIMIT 1
    `;

    if (contractRows.length === 0) {
      return NextResponse.json({ error: "Contract not found." }, { status: 404 });
    }

    const contract = contractRows[0];
    const isParticipant =
      contract.client_id === session.user.id || contract.worker_id === session.user.id;

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Access denied. You are not a participant in this contract." },
        { status: 403 },
      );
    }

    let recordRows: any[] = [];
    if (recordId) {
      recordRows = await sql`
        SELECT id, case_number, pdf_base64, evidence_manifest
        FROM court_evidence_records
        WHERE id = ${recordId} AND contract_id = ${contractId}
        LIMIT 1
      `;
    } else {
      recordRows = await sql`
        SELECT id, case_number, pdf_base64, evidence_manifest
        FROM court_evidence_records
        WHERE contract_id = ${contractId}
        ORDER BY created_at DESC
        LIMIT 1
      `;
    }

    if (recordRows.length === 0) {
      return NextResponse.json(
        { error: "No evidence dossier found. Please generate an evidence package first." },
        { status: 404 },
      );
    }

    const record = recordRows[0];
    let pdfBuffer: Buffer;

    if (record.pdf_base64) {
      pdfBuffer = Buffer.from(record.pdf_base64, "base64");
    } else if (record.evidence_manifest) {
      pdfBuffer = await generateEvidencePdfBuffer(record.evidence_manifest as any);
      await sql`
        UPDATE court_evidence_records
        SET pdf_base64 = ${pdfBuffer.toString("base64")}
        WHERE id = ${record.id}
      `;
    } else {
      return NextResponse.json({ error: "Evidence dossier contents missing." }, { status: 500 });
    }

    const safeCase = String(record.case_number || "evidence").replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `DireSkill-Evidence-Package-${safeCase}.pdf`;

    await recordAuditEvent({
      actorType: "user",
      userId: session.user.id,
      action: "participant_evidence_pdf_downloaded",
      module: "legal_compliance",
      targetType: "contract",
      targetId: contractId,
      details: {
        recordId: record.id,
        caseNumber: record.case_number,
      },
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
    console.error("[PARTICIPANT_PDF_DOWNLOAD_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Failed to download evidence package." },
      { status: 500 },
    );
  }
}
