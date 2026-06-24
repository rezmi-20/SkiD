// lib/auth/server.ts
import { createNeonAuth } from '@neondatabase/auth/next/server';

const getBaseUrl = () => {
  // If deployed on Vercel, ALWAYS use the current Vercel deployment URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  
  // Only use NEON_AUTH_BASE_URL if it's not the generic auth.neon.tech placeholder
  if (process.env.NEON_AUTH_BASE_URL && !process.env.NEON_AUTH_BASE_URL.includes("auth.neon.tech")) {
    return process.env.NEON_AUTH_BASE_URL;
  }
  
  return "http://localhost:3000";
};

export const auth = createNeonAuth({
  baseUrl: getBaseUrl(),
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "fallback_secret_must_be_at_least_32_characters_long",
  },
});
