import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserSupportTicketDetails } from "@/lib/actions/support";
import UserSupportDetails from "@/components/support/UserSupportDetails";

export const dynamic = "force-dynamic";

export default async function ClientSupportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getUserSupportTicketDetails(id);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/client/support" className="mb-4 inline-block text-xs font-black uppercase tracking-widest text-primary">Back to support</Link>
      <UserSupportDetails data={data} role="client" />
    </div>
  );
}
