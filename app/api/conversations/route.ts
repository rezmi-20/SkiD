import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

// GET /api/conversations
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    // Fetch conversations with the OTHER person's info
    const conversations = await sql`
      SELECT 
        c.id,
        c.created_at,
        CASE 
          WHEN c.client_id = ${userId} THEN c.worker_id
          ELSE c.client_id
        END as other_user_id,
        COALESCE(wp.full_name, cp.full_name, u.email) as other_name,
        COALESCE(wp.avatar_url, cp.avatar_url) as other_avatar,
        (SELECT body FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_body,
        (SELECT image_url FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_image,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_at
      FROM conversations c
      JOIN users u ON u.id = (CASE WHEN c.client_id = ${userId} THEN c.worker_id ELSE c.client_id END)
      LEFT JOIN worker_profiles wp ON wp.user_id = u.id
      LEFT JOIN client_profiles cp ON cp.user_id = u.id
      WHERE c.client_id = ${userId} OR c.worker_id = ${userId}
      ORDER BY last_at DESC NULLS LAST
    `;

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("[CONVERSATIONS_GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/conversations
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workerId } = await req.json();
    if (!workerId) return NextResponse.json({ error: "Worker ID required" }, { status: 400 });

    const clientId = session.user.id;

    // Prevent chatting with self
    if (clientId === workerId) {
      return NextResponse.json({ error: "You cannot message yourself" }, { status: 400 });
    }

    // Check if conversation already exists
    const existing = await sql`
      SELECT id FROM conversations 
      WHERE (client_id = ${clientId} AND worker_id = ${workerId})
         OR (client_id = ${workerId} AND worker_id = ${clientId})
    `;

    if (existing.length > 0) {
      return NextResponse.json({ 
        conversation: existing[0],
        conversationId: existing[0].id 
      });
    }

    // Create new
    const rows = await sql`
      INSERT INTO conversations (client_id, worker_id)
      VALUES (${clientId}, ${workerId})
      RETURNING id
    `;

    return NextResponse.json({ 
      conversation: rows[0],
      conversationId: rows[0].id 
    });
  } catch (err) {
    console.error("[CONVERSATIONS_POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
