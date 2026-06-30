import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    console.log("SESSION:", JSON.stringify(session?.user?.email));

    if (!session?.user) {
      // Debug: Check if cookie exists but session is null
      const cookieStore = await cookies();
      const hasCookie = cookieStore.has("neon-auth.local.session_data");
      console.log("Has cookie but no session:", hasCookie);

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const rows = await sql`SELECT role FROM users WHERE id = ${userId}`;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      role: rows[0].role,
      emailVerified: session.user.emailVerified
    });

  } catch (error) {
    console.error("[AUTH_ME_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
