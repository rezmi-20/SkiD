import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticketId: string; attachmentId: string }> },
) {
  const session = await auth();
  const admin = await getAdminPrincipal().catch(() => null);
  if (!session?.user?.id && !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ticketId, attachmentId } = await params;
  const rows = await sql`
    SELECT
      a.file_url,
      a.mime_type,
      a.file_name,
      t.owner_id,
      t.assigned_admin_id
    FROM support_attachments a
    JOIN support_tickets t ON t.id = a.ticket_id
    WHERE a.id = ${attachmentId}
      AND a.ticket_id = ${ticketId}
      AND a.is_removed = false
    LIMIT 1
  `;
  const attachment = rows[0];
  if (!attachment) return NextResponse.json({ error: "Attachment not found" }, { status: 404 });

  const isOwner = session?.user?.id === attachment.owner_id;
  const isSupportAdmin = Boolean(admin && hasAdminPermission(admin, "support.read"));
  if (!isOwner && !isSupportAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const upstream = await fetch(attachment.file_url, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Unable to load attachment" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": attachment.mime_type || upstream.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `inline; filename="${String(attachment.file_name || "support-attachment").replace(/"/g, "")}"`,
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
