import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/actions/notifications";

// ─── POST /api/payments/chapa — Initiate a simulated payment ──────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, amount, method } = await req.json();
    if (!jobId || !amount) {
      return NextResponse.json({ error: "Job ID and amount are required" }, { status: 400 });
    }

    // Verify job exists and user is the client
    const jobs = await sql`
      SELECT j.*, cp.full_name as client_name, wp.full_name as worker_name, wp.user_id as worker_user_id
      FROM jobs j
      LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      WHERE j.id = ${jobId} AND j.client_id = ${session.user.id}
    `;
    if (jobs.length === 0) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
    }
    const job = jobs[0];

    // Check if already paid
    const existingPayment = await sql`
      SELECT id, status FROM payments WHERE job_id = ${jobId} AND status = 'released'
    `;
    if (existingPayment.length > 0) {
      return NextResponse.json({ error: "This job has already been paid." }, { status: 409 });
    }

    // Generate simulated Chapa tx ref
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    const txRef = `DIRESKILL-${timestamp}-${random}`;
    const paymentMethod = method || "telebirr";

    // Insert pending payment record
    await sql`
      INSERT INTO payments (job_id, amount, status, chapa_ref)
      VALUES (${jobId}, ${amount}, 'held', ${txRef})
      ON CONFLICT DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      txRef,
      amount,
      paymentMethod,
      message: "Payment initiated (Test Mode — No real money transferred)",
    });
  } catch (error) {
    console.error("[PAYMENT_INITIATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH /api/payments/chapa — Confirm/simulate successful payment ──────────
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, txRef } = await req.json();
    if (!jobId || !txRef) {
      return NextResponse.json({ error: "jobId and txRef are required" }, { status: 400 });
    }

    // Fetch the job details for notifications
    const jobs = await sql`
      SELECT j.*, j.title, j.worker_id, j.client_id, wp.full_name as worker_name
      FROM jobs j
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      WHERE j.id = ${jobId} AND j.client_id = ${session.user.id}
    `;
    if (jobs.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    const job = jobs[0];

    // Simulate Chapa verification — always succeeds in test mode
    // Update payment to 'released'
    await sql`
      UPDATE payments SET status = 'released'
      WHERE job_id = ${jobId} AND chapa_ref = ${txRef}
    `;

    // Mark job as completed
    await sql`UPDATE jobs SET status = 'completed' WHERE id = ${jobId}`;

    // Fire notifications
    await createNotification({
      userId: job.client_id,
      type: "payment_confirmed",
      title: "Payment Confirmed!",
      body: `Your payment for "${job.title}" has been processed successfully. Transaction: ${txRef}`,
      linkHref: `/client/contracts`,
    });
    await createNotification({
      userId: job.worker_id,
      type: "payment_confirmed",
      title: "Payment Received!",
      body: `The client has completed payment for "${job.title}". Your earnings have been released.`,
      linkHref: `/worker/contracts`,
    });

    return NextResponse.json({
      success: true,
      txRef,
      status: "released",
      message: "Payment confirmed and job marked as completed.",
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[PAYMENT_CONFIRM_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
