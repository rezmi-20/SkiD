import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import LandingPageContent from "@/components/LandingPageContent";

export default async function HomePage({ searchParams }) {
  const session = await auth();

  let initialFaqs = [];
  let initialTestimonials = [];

  try {
    const [faqsResult, testimonialsResult] = await Promise.all([
      sql`
        SELECT id, topic, question, answer, takeaway, language, sort_order
        FROM landing_faqs
        WHERE is_active = true
        ORDER BY sort_order ASC, created_at ASC
      `,
      sql`
        SELECT id, name, role, trade, jobs, quote, language, avatar_bg, sort_order
        FROM landing_testimonials
        WHERE is_active = true
        ORDER BY sort_order ASC, created_at ASC
      `,
    ]);

    initialFaqs = (faqsResult || []).map((f) => ({
      id: f.id,
      topic: f.topic,
      question: f.question,
      answer: f.answer,
      takeaway: f.takeaway,
      language: f.language,
      sortOrder: Number(f.sort_order || 0),
    }));

    initialTestimonials = (testimonialsResult || []).map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      trade: t.trade,
      jobs: t.jobs,
      quote: t.quote,
      language: t.language,
      avatarBg: t.avatar_bg,
      sortOrder: Number(t.sort_order || 0),
    }));
  } catch {
    // Graceful fallback to default curated content
  }

  return (
    <LandingPageContent
      userRole={session?.user?.role}
      initialFaqs={initialFaqs}
      initialTestimonials={initialTestimonials}
    />
  );
}
