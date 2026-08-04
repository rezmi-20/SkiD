import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const rows = await sql`
      SELECT
        c.id,
        c.final_pdf_base64,
        c.document_hash,
        j.client_id,
        j.worker_id
      FROM contracts c
      JOIN jobs j ON c.job_id = j.id
      WHERE c.id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Contract PDF not found" }, { status: 404 });
    }

    const contract = rows[0];
    const admin = session.user.role === "admin" ? await getAdminPrincipal() : null;
    const canRead =
      hasAdminPermission(admin, "reports.read") ||
      session.user.id === contract.client_id ||
      session.user.id === contract.worker_id;

    if (!canRead) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!contract.final_pdf_base64) {
      return NextResponse.json({ error: "Final PDF has not been generated yet" }, { status: 404 });
    }

    const pdfBuffer = Buffer.from(contract.final_pdf_base64, "base64");
    const body = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength) as ArrayBuffer;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="direskill-contract-${id}.pdf"`,
        "Cache-Control": "no-store",
        "X-Document-Hash": contract.document_hash || "",
      },
    });
  } catch (error) {
    console.error("[CONTRACT_PDF_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to load contract PDF" }, { status: 500 });
  }
}
