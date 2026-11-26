import { getAppealsForReview, getEscalatedCasesForGovernance } from "@/lib/actions/governance";
import { AdminAppealsClient } from "@/components/admin/appeals/AdminAppealsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Governance Appeals Queue | DireSkill Admin",
  description: "Super Admin escalation pipeline for contested dispute determinations and formal procedural appeals.",
};

export default async function AdminAppealsPage() {
  const [appeals, escalations] = await Promise.all([
    getAppealsForReview(),
    getEscalatedCasesForGovernance(),
  ]);

  return (
    <AdminAppealsClient
      initialAppeals={appeals}
      escalatedDisputes={escalations.escalatedDisputes}
      escalatedSupportTickets={escalations.escalatedSupportTickets}
    />
  );
}
