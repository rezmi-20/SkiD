import { jwtVerify } from "jose";

export class AuthSessionUnavailableError extends Error {
  constructor(message = "Authentication service temporarily unavailable") {
    super(message);
    this.name = "AuthSessionUnavailableError";
  }
}

export function isAuthSessionUnavailableError(error: unknown) {
  return error instanceof AuthSessionUnavailableError;
}

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
const DEFAULT_SESSION_FETCH_TIMEOUT_MS = 5000;
const MAX_SESSION_FETCH_TIMEOUT_MS = 10000;
const DEFAULT_SESSION_FETCH_RETRIES = 1;
const MAX_SESSION_FETCH_RETRIES = 2;

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSessionFetchTimeoutMs() {
  const configured = Number(process.env.NEON_AUTH_SESSION_FETCH_TIMEOUT_MS);
  if (Number.isFinite(configured) && configured > 0) {
    return clampNumber(Math.floor(configured), 1000, MAX_SESSION_FETCH_TIMEOUT_MS);
  }
  return DEFAULT_SESSION_FETCH_TIMEOUT_MS;
}

function getSessionFetchRetries() {
  const configured = Number(process.env.NEON_AUTH_SESSION_FETCH_RETRIES);
  if (Number.isFinite(configured) && configured >= 0) {
    return clampNumber(Math.floor(configured), 0, MAX_SESSION_FETCH_RETRIES);
  }
  return DEFAULT_SESSION_FETCH_RETRIES;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    const timeoutMs = getSessionFetchTimeoutMs();
    const maxAttempts = 1 + getSessionFetchRetries();

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const startedAt = Date.now();
      try {
        const response = await fetch(`${process.env.NEON_AUTH_BASE_URL}/get-session`, {
          headers: {
            Cookie: `${sessionTokenCookie.name}=${sessionTokenCookie.value}`,
          },
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (!response.ok) {
          const durationMs = Date.now() - startedAt;
          const statusCategory = response.status >= 500 ? "temporary_service" : "unauthenticated";
          console.warn("[AUTH_SESSION_TOKEN_FETCH]", {
            operation: "get-session",
            attempt,
            maxAttempts,
            durationMs,
            status: response.status,
            statusCategory,
          });
          if (response.status >= 500 && attempt < maxAttempts) {
            await sleep(200 * attempt);
            continue;
          }
          if (response.status >= 500) {
            throw new AuthSessionUnavailableError(`Authentication service returned ${response.status}`);
          }
          return null;
        }

        const session = await response.json();
        if (!session?.user || !session?.session) return null;

        return session as NeonCachedSession;
      } catch (error) {
        const durationMs = Date.now() - startedAt;
        console.warn("[AUTH_SESSION_TOKEN_FETCH]", {
          operation: "get-session",
          attempt,
          maxAttempts,
          durationMs,
          statusCategory: "temporary_service",
        });

        if (attempt < maxAttempts) {
          await sleep(200 * attempt);
          continue;
        }

        if (isAuthSessionUnavailableError(error)) {
          throw error;
        }

        throw new AuthSessionUnavailableError();
      }
    }

    return null;
  } catch (error) {
    if (isAuthSessionUnavailableError(error)) {
      throw error;
    }
    console.warn("[AUTH_SESSION_TOKEN_FALLBACK_FAILED]", error);
    throw new AuthSessionUnavailableError();
  }
}
