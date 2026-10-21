import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// The Neon Auth session cookie names
const NEON_COOKIE_NAMES = [
  "__Secure-neon-auth.session_token",
  "neon-auth.session_token",
  "neon-auth.local.session_data",
  "__Secure-neon-auth.session_data",
  "neon-auth.session_data",
  "neon-auth.session_challenge",
  "__Secure-neon-auth.session_challenge",
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "better-auth.session_data",
  "__Secure-better-auth.session_data",
  "better-auth.dont_remember",
];

function expireAllAuthCookies(req: NextRequest, res: NextResponse) {
  const namesToClear = new Set<string>(NEON_COOKIE_NAMES);

  for (const cookie of req.cookies.getAll()) {
    const name = cookie.name;
    if (
      (name.includes("neon-auth") || name.includes("better-auth") || name.includes("session")) &&
      !name.includes("admin")
    ) {
      namesToClear.add(name);
    }
  }

  for (const name of namesToClear) {
    res.cookies.set(name, "", {
      maxAge: 0,
      expires: new Date(0),
      path: "/",
      secure: true,
    });
    res.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax`
    );
  }
}

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login?logout=1", req.url));
  expireAllAuthCookies(req, res);
  return res;
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ success: true });
  expireAllAuthCookies(req, res);
  return res;
}
