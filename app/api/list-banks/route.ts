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
