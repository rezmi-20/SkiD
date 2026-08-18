export const SUPPORT_CATEGORIES = [
  "account_access",
  "identity_verification",
  "profile_account",
  "job_workflow",
  "contract_help",
  "payment_help",
  "technical_issue",
  "safety_concern",
  "other",
] as const;

export const SUPPORT_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export const SUPPORT_STATUSES = [
  "open",
  "assigned",
  "awaiting_user",
  "in_progress",
  "escalated",
  "resolved",
  "closed",
] as const;

export const SUPPORT_RESOLUTION_TYPES = [
  "guidance_provided",
  "issue_resolved",
  "referred_to_verification",
  "referred_to_dispute",
  "technical_issue_recorded",
  "unable_to_resolve",
] as const;

export const SUPPORT_REOPEN_WINDOW_DAYS = 14;

export const SUPPORT_ATTACHMENT_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
] as const;

export const SUPPORT_MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

export function supportLabel(value: string) {
  return value.replaceAll("_", " ");
}
