import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "worker") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await sql`
      SELECT availability, latitude, longitude
      FROM worker_profiles
      WHERE user_id = ${session.user.id}
      LIMIT 1
    `;

    return NextResponse.json({
      availability: rows[0]?.availability || "available",
      latitude: rows[0]?.latitude,
      longitude: rows[0]?.longitude,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "worker") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { availability, reason, latitude, longitude } = body;

    const newStatus = availability === "offline" ? "offline" : "available";

    // Update worker profile
    const updateResult = await sql`
      UPDATE worker_profiles
      SET 
        availability = ${newStatus},
        latitude = COALESCE(${latitude ? Number(latitude) : null}, latitude, 9.5931),
        longitude = COALESCE(${longitude ? Number(longitude) : null}, longitude, 41.8661)
      WHERE user_id = ${session.user.id}
      RETURNING id, availability, latitude, longitude;
    `;

    // Attempt to log availability status change for admin audit
    try {
      await sql`
        INSERT INTO availability_audit_logs (worker_id, user_id, status, reason, created_at)
        VALUES (
          ${updateResult[0]?.id},
          ${session.user.id},
          ${newStatus},
          ${reason || (newStatus === "offline" ? "Manual break / emergency" : "Back online")},
          NOW()
        )
      `;
    } catch {
      // If table does not exist yet, we don't block the availability toggle
    }

    return NextResponse.json({
      success: true,
      availability: newStatus,
      worker: updateResult[0],
    });
  } catch (err: any) {
    console.error("Availability update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
