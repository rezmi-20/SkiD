import { getUserDisputeDetails } from "@/lib/actions/disputes";
import UserDisputeDetails from "@/components/disputes/UserDisputeDetails";
import { MOCK_DISPUTE_SCENARIOS } from "@/lib/mock-dispute";

export const dynamic = "force-dynamic";

export default async function ClientDisputeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isDemo = id === "demo";

  let data = null;
  if (!isDemo) {
    try {
      data = await getUserDisputeDetails(id);
    } catch {
      data = null;
    }
  }

  // Graceful fallback to demo mode so the dispute resolution interface can always be inspected
  const finalData = data || MOCK_DISPUTE_SCENARIOS.under_review.data;
  const isDemoActive = isDemo || !data;

  return (
    <div className="mx-auto max-w-4xl">
      <UserDisputeDetails data={finalData} role="client" isDemoMode={isDemoActive} />
    </div>
  );
}
