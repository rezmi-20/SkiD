import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAuthSessionUnavailableError } from "@/lib/auth/session-cookie";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ${session.user.id} AND is_read = false
    `;

    return NextResponse.json({ count: Number(rows[0]?.count ?? 0) });
  } catch (error) {
    if (isAuthSessionUnavailableError(error)) {
      return NextResponse.json(
        { error: "Authentication service temporarily unavailable" },
        { status: 503 }
      );
    }

    console.error("[UNREAD_COUNT_ERROR]", error);
    return NextResponse.json(
      { error: "Unable to load notifications" },
      { status: 500 }
    );
  }
}
