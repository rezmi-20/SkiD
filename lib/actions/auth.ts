"use server";

import { sql } from "@/lib/db";

const MAX_ATTEMPTS = 5;

export async function checkLoginAttempts(email: string, ipAddress: string) {
  try {
    const rows = await sql`
      SELECT COUNT(*)::int as count 
      FROM audit_logs 
      WHERE action = 'login_failed' 
        AND (details->>'email' = ${email} OR ip_address = ${ipAddress})
        AND created_at > NOW() - INTERVAL '15 minutes'
    `;
    const count = rows[0]?.count || 0;
    return count >= MAX_ATTEMPTS;
  } catch (error) {
    console.error("[CHECK_LOGIN_ATTEMPTS_ERROR]", error);
    return false;
  }
}

export async function logLoginAttempt(email: string, success: boolean, ipAddress: string, userAgent: string) {
  try {
    const action = success ? 'login_success' : 'login_failed';
    const details = JSON.stringify({ email });
    await sql`
      INSERT INTO audit_logs (action, details, ip_address, user_agent, created_at)
      VALUES (${action}, ${details}::json, ${ipAddress}, ${userAgent}, NOW())
    `;
  } catch (error) {
    console.error("[LOG_LOGIN_ATTEMPT_ERROR]", error);
  }
}
