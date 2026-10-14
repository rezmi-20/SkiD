import Link from "next/link";
import { getUserSupportRecords } from "@/lib/actions/support";
import SupportCreateForm from "@/components/support/SupportCreateForm";

export const dynamic = "force-dynamic";

export default async function NewClientSupportTicketPage() {
  const { jobs, contracts } = await getUserSupportRecords();

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      <Link href="/client/support" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">
        ← Back to support
      </Link>
      <header>
        <p className="text-xs font-black uppercase tracking-widest text-primary">Customer Care</p>
        <h1 className="text-3xl font-black text-on-surface">Submit a Support Request</h1>
        <p className="mt-1 text-sm text-on-surface-variant font-medium">
          Have questions about your account, contracts, or need assistance? Our support team is here to help.
        </p>
      </header>
      <SupportCreateForm role="client" jobs={jobs as any[]} contracts={contracts as any[]} />
    </div>
  );
}
