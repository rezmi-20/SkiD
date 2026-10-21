import { auth } from "@/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { checkLoginAttempts, logLoginAttempt } from "@/lib/actions/auth";

export const dynamic = 'force-dynamic';

const handlers = auth.handler();

function createOriginSafeRequest(req: NextRequest): NextRequest {
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";

  // If already localhost or 127.0.0.1, keep as-is
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    return req;
  }

  // Neon Auth upstream requires a trusted origin (localhost is pre-approved by default).
  // When running on external deployments (such as dire-skill.vercel.app), rewrite the upstream
  // Origin/Referer to localhost so Better Auth does not reject with 403 INVALID_ORIGIN.
  const proxyHeaders = new Headers(req.headers);
  proxyHeaders.set("origin", "http://localhost:3000");
  if (referer) {
    proxyHeaders.set("referer", "http://localhost:3000/");
  }

  return new Proxy(req, {
    get(target, prop) {
      if (prop === "headers") return proxyHeaders;
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

function isRemovedDebugAuthPath(req: NextRequest) {
  return new URL(req.url).pathname === "/api/auth/debug-session";
}

export async function GET(req: NextRequest, context: any) {
  if (isRemovedDebugAuthPath(req)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return handlers.GET(createOriginSafeRequest(req), context);
}

export async function POST(req: NextRequest, context: any) {
  if (isRemovedDebugAuthPath(req)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const safeReq = createOriginSafeRequest(req);

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

        const res = await handlers.POST(safeReq, context);

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

  return handlers.POST(safeReq, context);
}

export async function PUT(req: NextRequest, context: any) {
  return handlers.PUT(createOriginSafeRequest(req), context);
}

export async function DELETE(req: NextRequest, context: any) {
  return handlers.DELETE(createOriginSafeRequest(req), context);
}

export async function PATCH(req: NextRequest, context: any) {
  return handlers.PATCH(createOriginSafeRequest(req), context);
}
