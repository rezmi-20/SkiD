import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";
import { ensureStoredContractPdf } from "@/lib/contract-documents";

export const dynamic = "force-dynamic";

function renderFriendlyUnauthorizedHtml(title: string, message: string, returnUrl = "/admin") {
  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} · DireSkill</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; box-sizing: border-box; }
    .card { max-width: 440px; width: 100%; background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 28px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #f59e0b; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px; }
    h1 { font-size: 18px; font-weight: 700; margin: 0 0 10px 0; color: #ffffff; }
    p { font-size: 13px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0; }
    .btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; padding: 10px 18px; background: #2563eb; color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 10px; transition: background 0.2s; box-sizing: border-box; }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">⚠️ Clearance Notice</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${returnUrl}" class="btn">Return to Administrator Portal</a>
  </div>
</body>
</html>`,
    {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const isHtml = _req.headers.get("accept")?.includes("text/html");
    const session = await auth();
    const admin = await getAdminPrincipal();

    if (!session?.user?.id && !admin) {
      const msg = "Authentication is required to access official contract documents. Please sign in to an authorized administrator or participant account.";
      if (isHtml) return renderFriendlyUnauthorizedHtml("Authentication Required", msg, "/admin/login");
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: msg,
        },
        { status: 401 }
      );
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
      const msg = "The requested contract agreement could not be located in the platform registry.";
      if (isHtml) return renderFriendlyUnauthorizedHtml("Contract Not Found", msg, "/admin/contracts");
      return NextResponse.json(
        {
          error: "Contract Not Found",
          message: msg,
        },
        { status: 404 }
      );
    }

    const contract = rows[0];
    const canRead =
      (admin && (admin.role === "super_admin" || hasAdminPermission(admin, "reports.read") || hasAdminPermission(admin, "disputes.read"))) ||
      (session?.user?.id && (session.user.id === contract.client_id || session.user.id === contract.worker_id));

    if (!canRead) {
      const msg = "Access restricted: Your administrator account does not possess 'reports.read' or 'disputes.read' clearance to export this contract PDF dossier.";
      if (isHtml) return renderFriendlyUnauthorizedHtml("Action Restricted · Clearance Required", msg, "/admin/contracts");
      return NextResponse.json(
        {
          error: "Forbidden",
          message: msg,
        },
        { status: 403 }
      );
    }

    if (!contract.final_pdf_base64) {
      const regenerated = await ensureStoredContractPdf(id, _req.nextUrl.origin);
      contract.final_pdf_base64 = regenerated.final_pdf_base64;
      contract.document_hash = regenerated.document_hash;
    }

    if (!contract.final_pdf_base64) {
      return NextResponse.json(
        {
          error: "Contract Incomplete",
          message: "This digital contract is currently awaiting completion of bilateral Fayda verification signatures. The certified PDF dossier is compiled automatically upon bilateral execution.",
        },
        { status: 400 }
      );
    }

    const pdfBuffer = Buffer.from(contract.final_pdf_base64, "base64");
    const body = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength) as ArrayBuffer;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="direskill-contract-${id}.pdf"`,
        "Cache-Control": "no-store",
        "X-Document-Hash": contract.document_hash || "",
      },
    });
  } catch (error) {
    console.error("[CONTRACT_PDF_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to load contract PDF" }, { status: 500 });
  }
}
