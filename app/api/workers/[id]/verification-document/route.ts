import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";
import { recordVerificationDocumentView } from "@/lib/verification-operations";
import { isTrustedUploadReference } from "@/lib/security";

export const dynamic = "force-dynamic";

const DOCUMENT_HEADERS = {
  "Cache-Control": "private, no-store",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'self'",
  "X-Frame-Options": "SAMEORIGIN",
};

function documentError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: DOCUMENT_HEADERS });
}

function decodeDataDocument(value: string) {
  const match = value.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=\r\n]+)$/);
  if (!match) return null;
  const mimeType = match[1].toLowerCase();
  if (!mimeType.startsWith("image/") && mimeType !== "application/pdf") return null;
  return {
    mimeType,
    bytes: Buffer.from(match[2].replace(/\s/g, ""), "base64"),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminPrincipal();
  if (!admin) {
    return documentError("Unauthorized", 401);
  }

  const { id: workerId } = await params;
  const isAdmin = Boolean(admin && hasAdminPermission(admin, "verification.read"));
  if (!isAdmin) {
    return documentError("Forbidden", 403);
  }

  const rows = await sql`
    SELECT fayda_doc_url
    FROM worker_profiles
    WHERE user_id = ${workerId}
    LIMIT 1
  `;
  const documentRef = typeof rows[0]?.fayda_doc_url === "string" ? rows[0].fayda_doc_url : "";
  if (!documentRef) {
    return documentError("Verification document not available", 404);
  }

  if (isAdmin && admin) {
    await recordVerificationDocumentView("worker", workerId, admin).catch(() => undefined);
  }

  const dataDocument = decodeDataDocument(documentRef);
  if (dataDocument) {
    return new NextResponse(dataDocument.bytes, {
      status: 200,
      headers: {
        "Content-Type": dataDocument.mimeType,
        ...DOCUMENT_HEADERS,
        "Content-Disposition": `inline; filename="worker-verification-document.${dataDocument.mimeType === "application/pdf" ? "pdf" : "img"}`,
      },
    });
  }

  if (!isTrustedUploadReference(documentRef, { allowDataImage: false })) {
    return documentError("Verification document not available", 404);
  }

  const upstream = await fetch(documentRef, { cache: "no-store" });
  if (!upstream.ok) {
    return documentError("Verification document not available", 404);
  }

  const contentType = (upstream.headers.get("content-type") || "application/octet-stream").toLowerCase();
  if (!contentType.startsWith("image/") && !contentType.includes("pdf")) {
    return documentError("Unsupported document type", 415);
  }
  const bytes = await upstream.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      ...DOCUMENT_HEADERS,
      "Content-Disposition": `inline; filename="worker-verification-document.${contentType.includes("pdf") ? "pdf" : "img"}`,
    },
  });
}
