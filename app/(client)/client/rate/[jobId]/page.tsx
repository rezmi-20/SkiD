import { getRatingPageData } from "@/lib/actions/ratings";
import RatingPageContent from "@/components/RatingPageContent";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Rate & Review | DireSkill",
  description: "Leave a review and rating for your completed job.",
};

export default async function ClientRatingPage({ params }: { params: Promise<{ jobId: string }> }) {
  const session = await auth();
  if (!session || (session.user.role !== "client" && session.user.role !== "admin")) {
    redirect("/login");
  }

  const { jobId } = await params;
  const isDemo = jobId === "demo" || jobId === "test" || jobId.startsWith("demo-");

  let data = null;
  if (!isDemo) {
    try {
      data = await getRatingPageData(jobId);
    } catch {
      data = null;
    }
  }

  if (!data || isDemo) {
    return (
      <RatingPageContent
        jobId={isDemo ? jobId : "demo-solar-installation"}
        ratedId="demo-worker-1"
        ratedName="Kassahun Mengistu"
        ratedAvatar="/images/user_review_card.jpg"
        ratedVerified={true}
        jobTitle="Solar Water Heater & Piping Installation"
        currentUserRole="client"
        alreadyRated={false}
        canRate={true}
        dashboardHref="/client/dashboard"
        isDemoMode={true}
      />
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
      isDemoMode={false}
    />
  );
}
