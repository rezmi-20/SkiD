import CommunityFeedContent from "@/components/CommunityFeedContent";
import { getCommunityPosts } from "@/lib/actions/community";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "DireCraft Artisan Community | DireSkill",
  description: "Discover verified artisan showcases, trade techniques, and mastercraft discussions in Dire Dawa.",
};

export default async function CommunityFeedPage() {
  let initialPosts: any[] = [];
  try {
    initialPosts = await getCommunityPosts();
  } catch (error) {
    console.warn("[COMMUNITY_INITIAL_POSTS_ERROR]", error);
  }
  return <CommunityFeedContent initialPosts={initialPosts} />;
}
