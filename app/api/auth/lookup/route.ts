import { NextResponse } from "next/server";

/**
 * This legacy route used to disclose the account email for a phone number.
 * Phone-to-email resolution now happens inside the auth proxy.
 */
export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is no longer available." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
