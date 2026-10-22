import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { decodeClientIdentityDocument } from "@/lib/client-verification";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";
import { recordVerificationDocumentView } from "@/lib/verification-operations";
import { revealFaydaDocument } from "@/lib/fin-protection";

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const admin = await getAdminPrincipal();
  if (!admin) {
    return documentError("Unauthorized", 401);
  }

  const { clientId } = await params;
  if (admin.role !== "content_verification_admin" || !hasAdminPermission(admin, "verification.review")) {
    return documentError("Forbidden", 403);
  }

  const body = await req.json().catch(() => ({}));
  const expectedAttemptId = typeof body?.expectedAttemptId === "string" ? body.expectedAttemptId : "";
  if (!expectedAttemptId) return documentError("Verification attempt is required", 400);

  const rows = await sql`
    SELECT cp.fayda_doc_url, cp.verification_status, cp.is_verified, u.is_suspended
    FROM client_profiles cp
    JOIN users u ON u.id = cp.user_id
    WHERE cp.user_id = ${clientId}
    LIMIT 1
  `;
  const documentRef = typeof rows[0]?.fayda_doc_url === "string" ? rows[0].fayda_doc_url : "";
  if (!documentRef || rows[0]?.is_suspended || rows[0]?.is_verified || rows[0]?.verification_status !== "pending") {
    return documentError("Verification document not available", 404);
  }

  const attempts = await sql`
    SELECT id, status
    FROM verification_attempts
    WHERE account_user_id = ${clientId} AND account_type = 'client' AND is_current = true
    LIMIT 1
  `;
  if (!attempts[0] || String(attempts[0].id) !== expectedAttemptId || attempts[0].status !== "pending") {
    return documentError("This verification attempt is no longer active", 409);
  }

  let decodedRef: string;
  try {
    decodedRef = revealFaydaDocument(documentRef, clientId, "client");
  } catch {
    return documentError("Verification document could not be decrypted", 500);
  }
  const decoded = decodeClientIdentityDocument(decodedRef);
  if (!decoded.ok) {
    return documentError("Verification document not available", 404);
  }

  const claimed = await recordVerificationDocumentView("client", clientId, admin).catch(() => false);
  if (!claimed) return documentError("This Fayda document has already been revealed for this review", 409);

  return new NextResponse(decoded.bytes, {
    status: 200,
    headers: {
      "Content-Type": decoded.mimeType,
      ...DOCUMENT_HEADERS,
      "Content-Disposition": `inline; filename="client-verification-document.${decoded.mimeType === "application/pdf" ? "pdf" : "img"}"`,
    },
  });
}
