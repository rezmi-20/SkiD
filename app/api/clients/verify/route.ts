import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateClientVerificationStatus } from "@/lib/actions/admin";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, status, reason } = await req.json();
    if (!clientId || !status) {
      return NextResponse.json({ error: "Client ID and status are required" }, { status: 400 });
    }

    const result = await updateClientVerificationStatus(clientId, status, reason);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: "Client verification status updated" });
  } catch (error) {
    console.error("[CLIENT_VERIFY_API_ERROR]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
