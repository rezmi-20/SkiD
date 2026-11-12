import { getAuditLogEntries } from "@/lib/actions/governance";
import { AdminAuditClient } from "@/components/admin/AdminAuditClient";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const result = await getAuditLogEntries({
    q: params.q,
    action: params.action,
    module: params.module,
    targetType: params.targetType,
    adminRole: params.adminRole,
    highRiskOnly: params.highRisk === "1",
    page: Number(params.page || 1),
    from: params.from,
    to: params.to,
  });

  const entries = result.entries || [];
  const totalCount = ("total" in result ? (result as any).total : 0) || entries.length;
  const totalPages = ("totalPages" in result ? (result as any).totalPages : 1) || 1;
  const currentPage = Number(params.page || 1);

  return (
    <AdminAuditClient
      entries={entries}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={currentPage}
      params={params}
    />
  );
}

