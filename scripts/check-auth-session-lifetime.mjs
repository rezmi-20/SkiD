import { readFileSync } from "node:fs";

const checks = [];

function read(path) {
  return readFileSync(path, "utf8");
}

function check(label, condition) {
  checks.push({ label, passed: Boolean(condition) });
}

const authServer = read("lib/auth/server.ts");
const sessionCookie = read("lib/auth/session-cookie.ts");
const signOut = read("app/api/auth/sign-out/route.ts");

check(
  "Neon Auth session_data cache TTL is configured explicitly",
  authServer.includes("sessionDataTtl: getSessionDataTtlSeconds()")
);

check(
  "Configured session_data TTL defaults beyond the Neon Auth 300-second cache",
  authServer.includes("DEFAULT_SESSION_DATA_TTL_SECONDS = 60 * 60 * 24 * 7") &&
    !authServer.includes("sessionDataTtl: 300")
);

check(
  "Session_data TTL can be shortened or extended through environment configuration",
  authServer.includes("NEON_AUTH_SESSION_DATA_TTL_SECONDS") &&
    authServer.includes("Number.isFinite(parsed)") &&
    authServer.includes("parsed > 0")
);

check(
  "Expired or missing local session_data is not trusted as authentication",
  sessionCookie.includes("jwtVerify(") &&
    sessionCookie.includes("catch (error)") &&
    sessionCookie.includes("return null")
);

check(
  "Underlying Neon session token is still used as fallback validation",
  sessionCookie.includes("getNeonSessionFromTokenCookie(cookieStore.getAll())") &&
    sessionCookie.includes('`${process.env.NEON_AUTH_BASE_URL}/get-session`')
);

check(
  "Temporary Neon Auth failures remain distinct from confirmed logout",
  sessionCookie.includes("AuthSessionUnavailableError") &&
    sessionCookie.includes("response.status >= 500")
);

check(
  "Sign-out explicitly deletes local and secure Neon Auth cookies",
  signOut.includes('"neon-auth.local.session_data"') &&
    signOut.includes("maxAge: 0") &&
    signOut.includes("secure: true")
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
