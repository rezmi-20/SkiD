import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";
import { detectFileType } from "@/lib/file-signatures";

export const dynamic = "force-dynamic";

const PRIVATE_DOCUMENT_HEADERS = {
  "Cache-Control": "private, no-store",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'self'",
  "X-Frame-Options": "SAMEORIGIN",
};

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: PRIVATE_DOCUMENT_HEADERS });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; certificateId: string }> },
) {
  const admin = await getAdminPrincipal();
  if (!admin) return fail("Unauthorized", 401);
  if (!hasAdminPermission(admin, "verification.read")) return fail("Forbidden", 403);

  const { id: workerId, certificateId } = await params;
  const rows = await sql`
    SELECT file_name, mime_type, document_data_url
    FROM worker_training_certificates
    WHERE worker_user_id = ${workerId} AND id = ${certificateId}
    LIMIT 1
  `;
  const certificate = rows[0];
  if (!certificate) return fail("Certificate not available", 404);

  const expectedMime = String(certificate.mime_type || "").toLowerCase();
  const match = String(certificate.document_data_url || "").match(/^data:([^;,]+);base64,([A-Za-z0-9+/=\r\n]+)$/);
  const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
  if (!match || match[1].toLowerCase() !== expectedMime || !allowedTypes.has(expectedMime)) {
    return fail("Unsupported certificate format", 415);
  }

  const bytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!bytes.length || bytes.length > 1024 * 1024) return fail("Invalid certificate", 415);
  if (detectFileType(bytes) !== expectedMime) return fail("Invalid certificate content", 415);
  const safeName = String(certificate.file_name || "certificate").replace(/["\\\r\n]/g, "_");
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      ...PRIVATE_DOCUMENT_HEADERS,
      "Content-Type": expectedMime,
      "Content-Disposition": `inline; filename="${safeName}"`,
    },
  });
}
