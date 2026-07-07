"use client";

import { Users, Clock, FileText, Briefcase, DollarSign, Scale } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { MetricCard } from "@/components/admin/MetricCard";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { QuickActions } from "@/components/admin/QuickActions";
import { PendingVerification } from "@/components/admin/PendingVerification";

interface Props {
  workerCount: number;
  pendingVerifCount: number;
  activeContractCount: number;
  completedJobsMonthly: number;
  revenueDisplay: string;
  disputeCount: number;
  activityFeed: { type: string; title: string; created_at: string }[];
  unverifiedWorkers: any[];
}

export function AdminDashboardClient({
  workerCount,
  pendingVerifCount,
  activeContractCount,
  completedJobsMonthly,
  revenueDisplay,
  disputeCount,
  activityFeed,
  unverifiedWorkers,
}: Props) {
  const { t } = useLanguage();

  const metrics = [
    {
      label: t("admin.metric.totalWorkers" as any),
      value: workerCount,
      icon: <Users className="w-5 h-5 text-blue-600" />,
      colorClass: "bg-blue-100",
    },
    {
      label: t("admin.metric.pendingVerif" as any),
      value: pendingVerifCount,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      colorClass: "bg-amber-100",
    },
    {
      label: t("admin.metric.activeContracts" as any),
      value: activeContractCount,
      icon: <FileText className="w-5 h-5 text-emerald-600" />,
      colorClass: "bg-emerald-100",
    },
    {
      label: t("admin.metric.jobsMonth" as any),
      value: completedJobsMonthly,
      icon: <Briefcase className="w-5 h-5 text-purple-600" />,
      colorClass: "bg-purple-100",
    },
    {
      label: t("admin.metric.revenue" as any),
      value: revenueDisplay,
      icon: <DollarSign className="w-5 h-5 text-green-600" />,
      colorClass: "bg-green-100",
    },
    {
      label: t("admin.metric.disputes" as any),
      value: disputeCount,
      icon: <Scale className="w-5 h-5 text-red-600" />,
      colorClass: "bg-red-100",
    },
  ];

  return (
    <div className="flex flex-col gap-5 pb-10">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4 transition-colors duration-300">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {t("admin.portal" as any)}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-on-surface tracking-tight">
          {t("admin.dashboard" as any)} — Command Center
        </h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">
          {t("admin.activity.title" as any)} · {t("admin.pendingVerif.title" as any)}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m, i) => (
          <MetricCard key={i} {...m} />
        ))}
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 min-h-[280px]">
          <RecentActivity items={activityFeed} />
        </div>
        <div className="min-h-[280px]">
          <QuickActions />
        </div>
      </div>

      {/* Pending Verification Table */}
      <PendingVerification workers={unverifiedWorkers} />
    </div>
  );
}
