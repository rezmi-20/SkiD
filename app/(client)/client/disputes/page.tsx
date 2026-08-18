import Link from "next/link";
import { getUserDisputes } from "@/lib/actions/disputes";
import UserDisputesList from "@/components/disputes/UserDisputesList";

export const dynamic = "force-dynamic";

export default async function ClientDisputesPage() {
  const disputes = await getUserDisputes();
  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary">Disputes</p>
          <h1 className="text-3xl font-black text-on-surface">Your Dispute Cases</h1>
        </div>
        <Link href="/client/disputes/new" className="rounded-lg bg-primary px-4 py-3 text-xs font-black uppercase tracking-widest text-on-primary">
          Open Dispute
        </Link>
      </header>
      <UserDisputesList disputes={disputes as any[]} role="client" />
    </div>
  );
}
