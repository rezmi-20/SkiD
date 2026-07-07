"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/config";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// ─── Guard ────────────────────────────────────────────────────────────────────
async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user || !isSuperAdmin((session.user as any).email)) {
    throw new Error("Forbidden: Super Admin access required.");
  }
  return session;
}

// ─── Fetch All Users ──────────────────────────────────────────────────────────
export async function getAllUsers() {
  await requireSuperAdmin();

  const rows = await sql`
    SELECT
      u.id,
      u.email,
      u.phone,
      u.role,
      u.is_suspended AS "isSuspended",
      u.created_at AS "createdAt",
      COALESCE(wp.full_name, cp.full_name) AS "fullName",
      COALESCE(wp.avatar_url, cp.avatar_url) AS "avatarUrl"
    FROM users u
    LEFT JOIN worker_profiles wp ON u.id = wp.user_id AND u.role = 'worker'
    LEFT JOIN client_profiles cp ON u.id = cp.user_id AND u.role = 'client'
    ORDER BY u.created_at DESC
  `;

  return (rows || []).map((r: any) => ({
    id: r.id as string,
    email: r.email as string,
    phone: (r.phone ?? null) as string | null,
    role: r.role as "client" | "worker" | "admin",
    isSuspended: r.isSuspended as boolean,
    createdAt: String(r.createdAt),
    fullName: (r.fullName ?? null) as string | null,
    avatarUrl: (r.avatarUrl ?? null) as string | null,
  }));
}

// ─── Suspend / Unsuspend ──────────────────────────────────────────────────────
export async function setSuspendedStatus(userId: string, isSuspended: boolean) {
  await requireSuperAdmin();

  try {
    await sql`UPDATE users SET is_suspended = ${isSuspended} WHERE id = ${userId}`;
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    console.error("[SA_SUSPEND_ERROR]", err);
    return { success: false, error: "Database error" };
  }
}

// ─── Promote / Demote Role ────────────────────────────────────────────────────
export async function setUserRole(userId: string, role: "client" | "worker" | "admin") {
  await requireSuperAdmin();

  try {
    await sql`UPDATE users SET role = ${role} WHERE id = ${userId}`;
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    console.error("[SA_ROLE_ERROR]", err);
    return { success: false, error: "Database error" };
  }
}

// ─── Create Admin Account ─────────────────────────────────────────────────────
export async function createAdminAccount(data: {
  email: string;
  password: string;
  fullName: string;
}) {
  await requireSuperAdmin();

  const { email, password, fullName } = data;

  if (!email || !password || !fullName) {
    return { success: false, error: "All fields are required." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  try {
    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) {
      return { success: false, error: "An account with that email already exists." };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await sql`
      INSERT INTO users (email, password_hash, role, is_suspended)
      VALUES (${email.toLowerCase()}, ${passwordHash}, 'admin', false)
    `;

    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    console.error("[SA_CREATE_ADMIN_ERROR]", err);
    return { success: false, error: "Failed to create admin account." };
  }
}

// ─── Delete User (Hard Delete) ────────────────────────────────────────────────
export async function deleteUser(userId: string) {
  await requireSuperAdmin();

  try {
    await sql`DELETE FROM users WHERE id = ${userId}`;
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    console.error("[SA_DELETE_ERROR]", err);
    return { success: false, error: "Failed to delete user." };
  }
}
