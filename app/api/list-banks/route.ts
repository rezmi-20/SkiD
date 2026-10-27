import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ChapaApiError, listChapaBanks } from "@/lib/chapa";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "worker") {
      return NextResponse.json(
        { success: false, error: "Only signed-in workers can retrieve payout bank details." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    console.info("[CHAPA_LIST_BANKS_REQUEST]");
    const result = await listChapaBanks();

    return NextResponse.json({
      success: true,
      banks: result.data ?? [],
      message: result.message ?? "Banks fetched successfully.",
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[CHAPA_LIST_BANKS_ERROR]", error instanceof Error ? error.name : "UnknownError");

    if (error instanceof ChapaApiError) {
      return NextResponse.json(
        { success: false, error: "Unable to retrieve bank information right now." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Unable to retrieve bank information right now." },
      { status: 500 },
    );
  }
}
