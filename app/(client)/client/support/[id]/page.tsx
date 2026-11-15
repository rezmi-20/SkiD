import { getUserSupportTicketDetails } from "@/lib/actions/support";
import UserSupportDetails from "@/components/support/UserSupportDetails";
import { DEMO_SUPPORT_TICKET } from "@/lib/mock-support";

export const dynamic = "force-dynamic";

export default async function ClientSupportDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isDemo = id === "demo";

  let data = null;
  if (!isDemo) {
    try {
      data = await getUserSupportTicketDetails(id);
    } catch {
      data = null;
    }
  }

  const finalData = data || DEMO_SUPPORT_TICKET;
  const isDemoActive = isDemo || !data;

  return (
    <div className="mx-auto max-w-4xl">
      <UserSupportDetails data={finalData} role="client" isDemoMode={isDemoActive} />
    </div>
  );
}
