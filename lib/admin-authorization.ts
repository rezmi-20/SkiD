import { sql } from "@/lib/db";
import { getAdminSessionFromCookies } from "@/lib/admin-session";

export const ADMIN_ROLES = [
  "super_admin",
  "content_verification_admin",
  "dispute_payment_admin",
  "user_support_admin",
] as const;

export const ADMIN_STATUSES = [
  "invited",
  "activation_required",
  "active",
  "suspended",
  "revoked",
] as const;

export const ADMIN_PERMISSIONS = [
  "admin_accounts.create",
  "admin_accounts.read",
  "admin_accounts.assign_role",
  "admin_accounts.suspend",
  "admin_accounts.reactivate",
  "audit.read",
  "reports.read",
  "appeals.read",
  "appeals.resolve",
  "admin_misconduct.review",
  "verification.read",
  "verification.review",
  "verification.approve",
  "verification.reject",
  "verification.request_resubmission",
  "verification.revoke",
  "content.read",
  "content.moderate",
  "disputes.read",
  "disputes.review",
  "disputes.request_evidence",
  "disputes.resolve",
  "disputes.escalate",
  "payment_cases.read",
  "payment_cases.review",
  "support.read",
  "support.claim",
  "support.reply",
  "support.request_information",
  "support.note",
  "support.respond",
  "support.resolve",
  "support.escalate",
  "users.read_limited",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
export type AdminStatus = (typeof ADMIN_STATUSES)[number];
export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export interface AdminPrincipal {
  id: string;
  email: string | null;
  employeeId?: string | null;
  fullName?: string | null;
  department?: string | null;
  role: AdminRole;
  status: AdminStatus;
  activationRequired?: boolean;
  tempCredentialExpiresAt?: Date | string | null;
  permissions: AdminPermission[];
}

const ADMIN_ROLE_SET = new Set<string>(ADMIN_ROLES);
const ADMIN_STATUS_SET = new Set<string>(ADMIN_STATUSES);

export const ADMIN_ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    "admin_accounts.create",
    "admin_accounts.read",
    "admin_accounts.assign_role",
    "admin_accounts.suspend",
    "admin_accounts.reactivate",
    "audit.read",
    "reports.read",
    "appeals.read",
    "appeals.resolve",
    "admin_misconduct.review",
    "verification.read",
    "content.read",
    "disputes.read",
    "payment_cases.read",
    "support.read",
  ],
  content_verification_admin: [
    "verification.read",
    "verification.review",
    "verification.approve",
    "verification.reject",
    "verification.request_resubmission",
    "verification.revoke",
    "content.read",
    "content.moderate",
  ],
  dispute_payment_admin: [
    "disputes.read",
    "disputes.review",
    "disputes.request_evidence",
    "disputes.resolve",
    "disputes.escalate",
    "payment_cases.read",
    "payment_cases.review",
  ],
  user_support_admin: [
    "support.read",
    "support.claim",
    "support.reply",
    "support.request_information",
    "support.note",
    "support.respond",
    "support.resolve",
    "support.escalate",
    "users.read_limited",
  ],
};

export class AdminAuthorizationError extends Error {
  status: number;

  constructor(message = "Admin access denied.", status = 403) {
    super(message);
    this.name = "AdminAuthorizationError";
    this.status = status;
  }
}

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && ADMIN_ROLE_SET.has(value);
}

export function isAdminStatus(value: unknown): value is AdminStatus {
  return typeof value === "string" && ADMIN_STATUS_SET.has(value);
}

export function resolveAdminRole(_email: string | null | undefined, storedRole: unknown): AdminRole | null {
  return isAdminRole(storedRole) ? storedRole : null;
}

export function resolveAdminStatus(isSuspended: boolean, storedStatus: unknown): AdminStatus | null {
  if (isSuspended) return "suspended";
  if (isAdminStatus(storedStatus)) return storedStatus;
  return null;
}

export function hasAdminPermission(
  admin: Pick<AdminPrincipal, "role" | "status"> | null | undefined,
  permission: AdminPermission,
) {
  if (!admin || admin.status !== "active") return false;
  return ADMIN_ROLE_PERMISSIONS[admin.role]?.includes(permission) ?? false;
}

export async function getStoredAdminState(userId: string) {
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
      admin_activation_required,
      temp_credential_expires_at,
      activation_completed_at,
      session_version,
      created_by,
      created_at,
      updated_at
    FROM admin_employees
    WHERE id = ${userId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getAdminPrincipal(): Promise<AdminPrincipal | null> {
  const session = await getAdminSessionFromCookies();
  if (!session?.adminId) return null;

  const account = await getStoredAdminState(session.adminId);
  if (!account) return null;

  if (Number(account.session_version || 0) !== Number(session.sessionVersion || 0)) return null;

  const email = String(account.work_email || "");
  const isSuspended = account.admin_status === "suspended" || account.admin_status === "revoked";
  const adminRole = resolveAdminRole(email, account.admin_role);
  const status = resolveAdminStatus(isSuspended, account.admin_status);
  const activationRequired = Boolean(account.admin_activation_required);

  if (!adminRole || !status || status !== "active" || activationRequired) return null;

  return {
    id: session.adminId,
    email,
    employeeId: account.admin_employee_id ?? null,
    fullName: account.full_name ?? null,
    department: account.department ?? null,
    role: adminRole,
    status,
    activationRequired,
    tempCredentialExpiresAt: account.temp_credential_expires_at ?? null,
    permissions: ADMIN_ROLE_PERMISSIONS[adminRole],
  };
}

export async function getActivationRequiredAdminPrincipal(): Promise<AdminPrincipal | null> {
  const session = await getAdminSessionFromCookies();
  if (!session?.adminId) return null;

  const account = await getStoredAdminState(session.adminId);
  if (!account || account.admin_status === "suspended" || account.admin_status === "revoked") return null;
  if (Number(account.session_version || 0) !== Number(session.sessionVersion || 0)) return null;

  const email = String(account.work_email || "");
  const adminRole = resolveAdminRole(email, account.admin_role);
  const status = resolveAdminStatus(false, account.admin_status);
  const activationRequired = Boolean(account.admin_activation_required) || status === "activation_required";

  if (!adminRole || !status || !activationRequired) return null;

  return {
    id: session.adminId,
    email,
    employeeId: account.admin_employee_id ?? null,
    fullName: account.full_name ?? null,
    department: account.department ?? null,
    role: adminRole,
    status,
    activationRequired,
    tempCredentialExpiresAt: account.temp_credential_expires_at ?? null,
    permissions: [],
  };
}

export async function requireActivationRequiredAdmin() {
  const admin = await getActivationRequiredAdminPrincipal();
  if (!admin) throw new AdminAuthorizationError("Activation-required administrator access is required.", 403);
  return admin;
}

export async function requireAdmin() {
  const admin = await getAdminPrincipal();
  if (!admin) throw new AdminAuthorizationError("Active administrator access is required.", 403);
  return admin;
}

export async function requireAdminRole(role: AdminRole) {
  const admin = await requireAdmin();
  if (admin.role !== role) throw new AdminAuthorizationError(`${role} access is required.`, 403);
  return admin;
}

export async function requireAdminPermission(permission: AdminPermission) {
  const admin = await requireAdmin();
  if (!hasAdminPermission(admin, permission)) {
    throw new AdminAuthorizationError(`Admin permission ${permission} is required.`, 403);
  }
  return admin;
}

export async function requireAnyAdminPermission(permissions: AdminPermission[]) {
  const admin = await requireAdmin();
  if (!permissions.some((permission) => hasAdminPermission(admin, permission))) {
    throw new AdminAuthorizationError(`One of these admin permissions is required: ${permissions.join(", ")}.`, 403);
  }
  return admin;
}

export function assertCanModifyAdminAccount(actor: AdminPrincipal, targetUserId: string, operation: "assign_role" | "suspend" | "reactivate") {
  if (actor.id === targetUserId) {
    const label = operation === "assign_role" ? "change your own admin role" : `${operation} your own admin account`;
    throw new AdminAuthorizationError(`You cannot ${label}.`, 403);
  }

  const permission =
    operation === "assign_role"
      ? "admin_accounts.assign_role"
      : operation === "suspend"
        ? "admin_accounts.suspend"
        : "admin_accounts.reactivate";

  if (!hasAdminPermission(actor, permission)) {
    throw new AdminAuthorizationError(`Admin permission ${permission} is required.`, 403);
  }
}
