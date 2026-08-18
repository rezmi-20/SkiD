import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserDisputeDetails } from "@/lib/actions/disputes";
import UserDisputeDetails from "@/components/disputes/UserDisputeDetails";

export const dynamic = "force-dynamic";

export default async function ClientDisputeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getUserDisputeDetails(id);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/client/disputes" className="mb-4 inline-block text-xs font-black uppercase tracking-widest text-primary">Back to disputes</Link>
      <UserDisputeDetails data={data} role="client" />
    </div>
  );
}
