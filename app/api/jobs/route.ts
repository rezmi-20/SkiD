import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const jobSchema = z.object({
  workerId: z.string().uuid().optional(),
  title: z.string().min(5),
  description: z.string().optional(),
  budget: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = jobSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { workerId, title, description, budget } = parsed.data;

    const rows = await sql`
       INSERT INTO jobs (client_id, worker_id, title, description, budget)
       VALUES (${session.user.id}, ${workerId ?? null}, ${title}, ${description ?? null}, ${budget ?? null})
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
