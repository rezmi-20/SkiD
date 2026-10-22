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

  const [employee] = await sql`
    SELECT id, employee_id, full_name, work_email
    FROM admin_employees
    WHERE id = ${admin.id}
  `;

  return (
    <CourtEvidenceClient
      adminEmployeeId={employee?.employee_id || admin.id}
      adminFullName={employee?.full_name || admin.email || "Super Administrator"}
    />
  );
}
