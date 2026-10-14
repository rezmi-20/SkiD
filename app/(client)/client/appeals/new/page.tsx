import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import AppealForm, { EligibleDispute } from "@/components/governance/AppealForm";

export const dynamic = "force-dynamic";

export default async function NewClientAppealPage({
  searchParams,
}: {
  searchParams?: Promise<{ targetId?: string; appealType?: string }>;
}) {
  const session = await auth();
  const params = searchParams ? await searchParams : {};
  const defaultTargetId = params.targetId || "";
  const defaultAppealType = params.appealType || "dispute_resolution";

  // Query eligible resolved disputes for client with any active appeal status
  const eligibleDisputes: EligibleDispute[] = session?.user?.id
    ? (
        await sql`
          SELECT 
            d.id, 
            d.title, 
            d.final_decision, 
            d.resolved_at,
            a.id AS existing_appeal_id,
            a.reference AS existing_appeal_reference,
            a.status AS existing_appeal_status
          FROM disputes d
          LEFT JOIN appeals a 
            ON a.target_id = d.id 
            AND a.appellant_user_id = ${session.user.id}
            AND a.status IN ('appeal_requested', 'appeal_under_review')
          WHERE d.client_id = ${session.user.id}
            AND d.status = 'resolved'
          ORDER BY d.resolved_at DESC
          LIMIT 10
        `
      ).map((row: any) => ({
        id: String(row.id),
        title: String(row.title || "Dispute Case"),
        final_decision: String(row.final_decision || "Resolved"),
        resolved_at: row.resolved_at,
        existingAppealId: row.existing_appeal_id ? String(row.existing_appeal_id) : null,
        existingAppealReference: row.existing_appeal_reference ? String(row.existing_appeal_reference) : null,
        existingAppealStatus: row.existing_appeal_status ? String(row.existing_appeal_status) : null,
      }))
    : [];

  return (
    <AppealForm
      role="client"
      defaultTargetId={defaultTargetId}
      defaultAppealType={defaultAppealType}
      eligibleDisputes={eligibleDisputes}
    />
  );
}
