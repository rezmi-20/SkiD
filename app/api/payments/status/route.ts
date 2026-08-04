import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";

/**
 * GET /api/payments/status?txRef=DIRESKILL-xxx
 *
 * Returns the current payment status so the client page can poll
 * for confirmation after opening Chapa checkout in a new tab.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const txRef = req.nextUrl.searchParams.get("txRef");
    if (!txRef) {
      return NextResponse.json({ error: "txRef is required" }, { status: 400 });
    }

    const rows = await sql`
      SELECT
        p.id         AS payment_id,
        p.status,
        p.chapa_status,
        p.chapa_reference,
        p.job_id,
        p.amount,
        p.commission_amount,
        p.net_amount,
        j.client_id,
        j.worker_id
      FROM payments p
      JOIN jobs j ON p.job_id = j.id
      WHERE p.chapa_ref = ${txRef}
      ORDER BY p.created_at DESC
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }

    const payment = rows[0];
    const admin = session.user.role === "admin" ? await getAdminPrincipal() : null;

    // Security: only client or worker for this job can poll
    const canRead =
      (hasAdminPermission(admin, "payment_cases.read") || hasAdminPermission(admin, "reports.read")) ||
      session.user.id === payment.client_id ||
      session.user.id === payment.worker_id;

    if (!canRead) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      status: payment.status,
      verificationStatus: payment.status === "held" ? "pending_verification" : payment.chapa_status,
      paymentId: payment.payment_id,
      chapaReference: payment.chapa_reference ?? null,
      jobId: payment.job_id,
      breakdown: {
        amount: Number(payment.amount),
        commissionAmount: Number(payment.commission_amount ?? 0),
        netAmount: Number(payment.net_amount ?? 0),
      },
    });
  } catch (error) {
    console.error("[PAYMENT_STATUS_ERROR]", error);
    return NextResponse.json({ error: "Failed to check payment status." }, { status: 500 });
  }
}
