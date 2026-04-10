import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  const isLoggedIn = !!req.auth;

  // Redirect root to login if not authenticated
  const publicPaths = ["/", "/login", "/register"];
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith("/register/")
  );

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based access control & redirects
  if (isLoggedIn) {
    // Redirect logged-in users away from root/auth pages to their dashboard
    if (pathname === "/" || pathname === "/login" || pathname.startsWith("/register/")) {
      if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      if (role === "worker") return NextResponse.redirect(new URL("/worker/dashboard", req.url));
      if (role === "client") return NextResponse.redirect(new URL("/client/dashboard", req.url));
    }

    if (pathname.startsWith("/client") && role !== "client" && role !== "admin") {
      return NextResponse.redirect(new URL("/client/dashboard", req.url));
    }
    if (pathname.startsWith("/worker") && role !== "worker" && role !== "admin") {
      return NextResponse.redirect(new URL("/worker/dashboard", req.url));
    }
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
