"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ExternalLink, Search, ShieldAlert, ShieldCheck, UserCheck, UserRound, UserX } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { toClientDisplayStatus } from "@/lib/client-verification";
import { sendClientVerificationReminder } from "@/lib/client-verification-reminders";
import { setSuspendedStatus } from "@/lib/actions/super-admin";

interface ClientData {
  userId: string;
  fullName: string;
  email: string;
  phone: string | null;
  verificationStatus: string | null;
  isVerified: boolean;
  isSuspended: boolean;
  hasDocument: boolean;
  maskedFin: string | null;
  hasProfile: boolean;
  lastReminderAt: string | null;
  reminderCount: number;
  invalidApprovedReasons: string[];
  createdAt: string;
}

interface Props {
  initialClients: ClientData[];
  canOpenDetails: boolean;
  canReview: boolean;
  canSuspendAccount: boolean;
  canReactivateAccount: boolean;
}

function statusClass(status: string) {
  if (status === "approved") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (status === "rejected" || status === "revoked" || status === "suspended") {
    return "bg-rose-500/10 text-rose-500 border-rose-500/20";
  }
  return "bg-amber-500/10 text-amber-500 border-amber-500/20";
}

export function ClientsManagementClient({
  initialClients,
  canOpenDetails,
  canReview,
  canSuspendAccount,
  canReactivateAccount,
}: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "rejected" | "revoked" | "suspended" | "not_started">("all");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const query = search.trim().toLowerCase();

  const displayStatus = (client: ClientData) =>
    client.isSuspended ? "suspended" : toClientDisplayStatus(client.verificationStatus, client.isVerified);

  const filtered = useMemo(
    () =>
      initialClients.filter((client) => {
        const status = displayStatus(client);
        const matchesStatus = statusFilter === "all" || status === statusFilter;
        const matchesSearch =
          !query ||
          [client.fullName, client.email, client.phone, status, client.maskedFin]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
        return matchesStatus && matchesSearch;
      }),
    [initialClients, query, statusFilter],
  );

  const formatDate = (value: string | null) => value ? new Date(value).toLocaleDateString() : t("common.never" as any);
  const isReminderCoolingDown = (value: string | null) =>
    value ? Date.now() - new Date(value).getTime() < 86_400_000 : false;
  const canSendReminder = (status: string) => status === "not_started" || status === "rejected" || status === "revoked";
  const handleSendReminder = (clientUserId: string) => {
    setMessage(null);
    startTransition(async () => {
      const result = await sendClientVerificationReminder(clientUserId);
      setMessage(result.success ? t("admin.clients.reminderSent" as any) : result.error || t("admin.clients.reminderFailed" as any));
    });
  };
  const handleSuspension = (clientUserId: string, suspended: boolean) => {
    setMessage(null);
    startTransition(async () => {
      const result = await setSuspendedStatus(clientUserId, suspended);
      if (result.success) {
        setMessage(suspended ? t("admin.clients.suspended" as any) : t("admin.clients.unsuspended" as any));
        router.refresh();
        return;
      }
      setMessage(result.error || t("admin.clients.suspensionFailed" as any));
    });
  };

  return (
    <div className="space-y-5 pb-10 max-w-full">
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low px-6 py-5">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
          {t("admin.clients.badge" as any)}
        </p>
        <h1 className="mt-1.5 text-2xl font-extrabold text-on-surface tracking-tight">
          {t("admin.clients.title" as any)}
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant opacity-70">
          {t("admin.clients.desc" as any)}
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-on-surface-variant opacity-60" />
          <input
            type="text"
            placeholder={t("admin.clients.searchPlaceholder" as any)}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-surface-container pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
          className="rounded-xl border border-outline-variant bg-surface-container px-3 py-2.5 text-xs font-bold text-on-surface"
        >
          <option value="all">{t("admin.workers.filterAll" as any)}</option>
          <option value="approved">{t("verification.status.approved" as any)}</option>
          <option value="pending">{t("verification.status.pending" as any)}</option>
          <option value="rejected">{t("verification.status.rejected" as any)}</option>
          <option value="revoked">{t("verification.status.revoked" as any)}</option>
          <option value="suspended">{t("verification.status.suspended" as any)}</option>
          <option value="not_started">{t("admin.clients.notVerified" as any)}</option>
        </select>
      </div>

      {message && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm font-bold text-on-surface">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant space-y-3">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
              <UserRound className="w-8 h-8 text-primary/60" />
            </div>
            <p className="text-sm font-black text-on-surface uppercase tracking-wider">{t("admin.clients.noClients" as any)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low/50">
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.clients.table.client" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.common.status" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.verification.col.finDoc" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.clients.table.profile" as any)}
                  </th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.clients.table.contractAccess" as any)}
                  </th>
                  <th className="text-right px-5 py-3.5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                    {t("admin.workers.table.actions" as any)}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filtered.map((client) => {
                  const status = displayStatus(client);
                  const reminderCoolingDown = isReminderCoolingDown(client.lastReminderAt);
                  return (
                    <tr key={client.userId} className="hover:bg-surface-container/50 transition-colors duration-150">
                      <td className="px-5 py-4">
                        <p className="font-bold text-on-surface text-sm">{client.fullName}</p>
                        <p className="text-xs text-on-surface-variant opacity-60">{client.email}</p>
                        {client.phone && <p className="text-[10px] text-on-surface-variant/50 font-mono mt-1">{client.phone}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider rounded-full px-2.5 py-0.5 border ${statusClass(status)}`}>
                          {status === "approved" ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                          {status === "not_started" ? t("admin.clients.notVerified" as any) : t(`verification.status.${status}` as any)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-bold text-on-surface-variant">
                        <p>{client.maskedFin || t("admin.verification.finMissing" as any)}</p>
                        <p className="text-[10px]">
                          {client.hasDocument ? t("admin.verification.documentSubmitted" as any) : t("admin.verification.documentMissing" as any)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs font-bold text-on-surface-variant">
                        <p>{client.hasProfile ? t("admin.clients.profileReady" as any) : t("admin.clients.profileMissing" as any)}</p>
                        <p className="text-[10px]">
                          {t("admin.clients.lastReminder" as any)} {formatDate(client.lastReminderAt)}
                        </p>
                        {client.invalidApprovedReasons.length > 0 && (
                          <p className="mt-1 text-[10px] text-error">
                            {t("admin.clients.invalidApproved" as any)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs font-bold text-on-surface-variant">
                        {status === "approved" ? t("admin.clients.contractAllowed" as any) : t("admin.clients.contractBlocked" as any)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                        {canSendReminder(status) && (
                          <button
                            type="button"
                            disabled={isPending || reminderCoolingDown}
                            onClick={() => handleSendReminder(client.userId)}
                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-all border border-primary/20 disabled:opacity-50"
                          >
                            <Bell className="w-3.5 h-3.5" />
                            {reminderCoolingDown ? t("admin.clients.reminderCoolingDown" as any) : t("admin.clients.sendReminder" as any)}
                          </button>
                        )}
                        {canSuspendAccount && !client.isSuspended && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleSuspension(client.userId, true)}
                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-xl bg-error/10 text-error hover:bg-error/20 font-semibold transition-all border border-error/20 disabled:opacity-50"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            {t("admin.users.action.suspend" as any)}
                          </button>
                        )}
                        {canReactivateAccount && client.isSuspended && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleSuspension(client.userId, false)}
                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-all border border-primary/20 disabled:opacity-50"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            {t("admin.users.action.unsuspend" as any)}
                          </button>
                        )}
                        {canOpenDetails && (
                          <Link
                            href={`/admin/clients/${client.userId}/verify`}
                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-semibold transition-all border border-outline-variant active:scale-95"
                          >
                            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                            {canReview && status === "pending" ? t("admin.action.review" as any) : t("admin.verification.viewDetails" as any)}
                          </Link>
                        )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
