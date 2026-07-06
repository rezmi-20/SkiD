import { NextResponse } from "next/server";
import { ChapaApiError, listChapaBanks } from "@/lib/chapa";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.info("[CHAPA_LIST_BANKS_REQUEST]");
    const result = await listChapaBanks();

    return NextResponse.json({
      success: true,
      banks: result.data ?? [],
      message: result.message ?? "Banks fetched successfully.",
    });
  } catch (error) {
    console.error("[CHAPA_LIST_BANKS_ERROR]", error);

    if (error instanceof ChapaApiError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.payload },
        { status: error.status || 502 },
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to list banks." },
      { status: 500 },
    );
  }
}
