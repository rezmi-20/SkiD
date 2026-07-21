import { NextRequest, NextResponse } from "next/server";
import { paymentErrorResponse, verifyAndReleasePayment } from "@/lib/payment-processing";
import { verifyChapaWebhookSignature } from "@/lib/chapa";

export const dynamic = "force-dynamic";

function getChapaSignatureHeaders(req: NextRequest) {
  return [
    req.headers.get("x-chapa-signature"),
    req.headers.get("chapa-signature"),
    req.headers.get("chapa-signature-v2"),
    req.headers.get("x-webhook-signature"),
    req.headers.get("verif-hash"),
  ];
}

function extractTxRef(event: any): string | null {
  return (
    event?.tx_ref ||
    event?.trx_ref ||
    event?.transaction?.tx_ref ||
    event?.transaction?.trx_ref ||
    event?.data?.tx_ref ||
    event?.data?.trx_ref ||
    event?.data?.transaction?.tx_ref ||
    event?.data?.transaction?.trx_ref ||
    null
  );
}

function extractStatus(event: any) {
  return (
    event?.status ||
    event?.transaction?.status ||
    event?.data?.status ||
    event?.data?.transaction?.status ||
    ""
  );
}

export async function GET(req: NextRequest) {
  return NextResponse.json(
    { error: "Webhook delivery must use signed POST requests." },
    { status: 405, headers: { Allow: "POST" } }
  );
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signatureHeaders = getChapaSignatureHeaders(req);
  const signatureVerified = verifyChapaWebhookSignature(rawBody, signatureHeaders);

  console.info("[CHAPA_WEBHOOK_RECEIVED]", {
    signatureHeaders: signatureHeaders.map(Boolean),
    signatureVerified,
  });

  if (!signatureVerified) {
    console.warn("[CHAPA_WEBHOOK_INVALID_SIGNATURE]", {
      checkedHeaders: ["x-chapa-signature", "chapa-signature", "chapa-signature-v2", "x-webhook-signature", "verif-hash"],
    });
    return NextResponse.json({ received: false, error: "Invalid signature." }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    console.warn("[CHAPA_WEBHOOK_INVALID_JSON]");
    return NextResponse.json({ received: false, error: "Invalid JSON." }, { status: 400 });
  }

  const txRef = extractTxRef(event);
  if (!txRef) {
    console.warn("[CHAPA_WEBHOOK_MISSING_TX_REF]");
    return NextResponse.json({ received: true, message: "Webhook ignored: missing tx_ref." });
  }

  const eventName = String(event?.event || "").toLowerCase();
  const eventStatus = String(extractStatus(event)).toLowerCase();
  const isSuccessfulCharge =
    eventName === "charge.success" ||
    eventStatus === "success";

  console.info("[CHAPA_WEBHOOK_TX_REF]", {
    txRef,
    event: event?.event,
    status: eventStatus,
    signatureVerified,
  });

  if (!isSuccessfulCharge) {
    console.info("[CHAPA_WEBHOOK_IGNORED]", { txRef, event: event?.event, status: event?.status });
    return NextResponse.json({ received: true, message: "Webhook ignored: not a successful charge." });
  }

  try {
    const result = await verifyAndReleasePayment({
      txRef,
      source: "webhook",
      actorUserId: null,
    });

    console.info("[CHAPA_WEBHOOK_RELEASE_RESULT]", {
      txRef,
      success: result.success,
      status: result.status,
      idempotent: result.idempotent,
      paymentId: result.paymentId,
      jobId: result.jobId,
    });

    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    console.error("[CHAPA_WEBHOOK_PROCESSING_ERROR]", error);
    const response = paymentErrorResponse(error);
    return NextResponse.json({ received: false, ...response.body }, { status: response.status });
  }
}
