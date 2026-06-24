import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

/**
 * POST /api/auth/lookup
 * Given a phone number, returns the associated email address from our users table.
 * This allows login-by-phone to work with Neon Auth's email-based identity system.
 */
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Normalize: strip leading 0, strip +251 prefix if present
    let normalized = phone.trim();
    if (normalized.startsWith("+251")) normalized = normalized.slice(4);
    if (normalized.startsWith("0")) normalized = normalized.slice(1);

    const result = await sql`
      SELECT email FROM users WHERE regexp_replace(phone, '^(\\+251|0)', '') = ${normalized} LIMIT 1
    `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "No account found with this phone number." }, { status: 404 });
    }

    const storedEmail = result[0].email as string;

    // Handle legacy accounts created with synthetic emails before the migration.
    // For those accounts, the stored email IS the Neon Auth email (the synthetic one).
    // For new accounts, the stored email is the real email used with Neon Auth.
    return NextResponse.json({ email: storedEmail });
  } catch (error) {
    console.error("[AUTH_LOOKUP_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
