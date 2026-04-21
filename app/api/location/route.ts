import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lat, lng } = await req.json();
    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const userId = session.user.id;
    const role = session.user.role;

    if (role === "worker") {
      await sql`
        UPDATE worker_profiles 
        SET latitude = ${lat}, longitude = ${lng} 
        WHERE user_id = ${userId}
      `;
    } else if (role === "client") {
      await sql`
        UPDATE client_profiles 
        SET latitude = ${lat}, longitude = ${lng} 
        WHERE user_id = ${userId}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[LOCATION_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
