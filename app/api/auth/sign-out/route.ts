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
];

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  
  // Expire all Neon Auth cookies
  for (const name of NEON_COOKIE_NAMES) {
    res.cookies.set(name, "", { maxAge: 0, path: "/" });
    res.cookies.set(name, "", { maxAge: 0, path: "/", secure: true });
  }

  return res;
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ success: true });
  
  // Expire all Neon Auth cookies
  for (const name of NEON_COOKIE_NAMES) {
    res.cookies.set(name, "", { maxAge: 0, path: "/" });
    res.cookies.set(name, "", { maxAge: 0, path: "/", secure: true });
  }

  return res;
}
