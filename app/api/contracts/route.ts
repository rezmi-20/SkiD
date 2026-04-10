import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobId, terms } = await req.json();
    if (!jobId) return NextResponse.json({ error: "Job ID is required" }, { status: 400 });

    const rows = await sql`INSERT INTO contracts (job_id, terms) VALUES (${jobId}, ${terms ?? null}) RETURNING id`;

    return NextResponse.json({ message: "Contract created", contractId: rows[0].id }, { status: 201 });
  } catch (error) {
    console.error("[CONTRACT_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await sql`
      SELECT c.*, j.title as job_title
       FROM contracts c
       JOIN jobs j ON c.job_id = j.id
       WHERE j.client_id = ${session.user.id} OR j.worker_id = ${session.user.id}`;

    return NextResponse.json({ contracts: rows });
  } catch (error) {
    console.error("[CONTRACTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
