export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import ClientHistoryClient from "@/components/client/ClientHistoryClient";

export default async function ClientHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  let activities: any[] = [];
  let totalSpentAllTime = 0;
  let completedJobsCount = 0;
  let totalContractsCount = 0;

  try {
    const results = await Promise.allSettled([
      // 1. Payments
      sql`
        SELECT 
          p.id,
          p.amount::numeric as amount,
          p.status as payment_status,
          p.created_at as payment_created_at,
          j.title as job_title,
          j.id as job_id,
          c.id as contract_id,
          wp.full_name as worker_name
        FROM payments p
        JOIN jobs j ON p.job_id = j.id
        LEFT JOIN contracts c ON c.job_id = j.id
        LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
        WHERE j.client_id = ${session.user.id}
        ORDER BY p.created_at DESC
      `,
      // 2. Contracts
      sql`
        SELECT 
          c.id as contract_id,
          COALESCE(c.job_title, j.title, 'Contract Agreement') as job_title,
          COALESCE(c.payment_amount, j.budget, 0)::numeric as budget,
          COALESCE(wp.full_name, 'Verified Artisan') as worker_name,
          c.status as contract_status,
          j.status as job_status,
          c.created_at as contract_created_at
        FROM contracts c
        JOIN jobs j ON c.job_id = j.id
        LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
        WHERE j.client_id = ${session.user.id}
        ORDER BY c.created_at DESC
      `,
      // 3. Jobs
      sql`
        SELECT 
          j.id as job_id,
          j.title as job_title,
          COALESCE(j.budget, 0)::numeric as budget,
          j.status as job_status,
          j.created_at as job_created_at,
          wp.full_name as worker_name
        FROM jobs j
        LEFT JOIN worker_profiles wp ON j.worker_id = wp.user_id
        WHERE j.client_id = ${session.user.id}
        ORDER BY j.created_at DESC
      `,
      // 4. Total spent sum
      sql`
        SELECT COALESCE(SUM(p.amount), 0)::numeric AS total_spent
        FROM payments p
        JOIN jobs j ON p.job_id = j.id
        WHERE j.client_id = ${session.user.id} AND p.status::text IN ('released', 'paid', 'completed')
      `,
      // 5. Completed count
      sql`
        SELECT COUNT(*)::int as completed_count
        FROM jobs
        WHERE client_id = ${session.user.id} AND status::text IN ('completed', 'paid', 'closed')
      `,
    ]);

    const paymentRows = results[0].status === "fulfilled" ? (results[0].value as any[]) : [];
    const contractRows = results[1].status === "fulfilled" ? (results[1].value as any[]) : [];
    const jobRows = results[2].status === "fulfilled" ? (results[2].value as any[]) : [];
    totalSpentAllTime = results[3].status === "fulfilled" ? Number((results[3].value as any[])[0]?.total_spent || 0) : 0;
    completedJobsCount = results[4].status === "fulfilled" ? Number((results[4].value as any[])[0]?.completed_count || 0) : 0;
    totalContractsCount = contractRows.length;

    // Normalize payments into unified timeline
    for (const p of paymentRows) {
      activities.push({
        id: p.id,
        type: "payment",
        title: p.job_title || "Direct Milestone Payment",
        amount: Number(p.amount) || 0,
        status: p.payment_status || "released",
        date: p.payment_created_at || new Date().toISOString(),
        workerName: p.worker_name,
        linkUrl: `/contracts/${p.contract_id || p.job_id}`,
      });
    }

    // Normalize contracts
    for (const c of contractRows) {
      activities.push({
        id: c.contract_id,
        type: "contract",
        title: c.job_title || "Contract Agreement",
        amount: Number(c.budget) || 0,
        status: c.contract_status || c.job_status || "ACTIVE",
        date: c.contract_created_at || new Date().toISOString(),
        workerName: c.worker_name,
        linkUrl: `/contracts/${c.contract_id}`,
      });
    }

    // Normalize jobs (that might not have a contract yet or are requests)
    for (const j of jobRows) {
      activities.push({
        id: j.job_id,
        type: "job",
        title: j.job_title || "Artisan Work Request",
        amount: Number(j.budget) || 0,
        status: j.job_status || "open",
        date: j.job_created_at || new Date().toISOString(),
        workerName: j.worker_name,
        linkUrl: `/client/contracts`,
      });
    }

    // Sort chronologically descending
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("[CLIENT-HISTORY] Failed to load data:", error);
  }

  return (
    <ClientHistoryClient
      initialActivities={activities}
      totalSpentAllTime={totalSpentAllTime}
      completedJobsCount={completedJobsCount}
      totalContractsCount={totalContractsCount}
    />
  );
}
