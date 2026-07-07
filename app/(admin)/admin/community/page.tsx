import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import { CommunityModerationClient } from "@/components/admin/CommunityModerationClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community Moderation | DireSkill Admin",
  description: "Moderate community feed posts, handle flagged content, and manage reported posts.",
};

export default async function CommunityPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const postsData = await sql`
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
  `;

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

  return <CommunityModerationClient initialPosts={posts} />;
}
