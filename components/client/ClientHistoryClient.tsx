"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cx } from "@/utils/cx";
import { Chip } from "@/components/base/badges/chip";
import {
  RiArrowLeftLine,
  RiSearchLine,
  RiBankCardLine,
  RiFileTextLine,
  RiBriefcaseLine,
  RiShieldCheckFill,
  RiArrowRightSLine,
  RiCalendarLine,
} from "@remixicon/react";

interface ActivityItem {
  id: string;
  type: "payment" | "contract" | "job";
  title: string;
  amount: number;
  status: string;
  date: string;
  workerName?: string;
  linkUrl: string;
}

interface ClientHistoryClientProps {
  initialActivities: ActivityItem[];
  totalSpentAllTime: number;
  completedJobsCount: number;
  totalContractsCount: number;
}

export default function ClientHistoryClient({
  initialActivities = [],
  totalSpentAllTime = 0,
  completedJobsCount = 0,
  totalContractsCount = 0,
}: ClientHistoryClientProps) {
  const [timeFilter, setTimeFilter] = useState<"all" | "month" | "quarter" | "year">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "payment" | "contract" | "job">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate cutoff date based on time filter
  const filteredActivities = useMemo(() => {
    const now = new Date();
    let cutoff: Date | null = null;

    if (timeFilter === "month") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeFilter === "quarter") {
      cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
    } else if (timeFilter === "year") {
      cutoff = new Date(now.getFullYear(), 0, 1);
    }

    return initialActivities.filter((item) => {
      // Time filter
      if (cutoff) {
        const itemDate = new Date(item.date);
        if (isNaN(itemDate.getTime()) || itemDate < cutoff) return false;
      }

      // Type filter
      if (typeFilter !== "all" && item.type !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (item.title || "").toLowerCase().includes(q);
        const matchesWorker = (item.workerName || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesWorker) return false;
      }

      return true;
    });
  }, [initialActivities, timeFilter, typeFilter, searchQuery]);

  // Dynamic spend calculation based on filtered activities
  const currentFilteredSpend = useMemo(() => {
    return filteredActivities
      .filter((a) => a.type === "payment" || (a.type === "contract" && a.status === "paid"))
      .reduce((sum, a) => sum + (a.amount || 0), 0);
  }, [filteredActivities]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-24 select-none">
      {/* ── Top Header & Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/client/dashboard"
            className="p-2.5 rounded-2xl bg-background-secondary-default hover:bg-background-secondary-hover border border-border-button-default text-text-primary transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <RiArrowLeftLine className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-title-2-medium sm:text-title-1-bold text-text-primary font-black tracking-tight">
              Activity & Payment History
            </h1>
            <p className="text-caption-1-semibold text-text-tertiary">
              Complete audit trail of all direct payments, requests, and artisan agreements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background-secondary-default border border-border-button-default text-caption-1-semibold text-text-secondary font-bold text-xs">
            <RiShieldCheckFill className="w-4 h-4 text-[#45BA50]" />
            <span>DireSkill Direct Settlement</span>
          </span>
        </div>
      </div>

      {/* ── Summary Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Filtered Spend */}
        <div className="p-5 rounded-3xl bg-background-secondary-default border border-border-button-default shadow-xs space-y-1">
          <span className="text-caption-1-semibold text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
            {timeFilter === "all" ? "Total Lifetime Spend" : "Filtered Spend"}
          </span>
          <p className="text-title-2-medium sm:text-title-1-bold font-black text-text-primary tracking-tight">
            <span className="text-sm font-bold text-zinc-900 dark:text-white mr-1.5">ETB</span>
            {(timeFilter === "all" ? (totalSpentAllTime || currentFilteredSpend) : currentFilteredSpend).toLocaleString()}
          </p>
          <p className="text-[11px] text-text-tertiary">
            Directly transferred to verified artisans
          </p>
        </div>

        {/* Completed Projects */}
        <div className="p-5 rounded-3xl bg-background-secondary-default border border-border-button-default shadow-xs space-y-1">
          <span className="text-caption-1-semibold text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
            Completed Projects
          </span>
          <p className="text-title-2-medium sm:text-title-1-bold font-black text-text-primary tracking-tight">
            {completedJobsCount} <span className="text-xs font-semibold text-[#45BA50]">Delivered</span>
          </p>
          <p className="text-[11px] text-text-tertiary">
            Verified jobs finished with 100% sign-off
          </p>
        </div>

        {/* Total Contracts */}
        <div className="p-5 rounded-3xl bg-background-secondary-default border border-border-button-default shadow-xs space-y-1">
          <span className="text-caption-1-semibold text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
            Total Contracts
          </span>
          <p className="text-title-2-medium sm:text-title-1-bold font-black text-text-primary tracking-tight">
            {totalContractsCount} <span className="text-xs font-semibold text-blue-500">Agreements</span>
          </p>
          <p className="text-[11px] text-text-tertiary">
            Digital contracts with QR validation
          </p>
        </div>
      </div>

      {/* ── Filters & Search Control Bar ── */}
      <div className="p-4 rounded-3xl bg-background-secondary-default border border-border-button-default shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Time Range Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-background-tertiary-default/80 border border-border-button-default text-xs overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setTimeFilter("all")}
              className={cx(
                "px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap",
                timeFilter === "all"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("month")}
              className={cx(
                "px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap",
                timeFilter === "month"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("quarter")}
              className={cx(
                "px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap",
                timeFilter === "quarter"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              Last 3 Months
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter("year")}
              className={cx(
                "px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap",
                timeFilter === "year"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              This Year
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job or artisan..."
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-background-primary-default border border-border-button-default text-text-primary text-caption-1-semibold placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-[#45BA50]"
            />
          </div>
        </div>

        {/* Activity Type Filter Tabs */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-border-separator-border text-xs overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={cx(
              "px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap",
              typeFilter === "all"
                ? "bg-[#45BA50]/15 text-[#45BA50] border border-[#45BA50]/30"
                : "text-text-tertiary hover:text-text-primary"
            )}
          >
            All Activities ({initialActivities.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("payment")}
            className={cx(
              "px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap",
              typeFilter === "payment"
                ? "bg-[#45BA50]/15 text-[#45BA50] border border-[#45BA50]/30"
                : "text-text-tertiary hover:text-text-primary"
            )}
          >
            Direct Payments
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("contract")}
            className={cx(
              "px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap",
              typeFilter === "contract"
                ? "bg-[#45BA50]/15 text-[#45BA50] border border-[#45BA50]/30"
                : "text-text-tertiary hover:text-text-primary"
            )}
          >
            Contracts
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("job")}
            className={cx(
              "px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap",
              typeFilter === "job"
                ? "bg-[#45BA50]/15 text-[#45BA50] border border-[#45BA50]/30"
                : "text-text-tertiary hover:text-text-primary"
            )}
          >
            Job Requests
          </button>
        </div>
      </div>

      {/* ── Chronological Activity Feed / Table ── */}
      <div className="rounded-3xl bg-background-secondary-default border border-border-button-default shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-border-separator-border flex items-center justify-between">
          <h2 className="text-body-medium font-bold text-text-primary">
            Timeline of Events ({filteredActivities.length})
          </h2>
          <span className="text-xs font-semibold text-text-tertiary">
            Sorted by most recent
          </span>
        </div>

        <div className="divide-y divide-border-separator-border">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((item) => {
              const isPayment = item.type === "payment";
              const isContract = item.type === "contract";
              const dateObj = new Date(item.date);
              const formattedDate = !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recent";

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-background-tertiary-default/40 transition-colors"
                >
                  {/* Left: Icon + Title + Worker + Date */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={cx(
                        "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs",
                        isPayment
                          ? "bg-[#18261b] text-[#45BA50]"
                          : isContract
                          ? "bg-blue-950 text-blue-400"
                          : "bg-amber-950/60 text-amber-500"
                      )}
                    >
                      {isPayment ? (
                        <RiBankCardLine className="w-5 h-5" />
                      ) : isContract ? (
                        <RiFileTextLine className="w-5 h-5" />
                      ) : (
                        <RiBriefcaseLine className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-body-medium font-bold text-text-primary truncate">
                          {item.title}
                        </p>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-background-tertiary-default text-text-secondary border border-border-button-default">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-caption-1-semibold text-text-tertiary flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <RiCalendarLine className="w-3.5 h-3.5" />
                          {formattedDate}
                        </span>
                        {item.workerName && (
                          <>
                            <span>•</span>
                            <span className="text-text-secondary font-medium truncate">
                              Artisan: {item.workerName}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount + Status + Action Link */}
                  <div className="flex items-center gap-3.5 shrink-0">
                    {item.amount > 0 && (
                      <div className="text-right">
                        <p className="text-body-medium font-black text-text-primary">
                          ETB {Number(item.amount).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-[#45BA50]">
                          Direct Payment
                        </p>
                      </div>
                    )}

                    <Chip
                      variant="caption"
                      color={
                        item.status === "completed" || item.status === "paid" || item.status === "released"
                          ? "lime"
                          : item.status === "disputed"
                          ? "orange"
                          : "blue"
                      }
                    >
                      {item.status.toUpperCase()}
                    </Chip>

                    <Link
                      href={item.linkUrl}
                      className="p-2 rounded-xl bg-background-tertiary-default hover:bg-background-tertiary-hover text-text-secondary hover:text-text-primary transition-colors"
                      title="Open details"
                    >
                      <RiArrowRightSLine className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <p className="text-body-medium font-bold text-text-primary">
                No activity found for this filter
              </p>
              <p className="text-caption-1-semibold text-text-tertiary mt-1">
                Try selecting "All Time" or clearing your search query.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTimeFilter("all");
                  setTypeFilter("all");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[#45BA50] text-zinc-950 font-bold text-xs cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
