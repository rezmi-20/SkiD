import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workerId, isVerified } = await req.json();

    if (!workerId) {
      return NextResponse.json({ error: "Worker ID is required" }, { status: 400 });
    }

    await sql`UPDATE worker_profiles SET is_verified = ${isVerified ?? true} WHERE user_id = ${workerId}`;

    return NextResponse.json({ message: "Worker verification status updated" });
  } catch (error) {
    console.error("[WORKER_VERIFY_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
