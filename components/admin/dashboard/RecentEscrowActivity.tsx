"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Clock, CheckCircle2, XCircle } from "lucide-react";

export interface RecentActivityItem {
  id: string;
  trade: string;
  value: string;
  status: "released" | "escrow" | "disputed" | "active";
  date: string;
  artisan: string;
}

const defaultDeals: RecentActivityItem[] = [
  {
    id: "1",
    trade: "testing live",
    value: "ETB 1,000",
    status: "released",
    date: "Oct 23, 2026",
    artisan: "Remedan seid",
  },
  {
    id: "2",
    trade: "Dipute 2 test",
    value: "ETB 1,000",
    status: "released",
    date: "Aug 20, 2026",
    artisan: "Remzi manual test",
  },
];

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  released: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
    label: "Released",
  },
  escrow: {
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "In Escrow",
  },
  held: {
    icon: Clock,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "In Escrow",
  },
  active: {
    icon: Clock,
    color: "text-accent",
    bg: "bg-accent/10",
    label: "Active",
  },
  disputed: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Disputed",
  },
};

interface RecentEscrowActivityProps {
  activities?: RecentActivityItem[];
}

export function RecentEscrowActivity({ activities }: RecentEscrowActivityProps) {
  const items = activities && activities.length > 0 ? activities : defaultDeals;

  return (
    <div className="bg-card border border-border rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Recent Milestone Activity</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Real escrow deposits & payouts in Dire Dawa</p>
        </div>
        <Link
          href="/admin/payments"
          className="flex items-center gap-1 text-sm text-accent hover:text-accent/80 font-medium transition-colors group"
        >
          View all
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {items.map((deal, index) => {
          const status = statusConfig[deal.status] || statusConfig.released;
          const StatusIcon = status.icon;

          return (
            <div
              key={deal.id || deal.trade}
              className="group flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-left-2"
              style={{ animationDelay: `${(index + 3) * 100}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-sm font-semibold text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-all duration-200">
                  {deal.trade.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{deal.trade}</p>
                  <p className="text-xs text-muted-foreground">{deal.artisan} • {deal.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground tabular-nums">{deal.value}</span>
                <div className={cn("flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium", status.bg, status.color)}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

