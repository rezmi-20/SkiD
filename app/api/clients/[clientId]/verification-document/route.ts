import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { decodeClientIdentityDocument } from "@/lib/client-verification";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;
  const isOwner = session.user.id === clientId;
  const isAdmin = session.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    return NextResponse.json({ error: "Verification document not available" }, { status: 404 });
  }

  if (isAdmin) {
    await sql`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (
        ${session.user.id},
        'client_verification_document_viewed',
        ${JSON.stringify({
          adminId: session.user.id,
          clientId,
          timestamp: new Date().toISOString(),
        })}
      )
    `;
  }

  return new NextResponse(decoded.bytes, {
    status: 200,
    headers: {
      "Content-Type": decoded.mimeType,
      "Cache-Control": "no-store, private",
      "Content-Disposition": `inline; filename="client-verification-document.${decoded.mimeType === "application/pdf" ? "pdf" : "img"}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

