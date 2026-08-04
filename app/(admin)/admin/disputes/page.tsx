export const dynamic = 'force-dynamic';
import { getDisputes } from "@/lib/actions/disputes";
import AdminDisputesContent from "@/components/AdminDisputesContent";
import { requireAdminPermission } from "@/lib/admin-authorization";

export default async function DisputesPage() {
  await requireAdminPermission("disputes.read");

  const disputes = await getDisputes();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AdminDisputesContent initialDisputes={disputes} />
    </div>
  );
}
