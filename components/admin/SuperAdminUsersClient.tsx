"use client";

import { useState, useTransition } from "react";
import {
  Search, ShieldCheck, UserX, UserCheck, UserCog,
  Trash2, Plus, X, Crown, AlertTriangle, Users, User
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  setSuspendedStatus,
  setUserRole,
  createAdminAccount,
  deleteUser,
} from "@/lib/actions/super-admin";

type UserRole = "client" | "worker" | "admin";

interface UserRow {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isSuspended: boolean;
  createdAt: string;
  fullName: string | null;
  avatarUrl: string | null;
}

interface Props {
  initialUsers: UserRow[];
}

// ─── Create Admin Modal ───────────────────────────────────────────────────────
function CreateAdminModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createAdminAccount(form);
      if (res.success) {
        onCreated();
        onClose();
      } else {
        setError(res.error || "Failed to create admin.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
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
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">
              {t("admin.users.modal.fullName" as any)}
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              required
              className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
              placeholder="e.g. Abebe Kebede"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">
              {t("admin.users.modal.email" as any)}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">
              {t("admin.users.modal.password" as any)}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={8}
              className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider rounded-lg transition-all active:scale-[0.98] disabled:opacity-60 shadow-sm mt-2"
          >
            <Crown className="w-4 h-4" />
            {isPending ? "Creating..." : t("admin.users.modal.submit" as any)}
          </button>
        </form>
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
export function SuperAdminUsersClient({ initialUsers }: Props) {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "client" | "worker" | "admin">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      } else alert(res.error);
    });
  };

  const handleRole = (userId: string, newRole: UserRole) => {
    startTransition(async () => {
      const res = await setUserRole(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else alert(res.error);
    });
  };

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      const res = await deleteUser(userId);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setConfirmDelete(null);
      } else alert(res.error);
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
          onCreated={() => {
            // Optimistically show a placeholder; server will have the real row on next load
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
              <h3 className="font-bold text-on-surface text-sm">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              This action is <strong>irreversible</strong>. All data associated with this account will be permanently deleted.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 text-xs font-bold text-on-surface-variant bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={isPending}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isPending ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
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
            placeholder="Search by name, email, or phone..."
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
                              {u.fullName ?? <span className="text-on-surface-variant italic">No name</span>}
                            </p>
                            <p className="text-xs text-on-surface-variant mt-0.5">{u.email}</p>
                            {u.phone && (
                              <p className="text-[10px] text-on-surface-variant/70 mt-0.5">{u.phone}</p>
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
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-on-surface-variant">
                          {new Date(u.createdAt).toLocaleDateString(undefined, {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </span>
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
                          {u.role !== "admin" ? (
                            <button
                              disabled={isPending}
                              onClick={() => handleRole(u.id, "admin")}
                              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded font-bold border bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-all disabled:opacity-50"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              {t("admin.users.action.makeAdmin" as any)}
                            </button>
                          ) : (
                            <button
                              disabled={isPending}
                              onClick={() => handleRole(u.id, "client")}
                              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded font-bold border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 transition-all disabled:opacity-50"
                            >
                              <UserCog className="w-3 h-3" />
                              {t("admin.users.action.demote" as any)}
                            </button>
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
