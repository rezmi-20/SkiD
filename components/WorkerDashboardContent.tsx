"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { acceptJob, rejectJob } from "@/lib/actions/jobs";
import JobCard, { WorkerJobCardData } from "@/components/worker/JobCard";
import StatusBadge from "@/components/ui/StatusBadge";

interface WorkerDashboardContentProps {
  worker: {
    fullName: string;
    firstName: string;
    isVerified: boolean;
    district: string;
    skills: string[];
  };
  stats: {
    activeJobs: number;
    pendingJobs: number;
    completedJobs: number;
    revenue: number;
  };
  pendingJobs: WorkerJobCardData[];
  recentJobs: any[];
  greeting: string;
}

function EmptyPendingJobs() {
  return (
    <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant">
        <span className="material-symbols-outlined">pending_actions</span>
      </div>
      <h3 className="text-base font-black text-on-surface">No pending job requests</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-on-surface-variant">
        New client requests assigned to you will appear here. Keep your profile updated so clients can find you faster.
      </p>
      <Link
        href="/worker/profile"
        className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-xs font-black uppercase tracking-widest text-on-primary"
      >
        Update Profile
      </Link>
    </div>
  );
}

function StatTile({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="material-symbols-outlined text-[20px] text-primary">{icon}</span>
        <p className="text-2xl font-black text-on-surface">{value}</p>
      </div>
      <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{label}</p>
    </div>
  );
}

export default function WorkerDashboardContent({
  worker,
  stats,
  pendingJobs,
  recentJobs,
  greeting,
}: WorkerDashboardContentProps) {
  const router = useRouter();

  const handleAccept = async (jobId: string) => {
    const result = await acceptJob(jobId);
    if (!result.success) {
      alert(result.error);
      return;
    }
    router.refresh();
  };

  const handleReject = async (jobId: string) => {
    const result = await rejectJob(jobId);
    if (!result.success) {
      alert(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className="flex w-full flex-col gap-8 pb-28">
      <header className="flex flex-col gap-4 border-b border-outline-variant pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Worker Dashboard</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-on-surface md:text-4xl">
              {greeting}, {worker.firstName}
            </h1>
            {worker.isVerified && <StatusBadge status="completed" />}
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">
            {worker.district} professional{worker.skills.length > 0 ? ` - ${worker.skills.slice(0, 2).join(", ")}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/worker/gigs"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-xs font-black uppercase tracking-widest text-on-surface hover:border-primary/40"
          >
            <span className="material-symbols-outlined text-[18px]">work</span>
            My Gigs
          </Link>
          <Link
            href="/worker/contracts"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary"
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            Contracts
          </Link>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Pending Requests" value={stats.pendingJobs} icon="notifications" />
        <StatTile label="Active Jobs" value={stats.activeJobs} icon="construction" />
        <StatTile label="Completed" value={stats.completedJobs} icon="task_alt" />
        <StatTile label="Earned" value={`${stats.revenue.toLocaleString()} ETB`} icon="payments" />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-on-surface">Pending Job Requests</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Review assigned client requests before accepting work.
            </p>
          </div>
          <span className="rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 text-xs font-black text-on-surface">
            {pendingJobs.length}
          </span>
        </div>

        {pendingJobs.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {pendingJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        ) : (
          <EmptyPendingJobs />
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-on-surface">Recent Activity</h2>
            <p className="mt-1 text-sm text-on-surface-variant">A compact view of your latest assigned jobs.</p>
          </div>
          <Link href="/worker/jobs" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">
            View All
          </Link>
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest">
          {recentJobs.length > 0 ? (
            <div className="divide-y divide-outline-variant">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-on-surface">{job.title}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {job.client_name || "Client"} - {Number(job.budget || 0).toLocaleString()} ETB
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="p-6 text-center text-sm text-on-surface-variant">No recent activity yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
