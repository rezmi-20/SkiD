import { NextRequest, NextResponse } from "next/server";
import { revealVerificationFin, type VerificationAccountType } from "@/lib/verification-operations";

export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

function json(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

function isVerificationAccountType(value: string): value is VerificationAccountType {
  return value === "worker" || value === "client";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ accountType: string; accountUserId: string }> },
) {
  const { accountType, accountUserId } = await params;
  if (!isVerificationAccountType(accountType)) {
    return json({ success: false, error: "Invalid verification account type." }, 400);
  }

  let payload: { expectedAttemptId?: string | null; reason?: string | null } = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  const result = await revealVerificationFin(
    accountType,
    accountUserId,
    typeof payload.expectedAttemptId === "string" ? payload.expectedAttemptId : null,
    typeof payload.reason === "string" ? payload.reason : "Active verification review FIN comparison",
  );

  if (!result.success) {
    return json({ success: false, error: result.error || "FIN could not be revealed." }, result.status || 400);
  }

  return json({ success: true, fin: result.fin, expiresInSeconds: 60 }, 200);
}
