// lib/auth.ts (Compatibility wrapper for Neon Auth)
import { auth as serverAuth } from "./server";
import { sql } from "../db";

import { headers } from "next/headers";

export const auth = async () => {
  const { data: session } = await serverAuth.getSession({
    headers: await headers()
  });
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
export const handlers = serverAuth.handlers;
