import { getUserAppealDetails } from "@/lib/actions/governance";
import UserAppealDetails from "@/components/governance/UserAppealDetails";
import { DEMO_APPEAL_DATA } from "@/lib/mock-appeal";

export const dynamic = "force-dynamic";

export default async function ClientAppealDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isDemo = id === "demo";

  let details = null;
  if (!isDemo) {
    try {
      details = await getUserAppealDetails(id);
    } catch {
      details = null;
    }
  }

  const finalData = details || DEMO_APPEAL_DATA;
  const isDemoActive = isDemo || !details;

  return <UserAppealDetails data={finalData} role="client" isDemoMode={isDemoActive} />;
}
