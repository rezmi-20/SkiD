import { sql } from "@/lib/db";
import { ContentAdministrationHub } from "@/components/admin/ContentAdministrationHub";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Content & Landing Administration | DireSkill Admin",
  description: "Manage landing page FAQs, testimonials, social content, and community feed moderation.",
};

export default async function CommunityPage() {
  const admin = await requireAdminPermission("content.read");

  const [postsData, faqsData, testimonialsData] = await Promise.all([
    sql`
      SELECT
        cp.id,
        cp.title,
        cp.content,
        cp.category,
        cp.likes_count AS "likesCount",
        cp.flags_count AS "flagsCount",
        cp.is_removed AS "isRemoved",
        COALESCE(wp.full_name, clp.full_name, u.email) AS "authorName"
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN worker_profiles wp ON u.id = wp.user_id AND u.role = 'worker'
      LEFT JOIN client_profiles clp ON u.id = clp.user_id AND u.role = 'client'
      ORDER BY cp.flags_count DESC, cp.created_at DESC
    `,
    sql`
      SELECT
        id,
        topic,
        question,
        answer,
        takeaway,
        language,
        sort_order AS "sortOrder",
        is_active AS "isActive"
      FROM landing_faqs
      ORDER BY sort_order ASC, created_at ASC
    `,
    sql`
      SELECT
        id,
        name,
        role,
        trade,
        jobs,
        quote,
        language,
        avatar_bg AS "avatarBg",
        sort_order AS "sortOrder",
        is_active AS "isActive"
      FROM landing_testimonials
      ORDER BY sort_order ASC, created_at ASC
    `,
  ]);

  const posts = (postsData || []).map((p: any) => ({
    id: p.id as string,
    title: p.title as string,
    content: p.content as string,
    category: p.category as string,
    authorName: p.authorName as string,
    likesCount: Number(p.likesCount),
    flagsCount: Number(p.flagsCount),
    isRemoved: p.isRemoved as boolean,
  }));

  const faqs = (faqsData || []).map((f: any) => ({
    id: f.id as string,
    topic: f.topic as string,
    question: f.question as string,
    answer: f.answer as string,
    takeaway: f.takeaway as string | null,
    language: f.language as string,
    sortOrder: Number(f.sortOrder),
    isActive: Boolean(f.isActive),
  }));

  const testimonials = (testimonialsData || []).map((t: any) => ({
    id: t.id as string,
    name: t.name as string,
    role: t.role as string,
    trade: t.trade as string,
    jobs: t.jobs as string,
    quote: t.quote as string,
    language: t.language as string,
    avatarBg: t.avatarBg as string | null,
    sortOrder: Number(t.sortOrder),
    isActive: Boolean(t.isActive),
  }));

  return (
    <ContentAdministrationHub
      initialPosts={posts}
      initialFaqs={faqs}
      initialTestimonials={testimonials}
      canModerate={hasAdminPermission(admin, "content.moderate")}
    />
  );
}
