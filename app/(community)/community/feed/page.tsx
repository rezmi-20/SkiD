import { getCommunityPosts } from "@/lib/actions/community";
import CommunityFeedContent from "@/components/CommunityFeedContent";

export const metadata = {
  title: "Community Feed | DireSkill",
  description: "Share tips, solutions, and knowledge with the DireSkill community in Dire Dawa.",
};

export default async function CommunityFeedPage() {
  const initialPosts = await getCommunityPosts();
  
  return <CommunityFeedContent initialPosts={initialPosts} />;
}
