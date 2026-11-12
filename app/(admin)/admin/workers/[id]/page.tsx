import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { hasAdminPermission, requireAdminPermission } from "@/lib/admin-authorization";
import { WorkerProfileDossier } from "@/components/admin/workers/WorkerProfileDossier";

export const dynamic = "force-dynamic";

export default async function WorkerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdminPermission("verification.read");
  const canSuspendAccount = hasAdminPermission(admin, "admin_accounts.suspend");

  const { id } = await params;

  const [workerRows, metricsRows, contractsRows, ratingsRows] = await Promise.all([
    sql`
      SELECT
        wp.user_id,
        wp.full_name,
        wp.district,
        wp.skills,
        wp.avatar_url,
        wp.experience_years,
        wp.bio,
        wp.fin_last4,
        wp.verification_status,
        wp.is_verified,
        wp.created_at,
        u.email,
        u.phone,
        u.is_suspended
      FROM worker_profiles wp
      JOIN users u ON wp.user_id = u.id
      WHERE wp.user_id = ${id}
      LIMIT 1
    `,
    sql`
      SELECT
        COUNT(DISTINCT j.id)::int AS total_jobs,
        COALESCE(SUM(p.amount), 0)::int AS total_earnings,
        COALESCE(AVG(r.score), 5.0)::numeric(2,1) AS avg_rating,
        COUNT(DISTINCT r.id)::int AS rating_count
      FROM worker_profiles wp
      LEFT JOIN jobs j ON j.worker_id = wp.user_id
      LEFT JOIN payments p ON p.job_id = j.id AND p.status = 'released'
      LEFT JOIN ratings r ON r.rated_id = wp.user_id
      WHERE wp.user_id = ${id}
      GROUP BY wp.user_id
    `,
    sql`
      SELECT
        c.id,
        c.status,
        c.payment_amount AS amount,
        c.work_location,
        c.created_at,
        j.title AS job_title,
        COALESCE(cp.full_name, u.email, 'Client') AS client_name
      FROM contracts c
      JOIN jobs j ON c.job_id = j.id
      JOIN users u ON j.client_id = u.id
      LEFT JOIN client_profiles cp ON j.client_id = cp.user_id
      WHERE j.worker_id = ${id}
      ORDER BY c.created_at DESC
      LIMIT 10
    `,
    sql`
      SELECT
        r.id,
        r.score,
        r.created_at,
        COALESCE(r.comment, 'Completed job satisfaction review') AS review_text,
        COALESCE(cp.full_name, u.email, 'Client') AS rater_name
      FROM ratings r
      JOIN users u ON r.rater_id = u.id
      LEFT JOIN client_profiles cp ON cp.user_id = u.id
      WHERE r.rated_id = ${id}
      ORDER BY r.created_at DESC
      LIMIT 5
    `,
  ]);

  const rawWorker = workerRows[0];
  if (!rawWorker) notFound();

  const metrics = metricsRows[0] || {
    total_jobs: 0,
    total_earnings: 0,
    avg_rating: 5.0,
    rating_count: 0,
  };

  const worker = {
    userId: rawWorker.user_id,
    fullName: rawWorker.full_name || "Unknown Artisan",
    email: rawWorker.email,
    phone: rawWorker.phone,
    bio: rawWorker.bio,
    district: rawWorker.district,
    skills: rawWorker.skills || [],
    experienceYears: Number(rawWorker.experience_years || 1),
    finLast4: rawWorker.fin_last4,
    isVerified: Boolean(rawWorker.is_verified),
    isSuspended: Boolean(rawWorker.is_suspended),
    verificationStatus: String(rawWorker.verification_status || "pending"),
    createdAt: String(rawWorker.created_at),
    totalEarnings: Number(metrics.total_earnings || 0),
    totalJobs: Number(metrics.total_jobs || 0),
    avgRating: Number(metrics.avg_rating || 5.0),
    ratingCount: Number(metrics.rating_count || 0),
  };

  const contracts = (contractsRows || []).map((c: any) => ({
    id: c.id,
    jobTitle: c.job_title || "Skilled Trade Job",
    clientName: c.client_name,
    amount: Number(c.amount || 0),
    status: c.status || "completed",
    workLocation: c.work_location,
    createdAt: c.created_at ? String(c.created_at) : null,
  }));

  const ratings = (ratingsRows || []).map((r: any) => ({
    id: r.id,
    score: Number(r.score || 5),
    reviewText: r.review_text,
    raterName: r.rater_name,
    createdAt: String(r.created_at),
  }));

  return (
    <WorkerProfileDossier
      worker={worker}
      contracts={contracts}
      ratings={ratings}
      canSuspendAccount={canSuspendAccount}
    />
  );
}

