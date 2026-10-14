import Link from "next/link";
import { getUserAppeals } from "@/lib/actions/governance";
import UserAppealsList from "@/components/governance/UserAppealsList";
import { Scale, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WorkerAppealsPage() {
  const appeals = await getUserAppeals();
  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary tracking-wide uppercase mb-1">
            <Scale className="h-3 w-3" />
            Governance Oversight
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Your Governance Appeals
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track and manage formal escalation requests reviewed by the independent Super Admin panel.
          </p>
        </div>
        <div>
          <Link
            href="/worker/appeals/new"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 transition-opacity shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Request Appeal
          </Link>
        </div>
      </header>
      <UserAppealsList appeals={appeals as any[]} role="worker" />
    </div>
  );
}
