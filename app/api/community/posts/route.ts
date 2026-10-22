import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // This is a public read endpoint. Resolve the current user when possible so
    // the feed can show their likes and apply the client-avatar privacy rule.
    let currentUserId: string | null = null;
    try {
      currentUserId = (await auth())?.user?.id ?? null;
    } catch (error) {
      console.warn("[COMMUNITY_POSTS_AUTH_UNAVAILABLE]", error);
    }

    const queryPosts = (includeVotes: boolean) => includeVotes
      ? sql`
          SELECT
            cp.*,
            u.role,
            CASE
              WHEN u.role = 'admin' THEN 'DireSkill Community'
              WHEN u.role = 'worker' THEN wp.full_name
              ELSE clp.full_name
            END AS author_name,
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
            (SELECT COUNT(*)::int FROM community_post_votes WHERE post_id = cp.id AND vote_type = 'useful') AS useful_count,
            (SELECT COUNT(*)::int FROM community_post_votes WHERE post_id = cp.id AND vote_type = 'not_useful') AS not_useful_count,
            (SELECT vote_type FROM community_post_votes WHERE post_id = cp.id AND user_id = ${currentUserId} LIMIT 1) AS current_user_vote
          FROM community_posts cp
          JOIN users u ON cp.user_id = u.id
          LEFT JOIN worker_profiles wp ON cp.user_id = wp.user_id AND u.role = 'worker'
          LEFT JOIN client_profiles clp ON cp.user_id = clp.user_id AND u.role = 'client'
          WHERE cp.is_removed = false
          ORDER BY cp.created_at DESC
        `
      : sql`
          SELECT
            cp.*,
            u.role,
            CASE
              WHEN u.role = 'admin' THEN 'DireSkill Community'
              WHEN u.role = 'worker' THEN wp.full_name
              ELSE clp.full_name
            END AS author_name,
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
          ORDER BY cp.created_at DESC
        `;

    let posts;
    try {
      posts = await queryPosts(true);
    } catch (error) {
      console.warn("[COMMUNITY_POSTS_VOTES_UNAVAILABLE]", error);
      posts = await queryPosts(false);
    }
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[COMMUNITY_POSTS_API_ERROR]", error);
    return NextResponse.json(
      { error: "Could not load community posts. Check the database connection and required community tables." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
