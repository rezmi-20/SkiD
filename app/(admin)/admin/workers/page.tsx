import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import { WorkersManagementClient } from "@/components/admin/WorkersManagementClient";

export const dynamic = "force-dynamic";

export default async function WorkersPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

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
      wp.is_verified AS "isVerified",
      wp.created_at AS "createdAt",
      u.email,
      u.phone
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
    isVerified: w.isVerified,
    faydaDocUrl: w.faydaDocUrl,
    createdAt: String(w.createdAt),
  }));

  return <WorkersManagementClient initialWorkers={formattedWorkers} />;
}
