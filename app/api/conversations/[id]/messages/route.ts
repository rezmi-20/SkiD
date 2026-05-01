import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { filterContactInfo } from "@/lib/filterContactInfo";

// GET /api/conversations/[id]/messages
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const userId = session.user.id;

    // Verify user is part of this conversation
    const conv = await sql`
      SELECT id FROM conversations
      WHERE id = ${id} AND (client_id = ${userId} OR worker_id = ${userId})
    `;
    if (conv.length === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const messages = await sql`
      SELECT
        m.id, m.sender_id, m.body, m.image_url, m.created_at,
        COALESCE(wp.full_name, cp.full_name, u.email) AS sender_name,
        COALESCE(wp.avatar_url, cp.avatar_url) AS sender_avatar
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      LEFT JOIN worker_profiles wp ON wp.user_id = u.id
      LEFT JOIN client_profiles cp ON cp.user_id = u.id
      WHERE m.conversation_id = ${id}
      ORDER BY m.created_at ASC
    `;

    return NextResponse.json({ messages });
  } catch (err) {
    console.error("[MESSAGES_GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/conversations/[id]/messages
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const userId = session.user.id;

    // Verify user belongs to conversation
    const conv = await sql`
      SELECT id FROM conversations
      WHERE id = ${id} AND (client_id = ${userId} OR worker_id = ${userId})
    `;
    if (conv.length === 0) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { body, imageUrl } = await req.json();

    if (!body && !imageUrl) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    // Contact info filter (only on text body)
    if (body) {
      const check = filterContactInfo(body);
      if (check.blocked) {
        return NextResponse.json({ error: check.reason }, { status: 400 });
      }
    }

    const rows = await sql`
      INSERT INTO messages (conversation_id, sender_id, body, image_url)
      VALUES (${id}, ${userId}, ${body || null}, ${imageUrl || null})
      RETURNING id, sender_id, body, image_url, created_at
    `;

    return NextResponse.json({ message: rows[0] });
  } catch (err) {
    console.error("[MESSAGES_POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
