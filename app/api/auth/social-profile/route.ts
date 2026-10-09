import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { sanitizeText } from "@/lib/sanitize";
import { getWorkerAccessRoute } from "@/lib/worker-routing";

export const dynamic = "force-dynamic";

const completeSocialProfileSchema = z.object({
  role: z.enum(["client", "worker"]),
  fullName: z.string().min(2).max(255),
  phone: z.string().min(9).max(20).regex(/^\+?[0-9\-() ]{9,20}$/, "Invalid phone number format"),
});

async function getExistingUserRoute(userId: string) {
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

  const user = rows[0];
  if (!user) return null;
  if (user.is_suspended) return "/login?error=suspended";
  if (user.role === "worker") {
    return getWorkerAccessRoute({
      role: user.role,
      isSuspended: user.is_suspended,
      isVerified: Boolean(user.worker_is_verified && user.worker_identity_complete),
      verificationStatus: user.worker_identity_complete === false && user.worker_verification_status === "approved" ? "incomplete" : user.worker_verification_status,
      identityComplete: user.worker_identity_complete,
    });
  }
  if (user.role === "client") return "/client/search";
  return "/login?error=unknown_role";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const route = await getExistingUserRoute(session.user.id);
  return NextResponse.json({
    completed: Boolean(route),
    route,
    email: session.user.email ?? "",
    name: session.user.name ?? "",
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Sign in with Google again before completing your profile." }, { status: 401 });
  }

  const existingRoute = await getExistingUserRoute(session.user.id);
  if (existingRoute) {
    return NextResponse.json({ completed: true, route: existingRoute });
  }

  const body = await req.json().catch(() => null);
  const parsed = completeSocialProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile details.", details: parsed.error.flatten() }, { status: 400 });
  }

  const emailRows = await sql`
    SELECT id
    FROM users
    WHERE lower(email) = lower(${session.user.email})
    LIMIT 1
  `;

  if (emailRows[0] && emailRows[0].id !== session.user.id) {
    return NextResponse.json(
      { error: "An account already exists with this email. Sign in with email and password, then connect Google from account settings when available." },
      { status: 409 },
    );
  }

  const fullName = sanitizeText(parsed.data.fullName);
  const phone = parsed.data.phone.trim();

  try {
    await sql`
      INSERT INTO users (id, email, password_hash, role, phone)
      VALUES (${session.user.id}, ${session.user.email}, 'managed_by_neon_auth_google', ${parsed.data.role}, ${phone})
    `;

    if (parsed.data.role === "worker") {
      await sql`
        INSERT INTO worker_profiles (user_id, full_name, verification_status, is_verified)
        VALUES (${session.user.id}, ${fullName}, 'pending', false)
      `;
    } else {
      await sql`
        INSERT INTO client_profiles (user_id, full_name, verification_status, is_verified)
        VALUES (${session.user.id}, ${fullName}, 'not_started', false)
      `;
    }

    const route = await getExistingUserRoute(session.user.id);
    return NextResponse.json({ completed: true, route: route || "/login" }, { status: 201 });
  } catch (error: any) {
    console.error("[SOCIAL_PROFILE_COMPLETE_ERROR]", error);
    if (error.code === "23505" || error.message?.includes("unique constraint")) {
      return NextResponse.json({ error: "Account profile already exists. Please sign in again." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not complete social profile." }, { status: 500 });
  }
}
