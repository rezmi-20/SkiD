export const JOB_STATUSES = [
  "pending",
  "accepted",
  "active",
  "in_progress",
  "completion_requested",
  "completed",
  "payment_pending",
  "paid",
  "closed",
  "rejected",
  "cancelled",
  "disputed",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];
export type JobActorRole = "client" | "worker" | "admin";

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: "requested",
  accepted: "accepted / contract_pending",
  active: "contract_signed",
  in_progress: "in_progress",
  completion_requested: "completion_requested",
  completed: "completed / payment_pending",
  payment_pending: "payment_pending",
  paid: "paid",
  closed: "closed",
  rejected: "rejected",
  cancelled: "cancelled",
  disputed: "disputed",
};

export const JOB_STATUS_TRANSITIONS: Record<JobStatus, Partial<Record<JobActorRole, JobStatus[]>>> = {
  pending: {
    client: ["cancelled"],
    worker: ["accepted", "rejected"],
    admin: ["accepted", "rejected", "cancelled", "disputed"],
  },
  accepted: {
    client: ["cancelled", "disputed"],
    worker: ["cancelled"],
    admin: ["active", "cancelled", "disputed"],
  },
  active: {
    client: ["disputed"],
    worker: ["in_progress"],
    admin: ["in_progress", "cancelled", "disputed"],
  },
  in_progress: {
    client: ["disputed"],
    worker: ["completion_requested"],
    admin: ["completion_requested", "completed", "cancelled", "disputed"],
  },
  completion_requested: {
    client: ["completed", "in_progress", "disputed"],
    admin: ["completed", "in_progress", "disputed"],
  },
  completed: {
    client: ["payment_pending", "disputed"],
    admin: ["payment_pending", "paid", "disputed"],
  },
  payment_pending: {
    client: ["disputed"],
    admin: ["paid", "disputed"],
  },
  paid: {
    client: ["closed", "disputed"],
    worker: ["closed"],
    admin: ["closed", "disputed"],
  },
  closed: {},
  rejected: {},
  cancelled: {},
  disputed: {
    admin: ["in_progress", "completed", "cancelled", "closed"],
  },
};

export function isJobStatus(value: unknown): value is JobStatus {
  return typeof value === "string" && JOB_STATUSES.includes(value as JobStatus);
}

export function canTransitionJobStatus(currentStatus: JobStatus, nextStatus: JobStatus, role: JobActorRole) {
  return Boolean(JOB_STATUS_TRANSITIONS[currentStatus]?.[role]?.includes(nextStatus));
}

export function assertAllowedJobTransition(currentStatus: unknown, nextStatus: unknown, role: JobActorRole) {
  if (!isJobStatus(currentStatus)) {
    return { allowed: false, error: "Current job status is invalid." };
  }

  if (!isJobStatus(nextStatus)) {
    return { allowed: false, error: "Requested job status is invalid." };
  }

  if (currentStatus === nextStatus) {
    return { allowed: false, error: `Job is already ${nextStatus}.` };
  }

  if (!canTransitionJobStatus(currentStatus, nextStatus, role)) {
    return { allowed: false, error: `Cannot change job from ${currentStatus} to ${nextStatus} as ${role}.` };
  }

  return { allowed: true };
}
