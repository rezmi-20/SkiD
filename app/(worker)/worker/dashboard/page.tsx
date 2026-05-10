export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import WorkerDashboardContent from "@/components/WorkerDashboardContent";

export default async function WorkerDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "worker") {
    redirect("/login");
  }

  // Fetch worker profile and jobs
  const profileRows = await sql`SELECT full_name, is_verified, district, skills FROM worker_profiles WHERE user_id = ${session.user.id} LIMIT 1`;
  const jobRows = await sql`SELECT * FROM jobs WHERE worker_id = ${session.user.id} OR client_id = ${session.user.id} ORDER BY created_at DESC LIMIT 20`;

  const worker = profileRows[0];
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const workerData = {
    fullName: worker?.full_name || "Professional",
    firstName: (worker?.full_name || "Professional").split(' ')[0],
    isVerified: worker?.is_verified || false,
    district: worker?.district || "Dire Dawa",
    skills: worker?.skills || []
  };

  // Calculate stats from job data
  const completedJobs = jobRows.filter((j: any) => j.status === 'completed');
  const activeJobs = jobRows.filter((j: any) => j.status === 'active');
  const totalRevenue = completedJobs.reduce((acc: number, job: any) => acc + (Number(job.amount) || 0), 0);

  const stats = {
    activeJobs: activeJobs.length,
    completedJobs: completedJobs.length,
    revenue: totalRevenue || 12450 // Fallback for demo if no real revenue
  };

  return (
    <WorkerDashboardContent 
      worker={workerData}
      stats={stats}
      recentJobs={jobRows}
      greeting={greeting}
    />
  );
}
