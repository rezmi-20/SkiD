"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { cx } from "@/utils/cx";
import {
  RiFileTextLine,
  RiFlashlightFill,
  RiDropFill,
  RiPaintBrushFill,
  RiHomeGearFill,
  RiBroadcastFill,
  RiTimeLine,
  RiCheckDoubleLine,
  RiAlertLine,
  RiCoinsLine,
  RiArrowRightLine,
  RiDownloadLine,
  RiStarFill,
  RiBankCardLine,
  RiSearchLine,
  RiCloseLine,
  RiCalendarLine,
  RiShieldCheckFill,
  RiFolderOpenLine,
  RiAddLine,
  RiArrowRightUpLine,
  RiCheckboxCircleFill
} from "@remixicon/react";

interface Props {
  contracts: any[];
  role: "client" | "worker";
}

/* ── Trade category mapping with authentic visuals ───────────────────── */
function getTradeMeta(title?: string) {
  const text = (title || "").toLowerCase();
  if (text.includes("electr") || text.includes("wir") || text.includes("light")) {
    return {
      icon: RiFlashlightFill,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      image: "/images/artisan-register-hero.jpg",
      label: "Electrical",
      curveColor: "#45BA50"
    };
  }
  if (text.includes("plumb") || text.includes("pipe") || text.includes("water") || text.includes("leak")) {
    return {
      icon: RiDropFill,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      image: "/images/worker_workbench_hero.jpg",
      label: "Plumbing",
      curveColor: "#3B82F6"
    };
  }
  if (text.includes("paint") || text.includes("color") || text.includes("wall")) {
    return {
      icon: RiPaintBrushFill,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      image: "/images/client_project_hero.jpg",
      label: "Painting",
      curveColor: "#EC4899"
    };
  }
  if (text.includes("finish") || text.includes("gypsum") || text.includes("decor") || text.includes("tile")) {
    return {
      icon: RiHomeGearFill,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      image: "/images/client_project_hero.jpg",
      label: "House Finishing",
      curveColor: "#10B981"
    };
  }
  if (text.includes("dish") || text.includes("satellite") || text.includes("antenna") || text.includes("tv")) {
    return {
      icon: RiBroadcastFill,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      image: "/images/artisan-register-hero.jpg",
      label: "Satellite Dish",
      curveColor: "#06B6D4"
    };
  }
  return {
    icon: RiFileTextLine,
    color: "text-[#45BA50]",
    bg: "bg-[#45BA50]/10",
    image: "/images/client_project_hero.jpg",
    label: "Artisan Work",
    curveColor: "#45BA50"
  };
}

/* ── Status badge resolver ───────────────────────────────────────────── */
function getStatusChip(contract: any) {
  const status = contract.contract_status || contract.job_status;
  const isPending = !contract.signed_at;

  if (contract.job_status === "disputed") {
    return {
      label: "⚠ In Dispute",
      className: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20"
    };
  }

  if (["paid", "closed"].includes(contract.job_status)) {
    return {
      label: "✓ Completed & Paid",
      className: "bg-[#134e27]/25 text-[#a4fe47] border-[#45BA50]/30"
    };
  }

  if (contract.job_status === "completed" || contract.job_status === "payment_pending") {
    return {
      label: "● Payment Pending",
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    };
  }

  if (status === "ACTIVE" || contract.job_status === "active" || contract.job_status === "in_progress") {
    return {
      label: "● Active Direct Work",
      className: "bg-[#45BA50]/15 text-[#45BA50] border-[#45BA50]/30 font-black"
    };
  }

  if (status === "DRAFT") {
    return {
      label: "Draft Agreement",
      className: "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700"
    };
  }

  if (isPending || ["READY_FOR_SIGNATURE", "CLIENT_SIGNED", "WORKER_SIGNED"].includes(status)) {
    return {
      label: "⏳ Awaiting Signature",
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold"
    };
  }

  return {
    label: status || "Pending",
    className: "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700"
  };
}

export default function ContractsPageContent({ contracts = [], role }: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "pending" | "completed" | "disputed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const downloadContractPdf = async (pdfUrl: string, contractId: string) => {
    try {
      const response = await fetch(pdfUrl, {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        alert(data?.error || "Contract PDF is not available yet.");
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `direskill-contract-${contractId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      alert("Failed to download agreement PDF. Please retry in a moment.");
    }
  };

  /* ── Dynamic KPI Stats for Dashboard Harmony ─────────────────────────── */
  const stats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter((c) => c.contract_status === "ACTIVE" || c.job_status === "active" || c.job_status === "in_progress").length;
    const pending = contracts.filter((c) => ["DRAFT", "READY_FOR_SIGNATURE", "CLIENT_SIGNED", "WORKER_SIGNED"].includes(c.contract_status)).length;
    const completed = contracts.filter((c) => ["completed", "payment_pending", "paid", "closed"].includes(c.job_status)).length;
    const disputed = contracts.filter((c) => c.job_status === "disputed").length;

    const totalBudget = contracts.reduce((sum, c) => {
      const val = parseFloat(String(c.budget || "0").replace(/[^0-9.]/g, ""));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return { total, active, pending, completed, disputed, totalBudget };
  }, [contracts]);

  /* ── Tab Filtering ──────────────────────────────────────────────────── */
  const tabs = [
    { id: "all" as const, label: t("contracts.all") || "All", count: stats.total },
    { id: "active" as const, label: t("contracts.active") || "Active", count: stats.active },
    { id: "pending" as const, label: t("contracts.pending") || "Pending Signature", count: stats.pending },
    { id: "completed" as const, label: t("contracts.completed") || "Completed", count: stats.completed },
    { id: "disputed" as const, label: t("contracts.disputed") || "Disputed", count: stats.disputed },
  ];

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "active" && (c.contract_status === "ACTIVE" || c.job_status === "active" || c.job_status === "in_progress")) ||
        (activeTab === "pending" && ["DRAFT", "READY_FOR_SIGNATURE", "CLIENT_SIGNED", "WORKER_SIGNED"].includes(c.contract_status)) ||
        (activeTab === "completed" && ["completed", "payment_pending", "paid", "closed"].includes(c.job_status)) ||
        (activeTab === "disputed" && c.job_status === "disputed");

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        c.job_title?.toLowerCase().includes(query) ||
        c.partner_name?.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [contracts, activeTab, searchQuery]);

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 pb-10 sm:pb-14 transition-colors">
      
      {/* ── Page Header & Top CTA ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        
        {/* Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#134e27]/25 text-[#a4fe47] border border-[#45BA50]/30 inline-flex items-center gap-1">
                <RiShieldCheckFill className="w-3.5 h-3.5 text-[#a4fe47]" />
                <span>Dire Dawa Legal Repository</span>
              </span>
              <span className="text-xs text-slate-400 dark:text-zinc-500">•</span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Digital Service Agreements</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
              {t("contracts.title") || "Contracts & Agreements"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
              {t("contracts.desc") || "Legally-binding scope of work documents, verifiable milestone commitments, and direct settlement agreements in Dire Dawa."}
            </p>
          </div>

          {role === "client" && (
            <Link
              href="/client/search"
              className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-full text-xs font-bold bg-[#45BA50] hover:bg-[#3ca346] text-white shadow-[0_2px_12px_rgba(69,186,80,0.35)] active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
            >
              <RiAddLine className="w-4 h-4 stroke-[2]" />
              <span>{t("contracts.new") || "Find New Artisan"}</span>
            </Link>
          )}
        </div>

        {/* ── Dashboard Vibe KPI Summary Row ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* KPI 1: Total Contracts */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 border border-blue-500/20">
              <RiFileTextLine className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {stats.total}
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate">
                Total Agreements
              </p>
            </div>
          </div>

          {/* KPI 2: Active Work */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#134e27]/25 text-[#a4fe47] flex items-center justify-center shrink-0 border border-[#45BA50]/30">
              <RiFlashlightFill className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {stats.active}
                </p>
                {stats.active > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#45BA50] animate-ping" />
                )}
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate">
                Active Direct Work
              </p>
            </div>
          </div>

          {/* KPI 3: Pending Signatures */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
              <RiTimeLine className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-black text-amber-500 leading-tight">
                {stats.pending}
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate">
                Awaiting Signatures
              </p>
            </div>
          </div>

          {/* KPI 4: Total Value */}
          <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-[#45BA50] flex items-center justify-center shrink-0 border border-[#45BA50]/30">
              <RiCoinsLine className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
                ETB {stats.totalBudget.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate">
                Committed Value
              </p>
            </div>
          </div>

        </section>

        {/* ── Filter Tabs & Search Controls Bar ── */}
        <section className="p-2 sm:p-2.5 rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Filter Pills */}
          <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/60 dark:border-zinc-700/60">
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cx(
                    "flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer select-none",
                    isSelected
                      ? "bg-[#45BA50] text-white shadow-xs font-black"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cx(
                      "px-1.5 py-0.2 rounded-full text-[10px] font-black",
                      isSelected
                        ? "bg-black/25 text-white"
                        : "bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative flex items-center h-10 px-3 rounded-2xl bg-slate-100 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 focus-within:border-[#45BA50] transition-colors w-full lg:max-w-xs">
            <RiSearchLine className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("contracts.search_detailed") || "Search artisan or service..."}
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none flex-1 min-w-0 ms-2"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white shrink-0 cursor-pointer"
                title="Clear Search"
              >
                <RiCloseLine className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </section>

        {/* ── Contracts Grid Section (Dashboard Vibe with Sparkline Curves) ── */}
        {filteredContracts.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <AnimatePresence mode="popLayout">
              {filteredContracts.map((contract, index) => {
                const status = contract.contract_status || contract.job_status;
                const isCompleted = ["paid", "closed"].includes(contract.job_status);
                const canRatePartner = isCompleted && !contract.user_has_rated;
                const isDisputed = contract.job_status === "disputed";
                const canOpenDispute = ["accepted", "active", "in_progress", "completion_requested", "completed", "payment_pending", "paid"].includes(contract.job_status);
                const isDraft = status === "DRAFT";
                const isPending = !contract.signed_at;
                const displayId = contract.contract_id ? `#${contract.contract_id.slice(0, 8).toUpperCase()}` : "N/A";
                const tradeMeta = getTradeMeta(contract.job_title);
                const TradeIcon = tradeMeta.icon;
                const statusChip = getStatusChip(contract);
                const isElectric = index % 2 === 0;
                const curveColor = tradeMeta.curveColor;
                const budgetNum = contract.budget ? Number(contract.budget).toLocaleString() : "1,000";

                return (
                  <motion.div
                    key={contract.contract_id || index}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.2) }}
                    className="w-full flex"
                  >
                    <div className="w-full rounded-3xl p-5 bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:border-[#45BA50]/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
                      
                      {/* Subtle authentic trade background photo overlay on hover */}
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                        style={{ backgroundImage: `url('${tradeMeta.image}')` }}
                      />

                      <div className="relative z-10 space-y-4">
                        
                        {/* 1. Header: Partner Avatar, Identity & Status Chip */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Circular Partner Avatar with System Fallback */}
                            <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 shrink-0">
                              <img
                                src={contract.partner_avatar || "/images/worker_holding_card.png"}
                                alt={contract.partner_name || "Artisan"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/images/worker_holding_card.png";
                                }}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1 min-w-0">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#45BA50] transition-colors">
                                  {contract.partner_name || "Verified Artisan"}
                                </h3>
                                {contract.partner_verified && (
                                  <span title="Fayda Verified Pro">
                                    <RiShieldCheckFill className="w-4 h-4 text-[#45BA50] shrink-0" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium truncate mt-0.5">
                                {role === "client" ? `${tradeMeta.label} Pro` : "Client Account"}
                              </p>
                            </div>
                          </div>

                          {/* Status Chip */}
                          <span className={cx(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 tracking-wide",
                            statusChip.className
                          )}>
                            {statusChip.label}
                          </span>
                        </div>

                        {/* 2. Middle Content Box: Service Job Title & Trade Badge */}
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800/80 space-y-1">
                          <div className="flex items-center gap-2">
                            <div className={cx(
                              "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                              tradeMeta.bg,
                              tradeMeta.color
                            )}>
                              <TradeIcon className="w-3.5 h-3.5" />
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                              {contract.job_title || "Contract Agreement"}
                            </h4>
                          </div>

                          <div className="flex items-baseline justify-between pt-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                              Agreed Direct Budget
                            </span>
                            <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                              <span className="text-xs font-bold text-[#45BA50] mr-1">ETB</span>
                              {budgetNum}
                            </p>
                          </div>
                        </div>

                        {/* 3. Metadata Row: Contract ID & Creation Date */}
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-0.5 px-0.5">
                          <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 font-bold">
                            {displayId}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-medium">
                            <RiCalendarLine className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                            <span>
                              {contract.contract_created_at
                                ? new Date(contract.contract_created_at).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  })
                                : "Recent"}
                            </span>
                          </span>
                        </div>

                      </div>

                      {/* 4. Elegant Sixpay-Inspired Sparkline Curve (Dashboard Vibe) */}
                      <div className="relative w-full h-12 pointer-events-none my-1 opacity-40 group-hover:opacity-80 transition-opacity duration-300">
                        <svg
                          viewBox="0 0 240 40"
                          preserveAspectRatio="none"
                          className="w-full h-full"
                        >
                          <defs>
                            <linearGradient
                              id={`contract-spark-${index}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop offset="0%" stopColor={curveColor} stopOpacity="0.25" />
                              <stop offset="100%" stopColor={curveColor} stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d={isElectric ? "M0,26 Q30,10 60,20 T120,8 T180,24 T240,14 L240,40 L0,40 Z" : "M0,22 Q40,30 80,14 T140,20 T200,6 T240,16 L240,40 L0,40 Z"}
                            fill={`url(#contract-spark-${index})`}
                          />
                          <path
                            d={isElectric ? "M0,26 Q30,10 60,20 T120,8 T180,24 T240,14" : "M0,22 Q40,30 80,14 T140,20 T200,6 T240,16"}
                            fill="none"
                            stroke={curveColor}
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      {/* 5. Bottom Actions Area */}
                      <div className="relative z-10 pt-2 border-t border-slate-200/80 dark:border-zinc-800 space-y-2">
                        
                        {/* Primary Action Button Row */}
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/contracts/${contract.contract_id}`}
                            className={cx(
                              "flex-1 h-10 px-4 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs",
                              isPending
                                ? "bg-[#45BA50] hover:bg-[#3ca346] text-white font-black shadow-[0_2px_10px_rgba(69,186,80,0.3)]"
                                : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white border border-slate-200 dark:border-zinc-700"
                            )}
                          >
                            <span>
                              {isDraft
                                ? (role === "client" ? "Open Draft" : "Review Draft")
                                : isPending
                                ? "Review & Sign Agreement"
                                : "Manage Contract"}
                            </span>
                            <RiArrowRightLine className="w-3.5 h-3.5" />
                          </Link>

                          {/* Direct PDF Agreement Download Button */}
                          {contract.pdf_url && (
                            <button
                              type="button"
                              onClick={() => downloadContractPdf(contract.pdf_url, contract.contract_id)}
                              className="h-10 w-10 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 flex items-center justify-center active:scale-95 transition-all shrink-0 cursor-pointer shadow-xs"
                              title="Download Signed PDF Agreement"
                            >
                              <RiDownloadLine className="w-4 h-4 text-[#45BA50]" />
                            </button>
                          )}
                        </div>

                        {/* Contextual Action: Complete Direct Payment */}
                        {role === "client" && ["completed", "payment_pending"].includes(contract.job_status) && (
                          <Link
                            href={`/client/pay/${contract.job_id}`}
                            className="w-full h-9 rounded-xl bg-[#45BA50] hover:bg-[#3ca346] text-white text-xs font-black inline-flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                          >
                            <RiBankCardLine className="w-3.5 h-3.5" />
                            <span>Complete Direct Payment</span>
                          </Link>
                        )}

                        {/* Contextual Action: Rate Artisan */}
                        {canRatePartner && (
                          <Link
                            href={role === "client" ? `/client/rate/${contract.job_id}` : `/worker/rate/${contract.job_id}`}
                            className="w-full h-9 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all"
                          >
                            <RiStarFill className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{t("contracts.ratePartner") || "Rate Verified Artisan"}</span>
                          </Link>
                        )}

                        {/* Contextual Action: Open Dispute Resolution */}
                        {canOpenDispute && !isDisputed && (
                          <Link
                            href={`/${role}/disputes/new`}
                            className="w-full h-8 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-all"
                          >
                            <RiAlertLine className="w-3.5 h-3.5" />
                            <span>Report Issue / Open Dispute</span>
                          </Link>
                        )}

                        {/* Contextual Action: Active Dispute Notice */}
                        {isDisputed && (
                          <Link
                            href={`/${role}/disputes`}
                            className="w-full h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-[11px] font-bold inline-flex items-center justify-center gap-1 transition-all"
                          >
                            <RiAlertLine className="w-3.5 h-3.5" />
                            <span>{t("contracts.openResolution") || "View Dispute Resolution"}</span>
                          </Link>
                        )}

                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </section>
        ) : (
          /* Clean Empty State */
          <div className="rounded-3xl border border-dashed border-slate-200/80 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900/50 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400 dark:text-zinc-500 border border-slate-200/60 dark:border-zinc-700">
              <RiFolderOpenLine className="w-7 h-7 text-[#45BA50]" />
            </div>
            
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("contracts.emptyRepository") || "No Contracts Found"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                {searchQuery
                  ? `No agreements match your search "${searchQuery}". Try resetting filters.`
                  : "You do not have any agreements under this status tab in Dire Dawa."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2 rounded-full text-xs font-bold border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 cursor-pointer"
                >
                  Clear Search
                </button>
              )}

              {role === "client" && (
                <Link
                  href="/client/search"
                  className="px-4 py-2 rounded-full text-xs font-bold bg-[#45BA50] hover:bg-[#3ca346] text-white shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RiSearchLine className="w-3.5 h-3.5" />
                  <span>Discover Verified Artisans</span>
                </Link>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
