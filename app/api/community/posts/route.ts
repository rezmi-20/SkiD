import { NextResponse } from "next/server";
import { getCommunityPosts } from "@/lib/actions/community";

export async function GET() {
  try {
    const posts = await getCommunityPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[COMMUNITY_POSTS_API_ERROR]", error);
    return NextResponse.json({ error: "Could not load community posts." }, { status: 500 });
  }
}
