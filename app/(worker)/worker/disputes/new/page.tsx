import Link from "next/link";
import { getEligibleDisputeJobs } from "@/lib/actions/disputes";
import DisputeCreateForm from "@/components/disputes/DisputeCreateForm";

export const dynamic = "force-dynamic";

export default async function NewWorkerDisputePage() {
  const jobs = await getEligibleDisputeJobs();
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      <Link href="/worker/disputes" className="text-xs font-black uppercase tracking-widest text-primary">Back to disputes</Link>
      <header>
        <p className="text-xs font-black uppercase tracking-widest text-primary">Open Dispute</p>
        <h1 className="text-3xl font-black text-on-surface">Create a controlled dispute case</h1>
      </header>
      <DisputeCreateForm jobs={jobs as any[]} role="worker" />
    </div>
  );
}
