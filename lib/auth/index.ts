// lib/auth/index.ts - Compatibility wrapper for Neon Auth
import { auth as serverAuth } from "./server";
import { sql } from "../db";
import { cookies } from "next/headers";
import {
  AuthSessionUnavailableError,
  getNeonSessionFromCookies,
  isAuthSessionUnavailableError,
} from "./session-cookie";

// Server pages, layouts, and API routes should use this wrapper instead of
// calling serverAuth.getSession() directly. The Neon Auth beta can miss secure
// session-token cookies, but the signed session-data cookie is still reliable.
export const auth = async () => {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const hasAuthCookie = allCookies.some((cookie) => cookie.name.includes("neon-auth"));
  let session = await getNeonSessionFromCookies(cookieStore);

  if (!session?.user) {
    try {
      const result = await serverAuth.getSession();
      session = result.data as typeof session;
    } catch (err) {
      console.warn("Neon Auth getSession failed", err);
      if (hasAuthCookie || isAuthSessionUnavailableError(err)) {
        throw new AuthSessionUnavailableError();
      }
      return null;
    }
  }

  if (!session?.user) return null;

  try {
    // Fetch account state from our DB for compatibility
    const rows = await sql`
      SELECT
        role,
        is_suspended AS "isSuspended",
        admin_role AS "adminRole",
        admin_status AS "adminStatus",
        admin_activation_required AS "adminActivationRequired"
      FROM users
      WHERE id = ${session.user.id}
    `;
    if (rows && rows[0]) {
      (session.user as any).isSuspended = rows[0].isSuspended ?? false;
      (session.user as any).role = rows[0].isSuspended ? "suspended" : rows[0].role;
      (session.user as any).adminRole = rows[0].adminRole ?? null;
      (session.user as any).adminStatus = rows[0].adminStatus ?? null;
      (session.user as any).adminActivationRequired = rows[0].adminActivationRequired ?? false;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/admin_role|admin_status|admin_activation_required/i.test(message)) {
      try {
        const rows = await sql`
          SELECT role, is_suspended AS "isSuspended"
          FROM users
          WHERE id = ${session.user.id}
        `;
        if (rows && rows[0]) {
          (session.user as any).isSuspended = rows[0].isSuspended ?? false;
          (session.user as any).role = rows[0].isSuspended ? "suspended" : rows[0].role;
        }
      } catch (fallbackError) {
        console.error("Auth wrapper role fallback failed", fallbackError);
      }
    } else {
      console.error("Auth wrapper role fetch failed", err);
    }
  }

  return session;
};

// Re-export handlers if needed, though they should be used via lib/auth/server
export const handlers = serverAuth.handler;
