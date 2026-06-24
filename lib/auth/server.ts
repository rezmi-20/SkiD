// lib/auth/server.ts
import { createNeonAuth } from '@neondatabase/auth/next/server';

// baseUrl MUST point to the Neon Auth backend service, NOT the Vercel deployment URL.
// The Neon Auth handler proxies browser requests to this URL.
const baseUrl = process.env.NEON_AUTH_BASE_URL!;

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "fallback_secret_must_be_at_least_32_characters_long",
  },
});
