export function toWorkerDisplayStatus(
  status?: string | null,
  isVerified?: boolean | null,
  isSuspended?: boolean | null,
  identityComplete = true,
) {
  if (isSuspended) return "suspended";
  if (!identityComplete && (status === "approved" || isVerified)) return "incomplete";
  if (status === "approved") return "approved";
  if (status === "pending") return "pending";
  if (status === "rejected") return "rejected";
  if (status === "suspended") return "suspended";
  if (status === "revoked") return "revoked";
  if (status === "incomplete") return "incomplete";
  if (!status) return isVerified ? "approved" : "pending";
  return status;
}

export function isWorkerAwaitingReview(
  status?: string | null,
  isVerified?: boolean | null,
  isSuspended?: boolean | null,
  identityComplete = true,
) {
  return toWorkerDisplayStatus(status, isVerified, isSuspended, identityComplete) !== "approved";
}

export function hasCompleteWorkerIdentity(input: {
  documentRef?: unknown;
  finLast4?: unknown;
  finEncrypted?: unknown;
}) {
  return Boolean(
    typeof input.documentRef === "string" &&
      input.documentRef.trim().length > 0 &&
      typeof input.finLast4 === "string" &&
      input.finLast4.trim().length === 4 &&
      typeof input.finEncrypted === "string" &&
      input.finEncrypted.trim().length > 0,
  );
}
