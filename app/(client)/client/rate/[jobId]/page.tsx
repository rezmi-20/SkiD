import { getRatingPageData } from "@/lib/actions/ratings";
import RatingPageContent from "@/components/RatingPageContent";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Rate & Review | DireSkill",
  description: "Leave a review and rating for your completed job.",
};

export default async function ClientRatingPage({ params }: { params: { jobId: string } }) {
  const data = await getRatingPageData(params.jobId);

  if (!data) redirect("/client/contracts");

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
