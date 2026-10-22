import { requireAdminRole } from "@/lib/admin-authorization";
import { CourtEvidenceClient } from "@/components/admin/CourtEvidenceClient";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Court Evidence Disclosure | DireSkill Super Admin",
  description: "Official legal evidence export and certification for Ethiopian judicial authorities.",
};

export default async function CourtEvidencePage() {
  const admin = await requireAdminRole("super_admin");

  return (
    <CourtEvidenceClient
      adminEmployeeId={admin.employeeId || admin.id}
      adminFullName={admin.fullName || admin.email || "Super Administrator"}
    />
  );
}
