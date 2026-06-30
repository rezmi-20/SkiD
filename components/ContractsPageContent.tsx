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
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "pending", label: "Pending" },
    { id: "completed", label: "Completed" },
    { id: "disputed", label: "Disputed" },
  ];

  const filteredContracts = contracts.filter((c) => {
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "active" && c.job_status === "active") ||
      (activeTab === "pending" && c.job_status === "pending") ||
      (activeTab === "completed" && c.job_status === "completed") ||
      (activeTab === "disputed" && c.job_status === "disputed");

    const matchesSearch = 
      c.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partner_name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-10 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── Page Header ── */}
      <header className="flex flex-col gap-6 px-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
             <span className="w-8 h-[2px] bg-primary"></span>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                Service Repository
             </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter leading-tight">
            My <span className="text-primary italic">Contracts</span>
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center overflow-x-auto no-scrollbar gap-2 p-1 bg-surface-container-low/50 rounded-3xl w-fit border border-surface-container-highest/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95
                ${activeTab === tab.id 
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                  : "text-on-surface-variant hover:text-on-surface"}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Filter & Search Bar ── */}
      <div className="flex flex-col md:flex-row gap-4 px-1">
        <div className="relative flex-grow group">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40 group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text"
            placeholder="Search by worker, client, or service type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-lowest border border-surface-container-highest text-on-surface rounded-[2rem] py-4 pl-14 pr-6 focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium shadow-sm"
          />
        </div>
        <button className="h-[60px] px-8 bg-surface-container-low border border-surface-container-highest rounded-[2rem] flex items-center justify-center gap-3 text-on-surface-variant hover:bg-surface-container transition-all active:scale-95 group">
           <span className="material-symbols-outlined text-[20px] group-hover:rotate-180 transition-transform duration-500">tune</span>
           <span className="text-xs font-black uppercase tracking-widest">Filter by Date</span>
        </button>
      </div>

      {/* ── Contracts Feed ── */}
      {filteredContracts.length > 0 ? (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredContracts.map((contract, index) => {
              const status = contract.job_status;
              const isCompleted = status === 'completed';
              const isDisputed = status === 'disputed';
              const isPending = !contract.signed_at;

              return (
                <motion.article 
                  key={contract.contract_id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-surface-container-lowest border border-surface-container-highest rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all group relative overflow-hidden"
                >
                  {/* Status Ribbon (Subtle Background) */}
                  <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-[40px] opacity-10 transition-opacity group-hover:opacity-20 ${getStatusColor(status)}`} />

                  {/* Partner Header */}
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                        {contract.partner_avatar ? (
                          <img src={contract.partner_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant opacity-40">person</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-xl font-black text-on-surface tracking-tighter leading-none group-hover:text-primary transition-colors">
                          {contract.partner_name}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mt-1">
                          {role === "client" ? "Verified Contractor" : "Client Member"}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${getStatusStyles(status)}`}>
                       {getStatusLabel(status, contract.signed_at)}
                    </div>
                  </div>

                  {/* Service Detail */}
                  <div className="space-y-1 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-30">Service Taxonomy</p>
                    <h4 className="text-lg font-bold text-on-surface leading-tight line-clamp-1 italic">{contract.job_title}</h4>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-6 py-6 border-y border-surface-container-highest/50 relative z-10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-30">Engagement</p>
                      <div className="flex items-center gap-2 text-on-surface font-bold text-xs">
                         <span className="material-symbols-outlined text-[16px] opacity-40">event</span>
                         {new Date(contract.contract_created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-30">
                        {role === "worker" ? "Net Earnings" : "Agreed Value"}
                      </p>
                      <div className="text-lg font-black text-on-surface tracking-tighter">
                        {contract.budget ? `${contract.budget.toLocaleString()} ETB` : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Action Stack */}
                  <div className="flex flex-col gap-3 relative z-10 mt-2">
                    <div className="flex gap-3">
                       <Link 
                          href={`/contracts/${contract.contract_id}`}
                          className="flex-grow h-14 bg-on-surface text-surface-container-lowest rounded-2xl flex items-center justify-center gap-3 hover:bg-primary hover:text-on-primary transition-all active:scale-95 shadow-xl shadow-black/10 group/btn"
                       >
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isPending ? "Review & Sign" : "View Details"}</span>
                          <span className="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                       </Link>
                       
                       {(contract.signed_at || contract.pdf_url) && (
                         <button className="w-14 h-14 bg-surface-container-high border border-surface-container-highest rounded-2xl flex items-center justify-center text-on-surface hover:bg-primary/10 hover:text-primary transition-all active:scale-95 group/down">
                            <span className="material-symbols-outlined group-hover/down:translate-y-0.5 transition-transform">download</span>
                         </button>
                       )}
                    </div>

                    {isCompleted && (
                      <Link
                        href={role === 'client' ? `/client/rate/${contract.job_id}` : `/worker/rate/${contract.job_id}`}
                        className="w-full h-14 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center gap-3 hover:bg-primary hover:text-on-primary transition-all active:scale-95 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/5"
                      >
                         <span className="material-symbols-outlined filled">star</span>
                         {role === 'client' ? 'Rate Professional' : 'Rate Client'}
                      </Link>
                    )}

                    {role === 'client' && status === 'completed' && contract.signed_at && (
                      <Link
                        href={`/client/pay/${contract.job_id}`}
                        className="w-full h-14 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl flex items-center justify-center gap-3 hover:bg-green-500 hover:text-white transition-all active:scale-95 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-green-500/10"
                      >
                        <span className="material-symbols-outlined filled">payments</span>
                        Complete Payment
                      </Link>
                    )}

                    {isDisputed && (
                      <button className="w-full h-14 bg-error/10 border border-error/20 text-error rounded-2xl flex items-center justify-center gap-3 hover:bg-error hover:text-on-error transition-all active:scale-95 font-black text-[10px] uppercase tracking-[0.2em]">
                         <span className="material-symbols-outlined">gavel</span>
                         Open Resolution
                      </button>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </section>
      ) : (
        /* Empty State */
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-32 flex flex-col items-center text-center gap-8 bg-surface-container-low/30 rounded-[3rem] border border-dashed border-surface-container-highest"
        >
          <div className="w-32 h-32 bg-surface-container-high rounded-full flex items-center justify-center relative">
             <span className="material-symbols-outlined text-[64px] text-on-surface-variant opacity-20">contract</span>
             <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-on-surface tracking-tight uppercase">Repository Empty</h3>
            <p className="text-on-surface-variant opacity-60 max-w-xs mx-auto text-sm leading-relaxed">
              No formal service agreements were found matching your current selection.
            </p>
          </div>
          <Link 
            href={role === "client" ? "/client/search" : "/worker/dashboard"}
            className="px-10 py-4 bg-primary text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-primary/20 transition-all active:scale-95"
          >
            {role === "client" ? "Explore Professionals" : "Visit Dashboard"}
          </Link>
        </motion.section>
      )}
    </div>
  );
}

function getStatusLabel(status: string, signedAt: string | null) {
  if (!signedAt) return "Pending Signature";
  switch (status) {
    case "active": return "In Progress";
    case "completed": return "Finalized";
    case "disputed": return "In Dispute";
    case "cancelled": return "Terminated";
    default: return status;
  }
}

function getStatusStyles(status: string) {
  switch (status) {
    case "active": return "bg-primary/10 text-primary border-primary/20";
    case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "disputed": return "bg-error/10 text-error border-error/20";
    case "cancelled": return "bg-on-surface-variant/10 text-on-surface-variant border-on-surface-variant/20";
    default: return "bg-secondary/10 text-secondary border-secondary/20";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "active": return "bg-primary";
    case "completed": return "bg-green-500";
    case "disputed": return "bg-error";
    default: return "bg-secondary";
  }
}
