import { auth } from "@/lib/auth/server";
import { NextResponse, NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const { data: session } = await auth.getSession(req);
  const isLoggedIn = !!session;
  const user = session?.user as any;

  // 1. Define Paths
  const isAuthPage = pathname === "/login" || pathname.startsWith("/register");
  const isClientArea = pathname.startsWith("/client");
  const isWorkerArea = pathname.startsWith("/worker");
  const isAdminArea = pathname.startsWith("/admin");

  // 2. Not Logged In - Redirect to Login if accessing protected area
  if (!isLoggedIn && (isClientArea || isWorkerArea || isAdminArea)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. Logged In Logic
  if (isLoggedIn) {
    // Prevent logged-in users from seeing Auth Pages
    if (isAuthPage) {
      if (user?.role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      if (user?.role === "worker") return NextResponse.redirect(new URL("/worker/dashboard", req.url));
      return NextResponse.redirect(new URL("/client/search", req.url));
    }

    // Role-Based Area Protection (Note: role might need to be fetched if not in session)
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
