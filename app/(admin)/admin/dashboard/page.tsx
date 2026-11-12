import { sql } from "@/lib/db";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { hasAdminPermission, requireAdmin } from "@/lib/admin-authorization";
import { hasCompleteWorkerIdentity, toWorkerDisplayStatus } from "@/lib/worker-verification";
import type { MonthlyVolumePoint } from "@/components/admin/dashboard/EscrowVolumeChart";
import type { TradeStageItem } from "@/components/admin/dashboard/TradePipelineDistribution";
import type { RecentActivityItem } from "@/components/admin/dashboard/RecentEscrowActivity";
import type { PerformerItem } from "@/components/admin/dashboard/TopPerformers";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const verificationCapabilities = {
    canRead: hasAdminPermission(admin, "verification.read"),
    canReview: hasAdminPermission(admin, "verification.review"),
    canApprove: hasAdminPermission(admin, "verification.approve"),
    canReject: hasAdminPermission(admin, "verification.reject"),
  };

  // ── 1. Live Aggregate Metrics from DB ────────────────────────────────
  const [paymentsSum, workersCount, contractsCount, disputesCount] = await Promise.all([
    sql`
      SELECT 
        COALESCE(SUM(amount), 0)::numeric AS total_volume,
        COALESCE(SUM(commission_amount), 0)::numeric AS total_commission,
        COUNT(*)::int AS transaction_count
      FROM payments
    `,
    sql`
      SELECT 
        COUNT(*)::int AS total_workers,
        COUNT(*) FILTER (WHERE is_verified = true)::int AS verified_workers,
        COUNT(*) FILTER (WHERE is_verified = false OR verification_status IS DISTINCT FROM 'approved')::int AS pending_workers
      FROM worker_profiles
    `,
    sql`
      SELECT 
        COUNT(*)::int AS total_contracts,
        COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active_contracts,
        COALESCE(SUM(payment_amount), 0)::numeric AS active_volume
      FROM contracts
    `,
    sql`
      SELECT 
        COUNT(*)::int AS total_disputes,
        COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved_disputes
      FROM disputes
    `,
  ]);

  const totalVolume = Number(paymentsSum[0]?.total_volume ?? 0);
  const totalCommission = Number(paymentsSum[0]?.total_commission ?? 0);
  const totalWorkers = Number(workersCount[0]?.total_workers ?? 0);
  const verifiedWorkers = Number(workersCount[0]?.verified_workers ?? 0);
  const pendingWorkersCount = Number(workersCount[0]?.pending_workers ?? 0);
  const activeContractsCount = Number(contractsCount[0]?.active_contracts ?? 0);
  const activeContractsVolume = Number(contractsCount[0]?.active_volume ?? 0);
  const totalDisputes = Number(disputesCount[0]?.total_disputes ?? 0);
  const resolvedDisputes = Number(disputesCount[0]?.resolved_disputes ?? 0);

  const revenueDisplay = `ETB ${totalVolume.toLocaleString()}`;
  const commissionDisplay = `ETB ${totalCommission.toLocaleString()}`;
  const contractsVolumeDisplay = `ETB ${activeContractsVolume.toLocaleString()}`;

  // ── 2. Real Monthly Trend (Rolling 6 Months) ──────────────────────────
  const monthlyVolumeRaw = await sql`
    SELECT 
      TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
      DATE_TRUNC('month', created_at) AS month_date,
      COALESCE(SUM(amount), 0)::int AS escrow_volume,
      COALESCE(SUM(commission_amount), 0)::int AS commission_earned
    FROM payments
    GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(DATE_TRUNC('month', created_at), 'Mon')
    ORDER BY month_date ASC
  `;

  // Build continuous rolling 6-month window ending with current month
  const monthlyTrend: MonthlyVolumePoint[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = d.toLocaleDateString("en-US", { month: "short" });
    const match = monthlyVolumeRaw.find((r: any) => {
      if (!r.month_date) return false;
      const rd = new Date(r.month_date);
      return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
    });
    monthlyTrend.push({
      month: mStr,
      escrow: match ? Number(match.escrow_volume) : 0,
      commission: match ? Number(match.commission_earned) : 0,
    });
  }

  // ── 3. Real Skilled Trades Distribution ──────────────────────────────
  const skillsRaw = await sql`
    SELECT 
      skill,
      COUNT(*)::int AS count
    FROM (
      SELECT unnest(skills) AS skill FROM worker_profiles
    ) s
    GROUP BY skill
    ORDER BY count DESC
    LIMIT 6
  `;

  const totalSkillAssignments = skillsRaw.reduce((sum: number, r: any) => sum + Number(r.count), 0);
  const colorPalette = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-accent", "bg-chart-4", "bg-chart-5"];

  const tradeStages: TradeStageItem[] = skillsRaw.map((r: any, idx: number) => {
    const count = Number(r.count);
    const value = totalSkillAssignments > 0 ? Math.round((count / totalSkillAssignments) * 100) : 0;
    return {
      name: String(r.skill || "Trade Skill"),
      count,
      value,
      color: colorPalette[idx % colorPalette.length],
    };
  });

  // ── 4. Real Recent Activity (Payments & Contracts) ───────────────────
  const recentPaymentsRaw = await sql`
    SELECT 
      p.id,
      COALESCE(j.title, 'Milestone Payment') AS title,
      p.amount,
      p.status,
      p.created_at,
      COALESCE(wp.full_name, 'Artisan') AS worker_name
    FROM payments p
    LEFT JOIN jobs j ON j.id = p.job_id
    LEFT JOIN worker_profiles wp ON wp.user_id = j.worker_id
    ORDER BY p.created_at DESC
    LIMIT 5
  `;

  const recentActivities: RecentActivityItem[] = recentPaymentsRaw.map((p: any) => ({
    id: String(p.id),
    trade: String(p.title || "Milestone Payment"),
    value: `ETB ${Number(p.amount || 0).toLocaleString()}`,
    status: (p.status as any) || "released",
    date: p.created_at
      ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "Recent",
    artisan: String(p.worker_name || "Artisan"),
  }));

  // ── 5. Real Top Performing Artisans ──────────────────────────────────
  const topArtisansRaw = await sql`
    SELECT 
      wp.id,
      wp.user_id,
      wp.full_name,
      wp.skills,
      wp.avatar_url,
      COALESCE(AVG(r.score), 5.0)::numeric(2,1) AS avg_rating,
      COUNT(DISTINCT r.id)::int AS rating_count,
      COUNT(DISTINCT j.id)::int AS completed_jobs,
      COALESCE(SUM(p.amount), 0)::int AS total_earnings
    FROM worker_profiles wp
    LEFT JOIN ratings r ON r.rated_id = wp.user_id
    LEFT JOIN jobs j ON j.worker_id = wp.user_id
    LEFT JOIN payments p ON p.job_id = j.id AND p.status = 'released'
    GROUP BY wp.id, wp.user_id, wp.full_name, wp.skills, wp.avatar_url
    ORDER BY avg_rating DESC, rating_count DESC, total_earnings DESC
    LIMIT 5
  `;

  const topPerformers: PerformerItem[] = topArtisansRaw.map((wp: any, idx: number) => {
    const skillsList = Array.isArray(wp.skills)
      ? wp.skills.join(", ")
      : typeof wp.skills === "string"
      ? wp.skills
      : "Skilled Artisan";
    return {
      id: String(wp.id || idx),
      name: String(wp.full_name || "Artisan"),
      specialty: skillsList,
      contracts: Number(wp.completed_jobs || 1),
      revenue: `ETB ${Number(wp.total_earnings || 0).toLocaleString()}`,
      rating: `${wp.avg_rating} ★ (${wp.rating_count})`,
      change: "100%",
      rank: idx + 1,
      avatar_url: wp.avatar_url,
    };
  });

  // ── 6. Real Pending Fayda Queue ──────────────────────────────────────
  const unverifiedWorkers = verificationCapabilities.canRead ? await sql`
    SELECT
      wp.user_id,
      wp.full_name,
      wp.skills,
      CASE
        WHEN wp.fayda_doc_url IS NOT NULL
         AND length(wp.fayda_doc_url) > 0
        THEN true
        ELSE false
      END AS has_document,
      wp.fin_last4,
      wp.avatar_url,
      wp.verification_status,
      wp.is_verified,
      wp.created_at,
      u.phone,
      u.email,
      u.is_suspended
    FROM worker_profiles wp
    JOIN users u ON wp.user_id = u.id
    WHERE wp.is_verified = false
       OR wp.verification_status IS DISTINCT FROM 'approved'
       OR wp.fayda_doc_url IS NULL
       OR length(wp.fayda_doc_url) = 0
       OR wp.fin_last4 IS NULL
       OR length(wp.fin_last4) <> 4
       OR u.is_suspended = true
    ORDER BY wp.created_at DESC
    LIMIT 10
  ` : [];

  const pendingWorkers = (unverifiedWorkers || []).map((worker: any) => {
    const identityComplete = hasCompleteWorkerIdentity({
      documentRef: worker.has_document ? "present" : "",
      finLast4: worker.fin_last4,
      finEncrypted: worker.fin_last4 ? "present" : "",
    });
    return {
      user_id: worker.user_id,
      full_name: worker.full_name || "Artisan",
      skills: worker.skills,
      has_document: Boolean(worker.has_document),
      avatar_url: worker.avatar_url,
      phone: worker.phone,
      email: worker.email,
      fin_last4: worker.fin_last4,
      created_at: worker.created_at ? String(worker.created_at) : undefined,
      verification_status: toWorkerDisplayStatus(
        worker.verification_status,
        worker.is_verified,
        worker.is_suspended,
        identityComplete,
      ),
      is_verified: Boolean(worker.is_verified && identityComplete),
      is_suspended: Boolean(worker.is_suspended),
    };
  });

  return (
    <AdminDashboardClient
      workerCount={totalWorkers}
      verifiedWorkerCount={verifiedWorkers}
      pendingVerifCount={pendingWorkersCount}
      activeContractCount={activeContractsCount}
      contractsVolumeDisplay={contractsVolumeDisplay}
      revenueDisplay={revenueDisplay}
      commissionDisplay={commissionDisplay}
      disputeCount={totalDisputes}
      resolvedDisputeCount={resolvedDisputes}
      monthlyTrend={monthlyTrend}
      tradeStages={tradeStages}
      recentActivities={recentActivities}
      topPerformers={topPerformers}
      unverifiedWorkers={pendingWorkers}
      verificationCapabilities={verificationCapabilities}
    />
  );
}
