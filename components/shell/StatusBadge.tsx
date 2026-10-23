"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  FileText,
  FileSignature,
  PenTool,
  CheckCircle2,
  Clock,
  PlayCircle,
  CreditCard,
  Star,
  Ban,
  XCircle,
  Scale,
  HelpCircle,
  Wrench,
  ShieldCheck,
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STATUS_STYLES: Record<string, StatusConfig> = {
  DRAFT: {
    label: "Draft",
    icon: FileText,
    className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-300",
  },
  READY_FOR_SIGNATURE: {
    label: "Ready to Sign",
    icon: FileSignature,
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  },
  CLIENT_SIGNED: {
    label: "Client Signed",
    icon: PenTool,
    className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300",
  },
  WORKER_SIGNED: {
    label: "Worker Signed",
    icon: PenTool,
    className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300",
  },
  FULLY_SIGNED: {
    label: "Fully Signed",
    icon: CheckCircle2,
    className: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-300",
  },
  ACTIVE: {
    label: "Active",
    icon: ShieldCheck,
    className: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-300",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-300",
  },
  accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  },
  contract_signed: {
    label: "Contract Signed",
    icon: PenTool,
    className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300",
  },
  in_progress: {
    label: "In Progress",
    icon: Wrench,
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  },
  active: {
    label: "Active",
    icon: PlayCircle,
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-300",
  },
  paid: {
    label: "Paid",
    icon: CreditCard,
    className: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-300",
  },
  reviewed: {
    label: "Reviewed",
    icon: Star,
    className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-300",
  },
  rejected: {
    label: "Rejected",
    icon: Ban,
    className: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300",
  },
  disputed: {
    label: "Disputed",
    icon: Scale,
    className: "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-300",
  },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const { t } = useLanguage();
  const config = STATUS_STYLES[status] ?? {
    label: status ? String(status).replaceAll("_", " ") : "Unknown",
    icon: HelpCircle,
    className: "border-outline-variant bg-surface-container text-on-surface-variant",
  };

  const key = `jobs.status.${status?.toLowerCase()}`;
  const translated = t(key as any);
  const displayLabel = translated && translated !== key ? translated : config.label;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-widest ${config.className} ${
        size === "md" ? "px-3 py-1.5 text-[11px]" : "px-2.5 py-1 text-[9px]"
      }`}
    >
      <Icon className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} />
      <span>{displayLabel}</span>
    </span>
  );
}
