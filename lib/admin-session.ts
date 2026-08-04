import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "skid-admin-session";
const DEFAULT_ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

export type AdminSessionPayload = {
  adminId: string;
  employeeId: string;
  role: string;
  sessionVersion: number;
};

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.NEON_AUTH_COOKIE_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionCookie(payload: AdminSessionPayload) {
  const expiresAt = Math.floor(Date.now() / 1000) + DEFAULT_ADMIN_SESSION_TTL_SECONDS;
  return new SignJWT({ ...payload, typ: "admin_employee" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecret());
}

export async function verifyAdminSessionCookieValue(value?: string | null): Promise<AdminSessionPayload | null> {
  if (!value) return null;
  try {
    const { payload } = await jwtVerify(value, getSecret(), { algorithms: ["HS256"] });
    if (payload.typ !== "admin_employee") return null;
    if (typeof payload.adminId !== "string") return null;
    if (typeof payload.employeeId !== "string") return null;
    if (typeof payload.role !== "string") return null;
    return {
      adminId: payload.adminId,
      employeeId: payload.employeeId,
      role: payload.role,
      sessionVersion: Number(payload.sessionVersion || 0),
    };
  } catch {
    return null;
  }
}

export async function getAdminSessionFromCookies() {
  const cookieStore = await cookies();
  return verifyAdminSessionCookieValue(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function setAdminSession(payload: AdminSessionPayload) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, await createAdminSessionCookie(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEFAULT_ADMIN_SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
