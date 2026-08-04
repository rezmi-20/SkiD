import { sql } from "@/lib/db";
import { WorkersManagementClient } from "@/components/admin/WorkersManagementClient";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export default async function WorkersPage() {
  const admin = await requireAdminPermission("verification.read");
  const verificationCapabilities = {
    canReview: hasAdminPermission(admin, "verification.review"),
    canApprove: hasAdminPermission(admin, "verification.approve"),
    canReject: hasAdminPermission(admin, "verification.reject"),
  };

  // Fetch all workers with users info
  const workersData = await sql`
    SELECT
      wp.user_id AS "userId",
      wp.full_name AS "fullName",
      wp.skills,
      wp.fayda_doc_url AS "faydaDocUrl",
      wp.experience_years AS "experienceYears",
      wp.district,
      wp.bio,
      wp.verification_status AS "verificationStatus",
      wp.is_verified AS "isVerified",
      wp.created_at AS "createdAt",
      u.email,
      u.phone,
      u.is_suspended AS "isSuspended"
    FROM worker_profiles wp
    JOIN users u ON wp.user_id = u.id
    ORDER BY wp.created_at DESC
  `;

  // Map to matching schema types
  const formattedWorkers = (workersData || []).map((w: any) => ({
    userId: w.userId,
    fullName: w.fullName,
    email: w.email,
    phone: w.phone,
    bio: w.bio,
    skills: w.skills,
    district: w.district,
    experienceYears: w.experienceYears,
    verificationStatus: w.verificationStatus,
    isVerified: w.isVerified,
    isSuspended: w.isSuspended,
    faydaDocUrl: w.faydaDocUrl,
    createdAt: String(w.createdAt),
  }));

  return <WorkersManagementClient initialWorkers={formattedWorkers} verificationCapabilities={verificationCapabilities} />;
}
