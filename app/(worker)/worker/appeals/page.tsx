import Link from "next/link";
import { getUserAppeals } from "@/lib/actions/governance";
import UserAppealsList from "@/components/governance/UserAppealsList";

export const dynamic = "force-dynamic";

export default async function WorkerAppealsPage() {
  const appeals = await getUserAppeals();
  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary">Appeals</p>
          <h1 className="text-3xl font-black">Your Appeals</h1>
        </div>
        <Link href="/worker/appeals/new" className="rounded-lg bg-primary px-4 py-3 text-xs font-black uppercase tracking-widest text-on-primary">New Appeal</Link>
      </header>
      <UserAppealsList appeals={appeals as any[]} role="worker" />
    </div>
  );
}
