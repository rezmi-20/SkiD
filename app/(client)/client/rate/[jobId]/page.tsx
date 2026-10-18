import { getRatingPageData } from "@/lib/actions/ratings";
import RatingPageContent from "@/components/RatingPageContent";
import Link from "next/link";
import { Lock } from "lucide-react";

export const metadata = {
  title: "Rate & Review | DireSkill",
  description: "Leave a review and rating for your completed job.",
};

export default async function ClientRatingPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const data = await getRatingPageData(jobId);

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-surface-variant bg-surface-container-lowest p-6 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-on-surface">Rating Unavailable</h2>
          <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
            Ratings unlock once the contract is completed and payment is confirmed. If this job is still in progress or under review, you can rate your counterpart once payment is finalized.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/client/contracts"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-on-primary shadow-sm hover:opacity-90 transition"
            >
              View Contracts
            </Link>
            <Link
              href="/client/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-surface-variant px-5 text-sm font-semibold text-on-surface hover:bg-surface-container-high transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RatingPageContent
      jobId={data.job.job_id}
      ratedId={data.ratedId}
      ratedName={data.ratedName ?? "Unknown"}
      ratedAvatar={data.ratedAvatar}
      ratedVerified={data.ratedVerified ?? false}
      jobTitle={data.job.job_title}
      currentUserRole={data.currentUserRole ?? "client"}
      alreadyRated={data.alreadyRated}
      canRate={data.canRate}
      dashboardHref="/client/dashboard"
    />
  );
}
