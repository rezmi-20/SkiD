import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const session = await auth();
  const admin = await getAdminPrincipal().catch(() => null);

  if (!session?.user?.id && !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ticketId } = await params;

  const ticketRows = await sql`
    SELECT id, owner_id, status FROM support_tickets WHERE id = ${ticketId} LIMIT 1
  `;
  const ticket = ticketRows[0];
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const isOwner = session?.user?.id === ticket.owner_id;
  const isSupportAdmin = Boolean(admin && hasAdminPermission(admin, "support.read"));

  if (!isOwner && !isSupportAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await sql`
    SELECT id, actor_type, message, created_at
    FROM support_messages
    WHERE ticket_id = ${ticketId}
    ORDER BY created_at ASC
  `;

  return NextResponse.json(
    {
      success: true,
      messages: messages || [],
      ticketStatus: ticket.status,
    },
    {
      headers: {
        "Cache-Control": "no-store, private",
      },
    },
  );
}
