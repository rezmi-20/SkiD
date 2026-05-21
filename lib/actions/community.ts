"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCommunityPosts(category?: string) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    // Join with both worker_profiles and client_profiles to get the official name and avatar
    // We use a subquery or a series of left joins
    const rows = await sql`
      SELECT 
        cp.*,
        u.role,
        CASE WHEN u.role = 'worker' THEN wp.full_name ELSE clp.full_name END as author_name,
        CASE WHEN u.role = 'worker' THEN wp.avatar_url ELSE clp.avatar_url END as author_avatar,
        CASE WHEN u.role = 'worker' THEN COALESCE(wp.is_verified, false) ELSE COALESCE(clp.is_verified, false) END as is_verified,
        (SELECT COUNT(*) FROM community_likes WHERE post_id = cp.id AND user_id = ${currentUserId}) > 0 as is_liked,
        (SELECT COUNT(*) FROM community_comments WHERE post_id = cp.id) as comments_count
      FROM community_posts cp
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN worker_profiles wp ON cp.user_id = wp.user_id AND u.role = 'worker'
      LEFT JOIN client_profiles clp ON cp.user_id = clp.user_id AND u.role = 'client'
      WHERE cp.is_removed = false
      ${category && category !== 'All' ? sql`AND cp.category = ${category}` : sql``}
      ORDER BY cp.created_at DESC
    `;
    return rows;
  } catch (error) {
    console.error("[GET_COMMUNITY_POSTS_ERROR]", error);
    return [];
  }
}

export async function createCommunityPost(data: { title: string; content: string; mediaUrl?: string; category: string }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const userId = session.user.id;

  // Check if user is verified (Requirement: Only verified users can post)
  const workerVerified = await sql`SELECT is_verified FROM worker_profiles WHERE user_id = ${userId}`;
  const clientVerified = await sql`SELECT is_verified FROM client_profiles WHERE user_id = ${userId}`;
  
  const isVerified = (workerVerified[0]?.is_verified) || (clientVerified[0]?.is_verified);

  if (!isVerified) {
    return { success: false, error: "Only Fayda verified users can share tips in the community feed." };
  }

  try {
    await sql`
      INSERT INTO community_posts (user_id, title, content, media_url, category)
      VALUES (${userId}, ${data.title}, ${data.content}, ${data.mediaUrl}, ${data.category})
    `;
    revalidatePath("/community/feed");
    return { success: true };
  } catch (error) {
    console.error("[CREATE_POST_ERROR]", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function toggleLikePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const userId = session.user.id;

  try {
    const existing = await sql`SELECT id FROM community_likes WHERE user_id = ${userId} AND post_id = ${postId}`;

    if (existing.length > 0) {
      await sql`DELETE FROM community_likes WHERE id = ${existing[0].id}`;
      await sql`UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = ${postId}`;
    } else {
      await sql`INSERT INTO community_likes (user_id, post_id) VALUES (${userId}, ${postId})`;
      await sql`UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ${postId}`;
    }

    revalidatePath("/community/feed");
    return { success: true };
  } catch (error) {
    console.error("[TOGGLE_LIKE_ERROR]", error);
    return { success: false };
  }
}

export async function flagPost(postId: string, reason: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const userId = session.user.id;

  try {
    await sql`INSERT INTO community_flags (user_id, post_id, reason) VALUES (${userId}, ${postId}, ${reason})`;
    await sql`UPDATE community_posts SET flags_count = flags_count + 1 WHERE id = ${postId}`;
    
    return { success: true };
  } catch (error) {
    console.error("[FLAG_POST_ERROR]", error);
    return { success: false };
  }
}
