// lib/auth/index.ts - Compatibility wrapper for Neon Auth
import { auth as serverAuth } from "./server";
import { sql } from "../db";
import { cookies } from "next/headers";
import { getNeonSessionFromCookies } from "./session-cookie";

// Server pages, layouts, and API routes should use this wrapper instead of
// calling serverAuth.getSession() directly. The Neon Auth beta can miss secure
// session-token cookies, but the signed session-data cookie is still reliable.
export const auth = async () => {
  const cookieStore = await cookies();
  let session = await getNeonSessionFromCookies(cookieStore);

  if (!session?.user) {
    try {
      const result = await serverAuth.getSession();
      session = result.data as typeof session;
    } catch (err) {
      console.warn("Neon Auth getSession failed", err);
      return null;
    }
  }

  if (!session?.user) return null;

  try {
    // Fetch role from our DB for compatibility
    const rows = await sql`SELECT role FROM users WHERE id = ${session.user.id}`;
    if (rows && rows[0]) {
      (session.user as any).role = rows[0].role;
    }
  } catch (err) {
    console.error("Auth wrapper role fetch failed", err);
  }

  return session;
};

// Re-export handlers if needed, though they should be used via lib/auth/server
export const handlers = serverAuth.handler;
