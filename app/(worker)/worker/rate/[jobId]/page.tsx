import { getRatingPageData } from "@/lib/actions/ratings";
import RatingPageContent from "@/components/RatingPageContent";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Rate & Review | DireSkill",
  description: "Leave a review and rating for your completed job.",
};

export default async function WorkerRatingPage({ params }: { params: Promise<{ jobId: string }> }) {
  const session = await auth();
  if (!session || (session.user.role !== "worker" && session.user.role !== "admin")) {
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
        ratedId="demo-client-1"
        ratedName="Abebe Kebede"
        ratedAvatar="/images/client_project_hero.jpg"
        ratedVerified={true}
        jobTitle="Solar Water Heater & Piping Installation"
        currentUserRole="worker"
        alreadyRated={false}
        canRate={true}
        dashboardHref="/worker/dashboard"
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
      currentUserRole={data.currentUserRole ?? "worker"}
      alreadyRated={data.alreadyRated}
      canRate={data.canRate}
      dashboardHref="/worker/dashboard"
      isDemoMode={false}
    />
  );
}
