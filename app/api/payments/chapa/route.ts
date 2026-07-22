import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/actions/notifications";
import { getPaymentBreakdown } from "@/lib/actions/payments";
import { ChapaApiError, initializeChapaPayment } from "@/lib/chapa";
import { paymentErrorResponse, verifyAndReleasePayment } from "@/lib/payment-processing";

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

function normalizeUrl(url: string) {
  return url.replace(/\/$/, "");
}

function appUrl() {
  const candidate =
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL;

  return candidate ? normalizeUrl(candidate) : null;
}

function paymentWebhookUrl() {
  const baseUrl = appUrl();
  const candidates = [
    process.env.WEBHOOK_URL,
    process.env.CHAPA_WEBHOOK_URL,
    baseUrl ? `${baseUrl}/api/payment/webhook` : null,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      const url = new URL(candidate);
      const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
      const isSuccessPage = url.pathname.includes("/payment-success");

      if (url.protocol === "https:" && !isLocalhost && !isSuccessPage) {
        return normalizeUrl(url.toString());
      }
    } catch {
      console.warn("[CHAPA_WEBHOOK_URL_INVALID]", candidate);
    }
  }

  return null;
}

function paymentReturnUrl(jobId: string, txRef: string) {
  const baseUrl = appUrl();
  if (!baseUrl) return null;
  return `${baseUrl}/payment-success?job_id=${encodeURIComponent(jobId)}&tx_ref=${encodeURIComponent(txRef)}`;
}

function splitName(fullName: string | null | undefined) {
  const parts = String(fullName || "DireSkill Client").trim().split(/\s+/);
  return {
    firstName: parts[0] || "DireSkill",
    lastName: parts.slice(1).join(" ") || "Client",
  };
}

function normalizeEthiopianPhone(phone: string | null | undefined) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (/^0[79]\d{8}$/.test(digits)) return digits;
  if (/^[79]\d{8}$/.test(digits)) return `0${digits}`;
  if (/^251[79]\d{8}$/.test(digits)) return `0${digits.slice(3)}`;
  return null;
}

async function initializeSplitPayment(input: {
  txRef: string;
  amount: number;
  email: string;
  fullName: string | null;
  phone: string | null;
  jobId: string;
  title: string;
  subaccountId: string;
  splitType: "percentage" | "flat";
  splitValue: number;
  returnUrl: string | null;
}) {
  const { firstName, lastName } = splitName(input.fullName);
  const phoneNumber = normalizeEthiopianPhone(input.phone);
  const callbackUrl = paymentWebhookUrl();

  if (!phoneNumber) {
    throw new ChapaApiError(
      "Phone number must be 10 digits and start with 09 or 07.",
      400,
      { field: "phoneNumber", value: input.phone },
    );
  }

  console.info("[CHAPA_PAYMENT_URLS]", {
    txRef: input.txRef,
    callbackUrl: callbackUrl || "(not sent)",
    // No return_url: the Chapa-hosted receipt should not auto-redirect back to the app.
  });

  const data = await initializeChapaPayment({
    txRef: input.txRef,
    amount: input.amount,
    email: input.email,
    firstName,
    lastName,
    phoneNumber,
    callbackUrl,
    returnUrl: input.returnUrl,
    title: "DireSkill",
    description: input.title,
    subaccountId: input.subaccountId,
    splitType: input.splitType,
    splitValue: input.splitValue,
  });

  if (data?.status !== "success" || !data?.data?.checkout_url) {
    throw new ChapaApiError(
      data?.message || "Chapa payment initialization failed.",
      502,
      data ?? null,
    );
  }

  return {
    checkoutUrl: data.data.checkout_url,
    chapaResponse: data,
  };
}

export async function POST(req: NextRequest) {
  console.info("[CHAPA_POST_HIT]", {
    origin: req.nextUrl.origin,
    href: req.nextUrl.href,
    webhookUrl: process.env.WEBHOOK_URL || "(not set)",
    browserReturnUrl: "(not sent)",
  });
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
        j.client_id,
        j.worker_id,
        COALESCE(c.payment_amount, j.budget) as payment_amount,
        c.id as contract_id,
        c.status as contract_status,
        c.signed_at,
        u.email as client_email,
        u.phone as client_phone,
        cp.full_name as client_name,
        wp.full_name as worker_name,
        wp.chapa_subaccount_id,
        wp.chapa_split_type,
        wp.chapa_split_value
      FROM jobs j
      JOIN users u ON j.client_id = u.id
      LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
      LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
      LEFT JOIN contracts c ON c.job_id = j.id
      WHERE j.id = ${jobId} AND j.client_id = ${session.user.id}
      LIMIT 1
    `;

    if (jobs.length === 0) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
    }

    const job = jobs[0];
    if (!["completed", "payment_pending"].includes(job.status)) {
      return NextResponse.json({ error: "Payment is only available after client-confirmed completion." }, { status: 409 });
    }

    if (!job.contract_id || !job.signed_at || job.contract_status !== "ACTIVE") {
      return NextResponse.json({ error: "Payment requires a fully signed active contract." }, { status: 409 });
    }

    if (!job.worker_id) {
      return NextResponse.json({ error: "This job has no assigned worker." }, { status: 409 });
    }

    if (!job.chapa_subaccount_id) {
      return NextResponse.json(
        { error: "The assigned worker has not connected a Chapa payout subaccount yet." },
        { status: 409 },
      );
    }

    if (!job.payment_amount || Number(job.payment_amount) <= 0) {
      return NextResponse.json({ error: "This job does not have a payable budget." }, { status: 409 });
    }

    const releasedPayments = await sql`
      SELECT id FROM payments
      WHERE job_id = ${jobId} AND status IN ('released', 'held')
      LIMIT 1
    `;

    if (releasedPayments.length > 0) {
      return NextResponse.json({ error: "This job already has an active or successful payment." }, { status: 409 });
    }

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    const txRef = `DIRESKILL-${timestamp}-${random}`;
    const paymentMethod = method || "telebirr";
    const breakdown = getPaymentBreakdown(Number(job.payment_amount));
    const splitType = job.chapa_split_type === "flat" ? "flat" : "percentage";
    const splitValue = Number(job.chapa_split_value ?? breakdown.commissionRate);
    const { checkoutUrl, chapaResponse } = await initializeSplitPayment({
      txRef,
      amount: breakdown.total,
      email: job.client_email,
      fullName: job.client_name,
      phone: job.client_phone,
      jobId,
      title: job.title,
      subaccountId: job.chapa_subaccount_id,
      splitType,
      splitValue,
      returnUrl: paymentReturnUrl(jobId, txRef),
    });

    const heldPayments = await sql`
      SELECT id FROM payments
      WHERE job_id = ${jobId} AND status = 'held'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (heldPayments.length > 0) {
      await sql.transaction([
        sql`
          UPDATE payments
          SET amount = ${breakdown.total},
              commission_amount = ${breakdown.commission},
              net_amount = ${breakdown.netAmount},
              chapa_ref = ${txRef},
              chapa_checkout_url = ${checkoutUrl},
              chapa_status = ${chapaResponse.status},
              chapa_response = ${JSON.stringify(chapaResponse)},
              worker_subaccount_id = ${job.chapa_subaccount_id},
              updated_at = now()
          WHERE id = ${heldPayments[0].id}
        `,
        sql`
          UPDATE jobs
          SET status = 'payment_pending', updated_at = NOW()
          WHERE id = ${jobId}
            AND status = 'completed'
        `,
      ]);
    } else {
      await sql.transaction([
        sql`
          INSERT INTO payments (
            job_id,
            amount,
            commission_amount,
            net_amount,
            status,
            chapa_ref,
            chapa_checkout_url,
            chapa_status,
            chapa_response,
            worker_subaccount_id,
            updated_at
          )
          VALUES (
            ${jobId},
            ${breakdown.total},
            ${breakdown.commission},
            ${breakdown.netAmount},
            'held',
            ${txRef},
            ${checkoutUrl},
            ${chapaResponse.status},
            ${JSON.stringify(chapaResponse)},
            ${job.chapa_subaccount_id},
            now()
          )
        `,
        sql`
          UPDATE jobs
          SET status = 'payment_pending', updated_at = NOW()
          WHERE id = ${jobId}
            AND status = 'completed'
        `,
      ]);
    }

    await logAuditAction(session.user.id, "payment_initiated", {
      jobId,
      txRef,
      amount: breakdown.total,
      commissionAmount: breakdown.commission,
      netAmount: breakdown.netAmount,
      method: paymentMethod,
      workerSubaccountId: job.chapa_subaccount_id,
      splitType,
      splitValue,
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
      checkoutUrl,
      workerSubaccountId: job.chapa_subaccount_id,
      splitType,
      splitValue,
      message: "Chapa checkout initialized.",
    });
  } catch (error) {
    console.error("[PAYMENT_INITIATE_ERROR]", error);
    if (error instanceof ChapaApiError) {
      return NextResponse.json({ error: error.message, details: error.payload }, { status: error.status || 502 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
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

    const ownershipRows = await sql`
      SELECT j.id
      FROM jobs j
      WHERE j.id = ${jobId}
        AND j.client_id = ${session.user.id}
      LIMIT 1
    `;

    if (ownershipRows.length === 0) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 });
    }

    const result = await verifyAndReleasePayment({
      txRef,
      jobId,
      source: "client_confirm",
      actorUserId: session.user.id,
    });

    return NextResponse.json({
      ...result,
      completedAt: new Date().toISOString(),
    }, { status: result.success ? 200 : 409 });
  } catch (error) {
    console.error("[PAYMENT_CONFIRM_ERROR]", error);
    const response = paymentErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
