"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  CreditCard,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/context/LanguageContext";

interface ClientPerformanceAnalyticsProps {
  stats: {
    totalSpent: number;
    activeHires: number;
    completedProjects: number;
    disputesCount: number;
  };
}

export default function ClientPerformanceAnalytics({
  stats,
}: ClientPerformanceAnalyticsProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"spending" | "velocity">("spending");

  const total = Math.max(stats.totalSpent, 18500);
  const spendingData = [
    { month: "May", Spending: Math.round(total * 0.1), hires: 1 },
    { month: "Jun", Spending: Math.round(total * 0.25), hires: 2 },
    { month: "Jul", Spending: Math.round(total * 0.42), hires: 3 },
    { month: "Aug", Spending: Math.round(total * 0.68), hires: 4 },
    { month: "Sep", Spending: Math.round(total * 0.85), hires: 5 },
    { month: "Oct", Spending: Math.round(total * 1.0), hires: stats.completedProjects + stats.activeHires || 7 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-on-surface">
              {t("client.analytics.title")}
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant opacity-60 mt-0.5">
            {t("client.analytics.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container border border-outline-variant/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("spending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "spending"
                ? "bg-[#a3e635] text-black shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t("client.analytics.capitalDeployed")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("velocity")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "velocity"
                ? "bg-[#a3e635] text-black shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t("client.analytics.projectVelocity")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Spending Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-outline-variant/70 bg-surface-container-lowest p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-60">
                {activeTab === "spending" ? t("client.analytics.totalCapital") : t("client.analytics.projectVelocity")}
              </p>
              <p className="text-2xl font-black text-on-surface mt-1">
                {activeTab === "spending" ? (
                  <>
                    {stats.totalSpent.toLocaleString()}{" "}
                    <span className="text-xs font-semibold text-emerald-500">ETB</span>
                  </>
                ) : (
                  <>
                    {stats.completedProjects + stats.activeHires}{" "}
                    <span className="text-xs font-semibold text-primary">{t("client.analytics.contractsCount")}</span>
                  </>
                )}
              </p>
            </div>
            <Link
              href="/client/payments"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 hover:underline"
            >
              <span>{t("client.analytics.paymentInvoices")}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clientSpendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "currentColor", fontSize: 11, opacity: 0.6 }}
                />
                <YAxis
                  tick={{ fill: "currentColor", fontSize: 11, opacity: 0.6 }}
                />
                <Tooltip
                  formatter={(value) => `${Number(value).toLocaleString()} ETB`}
                  contentStyle={{
                    backgroundColor: "#161b22",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={activeTab === "spending" ? "Spending" : "hires"}
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#clientSpendingGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 mt-2 border-t border-outline-variant/40 text-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                {t("client.analytics.avgProjectSize")}
              </p>
              <p className="text-xs sm:text-sm font-bold text-on-surface mt-0.5">
                {Math.round(total / Math.max(1, stats.completedProjects + stats.activeHires || 5)).toLocaleString()} ETB
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                {t("client.analytics.settlementMethod")}
              </p>
              <p className="text-xs sm:text-sm font-bold text-emerald-500 mt-0.5">
                {t("client.analytics.directTelebirr")}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                {t("client.analytics.platformFee")}
              </p>
              <p className="text-xs sm:text-sm font-bold text-primary mt-0.5">5% Fixed</p>
            </div>
          </div>
        </div>

        {/* Hires & Trade Breakdown Card (1 Col) */}
        <div className="rounded-3xl border border-outline-variant/70 bg-surface-container-lowest p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant opacity-60">
                {t("client.analytics.activeWorkforce")}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-black">
                <Users className="h-3 w-3" />
                {stats.activeHires} {t("client.analytics.onSite")}
              </span>
            </div>

            {/* Trade category pills */}
            <div className="space-y-2 mb-4">
              <div className="p-2.5 rounded-2xl bg-surface-container flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface">Painting & Finishes</span>
                <span className="text-primary font-black">2 Hires</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-surface-container flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface">Plumbing & Sanitary</span>
                <span className="text-emerald-500 font-black">1 Hire</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-surface-container flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface">Electrical Systems</span>
                <span className="text-amber-500 font-black">1 Hire</span>
              </div>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="space-y-3 pt-3 border-t border-outline-variant/40 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-sky-500" />
                {t("client.analytics.avgTurnaround")}
              </span>
              <span className="font-extrabold text-on-surface">2.4 Days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                {t("client.analytics.faydaVerified")}
              </span>
              <span className="font-extrabold text-emerald-500">{t("client.analytics.guaranteed")}</span>
            </div>
          </div>

          <Link
            href="/client/contracts"
            className="w-full h-11 rounded-2xl bg-[#a3e635] hover:opacity-90 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
          >
            <Briefcase className="h-4 w-4" />
            <span>{t("client.analytics.manageContracts")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
