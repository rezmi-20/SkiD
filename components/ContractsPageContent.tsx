"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface Contract {
  contract_id: string;
  signed_at: string | null;
  pdf_url: string | null;
  contract_created_at: string;
  job_id: string;
  job_title: string;
  job_status: string;
  budget: number;
  partner_name: string;
  partner_avatar: string | null;
  partner_verified?: boolean;
}

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
      c.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partner_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusConfig = (contract: Contract) => {
    if (contract.job_status === "disputed") {
      return { 
        label: t("contracts.status.disputed"), 
        color: "bg-error-container text-on-error-container border-error-container",
        barColor: "bg-error",
        icon: "gavel"
      };
    }
    if (contract.job_status === "completed") {
      return { 
        label: t("contracts.status.completed"), 
        color: "bg-primary-container/20 text-on-primary-container border-primary-container/30",
        barColor: "bg-primary",
        icon: "check_circle"
      };
    }
    if (!contract.signed_at) {
      return { 
        label: t("contracts.status.pending_signature"), 
        color: "bg-secondary-container/50 text-on-secondary-container border-secondary-container/80",
        barColor: "bg-secondary",
        icon: "schedule"
      };
    }
    return { 
      label: t("contracts.status.signed"), 
      color: "bg-primary-container/20 text-on-primary-container border-primary-container/30",
      barColor: "bg-primary",
      icon: "verified"
    };
  };

  return (
    <div className="flex flex-col gap-12 max-w-7xl mx-auto px-4 py-8">
      {/* ── Header Section ── */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-5xl font-black text-on-background tracking-tight">
            {t("contracts.title")}
          </h1>
          <p className="text-base text-text-med font-medium">
            {role === "client" 
              ? "Manage your active agreements, review pending terms, and track payment milestones." 
              : "Track your active assignments, signed documents, and completion status."}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center overflow-x-auto no-scrollbar gap-3 pb-1 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all active:scale-95 shadow-sm ${
                activeTab === tab.id
                  ? "bg-text-high text-background"
                  : "bg-surface-container text-text-med hover:bg-surface-container-high hover:text-text-high"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Search Bar ── */}
      <div className="relative group max-w-md">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-med text-[20px] group-focus-within:text-primary-accent transition-colors">search</span>
        <input
          type="text"
          placeholder={t("contracts.search_placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-6 py-4 rounded-2xl bg-surface-container border-none focus:ring-2 focus:ring-primary-accent/20 text-sm font-medium text-text-high placeholder:text-text-med transition-all"
        />
      </div>

      {/* ── Contracts Grid ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        <AnimatePresence mode="popLayout">
          {filteredContracts.map((contract) => {
            const status = getStatusConfig(contract);
            return (
              <motion.article
                key={contract.contract_id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface-container-lowest rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-8 flex flex-col gap-6 border border-border transition-all duration-300 relative overflow-hidden group hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
              >
                {/* Top Status Bar */}
                <div className={`absolute top-0 left-0 w-full h-1.5 ${status.barColor}`}></div>
                
                <div className="flex justify-between items-start w-full">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {contract.partner_avatar ? (
                        <img 
                          src={contract.partner_avatar} 
                          alt={contract.partner_name} 
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-background" 
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center border-2 border-background">
                           <span className="material-symbols-outlined text-text-med text-[24px]">
                             {role === "client" ? "person" : "corporate_fare"}
                           </span>
                        </div>
                      )}
                      {contract.partner_verified && (
                        <div className="absolute -bottom-1 -right-1 bg-primary-accent text-background p-0.5 rounded-lg border-2 border-background">
                          <span className="material-symbols-outlined text-[10px] filled">verified</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-text-high leading-tight truncate max-w-[140px]">{contract.partner_name}</span>
                      <span className="text-xs font-bold text-text-med uppercase tracking-wider">{role === "client" ? "Worker" : "Client"}</span>
                    </div>
                  </div>

                  <div className={`px-3 py-1.5 rounded-full ${status.color} flex items-center gap-1.5 border`}>
                    <span className="material-symbols-outlined text-[14px]">{status.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-wider">{status.label}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-text-med uppercase tracking-widest">Service Category</span>
                  <span className="text-lg font-black text-text-high tracking-tight">{contract.job_title}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-text-med uppercase tracking-widest">Initiation Date</span>
                    <span className="text-xs font-bold text-text-high flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px] text-text-med">calendar_today</span>
                      {new Date(contract.contract_created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[9px] font-black text-text-med uppercase tracking-widest">Total Value</span>
                    <span className="text-xl font-black text-text-high">{contract.budget.toLocaleString()} ETB</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Link
                    href={`/contracts/${contract.contract_id}`}
                    className="flex-1 px-4 py-3 rounded-2xl bg-surface-container text-text-high border border-border hover:bg-surface-container-high transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    View
                  </Link>
                  {contract.pdf_url ? (
                    <a
                      href={contract.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-3 rounded-2xl bg-text-high text-background hover:opacity-90 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      PDF
                    </a>
                  ) : (
                    <button className="flex-1 px-4 py-3 rounded-2xl bg-surface-container text-text-med opacity-50 cursor-not-allowed text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2" disabled>
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      PDF
                    </button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </section>

      {/* ── Empty State ── */}
      {filteredContracts.length === 0 && (
        <section className="mt-8 pt-8 border-t border-border">
          <div className="w-full bg-surface-container-lowest border border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center py-24 px-6 text-center shadow-sm">
            <div className="w-24 h-24 rounded-[2rem] bg-surface-container-low flex items-center justify-center mb-8 shadow-inner">
              <span className="material-symbols-outlined text-[48px] text-text-med opacity-30">draft</span>
            </div>
            <h3 className="text-2xl font-black text-text-high mb-2 tracking-tight">{t("contracts.empty_title")}</h3>
            <p className="text-sm text-text-med font-medium max-w-sm mx-auto mb-10 leading-relaxed">
              {t("contracts.empty_desc")}
            </p>
            <Link
              href={role === "client" ? "/client/search" : "/worker/dashboard"}
              className="px-10 py-4 rounded-2xl bg-primary-accent text-background text-sm font-black uppercase tracking-widest hover:shadow-lg hover:shadow-primary-accent/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              {role === "client" ? t("contracts.cta_worker") : t("nav.dashboard")}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
