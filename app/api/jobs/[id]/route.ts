import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateJobStatus } from "@/lib/actions/jobs";
import { z } from "zod";
import { assertActiveVerifiedWorker } from "@/lib/identity-lifecycle";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";

const patchSchema = z.object({
  status: z.enum([
    "pending",
    "accepted",
    "active",
    "in_progress",
    "completion_requested",
    "completed",
    "payment_pending",
    "paid",
    "closed",
    "rejected",
    "cancelled",
    "disputed",
  ]),
});

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
    const admin = session.user.role === "admin" ? await getAdminPrincipal() : null;
    // Security check: Only involved parties or admin can see details
    if (!hasAdminPermission(admin, "reports.read") && job.client_id !== session.user.id && job.worker_id !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.user.role === "worker" && job.worker_id === session.user.id) {
      const workerAccess = await assertActiveVerifiedWorker(session.user.id);
      if (!workerAccess.allowed) {
        return NextResponse.json({ error: workerAccess.error || "Forbidden" }, { status: 403 });
      }
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

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await updateJobStatus(id, parsed.data.status);
    if (!result.success) {
      const statusCode =
        result.error === "Unauthorized" ? 401 :
        result.error === "Forbidden" ? 403 :
        result.error === "Job not found" ? 404 :
        409;
      return NextResponse.json({ error: result.error }, { status: statusCode });
    }

    return NextResponse.json({ message: "Job status updated" });
  } catch (error) {
    console.error("[JOB_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
