import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ensureContractSetupComplete } from "@/lib/actions/contract-setup";

const CONTRACT_CREATABLE_JOB_STATUSES = new Set(["accepted"]);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.user.role !== "client") {
      return NextResponse.json({ error: "Only the client can create a contract draft." }, { status: 403 });
    }

    const setup = await ensureContractSetupComplete("/client/contracts");
    if (!setup.completed) {
      return NextResponse.json(
        { error: setup.error || "Complete Contract Setup before creating contracts.", setupHref: setup.setupHref },
        { status: 403 }
      );
    }

    const { jobId, terms } = await req.json();
    if (!jobId) return NextResponse.json({ error: "Job ID is required" }, { status: 400 });

    const jobRows = await sql`
      SELECT id, client_id, worker_id, status
      FROM jobs
      WHERE id = ${jobId}
      LIMIT 1
    `;

    if (jobRows.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobRows[0];
    if (job.client_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!job.worker_id) {
      return NextResponse.json({ error: "Cannot create a contract before a worker is assigned." }, { status: 409 });
    }

    if (!CONTRACT_CREATABLE_JOB_STATUSES.has(String(job.status))) {
      return NextResponse.json(
        { error: `Cannot create a contract while the job is in ${job.status} state.` },
        { status: 409 }
      );
    }

    const existingContracts = await sql`
      SELECT id FROM contracts WHERE job_id = ${jobId} LIMIT 1
    `;

    if (existingContracts.length > 0) {
      return NextResponse.json({ error: "A contract already exists for this job." }, { status: 409 });
    }

    const rows = await sql`
      INSERT INTO contracts (job_id, terms, status)
      VALUES (${jobId}, ${terms ?? null}, 'DRAFT')
      RETURNING id
    `;

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
