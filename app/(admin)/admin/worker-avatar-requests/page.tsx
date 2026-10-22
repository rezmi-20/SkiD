import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { getWorkerAvatarChangeRequests } from "@/lib/actions/worker-avatar";
import { WorkerAvatarRequestsClient } from "@/components/admin/WorkerAvatarRequestsClient";

export const dynamic = "force-dynamic";

export default async function WorkerAvatarRequestsPage() {
  const admin = await requireAdminPermission("verification.read");
  const requests = await getWorkerAvatarChangeRequests();
  return (
    <WorkerAvatarRequestsClient
      requests={requests as any[]}
      canReview={hasAdminPermission(admin, "verification.review")}
    />
  );
}
