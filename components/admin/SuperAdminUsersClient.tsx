"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Search, ShieldCheck, UserX, UserCheck, UserCog,
  Trash2, Plus, X, Crown, AlertTriangle, Users, User, Copy, CheckCircle2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  setSuspendedStatus,
  setUserRole,
  deleteUser,
} from "@/lib/actions/super-admin";
import { createAdminAccount, resetAdminEmployeePassword } from "@/lib/actions/admin-account";
import type { AdminRole } from "@/lib/admin-authorization";

type UserRole = "client" | "worker" | "admin";

interface UserRow {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isSuspended: boolean;
  workerIsVerified: boolean | null;
  workerVerificationStatus: string | null;
  clientIsVerified: boolean | null;
  clientVerificationStatus: string | null;
  createdAt: string;
  fullName: string | null;
  avatarUrl: string | null;
  adminRole?: string | null;
  adminStatus?: string | null;
  adminActivationRequired?: boolean | null;
  adminEmployeeId?: string | null;
  adminIdentityReference?: string | null;
  adminFullName?: string | null;
  adminCreatedByEmail?: string | null;
  adminCreatedAt?: string | null;
}

interface Props {
  initialUsers: UserRow[];
}

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  content_verification_admin: "Content and Verification Admin",
  dispute_payment_admin: "Dispute and Payment Admin",
  user_support_admin: "User Support Admin",
};

const DEPARTMENT_OPTIONS = [
  "Verification and Content",
  "Dispute and Payments",
  "User Support",
  "Operations",
  "Administration",
] as const;

type CreateAdminField = "fullName" | "email" | "phone" | "adminRole" | "department" | "note" | "identityConfirmed";
type CreateAdminFieldErrors = Partial<Record<CreateAdminField, string>>;

// ─── Create Admin Modal ───────────────────────────────────────────────────────
function CreateAdminModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (user: UserRow) => void;
}) {
  const { t } = useLanguage();
  const adminRoleLabel = (role: AdminRole) => {
    if (role === "content_verification_admin") return t("admin.create.role.contentVerification");
    if (role === "dispute_payment_admin") return t("admin.create.role.disputePayment");
    if (role === "user_support_admin") return t("admin.create.role.userSupport");
    return ROLE_LABELS[role];
  };
  const [form, setForm] = useState({
    email: "",
    phone: "",
    fullName: "",
    department: "Operations",
    adminRole: "content_verification_admin" as AdminRole,
    note: "",
    identityConfirmed: false,
  });
  const [temporaryCredentials, setTemporaryCredentials] = useState<null | {
    employeeId: string;
    password: string;
    identityReference: string;
    expiresAt: string;
    expiresIn: string;
    adminRole: AdminRole;
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CreateAdminFieldErrors>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key as CreateAdminField]) return current;
      const next = { ...current };
      delete next[key as CreateAdminField];
      return next;
    });
  };

  const validateForm = () => {
    const nextErrors: CreateAdminFieldErrors = {};
    const fullName = form.fullName.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim().replace(/[\s-]/g, "");
    const note = form.note.trim();

    if (!fullName) nextErrors.fullName = "Full Name is required.";
    else if (fullName.length < 2 || fullName.length > 120) nextErrors.fullName = "Full Name must be between 2 and 120 characters.";

    if (!email) nextErrors.email = "Work Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid work email.";

    if (phone && !/^\+251\d{9}$/.test(phone)) nextErrors.phone = "Use Ethiopian international format, for example +251912345678.";
    if (!form.adminRole || form.adminRole === "super_admin") nextErrors.adminRole = "Choose an allowed operational role.";
    if (!form.department.trim()) nextErrors.department = "Department is required.";
    if (note.length > 500) nextErrors.note = "Administrative Note must be 500 characters or fewer.";
    if (/\b(password|passcode|secret|token|fin|passport|national\s*id|staff\s*id|document\s*number)\b/i.test(note)) {
      nextErrors.note = "Do not enter passwords, FIN, passport, national ID, staff ID, document numbers, or private identity details.";
    }
    if (!form.identityConfirmed) nextErrors.identityConfirmed = "Offline identity and work-email confirmation is required.";

    return nextErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nextErrors = validateForm();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("Fix the highlighted fields before creating the administrator.");
      return;
    }
    startTransition(async () => {
      const res = await createAdminAccount(form);
      if (res.success && res.user) {
        onCreated(res.user);
        setTemporaryCredentials(res.temporaryCredentials ?? null);
      } else {
        if ("fieldErrors" in res && res.fieldErrors) {
          setFieldErrors(res.fieldErrors as CreateAdminFieldErrors);
        }
        setError(res.error || "Failed to create admin.");
      }
    });
  };

  const copyValue = async (label: string, value: string) => {
    try {
      if (document.hasFocus() && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const input = document.createElement("input");
        input.value = value;
        input.setAttribute("readonly", "true");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopiedField(label);
      window.setTimeout(() => setCopiedField(null), 1500);
    } catch {
      setCopiedField(null);
    }
  };

  const closeAndForgetCredentials = () => {
    setTemporaryCredentials(null);
    onClose();
  };

  const FieldError = ({ name }: { name: CreateAdminField }) => (
    fieldErrors[name] ? <p className="text-[11px] font-semibold text-red-600">{fieldErrors[name]}</p> : null
  );

  const CopyButton = ({ label, value }: { label: string; value: string }) => (
    <button
      type="button"
      onClick={() => copyValue(label, value)}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-colors hover:text-primary"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {copiedField === label ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Crown className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-bold text-on-surface text-sm">
              {t("admin.users.createAdmin" as any)}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeAndForgetCredentials}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label={t("admin.create.closeDialog")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {temporaryCredentials ? (
          <div className="p-6 space-y-4">
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
              <p className="text-sm font-black uppercase tracking-wider">{t("admin.create.tempTitle")}</p>
              <p className="mt-1 text-xs font-semibold">
                {t("admin.create.tempDesc")}
              </p>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-outline-variant bg-surface-container p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.common.employeeId")}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="font-mono font-bold text-on-surface">{temporaryCredentials.employeeId}</p>
                  <CopyButton label="Employee ID" value={temporaryCredentials.employeeId} />
                </div>
              </div>
              <div className="rounded-lg border border-outline-variant bg-surface-container p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.create.tempPassword")}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="font-mono font-bold text-on-surface break-all">{temporaryCredentials.password}</p>
                  <CopyButton label="Temporary password" value={temporaryCredentials.password} />
                </div>
              </div>
              <div className="rounded-lg border border-outline-variant bg-surface-container p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.create.identityReference")}</p>
                <p className="mt-1 font-mono font-bold text-on-surface">{temporaryCredentials.identityReference}</p>
              </div>
              <div className="rounded-lg border border-outline-variant bg-surface-container p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.create.tempExpiry")}</p>
                <p className="mt-1 font-semibold text-on-surface">
                  {new Date(temporaryCredentials.expiresAt).toLocaleString()} ({temporaryCredentials.expiresIn})
                </p>
              </div>
              <div className="rounded-lg border border-outline-variant bg-surface-container p-3 sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.create.assignedRole")}</p>
                <p className="mt-1 font-semibold text-on-surface">{adminRoleLabel(temporaryCredentials.adminRole)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeAndForgetCredentials}
              className="w-full py-2.5 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider rounded-lg transition-all active:scale-[0.98]"
            >
              {t("admin.create.done")}
            </button>
          </div>
        ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{t("admin.create.employeeInfo")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="admin-full-name" className="text-xs font-bold text-on-surface">{t("admin.common.fullName")} <span className="text-red-600">*</span></label>
                <input
                  id="admin-full-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  required
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                  placeholder={t("admin.create.fullNamePlaceholder")}
                />
                <p className="text-[11px] text-on-surface-variant">{t("admin.create.fullNameHelp")}</p>
                <FieldError name="fullName" />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-work-email" className="text-xs font-bold text-on-surface">{t("admin.common.workEmail")} <span className="text-red-600">*</span></label>
                <input
                  id="admin-work-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  required
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                  placeholder={t("admin.create.workEmailPlaceholder")}
                />
                <p className="text-[11px] text-on-surface-variant">{t("admin.create.workEmailHelp")}</p>
                <FieldError name="email" />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="admin-phone" className="text-xs font-bold text-on-surface">{t("admin.create.phoneOptional")}</label>
                <input
                  id="admin-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                  placeholder="+251912345678"
                />
                <p className="text-[11px] text-on-surface-variant">{t("admin.create.phoneHelp")}</p>
                <FieldError name="phone" />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{t("admin.create.roleAssignment")}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="admin-operational-role" className="text-xs font-bold text-on-surface">{t("admin.create.operationalRole")} <span className="text-red-600">*</span></label>
                <select
                  id="admin-operational-role"
                  value={form.adminRole}
                  onChange={(e) => setField("adminRole", e.target.value as AdminRole)}
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                >
                  <option value="content_verification_admin">{t("admin.create.role.contentVerification")}</option>
                  <option value="dispute_payment_admin">{t("admin.create.role.disputePayment")}</option>
                  <option value="user_support_admin">{t("admin.create.role.userSupport")}</option>
                </select>
                <FieldError name="adminRole" />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-department" className="text-xs font-bold text-on-surface">{t("admin.common.department")} <span className="text-red-600">*</span></label>
                <select
                  id="admin-department"
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                  required
                  className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                >
                  {DEPARTMENT_OPTIONS.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
                <FieldError name="department" />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="admin-note" className="text-xs font-bold text-on-surface">{t("admin.create.noteOptional")}</label>
                <textarea
                  id="admin-note"
                  value={form.note}
                  maxLength={500}
                  onChange={(e) => setField("note", e.target.value)}
                  className="min-h-20 w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                  placeholder={t("admin.create.notePlaceholder")}
                />
                <p className="text-[11px] text-on-surface-variant">{t("admin.create.noteHelp")}</p>
                <FieldError name="note" />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{t("admin.create.verificationConfirmation")}</h3>
            <label className="flex items-start gap-2 rounded-lg border border-outline-variant bg-surface-container p-3 text-xs font-semibold text-on-surface">
              <input
                type="checkbox"
                checked={form.identityConfirmed}
                onChange={(e) => setField("identityConfirmed", e.target.checked)}
                className="mt-0.5"
              />
              <span>{t("admin.create.identityConfirmed")}</span>
            </label>
            <FieldError name="identityConfirmed" />
          </section>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider rounded-lg transition-all active:scale-[0.98] disabled:opacity-60 shadow-sm mt-2"
          >
            <Crown className="w-4 h-4" />
            {isPending ? t("admin.create.creating") : t("admin.users.modal.submit" as any)}
          </button>
        </form>
        )}
      </div>
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: UserRole }) {
  const colors: Record<UserRole, string> = {
    admin: "bg-purple-100 text-purple-800 border-purple-200",
    worker: "bg-blue-100 text-blue-800 border-blue-200",
    client: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };
  const icons: Record<UserRole, React.ReactNode> = {
    admin: <Crown className="w-3 h-3" />,
    worker: <UserCog className="w-3 h-3" />,
    client: <User className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${colors[role]}`}>
      {icons[role]}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function getIdentityStatus(user: UserRow) {
  if (user.isSuspended) return "suspended";
  if (user.role === "worker") {
    if (user.workerVerificationStatus) return user.workerVerificationStatus;
    return user.workerIsVerified ? "approved" : "pending";
  }
  if (user.role === "client") {
    if (user.clientVerificationStatus === "incomplete") return "not_started";
    if (user.clientVerificationStatus) return user.clientVerificationStatus;
    return user.clientIsVerified ? "approved" : "not_started";
  }
  return "admin";
}

function IdentityBadge({ user }: { user: UserRow }) {
  const status = getIdentityStatus(user);
  const approved = status === "approved" || status === "admin";
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
      approved
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : status === "suspended" || status === "revoked" || status === "rejected"
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
    }`}>
      <ShieldCheck className="w-3 h-3" />
      {status === "admin" ? "Admin" : status.replace("_", " ")}
    </span>
  );
}

export function SuperAdminUsersClient({ initialUsers }: Props) {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "client" | "worker" | "admin">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetCredentials, setResetCredentials] = useState<null | { employeeId: string; password: string; expiresIn: string }>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.email.toLowerCase().includes(q) ||
      (u.fullName?.toLowerCase().includes(q) ?? false) ||
      (u.phone?.includes(q) ?? false);
    const matchesTab = tab === "all" || u.role === tab;
    return matchesSearch && matchesTab;
  });

  const handleSuspend = (userId: string, current: boolean) => {
    startTransition(async () => {
      const res = await setSuspendedStatus(userId, !current);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isSuspended: !current } : u))
        );
      } else alert(res.error || "Failed to update suspension status.");
    });
  };

  const handleRole = (userId: string, newRole: UserRole) => {
    startTransition(async () => {
      const res = await setUserRole(userId, newRole);
      if (res.success) {
        const appliedRole: UserRole =
          res.role === "client" || res.role === "worker" || res.role === "admin"
            ? res.role
            : newRole;
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: appliedRole } : u))
        );
      } else alert(res.error || "Failed to update user role.");
    });
  };

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      const res = await deleteUser(userId);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setConfirmDelete(null);
      } else alert(res.error || "Failed to delete user.");
    });
  };

  const handleResetPassword = (userId: string) => {
    startTransition(async () => {
      const res = await resetAdminEmployeePassword(userId);
      if (res.success && res.temporaryCredentials) {
        setResetCredentials(res.temporaryCredentials);
        setUsers((prev) =>
          prev.map((u) => u.id === userId ? { ...u, adminStatus: "activation_required", adminActivationRequired: true } : u)
        );
      } else alert(res.error || "Failed to reset administrator password.");
    });
  };

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "all", label: t("admin.users.tab.all" as any) },
    { key: "client", label: t("admin.users.tab.clients" as any) },
    { key: "worker", label: t("admin.users.tab.workers" as any) },
    { key: "admin", label: t("admin.users.tab.admins" as any) },
  ];

  const counts: Record<typeof tab, number> = {
    all: users.length,
    client: users.filter((u) => u.role === "client").length,
    worker: users.filter((u) => u.role === "worker").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

  return (
    <>
      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(user) => {
            setUsers((prev) => [user, ...prev]);
          }}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-on-surface text-sm">{t("admin.users.confirmDeleteTitle" as any)}</h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {t("admin.users.confirmDeleteDesc" as any)}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 text-xs font-bold text-on-surface-variant bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
              >
                {t("admin.users.cancel" as any)}
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={isPending}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isPending ? t("admin.users.deleting" as any) : t("admin.users.deleteForever" as any)}
              </button>
            </div>
          </div>
        </div>
      )}

      {resetCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-on-surface text-sm">{t("admin.users.tempShownOnce" as any)}</h3>
            <p className="text-xs font-semibold text-on-surface-variant">
              {t("admin.users.resetActivationDesc" as any).replace("{employeeId}", resetCredentials.employeeId).replace("{expiresIn}", resetCredentials.expiresIn)}
            </p>
            <div className="rounded-lg border border-outline-variant bg-surface-container p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.create.tempPassword")}</p>
              <p className="font-mono font-bold text-on-surface break-all">{resetCredentials.password}</p>
            </div>
            <button
              onClick={() => setResetCredentials(null)}
              className="w-full py-2.5 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider rounded-lg"
            >
              {t("admin.create.done")}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-10">
        {/* Header Banner */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4 transition-colors duration-300">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  {t("admin.portal" as any)}
                </p>
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm">
                  <Crown className="w-2.5 h-2.5" />
                  {t("admin.users.badge" as any)}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                {t("admin.users.title" as any)}
              </h1>
              <p className="mt-0.5 text-sm text-on-surface-variant">
                {t("admin.users.desc" as any)}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all active:scale-95 hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              {t("admin.users.createAdmin" as any)}
            </button>
          </div>
        </div>

        {/* Stat Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                tab === key
                  ? "bg-primary text-on-primary border-primary shadow-sm"
                  : "bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container"
              }`}
            >
              <span className="text-xs font-bold">{label}</span>
              <span className={`text-lg font-black font-mono ${tab === key ? "text-on-primary" : "text-primary"}`}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder={t("admin.users.searchPlaceholder" as any)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm transition-colors duration-300">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-3" />
              <p className="text-sm font-semibold text-on-surface-variant">
                {t("admin.users.noUsers" as any)}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container/50">
                    {[
                      t("admin.users.col.name" as any),
                      t("admin.users.col.role" as any),
                      t("admin.users.col.status" as any),
                      t("admin.users.col.joined" as any),
                      t("admin.users.col.actions" as any),
                    ].map((h, i) => (
                      <th
                        key={i}
                        className={`px-4 py-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ${i === 4 ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container transition-colors duration-150">
                      {/* Name / Email */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                            {(u.fullName ?? u.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-on-surface text-sm leading-none">
                              {u.fullName ?? <span className="text-on-surface-variant italic">{t("admin.users.noName" as any)}</span>}
                            </p>
                            <p className="text-xs text-on-surface-variant mt-0.5">{u.email}</p>
                            {u.phone && (
                              <p className="text-[10px] text-on-surface-variant/70 mt-0.5">{u.phone}</p>
                            )}
                            {u.role === "admin" && (
                              <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                                {u.adminEmployeeId || t("admin.users.employeeIdPending" as any)} · {u.adminRole?.replaceAll("_", " ") || "admin"}
                              </p>
                            )}
                            {u.role === "admin" && u.adminIdentityReference && (
                              <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                                IVR {u.adminIdentityReference}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <RoleBadge role={u.role} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                          u.isSuspended
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}>
                          {u.isSuspended
                            ? <><UserX className="w-3 h-3" />{t("admin.users.status.suspended" as any)}</>
                            : <><UserCheck className="w-3 h-3" />{t("admin.users.status.active" as any)}</>
                          }
                        </span>
                        <div className="mt-1">
                          <IdentityBadge user={u} />
                        </div>
                        {u.role === "admin" && (
                          <p className="mt-1 text-[10px] font-semibold text-on-surface-variant">
                            {u.adminStatus || "unknown"}
                            {u.adminActivationRequired ? " · activation required" : ""}
                          </p>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-on-surface-variant">
                          {new Date(u.createdAt).toLocaleDateString(undefined, {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </span>
                        {u.role === "admin" && (
                          <p className="mt-1 text-[10px] text-on-surface-variant/70">
                            Created by {u.adminCreatedByEmail || "system"}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Suspend / Unsuspend */}
                          <button
                            disabled={isPending}
                            onClick={() => handleSuspend(u.id, u.isSuspended)}
                            className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded font-bold border transition-all disabled:opacity-50 ${
                              u.isSuspended
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            }`}
                          >
                            {u.isSuspended ? (
                              <><UserCheck className="w-3 h-3" />{t("admin.users.action.unsuspend" as any)}</>
                            ) : (
                              <><UserX className="w-3 h-3" />{t("admin.users.action.suspend" as any)}</>
                            )}
                          </button>

                          {/* Promote / Demote */}
                          {u.role === "client" && (
                            <Link
                              href={`/admin/clients/${u.id}/verify`}
                              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded font-bold border bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 transition-all"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              Review Fayda
                            </Link>
                          )}

                          {u.role === "admin" && (
                            <>
                              {u.adminRole !== "super_admin" && (
                                <button
                                  disabled={isPending}
                                  onClick={() => handleResetPassword(u.id)}
                                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded font-bold border bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-all disabled:opacity-50"
                                >
                                  <UserCog className="w-3 h-3" />
                                  Reset Password
                                </button>
                              )}
                            </>
                          )}

                          {/* Delete */}
                          <button
                            disabled={isPending}
                            onClick={() => setConfirmDelete(u.id)}
                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded font-bold border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                            {t("admin.users.action.delete" as any)}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
