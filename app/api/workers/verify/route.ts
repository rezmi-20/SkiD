import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateWorkerVerificationStatus } from "@/lib/actions/admin";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workerId, isVerified, reason, status } = await req.json();

    if (!workerId) {
      return NextResponse.json({ error: "Worker ID is required" }, { status: 400 });
    }

    const nextStatus = typeof status === "string" ? status : isVerified === false ? "rejected" : "approved";
    const result = await updateWorkerVerificationStatus(workerId, nextStatus, reason);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to update worker verification status" }, { status: 400 });
    }

    return NextResponse.json({ message: "Worker verification status updated" });
  } catch (error) {
    console.error("[WORKER_VERIFY_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
