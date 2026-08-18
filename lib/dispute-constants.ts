export const DISPUTE_CATEGORIES = [
  "work_not_completed",
  "work_quality",
  "contract_violation",
  "completion_disagreement",
  "payment_issue",
  "cancellation_disagreement",
  "misconduct",
  "other",
] as const;

export const DISPUTE_REQUESTED_RESOLUTIONS = [
  "continue_work",
  "redo_work",
  "cancel_job",
  "approve_completion",
  "reject_completion",
  "payment_review",
  "partial_payment",
  "refund_review",
  "account_review",
  "other",
] as const;

export const DISPUTE_ALLOWED_JOB_STATUSES = [
  "accepted",
  "active",
  "in_progress",
  "completion_requested",
  "completed",
  "payment_pending",
  "paid",
] as const;

export const DISPUTE_ACTIVE_STATUSES = [
  "open",
  "under_review",
  "awaiting_client_response",
  "awaiting_worker_response",
  "evidence_review",
  "escalated",
] as const;

export const DISPUTE_RESOLUTION_DECISIONS = [
  "resolved_for_client",
  "resolved_for_worker",
  "resolved_by_agreement",
  "dismissed",
  "escalated",
] as const;
