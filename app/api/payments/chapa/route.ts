import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/actions/notifications";
import { getPaymentBreakdown } from "@/lib/actions/payments";

async function logAuditAction(userId: string, action: string, details: Record<string, unknown>) {
  try {
    await sql`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (${userId}, ${action}, ${JSON.stringify(details)})
    `;
  } catch (error) {
    console.warn("[AUDIT_LOG_SKIPPED]", action, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, method } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    const jobs = await sql`
      SELECT
        j.id,
        j.title,
        j.status,
        j.budget,
        j.client_id,
        j.worker_id,
        wp.full_name as worker_name
      FROM jobs j
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      WHERE j.id = ${jobId} AND j.client_id = ${session.user.id}
      LIMIT 1
    `;

    if (jobs.length === 0) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
    }

    const job = jobs[0];
    if (job.status !== "completed") {
      return NextResponse.json({ error: "Payment is only available after the job is completed." }, { status: 409 });
    }

    if (!job.worker_id) {
      return NextResponse.json({ error: "This job has no assigned worker." }, { status: 409 });
    }

    if (!job.budget || Number(job.budget) <= 0) {
      return NextResponse.json({ error: "This job does not have a payable budget." }, { status: 409 });
    }

    const releasedPayments = await sql`
      SELECT id FROM payments
      WHERE job_id = ${jobId} AND status = 'released'
      LIMIT 1
    `;

    if (releasedPayments.length > 0) {
      return NextResponse.json({ error: "This job has already been paid." }, { status: 409 });
    }

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    const txRef = `DIRESKILL-${timestamp}-${random}`;
    const paymentMethod = method || "telebirr";
    const breakdown = getPaymentBreakdown(Number(job.budget));

    const heldPayments = await sql`
      SELECT id FROM payments
      WHERE job_id = ${jobId} AND status = 'held'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (heldPayments.length > 0) {
      await sql`
        UPDATE payments
        SET amount = ${breakdown.total},
            commission_amount = ${breakdown.commission},
            net_amount = ${breakdown.netAmount},
            chapa_ref = ${txRef}
        WHERE id = ${heldPayments[0].id}
      `;
    } else {
      await sql`
        INSERT INTO payments (job_id, amount, commission_amount, net_amount, status, chapa_ref)
        VALUES (${jobId}, ${breakdown.total}, ${breakdown.commission}, ${breakdown.netAmount}, 'held', ${txRef})
      `;
    }

    await logAuditAction(session.user.id, "payment_initiated", {
      jobId,
      txRef,
      amount: breakdown.total,
      commissionAmount: breakdown.commission,
      netAmount: breakdown.netAmount,
      method: paymentMethod,
    });

    await createNotification({
      userId: job.worker_id,
      type: "payment_initiated",
      title: "Payment Initiated",
      body: `The client started payment for "${job.title}".`,
      linkHref: "/worker/earnings",
    });

    return NextResponse.json({
      success: true,
      txRef,
      amount: breakdown.total,
      commissionAmount: breakdown.commission,
      netAmount: breakdown.netAmount,
      paymentMethod,
      message: "Payment initiated (test mode; no real money transferred)",
    });
  } catch (error) {
    console.error("[PAYMENT_INITIATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, txRef } = await req.json();
    if (!jobId || !txRef) {
      return NextResponse.json({ error: "jobId and txRef are required" }, { status: 400 });
    }

    const jobs = await sql`
      SELECT j.id, j.title, j.status, j.worker_id, j.client_id
      FROM jobs j
      WHERE j.id = ${jobId} AND j.client_id = ${session.user.id}
      LIMIT 1
    `;

    if (jobs.length === 0) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobs[0];
    if (job.status !== "completed") {
      return NextResponse.json({ error: "Payment can only be confirmed for completed jobs." }, { status: 409 });
    }

    const paymentRows = await sql`
      SELECT id, amount, commission_amount, net_amount, status
      FROM payments
      WHERE job_id = ${jobId} AND chapa_ref = ${txRef}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (paymentRows.length === 0) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    const payment = paymentRows[0];
    if (payment.status === "released") {
      return NextResponse.json({
        success: true,
        txRef,
        status: "released",
        message: "Payment was already confirmed.",
        completedAt: new Date().toISOString(),
      });
    }

    await sql`
      UPDATE payments
      SET status = 'released'
      WHERE id = ${payment.id}
    `;

    await logAuditAction(session.user.id, "payment_completed", {
      jobId,
      txRef,
      amount: payment.amount,
      commissionAmount: payment.commission_amount,
      netAmount: payment.net_amount,
    });

    await createNotification({
      userId: job.client_id,
      type: "payment_confirmed",
      title: "Payment Confirmed",
      body: `Your payment for "${job.title}" has been processed successfully. Transaction: ${txRef}`,
      linkHref: "/client/contracts",
    });

    await createNotification({
      userId: job.worker_id,
      type: "payment_confirmed",
      title: "Payment Completed",
      body: `The client completed payment for "${job.title}". Your earnings have been released.`,
      linkHref: "/worker/earnings",
    });

    return NextResponse.json({
      success: true,
      txRef,
      status: "released",
      message: "Payment confirmed.",
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[PAYMENT_CONFIRM_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
