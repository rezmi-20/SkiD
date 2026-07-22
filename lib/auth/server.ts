// lib/auth/server.ts
import { createNeonAuth } from '@neondatabase/auth/next/server';

const DEFAULT_SESSION_DATA_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSessionDataTtlSeconds() {
  const configured = process.env.NEON_AUTH_SESSION_DATA_TTL_SECONDS;
  if (!configured) return DEFAULT_SESSION_DATA_TTL_SECONDS;

  const parsed = Number(configured);
  if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);

  console.warn("[AUTH_SESSION_DATA_TTL_INVALID] Falling back to default session cache TTL");
  return DEFAULT_SESSION_DATA_TTL_SECONDS;
}

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    sessionDataTtl: getSessionDataTtlSeconds(),
  },
});
