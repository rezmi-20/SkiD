import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { fetchStoredUpload } from "@/lib/cloudinary-private";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, messageId } = await params;
  const rows = await sql`
    SELECT m.image_url, m.media_type
    FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.id = ${messageId}
      AND m.conversation_id = ${id}
      AND (c.client_id = ${session.user.id} OR c.worker_id = ${session.user.id})
      AND m.image_url IS NOT NULL
    LIMIT 1
  `;
  if (!rows[0]) return NextResponse.json({ error: "Attachment not found" }, { status: 404 });

  const upstream = await fetchStoredUpload(rows[0].image_url);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Unable to load attachment" }, { status: 502 });
  }

  const contentType = rows[0].media_type === "video"
    ? upstream.headers.get("content-type") || "video/mp4"
    : upstream.headers.get("content-type") || "application/octet-stream";
  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}
