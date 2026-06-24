// lib/auth/server.ts
import { createNeonAuth } from '@neondatabase/auth/next/server';

const getBaseUrl = () => {
  if (process.env.NEON_AUTH_BASE_URL) return process.env.NEON_AUTH_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export const auth = createNeonAuth({
  baseUrl: getBaseUrl(),
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "fallback_secret_must_be_at_least_32_characters_long",
  },
  trustedOrigins: process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [],
});
