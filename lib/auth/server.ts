// lib/auth/server.ts
import { createNeonAuth } from '@neondatabase/auth/next/server';

const getBaseUrl = () => {
  // If deployed on Vercel, ALWAYS use the current Vercel deployment URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  
  // Only use NEON_AUTH_BASE_URL if it's not the generic auth.neon.tech placeholder
  if (process.env.NEON_AUTH_BASE_URL && !process.env.NEON_AUTH_BASE_URL.includes("auth.neon.tech")) {
    return process.env.NEON_AUTH_BASE_URL;
  }
  
  return "http://localhost:3000";
};

const getTrustedOrigins = () => {
  const origins = ["https://ski-d.vercel.app"]; // Hardcoded production custom domain
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  if (process.env.VERCEL_BRANCH_URL) origins.push(`https://${process.env.VERCEL_BRANCH_URL}`);
  if (process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`);
  return [...new Set(origins)]; // Remove duplicates
};

export const auth = createNeonAuth({
  baseUrl: getBaseUrl(),
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "fallback_secret_must_be_at_least_32_characters_long",
  },
  // @ts-ignore - Neon Auth wrapper doesn't export this type, but Better Auth natively supports it
  trustedOrigins: getTrustedOrigins(),
});
