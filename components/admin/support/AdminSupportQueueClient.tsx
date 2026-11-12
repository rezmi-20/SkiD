"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { LifeBuoy, Search, X, Paperclip, ChevronRight, CheckCircle2, Clock, ShieldAlert, User, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface SupportTicket {
  id: string;
  reference: string;
  subject: string;
  customer_name?: string;
  customer_email?: string;
  priority: string;
  status: string;
  category?: string;
  created_at: string;
  attachment_count?: number;
  assigned_admin_name?: string;
}

interface Props {
  initialTickets: SupportTicket[];
}

function age(value: unknown) {
  if (!value) return "unknown";
  const hours = Math.max(0, Math.floor((Date.now() - new Date(String(value)).getTime()) / 36e5));
  if (hours < 1) return "<1h";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function AdminSupportQueueClient({ initialTickets }: Props) {
  const { t } = useLanguage();
  const [tickets] = useState<SupportTicket[]>(initialTickets);
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState<string>("open");

  const counts = useMemo(() => {
    return {
      all: tickets.length,
      open: tickets.filter((tk) => tk.status === "open").length,
      in_progress: tickets.filter((tk) => ["in_progress", "assigned", "awaiting_user"].includes(tk.status)).length,
      escalated: tickets.filter((tk) => tk.status === "escalated").length,
      resolved: tickets.filter((tk) => ["resolved", "closed"].includes(tk.status)).length,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tickets.filter((tk) => {
      let matchesStatus = true;
      if (activeStatus === "open") matchesStatus = tk.status === "open";
      else if (activeStatus === "in_progress") matchesStatus = ["in_progress", "assigned", "awaiting_user"].includes(tk.status);
      else if (activeStatus === "escalated") matchesStatus = tk.status === "escalated";
      else if (activeStatus === "resolved") matchesStatus = ["resolved", "closed"].includes(tk.status);
      else if (activeStatus !== "all") matchesStatus = tk.status === activeStatus;

      const matchesSearch =
        !q ||
        tk.reference.toLowerCase().includes(q) ||
        tk.subject.toLowerCase().includes(q) ||
        (tk.customer_name && tk.customer_name.toLowerCase().includes(q)) ||
        (tk.customer_email && tk.customer_email.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [tickets, search, activeStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return { label: t("admin.support.status.open"), class: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" };
      case "in_progress":
      case "assigned":
        return { label: t("admin.support.status.in_progress"), class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" };
      case "escalated":
        return { label: t("admin.support.status.escalated"), class: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30" };
      case "resolved":
        return { label: t("admin.support.status.resolved"), class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" };
      case "closed":
        return { label: t("admin.support.status.closed"), class: "bg-secondary text-muted-foreground border-border" };
      default:
        return { label: status, class: "bg-secondary text-foreground border-border" };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10 text-destructive border-destructive/30 font-bold";
      case "high":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-6 pb-24 w-full">
      {/* 1. Header (Clean deals.tsx style: No dots, no uppercase pill badges) */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {t("admin.support.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("admin.support.desc")}
        </p>
      </div>

      {/* 2. KPI Summary Cards (deals.tsx / forecasting.tsx pattern) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">{t("admin.support.kpi.open")}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground font-mono mt-1">{counts.open}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{t("admin.support.kpi.inProgress")}</p>
          <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono mt-1">{counts.in_progress}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{t("admin.support.kpi.escalated")}</p>
          <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 font-mono mt-1">{counts.escalated}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{t("admin.support.kpi.resolved")}</p>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono mt-1">{counts.resolved}</p>
        </div>
      </div>

      {/* 3. Floating Search & Filters (OUTSIDE table container - strictly matching deals.tsx) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.support.searchPlaceholder")}
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
              { id: "open", label: t("admin.support.status.open"), count: counts.open },
              { id: "in_progress", label: t("admin.support.status.in_progress"), count: counts.in_progress },
              { id: "escalated", label: t("admin.support.status.escalated"), count: counts.escalated },
              { id: "resolved", label: t("admin.support.status.resolved"), count: counts.resolved },
              { id: "all", label: t("admin.support.status.all"), count: counts.all },
            ].map((tab) => {
              const isSelected = activeStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Table Container (Isolated card, clean structure) */}
      <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xs">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">
                <th className="py-3 px-4">{t("admin.support.table.ticket")}</th>
                <th className="py-3 px-4">{t("admin.support.table.requester")}</th>
                <th className="py-3 px-4">{t("admin.support.table.priority")}</th>
                <th className="py-3 px-4">{t("admin.support.table.status")}</th>
                <th className="py-3 px-4">{t("admin.support.table.lastActivity")}</th>
                <th className="py-3 px-4">{t("admin.support.table.assignedStaff")}</th>
                <th className="py-3 px-4 text-right">{t("admin.support.table.action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTickets.map((ticket) => {
                const statusBadge = getStatusBadge(ticket.status);
                const priorityClass = getPriorityBadge(ticket.priority);

                return (
                  <tr
                    key={ticket.id}
                    className="hover:bg-secondary/30 transition-colors group"
                  >
                    {/* Ticket Reference & Subject */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-accent text-[11px]">
                            {ticket.reference}
                          </span>
                          {ticket.attachment_count ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-accent bg-accent/10 px-1.5 py-0.2 rounded">
                              <Paperclip className="h-2.5 w-2.5" />
                              <span>{ticket.attachment_count}</span>
                            </span>
                          ) : null}
                        </div>
                        <p className="font-semibold text-foreground text-xs truncate max-w-xs group-hover:text-accent transition">
                          {ticket.subject}
                        </p>
                      </div>
                    </td>

                    {/* Requester */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <p className="font-medium text-foreground text-xs truncate">
                          {ticket.customer_name || "Guest User"}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">{ticket.customer_email}</p>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold border ${priorityClass}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.class}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="capitalize">{statusBadge.label}</span>
                      </span>
                    </td>

                    {/* Age */}
                    <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                      {age(ticket.created_at)}
                    </td>

                    {/* Assigned Staff */}
                    <td className="py-3 px-4 text-foreground">
                      {ticket.assigned_admin_name || <span className="text-muted-foreground italic">Unassigned</span>}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/support/${ticket.id}`}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-semibold border border-border transition cursor-pointer"
                      >
                        <span>{t("admin.support.table.action")}</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <LifeBuoy className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    <p className="text-xs font-semibold text-foreground">
                      {t("admin.support.noTickets")}
                    </p>
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="mt-2 text-xs text-accent hover:underline cursor-pointer"
                      >
                        Clear search filter
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
