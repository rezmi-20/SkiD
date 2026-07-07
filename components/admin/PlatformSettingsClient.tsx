"use client";

import { useState } from "react";
import { Settings, Save, ShieldAlert, CheckCircle, Database } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface StatsData {
  totalUsers: number;
  totalWorkers: number;
  totalClients: number;
  totalJobs: number;
  totalPayments: number;
}

interface Props {
  stats: StatsData;
}

export function PlatformSettingsClient({ stats }: Props) {
  const { t } = useLanguage();
  const [fee, setFee] = useState(5);
  const [simulation, setSimulation] = useState(true);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-10 max-w-3xl">
      {/* Welcome Banner */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-low px-5 py-4 transition-colors duration-300">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {t("admin.portal" as any)}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-on-surface tracking-tight">
          {t("admin.settings.title" as any)}
        </h1>
        <p className="mt-0.5 text-sm text-on-surface-variant">
          {t("admin.settings.desc" as any)}
        </p>
      </div>

      {showSaved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-800 text-sm font-semibold rounded-lg animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 text-green-700" />
          <span>{t("admin.settings.saved" as any)}</span>
        </div>
      )}

      {/* Main Form & Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Settings Form */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 transition-colors duration-300 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              {t("admin.settings.section.general" as any)}
            </h2>

            {/* Fee */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface">
                {t("admin.settings.feeLabel" as any)}
              </label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                min={0}
                max={100}
                className="w-full bg-surface-container px-3.5 py-2.5 rounded-lg border border-outline-variant text-sm text-on-surface focus:outline-none focus:border-primary transition-all font-semibold"
              />
              <p className="text-[11px] text-on-surface-variant/80">
                {t("admin.settings.feeDesc" as any)}
              </p>
            </div>

            {/* Simulation Mode Toggle */}
            <div className="flex items-start justify-between gap-4 pt-3 border-t border-outline-variant/60">
              <div className="space-y-0.5 max-w-[80%]">
                <label className="text-xs font-bold text-on-surface">
                  {t("admin.settings.simulationMode" as any)}
                </label>
                <p className="text-[11px] text-on-surface-variant/85 leading-relaxed">
                  {t("admin.settings.simulationDesc" as any)}
                </p>
              </div>
              <button
                onClick={() => setSimulation(!simulation)}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  simulation ? "bg-primary" : "bg-surface-container-high border border-outline-variant"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${
                    simulation ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-xs font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{t("admin.settings.btnSave" as any)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Database Health Panel */}
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 transition-colors duration-300 shadow-sm space-y-4 h-fit">
          <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            System Health
          </h2>

          <div className="space-y-3 pt-1 divide-y divide-outline-variant/60">
            <div className="flex items-center justify-between text-xs py-2">
              <span className="font-semibold text-on-surface-variant">Total Users</span>
              <span className="font-bold text-on-surface font-mono">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2">
              <span className="font-semibold text-on-surface-variant">Worker Accounts</span>
              <span className="font-bold text-on-surface font-mono">{stats.totalWorkers}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2">
              <span className="font-semibold text-on-surface-variant">Client Accounts</span>
              <span className="font-bold text-on-surface font-mono">{stats.totalClients}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2">
              <span className="font-semibold text-on-surface-variant">Total Jobs</span>
              <span className="font-bold text-on-surface font-mono">{stats.totalJobs}</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2">
              <span className="font-semibold text-on-surface-variant">Transactions</span>
              <span className="font-bold text-on-surface font-mono">{stats.totalPayments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
