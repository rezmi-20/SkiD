import CommunityFeedContent from "@/components/CommunityFeedContent";
import { getCommunityPosts } from "@/lib/actions/community";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Artisan Community Feed | DireSkill",
  description: "Share trade skills, explore artisan showcases, and ask technical questions in Dire Dawa.",
};

export default async function WorkerCommunityPage() {
  let initialPosts: any[] = [];
  try {
    initialPosts = await getCommunityPosts();
  } catch (error) {
    console.warn("[COMMUNITY_INITIAL_POSTS_ERROR]", error);
  }
  return <CommunityFeedContent initialPosts={initialPosts} />;
}
