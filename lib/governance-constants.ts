export const GOVERNANCE_APPEAL_WINDOW_DAYS = 7;

export const APPEAL_TYPES = ["dispute_resolution", "verification_decision"] as const;

export const APPEAL_REASONS = [
  "new_evidence",
  "procedural_error",
  "incorrect_fact",
  "decision_inconsistent_with_record",
  "other",
] as const;

export const APPEAL_STATUSES = [
  "appeal_requested",
  "appeal_under_review",
  "appeal_resolved",
  "appeal_dismissed",
] as const;

export const APPEAL_OUTCOMES = [
  "upheld",
  "returned_for_re_review",
  "overturned",
  "dismissed",
] as const;

export const MISCONDUCT_REVIEW_STATUSES = [
  "open",
  "under_review",
  "action_required",
  "resolved",
  "dismissed",
] as const;

export const MISCONDUCT_REVIEW_OUTCOMES = [
  "no_action",
  "warning_recorded",
  "training_required",
  "temporary_suspension",
  "revoke_admin_access",
] as const;

export const MISUSE_FLAGS = ["normal", "attention_required", "high_risk_review"] as const;
