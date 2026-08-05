import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";
import { recordVerificationDocumentView } from "@/lib/verification-operations";
import { isTrustedUploadReference } from "@/lib/security";

export const dynamic = "force-dynamic";

function decodeDataDocument(value: string) {
  const match = value.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=\r\n]+)$/);
  if (!match) return null;
  return {
    mimeType: match[1].toLowerCase(),
    bytes: Buffer.from(match[2].replace(/\s/g, ""), "base64"),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const [session, admin] = await Promise.all([auth(), getAdminPrincipal()]);
  if (!session?.user?.id && !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workerId } = await params;
  const isOwner = session?.user?.id === workerId;
  const isAdmin = Boolean(admin && hasAdminPermission(admin, "verification.read"));
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await sql`
    SELECT fayda_doc_url
    FROM worker_profiles
    WHERE user_id = ${workerId}
    LIMIT 1
  `;
  const documentRef = typeof rows[0]?.fayda_doc_url === "string" ? rows[0].fayda_doc_url : "";
  if (!documentRef) {
    return NextResponse.json({ error: "Verification document not available" }, { status: 404 });
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
        "Cache-Control": "no-store, private",
        "Content-Disposition": `inline; filename="worker-verification-document.${dataDocument.mimeType === "application/pdf" ? "pdf" : "img"}`,
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      },
    });
  }

  if (!isTrustedUploadReference(documentRef, { allowDataImage: false })) {
    return NextResponse.json({ error: "Verification document not available" }, { status: 404 });
  }

  const upstream = await fetch(documentRef, { cache: "no-store" });
  if (!upstream.ok) {
    return NextResponse.json({ error: "Verification document not available" }, { status: 404 });
  }

  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  const bytes = await upstream.arrayBuffer();
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store, private",
      "Content-Disposition": `inline; filename="worker-verification-document.${contentType.includes("pdf") ? "pdf" : "img"}`,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}
