import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await sql`SELECT * FROM jobs WHERE id = ${id}`;
    if (rows.length === 0) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const job = rows[0];
    // Security check: Only involved parties or admin can see details
    if (session.user.role !== "admin" && job.client_id !== session.user.id && job.worker_id !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("[JOB_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { status } = await req.json();
    if (!status) return NextResponse.json({ error: "Status is required" }, { status: 400 });

    const jobs = await sql`SELECT * FROM jobs WHERE id = ${id}`;
    if (jobs.length === 0) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const job = jobs[0];

    // Basic permission logic
    if (session.user.role === "worker" && job.worker_id !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (session.user.role === "client" && job.client_id !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await sql`UPDATE jobs SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;

    return NextResponse.json({ message: "Job status updated" });
  } catch (error) {
    console.error("[JOB_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
