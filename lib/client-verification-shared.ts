export const CLIENT_PIN_VERIFICATION_MESSAGE =
  "Fayda identity verification is required before setting up your contract PIN.";

export const CLIENT_CONTRACT_VERIFICATION_MESSAGE =
  "Fayda identity verification is required before accessing contracts.";

export const CLIENT_VERIFICATION_STATES = [
  "not_started",
  "pending",
  "approved",
  "rejected",
  "suspended",
  "revoked",
] as const;

export function getClientVerificationHref(returnTo?: string | null, reason = CLIENT_CONTRACT_VERIFICATION_MESSAGE) {
  const params = new URLSearchParams({ verify: "1", reason });
  if (returnTo) params.set("returnTo", returnTo);
  return `/client/profile/settings?${params.toString()}`;
}

export function toClientDisplayStatus(status?: string | null, isVerified?: boolean | null) {
  if (status === "incomplete" || !status) return isVerified ? "approved" : "not_started";
  return status;
}
