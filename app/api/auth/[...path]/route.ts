import { auth } from "@/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { checkLoginAttempts, logLoginAttempt } from "@/lib/actions/auth";

export const dynamic = 'force-dynamic';

const handlers = auth.handler();
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
export const PATCH = handlers.PATCH;

function isRemovedDebugAuthPath(req: NextRequest) {
  return new URL(req.url).pathname === "/api/auth/debug-session";
}

export async function GET(req: NextRequest, context: any) {
  if (isRemovedDebugAuthPath(req)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return handlers.GET(req, context);
}

export async function POST(req: NextRequest, context: any) {
  if (isRemovedDebugAuthPath(req)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const url = new URL(req.url);
    if (url.pathname.endsWith("/sign-in/email")) {
      const clone = req.clone();
      const body = await clone.json();
      const email = body.email;
      const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
      const userAgent = req.headers.get("user-agent") || "unknown";

      if (email) {
        const isLockedOut = await checkLoginAttempts(email, ipAddress);
        if (isLockedOut) {
          return NextResponse.json(
            { error: "Too many failed attempts. Try again in 15 minutes." },
            { status: 429 }
          );
        }

        const res = await handlers.POST(req, context);

        if (res.status >= 200 && res.status < 300) {
          await logLoginAttempt(email, true, ipAddress, userAgent);
        } else {
          await logLoginAttempt(email, false, ipAddress, userAgent);
        }

        return res;
      }
    }
  } catch (error) {
    console.error("[ROUTE_AUTH_INTERCEPT_ERROR]", error);
  }

  return handlers.POST(req, context);
}
