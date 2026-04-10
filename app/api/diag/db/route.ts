import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    env: {
      has_db_url: !!process.env.DATABASE_URL,
      db_url_prefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) + "..." : "missing",
    },
    connection: "pending"
  };

  try {
    if (!process.env.DATABASE_URL) {
      diagnostics.connection = "failed_missing_env";
      return NextResponse.json(diagnostics, { status: 400 });
    }

    // Attempt a basic query
    const result = await sql`SELECT NOW() as now`;
    diagnostics.connection = "success";
    diagnostics.db_time = result[0].now;
    
    return NextResponse.json(diagnostics);
  } catch (error: any) {
    diagnostics.connection = "failed_exception";
    diagnostics.error = {
      message: error.message,
      code: error.code,
    };
    return NextResponse.json(diagnostics, { status: 500 });
  }
}
