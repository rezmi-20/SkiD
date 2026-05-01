import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

// GET  /api/conversations — list all conversations for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;

    const rows = await sql`
      SELECT
        c.id,
        c.created_at,
        -- The "other" participant
        CASE WHEN c.client_id = ${userId} THEN c.worker_id ELSE c.client_id END AS other_id,
        ou.email AS other_email,
        COALESCE(wp.full_name, cp.full_name, ou.email) AS other_name,
        COALESCE(wp.avatar_url, cp.avatar_url) AS other_avatar,
        COALESCE(wp.skills[1], 'Professional') AS other_skill,
        wp.is_verified,
        -- Latest message
        lm.body AS last_body,
        lm.image_url AS last_image,
        lm.created_at AS last_at,
        lm.sender_id AS last_sender,
        -- Unread count (messages not sent by current user)
        COALESCE(unread.cnt, 0) AS unread
      FROM conversations c
      JOIN users ou ON ou.id = CASE WHEN c.client_id = ${userId} THEN c.worker_id ELSE c.client_id END
      LEFT JOIN worker_profiles wp ON wp.user_id = ou.id
      LEFT JOIN client_profiles cp ON cp.user_id = ou.id
      LEFT JOIN LATERAL (
        SELECT body, image_url, created_at, sender_id
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC LIMIT 1
      ) lm ON true
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt
        FROM messages
        WHERE conversation_id = c.id AND sender_id != ${userId}
      ) unread ON true
      WHERE c.client_id = ${userId} OR c.worker_id = ${userId}
      ORDER BY lm.created_at DESC NULLS LAST
    `;

    return NextResponse.json({ conversations: rows });
  } catch (err) {
    console.error("[CONVERSATIONS_GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/conversations — create or get existing conversation with a worker
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workerId } = await req.json();
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const clientId = session.user.id;

    // Upsert conversation (idempotent)
    const rows = await sql`
      INSERT INTO conversations (client_id, worker_id)
      VALUES (${clientId}, ${workerId})
      ON CONFLICT (client_id, worker_id) DO UPDATE SET client_id = EXCLUDED.client_id
      RETURNING id
    `;

    return NextResponse.json({ conversationId: rows[0].id });
  } catch (err) {
    console.error("[CONVERSATIONS_POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
