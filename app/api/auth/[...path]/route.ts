import { auth } from "@/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { checkLoginAttempts, logLoginAttempt } from "@/lib/actions/auth";
import { createHmac } from "node:crypto";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';

const handlers = auth.handler();

function getConfiguredOrigins(req: NextRequest) {
  const values = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.BASE_URL,
    process.env.CALLBACK_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ...(process.env.CORS_ALLOWED_ORIGINS || "").split(","),
  ];

  if (process.env.NODE_ENV !== "production") {
    values.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  const origins = new Set<string>();
  for (const value of values) {
    if (!value?.trim()) continue;
    try {
      origins.add(new URL(value.trim()).origin);
    } catch {
      // Invalid optional origin configuration is ignored. The incoming origin
      // still has to match this request's origin exactly.
    }
  }

  try {
    origins.add(new URL(req.url).origin);
  } catch {
    // The framework provides a valid request URL; keep the check fail-closed
    // if that assumption ever changes.
  }

  return origins;
}

function hasTrustedOrigin(req: NextRequest) {
  const origin = req.headers.get("origin") || req.headers.get("referer");
  if (!origin) return req.method === "GET" || req.method === "HEAD";
  try {
    const parsed = new URL(origin);
    return (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      getConfiguredOrigins(req).has(parsed.origin);
  } catch {
    return false;
  }
}

function isRemovedDebugAuthPath(req: NextRequest) {
  return new URL(req.url).pathname === "/api/auth/debug-session";
}

function normalizePhoneIdentifier(value: string) {
  if (value.length > 32 || !/^[+\d\s().-]+$/.test(value)) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("251")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return /^\d{9}$/.test(digits) ? digits : null;
}

async function resolvePhoneIdentifier(value: string) {
  const normalizedPhone = normalizePhoneIdentifier(value);
  if (!normalizedPhone) return null;

  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!secret) throw new Error("Phone authentication is not configured.");

  const phoneHash = createHmac("sha256", secret).update(normalizedPhone).digest("hex");
  const rows = await sql`
    SELECT email
    FROM users
    WHERE regexp_replace(phone, '[^0-9]', '', 'g') ~ '^(251|0)?[0-9]{9}$'
      AND regexp_replace(regexp_replace(phone, '[^0-9]', '', 'g'), '^(251|0)', '') = ${normalizedPhone}
    LIMIT 1
  `;

  const email = typeof rows?.[0]?.email === "string" ? rows[0].email.trim() : "";
  // Old phone-only identities have no Neon Auth account. Treat them like an
  // unknown phone and keep the same generic sign-in response.
  if (email && !email.toLowerCase().startsWith("phone-")) {
    return { email, rateLimitKey: email.toLowerCase() };
  }

  // A deterministic, non-routable identifier lets the existing login limit
  // apply without recording or returning the raw phone number.
  return {
    email: `phone-${phoneHash}@invalid.invalid`,
    rateLimitKey: `phone-${phoneHash}@invalid.invalid`,
  };
}

function createRewrittenAuthRequest(req: NextRequest, body: any, email: string) {
  const headers = new Headers(req.headers);
  headers.delete("content-length");
  headers.set("content-type", "application/json");
  return new NextRequest(req.url, {
    method: req.method,
    headers,
    body: JSON.stringify({ ...body, email }),
  });
}

function invalidCredentialsResponse() {
  return NextResponse.json(
    { message: "Invalid email or password.", code: "INVALID_CREDENTIALS" },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}

async function proxySignInWithRateLimit(
  req: NextRequest,
  context: any,
  body: any,
  email: string,
  rateLimitKey: string,
) {
  const forwardedRequest = createRewrittenAuthRequest(req, body, email);
  const trustedProxyIp = req.headers.get("x-vercel-forwarded-for") || req.headers.get("x-real-ip");
  const forwardedFor = process.env.VERCEL ? "" : req.headers.get("x-forwarded-for") || "";
  const ipAddress = (trustedProxyIp || forwardedFor).split(",")[0]?.trim() || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "unknown";

  let isLockedOut: boolean;
  try {
    isLockedOut = await checkLoginAttempts(rateLimitKey, ipAddress);
  } catch {
    console.error("[LOGIN_RATE_LIMIT_UNAVAILABLE]");
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Please retry shortly." },
      { status: 503, headers: { "Retry-After": "30", "Cache-Control": "no-store" } },
    );
  }

  if (isLockedOut) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in 15 minutes." },
      { status: 429, headers: { "Retry-After": "900", "Cache-Control": "no-store" } },
    );
  }

  const response = await handlers.POST(forwardedRequest, context);
  await logLoginAttempt(rateLimitKey, response.status >= 200 && response.status < 300, ipAddress, userAgent);
  return response;
}

export async function GET(req: NextRequest, context: any) {
  if (isRemovedDebugAuthPath(req)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!hasTrustedOrigin(req)) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  return handlers.GET(req, context);
}

export async function POST(req: NextRequest, context: any) {
  if (isRemovedDebugAuthPath(req)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!hasTrustedOrigin(req)) {
    return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  }

  const path = new URL(req.url).pathname;
  if (path.endsWith("/sign-in/email")) {
    const body = await req.clone().json().catch(() => null);
    const input = typeof body?.email === "string" ? body.email.trim() : "";
    if (input.includes("@")) {
      return proxySignInWithRateLimit(req, context, body, input, input.toLowerCase());
    }
    if (input) {
      try {
        const resolved = await resolvePhoneIdentifier(input);
        if (!resolved) return invalidCredentialsResponse();
        return proxySignInWithRateLimit(req, context, body, resolved.email, resolved.rateLimitKey);
      } catch {
        console.error("[PHONE_AUTH_LOOKUP_FAILED]");
        return NextResponse.json(
          { error: "Sign-in is temporarily unavailable. Please retry shortly." },
          { status: 503, headers: { "Retry-After": "30", "Cache-Control": "no-store" } },
        );
      }
    }
  }

  if (path.endsWith("/email-otp/verify-email") || path.endsWith("/email-otp/send-verification-otp")) {
    const body = await req.clone().json().catch(() => null);
    const input = typeof body?.email === "string" ? body.email.trim() : "";
    if (input && !input.includes("@")) {
      try {
        const resolved = await resolvePhoneIdentifier(input);
        if (!resolved) return invalidCredentialsResponse();
        return handlers.POST(createRewrittenAuthRequest(req, body, resolved.email), context);
      } catch {
        console.error("[PHONE_AUTH_LOOKUP_FAILED]");
        return NextResponse.json(
          { error: "Verification is temporarily unavailable. Please retry shortly." },
          { status: 503, headers: { "Retry-After": "30", "Cache-Control": "no-store" } },
        );
      }
    }
  }

  return handlers.POST(req, context);
}

export async function PUT(req: NextRequest, context: any) {
  if (!hasTrustedOrigin(req)) return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  return handlers.PUT(req, context);
}

export async function DELETE(req: NextRequest, context: any) {
  if (!hasTrustedOrigin(req)) return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  return handlers.DELETE(req, context);
}

export async function PATCH(req: NextRequest, context: any) {
  if (!hasTrustedOrigin(req)) return NextResponse.json({ error: "Untrusted request origin." }, { status: 403 });
  return handlers.PATCH(req, context);
}
