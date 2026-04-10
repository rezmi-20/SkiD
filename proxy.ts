import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user as { role?: string } | undefined;
  const role = user?.role;

  // 1. Define Paths
  const publicPaths = ["/", "/login", "/register", "/api/diag/db"];
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith("/register/")
  );

  // 2. Not Logged In - Redirect to Login if accessing protected area
  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. Logged In Logic
  if (isLoggedIn) {
    // A. Prevent logged-in users from seeing the Landing Page or Auth Pages
    if (pathname === "/" || pathname === "/login" || pathname.startsWith("/register/")) {
      if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      if (role === "worker") return NextResponse.redirect(new URL("/worker/dashboard", req.url));
      if (role === "client") return NextResponse.redirect(new URL("/client/dashboard", req.url));
      
      // If role is somehow missing, logout or send back to /?
      return NextResponse.next();
    }

    // B. Role-Based Area Protection
    // Redirect if trying to access another role's area
    const isWorkerArea = pathname.startsWith("/worker");
    const isClientArea = pathname.startsWith("/client");
    const isAdminArea = pathname.startsWith("/admin");

    if (isWorkerArea && role !== "worker" && role !== "admin") {
      return NextResponse.redirect(new URL("/" + (role || "client") + "/dashboard", req.url));
    }
    if (isClientArea && role !== "client" && role !== "admin") {
      return NextResponse.redirect(new URL("/" + (role || "worker") + "/dashboard", req.url));
    }
    if (isAdminArea && role !== "admin") {
      return NextResponse.redirect(new URL("/" + (role || "client") + "/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
