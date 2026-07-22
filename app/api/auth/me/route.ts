import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAuthSessionUnavailableError } from "@/lib/auth/session-cookie";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const optional = req.nextUrl.searchParams.get("optional") === "1";
    const session = await auth();

    if (!session?.user) {
      if (optional) {
        return NextResponse.json({ authenticated: false }, { status: 200 });
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const rows = await sql`SELECT role FROM users WHERE id = ${userId}`;

    if (rows.length === 0) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: userId,
      email: session.user.email,
      name: session.user.name,
      role: rows[0].role,
      emailVerified: session.user.emailVerified
    });

  } catch (error) {
    if (isAuthSessionUnavailableError(error)) {
      return NextResponse.json(
        { error: "Authentication service temporarily unavailable" },
        { status: 503 }
      );
    }
    console.error("[AUTH_ME_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
