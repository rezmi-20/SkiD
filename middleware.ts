import { NextResponse, NextRequest } from "next/server";
import { verifyNeonSessionDataCookie } from "@/lib/auth/session-cookie";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  try {
    const cachedSession = await verifyNeonSessionDataCookie(
      req.cookies.get("neon-auth.local.session_data")?.value
    );
    const hasSessionToken = req.cookies
      .getAll()
      .some((cookie) => cookie.name.includes("session_token"));
    const isLoggedIn = !!cachedSession?.user;

    // Define Paths
    const isAuthPage = pathname === "/login" || pathname.startsWith("/register") || pathname === "/otp-verification";
    const isClientArea = pathname.startsWith("/client");
    const isWorkerArea = pathname.startsWith("/worker");
    const isAdminArea = pathname.startsWith("/admin");

    // Not Logged In - redirect to login
    if (!isLoggedIn && !hasSessionToken && (isClientArea || isWorkerArea || isAdminArea)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Logged In - redirect away from auth pages
    if (isLoggedIn && isAuthPage) {
      // Role-based redirect handled by /auth/callback instead
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[MIDDLEWARE_ERROR]", error);
    // If session check fails, allow the request through
    // Individual pages/api routes will handle auth
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/client/:path*",
    "/worker/:path*",
    "/admin/:path*",
    "/login",
    "/register/:path*",
    "/otp-verification",
  ],
};
