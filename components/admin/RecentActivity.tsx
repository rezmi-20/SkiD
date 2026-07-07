"use client";

import { CheckCircle, UserPlus, FileText, DollarSign, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ActivityItem {
  type: string;
  title: string;
  created_at: string;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const typeConfig: Record<string, { icon: React.ReactNode; colorClass: string; labelKey: string }> = {
  user_signup: {
    icon: <UserPlus className="w-3.5 h-3.5 text-blue-600" />,
    colorClass: "bg-blue-100",
    labelKey: "admin.activity.signup",
  },
  job_posted: {
    icon: <FileText className="w-3.5 h-3.5 text-purple-600" />,
    colorClass: "bg-purple-100",
    labelKey: "admin.activity.jobPosted",
  },
  payment: {
    icon: <DollarSign className="w-3.5 h-3.5 text-emerald-600" />,
    colorClass: "bg-emerald-100",
    labelKey: "admin.activity.payment",
  },
  verification: {
    icon: <CheckCircle className="w-3.5 h-3.5 text-green-600" />,
    colorClass: "bg-green-100",
    labelKey: "admin.activity.verified",
  },
  dispute: {
    icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" />,
    colorClass: "bg-red-100",
    labelKey: "admin.activity.dispute",
  },
};

// Fallback labels if translation key doesn't exist
const fallbackLabels: Record<string, string> = {
  "admin.activity.signup": "New Signup",
  "admin.activity.jobPosted": "Job Posted",
  "admin.activity.payment": "Payment",
  "admin.activity.verified": "Verified",
  "admin.activity.dispute": "Dispute",
};

export function RecentActivity({ items }: RecentActivityProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest h-full flex flex-col shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-outline-variant flex items-center justify-between shrink-0">
        <h3 className="text-sm font-bold text-on-surface tracking-tight">
          {t("admin.activity.title" as any)}
        </h3>
        <span className="badge-info">{items.length} {t("common.search" as any) === "Search" ? "events" : ""}</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-outline-variant no-scrollbar">
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-on-surface-variant">
            {t("admin.pendingVerif.empty" as any)}
          </div>
        ) : (
          items.map((item, i) => {
            const config = typeConfig[item.type] ?? typeConfig.job_posted;
            const label = fallbackLabels[config.labelKey] ?? config.labelKey;
            return (
              <div
                key={i}
                className="px-4 py-2.5 flex items-start gap-3 hover:bg-surface-container transition-colors duration-150"
              >
                <div className={`p-1.5 rounded-full ${config.colorClass} shrink-0 mt-0.5`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-sm font-medium text-on-surface truncate">
                    {item.title}
                  </p>
                </div>
                <span className="text-[10px] text-on-surface-variant shrink-0 font-medium tabular-nums">
                  {timeAgo(item.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
