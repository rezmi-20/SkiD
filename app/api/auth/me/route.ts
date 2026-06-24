import { NextRequest, NextResponse } from "next/server";
import { auth as serverAuth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { writeLog } from "@/lib/diag-logger";

export async function GET(req: NextRequest) {
  try {
    const headers = new Headers(req.headers);
    const cookieStr = headers.get("cookie");
    if (cookieStr) {
      const rewrittenCookie = cookieStr
        .replace(/neon-auth\.session_token=/g, "__Secure-neon-auth.session_token=")
        .replace(/neon-auth\.session_data=/g, "__Secure-neon-auth.session_data=");
      headers.set("cookie", rewrittenCookie);
    }
    
    writeLog(`[/api/auth/me] Cookie header received: ${headers.get("cookie") || 'Missing'}`);
    
    const { data: session } = await serverAuth.getSession({
      fetchOptions: {
        headers: Object.fromEntries(headers.entries()),
      },
    });
    
    writeLog(`[/api/auth/me] Session extracted: ${session ? session.user.id : 'undefined'}`);
    
    if (!session) {
      writeLog(`[/api/auth/me] Unauthorized: no session found`);
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
