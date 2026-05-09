import { auth } from "@/lib/auth/server";
import { NextResponse, NextRequest } from "next/server";
import { neon } from "@neondatabase/serverless";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { data: session } = await auth.getSession(req);
  const isLoggedIn = !!session;
  let user = session?.user as any;

  // 1. Hydrate role if missing or default "user" using direct neon client (Edge compatible)
  // Neon Auth defaults to "user", but we use "client", "worker", "admin".
  if (isLoggedIn && user && (user.role === "user" || !user.role) && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      const rows = await sql`SELECT role FROM users WHERE id = ${user.id}`;
      if (rows && rows[0]) {
        console.log("[MIDDLEWARE] Role hydrated from DB:", rows[0].role);
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

  // 3. Fail-safe: If logged in but role is still missing, we can't decide where to send them
  // To avoid loops, we redirect them to a profile-setup or a generic error if they try to hit protected areas
  if (isLoggedIn && !user?.role && (isClientArea || isWorkerArea || isAdminArea)) {
     console.warn("User logged in but role missing. Redirecting to home to prevent loop.");
     return NextResponse.redirect(new URL("/?error=role_missing", req.url));
  }

  // 4. Not Logged In - Redirect to Login if accessing protected area
  if (!isLoggedIn && (isClientArea || isWorkerArea || isAdminArea)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 5. Logged In Logic
  if (isLoggedIn) {
    // Prevent logged-in users from seeing Auth Pages
    if (isAuthPage) {
      if (user?.role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      if (user?.role === "worker") return NextResponse.redirect(new URL("/worker/dashboard", req.url));
      if (user?.role === "client") return NextResponse.redirect(new URL("/client/search", req.url));
      // If role is still missing, just let them through or send home (avoid loop)
      return NextResponse.next();
    }

    // Role-Based Area Protection
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
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
