// lib/auth/server.ts
import { createNeonAuth } from '@neondatabase/auth/next/server';

const baseUrl = process.env.NEON_AUTH_BASE_URL!;

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "fallback_secret_must_be_at_least_32_characters_long",
    sessionDataTtl: 60 * 60 * 24 * 7,
  },
});
