import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { isActiveVerifiedWorker } from "@/lib/identity-lifecycle";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";
import { getChapaReceiptUrl } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId } = await params;
    const rows = await sql`
      SELECT
        p.id as payment_id,
        p.amount,
        p.commission_amount,
        p.net_amount,
        p.status,
        p.chapa_status,
        p.chapa_ref,
        p.chapa_reference,
        p.created_at,
        j.title as job_title,
        j.client_id,
        j.worker_id,
        COALESCE(cp.full_name, cu.email, 'Client') as client_name,
        COALESCE(wp.full_name, wu.email, 'Worker') as worker_name
      FROM payments p
      JOIN jobs j ON p.job_id = j.id
      JOIN users cu ON j.client_id = cu.id
      JOIN users wu ON j.worker_id = wu.id
      LEFT JOIN client_profiles cp ON cp.user_id = j.client_id
      LEFT JOIN worker_profiles wp ON wp.user_id = j.worker_id
      WHERE p.id = ${paymentId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const payment = rows[0];
    const isWorkerParticipant = session.user.id === payment.worker_id;
    const admin = session.user.role === "admin" ? await getAdminPrincipal() : null;
    const canRead =
      (hasAdminPermission(admin, "payment_cases.read") || hasAdminPermission(admin, "reports.read")) ||
      session.user.id === payment.client_id ||
      (isWorkerParticipant && await isActiveVerifiedWorker(session.user.id));

    if (!canRead) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (payment.status !== "released" || String(payment.chapa_status || "").toLowerCase() !== "success") {
      return NextResponse.json(
        { error: "Receipt is available only after verified payment release by Chapa." },
        { status: 409 },
      );
    }

    const reference = payment.chapa_reference || payment.chapa_ref;
    const chapaReceiptUrl = getChapaReceiptUrl(reference);

    if (req.nextUrl.searchParams.get("format") === "json") {
      return NextResponse.json({
        success: true,
        provider: "chapa",
        reference,
        receiptUrl: chapaReceiptUrl || null,
        nonCustodialNotice: "DireSkill is a marketplace platform and does not hold client funds or provide payment processing. All payments, settlements, and official payment receipts are provided directly by Chapa.",
      });
    }

    if (!chapaReceiptUrl) {
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head><title>Chapa Payment Receipt</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: system-ui, sans-serif; background: #0b0f17; color: #fff; padding: 2rem; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
  <div style="max-width: 480px; background: #161b22; border: 1px solid #30363d; border-radius: 1.5rem; padding: 2rem; text-align: center;">
    <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem; color: #10b981;">Chapa Gateway Payment Record</h2>
    <p style="font-size: 0.875rem; color: #8b949e; line-height: 1.5;">Payment for <strong>${payment.job_title}</strong> was processed directly via Chapa Gateway.</p>
    <div style="background: #0d1117; border-radius: 0.75rem; padding: 1rem; margin: 1.5rem 0; text-align: left; font-size: 0.8125rem;">
      <p style="margin: 0.25rem 0; color: #8b949e;">Amount: <strong style="color: #fff;">${payment.amount} ETB</strong></p>
      <p style="margin: 0.25rem 0; color: #8b949e;">Gateway Ref: <strong style="color: #58a6ff;">${reference || "N/A"}</strong></p>
      <p style="margin: 0.25rem 0; color: #8b949e;">Status: <strong style="color: #10b981;">SUCCESS</strong></p>
    </div>
    <p style="font-size: 0.75rem; color: #6e7681; line-height: 1.4;">Non-Custodial Notice: DireSkill is a marketplace matching platform and does not hold funds or provide payment processing. All payment settlements and receipts are provided by Chapa Financial Technologies.</p>
  </div>
</body>
</html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    // Direct users to the official Chapa payment receipt
    return NextResponse.redirect(chapaReceiptUrl, 307);
  } catch (error) {
    console.error("[RECEIPT_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch Chapa receipt. Please try again." },
      { status: 500 }
    );
  }
}
