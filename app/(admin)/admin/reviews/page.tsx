import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { getAdminReviewsForModeration } from "@/lib/actions/reviews";
import { AdminReviewsModerationClient } from "@/components/admin/AdminReviewsModerationClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reviews & Reputation Moderation | DireSkill Admin",
  description: "Inspect and moderate bidirectional client and worker job reviews.",
};

export default async function AdminReviewsPage() {
  const admin = await requireAdminPermission("reviews.read");
  const canModerate = hasAdminPermission(admin, "reviews.moderate");
  const reviews = await getAdminReviewsForModeration();

  return <AdminReviewsModerationClient initialReviews={reviews} canModerate={canModerate} />;
}
