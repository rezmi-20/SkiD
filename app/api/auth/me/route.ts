import { NextRequest, NextResponse } from "next/server";
import { auth as serverAuth } from "@/lib/auth/server";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Neon Auth reads cookies from next/headers automatically in server context
    const { data: session } = await serverAuth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await sql`SELECT role FROM users WHERE id = ${session.user.id}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      role: rows[0].role,
      emailVerified: session.user.emailVerified 
    }, { status: 200 });
  } catch (error) {
    console.error("[AUTH_ME_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
