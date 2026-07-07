import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import { PendingVerification } from "@/components/admin/PendingVerification";

export const dynamic = "force-dynamic";

export default async function VerifyQueuePage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  // Fetch all pending workers (unverified)
  const pendingWorkers = await sql`
    SELECT
      wp.user_id,
      wp.full_name,
      wp.skills,
      wp.fayda_doc_url,
      wp.avatar_url,
      wp.created_at,
      u.phone,
      u.email
    FROM worker_profiles wp
    JOIN users u ON wp.user_id = u.id
    WHERE wp.is_verified = false
    ORDER BY wp.created_at DESC
  `;

  // Map to matching schema types
  const formattedWorkers = (pendingWorkers || []).map((w: any) => ({
    user_id: w.user_id,
    full_name: w.full_name,
    skills: w.skills,
    fayda_doc_url: w.fayda_doc_url,
    avatar_url: w.avatar_url,
    created_at: String(w.created_at),
    phone: w.phone,
    email: w.email,
  }));

  return (
    <div className="space-y-5 pb-10">
      <PendingVerification workers={formattedWorkers} />
    </div>
  );
}
