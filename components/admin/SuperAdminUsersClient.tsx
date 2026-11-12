"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  UserX,
  UserCheck,
  UserCog,
  Trash2,
  Plus,
  X,
  Crown,
  AlertTriangle,
  Users,
  User,
  Copy,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  setSuspendedStatus,
  setUserRole,
  deleteUser,
} from "@/lib/actions/super-admin";
import {
  createAdminAccount,
  resetAdminEmployeePassword,
} from "@/lib/actions/admin-account";
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
  content_verification_admin: "Content & Verification Admin",
  dispute_payment_admin: "Dispute & Payment Admin",
  user_support_admin: "User Support Admin",
};

const DEPARTMENT_OPTIONS = [
  "Verification and Content",
  "Dispute and Payments",
  "User Support",
  "Operations",
  "Administration",
] as const;

type CreateAdminField =
  | "fullName"
  | "email"
  | "phone"
  | "adminRole"
  | "department"
  | "note"
  | "identityConfirmed";
type CreateAdminFieldErrors = Partial<Record<CreateAdminField, string>>;

// ─── SLIDE-OUT DRAWER: CREATE ADMIN ACCOUNT ──────────────────────────────────
function CreateAdminDrawer({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (user: UserRow) => void;
}) {
  const { t } = useLanguage();
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAndForget();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

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
    else if (fullName.length < 2 || fullName.length > 120)
      nextErrors.fullName = "Full Name must be between 2 and 120 characters.";

    if (!email) nextErrors.email = "Work Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      nextErrors.email = "Enter a valid work email.";

    if (phone && !/^\+251\d{9}$/.test(phone))
      nextErrors.phone = "Use Ethiopian format: +251912345678.";
    if (!form.adminRole || form.adminRole === "super_admin")
      nextErrors.adminRole = "Choose an allowed operational role.";
    if (!form.department.trim()) nextErrors.department = "Department is required.";
    if (note.length > 500) nextErrors.note = "Administrative Note must be 500 characters or fewer.";
    if (
      /\b(password|passcode|secret|token|fin|passport|national\s*id|staff\s*id|document\s*number)\b/i.test(
        note
      )
    ) {
      nextErrors.note =
        "Do not enter passwords, FIN, passport, national ID, or private identity details.";
    }
    if (!form.identityConfirmed)
      nextErrors.identityConfirmed = "Offline identity and work-email confirmation is required.";

    return nextErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nextErrors = validateForm();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setError("Please fix the highlighted fields before submitting.");
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
        setError(res.error || "Failed to create administrator.");
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

  const closeAndForget = () => {
    setTemporaryCredentials(null);
    onClose();
  };

  const FieldError = ({ name }: { name: CreateAdminField }) =>
    fieldErrors[name] ? (
      <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 mt-1">
        {fieldErrors[name]}
      </p>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeAndForget}
      />

      {/* Slide-out Sheet Panel from Right Side */}
      <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-[#111827] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 ease-out">
          {/* Header */}
          <div className="shrink-0 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Create Admin Account
                </h2>
                <p className="text-[11px] text-slate-400">
                  Provision new operational staff credentials
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeAndForget}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
            {temporaryCredentials ? (
              /* Success State with Credentials */
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-4 text-amber-900 dark:text-amber-200">
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Temporary Credentials Generated
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                    These credentials are displayed once. Copy and deliver them through a secure channel.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Employee ID
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {temporaryCredentials.employeeId}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyValue("Employee ID", temporaryCredentials.employeeId)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition"
                      >
                        {copiedField === "Employee ID" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Temporary Password
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="font-mono font-bold text-slate-900 dark:text-white text-xs break-all">
                        {temporaryCredentials.password}
                      </p>
                      <button
                        type="button"
                        onClick={() => copyValue("Password", temporaryCredentials.password)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition"
                      >
                        {copiedField === "Password" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Role & Department
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">
                      {ROLE_LABELS[temporaryCredentials.adminRole] || temporaryCredentials.adminRole}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeAndForget}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-sm mt-4"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Create Form */
              <form id="create-admin-form" onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setField("fullName", e.target.value)}
                      placeholder="e.g. Remedan Seid"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition"
                    />
                    <FieldError name="fullName" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="admin@direskill.com"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition"
                    />
                    <FieldError name="email" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (Ethiopian format)
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="+251912345678"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition"
                    />
                    <FieldError name="phone" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Administrative Role *
                    </label>
                    <select
                      value={form.adminRole}
                      onChange={(e) => setField("adminRole", e.target.value as AdminRole)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 transition"
                    >
                      <option value="content_verification_admin">
                        Content & Verification Admin (Fayda KYC)
                      </option>
                      <option value="dispute_payment_admin">
                        Dispute & Payment Admin (Escrow & Cases)
                      </option>
                      <option value="user_support_admin">
                        User Support Admin (Tickets & Assistance)
                      </option>
                    </select>
                    <FieldError name="adminRole" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={form.department}
                      onChange={(e) => setField("department", e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 transition"
                    >
                      {DEPARTMENT_OPTIONS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <FieldError name="department" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Administrative Note (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={form.note}
                      onChange={(e) => setField("note", e.target.value)}
                      placeholder="Provisioning reason or internal reference..."
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 transition resize-none"
                    />
                    <FieldError name="note" />
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.identityConfirmed}
                        onChange={(e) => setField("identityConfirmed", e.target.checked)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-0"
                      />
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                        I confirm this administrator identity has been verified offline and assigned authorized operational access.
                      </span>
                    </label>
                    <FieldError name="identityConfirmed" />
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Sticky Drawer Footer */}
          {!temporaryCredentials && (
            <div className="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeAndForget}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-admin-form"
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{isPending ? "Creating..." : "Create Administrator"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROLE BADGES ──────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: UserRole }) {
  const { t } = useLanguage();
  if (role === "admin") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
        <Crown className="w-3 h-3" />
        {t("admin.users.filter.admins")}
      </span>
    );
  }
  if (role === "worker") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
        <UserCog className="w-3 h-3" />
        {t("admin.users.filter.workers")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
      <User className="w-3 h-3" />
      {t("admin.users.filter.clients")}
    </span>
  );
}

// ─── MAIN USER MANAGEMENT CLIENT ──────────────────────────────────────────────
export function SuperAdminUsersClient({ initialUsers }: Props) {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "client" | "worker" | "admin">("all");
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [resetCredentials, setResetCredentials] = useState<null | {
    employeeId: string;
    password: string;
    expiresIn: string;
  }>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      u.email.toLowerCase().includes(q) ||
      (u.fullName?.toLowerCase().includes(q) ?? false) ||
      (u.phone?.includes(q) ?? false) ||
      (u.adminEmployeeId?.toLowerCase().includes(q) ?? false);
    const matchesTab = tab === "all" || u.role === tab;
    return matchesSearch && matchesTab;
  });

  const counts = {
    all: users.length,
    client: users.filter((u) => u.role === "client").length,
    worker: users.filter((u) => u.role === "worker").length,
    admin: users.filter((u) => u.role === "admin").length,
  };

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
          prev.map((u) =>
            u.id === userId
              ? { ...u, adminStatus: "activation_required", adminActivationRequired: true }
              : u
          )
        );
      } else alert(res.error || "Failed to reset password.");
    });
  };

  return (
    <>
      {/* ── Slide-Out Drawer for Creating Admin (Right Side) ── */}
      <CreateAdminDrawer
        isOpen={showCreateDrawer}
        onClose={() => setShowCreateDrawer(false)}
        onCreated={(newUser) => setUsers((prev) => [newUser, ...prev])}
      />

      {/* ── Delete Confirmation Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-sm shadow-xl p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Delete Account
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete this account? This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={isPending}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {resetCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl w-full max-w-md shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <UserCog className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Temporary Password Generated
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Temporary password for {resetCredentials.employeeId} (expires in {resetCredentials.expiresIn}):
            </p>
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
              <p className="font-mono font-bold text-slate-900 dark:text-white text-sm break-all">
                {resetCredentials.password}
              </p>
            </div>
            <button
              onClick={() => setResetCredentials(null)}
              className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          CLEAN PAGE LAYOUT (STRICTLY FOLLOWING deals.tsx & customers.tsx)
         ════════════════════════════════════════════════════════════════════ */}
      <div className="w-full space-y-6 pb-24">
        {/* ── 1. Flush Page Header (Clean deals.tsx style: No dots, no uppercase pill badges) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {t("admin.users.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("admin.users.desc")}
            </p>
          </div>

          <button
            onClick={() => setShowCreateDrawer(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold rounded-lg shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("admin.users.createAdmin")}</span>
          </button>
        </div>

        {/* ── 2. KPI Summary Cards (customers.tsx & deals.tsx pattern) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("admin.users.kpi.total")}</p>
                <p className="text-2xl font-bold tracking-tight text-foreground font-mono mt-1">{counts.all}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                <Users className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("admin.users.kpi.clients")}</p>
                <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono mt-1">{counts.client}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <User className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("admin.users.kpi.workers")}</p>
                <p className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 font-mono mt-1">{counts.worker}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <UserCog className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("admin.users.kpi.admins")}</p>
                <p className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 font-mono mt-1">{counts.admin}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Crown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Floating Search & Filters (OUTSIDE table container - strictly matching deals.tsx) ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("admin.users.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-72 h-9 pl-9 pr-8 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {[
                { id: "all", label: t("admin.users.filter.all"), count: counts.all },
                { id: "client", label: t("admin.users.filter.clients"), count: counts.client },
                { id: "worker", label: t("admin.users.filter.workers"), count: counts.worker },
                { id: "admin", label: t("admin.users.filter.admins"), count: counts.admin },
              ].map((filterTab) => {
                const isSelected = tab === filterTab.id;
                return (
                  <button
                    key={filterTab.id}
                    onClick={() => setTab(filterTab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-accent text-accent-foreground font-semibold"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{filterTab.label}</span>
                    <span className="text-[10px] opacity-75 font-mono">({filterTab.count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 4. Standalone Table Card (Clean Isolated Container) ── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xs">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">
                {t("admin.users.noUsers")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3">{t("admin.users.table.user")}</th>
                    <th className="px-4 py-3">{t("admin.users.table.role")}</th>
                    <th className="px-4 py-3">{t("admin.users.table.status")}</th>
                    <th className="px-4 py-3">{t("admin.users.table.joined")}</th>
                    <th className="px-4 py-3 text-right">{t("admin.users.table.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((u) => {
                    const initials = (u.fullName ?? u.email).substring(0, 2).toUpperCase();
                    const isSuspended = u.isSuspended;
                    const isActivationReq = u.adminActivationRequired;

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        {/* Name / Contact */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-secondary text-foreground font-bold text-xs flex items-center justify-center shrink-0 border border-border">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate leading-tight">
                                {u.fullName || <span className="text-muted-foreground italic">No name</span>}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {u.email}
                              </p>
                              {u.phone && (
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  {u.phone}
                                </p>
                              )}
                              {u.role === "admin" && (
                                <p className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                                  {u.adminEmployeeId || "Pending ID"} • {u.adminRole?.replaceAll("_", " ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3">
                          <RoleBadge role={u.role} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                isSuspended
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                  : isActivationReq
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSuspended
                                    ? "bg-rose-500"
                                    : isActivationReq
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                              />
                              {isSuspended
                                ? t("admin.users.status.suspended")
                                : isActivationReq
                                ? t("admin.users.status.pending")
                                : t("admin.users.status.active")}
                            </span>

                            {u.role === "worker" && (
                              <p className="text-[10px] text-muted-foreground">
                                {u.workerIsVerified ? "✓ Verified Worker" : "• Pending Verification"}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                          <span>
                            {new Date(u.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          {u.role === "admin" && u.adminCreatedByEmail && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              by {u.adminCreatedByEmail}
                            </p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Suspend / Unsuspend */}
                            <button
                              disabled={isPending}
                              onClick={() => handleSuspend(u.id, u.isSuspended)}
                              className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold border transition cursor-pointer ${
                                u.isSuspended
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                  : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                              }`}
                            >
                              {u.isSuspended ? t("admin.users.action.reactivate") : t("admin.users.action.suspend")}
                            </button>

                            {/* Client Fayda link */}
                            {u.role === "client" && (
                              <Link
                                href={`/admin/clients/${u.id}/verify`}
                                className="text-[11px] px-2.5 py-1 rounded-lg font-semibold border bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/20 transition"
                              >
                                Review Fayda
                              </Link>
                            )}

                            {/* Reset Password */}
                            {u.role === "admin" && u.adminRole !== "super_admin" && (
                              <button
                                disabled={isPending}
                                onClick={() => handleResetPassword(u.id)}
                                className="text-[11px] px-2.5 py-1 rounded-lg font-semibold border bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20 transition cursor-pointer"
                              >
                                {t("admin.users.action.resetPassword")}
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              disabled={isPending}
                              onClick={() => setConfirmDelete(u.id)}
                              className="text-[11px] px-2.5 py-1 rounded-lg font-semibold border bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 transition cursor-pointer"
                            >
                              {t("admin.users.action.delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          <div className="px-4 py-3 border-t border-border bg-secondary/20 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>
              Showing {filtered.length} of {users.length} accounts
            </span>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-accent hover:underline font-semibold cursor-pointer"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
