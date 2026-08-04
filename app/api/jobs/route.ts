import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { ensureContractSetupComplete } from "@/lib/actions/contract-setup";
import { assertActiveVerifiedWorker } from "@/lib/identity-lifecycle";

const jobSchema = z.object({
  workerId: z.string().uuid().optional(),
  title: z.string().min(5),
  description: z.string().optional(),
  budget: z.number().optional(),
  location: z.string().optional(),
  requestedDate: z.string().optional(),
});

const OPEN_INVITATION_STATUSES = [
  "pending",
  "accepted",
  "active",
  "in_progress",
  "completion_requested",
  "completed",
  "payment_pending",
  "paid",
];

import { sanitizeText } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const setup = await ensureContractSetupComplete("/client/contract/new");
    if (!setup.completed) {
      return NextResponse.json(
        { error: setup.error || "Complete Contract Setup before creating hiring requests.", setupHref: setup.setupHref },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = jobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { workerId, title, description, budget, location, requestedDate } = parsed.data;

    const sanitizedTitle = sanitizeText(title);
    const sanitizedDescription = description ? sanitizeText(description) : null;
    const sanitizedLocation = location ? sanitizeText(location) : null;

    if (workerId) {
      if (workerId === session.user.id) {
        return NextResponse.json({ error: "You cannot hire yourself." }, { status: 400 });
      }

      const workerRows = await sql`
        SELECT u.id
        FROM users u
        JOIN worker_profiles wp ON u.id = wp.user_id
        WHERE u.id = ${workerId}
          AND u.role = 'worker'
          AND u.is_suspended = false
          AND wp.is_verified = true
          AND wp.verification_status = 'approved'
        LIMIT 1
      `;

      if (workerRows.length === 0) {
        return NextResponse.json({ error: "Worker not found or unavailable" }, { status: 404 });
      }

      const duplicateRows = await sql`
        SELECT id, status
        FROM jobs
        WHERE client_id = ${session.user.id}
          AND worker_id = ${workerId}
          AND status = ANY(${OPEN_INVITATION_STATUSES}::job_status[])
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (duplicateRows.length > 0) {
        return NextResponse.json(
          { error: `You already have an active hiring workflow with this worker (${duplicateRows[0].status}).` },
          { status: 409 },
        );
      }
    }

    const rows = await sql`
       INSERT INTO jobs (client_id, worker_id, title, description, budget, location, requested_date)
       VALUES (
         ${session.user.id},
         ${workerId ?? null},
         ${sanitizedTitle},
         ${sanitizedDescription},
         ${budget ?? null},
         ${sanitizedLocation},
         ${requestedDate ? new Date(requestedDate) : null}
       )
       RETURNING id`;

    return NextResponse.json({ message: "Job created successfully", jobId: rows[0].id }, { status: 201 });
  } catch (error) {
    console.error("[JOB_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let rows;
    if (session.user.role === "client") {
      rows = await sql`SELECT * FROM jobs WHERE client_id = ${session.user.id} ORDER BY created_at DESC`;
    } else if (session.user.role === "worker") {
      const workerAccess = await assertActiveVerifiedWorker(session.user.id);
      if (!workerAccess.allowed) {
        return NextResponse.json({ error: workerAccess.error || "Forbidden" }, { status: 403 });
      }
      rows = await sql`SELECT * FROM jobs WHERE worker_id = ${session.user.id} ORDER BY created_at DESC`;
    } else {
      rows = await sql`SELECT * FROM jobs ORDER BY created_at DESC`;
    }

    return NextResponse.json({ jobs: rows });
  } catch (error) {
    console.error("[JOBS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
