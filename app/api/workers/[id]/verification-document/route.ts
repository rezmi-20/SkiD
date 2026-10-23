import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";
import { recordVerificationDocumentView } from "@/lib/verification-operations";
import { revealFaydaDocument } from "@/lib/fin-protection";
import { isTrustedUploadReference } from "@/lib/security";
import { decodeClientIdentityDocument } from "@/lib/client-verification";
import { detectFileType } from "@/lib/file-signatures";

export const dynamic = "force-dynamic";

const DOCUMENT_HEADERS = {
  "Cache-Control": "private, no-store",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'self'",
  "X-Frame-Options": "SAMEORIGIN",
};
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

async function readBoundedBody(response: Response, maxBytes: number) {
  if (!response.body) return null;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

function documentError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: DOCUMENT_HEADERS });
}

function decodeDataDocument(value: string) {
  const decoded = decodeClientIdentityDocument(value);
  return decoded.ok ? decoded : null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminPrincipal();
  if (!admin) {
    return documentError("Unauthorized", 401);
  }

  const { id: workerId } = await params;
  if (admin.role !== "content_verification_admin" || !hasAdminPermission(admin, "verification.review")) {
    return documentError("Forbidden", 403);
  }

  const body = await req.json().catch(() => ({}));
  const expectedAttemptId = typeof body?.expectedAttemptId === "string" ? body.expectedAttemptId : "";
  if (!expectedAttemptId) return documentError("Verification attempt is required", 400);

  const rows = await sql`
    SELECT wp.fayda_doc_url, wp.verification_status, wp.is_verified, u.is_suspended
    FROM worker_profiles wp
    JOIN users u ON u.id = wp.user_id
    WHERE wp.user_id = ${workerId}
    LIMIT 1
  `;
  const documentRef = typeof rows[0]?.fayda_doc_url === "string" ? rows[0].fayda_doc_url : "";
  if (!documentRef || rows[0]?.is_suspended || rows[0]?.is_verified || rows[0]?.verification_status !== "pending") {
    return documentError("Verification document not available", 404);
  }

  const attempts = await sql`
    SELECT id, status, is_current
    FROM verification_attempts
    WHERE account_user_id = ${workerId} AND account_type = 'worker' AND is_current = true
    LIMIT 1
  `;
  if (!attempts[0] || String(attempts[0].id) !== expectedAttemptId || attempts[0].status !== "pending") {
    return documentError("This verification attempt is no longer active", 409);
  }
  let decodedRef: string;
  try {
    decodedRef = revealFaydaDocument(documentRef, workerId, "worker");
  } catch {
    return documentError("Verification document could not be decrypted", 500);
  }
  const dataDocument = decodeDataDocument(decodedRef);
  if (dataDocument) {
    const claimed = await recordVerificationDocumentView("worker", workerId, admin).catch(() => false);
    if (!claimed) return documentError("This Fayda document has already been revealed for this review", 409);
    return new NextResponse(dataDocument.bytes, {
      status: 200,
      headers: {
        "Content-Type": dataDocument.mimeType,
        ...DOCUMENT_HEADERS,
        "Content-Disposition": `inline; filename="worker-verification-document.${dataDocument.mimeType === "application/pdf" ? "pdf" : "img"}`,
      },
    });
  }

  if (!isTrustedUploadReference(decodedRef, { allowDataImage: false })) {
    return documentError("Verification document not available", 404);
  }

  const upstream = await fetch(decodedRef, { cache: "no-store" });
  if (!upstream.ok) {
    return documentError("Verification document not available", 404);
  }

  const contentType = (upstream.headers.get("content-type") || "application/octet-stream").split(";")[0].trim().toLowerCase();
  const declaredDocumentType = ["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(contentType);
  const contentLength = Number(upstream.headers.get("content-length") || 0);
  if (!declaredDocumentType || (contentLength > 0 && contentLength > MAX_DOCUMENT_BYTES)) {
    return documentError("Unsupported document type", 415);
  }
  const bytes = await readBoundedBody(upstream, MAX_DOCUMENT_BYTES);
  if (!bytes?.length || detectFileType(bytes) !== contentType) {
    return documentError("Verification document content is invalid or too large", 415);
  }
  const claimed = await recordVerificationDocumentView("worker", workerId, admin).catch(() => false);
  if (!claimed) return documentError("This Fayda document has already been revealed for this review", 409);
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      ...DOCUMENT_HEADERS,
      "Content-Disposition": `inline; filename="worker-verification-document.${contentType === "application/pdf" ? "pdf" : "img"}`,
    },
  });
}
