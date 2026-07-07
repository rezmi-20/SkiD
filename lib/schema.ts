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
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["client", "worker", "admin"]);
export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "accepted",
  "rejected",
  "in_progress",
  "active",
  "completed",
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
  "resolved",
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("user_email_idx").on(table.email),
  index("user_phone_idx").on(table.phone),
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
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender", { length: 20 }),
  district: varchar("district", { length: 100 }),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationStatus: varchar("verification_status", { length: 50 }).notNull().default("pending"),
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

// ─── Client Profiles ──────────────────────────────────────────────────────────
export const clientProfiles = pgTable("client_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("job_status_idx").on(table.status),
  index("job_created_at_idx").on(table.createdAt),
]);

// ─── Contracts ────────────────────────────────────────────────────────────────
export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  terms: text("terms"),
  pdfUrl: text("pdf_url"),
  clientSignedAt: timestamp("client_signed_at"),
  workerSignedAt: timestamp("worker_signed_at"),
  signedAt: timestamp("signed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("contract_job_idx").on(table.jobId),
]);

// ─── Ratings ──────────────────────────────────────────────────────────────────
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
  chapaCheckoutUrl: text("chapa_checkout_url"),
  chapaStatus: varchar("chapa_status", { length: 50 }),
  chapaResponse: json("chapa_response"),
  workerSubaccountId: text("worker_subaccount_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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
  description: text("description").notNull(),
  evidenceUrls: text("evidence_urls").array(),
  status: disputeStatusEnum("status").default("open"),
  adminId: uuid("admin_id").references(() => users.id),
  resolutionNotes: text("resolution_notes"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Audit Logs ────────────────────────────────────────────────────────────────
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: json("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

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
