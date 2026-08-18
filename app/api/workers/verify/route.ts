import { NextRequest, NextResponse } from "next/server";
import { updateWorkerVerificationStatus } from "@/lib/actions/admin";
import { requireAdminPermission } from "@/lib/admin-authorization";

export async function POST(req: NextRequest) {
  try {
    const { workerId, isVerified, reason, status, expectedAttemptId } = await req.json();

    if (!workerId) {
      return NextResponse.json({ error: "Worker ID is required" }, { status: 400 });
    }

    const nextStatus = typeof status === "string" ? status : isVerified === false ? "rejected" : "approved";
    await requireAdminPermission(
      nextStatus === "approved"
        ? "verification.approve"
        : nextStatus === "rejected"
          ? "verification.reject"
          : nextStatus === "pending"
            ? "verification.request_resubmission"
            : nextStatus === "revoked"
              ? "verification.revoke"
              : "verification.review",
    );
    const result = await updateWorkerVerificationStatus(workerId, nextStatus, reason, expectedAttemptId ?? null);
    if (!result.success) {
      const statusCode = "status" in result && typeof result.status === "number" ? result.status : 400;
      return NextResponse.json(
        { error: result.error || "Failed to update worker verification status" },
        { status: statusCode },
      );
    }

    return NextResponse.json({ message: "Worker verification status updated" });
  } catch (error) {
    console.error("[WORKER_VERIFY_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
