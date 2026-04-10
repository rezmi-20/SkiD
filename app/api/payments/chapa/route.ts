import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, amount } = await req.json();
    if (!jobId || !amount) {
      return NextResponse.json({ error: "Job ID and amount are required" }, { status: 400 });
    }

    // SIMULATION: In a real app, this would call Chapa API
    const txRef = `cheque-${Math.floor(Math.random() * 1000000)}`;

    await sql`
      INSERT INTO payments (job_id, amount, status, chapa_ref)
       VALUES (${jobId}, ${amount}, 'held', ${txRef})`;

    return NextResponse.json({
      message: "Payment initiated (Simulated)",
      checkoutUrl: `https://example.com/checkout/${txRef}`,
      txRef
    });
  } catch (error) {
    console.error("[PAYMENT_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
