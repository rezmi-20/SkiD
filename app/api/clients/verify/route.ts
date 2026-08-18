import { NextRequest, NextResponse } from "next/server";
import { updateClientVerificationStatus } from "@/lib/actions/admin";
import { requireAdminPermission } from "@/lib/admin-authorization";

export async function POST(req: NextRequest) {
  try {
    const { clientId, status, reason, expectedAttemptId } = await req.json();
    if (!clientId || !status) {
      return NextResponse.json({ error: "Client ID and status are required" }, { status: 400 });
    }

    await requireAdminPermission(
      status === "approved"
        ? "verification.approve"
        : status === "rejected"
          ? "verification.reject"
          : status === "pending"
            ? "verification.request_resubmission"
            : status === "revoked"
              ? "verification.revoke"
              : "verification.review",
    );
    const result = await updateClientVerificationStatus(clientId, status, reason, expectedAttemptId ?? null);
    if (!result.success) {
      const statusCode = "status" in result && typeof result.status === "number" ? result.status : 400;
      return NextResponse.json({ error: result.error }, { status: statusCode });
    }

    return NextResponse.json({ message: "Client verification status updated" });
  } catch (error) {
    console.error("[CLIENT_VERIFY_API_ERROR]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
