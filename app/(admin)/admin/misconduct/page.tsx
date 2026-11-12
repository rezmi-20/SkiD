import { getMisconductReviews, getMisuseIndicators } from "@/lib/actions/governance";
import MisconductReviewManager from "@/components/governance/MisconductReviewManager";

export const dynamic = "force-dynamic";

export default async function MisconductReviewsPage() {
  const [reviews, indicators] = await Promise.all([
    getMisconductReviews(),
    getMisuseIndicators(),
  ]);

  return (
    <MisconductReviewManager
      indicators={indicators as any[]}
      reviews={reviews as any[]}
    />
  );
}
