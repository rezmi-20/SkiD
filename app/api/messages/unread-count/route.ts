import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

// GET /api/messages/unread-count
// Returns total count of unread messages across all active conversations for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 });
    }

    const userId = session.user.id;

    const rows = await sql`
      SELECT COUNT(*)::int AS count
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE (c.client_id = ${userId} OR c.worker_id = ${userId})
        AND m.sender_id != ${userId}
        AND m.is_read = FALSE
    `;

    const count = Number(rows[0]?.count || 0);
    return NextResponse.json({ count }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[MESSAGES_UNREAD_COUNT]", err);
    return NextResponse.json({ count: 0 });
  }
}
