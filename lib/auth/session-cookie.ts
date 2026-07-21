import { jwtVerify } from "jose";

export type NeonCachedSession = {
  session?: {
    userId?: string;
    expiresAt?: unknown;
    token?: string;
    [key: string]: unknown;
  };
  user: {
    id: string;
    email?: string;
    role?: string | null;
    emailVerified?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

const SESSION_COOKIE_SECRET = process.env.NEON_AUTH_COOKIE_SECRET;
const SESSION_DATA_COOKIE_NAME = "neon-auth.local.session_data";

export async function verifyNeonSessionDataCookie(
  value?: string | null
): Promise<NeonCachedSession | null> {
  if (!value) return null;
  if (!SESSION_COOKIE_SECRET) {
    console.warn("[AUTH_SESSION_COOKIE_SECRET_MISSING]");
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      value,
      new TextEncoder().encode(SESSION_COOKIE_SECRET),
      { algorithms: ["HS256"] }
    );

    if (!payload.user || typeof payload.user !== "object") return null;
    return payload as NeonCachedSession;
  } catch (error) {
    console.warn("[AUTH_SESSION_COOKIE_INVALID]", error);
    return null;
  }
}

export async function getNeonSessionFromCookies(cookieStore: {
  get(name: string): { value: string } | undefined;
  getAll(): Array<{ name: string; value: string }>;
}): Promise<NeonCachedSession | null> {
  const cachedSession = await verifyNeonSessionDataCookie(
    cookieStore.get(SESSION_DATA_COOKIE_NAME)?.value
  );

  if (cachedSession?.user) return cachedSession;

  return getNeonSessionFromTokenCookie(cookieStore.getAll());
}

async function getNeonSessionFromTokenCookie(
  allCookies: Array<{ name: string; value: string }>
): Promise<NeonCachedSession | null> {
  const sessionTokenCookie = allCookies.find((cookie) =>
    cookie.name.includes("session_token")
  );

  if (!sessionTokenCookie) return null;

  try {
    if (!process.env.NEON_AUTH_BASE_URL) {
      console.warn("[AUTH_SESSION_TOKEN_FALLBACK_SKIPPED] NEON_AUTH_BASE_URL not set");
      return null;
    }
    const response = await fetch(`${process.env.NEON_AUTH_BASE_URL}/get-session`, {
      headers: {
        Cookie: `${sessionTokenCookie.name}=${sessionTokenCookie.value}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn("[AUTH_SESSION_TOKEN_FETCH_FAILED]", response.status, response.statusText);
      return null;
    }

    const session = await response.json();
    if (!session?.user || !session?.session) return null;

    return session as NeonCachedSession;
  } catch (error) {
    console.warn("[AUTH_SESSION_TOKEN_FALLBACK_FAILED]", error);
    return null;
  }
}
