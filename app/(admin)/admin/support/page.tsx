import { getAdminSupportTickets } from "@/lib/actions/support";
import { AdminSupportQueueClient } from "@/components/admin/support/AdminSupportQueueClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Support Desk Queue | DireSkill Admin",
  description: "Handle user tickets, provide contract dispute guidance, and coordinate department resolutions.",
};

export default async function AdminSupportQueuePage() {
  // Fetch tickets for initial state
  const tickets = await getAdminSupportTickets("all", "");

  return <AdminSupportQueueClient initialTickets={tickets} />;
}
