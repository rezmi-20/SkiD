"use client";

import { AdminMetricCard } from "./dashboard/AdminMetricCard";
import { EscrowVolumeChart, MonthlyVolumePoint } from "./dashboard/EscrowVolumeChart";
import { TradePipelineDistribution, TradeStageItem } from "./dashboard/TradePipelineDistribution";
import { RecentEscrowActivity, RecentActivityItem } from "./dashboard/RecentEscrowActivity";
import { TopPerformers, PerformerItem } from "./dashboard/TopPerformers";
import { PendingFaydaQueueTable } from "./dashboard/PendingFaydaQueueTable";
import { DollarSign, ShieldCheck, FileText, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  workerCount: number;
  verifiedWorkerCount: number;
  pendingVerifCount: number;
  activeContractCount: number;
  contractsVolumeDisplay: string;
  revenueDisplay: string;
  commissionDisplay: string;
  disputeCount: number;
  resolvedDisputeCount: number;
  monthlyTrend: MonthlyVolumePoint[];
  tradeStages: TradeStageItem[];
  recentActivities: RecentActivityItem[];
  topPerformers: PerformerItem[];
  unverifiedWorkers: any[];
  verificationCapabilities: {
    canRead: boolean;
    canReview: boolean;
    canApprove: boolean;
    canReject: boolean;
  };
}

export function AdminDashboardClient({
  workerCount,
  verifiedWorkerCount,
  pendingVerifCount,
  activeContractCount,
  contractsVolumeDisplay,
  revenueDisplay,
  commissionDisplay,
  disputeCount,
  resolvedDisputeCount,
  monthlyTrend,
  tradeStages,
  recentActivities,
  topPerformers,
  unverifiedWorkers,
  verificationCapabilities,
}: Props) {
  const { t } = useLanguage();
  const verifiedPercentage =
    workerCount > 0 ? Math.round((verifiedWorkerCount / workerCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* ── Row 1: Real Platform Metrics (100% Live DB Data) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard
          title={t("admin.dashboard.kpi.escrow")}
          value={revenueDisplay}
          change={`Comm: ${commissionDisplay}`}
          changeType="positive"
          icon={DollarSign}
          delay={0}
          highlight={true}
        />
        <AdminMetricCard
          title={t("admin.dashboard.kpi.artisans")}
          value={`${verifiedWorkerCount} / ${workerCount}`}
          change={`${verifiedPercentage}% ${t("admin.dashboard.kpi.allVerified")}`}
          changeType="positive"
          icon={ShieldCheck}
          delay={1}
        />
        <AdminMetricCard
          title={t("admin.dashboard.kpi.contracts")}
          value={String(activeContractCount)}
          change={contractsVolumeDisplay}
          changeType="positive"
          icon={FileText}
          delay={2}
        />
        <AdminMetricCard
          title={t("admin.dashboard.kpi.kyc")}
          value={String(pendingVerifCount)}
          change={pendingVerifCount === 0 ? t("admin.dashboard.kpi.allVerified") : `${pendingVerifCount} ${t("admin.dashboard.kpi.pendingCount")}`}
          changeType={pendingVerifCount === 0 ? "positive" : "neutral"}
          icon={Clock}
          delay={3}
        />
      </div>

      {/* ── Row 2: Charts row (Real Escrow & Trade Distribution) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EscrowVolumeChart data={monthlyTrend} />
        </div>
        <TradePipelineDistribution
          stages={tradeStages}
          totalActiveVolume={contractsVolumeDisplay}
        />
      </div>

      {/* ── Row 3: Bottom row (Real Recent Activity & Top Performers) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentEscrowActivity activities={recentActivities} />
        <TopPerformers performers={topPerformers} />
      </div>

      {/* ── Row 4: Single Unified Data Surface for Pending Fayda Verifications ── */}
      <div className="pt-2">
        <PendingFaydaQueueTable
          workers={unverifiedWorkers}
          canReview={verificationCapabilities.canReview}
          canApprove={verificationCapabilities.canApprove}
          canReject={verificationCapabilities.canReject}
        />
      </div>
    </div>
  );
}
