import { getNeonSessionFromCookies } from "@/lib/auth/session-cookie";
import { NextResponse, NextRequest } from "next/server";
import { sql } from "@/lib/db";

function getAllowedOrigins(req: NextRequest) {
  const configured = (process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const envOrigins = [process.env.NEXT_PUBLIC_APP_URL, process.env.BASE_URL]
    .filter(Boolean)
    .map((value) => String(value).trim());

  return new Set([...configured, ...envOrigins, req.nextUrl.origin]);
}

function applyCorsHeaders(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get("origin");
  if (!origin) return res;

  const allowedOrigins = getAllowedOrigins(req);
  if (!allowedOrigins.has(origin)) return res;

  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.headers.set("Vary", "Origin");
  return res;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  if (isApiRoute) {
    if (req.method === "OPTIONS") {
      return applyCorsHeaders(req, new NextResponse(null, { status: 204 }));
    }

    return applyCorsHeaders(req, NextResponse.next());
  }

  try {
    // Read session directly from request cookies instead of calling next/headers cookies()
    const session = await getNeonSessionFromCookies(req.cookies);
    const isLoggedIn = !!session?.user;
    const user = session?.user as any;

    const isAuthPage = pathname === "/login" || pathname.startsWith("/register") || pathname === "/otp-verification";
    const isClientArea = pathname.startsWith("/client");
    const isWorkerArea = pathname.startsWith("/worker");
    const isAdminArea = pathname.startsWith("/admin");

    if (!isLoggedIn && (isClientArea || isWorkerArea || isAdminArea)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (isLoggedIn && isAuthPage) {
      // Query the database for the user role only if they are logged in and trying to access the login/register pages
      const rows = await sql`SELECT role FROM users WHERE id = ${user.id}`;
      const dbRole = rows[0]?.role;
      if (dbRole === "client") return NextResponse.redirect(new URL("/client/search", req.url));
      if (dbRole === "worker") return NextResponse.redirect(new URL("/worker/dashboard", req.url));
      if (dbRole === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[MIDDLEWARE_ERROR]", error);
    if (pathname.startsWith("/client") || pathname.startsWith("/worker") || pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
