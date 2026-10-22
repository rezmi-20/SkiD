"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAdminPermission } from "@/lib/admin-authorization";

export interface FaqInput {
  topic: string;
  question: string;
  answer: string;
  takeaway?: string;
  language?: string;
  sortOrder?: number;
}

export interface TestimonialInput {
  name: string;
  role: string;
  trade: string;
  jobs?: string;
  quote: string;
  language?: string;
  avatarBg?: string;
  sortOrder?: number;
}

export interface AnnouncementInput {
  title: string;
  content: string;
  category?: string;
}

// ─── Landing FAQs ─────────────────────────────────────────────────────────────

export async function createLandingFaq(input: FaqInput) {
  const admin = await requireAdminPermission("content.moderate");

  const topic = input.topic.trim();
  const question = input.question.trim();
  const answer = input.answer.trim();
  const takeaway = input.takeaway?.trim() || null;
  const language = input.language?.trim() || "EN";
  const sortOrder = Number(input.sortOrder) || 0;

  if (!topic || !question || !answer) {
    return { success: false, error: "Topic, question, and answer are required." };
  }

  const [row] = await sql`
    INSERT INTO landing_faqs (topic, question, answer, takeaway, language, sort_order, is_active)
    VALUES (${topic}, ${question}, ${answer}, ${takeaway}, ${language}, ${sortOrder}, true)
    RETURNING id
  `;

  await sql`
    INSERT INTO audit_logs (admin_employee_id, actor_type, admin_role, action, module, target_type, target_id, details)
    VALUES (${admin.id}, 'admin_employee', ${admin.role}, 'faq_created', 'content', 'landing_faq', ${row.id}, ${JSON.stringify({ question, language })})
  `;

  revalidatePath("/");
  revalidatePath("/admin/community");
  return { success: true, id: row.id };
}

export async function updateLandingFaq(id: string, input: FaqInput & { isActive?: boolean }) {
  const admin = await requireAdminPermission("content.moderate");

  const topic = input.topic.trim();
  const question = input.question.trim();
  const answer = input.answer.trim();
  const takeaway = input.takeaway?.trim() || null;
  const language = input.language?.trim() || "EN";
  const sortOrder = Number(input.sortOrder) || 0;
  const isActive = input.isActive !== undefined ? Boolean(input.isActive) : true;

  if (!topic || !question || !answer) {
    return { success: false, error: "Topic, question, and answer are required." };
  }

  await sql`
    UPDATE landing_faqs
    SET topic = ${topic},
        question = ${question},
        answer = ${answer},
        takeaway = ${takeaway},
        language = ${language},
        sort_order = ${sortOrder},
        is_active = ${isActive},
        updated_at = now()
    WHERE id = ${id}
  `;

  await sql`
    INSERT INTO audit_logs (admin_employee_id, actor_type, admin_role, action, module, target_type, target_id, details)
    VALUES (${admin.id}, 'admin_employee', ${admin.role}, 'faq_updated', 'content', 'landing_faq', ${id}, ${JSON.stringify({ question, isActive })})
  `;

  revalidatePath("/");
  revalidatePath("/admin/community");
  return { success: true };
}

export async function deleteLandingFaq(id: string) {
  const admin = await requireAdminPermission("content.moderate");

  await sql`
    DELETE FROM landing_faqs WHERE id = ${id}
  `;

  await sql`
    INSERT INTO audit_logs (admin_employee_id, actor_type, admin_role, action, module, target_type, target_id)
    VALUES (${admin.id}, 'admin_employee', ${admin.role}, 'faq_deleted', 'content', 'landing_faq', ${id})
  `;

  revalidatePath("/");
  revalidatePath("/admin/community");
  return { success: true };
}

export async function toggleLandingFaq(id: string, isActive: boolean) {
  const admin = await requireAdminPermission("content.moderate");

  await sql`
    UPDATE landing_faqs SET is_active = ${isActive}, updated_at = now() WHERE id = ${id}
  `;

  await sql`
    INSERT INTO audit_logs (admin_employee_id, actor_type, admin_role, action, module, target_type, target_id, details)
    VALUES (${admin.id}, 'admin_employee', ${admin.role}, 'faq_toggled', 'content', 'landing_faq', ${id}, ${JSON.stringify({ isActive })})
  `;

  revalidatePath("/");
  revalidatePath("/admin/community");
  return { success: true };
}

// ─── Landing Testimonials ─────────────────────────────────────────────────────

export async function createLandingTestimonial(input: TestimonialInput) {
  const admin = await requireAdminPermission("content.moderate");

  const name = input.name.trim();
  const role = input.role.trim();
  const trade = input.trade.trim();
  const jobs = input.jobs?.trim() || "Verified Job";
  const quote = input.quote.trim();
  const language = input.language?.trim() || "EN";
  const avatarBg = input.avatarBg?.trim() || "bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-white";
  const sortOrder = Number(input.sortOrder) || 0;

  if (!name || !role || !quote) {
    return { success: false, error: "Name, role, and quote are required." };
  }

  const [row] = await sql`
    INSERT INTO landing_testimonials (name, role, trade, jobs, quote, language, avatar_bg, sort_order, is_active)
    VALUES (${name}, ${role}, ${trade}, ${jobs}, ${quote}, ${language}, ${avatarBg}, ${sortOrder}, true)
    RETURNING id
  `;

  await sql`
    INSERT INTO audit_logs (admin_employee_id, actor_type, admin_role, action, module, target_type, target_id, details)
    VALUES (${admin.id}, 'admin_employee', ${admin.role}, 'testimonial_created', 'content', 'landing_testimonial', ${row.id}, ${JSON.stringify({ name, trade })})
  `;

  revalidatePath("/");
  revalidatePath("/admin/community");
  return { success: true, id: row.id };
}

export async function updateLandingTestimonial(id: string, input: TestimonialInput & { isActive?: boolean }) {
  const admin = await requireAdminPermission("content.moderate");

  const name = input.name.trim();
  const role = input.role.trim();
  const trade = input.trade.trim();
  const jobs = input.jobs?.trim() || "Verified Job";
  const quote = input.quote.trim();
  const language = input.language?.trim() || "EN";
  const avatarBg = input.avatarBg?.trim() || "bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-white";
  const sortOrder = Number(input.sortOrder) || 0;
  const isActive = input.isActive !== undefined ? Boolean(input.isActive) : true;

  if (!name || !role || !quote) {
    return { success: false, error: "Name, role, and quote are required." };
  }

  await sql`
    UPDATE landing_testimonials
    SET name = ${name},
        role = ${role},
        trade = ${trade},
        jobs = ${jobs},
        quote = ${quote},
        language = ${language},
        avatar_bg = ${avatarBg},
        sort_order = ${sortOrder},
        is_active = ${isActive},
        updated_at = now()
    WHERE id = ${id}
  `;

  await sql`
    INSERT INTO audit_logs (admin_employee_id, actor_type, admin_role, action, module, target_type, target_id, details)
    VALUES (${admin.id}, 'admin_employee', ${admin.role}, 'testimonial_updated', 'content', 'landing_testimonial', ${id}, ${JSON.stringify({ name, isActive })})
  `;

  revalidatePath("/");
  revalidatePath("/admin/community");
  return { success: true };
}

export async function deleteLandingTestimonial(id: string) {
  const admin = await requireAdminPermission("content.moderate");

  await sql`
    DELETE FROM landing_testimonials WHERE id = ${id}
  `;

  await sql`
    INSERT INTO audit_logs (admin_employee_id, actor_type, admin_role, action, module, target_type, target_id)
    VALUES (${admin.id}, 'admin_employee', ${admin.role}, 'testimonial_deleted', 'content', 'landing_testimonial', ${id})
  `;

  revalidatePath("/");
  revalidatePath("/admin/community");
  return { success: true };
}

export async function toggleLandingTestimonial(id: string, isActive: boolean) {
  const admin = await requireAdminPermission("content.moderate");

  await sql`
    UPDATE landing_testimonials SET is_active = ${isActive}, updated_at = now() WHERE id = ${id}
  `;

  await sql`
    INSERT INTO audit_logs (admin_employee_id, actor_type, admin_role, action, module, target_type, target_id, details)
    VALUES (${admin.id}, 'admin_employee', ${admin.role}, 'testimonial_toggled', 'content', 'landing_testimonial', ${id}, ${JSON.stringify({ isActive })})
  `;

  revalidatePath("/");
  revalidatePath("/admin/community");
  return { success: true };
}

// ─── Official Community Announcements ─────────────────────────────────────────

export async function createOfficialAnnouncement(input: AnnouncementInput) {
  const admin = await requireAdminPermission("content.moderate");

  const title = input.title.trim();
  const content = input.content.trim();
  const category = input.category?.trim() || "Announcements";

  if (!title || !content) {
    return { success: false, error: "Title and content are required." };
  }

  // Find system/admin user or fallback to first super_admin or admin
  const userRows = await sql`
    SELECT id FROM users WHERE role = 'admin' LIMIT 1
  `;
  const systemUserId = userRows[0]?.id;

  if (!systemUserId) {
    return { success: false, error: "System administrator account not found for posting." };
  }

  const [post] = await sql`
    INSERT INTO community_posts (user_id, title, content, category, likes_count, flags_count, is_removed)
    VALUES (${systemUserId}, ${title}, ${content}, ${category}, 0, 0, false)
    RETURNING id
  `;

  await sql`
    INSERT INTO audit_logs (admin_employee_id, actor_type, admin_role, action, module, target_type, target_id, details)
    VALUES (${admin.id}, 'admin_employee', ${admin.role}, 'official_announcement_posted', 'content', 'community_post', ${post.id}, ${JSON.stringify({ title, category })})
  `;

  revalidatePath("/community");
  revalidatePath("/admin/community");
  return { success: true, postId: post.id };
}

// ─── Public Getters for Dynamic Landing Display ──────────────────────────────

export async function getActiveLandingFaqs(lang: string = "EN") {
  try {
    const rows = await sql`
      SELECT id, topic, question, answer, takeaway, sort_order
      FROM landing_faqs
      WHERE (language = ${lang} OR language = 'EN') AND is_active = true
      ORDER BY sort_order ASC, created_at ASC
    `;
    return rows || [];
  } catch {
    return [];
  }
}

export async function getActiveLandingTestimonials(lang: string = "EN") {
  try {
    const rows = await sql`
      SELECT id, name, role, trade, jobs, quote, avatar_bg, sort_order
      FROM landing_testimonials
      WHERE (language = ${lang} OR language = 'EN') AND is_active = true
      ORDER BY sort_order ASC, created_at ASC
    `;
    return rows || [];
  } catch {
    return [];
  }
}
