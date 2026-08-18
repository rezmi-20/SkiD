import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  doublePrecision,
  pgEnum,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["client", "worker", "admin"]);
export const jobStatusEnum = pgEnum("job_status", [
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
  "disputed",
  "cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "held",
  "released",
  "refunded",
]);
export const disputeStatusEnum = pgEnum("dispute_status", [
  "open",
  "under_review",
  "awaiting_client_response",
  "awaiting_worker_response",
  "evidence_review",
  "resolved",
  "dismissed",
  "escalated",
  "rejected",
]);
export const serviceCategoryEnum = pgEnum("service_category", [
  "electrician",
  "plumber",
  "painter",
  "satellite_installer",
  "house_finishing",
]);

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("client"),
  isSuspended: boolean("is_suspended").notNull().default(false),
  adminRole: varchar("admin_role", { length: 50 }),
  adminStatus: varchar("admin_status", { length: 50 }),
  adminActivationRequired: boolean("admin_activation_required").notNull().default(false),
  adminUsername: varchar("admin_username", { length: 32 }),
  adminFullName: varchar("admin_full_name", { length: 255 }),
  adminTempCredentialExpiresAt: timestamp("admin_temp_credential_expires_at"),
  adminActivationCompletedAt: timestamp("admin_activation_completed_at"),
  adminIdentityReference: varchar("admin_identity_reference", { length: 120 }),
  adminIdentityNote: text("admin_identity_note"),
  adminCreatedBy: uuid("admin_created_by"),
  adminCreatedAt: timestamp("admin_created_at"),
  adminUpdatedAt: timestamp("admin_updated_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("user_email_idx").on(table.email),
  index("user_phone_idx").on(table.phone),
  index("user_admin_role_idx").on(table.adminRole),
  index("user_admin_status_idx").on(table.adminStatus),
  uniqueIndex("user_admin_username_unique_idx").on(table.adminUsername),
]);

// ─── Worker Profiles ──────────────────────────────────────────────────────────
export const workerProfiles = pgTable("worker_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  bio: text("bio"),
  skills: text("skills").array(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  faydaDocUrl: text("fayda_doc_url"),
  finEncrypted: text("fin_encrypted"),
  finEncryptionKeyId: varchar("fin_encryption_key_id", { length: 64 }),
  finFingerprint: text("fin_fingerprint"),
  finLast4: varchar("fin_last4", { length: 4 }),
  verificationProvider: varchar("verification_provider", { length: 100 }),
  verificationReference: varchar("verification_reference", { length: 255 }),
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender", { length: 20 }),
  district: varchar("district", { length: 100 }),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationStatus: varchar("verification_status", { length: 50 }).notNull().default("pending"),
  verificationReason: text("verification_reason"),
  verifiedBy: uuid("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  hourlyRate: integer("hourly_rate"),
  experienceYears: integer("experience_years").default(0),
  availability: text("availability").default("available"),
  avatarUrl: text("avatar_url"),
  chapaSubaccountId: text("chapa_subaccount_id").unique(),
  bankAccount: text("bank_account"),
  bankName: text("bank_name"),
  bankCode: varchar("bank_code", { length: 50 }),
  chapaSplitType: varchar("chapa_split_type", { length: 20 }).default("percentage"),
  chapaSplitValue: doublePrecision("chapa_split_value").default(0.05),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminEmployees = pgTable("admin_employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminEmployeeId: varchar("admin_employee_id", { length: 32 }).notNull(),
  workEmail: varchar("work_email", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  department: varchar("department", { length: 120 }).notNull().default("Operations"),
  adminRole: varchar("admin_role", { length: 50 }).notNull(),
  adminStatus: varchar("admin_status", { length: 50 }).notNull().default("activation_required"),
  adminActivationRequired: boolean("admin_activation_required").notNull().default(true),
  passwordHash: text("password_hash").notNull(),
  tempCredentialExpiresAt: timestamp("temp_credential_expires_at"),
  activationCompletedAt: timestamp("activation_completed_at"),
  adminIdentityReference: varchar("admin_identity_reference", { length: 120 }),
  identityReference: varchar("identity_reference", { length: 120 }),
  identityNote: text("identity_note"),
  sessionVersion: integer("session_version").notNull().default(0),
  createdBy: uuid("created_by"),
  legacyUserId: uuid("legacy_user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("admin_employees_employee_id_unique_idx").on(table.adminEmployeeId),
  uniqueIndex("admin_employees_work_email_unique_idx").on(table.workEmail),
  uniqueIndex("admin_employees_admin_identity_reference_unique_idx").on(table.adminIdentityReference),
  index("admin_employees_role_idx").on(table.adminRole),
  index("admin_employees_status_idx").on(table.adminStatus),
]);

// ─── Client Profiles ──────────────────────────────────────────────────────────
export const clientProfiles = pgTable("client_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  faydaDocUrl: text("fayda_doc_url"),
  finEncrypted: text("fin_encrypted"),
  finEncryptionKeyId: varchar("fin_encryption_key_id", { length: 64 }),
  finFingerprint: text("fin_fingerprint"),
  finLast4: varchar("fin_last4", { length: 4 }),
  verificationStatus: varchar("verification_status", { length: 50 }).notNull().default("not_started"),
  verificationReason: text("verification_reason"),
  verificationProvider: varchar("verification_provider", { length: 100 }),
  verificationReference: varchar("verification_reference", { length: 255 }),
  verifiedBy: uuid("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => users.id),
  workerId: uuid("worker_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: jobStatusEnum("status").notNull().default("pending"),
  budget: integer("budget"),
  location: text("location"),
  requestedDate: timestamp("requested_date"),
  rejectionReason: text("rejection_reason"),
  completionRejectionReason: text("completion_rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("job_status_idx").on(table.status),
  index("job_created_at_idx").on(table.createdAt),
  index("job_client_idx").on(table.clientId),
  index("job_worker_idx").on(table.workerId),
]);

// ─── Contracts ────────────────────────────────────────────────────────────────
export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  terms: text("terms"),
  status: varchar("status", { length: 50 }).notNull().default("DRAFT"),
  jobTitle: varchar("job_title", { length: 255 }),
  jobDescription: text("job_description"),
  workLocation: text("work_location"),
  paymentAmount: integer("payment_amount"),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  materialsResponsibility: text("materials_responsibility"),
  additionalNotes: text("additional_notes"),
  termsStatus: varchar("terms_status", { length: 50 }).notNull().default("draft"),
  termsSubmittedAt: timestamp("terms_submitted_at"),
  termsSubmittedBy: uuid("terms_submitted_by").references(() => users.id),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  termsAcceptedBy: uuid("terms_accepted_by").references(() => users.id),
  termsRejectedAt: timestamp("terms_rejected_at"),
  termsRejectedBy: uuid("terms_rejected_by").references(() => users.id),
  termsRejectionReason: text("terms_rejection_reason"),
  finalizedAt: timestamp("finalized_at"),
  finalizedBy: uuid("finalized_by").references(() => users.id),
  finalizedSnapshot: json("finalized_snapshot"),
  pdfUrl: text("pdf_url"),
  finalPdfBase64: text("final_pdf_base64"),
  documentHash: text("document_hash"),
  qrCodeDataUrl: text("qr_code_data_url"),
  activatedAt: timestamp("activated_at"),
  clientSignedAt: timestamp("client_signed_at"),
  workerSignedAt: timestamp("worker_signed_at"),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("contract_job_idx").on(table.jobId),
  uniqueIndex("contract_job_unique_idx").on(table.jobId),
]);

// ─── Ratings ──────────────────────────────────────────────────────────────────
export const contractSetups = pgTable("contract_setups", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  pinHash: text("pin_hash").notNull(),
  acceptedPolicy: boolean("accepted_policy").notNull().default(false),
  acceptedSignatureUse: boolean("accepted_signature_use").notNull().default(false),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const contractSignatures = pgTable("contract_signatures", {
  id: uuid("id").primaryKey().defaultRandom(),
  contractId: uuid("contract_id")
    .notNull()
    .references(() => contracts.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: varchar("role", { length: 20 }).notNull(),
  consentConfirmed: boolean("consent_confirmed").notNull().default(false),
  signedAt: timestamp("signed_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("contract_signature_contract_idx").on(table.contractId),
  index("contract_signature_user_idx").on(table.userId),
  uniqueIndex("contract_signature_contract_user_unique_idx").on(table.contractId, table.userId),
]);

export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id),
  raterId: uuid("rater_id")
    .notNull()
    .references(() => users.id),
  ratedId: uuid("rated_id")
    .notNull()
    .references(() => users.id),
  score: integer("score").notNull(),
  comment: text("comment"),
  photoUrls: text("photo_urls").array(),
  isFlagged: boolean("is_flagged").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("rating_reviewee_idx").on(table.ratedId),
  index("rating_created_at_idx").on(table.createdAt),
  index("rating_job_idx").on(table.jobId),
  uniqueIndex("rating_job_rater_rated_unique_idx").on(table.jobId, table.raterId, table.ratedId),
]);

// ─── Conversations ────────────────────────────────────────────────────────────
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => users.id),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Messages ─────────────────────────────────────────────────────────────────
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id),
  body: text("body"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("message_conversation_idx").on(table.conversationId),
  index("message_created_at_idx").on(table.createdAt),
]);

// ─── Payments ─────────────────────────────────────────────────────────────────
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id),
  amount: integer("amount").notNull(),
  commissionAmount: integer("commission_amount"),
  netAmount: integer("net_amount"),
  status: paymentStatusEnum("status").notNull().default("held"),
  chapaRef: varchar("chapa_ref", { length: 255 }),
  chapaReference: text("chapa_reference"),
  chapaCheckoutUrl: text("chapa_checkout_url"),
  chapaStatus: varchar("chapa_status", { length: 50 }),
  chapaResponse: json("chapa_response"),
  workerSubaccountId: text("worker_subaccount_id"),
  financialHoldStatus: varchar("financial_hold_status", { length: 30 }).notNull().default("none"),
  holdDisputeId: uuid("hold_dispute_id"),
  holdReason: text("hold_reason"),
  heldByAdminId: uuid("held_by_admin_id").references(() => adminEmployees.id),
  heldAt: timestamp("held_at"),
  holdReleasedAt: timestamp("hold_released_at"),
  holdReleaseReason: text("hold_release_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("payment_job_idx").on(table.jobId),
  index("payment_status_idx").on(table.status),
  uniqueIndex("payment_chapa_ref_unique_idx").on(table.chapaRef),
]);

// ─── Community Feed ────────────────────────────────────────────────────────────
export const communityPosts = pgTable("community_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  category: text("category").notNull(),
  likesCount: integer("likes_count").notNull().default(0),
  flagsCount: integer("flags_count").notNull().default(0),
  isRemoved: boolean("is_removed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const communityLikes = pgTable("community_likes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  postId: uuid("post_id").notNull().references(() => communityPosts.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const communityFlags = pgTable("community_flags", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  postId: uuid("post_id").notNull().references(() => communityPosts.id),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contentModerationEvents = pgTable("content_moderation_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  contentId: uuid("content_id").notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  reason: text().notNull(),
  adminEmployeeId: uuid("admin_employee_id").references(() => adminEmployees.id),
  adminRole: varchar("admin_role", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("content_moderation_events_content_idx").on(table.contentType, table.contentId),
]);

export const communityComments = pgTable("community_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  postId: uuid("post_id").notNull().references(() => communityPosts.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Notifications ─────────────────────────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  linkHref: text("link_href"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Disputes ──────────────────────────────────────────────────────────────────
export const disputes = pgTable("disputes", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobs.id),
  clientId: uuid("client_id").notNull().references(() => users.id),
  workerId: uuid("worker_id").notNull().references(() => users.id),
  title: varchar("title", { length: 160 }),
  category: varchar("category", { length: 50 }),
  requestedResolution: varchar("requested_resolution", { length: 50 }),
  openedBy: uuid("opened_by").references(() => users.id),
  openedByRole: varchar("opened_by_role", { length: 20 }),
  contractId: uuid("contract_id").references(() => contracts.id),
  paymentId: uuid("payment_id").references(() => payments.id),
  description: text("description").notNull(),
  evidenceUrls: text("evidence_urls").array(),
  status: disputeStatusEnum("status").default("open"),
  adminId: uuid("admin_id").references(() => users.id),
  assignedAdminId: uuid("assigned_admin_id").references(() => adminEmployees.id),
  assignedAt: timestamp("assigned_at"),
  assignmentVersion: integer("assignment_version").notNull().default(0),
  creationSnapshot: json("creation_snapshot"),
  finalDecision: varchar("final_decision", { length: 50 }),
  finalReason: text("final_reason"),
  financialActionRequired: boolean("financial_action_required").notNull().default(false),
  financialActionState: varchar("financial_action_state", { length: 50 }).notNull().default("none"),
  financialActionUpdatedAt: timestamp("financial_action_updated_at"),
  workflowFrozen: boolean("workflow_frozen").notNull().default(true),
  conflictAdminIds: uuid("conflict_admin_ids").array(),
  resolutionNotes: text("resolution_notes"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("dispute_job_idx").on(table.jobId),
  index("dispute_client_idx").on(table.clientId),
  index("dispute_worker_idx").on(table.workerId),
  index("dispute_status_idx").on(table.status),
  index("dispute_assigned_admin_idx").on(table.assignedAdminId),
]);

export const disputeEvents = pgTable("dispute_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  disputeId: uuid("dispute_id").notNull().references(() => disputes.id, { onDelete: "cascade" }),
  actorType: varchar("actor_type", { length: 30 }).notNull(),
  actorId: uuid("actor_id"),
  eventType: varchar("event_type", { length: 60 }).notNull(),
  oldStatus: varchar("old_status", { length: 50 }),
  newStatus: varchar("new_status", { length: 50 }),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("dispute_events_dispute_idx").on(table.disputeId, table.createdAt),
]);

export const disputeEvidence = pgTable("dispute_evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  disputeId: uuid("dispute_id").notNull().references(() => disputes.id, { onDelete: "cascade" }),
  uploadedBy: uuid("uploaded_by").notNull().references(() => users.id),
  uploaderRole: varchar("uploader_role", { length: 20 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  fileSize: integer("file_size").notNull(),
  storageFingerprint: varchar("storage_fingerprint", { length: 128 }).notNull(),
  isRemoved: boolean("is_removed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("dispute_evidence_dispute_idx").on(table.disputeId, table.createdAt),
]);

export const disputeResponses = pgTable("dispute_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  disputeId: uuid("dispute_id").notNull().references(() => disputes.id, { onDelete: "cascade" }),
  requestedByAdminId: uuid("requested_by_admin_id").references(() => adminEmployees.id),
  requestedFrom: varchar("requested_from", { length: 20 }).notNull(),
  instruction: text("instruction").notNull(),
  dueAt: timestamp("due_at"),
  status: varchar("status", { length: 30 }).notNull().default("requested"),
  responseText: text("response_text"),
  respondedBy: uuid("responded_by").references(() => users.id),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("dispute_responses_dispute_idx").on(table.disputeId, table.createdAt),
]);

export const disputeAdminNotes = pgTable("dispute_admin_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  disputeId: uuid("dispute_id").notNull().references(() => disputes.id, { onDelete: "cascade" }),
  adminEmployeeId: uuid("admin_employee_id").notNull().references(() => adminEmployees.id),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("dispute_notes_dispute_idx").on(table.disputeId, table.createdAt),
]);

export const disputeFinancialActions = pgTable("dispute_financial_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  disputeId: uuid("dispute_id").notNull().references(() => disputes.id, { onDelete: "cascade" }),
  paymentId: uuid("payment_id").references(() => payments.id),
  action: varchar("action", { length: 60 }).notNull(),
  proposalStatus: varchar("proposal_status", { length: 40 }).notNull().default("proposed"),
  amount: integer("amount"),
  currency: varchar("currency", { length: 10 }).notNull().default("ETB"),
  reason: text("reason").notNull(),
  proposedByAdminId: uuid("proposed_by_admin_id").references(() => adminEmployees.id),
  approvedByAdminId: uuid("approved_by_admin_id").references(() => adminEmployees.id),
  rejectedByAdminId: uuid("rejected_by_admin_id").references(() => adminEmployees.id),
  previousFinancialState: varchar("previous_financial_state", { length: 60 }),
  newFinancialState: varchar("new_financial_state", { length: 60 }),
  disputeStatusSnapshot: varchar("dispute_status_snapshot", { length: 50 }),
  decisionSnapshot: varchar("decision_snapshot", { length: 50 }),
  paymentStatusSnapshot: varchar("payment_status_snapshot", { length: 50 }),
  holdStatusSnapshot: varchar("hold_status_snapshot", { length: 30 }),
  providerActionReference: text("provider_action_reference"),
  providerActionStatus: varchar("provider_action_status", { length: 60 }),
  providerActionResponse: json("provider_action_response"),
  idempotencyKey: varchar("idempotency_key", { length: 160 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  executedAt: timestamp("executed_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("dispute_financial_actions_idempotency_unique_idx").on(table.idempotencyKey),
  index("dispute_financial_actions_dispute_idx").on(table.disputeId, table.createdAt),
  index("dispute_financial_actions_payment_idx").on(table.paymentId, table.createdAt),
  index("dispute_financial_actions_status_idx").on(table.proposalStatus),
]);

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: varchar("reference", { length: 32 }).notNull(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ownerRole: varchar("owner_role", { length: 20 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("normal"),
  status: varchar("status", { length: 30 }).notNull().default("open"),
  subject: varchar("subject", { length: 180 }).notNull(),
  description: text("description").notNull(),
  relatedJobId: uuid("related_job_id").references(() => jobs.id),
  relatedContractId: uuid("related_contract_id").references(() => contracts.id),
  relatedPaymentId: uuid("related_payment_id").references(() => payments.id),
  linkedDisputeId: uuid("linked_dispute_id").references(() => disputes.id),
  escalationType: varchar("escalation_type", { length: 40 }),
  escalationReason: text("escalation_reason"),
  assignedAdminId: uuid("assigned_admin_id").references(() => adminEmployees.id),
  assignedAt: timestamp("assigned_at"),
  assignmentVersion: integer("assignment_version").notNull().default(0),
  resolutionType: varchar("resolution_type", { length: 50 }),
  resolutionSummary: text("resolution_summary"),
  resolvedByAdminId: uuid("resolved_by_admin_id").references(() => adminEmployees.id),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  idempotencyKey: varchar("idempotency_key", { length: 160 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("support_tickets_reference_unique_idx").on(table.reference),
  uniqueIndex("support_tickets_idempotency_unique_idx").on(table.idempotencyKey),
  index("support_tickets_owner_idx").on(table.ownerId, table.status),
  index("support_tickets_status_idx").on(table.status, table.updatedAt),
  index("support_tickets_assigned_admin_idx").on(table.assignedAdminId, table.status),
  index("support_tickets_related_job_idx").on(table.relatedJobId),
]);

export const supportMessages = pgTable("support_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
  actorType: varchar("actor_type", { length: 30 }).notNull(),
  actorId: uuid("actor_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("support_messages_ticket_idx").on(table.ticketId, table.createdAt),
]);

export const supportEvents = pgTable("support_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
  actorType: varchar("actor_type", { length: 30 }).notNull(),
  actorId: uuid("actor_id"),
  eventType: varchar("event_type", { length: 60 }).notNull(),
  oldStatus: varchar("old_status", { length: 30 }),
  newStatus: varchar("new_status", { length: 30 }),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("support_events_ticket_idx").on(table.ticketId, table.createdAt),
]);

export const supportInternalNotes = pgTable("support_internal_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
  adminEmployeeId: uuid("admin_employee_id").notNull().references(() => adminEmployees.id),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("support_internal_notes_ticket_idx").on(table.ticketId, table.createdAt),
]);

export const supportAttachments = pgTable("support_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
  uploadedBy: uuid("uploaded_by").notNull().references(() => users.id),
  uploaderRole: varchar("uploader_role", { length: 20 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  fileSize: integer("file_size").notNull(),
  storageFingerprint: varchar("storage_fingerprint", { length: 128 }).notNull(),
  isRemoved: boolean("is_removed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("support_attachments_ticket_idx").on(table.ticketId, table.createdAt),
]);

// ─── Audit Logs ────────────────────────────────────────────────────────────────
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorType: varchar("actor_type", { length: 30 }),
  userId: uuid("user_id").references(() => users.id),
  adminEmployeeId: uuid("admin_employee_id").references(() => adminEmployees.id),
  adminRole: varchar("admin_role", { length: 50 }),
  action: text("action").notNull(),
  module: varchar("module", { length: 60 }),
  targetType: varchar("target_type", { length: 60 }),
  targetId: text("target_id"),
  previousState: json("previous_state"),
  newState: json("new_state"),
  reason: text("reason"),
  relatedReference: varchar("related_reference", { length: 120 }),
  highRisk: boolean("high_risk").notNull().default(false),
  proposedByAdminId: uuid("proposed_by_admin_id").references(() => adminEmployees.id),
  approvedByAdminId: uuid("approved_by_admin_id").references(() => adminEmployees.id),
  executedByType: varchar("executed_by_type", { length: 30 }),
  details: json("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("audit_logs_created_idx").on(table.createdAt),
  index("audit_logs_admin_idx").on(table.adminEmployeeId, table.createdAt),
  index("audit_logs_action_idx").on(table.action, table.createdAt),
  index("audit_logs_target_idx").on(table.targetType, table.targetId),
  index("audit_logs_module_idx").on(table.module, table.createdAt),
  index("audit_logs_high_risk_idx").on(table.highRisk, table.createdAt),
]);

export const adminMisconductReviews = pgTable("admin_misconduct_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: varchar("reference", { length: 32 }).notNull(),
  employeeId: uuid("employee_id").notNull().references(() => adminEmployees.id),
  openedByAdminId: uuid("opened_by_admin_id").notNull().references(() => adminEmployees.id),
  status: varchar("status", { length: 30 }).notNull().default("open"),
  reason: text("reason").notNull(),
  referencedAuditIds: uuid("referenced_audit_ids").array(),
  outcome: varchar("outcome", { length: 50 }),
  outcomeReason: text("outcome_reason"),
  resolvedByAdminId: uuid("resolved_by_admin_id").references(() => adminEmployees.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("admin_misconduct_reviews_reference_unique_idx").on(table.reference),
  index("admin_misconduct_reviews_employee_idx").on(table.employeeId, table.status),
  index("admin_misconduct_reviews_status_idx").on(table.status, table.createdAt),
]);

export const adminMisconductEvents = pgTable("admin_misconduct_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewId: uuid("review_id").notNull().references(() => adminMisconductReviews.id, { onDelete: "cascade" }),
  actorAdminId: uuid("actor_admin_id").references(() => adminEmployees.id),
  eventType: varchar("event_type", { length: 60 }).notNull(),
  oldStatus: varchar("old_status", { length: 30 }),
  newStatus: varchar("new_status", { length: 30 }),
  note: text("note"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("admin_misconduct_events_review_idx").on(table.reviewId, table.createdAt),
]);

export const appeals = pgTable("appeals", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: varchar("reference", { length: 32 }).notNull(),
  appealType: varchar("appeal_type", { length: 50 }).notNull(),
  appellantUserId: uuid("appellant_user_id").notNull().references(() => users.id),
  appellantRole: varchar("appellant_role", { length: 20 }).notNull(),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: uuid("target_id").notNull(),
  originalDecision: varchar("original_decision", { length: 80 }),
  originalDecisionReason: text("original_decision_reason"),
  originalAdminId: uuid("original_admin_id").references(() => adminEmployees.id),
  status: varchar("status", { length: 40 }).notNull().default("appeal_requested"),
  reason: varchar("reason", { length: 80 }).notNull(),
  explanation: text("explanation").notNull(),
  evidenceReferences: text("evidence_references").array(),
  reviewedByAdminId: uuid("reviewed_by_admin_id").references(() => adminEmployees.id),
  outcome: varchar("outcome", { length: 60 }),
  outcomeReason: text("outcome_reason"),
  resolvedAt: timestamp("resolved_at"),
  idempotencyKey: varchar("idempotency_key", { length: 160 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("appeals_reference_unique_idx").on(table.reference),
  uniqueIndex("appeals_idempotency_unique_idx").on(table.idempotencyKey),
  index("appeals_appellant_idx").on(table.appellantUserId, table.status),
  index("appeals_target_idx").on(table.targetType, table.targetId),
  index("appeals_status_idx").on(table.status, table.createdAt),
]);

export const appealEvents = pgTable("appeal_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  appealId: uuid("appeal_id").notNull().references(() => appeals.id, { onDelete: "cascade" }),
  actorType: varchar("actor_type", { length: 30 }).notNull(),
  actorId: uuid("actor_id"),
  eventType: varchar("event_type", { length: 60 }).notNull(),
  oldStatus: varchar("old_status", { length: 40 }),
  newStatus: varchar("new_status", { length: 40 }),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("appeal_events_appeal_idx").on(table.appealId, table.createdAt),
]);

export const verificationAttempts = pgTable("verification_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountUserId: uuid("account_user_id").notNull().references(() => users.id),
  accountType: varchar("account_type", { length: 20 }).notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  documentReference: text("document_reference"),
  documentFingerprint: varchar("document_fingerprint", { length: 128 }),
  finLast4: varchar("fin_last4", { length: 4 }),
  isCurrent: boolean("is_current").notNull().default(true),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  decidedAt: timestamp("decided_at"),
  decidedBy: uuid("decided_by").references(() => adminEmployees.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("verification_attempts_account_idx").on(table.accountUserId, table.accountType),
  uniqueIndex("verification_attempts_account_number_unique_idx").on(table.accountUserId, table.accountType, table.attemptNumber),
]);

export const verificationEvents = pgTable("verification_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  attemptId: uuid("attempt_id").references(() => verificationAttempts.id),
  accountUserId: uuid("account_user_id").notNull().references(() => users.id),
  accountType: varchar("account_type", { length: 20 }).notNull(),
  oldStatus: varchar("old_status", { length: 50 }),
  newStatus: varchar("new_status", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  adminEmployeeId: uuid("admin_employee_id").references(() => adminEmployees.id),
  adminRole: varchar("admin_role", { length: 50 }),
  reason: text(),
  attemptNumber: integer("attempt_number"),
  documentFingerprint: varchar("document_fingerprint", { length: 128 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("verification_events_account_idx").on(table.accountUserId, table.accountType),
  index("verification_events_attempt_idx").on(table.attemptId),
]);

// ─── Saved Workers (Favorites) ─────────────────────────────────────────────────
export const savedWorkers = pgTable("saved_workers", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => users.id),
  workerId: uuid("worker_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── Notification Preferences ──────────────────────────────────────────────────
export const notificationPreferences = pgTable("notification_preferences", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
});
