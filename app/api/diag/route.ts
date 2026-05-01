import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    const dbTest = await sql`SELECT 1 as connected`.catch(e => ({ error: e.message }));
    
    return NextResponse.json({
      status: "online",
      environment: process.env.NODE_ENV,
      database: dbTest,
      session: session ? { user: session.user.id, role: session.user.role } : "No session found",
      timestamp: new Date().toISOString(),
      version: "1.0.1"
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
