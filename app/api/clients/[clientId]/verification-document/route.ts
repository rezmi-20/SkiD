import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { decodeClientIdentityDocument } from "@/lib/client-verification";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";
import { recordVerificationDocumentView } from "@/lib/verification-operations";

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const admin = await getAdminPrincipal();
  if (!admin) {
    return documentError("Unauthorized", 401);
  }

  const { clientId } = await params;
  const isAdmin = Boolean(admin && hasAdminPermission(admin, "verification.read"));

  if (!isAdmin) {
    return documentError("Forbidden", 403);
  }

  const rows = await sql`
    SELECT fayda_doc_url
    FROM client_profiles
    WHERE user_id = ${clientId}
    LIMIT 1
  `;
  const documentRef = rows[0]?.fayda_doc_url;
  const decoded = decodeClientIdentityDocument(documentRef);

  if (!decoded.ok) {
    return documentError("Verification document not available", 404);
  }

  if (isAdmin && admin) {
    await recordVerificationDocumentView("client", clientId, admin).catch(() => undefined);
  }

  return new NextResponse(decoded.bytes, {
    status: 200,
    headers: {
      "Content-Type": decoded.mimeType,
      ...DOCUMENT_HEADERS,
      "Content-Disposition": `inline; filename="client-verification-document.${decoded.mimeType === "application/pdf" ? "pdf" : "img"}"`,
    },
  });
}
