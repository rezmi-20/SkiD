import { getNeonSessionFromCookies } from "@/lib/auth/session-cookie";
import { isAuthSessionUnavailableError } from "@/lib/auth/session-cookie";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionCookieValue } from "@/lib/admin-session";
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

const PROTECTED_API_PREFIXES = [
  "/api/admin",
  "/api/auth/profile",
  "/api/clients",
  "/api/contracts",
  "/api/conversations",
  "/api/create-subaccount",
  "/api/initialize-payment",
  "/api/jobs",
  "/api/location",
  "/api/notifications",
  "/api/payments",
  "/api/ratings",
  "/api/upload",
  "/api/workers",
];

async function getAccountState(userId?: string | null) {
  if (!userId) return null;
  try {
    const rows = await sql`
      SELECT role, email, is_suspended, admin_role, admin_status, admin_activation_required
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;
    return rows[0] ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/admin_role|admin_status|admin_activation_required/i.test(message)) throw error;
    const rows = await sql`
      SELECT role, email, is_suspended
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }
}

function isActiveAdminAccount(accountState: any) {
  if (!accountState) return false;
  return accountState.admin_status === "active" && !accountState.admin_activation_required;
}

function isActivationRequiredAdminAccount(accountState: any) {
  if (!accountState) return false;
  return accountState.admin_activation_required || accountState.admin_status === "activation_required";
}

async function getAdminEmployeeState(req: NextRequest) {
  const session = await verifyAdminSessionCookieValue(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session?.adminId) return null;
  const rows = await sql`
    SELECT id, admin_employee_id, admin_role, admin_status, admin_activation_required, session_version
    FROM admin_employees
    WHERE id = ${session.adminId}
    LIMIT 1
  `;
  const account = rows[0] ?? null;
  if (!account) return null;
  if (Number(account.session_version || 0) !== Number(session.sessionVersion || 0)) return null;
  return account;
}

function suspendedLoginUrl(req: NextRequest) {
  const url = new URL("/login", req.url);
  url.searchParams.set("error", "suspended");
  return url;
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith("/api/");

  if (isApiRoute) {
    if (req.method === "OPTIONS") {
      return applyCorsHeaders(req, new NextResponse(null, { status: 204 }));
    }

    const isProtectedApiRoute = PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (isProtectedApiRoute) {
      try {
        const isActivationApi = pathname.startsWith("/api/admin/activation");
        const isAdminSignOutApi = pathname === "/api/admin/sign-out";
        if (pathname.startsWith("/api/admin")) {
          const adminState = await getAdminEmployeeState(req);
          if (isAdminSignOutApi) {
            return applyCorsHeaders(req, NextResponse.next());
          }
          if (isActivationApi && !isActivationRequiredAdminAccount(adminState)) {
            return applyCorsHeaders(req, NextResponse.json({ error: "Activation-required administrator access is required." }, { status: 403 }));
          }
          if (!isActivationApi && !isActiveAdminAccount(adminState)) {
            return applyCorsHeaders(
              req,
              NextResponse.json({ error: "Active administrator access is required." }, { status: 403 }),
            );
          }
        }
      } catch (apiError) {
        if (isAuthSessionUnavailableError(apiError)) {
          return applyCorsHeaders(
            req,
            NextResponse.json(
              { error: "Authentication service temporarily unavailable. Please refresh and try again." },
              { status: 503 },
            ),
          );
        }
        console.error("[PROXY_API_ACCOUNT_STATE_ERROR]", apiError);
        return applyCorsHeaders(
          req,
          NextResponse.json(
            { error: "Unable to verify account status. Please refresh and try again." },
            { status: 503 },
          ),
        );
      }
    }

    return applyCorsHeaders(req, NextResponse.next());
  }

  try {
    const session = await getNeonSessionFromCookies(req.cookies);
    const isLoggedIn = !!session?.user;
    const user = session?.user as any;

    const isAuthPage = pathname === "/login" || pathname.startsWith("/register") || pathname === "/otp-verification";
    const isAdminLoginPage = pathname === "/admin/login";
    const isClientArea = pathname.startsWith("/client");
    const isWorkerArea = pathname.startsWith("/worker");
    const isAdminArea = pathname.startsWith("/admin");
    const isSharedProtectedArea = pathname.startsWith("/contracts/");
    const isProtectedPage = isClientArea || isWorkerArea || isAdminArea || isSharedProtectedArea;

    if (isAdminArea) {
      const adminState = await getAdminEmployeeState(req);
      if (isAdminLoginPage && isActiveAdminAccount(adminState)) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      if (isAdminLoginPage && isActivationRequiredAdminAccount(adminState)) {
        return NextResponse.redirect(new URL("/admin/activate", req.url));
      }
      if (!isAdminLoginPage && isActivationRequiredAdminAccount(adminState)) {
        if (pathname !== "/admin/activate") return NextResponse.redirect(new URL("/admin/activate", req.url));
      } else if (!isAdminLoginPage && pathname !== "/admin/activate" && !isActiveAdminAccount(adminState)) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      } else if (pathname === "/admin/activate" && isActiveAdminAccount(adminState)) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }

    if (!isLoggedIn && (isClientArea || isWorkerArea)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!isLoggedIn && isSharedProtectedArea) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    let accountState = null;
    if (isLoggedIn) {
      accountState = await getAccountState(user.id);
      if (accountState?.is_suspended && isProtectedPage) {
        return NextResponse.redirect(suspendedLoginUrl(req));
      }
    }

    if (isLoggedIn && isAuthPage) {
      const dbRole = accountState?.role;
      if (accountState?.is_suspended) return NextResponse.next();
      if (dbRole === "client") return NextResponse.redirect(new URL("/client/search", req.url));
      if (dbRole === "worker") return NextResponse.redirect(new URL("/worker/dashboard", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[PROXY_ERROR]", error);
    if (pathname.startsWith("/client") || pathname.startsWith("/worker") || pathname.startsWith("/admin")) {
      if (isAuthSessionUnavailableError(error)) {
        return new NextResponse("Authentication service temporarily unavailable. Please refresh and try again.", {
          status: 503,
        });
      }
      return new NextResponse("Unable to verify access. Please refresh and try again.", {
        status: 503,
      });
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
