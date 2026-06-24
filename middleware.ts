import { auth } from "@/lib/auth/server";
import { NextResponse, NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  try {
    // Check for required env vars to avoid silent crashes
    if (!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET) {
      console.error("[MIDDLEWARE_ERROR] Missing NEON_AUTH environment variables");
    }

    const headers = new Headers(req.headers);
    const cookieStr = headers.get("cookie");
    if (cookieStr) {
      // Only apply the __Secure- workaround if we are running locally on HTTP.
      // On Vercel (HTTPS), Better Auth expects the native __Secure- cookie.
      const url = new URL(req.url);
      if (url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
        const rewrittenCookie = cookieStr
          .replace(/neon-auth\.session_token=/g, "__Secure-neon-auth.session_token=")
          .replace(/neon-auth\.session_data=/g, "__Secure-neon-auth.session_data=");
        headers.set("cookie", rewrittenCookie);
      }
    }

    const { data: session } = await auth.getSession({
      fetchOptions: {
        headers: Object.fromEntries(headers.entries()),
      },
    });
    
    const isLoggedIn = !!session;
    let user = session?.user as any;

    // 1. Hydrate role if missing or default "user" using direct neon client
    if (isLoggedIn && user && (user.role === "user" || !user.role) && process.env.DATABASE_URL) {
      try {
        const sql = neon(process.env.DATABASE_URL);
        const rows = await sql`SELECT role FROM users WHERE id = ${user.id}`;
        if (rows && rows[0]) {
          user.role = rows[0].role;
        }
      } catch (e) {
        console.error("[MIDDLEWARE] Role hydration failed:", e);
      }
    }

    // 2. Define Paths
    const isAuthPage = pathname === "/login" || pathname.startsWith("/register") || pathname === "/otp-verification";
    const isClientArea = pathname.startsWith("/client");
    const isWorkerArea = pathname.startsWith("/worker");
    const isAdminArea = pathname.startsWith("/admin");

    // 3. Fail-safe: Missing role
    if (isLoggedIn && !user?.role && (isClientArea || isWorkerArea || isAdminArea)) {
       return NextResponse.redirect(new URL("/?error=role_missing", req.url));
    }

    // 4. Not Logged In
    if (!isLoggedIn && (isClientArea || isWorkerArea || isAdminArea)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 5. Logged In Logic
    if (isLoggedIn) {
      if (isAuthPage) {
        if (user?.role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        if (user?.role === "worker") return NextResponse.redirect(new URL("/worker/dashboard", req.url));
        if (user?.role === "client") return NextResponse.redirect(new URL("/client/search", req.url));
        return NextResponse.next();
      }

      if (isWorkerArea && user?.role !== "worker" && user?.role !== "admin") {
        return NextResponse.redirect(new URL("/client/search", req.url));
      }
      if (isClientArea && user?.role !== "client" && user?.role !== "admin") {
        return NextResponse.redirect(new URL("/worker/dashboard", req.url));
      }
      if (isAdminArea && user?.role !== "admin") {
        return NextResponse.redirect(new URL("/client/search", req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[MIDDLEWARE_CRITICAL_ERROR]", error);
    // In case of a critical error, let the request through to avoid locking the site, 
    // or redirect to a safe error page.
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
