export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getPendingJobs, getWorkerJobs } from "@/lib/actions/jobs";
import { redirect } from "next/navigation";
import WorkerDashboardContent from "@/components/WorkerDashboardContent";
import { getWorkerAccessRoute, WORKER_DASHBOARD_ROUTE } from "@/lib/worker-routing";

export default async function WorkerDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "worker") {
    redirect("/login");
  }

  const profileRows = await sql`
    SELECT
      u.is_suspended,
      wp.full_name,
      wp.is_verified,
      wp.verification_status,
      wp.district,
      wp.skills
    FROM users u
    LEFT JOIN worker_profiles wp ON wp.user_id = u.id
    WHERE u.id = ${session.user.id}
    LIMIT 1
  `;

  const worker = profileRows[0];
  const workerRoute = getWorkerAccessRoute({
    role: session.user.role,
    isSuspended: worker?.is_suspended ?? false,
    isVerified: worker?.is_verified ?? null,
    verificationStatus: worker?.verification_status ?? null,
  });

  if (workerRoute !== WORKER_DASHBOARD_ROUTE) {
    redirect(workerRoute);
  }

  const [pendingJobs, recentJobs] = await Promise.all([
    getPendingJobs(),
    getWorkerJobs(),
  ]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const workerData = {
    fullName: worker?.full_name || "Professional",
    firstName: (worker?.full_name || "Professional").split(" ")[0],
    isVerified: worker?.is_verified || false,
    district: worker?.district || "Dire Dawa",
    skills: worker?.skills || [],
  };

  const completedJobs = recentJobs.filter((job: any) => job.status === "completed");
  const activeJobs = recentJobs.filter((job: any) => ["accepted", "active", "in_progress"].includes(job.status));
  const totalRevenue = completedJobs.reduce((sum: number, job: any) => sum + (Number(job.budget) || 0), 0);

  const stats = {
    activeJobs: activeJobs.length,
    pendingJobs: pendingJobs.length,
    completedJobs: completedJobs.length,
    revenue: totalRevenue,
  };

  return (
    <WorkerDashboardContent
      worker={workerData}
      stats={stats}
      pendingJobs={pendingJobs}
      recentJobs={recentJobs.slice(0, 6)}
      greeting={greeting}
    />
  );
}
