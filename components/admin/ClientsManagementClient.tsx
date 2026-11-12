"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ExternalLink,
  Search,
  UserRound,
  UserX,
  UserCheck,
  X,
  User,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,
  LayoutGrid,
  Table as TableIcon,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { LiquidWaveGauge } from "./charts/LiquidWaveGauge";
import { useLanguage } from "@/context/LanguageContext";
import { toClientDisplayStatus } from "@/lib/client-verification-shared";
import { sendClientVerificationReminder } from "@/lib/client-verification-reminders";
import { setSuspendedStatus } from "@/lib/actions/super-admin";
import FadeContent from "@/components/ui/fade-content";
import { ClientDetailDrawer, ClientDrawerItem } from "./clients/ClientDetailDrawer";

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
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "approved" | "pending" | "rejected" | "revoked" | "suspended" | "not_started"
  >("all");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [drawerClient, setDrawerClient] = useState<ClientDrawerItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const query = search.trim().toLowerCase();

  const displayStatus = (client: ClientData) =>
    client.isSuspended ? "suspended" : toClientDisplayStatus(client.verificationStatus, client.isVerified);

  const counts = useMemo(() => {
    return {
      all: initialClients.length,
      approved: initialClients.filter((c) => displayStatus(c) === "approved").length,
      pending: initialClients.filter((c) => displayStatus(c) === "pending").length,
      not_started: initialClients.filter((c) => displayStatus(c) === "not_started").length,
      suspended: initialClients.filter((c) => c.isSuspended).length,
    };
  }, [initialClients]);

  const verifiedPercent = counts.all > 0 ? Math.round((counts.approved / counts.all) * 100) : 0;

  const chartData = useMemo(() => {
    const list = [
      { name: "Verified", value: counts.approved, color: "oklch(0.7 0.18 145)" },
      { name: "Pending Review", value: counts.pending, color: "oklch(0.75 0.18 55)" },
      { name: "Not Started", value: counts.not_started, color: "oklch(0.55 0.05 260)" },
      { name: "Suspended", value: counts.suspended, color: "oklch(0.65 0.2 25)" },
    ].filter((item) => item.value > 0);

    return list.length > 0 ? list : [{ name: "No Records", value: 1, color: "oklch(0.3 0 0)" }];
  }, [counts]);

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

  const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleDateString() : "Never";

  const isReminderCoolingDown = (value: string | null) =>
    value ? Date.now() - new Date(value).getTime() < 86_400_000 : false;

  const handleSendReminder = (clientUserId: string) => {
    setMessage(null);
    startTransition(async () => {
      const result = await sendClientVerificationReminder(clientUserId);
      setMessage(
        result.success
          ? "Verification reminder notification sent successfully."
          : result.error || "Failed to send reminder notification.",
      );
    });
  };

  const handleSuspension = (clientUserId: string, suspended: boolean) => {
    if (!window.confirm(suspended ? "Suspend this client from posting jobs and funding escrow?" : "Restore this client account?")) {
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await setSuspendedStatus(clientUserId, suspended);
      if (result.success) {
        setMessage(suspended ? "Client account suspended." : "Client account restored to active standing.");
        router.refresh();
        return;
      }
      setMessage(result.error || "Failed to update suspension status.");
    });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle2,
          class: "bg-success/10 text-success border-success/20",
          label: "Verified",
        };
      case "suspended":
        return {
          icon: UserX,
          class: "bg-destructive/10 text-destructive border-destructive/20",
          label: "Suspended",
        };
      case "pending":
        return {
          icon: Clock,
          class: "bg-warning/10 text-warning border-warning/20",
          label: "Pending KYC",
        };
      default:
        return {
          icon: UserRound,
          class: "bg-secondary text-muted-foreground border-border",
          label: "Not Started",
        };
    }
  };

  const handleOpenDrawer = (client: ClientData) => {
    setDrawerClient(client);
    setIsDrawerOpen(true);
  };

  return (
    <FadeContent blur duration={0.3} className="space-y-6 w-full">
      {/* 1. Flush, Unboxed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("admin.clients.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("admin.clients.desc")}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border shadow-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === "grid"
                ? "bg-secondary text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t("admin.clients.view.grid")}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewMode === "table"
                ? "bg-secondary text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>{t("admin.clients.view.table")}</span>
          </button>
        </div>
      </div>

      {/* Message alert */}
      {message && (
        <div className="rounded-xl border border-accent/30 bg-accent/10 p-3.5 text-xs font-medium text-foreground flex items-center justify-between shadow-xs">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Client Identity & Verification Status Gauge (Liquid Wave Chart matching user reference) */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">{t("admin.clients.breakdown.title")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("admin.clients.breakdown.desc")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t("admin.clients.breakdown.complianceRate")}:</span>
            <span className="text-xs font-mono font-bold text-foreground bg-secondary px-2.5 py-1 rounded-lg border border-border">
              {counts.approved} / {counts.all} ({verifiedPercent}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Liquid Wave Circular Fill Gauge */}
          <div className="md:col-span-5 flex items-center justify-center py-2">
            <LiquidWaveGauge percentage={verifiedPercent} size={160} label={t("admin.clients.breakdown.verifiedEmployers")} />
          </div>

          {/* Breakdown cards - Zero fake dots */}
          <div className="md:col-span-7 grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground font-semibold">
                  {t("admin.clients.breakdown.verifiedFayda")}
                </span>
                <span className="font-mono font-bold text-success text-sm">{counts.approved}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{t("admin.clients.breakdown.verifiedFaydaDesc")}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground font-semibold">
                  {t("admin.clients.breakdown.pendingKyc")}
                </span>
                <span className="font-mono font-bold text-warning text-sm">{counts.pending}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{t("admin.clients.breakdown.pendingKycDesc")}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground font-semibold">
                  {t("admin.clients.breakdown.notStarted")}
                </span>
                <span className="font-mono font-bold text-muted-foreground text-sm">{counts.not_started}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{t("admin.clients.breakdown.notStartedDesc")}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground font-semibold">
                  {t("admin.clients.breakdown.suspended")}
                </span>
                <span className="font-mono font-bold text-destructive text-sm">{counts.suspended}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{t("admin.clients.breakdown.suspendedDesc")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar (Uncontained) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.clients.searchPlaceholder")}
            className="w-full h-9 pl-9 pr-8 rounded-lg bg-secondary border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition"
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

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: t("admin.clients.filter.all"), count: counts.all },
            { id: "approved", label: t("admin.clients.filter.approved"), count: counts.approved },
            { id: "pending", label: t("admin.clients.filter.pending"), count: counts.pending },
            { id: "not_started", label: t("admin.clients.filter.notStarted"), count: counts.not_started },
            { id: "suspended", label: t("admin.clients.filter.suspended"), count: counts.suspended },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setStatusFilter(chip.id as typeof statusFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === chip.id
                  ? "bg-accent text-accent-foreground shadow-xs font-bold"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{chip.label}</span>
              <span className="text-[10px] font-mono opacity-80">({chip.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Clients Presentation: 3-Column Dossier Grid or Registry Table */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => {
            const status = displayStatus(client);
            const statusInfo = statusBadge(status);
            const StatusIcon = statusInfo.icon;
            const coolingDown = isReminderCoolingDown(client.lastReminderAt);

            return (
              <div
                key={client.userId}
                className="rounded-xl border border-border bg-card p-5 space-y-4 hover:border-accent/40 transition-all duration-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Card Top: Avatar, Name & Status Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center font-bold text-foreground text-sm shadow-xs shrink-0">
                        {client.fullName?.charAt(0) || <User className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-foreground truncate">{client.fullName}</h3>
                        <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                        {client.phone && (
                          <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
                            +251 {client.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusInfo.class}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* Card Middle: Fayda Status & Registration details */}
                  <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Fayda FIN</span>
                      <p className="font-mono font-semibold text-foreground truncate">
                        {client.maskedFin || "No FIN"}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">KYC Document</span>
                      <p className="font-semibold text-foreground truncate">
                        {client.hasDocument ? "Scan On File" : "No Document"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Action Toolbar */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenDrawer(client)}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold border border-border transition cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      <span>{t("admin.clients.inspect")}</span>
                    </button>

                    {canOpenDetails && (
                      <Link
                        href={`/admin/clients/${client.userId}`}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-semibold border border-accent/20 transition"
                      >
                        <User className="w-3 h-3" />
                        <span>Profile</span>
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {canReview && (status === "not_started" || status === "rejected") && (
                      <button
                        type="button"
                        onClick={() => handleSendReminder(client.userId)}
                        disabled={coolingDown || isPending}
                        title={coolingDown ? "Reminder sent recently" : "Send KYC reminder"}
                        className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-40 transition"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canSuspendAccount && !client.isSuspended && (
                      <button
                        type="button"
                        onClick={() => handleSuspension(client.userId, true)}
                        disabled={isPending}
                        title="Suspend client account"
                        className="p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canReactivateAccount && client.isSuspended && (
                      <button
                        type="button"
                        onClick={() => handleSuspension(client.userId, false)}
                        disabled={isPending}
                        title="Reactivate client account"
                        className="p-1.5 rounded-lg border border-success/30 text-success hover:bg-success/10 transition"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-muted-foreground bg-card border border-border rounded-xl">
              No clients found matching the selected filter criteria.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-secondary/50">
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Fayda National ID</th>
                  <th className="py-3 px-4">KYC Document</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filtered.map((client) => {
                  const status = displayStatus(client);
                  const statusInfo = statusBadge(status);
                  const StatusIcon = statusInfo.icon;
                  const coolingDown = isReminderCoolingDown(client.lastReminderAt);

                  return (
                    <tr key={client.userId} className="hover:bg-secondary/40 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-bold text-xs text-muted-foreground">
                            {client.fullName?.charAt(0) || <User className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-xs">{client.fullName}</p>
                            <p className="text-[11px] text-muted-foreground">{client.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.class}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                        {client.maskedFin || "None"}
                      </td>

                      <td className="py-3 px-4 text-xs font-medium">
                        {client.hasDocument ? (
                          <span className="text-success flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Uploaded</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Missing</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(client)}
                            className="px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Review</span>
                          </button>

                          {canOpenDetails && (
                            <Link
                              href={`/admin/clients/${client.userId}`}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent font-medium transition"
                            >
                              <User className="h-3 w-3" />
                              <span>Profile</span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-xs text-muted-foreground">
                      No client accounts matching current search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-out Client Detail Drawer */}
      <ClientDetailDrawer
        client={drawerClient}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        canReview={canReview}
        canSuspend={canSuspendAccount}
        canReactivate={canReactivateAccount}
        onStatusChanged={() => {
          setIsDrawerOpen(false);
          router.refresh();
        }}
      />
    </FadeContent>
  );
}
