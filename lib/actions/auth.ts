"use server";

import { sql } from "@/lib/db";

const MAX_ATTEMPTS = 5;

export async function checkLoginAttempts(email: string, ipAddress: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const isLoopback = !ipAddress || ipAddress === "127.0.0.1" || ipAddress === "::1" || ipAddress === "localhost";
  const rows = isLoopback
    ? await sql`
        SELECT COUNT(*)::int as count
        FROM audit_logs
        WHERE action = 'login_failed'
          AND lower(details->>'email') = ${normalizedEmail}
          AND created_at > NOW() - INTERVAL '15 minutes'
      `
    : await sql`
        SELECT COUNT(*)::int as count
        FROM audit_logs
        WHERE action = 'login_failed'
          AND (lower(details->>'email') = ${normalizedEmail} OR ip_address = ${ipAddress})
          AND created_at > NOW() - INTERVAL '15 minutes'
      `;
  const count = Number(rows[0]?.count || 0);
  return count >= MAX_ATTEMPTS;
}

export async function logLoginAttempt(email: string, success: boolean, ipAddress: string, userAgent: string) {
  try {
    const action = success ? 'login_success' : 'login_failed';
    const details = JSON.stringify({ email: email.trim().toLowerCase() });
    await sql`
      INSERT INTO audit_logs (action, details, ip_address, user_agent, created_at)
      VALUES (${action}, ${details}::json, ${ipAddress}, ${userAgent}, NOW())
    `;
  } catch (error) {
    console.error("[LOG_LOGIN_ATTEMPT_ERROR]", error);
  }
}
