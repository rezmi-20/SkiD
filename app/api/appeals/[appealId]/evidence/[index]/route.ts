import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";
import { sql } from "@/lib/db";
import { fetchStoredUpload } from "@/lib/cloudinary-private";
import { isTrustedUploadReference } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ appealId: string; index: string }> },
) {
  const session = await auth();
  const admin = await getAdminPrincipal().catch(() => null);
  if (!session?.user?.id && !admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { appealId, index: rawIndex } = await params;
  const index = Number(rawIndex);
  if (!Number.isSafeInteger(index) || index < 0) return NextResponse.json({ error: "Evidence not found" }, { status: 404 });

  const rows = await sql`
    SELECT appellant_user_id, evidence_references
    FROM appeals
    WHERE id = ${appealId}
    LIMIT 1
  `;
  const appeal = rows[0];
  if (!appeal) return NextResponse.json({ error: "Evidence not found" }, { status: 404 });

  const isAppellant = session?.user?.id === appeal.appellant_user_id;
  const isAppealsAdmin = Boolean(admin && hasAdminPermission(admin, "appeals.read"));
  if (!isAppellant && !isAppealsAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const references = Array.isArray(appeal.evidence_references) ? appeal.evidence_references : [];
  const reference = references[index];
  if (typeof reference !== "string" || !isTrustedUploadReference(reference)) {
    return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
  }

  const upstream = await fetchStoredUpload(reference);
  if (!upstream.ok || !upstream.body) return NextResponse.json({ error: "Unable to load evidence" }, { status: 502 });
  const contentType = upstream.headers.get("content-type") || "application/octet-stream";
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'none'; sandbox; frame-ancestors 'self'",
    },
  });
}
