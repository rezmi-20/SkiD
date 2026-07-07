"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  change?: string;
  trend?: "up" | "down";
  colorClass: string;
}

export function MetricCard({ label, value, icon, change, trend, colorClass }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 hover:bg-surface-container-low transition-all duration-200 group shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClass} transition-transform group-hover:scale-110 duration-200`}>
          {icon}
        </div>
        {change && (
          <div
            className={`flex items-center gap-0.5 text-[11px] font-semibold rounded-full px-2 py-0.5 ${
              trend === "up"
                ? "text-green-700 bg-green-100"
                : "text-red-600 bg-red-100"
            }`}
          >
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-on-surface tracking-tight">{value}</p>
      <p className="text-xs font-medium text-on-surface-variant mt-0.5 uppercase tracking-wider">{label}</p>
    </div>
  );
}
