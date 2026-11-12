"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  change?: string;
  trend?: "up" | "down";
  dotColor?: string;
  colorClass?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  change,
  trend,
  dotColor = "bg-blue-500",
  colorClass,
}: MetricCardProps) {
  return (
    <div className="rounded-[12px] border border-black/[0.06] dark:border-white/[0.07] bg-white dark:bg-[#151F32] p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)] hover:border-black/[0.1] dark:hover:border-white/[0.12] transition-all flex flex-col justify-between">
      {/* Top row: label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {icon && (
          <div className={`p-1.5 rounded-lg text-slate-400 dark:text-slate-500 ${colorClass || ""}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="my-1">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
      </div>

      {/* Comparison badge / status */}
      {change ? (
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              trend === "up"
                ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50"
                : "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/50"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change}
          </span>
        </div>
      ) : (
        <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Platform metric
        </div>
      )}
    </div>
  );
}
