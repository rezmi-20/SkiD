"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  contracts: any[];
  role: "client" | "worker";
}

export default function ContractsPageContent({ contracts, role }: Props) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "all", label: t("contracts.all") },
    { id: "active", label: t("contracts.active") },
    { id: "pending", label: t("contracts.pending") },
    { id: "completed", label: t("contracts.completed") },
  ];

  const filteredContracts = contracts.filter((c) => {
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "active" && c.job_status === "active") ||
      (activeTab === "pending" && c.job_status === "pending") ||
      (activeTab === "completed" && c.job_status === "completed");

    const matchesSearch = 
      c.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partner_name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-8 pb-32 md:pb-8">
      {/* ── Header Section ── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-headline-lg text-on-background tracking-tight">
            {t("contracts.title")}
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-xl">
            {role === "client" 
              ? "Manage your active agreements, review pending terms, and track payment milestones." 
              : "Track your professional service agreements and manage upcoming deliverables."}
          </p>
        </div>

        {/* Filters - Improved spacing and visibility */}
        <div className="flex items-center overflow-x-auto no-scrollbar gap-3 pb-2 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap px-6 py-2.5 rounded-full text-label-md font-bold transition-all active:scale-95 shadow-sm
                ${activeTab === tab.id 
                  ? "bg-on-surface text-surface-container-lowest" 
                  : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface border border-surface-container-highest"}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Search Bar ── */}
      <div className="relative group max-w-2xl">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
        <input 
          type="text"
          placeholder={t("contracts.search_placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-container-low border border-surface-container-highest focus:ring-2 focus:ring-primary/20 text-on-surface rounded-2xl py-4 pl-12 pr-4 transition-all group-hover:bg-surface-container-high placeholder:text-on-surface-variant/50 outline-none"
        />
      </div>

      {/* ── Contracts Grid (Bento Style) ── */}
      {filteredContracts.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredContracts.map((contract, index) => {
              const isHighlight = contract.job_status === 'active';
              return (
                <motion.article 
                  key={contract.contract_id || contract.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    rounded-2xl shadow-sm p-6 flex flex-col gap-4 border transition-all duration-300 relative overflow-hidden group
                    ${isHighlight 
                      ? "bg-[#1a1c1e] border-zinc-800 shadow-xl" 
                      : "bg-surface-container-lowest border-surface-container-highest hover:shadow-md"}
                  `}
                >
                  {/* Top accent line (only for non-highlight cards) */}
                  {!isHighlight && (
                    <div className={`absolute top-0 left-0 w-full h-1 ${
                      contract.job_status === 'active' ? 'bg-primary-container' : 
                      contract.job_status === 'pending' ? 'bg-secondary-container' : 
                      'bg-surface-container-high'
                    }`} />
                  )}
  
                  <div className="flex justify-between items-start w-full relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center shrink-0 ${isHighlight ? "border-zinc-700 bg-zinc-800" : "border-surface bg-surface-container-high"}`}>
                        {contract.partner_avatar ? (
                          <img 
                            src={contract.partner_avatar} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className={`material-symbols-outlined ${isHighlight ? "text-zinc-500" : "text-on-surface-variant"}`}>person</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-headline-md leading-tight truncate w-32 md:w-40 ${isHighlight ? "text-white" : "text-on-surface"}`}>
                          {contract.partner_name}
                        </span>
                        <span className={`text-label-md font-normal ${isHighlight ? "text-zinc-500" : "text-on-surface-variant"}`}>
                          {role === "client" ? "Contractor" : "Client"}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full flex items-center gap-1.5 border font-bold ${
                      isHighlight 
                        ? "bg-green-400/10 text-green-400 border-green-400/30" 
                        : getStatusStyles(contract.job_status)
                    }`}>
                      {contract.job_status === 'active' && <span className="material-symbols-outlined text-[14px] filled">check_circle</span>}
                      <span className="text-label-sm uppercase tracking-widest">{getStatusLabel(contract.job_status, t)}</span>
                    </div>
                  </div>
  
                  <div className="flex flex-col gap-1 mt-2 relative z-10">
                    <span className={`text-label-sm uppercase tracking-widest ${isHighlight ? "text-zinc-600" : "text-outline"}`}>Service Category</span>
                    <span className={`text-body-lg font-bold line-clamp-1 ${isHighlight ? "text-zinc-300" : "text-on-background"}`}>{contract.job_title}</span>
                  </div>
  
                  <div className={`grid grid-cols-2 gap-4 py-4 border-y relative z-10 ${isHighlight ? "border-zinc-800/50" : "border-surface-container"}`}>
                    <div className="flex flex-col gap-1">
                      <span className={`text-label-sm ${isHighlight ? "text-zinc-600" : "text-outline"}`}>Timeline</span>
                      <span className={`text-body-md flex items-center gap-1 ${isHighlight ? "text-zinc-400" : "text-on-surface"}`}>
                        <span className="material-symbols-outlined text-[16px] opacity-60">calendar_today</span>
                        {new Date(contract.contract_created_at || contract.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - Nov 15
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`text-label-sm ${isHighlight ? "text-zinc-600" : "text-outline"}`}>Contract Value</span>
                      <span className={`text-headline-md ${isHighlight ? "text-white" : "text-on-background"}`}>
                        {contract.budget ? `${contract.budget.toLocaleString()} ETB` : "---"}
                      </span>
                    </div>
                  </div>
  
                  <div className="flex flex-col gap-2 mt-2 relative z-10">
                    <button className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl text-label-md font-black uppercase tracking-widest transition-all active:scale-95 ${
                      isHighlight 
                        ? "bg-green-400 text-black shadow-lg shadow-green-400/20" 
                        : "bg-on-surface text-surface-container-lowest hover:opacity-90"
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">{isHighlight ? "download" : "visibility"}</span>
                      {isHighlight ? "Download PDF" : "View Details"}
                    </button>
                    {!isHighlight && (
                      <Link 
                        href={`/contracts/${contract.contract_id || contract.id}`}
                        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-surface-container text-on-surface border border-surface-container-highest hover:bg-surface-container-high transition-colors text-label-md"
                      >
                        Full Management
                      </Link>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </section>
      ) : (
        /* Empty State */
        <section className="mt-8 pt-8 border-t border-surface-container">
          <div className="w-full bg-surface-container-lowest border border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center py-[80px] px-8 text-center shadow-sm">
            <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant opacity-50">draft</span>
            </div>
            <h3 className="text-headline-lg text-on-background mb-2">No contracts found</h3>
            <p className="text-body-md text-on-surface-variant max-w-md mx-auto mb-8">
              You don't have any active or pending contracts matching your current filters.
            </p>
            <Link 
              href={role === "client" ? "/client/search" : "/worker/dashboard"}
              className="px-8 py-3 rounded-full bg-primary text-on-primary text-body-md font-bold hover:shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              {role === "client" ? "Find a Professional" : "Go to Dashboard"}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function getStatusLabel(status: string, t: any) {
  switch (status) {
    case "pending": return "Pending";
    case "active": return "Signed";
    case "completed": return "Completed";
    case "disputed": return "Disputed";
    default: return status;
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "active": return "bg-primary-container/20 text-on-primary-container border-primary-container/30";
    case "pending": return "bg-secondary-container/30 text-on-secondary-container border-secondary-container/50";
    case "completed": return "bg-surface-container text-on-surface border-surface-container-highest";
    case "disputed": return "bg-error-container text-on-error-container border-error/30";
    default: return "bg-surface-container text-on-surface border-surface-container-highest";
  }
}
