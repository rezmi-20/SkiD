"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { isSuperAdmin } from "@/lib/config";
import { clearAdminSession, setAdminSession } from "@/lib/admin-session";
import {
  isAdminRole,
  requireActivationRequiredAdmin,
  requireAdmin,
  requireAdminPermission,
  type AdminRole,
} from "@/lib/admin-authorization";
import {
  generateTemporaryAdminPassword,
  hashBetterAuthPassword,
  validateStrongAdminPassword,
  verifyBetterAuthPassword,
} from "@/lib/admin-credentials";

const OPERATIONAL_ADMIN_ROLES: AdminRole[] = [
  "content_verification_admin",
  "dispute_payment_admin",
  "user_support_admin",
];

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function cleanText(value: unknown, max = 255) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

const DEPARTMENTS = [
  "Verification and Content",
  "Dispute and Payments",
  "User Support",
  "Operations",
  "Administration",
] as const;

type CreateAdminFieldErrors = Partial<Record<
  "fullName" | "email" | "phone" | "adminRole" | "department" | "note" | "identityConfirmed",
  string
>>;

function createAdminValidationError(error: string, fieldErrors: CreateAdminFieldErrors = {}) {
  return { success: false as const, error, fieldErrors };
}

function hasObviousSecret(value: string) {
  return /\b(password|passcode|secret|token|fin|passport|national\s*id|staff\s*id|document\s*number)\b/i.test(value);
}

function normalizePhone(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/[\s-]/g, "");
}

function toFormValue(formData: FormData, key: string) {
  return formData.get(key);
}

function normalizeEmployeeId(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function employeePrefixForRole(role: AdminRole) {
  if (role === "content_verification_admin") return "VER";
  if (role === "dispute_payment_admin") return "DSP";
  if (role === "user_support_admin") return "SUP";
  return "OWN";
}

async function generateEmployeeId(role: AdminRole) {
  const prefix = employeePrefixForRole(role);
  const sequence =
    role === "content_verification_admin"
      ? "admin_employee_ver_seq"
      : role === "dispute_payment_admin"
        ? "admin_employee_dsp_seq"
        : role === "user_support_admin"
          ? "admin_employee_sup_seq"
          : "admin_employee_own_seq";
  const rows = await sql.query(`SELECT nextval('${sequence}')::int AS n`, []);
  return `${prefix}-${String(rows[0].n).padStart(4, "0")}`;
}

async function generateAdminIdentityReference() {
  const rows = await sql.query(
    "SELECT 'IVR-' || to_char(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('admin_identity_reference_seq')::text, 4, '0') AS reference",
    [],
  );
  return String(rows[0].reference);
}

async function getCredentialPasswordHash(userId: string) {
  const rows = await sql`
    SELECT password_hash
    FROM admin_employees
    WHERE id = ${userId}
    LIMIT 1
  `;
  return (rows[0]?.password_hash ?? null) as string | null;
}

async function setCredentialPassword(userId: string, password: string) {
  const passwordHash = await hashBetterAuthPassword(password);
  await sql`
    UPDATE admin_employees
    SET password_hash = ${passwordHash},
        updated_at = NOW()
    WHERE id = ${userId}
  `;
}

async function writeAudit(userId: string, action: string, details: Record<string, unknown>) {
  await sql`
    INSERT INTO audit_logs (admin_employee_id, action, details)
    VALUES (${userId}, ${action}, ${JSON.stringify(details)})
  `.catch(() => undefined);
}

export async function loginAdminEmployee(formData: FormData) {
  const employeeId = normalizeEmployeeId(toFormValue(formData, "employeeId"));
  const password = String(toFormValue(formData, "password") || "");
  const genericError = "Invalid Employee ID or password.";

  const rows = await sql`
    SELECT id, admin_employee_id, admin_role, admin_status, admin_activation_required,
           password_hash, temp_credential_expires_at, session_version
    FROM admin_employees
    WHERE lower(admin_employee_id) = lower(${employeeId})
    LIMIT 1
  `;
  const account = rows[0] ?? null;
  if (!account || !(await verifyBetterAuthPassword(account.password_hash, password))) {
    return { success: false, error: genericError };
  }
  if (account.admin_status === "suspended" || account.admin_status === "revoked") {
    return { success: false, error: genericError };
  }

  const activationRequired = Boolean(account.admin_activation_required) || account.admin_status === "activation_required";
  if (activationRequired) {
    const expiresAt = account.temp_credential_expires_at ? new Date(account.temp_credential_expires_at) : null;
    if (expiresAt && expiresAt.getTime() < Date.now()) {
      return { success: false, error: "Temporary credential has expired." };
    }
  }

  await setAdminSession({
    adminId: account.id,
    employeeId: account.admin_employee_id,
    role: account.admin_role,
    sessionVersion: Number(account.session_version || 0),
  });

  return { success: true, redirectTo: activationRequired ? "/admin/activate" : "/admin/dashboard" };
}

export async function signOutAdminEmployee() {
  await clearAdminSession();
  return { success: true };
}

export async function activateAdminAccount(formData: FormData) {
  const admin = await requireActivationRequiredAdmin();
  const passwordResult = validateStrongAdminPassword(toFormValue(formData, "password"));
  if (!passwordResult.ok) return { success: false, error: passwordResult.error };

  const confirmPassword = String(toFormValue(formData, "confirmPassword") || "");
  if (passwordResult.password !== confirmPassword) {
    return { success: false, error: "Password confirmation does not match." };
  }

  const rows = await sql`
    SELECT id, temp_credential_expires_at
    FROM admin_employees
    WHERE id = ${admin.id}
      AND (admin_activation_required = true OR admin_status = 'activation_required')
    LIMIT 1
  `;
  if (rows.length === 0) return { success: false, error: "This administrator account is already active." };

  const expiresAt = rows[0].temp_credential_expires_at
    ? new Date(rows[0].temp_credential_expires_at)
    : null;
  if (expiresAt && expiresAt.getTime() < Date.now()) {
    return { success: false, error: "Temporary credential has expired. Ask a super admin to reset activation." };
  }

  const currentHash = await getCredentialPasswordHash(admin.id);
  if (await verifyBetterAuthPassword(currentHash, passwordResult.password)) {
    return { success: false, error: "New password must be different from the temporary password." };
  }

  await setCredentialPassword(admin.id, passwordResult.password);
  await sql`
    UPDATE admin_employees
    SET admin_activation_required = false,
        admin_status = 'active',
        temp_credential_expires_at = NULL,
        activation_completed_at = NOW(),
        session_version = session_version + 1,
        updated_at = NOW()
    WHERE id = ${admin.id}
    RETURNING session_version
  `;
  const refreshed = await sql`SELECT session_version, admin_employee_id, admin_role FROM admin_employees WHERE id = ${admin.id}`;
  await setAdminSession({
    adminId: admin.id,
    employeeId: refreshed[0].admin_employee_id,
    role: refreshed[0].admin_role,
    sessionVersion: Number(refreshed[0].session_version || 0),
  });
  await writeAudit(admin.id, "admin_account_activated", {
    role: admin.role,
    employeeId: admin.employeeId,
    timestamp: new Date().toISOString(),
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/profile");
  return { success: true, redirectTo: "/admin/dashboard" };
}

export async function getAdminProfile() {
  const admin = await requireAdmin();
  const rows = await sql`
    SELECT
      id,
      admin_employee_id,
      work_email,
      full_name,
      phone,
      department,
      admin_role,
      admin_status,
      activation_completed_at,
      created_at
    FROM admin_employees
    WHERE id = ${admin.id}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function updateAdminPassword(formData: FormData) {
  const admin = await requireAdmin();
  const currentPassword = String(toFormValue(formData, "currentPassword") || "");
  const passwordResult = validateStrongAdminPassword(toFormValue(formData, "password"));
  if (!passwordResult.ok) return { success: false, error: passwordResult.error };

  const confirmPassword = String(toFormValue(formData, "confirmPassword") || "");
  if (passwordResult.password !== confirmPassword) {
    return { success: false, error: "Password confirmation does not match." };
  }

  const currentHash = await getCredentialPasswordHash(admin.id);
  if (!(await verifyBetterAuthPassword(currentHash, currentPassword))) {
    return { success: false, error: "Current password is incorrect." };
  }
  if (await verifyBetterAuthPassword(currentHash, passwordResult.password)) {
    return { success: false, error: "New password must be different from the current password." };
  }

  await setCredentialPassword(admin.id, passwordResult.password);
  await sql`
    UPDATE admin_employees
    SET session_version = session_version + 1,
        updated_at = NOW()
    WHERE id = ${admin.id}
    RETURNING session_version, admin_employee_id, admin_role
  `;
  await clearAdminSession();
  await writeAudit(admin.id, "admin_profile_password_changed", {
    timestamp: new Date().toISOString(),
  });
  revalidatePath("/admin/profile");
  return { success: true, message: "Password updated. Please sign in again with the new password.", redirectTo: "/admin/login" };
}

export async function createAdminAccount(data: {
  fullName: string;
  email: string;
  phone?: string;
  adminRole: AdminRole;
  identityConfirmed?: boolean;
  note?: string;
  department?: string;
}) {
  const actor = await requireAdmin();
  if (actor.role !== "super_admin") {
    return { success: false, error: "Only the active super admin can create administrator accounts." };
  }

  const email = normalizeEmail(data.email);
  const fullName = cleanText(data.fullName, 120);
  const phone = normalizePhone(data.phone) || null;
  const department = cleanText(data.department, 120);
  const note = cleanText(data.note, 500) || null;
  const adminRole = data.adminRole;
  const fieldErrors: CreateAdminFieldErrors = {};

  if (!fullName) fieldErrors.fullName = "Full Name is required.";
  else if (fullName.length < 2 || fullName.length > 120) fieldErrors.fullName = "Full Name must be between 2 and 120 characters.";

  if (!email) fieldErrors.email = "Work Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Enter a valid normalized work email.";

  if (phone && !/^\+251\d{9}$/.test(phone)) {
    fieldErrors.phone = "Use Ethiopian international format, for example +251912345678.";
  }

  if (!isAdminRole(adminRole) || !OPERATIONAL_ADMIN_ROLES.includes(adminRole)) {
    fieldErrors.adminRole = "Choose one of the allowed operational administrator roles.";
  }
  if (adminRole === "super_admin") fieldErrors.adminRole = "Super admin accounts cannot be created from this form.";

  if (!department) fieldErrors.department = "Department is required.";
  else if (!(DEPARTMENTS as readonly string[]).includes(department)) fieldErrors.department = "Choose a listed department.";

  if (note && note.length > 500) fieldErrors.note = "Administrative Note must be 500 characters or fewer.";
  if (note && hasObviousSecret(note)) {
    fieldErrors.note = "Do not enter passwords, FIN, passport, national ID, staff ID, document numbers, or private identity details.";
  }

  if (!data.identityConfirmed) {
    fieldErrors.identityConfirmed = "Offline identity and work-email confirmation is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return createAdminValidationError("Fix the highlighted fields before creating the administrator.", fieldErrors);
  }

  if (isSuperAdmin(email)) return { success: false, error: "The configured owner super-admin account cannot be recreated." };

  const existing = await sql`
    SELECT id FROM admin_employees WHERE lower(work_email) = ${email}
    LIMIT 1
  `;
  if (existing.length > 0) {
    return createAdminValidationError("An employee account with that work email already exists.", {
      email: "An administrator with this work email already exists.",
    });
  }

  const adminId = randomUUID();
  const employeeId = await generateEmployeeId(adminRole);
  const adminIdentityReference = await generateAdminIdentityReference();
  const tempPassword = generateTemporaryAdminPassword();
  const passwordHash = await hashBetterAuthPassword(tempPassword);
  const tempCredentialExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    await sql`
      INSERT INTO admin_employees (
        id,
        admin_employee_id,
        work_email,
        full_name,
        phone,
        department,
        admin_role,
        admin_status,
        admin_activation_required,
        password_hash,
        temp_credential_expires_at,
        admin_identity_reference,
        identity_note,
        created_by,
        created_at,
        updated_at
      )
      VALUES (
        ${adminId},
        ${employeeId},
        ${email},
        ${fullName},
        ${phone},
        ${department},
        ${adminRole},
        'activation_required',
        true,
        ${passwordHash},
        ${tempCredentialExpiresAt},
        ${adminIdentityReference},
        ${note},
        ${actor.id},
        NOW(),
        NOW()
      )
    `;
  } catch (error) {
    const message = String((error as { message?: unknown })?.message || error);
    if (/admin_employees_work_email_unique_idx|duplicate key|unique/i.test(message)) {
      return createAdminValidationError("An employee account with that work email already exists.", {
        email: "An administrator with this work email already exists.",
      });
    }
    throw error;
  }

  await writeAudit(actor.id, "admin_account_created", {
    targetAdminEmployeeId: adminId,
    targetEmployeeId: employeeId,
    adminRole,
    adminStatus: "activation_required",
    adminIdentityReference,
    timestamp: new Date().toISOString(),
  });
  revalidatePath("/admin/users");

  return {
    success: true,
    temporaryCredentials: {
      employeeId,
      password: tempPassword,
      identityReference: adminIdentityReference,
      expiresAt: tempCredentialExpiresAt.toISOString(),
      expiresIn: "24 hours",
      adminRole,
    },
    user: {
      id: adminId,
      email,
      phone,
      role: "admin" as const,
      isSuspended: false,
      adminRole,
      adminStatus: "activation_required",
      adminActivationRequired: true,
      adminEmployeeId: employeeId,
      adminIdentityReference,
      adminFullName: fullName,
      adminCreatedAt: new Date().toISOString(),
      fullName,
      avatarUrl: null,
      workerIsVerified: null,
      workerVerificationStatus: null,
      clientIsVerified: null,
      clientVerificationStatus: null,
      createdAt: new Date().toISOString(),
    },
  };
}

export async function resetAdminEmployeePassword(adminEmployeeId: string) {
  const actor = await requireAdminPermission("admin_accounts.create");
  if (actor.role !== "super_admin") {
    return { success: false, error: "Only the active super admin can reset administrator passwords." };
  }

  const rows = await sql`
    SELECT id, admin_employee_id, admin_role
    FROM admin_employees
    WHERE id = ${adminEmployeeId}
    LIMIT 1
  `;
  const employee = rows[0] ?? null;
  if (!employee) return { success: false, error: "Administrator employee not found." };
  if (employee.admin_role === "super_admin") {
    return { success: false, error: "Use the owner recovery process for the super admin account." };
  }

  const tempPassword = generateTemporaryAdminPassword();
  const passwordHash = await hashBetterAuthPassword(tempPassword);
  await sql`
    UPDATE admin_employees
    SET password_hash = ${passwordHash},
        admin_status = 'activation_required',
        admin_activation_required = true,
        temp_credential_expires_at = NOW() + INTERVAL '24 hours',
        activation_completed_at = NULL,
        session_version = session_version + 1,
        updated_at = NOW()
    WHERE id = ${employee.id}
  `;
  await writeAudit(actor.id, "admin_employee_password_reset", {
    targetAdminEmployeeId: employee.id,
    targetEmployeeId: employee.admin_employee_id,
    timestamp: new Date().toISOString(),
  });
  revalidatePath("/admin/users");

  return {
    success: true,
    temporaryCredentials: {
      employeeId: employee.admin_employee_id,
      password: tempPassword,
      expiresIn: "24 hours",
    },
  };
}
