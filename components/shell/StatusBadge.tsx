interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<string, { label: string; className: string; icon: string }> = {
  DRAFT: {
    label: "Draft",
    icon: "edit_document",
    className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-300",
  },
  READY_FOR_SIGNATURE: {
    label: "Ready to Sign",
    icon: "rate_review",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  },
  CLIENT_SIGNED: {
    label: "Client Signed",
    icon: "draw",
    className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300",
  },
  WORKER_SIGNED: {
    label: "Worker Signed",
    icon: "draw",
    className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300",
  },
  FULLY_SIGNED: {
    label: "Fully Signed",
    icon: "task_alt",
    className: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-300",
  },
  ACTIVE: {
    label: "Active",
    icon: "verified",
    className: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-300",
  },
  pending: {
    label: "Pending",
    icon: "schedule",
    className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-300",
  },
  accepted: {
    label: "Accepted",
    icon: "task_alt",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  },
  contract_signed: {
    label: "Contract Signed",
    icon: "draw",
    className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300",
  },
  in_progress: {
    label: "In Progress",
    icon: "construction",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  },
  active: {
    label: "Active",
    icon: "play_circle",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300",
  },
  completed: {
    label: "Completed",
    icon: "check_circle",
    className: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-300",
  },
  paid: {
    label: "Paid",
    icon: "payments",
    className: "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-300",
  },
  reviewed: {
    label: "Reviewed",
    icon: "reviews",
    className: "border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-300",
  },
  rejected: {
    label: "Rejected",
    icon: "block",
    className: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300",
  },
  cancelled: {
    label: "Cancelled",
    icon: "cancel",
    className: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300",
  },
  disputed: {
    label: "Disputed",
    icon: "gavel",
    className: "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-300",
  },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_STYLES[status] ?? {
    label: status || "Unknown",
    icon: "help",
    className: "border-outline-variant bg-surface-container text-on-surface-variant",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-widest ${config.className} ${
        size === "md" ? "px-3 py-1.5 text-[11px]" : "px-2.5 py-1 text-[9px]"
      }`}
    >
      <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
      {config.label}
    </span>
  );
}
