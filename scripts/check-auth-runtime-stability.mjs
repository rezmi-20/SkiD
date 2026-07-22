import { readFileSync } from "node:fs";

const checks = [];

function read(path) {
  return readFileSync(path, "utf8");
}

function check(label, condition) {
  checks.push({ label, passed: Boolean(condition) });
}

const proxy = read("proxy.ts");
const authIndex = read("lib/auth/index.ts");
const sessionCookie = read("lib/auth/session-cookie.ts");
const authMe = read("app/api/auth/me/route.ts");
const loginPage = read("app/(auth)/login/page.tsx");
const notificationBell = read("components/shell/NotificationBell.tsx");
const appShell = read("components/shell/AppShell.tsx");
const mobileNav = read("components/shell/MobileNav.tsx");
const signOut = read("app/api/auth/sign-out/route.ts");

check(
  "401 redirects are preserved for confirmed unauthenticated protected routes",
  proxy.includes("!isLoggedIn && (isClientArea || isWorkerArea || isAdminArea)") &&
    proxy.includes('NextResponse.redirect(new URL("/login", req.url))')
);

check(
  "Proxy 5xx/auth-service failures do not redirect to login",
  proxy.includes("isAuthSessionUnavailableError(error)") &&
    proxy.includes("status: 503") &&
    !/catch \(error\)[\s\S]*redirect\(new URL\("\/login"/.test(proxy)
);

check(
  "Temporary auth fetch failure is represented distinctly",
  sessionCookie.includes("class AuthSessionUnavailableError") &&
    authIndex.includes("throw new AuthSessionUnavailableError()")
);

check(
  "Public login session check handles logged-out state without 401 noise",
  authMe.includes('optional = req.nextUrl.searchParams.get("optional") === "1"') &&
    authMe.includes("authenticated: false") &&
    loginPage.includes('/api/auth/me?optional=1')
);

check(
  "Unread-count polling uses GET API instead of server action POST",
  notificationBell.includes('fetch("/api/notifications/unread-count"') &&
    !notificationBell.includes("getUnreadCount")
);

check(
  "Unread-count polling prevents overlapping requests",
  notificationBell.includes("inFlightRef") &&
    notificationBell.includes("if (inFlightRef.current) return")
);

check(
  "Only AppShell owns the authenticated NotificationBell polling source",
  appShell.includes("<NotificationBell role={role} />") &&
    !mobileNav.includes("NotificationBell") &&
    !mobileNav.includes("getUnreadCount")
);

check(
  "Polling failures retain last known count silently",
  notificationBell.includes("Keep the last known count") &&
    !notificationBell.includes("setCount(0)")
);

check(
  "Sign-out still expires Neon Auth cookies",
  signOut.includes("maxAge: 0") &&
    signOut.includes("POST") &&
    signOut.includes("NEON_COOKIE_NAMES")
);

let failed = 0;
for (const result of checks) {
  if (result.passed) {
    console.log(`PASS ${result.label}`);
  } else {
    failed += 1;
    console.error(`FAIL ${result.label}`);
  }
}

if (failed > 0) {
  process.exit(1);
}
