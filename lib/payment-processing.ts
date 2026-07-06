import { sql } from "@/lib/db";
import { createNotification } from "@/lib/actions/notifications";
import { verifyChapaPayment, type ChapaApiError } from "@/lib/chapa";

type PaymentSource = "webhook" | "return_url" | "client_confirm";

export interface PaymentProcessingResult {
  success: boolean;
  idempotent: boolean;
  status: "released" | "held" | "failed";
  txRef: string;
  jobId?: string;
  paymentId?: string;
  chapaReference?: string;
  message: string;
  breakdown?: {
    amount: number;
    commissionAmount: number;
    netAmount: number;
  };
  verifiedData?: unknown;
}

async function writeAuditLog(
  userId: string | null,
  action: string,
  details: Record<string, unknown>,
) {
  try {
    await sql`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (${userId}, ${action}, ${JSON.stringify(details)})
    `;
  } catch (error) {
    console.warn("[PAYMENT_AUDIT_SKIPPED]", action, error);
  }
}

function amountsMatch(expected: unknown, actual: unknown) {
  return Math.round(Number(expected) * 100) === Math.round(Number(actual) * 100);
}

function isChapaSuccess(status: unknown) {
  return String(status || "").toLowerCase() === "success";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function extractVerifiedData(verified: any) {
  return verified?.data ?? {};
}

function extractVerifiedStatus(verified: any, verifiedData: any) {
  return verifiedData?.status ?? verified?.status;
}

function extractVerifiedTxRef(verified: any, verifiedData: any) {
  return verifiedData?.tx_ref ?? verifiedData?.trx_ref ?? verified?.tx_ref ?? verified?.trx_ref;
}

function extractVerifiedAmount(verified: any, verifiedData: any) {
  return verifiedData?.amount ?? verified?.amount;
}

function extractVerifiedCurrency(verified: any, verifiedData: any) {
  return verifiedData?.currency ?? verified?.currency;
}

export async function verifyAndReleasePayment({
  txRef,
  jobId,
  source,
  actorUserId = null,
}: {
  txRef: string;
  jobId?: string | null;
  source: PaymentSource;
  actorUserId?: string | null;
}): Promise<PaymentProcessingResult> {
  console.info("[PAYMENT_VERIFY_START]", { txRef, jobId, source });

  if (jobId && !isUuid(jobId)) {
    console.warn("[PAYMENT_VERIFY_INVALID_JOB_ID]", { txRef, jobId, source });
    return {
      success: false,
      idempotent: false,
      status: "failed",
      txRef,
      message: "Invalid job ID.",
    };
  }

  const paymentRows = await sql`
    SELECT
      p.id as payment_id,
      p.job_id,
      p.amount,
      p.commission_amount,
      p.net_amount,
      p.status as payment_status,
      p.chapa_ref,
      p.chapa_reference,
      j.title as job_title,
      j.client_id,
      j.worker_id
    FROM payments p
    JOIN jobs j ON p.job_id = j.id
    WHERE p.chapa_ref = ${txRef}
      AND (${jobId ?? null}::uuid IS NULL OR p.job_id = ${jobId ?? null})
    ORDER BY p.created_at DESC
    LIMIT 1
  `;

  if (paymentRows.length === 0) {
    console.warn("[PAYMENT_VERIFY_NOT_FOUND]", { txRef, jobId, source });
    return {
      success: false,
      idempotent: false,
      status: "failed",
      txRef,
      message: "Payment record not found.",
    };
  }

  const payment = paymentRows[0];
  if (payment.payment_status === "released") {
    console.info("[PAYMENT_VERIFY_ALREADY_RELEASED]", {
      txRef,
      jobId: payment.job_id,
      paymentId: payment.payment_id,
      source,
    });

    // Make a best-effort try to verify again to obtain chapa reference if we don't have it
    let ref = payment.chapa_reference;
    if (!ref) {
      try {
        const verified = await verifyChapaPayment(txRef);
        const verifiedData = extractVerifiedData(verified);
        ref = verifiedData?.reference || null;
        if (ref) {
          await sql`
            UPDATE payments
            SET chapa_reference = ${ref}
            WHERE id = ${payment.payment_id}
          `;
        }
      } catch (err) {
        console.warn("[PAYMENT_VERIFY_ALREADY_RELEASED_REF_FETCH_FAILED]", err);
      }
    }

    return {
      success: true,
      idempotent: true,
      status: "released",
      txRef,
      jobId: payment.job_id,
      paymentId: payment.payment_id,
      chapaReference: ref || undefined,
      message: "Payment was already released.",
      breakdown: {
        amount: Number(payment.amount),
        commissionAmount: Number(payment.commission_amount ?? 0),
        netAmount: Number(payment.net_amount ?? 0),
      },
    };
  }

  const verified = await verifyChapaPayment(txRef);
  const verifiedData = extractVerifiedData(verified);
  const verifiedStatus = extractVerifiedStatus(verified, verifiedData);
  const verifiedTxRef = extractVerifiedTxRef(verified, verifiedData);
  const verifiedAmount = extractVerifiedAmount(verified, verifiedData);
  const verifiedCurrency = extractVerifiedCurrency(verified, verifiedData);

  const isValid =
    isChapaSuccess(verified.status) &&
    isChapaSuccess(verifiedStatus) &&
    verifiedTxRef === txRef &&
    String(verifiedCurrency || "").toUpperCase() === "ETB" &&
    amountsMatch(payment.amount, verifiedAmount);

  console.info("[PAYMENT_VERIFY_RESULT]", {
    txRef,
    paymentId: payment.payment_id,
    jobId: payment.job_id,
    source,
    verifiedStatus,
    verifiedTxRef,
    verifiedAmount,
    verifiedCurrency,
    success: isValid,
  });

  if (!isValid) {
    await sql`
      UPDATE payments
      SET chapa_status = ${String(verifiedStatus || verified.status || "verification_failed")},
          chapa_response = ${JSON.stringify(verified)},
          updated_at = now()
      WHERE id = ${payment.payment_id}
    `;

    await writeAuditLog(actorUserId, "payment_verification_failed", {
      source,
      txRef,
      jobId: payment.job_id,
      expectedAmount: payment.amount,
      verifiedAmount,
      verifiedCurrency,
      verifiedStatus,
    });

    return {
      success: false,
      idempotent: false,
      status: "failed",
      txRef,
      jobId: payment.job_id,
      paymentId: payment.payment_id,
      message: "Chapa verification did not match the local payment record.",
      verifiedData: verified,
    };
  }

  const releasedRows = await sql`
    UPDATE payments
    SET status = 'released',
        chapa_reference = ${verifiedData?.reference || null},
        chapa_status = ${String(verifiedStatus)},
        chapa_response = ${JSON.stringify(verified)},
        updated_at = now()
    WHERE id = ${payment.payment_id}
      AND status <> 'released'
    RETURNING id
  `;

  const idempotent = releasedRows.length === 0;

  if (!idempotent) {
    await writeAuditLog(actorUserId, "payment_released", {
      source,
      txRef,
      jobId: payment.job_id,
      amount: payment.amount,
      commissionAmount: payment.commission_amount,
      netAmount: payment.net_amount,
      chapaReference: verifiedData?.reference,
      paymentMethod: verifiedData?.method,
    });

    await createNotification({
      userId: payment.client_id,
      type: "payment_confirmed",
      title: "Payment Confirmed",
      body: `Your payment for "${payment.job_title}" was confirmed. Transaction: ${txRef}`,
      linkHref: "/client/payments",
    });

    await createNotification({
      userId: payment.worker_id,
      type: "payment_confirmed",
      title: "Payment Received",
      body: `Payment for "${payment.job_title}" was confirmed. Your share has been sent through Chapa split payment.`,
      linkHref: "/worker/earnings",
    });
  }

  console.info("[PAYMENT_RELEASED]", {
    txRef,
    paymentId: payment.payment_id,
    jobId: payment.job_id,
    source,
    idempotent,
  });

  return {
    success: true,
    idempotent,
    status: "released",
    txRef,
    jobId: payment.job_id,
    paymentId: payment.payment_id,
    chapaReference: verifiedData?.reference || undefined,
    message: idempotent ? "Payment was already released." : "Payment verified and released.",
    breakdown: {
      amount: Number(payment.amount),
      commissionAmount: Number(payment.commission_amount ?? 0),
      netAmount: Number(payment.net_amount ?? 0),
    },
    verifiedData: verified,
  };
}

export function paymentErrorResponse(error: unknown) {
  const chapaError = error as ChapaApiError;
  if (chapaError?.name === "ChapaApiError") {
    return {
      status: chapaError.status || 502,
      body: { success: false, error: chapaError.message, details: chapaError.payload },
    };
  }

  return {
    status: 500,
    body: { success: false, error: error instanceof Error ? error.message : "Payment verification failed." },
  };
}
