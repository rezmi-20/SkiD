import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAuthSessionUnavailableError } from "@/lib/auth/session-cookie";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const optional = req.nextUrl.searchParams.get("optional") === "1";
    const session = await auth();

    if (!session?.user) {
      if (optional) {
        return NextResponse.json({ authenticated: false }, { status: 200 });
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const rows = await sql`
      SELECT
        u.role,
        u.is_suspended,
        wp.is_verified AS worker_is_verified,
        wp.verification_status AS worker_verification_status,
        (
          wp.fayda_doc_url IS NOT NULL
          AND length(wp.fayda_doc_url) > 0
          AND wp.fin_last4 IS NOT NULL
          AND length(wp.fin_last4) = 4
          AND wp.fin_encrypted IS NOT NULL
          AND length(wp.fin_encrypted) > 0
        ) AS worker_identity_complete
      FROM users u
      LEFT JOIN worker_profiles wp ON wp.user_id = u.id
      WHERE u.id = ${userId}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const userRow = rows[0];

    return NextResponse.json({
      id: userId,
      email: session.user.email,
      name: session.user.name,
      role: userRow.role,
      emailVerified: session.user.emailVerified,
      authenticated: true,
      isSuspended: userRow.is_suspended ?? false,
      workerIsVerified: Boolean(userRow.worker_is_verified && userRow.worker_identity_complete),
      workerVerificationStatus: userRow.worker_identity_complete === false && userRow.worker_verification_status === "approved" ? "incomplete" : userRow.worker_verification_status ?? null,
      workerIdentityComplete: userRow.worker_identity_complete ?? null,
      workerIsSuspended: userRow.is_suspended ?? false,
    });

  } catch (error) {
    if (isAuthSessionUnavailableError(error)) {
      return NextResponse.json(
        { error: "Authentication service temporarily unavailable" },
        { status: 503 }
      );
    }
    console.error("[AUTH_ME_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
