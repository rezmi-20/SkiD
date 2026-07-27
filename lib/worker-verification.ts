export function toWorkerDisplayStatus(
  status?: string | null,
  isVerified?: boolean | null,
  isSuspended?: boolean | null,
) {
  if (isSuspended) return "suspended";
  if (status === "approved") return "approved";
  if (status === "pending") return "pending";
  if (status === "rejected") return "rejected";
  if (status === "suspended") return "suspended";
  if (status === "revoked") return "revoked";
  if (status === "incomplete" || !status) return isVerified ? "approved" : "pending";
  return status;
}

export function isWorkerAwaitingReview(
  status?: string | null,
  isVerified?: boolean | null,
  isSuspended?: boolean | null,
) {
  return toWorkerDisplayStatus(status, isVerified, isSuspended) !== "approved";
}
