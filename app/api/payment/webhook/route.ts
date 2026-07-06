import { NextRequest, NextResponse } from "next/server";
import { paymentErrorResponse, verifyAndReleasePayment } from "@/lib/payment-processing";
import { verifyChapaWebhookSignature } from "@/lib/chapa";

export const dynamic = "force-dynamic";

function jsonpResponse(callback: string | null, payload: Record<string, unknown>, status = 200) {
  if (callback && /^[A-Za-z_$][\w.$]*$/.test(callback)) {
    return new Response(`${callback}(${JSON.stringify(payload)});`, {
      status,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(payload, { status });
}

function getWebhookHeaders(req: NextRequest) {
  return Object.fromEntries(req.headers.entries());
}

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
  const { searchParams } = new URL(req.url);
  const callback = searchParams.get("callback");
  const txRef = searchParams.get("tx_ref") || searchParams.get("trx_ref");
  const status = String(searchParams.get("status") || "").toLowerCase();

  console.info("[CHAPA_WEBHOOK_GET_RECEIVED]", {
    txRef,
    status,
    hasJsonpCallback: Boolean(callback),
  });

  if (!txRef) {
    return jsonpResponse(callback, {
      received: true,
      success: false,
      message: "Webhook ignored: missing tx_ref.",
    });
  }

  if (status && status !== "success") {
    return jsonpResponse(callback, {
      received: true,
      success: false,
      txRef,
      message: "Webhook ignored: payment status is not success.",
    });
  }

  try {
    const result = await verifyAndReleasePayment({
      txRef,
      source: "webhook",
      actorUserId: null,
    });

    console.info("[CHAPA_WEBHOOK_GET_RELEASE_RESULT]", {
      txRef,
      success: result.success,
      status: result.status,
      idempotent: result.idempotent,
      paymentId: result.paymentId,
      jobId: result.jobId,
    });

    return jsonpResponse(callback, { received: true, ...result }, result.success ? 200 : 409);
  } catch (error) {
    console.error("[CHAPA_WEBHOOK_GET_PROCESSING_ERROR]", error);
    const response = paymentErrorResponse(error);
    return jsonpResponse(callback, { received: false, ...response.body }, response.status);
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const headers = getWebhookHeaders(req);
  const signatureHeaders = getChapaSignatureHeaders(req);
  const signatureVerified = verifyChapaWebhookSignature(rawBody, signatureHeaders);

  console.info("[CHAPA_WEBHOOK_RECEIVED]", {
    headers,
    rawBody,
    signatureHeaders: signatureHeaders.map(Boolean),
    signatureVerified,
  });

  if (!signatureVerified) {
    console.warn("[CHAPA_WEBHOOK_INVALID_SIGNATURE]", {
      headers,
      rawBody,
      checkedHeaders: ["x-chapa-signature", "chapa-signature", "chapa-signature-v2", "x-webhook-signature", "verif-hash"],
    });
    return NextResponse.json({ received: false, error: "Invalid signature." }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    console.warn("[CHAPA_WEBHOOK_INVALID_JSON]", { rawBody });
    return NextResponse.json({ received: false, error: "Invalid JSON." }, { status: 400 });
  }

  const txRef = extractTxRef(event);
  if (!txRef) {
    console.warn("[CHAPA_WEBHOOK_MISSING_TX_REF]", event);
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
