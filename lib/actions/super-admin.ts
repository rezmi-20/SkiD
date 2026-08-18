"use server";

import { sql } from "@/lib/db";
import { isSuperAdmin } from "@/lib/config";
import { revalidatePath } from "next/cache";
import { getClientIdentityColumns } from "@/lib/client-verification";
import { getWorkerIdentityColumns } from "@/lib/worker-verification-server";
import {
  assertCanModifyAdminAccount,
  requireAdminPermission,
  type AdminRole,
} from "@/lib/admin-authorization";

// ─── Guard ────────────────────────────────────────────────────────────────────
async function requireSuperAdmin() {
  return requireAdminPermission("admin_accounts.read");
}

async function writeAdminAudit(adminId: string, action: string, details: Record<string, unknown>) {
  try {
    await sql`
      INSERT INTO audit_logs (admin_employee_id, action, details)
      VALUES (${adminId}, ${action}, ${JSON.stringify(details)})
    `;
  } catch (error) {
    console.warn("[SA_AUDIT_WARN]", error);
  }
}

// ─── Fetch All Users ──────────────────────────────────────────────────────────
export async function getAllUsers() {
  await requireSuperAdmin();
  const [clientColumns, workerColumns] = await Promise.all([
    getClientIdentityColumns(),
    getWorkerIdentityColumns(),
  ]);

  const rows = await sql.query(`
    SELECT
      u.id,
      u.email,
      u.phone,
      u.role,
      u.is_suspended AS "isSuspended",
      u.created_at AS "createdAt",
      u.admin_role AS "adminRole",
      u.admin_status AS "adminStatus",
      u.admin_activation_required AS "adminActivationRequired",
      u.admin_username AS "adminUsername",
      u.admin_full_name AS "adminFullName",
      u.admin_created_at AS "adminCreatedAt",
      creator.email AS "adminCreatedByEmail",
      ${workerColumns.has("is_verified") ? "wp.is_verified" : "NULL"} AS "workerIsVerified",
      ${workerColumns.has("verification_status") ? "wp.verification_status" : "NULL"} AS "workerVerificationStatus",
      ${clientColumns.has("is_verified") ? "cp.is_verified" : "NULL"} AS "clientIsVerified",
      ${clientColumns.has("verification_status") ? "cp.verification_status" : "NULL"} AS "clientVerificationStatus",
      COALESCE(wp.full_name, cp.full_name) AS "fullName",
      COALESCE(wp.avatar_url, cp.avatar_url) AS "avatarUrl"
    FROM users u
    LEFT JOIN users creator ON u.admin_created_by = creator.id
    LEFT JOIN worker_profiles wp ON u.id = wp.user_id AND u.role = 'worker'
    LEFT JOIN client_profiles cp ON u.id = cp.user_id AND u.role = 'client'
    ORDER BY u.created_at DESC
  `, []);

  const publicUsers = (rows || []).map((r: any) => ({
    id: r.id as string,
    email: r.email as string,
    phone: (r.phone ?? null) as string | null,
    role: r.role as "client" | "worker" | "admin",
    isSuspended: r.isSuspended as boolean,
    workerIsVerified: (r.workerIsVerified ?? null) as boolean | null,
    workerVerificationStatus: (r.workerVerificationStatus ?? null) as string | null,
    clientIsVerified: (r.clientIsVerified ?? null) as boolean | null,
    clientVerificationStatus: (r.clientVerificationStatus ?? null) as string | null,
    createdAt: String(r.createdAt),
    fullName: (r.adminFullName ?? r.fullName ?? null) as string | null,
    avatarUrl: (r.avatarUrl ?? null) as string | null,
    adminRole: (r.adminRole ?? null) as string | null,
    adminStatus: (r.adminStatus ?? null) as string | null,
    adminActivationRequired: (r.adminActivationRequired ?? null) as boolean | null,
    adminUsername: (r.adminUsername ?? null) as string | null,
    adminFullName: (r.adminFullName ?? null) as string | null,
    adminCreatedByEmail: (r.adminCreatedByEmail ?? null) as string | null,
    adminCreatedAt: r.adminCreatedAt ? String(r.adminCreatedAt) : null,
  }));

  const employeeRows = await sql`
    SELECT
      ae.id,
      ae.admin_employee_id,
      ae.work_email,
      ae.phone,
      ae.full_name,
      ae.department,
      ae.admin_role,
      ae.admin_status,
      ae.admin_activation_required,
      ae.admin_identity_reference,
      ae.created_at,
      creator.work_email AS created_by_email
    FROM admin_employees ae
    LEFT JOIN admin_employees creator ON ae.created_by = creator.id
    ORDER BY ae.created_at DESC
  `;

  const adminEmployees = (employeeRows || []).map((r: any) => ({
    id: r.id as string,
    email: r.work_email as string,
    phone: (r.phone ?? null) as string | null,
    role: "admin" as const,
    isSuspended: r.admin_status === "suspended" || r.admin_status === "revoked",
    workerIsVerified: null,
    workerVerificationStatus: null,
    clientIsVerified: null,
    clientVerificationStatus: null,
    createdAt: String(r.created_at),
    fullName: (r.full_name ?? null) as string | null,
    avatarUrl: null,
    adminRole: (r.admin_role ?? null) as string | null,
    adminStatus: (r.admin_status ?? null) as string | null,
    adminActivationRequired: (r.admin_activation_required ?? null) as boolean | null,
    adminEmployeeId: (r.admin_employee_id ?? null) as string | null,
    adminIdentityReference: (r.admin_identity_reference ?? null) as string | null,
    adminFullName: (r.full_name ?? null) as string | null,
    adminCreatedByEmail: (r.created_by_email ?? null) as string | null,
    adminCreatedAt: String(r.created_at),
  }));

  return [...adminEmployees, ...publicUsers];
}

// ─── Suspend / Unsuspend ──────────────────────────────────────────────────────
export async function setSuspendedStatus(userId: string, isSuspended: boolean) {
  const admin = await requireAdminPermission(isSuspended ? "admin_accounts.suspend" : "admin_accounts.reactivate");

  try {
    assertCanModifyAdminAccount(admin, userId, isSuspended ? "suspend" : "reactivate");

    const employeeRows = await sql`
      SELECT id, admin_employee_id, admin_role, admin_status, admin_activation_required
      FROM admin_employees
      WHERE id = ${userId}
      LIMIT 1
    `;
    if (employeeRows.length > 0) {
      if (employeeRows[0].admin_role === "super_admin") {
        return { success: false, error: "The owner super admin account cannot be suspended here." };
      }
      const rows = await sql`
        UPDATE admin_employees
        SET
          admin_status = CASE
            WHEN ${isSuspended} THEN 'suspended'
            WHEN admin_activation_required THEN 'activation_required'
            ELSE 'active'
          END,
          session_version = session_version + 1,
          updated_at = NOW()
        WHERE id = ${userId}
        RETURNING id, admin_employee_id, admin_role, admin_status
      `;

      await writeAdminAudit(admin.id, "admin_employee_suspension_changed", {
        targetAdminEmployeeId: userId,
        targetEmployeeId: rows[0].admin_employee_id,
        targetRole: rows[0].admin_role,
        adminStatus: rows[0].admin_status,
        isSuspended,
        timestamp: new Date().toISOString(),
      });

      revalidatePath("/admin/users");
      revalidatePath("/admin/dashboard");
      return { success: true };
    }

    const rows = await sql`
      UPDATE users
      SET
        is_suspended = ${isSuspended},
        admin_status = CASE
          WHEN role = 'admin' THEN ${isSuspended ? "suspended" : "active"}
          ELSE admin_status
        END,
        admin_updated_at = CASE
          WHEN role = 'admin' THEN NOW()
          ELSE admin_updated_at
        END
      WHERE id = ${userId}
      RETURNING id, email, role, is_suspended
    `;

    if (rows.length === 0) {
      return { success: false, error: "User not found." };
    }

    await writeAdminAudit(admin.id, "admin_user_suspension_changed", {
      targetUserId: userId,
      targetRole: rows[0].role,
      isSuspended,
      timestamp: new Date().toISOString(),
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/clients");
    revalidatePath(`/admin/clients/${userId}/verify`);
    revalidatePath("/admin/workers");
    revalidatePath("/admin/verify");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err) {
    console.error("[SA_SUSPEND_ERROR]", err);
    return { success: false, error: "Failed to update suspension status." };
  }
}

// ─── Promote / Demote Role ────────────────────────────────────────────────────
export async function setUserRole(userId: string, role: "client" | "worker" | "admin") {
  const admin = await requireAdminPermission("admin_accounts.assign_role");
  if (role === "admin") {
    return {
      success: false,
      error: "Administrator employee accounts are created separately by the super admin. Public users cannot be promoted directly.",
    };
  }

  try {
    assertCanModifyAdminAccount(admin, userId, "assign_role");

    const targetRows = await sql`
      SELECT
        u.role,
        u.email,
        EXISTS (
          SELECT 1 FROM worker_profiles wp WHERE wp.user_id = u.id
        ) AS "hasWorkerProfile",
        EXISTS (
          SELECT 1 FROM client_profiles cp WHERE cp.user_id = u.id
        ) AS "hasClientProfile"
      FROM users u
      WHERE u.id = ${userId}
      LIMIT 1
    `;

    if (targetRows.length === 0) {
      return { success: false, error: "User not found." };
    }

    const currentRole = targetRows[0].role as "client" | "worker" | "admin";
    const targetEmail = String(targetRows[0].email || "");
    if (isSuperAdmin(targetEmail)) {
      return { success: false, error: "The configured super admin account must remain an admin." };
    }

    const hasWorkerProfile = Boolean(targetRows[0].hasWorkerProfile);
    const hasClientProfile = Boolean(targetRows[0].hasClientProfile);

    const nextRole =
      currentRole === "admin"
        ? hasWorkerProfile
          ? "worker"
          : hasClientProfile
            ? "client"
            : "client"
        : role;

    await sql`
      UPDATE users
      SET
        role = ${nextRole},
        admin_role = CASE WHEN ${nextRole} = 'admin' THEN COALESCE(admin_role, 'user_support_admin') ELSE NULL END,
        admin_status = CASE WHEN ${nextRole} = 'admin' THEN COALESCE(admin_status, 'active') ELSE NULL END,
        admin_activation_required = CASE WHEN ${nextRole} = 'admin' THEN admin_activation_required ELSE false END,
        admin_created_at = CASE WHEN ${nextRole} = 'admin' THEN COALESCE(admin_created_at, NOW()) ELSE NULL END,
        admin_created_by = CASE WHEN ${nextRole} = 'admin' THEN COALESCE(admin_created_by, ${admin.id}) ELSE NULL END,
        admin_updated_at = CASE WHEN ${nextRole} = 'admin' THEN NOW() ELSE NULL END
      WHERE id = ${userId}
    `;

    await writeAdminAudit(admin.id, "admin_user_role_changed", {
      targetUserId: userId,
      oldRole: currentRole,
      requestedRole: role,
      newRole: nextRole,
      timestamp: new Date().toISOString(),
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/workers");
    revalidatePath("/admin/verify");
    return { success: true, role: nextRole };
  } catch (err) {
    console.error("[SA_ROLE_ERROR]", err);
    return { success: false, error: "Failed to update user role." };
  }
}

export async function setAdminAccountRole(userId: string, adminRole: AdminRole) {
  await requireAdminPermission("admin_accounts.assign_role");
  void userId;
  void adminRole;
  return {
    success: false,
    error: "Administrator employee role changes must use the separate employee-admin governance flow.",
  };
}

// ─── Create Admin Account ─────────────────────────────────────────────────────
export async function createAdminAccount(data: {
  email: string;
  password: string;
  fullName: string;
  adminRole?: AdminRole;
}) {
  await requireAdminPermission("admin_accounts.create");
  void data;
  return {
    success: false,
    error: "Use the secure administrator creation flow with offline identity confirmation.",
  };
}

// ─── Delete User (Hard Delete) ────────────────────────────────────────────────
export async function deleteUser(userId: string) {
  const admin = await requireAdminPermission("admin_accounts.suspend");

  if (userId === admin.id) {
    return { success: false, error: "You cannot delete your own super admin account." };
  }

  try {
    const employeeRows = await sql`
      SELECT id, admin_employee_id, admin_role
      FROM admin_employees
      WHERE id = ${userId}
      LIMIT 1
    `;
    if (employeeRows.length > 0) {
      return {
        success: false,
        error: "Administrator employee accounts are not deleted from public user management. Suspend or reset the employee account instead.",
      };
    }

    const targetRows = await sql`
      SELECT id, email, role
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (targetRows.length === 0) {
      return { success: false, error: "User not found." };
    }

    if (isSuperAdmin(targetRows[0].email)) {
      return { success: false, error: "The configured super admin account cannot be deleted." };
    }

    const blockerRows = await sql`
      SELECT
        (SELECT COUNT(*)::int FROM jobs WHERE client_id = ${userId} OR worker_id = ${userId}) AS jobs,
        (SELECT COUNT(*)::int FROM contract_signatures WHERE user_id = ${userId}) AS signatures,
        (SELECT COUNT(*)::int FROM ratings WHERE rater_id = ${userId} OR rated_id = ${userId}) AS ratings,
        (SELECT COUNT(*)::int FROM conversations WHERE client_id = ${userId} OR worker_id = ${userId}) AS conversations,
        (SELECT COUNT(*)::int FROM messages WHERE sender_id = ${userId}) AS messages,
        (SELECT COUNT(*)::int FROM disputes WHERE client_id = ${userId} OR worker_id = ${userId}) AS disputes,
        (SELECT COUNT(*)::int FROM audit_logs WHERE user_id = ${userId}) AS audit_history
    `;
    const blockers = blockerRows[0] || {};
    const blockingLabels = Object.entries(blockers)
      .filter(([, value]) => Number(value) > 0)
      .map(([key, value]) => `${value} ${key}`);

    if (blockingLabels.length > 0) {
      return {
        success: false,
        error: `This account has business records (${blockingLabels.join(", ")}). Suspend it instead of deleting so legal and payment history remains intact.`,
      };
    }

    await sql.transaction([
      sql`DELETE FROM community_comments WHERE post_id IN (SELECT id FROM community_posts WHERE user_id = ${userId})`,
      sql`DELETE FROM community_likes WHERE post_id IN (SELECT id FROM community_posts WHERE user_id = ${userId})`,
      sql`DELETE FROM community_flags WHERE post_id IN (SELECT id FROM community_posts WHERE user_id = ${userId})`,
      sql`DELETE FROM community_comments WHERE user_id = ${userId}`,
      sql`DELETE FROM community_likes WHERE user_id = ${userId}`,
      sql`DELETE FROM community_flags WHERE user_id = ${userId}`,
      sql`DELETE FROM community_posts WHERE user_id = ${userId}`,
      sql`DELETE FROM saved_workers WHERE client_id = ${userId} OR worker_id = ${userId}`,
      sql`UPDATE disputes SET admin_id = NULL WHERE admin_id = ${userId}`,
      sql`DELETE FROM users WHERE id = ${userId}`,
    ]);

    await writeAdminAudit(admin.id, "admin_user_deleted", {
      targetUserId: userId,
      targetRole: targetRows[0].role,
      timestamp: new Date().toISOString(),
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/workers");
    revalidatePath("/admin/verify");
    return { success: true };
  } catch (err) {
    console.error("[SA_DELETE_ERROR]", err);
    return { success: false, error: "Failed to delete user. Suspend the account if it has related platform records." };
  }
}
