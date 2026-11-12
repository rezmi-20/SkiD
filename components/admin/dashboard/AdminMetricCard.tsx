"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  delay?: number;
  highlight?: boolean;
}

export function AdminMetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  delay = 0,
  highlight = false,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-card border rounded-xl p-5 transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-4",
        highlight
          ? "border-accent/70 shadow-[0_0_20px_rgba(34,197,94,0.08)] hover:border-accent"
          : "border-border hover:border-accent/50"
      )}
      style={{ animationDelay: `${delay * 100}ms`, animationFillMode: "both" }}
    >
      {/* Subtle gradient on hover */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent transition-opacity duration-500",
          highlight ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm text-muted-foreground font-medium">
            {title}
          </span>
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-300",
              highlight
                ? "bg-accent/15 text-accent"
                : "bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent"
            )}
          >
            <Icon className="w-4 h-4 transition-colors duration-300" />
          </div>
        </div>

        <div className="flex items-end gap-3">
          <span className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight tabular-nums">
            {value}
          </span>
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium mb-1",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {changeType === "positive" && <TrendingUp className="w-3.5 h-3.5" />}
            {changeType === "negative" && (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{change}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
