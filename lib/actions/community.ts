"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { sanitizeText } from "@/lib/sanitize";

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
        CASE WHEN u.role = 'client' AND (
          cp.user_id = ${currentUserId}
          OR (
            COALESCE(clp.is_verified, FALSE) = TRUE
            AND clp.verification_status = 'approved'
            AND EXISTS (
              SELECT 1 FROM jobs accepted_job
              WHERE accepted_job.client_id = cp.user_id
                AND accepted_job.worker_id = ${currentUserId}
                AND accepted_job.status IN ('accepted', 'active', 'in_progress', 'completion_requested', 'completed', 'payment_pending', 'paid', 'closed')
            )
          )
        ) THEN clp.avatar_url ELSE NULL END as author_avatar,
        CASE WHEN u.role = 'worker' THEN COALESCE(wp.is_verified, false) ELSE COALESCE(clp.is_verified, false) END as is_verified,
        (SELECT COUNT(*) FROM community_likes WHERE post_id = cp.id AND user_id = ${currentUserId}) > 0 as is_liked,
        (SELECT COUNT(*)::int FROM community_comments WHERE post_id = cp.id) as comments_count,
        (SELECT COUNT(*)::int FROM community_post_votes WHERE post_id = cp.id AND vote_type = 'useful') as useful_count,
        (SELECT COUNT(*)::int FROM community_post_votes WHERE post_id = cp.id AND vote_type = 'not_useful') as not_useful_count,
        (SELECT vote_type FROM community_post_votes WHERE post_id = cp.id AND user_id = ${currentUserId} LIMIT 1) as current_user_vote
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
    // Keep the feed readable if the optional voting migration has not yet
    // reached production. Voting controls can still report their own errors.
    try {
      const session = await auth();
      const currentUserId = session?.user?.id;
      return await sql`
        SELECT
          cp.*,
          u.role,
          CASE WHEN u.role = 'worker' THEN wp.full_name ELSE clp.full_name END AS author_name,
          CASE WHEN u.role = 'client' AND (
            cp.user_id = ${currentUserId}
            OR (
              COALESCE(clp.is_verified, FALSE) = TRUE
              AND clp.verification_status = 'approved'
              AND EXISTS (
                SELECT 1 FROM jobs accepted_job
                WHERE accepted_job.client_id = cp.user_id
                  AND accepted_job.worker_id = ${currentUserId}
                  AND accepted_job.status IN ('accepted', 'active', 'in_progress', 'completion_requested', 'completed', 'payment_pending', 'paid', 'closed')
              )
            )
          ) THEN clp.avatar_url ELSE NULL END AS author_avatar,
          CASE WHEN u.role = 'worker' THEN COALESCE(wp.is_verified, false) ELSE COALESCE(clp.is_verified, false) END AS is_verified,
          (SELECT COUNT(*) FROM community_likes WHERE post_id = cp.id AND user_id = ${currentUserId}) > 0 AS is_liked,
          (SELECT COUNT(*)::int FROM community_comments WHERE post_id = cp.id) AS comments_count,
          0::int AS useful_count,
          0::int AS not_useful_count,
          NULL::text AS current_user_vote
        FROM community_posts cp
        JOIN users u ON cp.user_id = u.id
        LEFT JOIN worker_profiles wp ON cp.user_id = wp.user_id AND u.role = 'worker'
        LEFT JOIN client_profiles clp ON cp.user_id = clp.user_id AND u.role = 'client'
        WHERE cp.is_removed = false
        ${category && category !== 'All' ? sql`AND cp.category = ${category}` : sql``}
        ORDER BY cp.created_at DESC
      `;
    } catch (fallbackError) {
      console.error("[GET_COMMUNITY_POSTS_FALLBACK_ERROR]", fallbackError);
      return [];
    }
  }
}

export async function getCommunityComments(postId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];
  if (!/^[0-9a-f-]{36}$/i.test(postId)) return [];

  try {
    return await sql`
      SELECT
        cc.id,
        cc.content,
        cc.created_at,
        u.role,
        COALESCE(wp.full_name, cp.full_name, u.email, 'Community member') AS author_name,
        CASE WHEN u.role = 'client' AND (
          cc.user_id = ${session.user.id}
          OR (
            COALESCE(cp.is_verified, FALSE) = TRUE
            AND cp.verification_status = 'approved'
            AND EXISTS (
              SELECT 1 FROM jobs accepted_job
              WHERE accepted_job.client_id = cc.user_id
                AND accepted_job.worker_id = ${session.user.id}
                AND accepted_job.status IN ('accepted', 'active', 'in_progress', 'completion_requested', 'completed', 'payment_pending', 'paid', 'closed')
            )
          )
        ) THEN cp.avatar_url ELSE NULL END AS author_avatar
      FROM community_comments cc
      JOIN users u ON u.id = cc.user_id
      LEFT JOIN worker_profiles wp ON wp.user_id = u.id AND u.role = 'worker'
      LEFT JOIN client_profiles cp ON cp.user_id = u.id AND u.role = 'client'
      JOIN community_posts p ON p.id = cc.post_id
      WHERE cc.post_id = ${postId} AND p.is_removed = false
      ORDER BY cc.created_at ASC
      LIMIT 100
    `;
  } catch (error) {
    console.error("[GET_COMMUNITY_COMMENTS_ERROR]", error);
    return [];
  }
}

export async function createCommunityComment(postId: string, rawContent: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Sign in to comment." };
  if (!/^[0-9a-f-]{36}$/i.test(postId)) return { success: false, error: "Post not found." };

  const content = sanitizeText(rawContent);
  if (!content) return { success: false, error: "Write a comment first." };
  if (content.length > 1000) return { success: false, error: "Comments must be 1,000 characters or fewer." };

  try {
    const inserted = await sql`
      INSERT INTO community_comments (user_id, post_id, content)
      SELECT ${session.user.id}, id, ${content}
      FROM community_posts
      WHERE id = ${postId} AND is_removed = false
      RETURNING id
    `;
    if (!inserted[0]) return { success: false, error: "This post is no longer available." };
    revalidatePath("/community/feed");
    return { success: true };
  } catch (error) {
    console.error("[CREATE_COMMUNITY_COMMENT_ERROR]", error);
    return { success: false, error: "Could not add your comment. Please try again." };
  }
}

export async function createCommunityPost(data: { title: string; content: string; mediaUrl?: string; category: string }) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const userId = session.user.id;

  // Verification check removed so any registered user can post in the community feed.

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

export async function removeCommunityPost(postId: string, isRemoved: boolean, reason?: string) {
  const admin = await requireAdminPermission("content.moderate");
  const normalizedReason = typeof reason === "string" ? reason.trim().slice(0, 500) : "";
  if (!normalizedReason) {
    return { success: false, error: "A moderation reason is required." };
  }
  try {
    const rows = await sql`
      UPDATE community_posts
      SET is_removed = ${isRemoved}
      WHERE id = ${postId}
      RETURNING id
    `;
    if (rows.length === 0) return { success: false, error: "Post not found." };
    await sql`
      INSERT INTO content_moderation_events (content_type, content_id, action, reason, admin_employee_id, admin_role)
      VALUES (${ "community_post" }, ${postId}, ${isRemoved ? "hide" : "restore"}, ${normalizedReason}, ${admin.id}, ${admin.role})
    `;
    revalidatePath("/admin/community");
    revalidatePath("/community/feed");
    return { success: true };
  } catch (error) {
    console.error("[REMOVE_POST_ERROR]", error);
    return { success: false, error: "Database action failed" };
  }
}

export async function votePostUseful(postId: string, type: 'useful' | 'not_useful' | null) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!/^[0-9a-f-]{36}$/i.test(postId) || (type !== null && !["useful", "not_useful"].includes(type))) {
    return { success: false, error: "Invalid vote." };
  }

  try {
    const post = await sql`SELECT id FROM community_posts WHERE id = ${postId} AND is_removed = false LIMIT 1`;
    if (!post[0]) return { success: false, error: "This post is no longer available." };
    if (type === null) {
      await sql`DELETE FROM community_post_votes WHERE user_id = ${session.user.id} AND post_id = ${postId}`;
    } else {
      await sql`
        INSERT INTO community_post_votes (user_id, post_id, vote_type)
        VALUES (${session.user.id}, ${postId}, ${type})
        ON CONFLICT (user_id, post_id) DO UPDATE
        SET vote_type = EXCLUDED.vote_type
      `;
    }
    const [usefulRows, notUsefulRows] = await Promise.all([
      sql`SELECT COUNT(*)::int AS count FROM community_post_votes WHERE post_id = ${postId} AND vote_type = 'useful'`,
      sql`SELECT COUNT(*)::int AS count FROM community_post_votes WHERE post_id = ${postId} AND vote_type = 'not_useful'`,
    ]);
    revalidatePath("/community/feed");
    return {
      success: true,
      vote: type,
      usefulCount: Number(usefulRows[0]?.count || 0),
      notUsefulCount: Number(notUsefulRows[0]?.count || 0),
    };
  } catch (error) {
    console.error("[VOTE_POST_ERROR]", error);
    return { success: false };
  }
}


