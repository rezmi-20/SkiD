"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

interface AdminDashboardContentProps {
  stats: {
    totalUsers: number;
    totalWorkers: number;
    pendingGigs: number;
    platformVolume: number;
  };
  unverifiedWorkers: any[];
}

export default function AdminDashboardContent({ stats, unverifiedWorkers }: AdminDashboardContentProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-full">
      {/* ── Admin Header ── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="flex flex-col gap-1">
          <p className="text-label-md uppercase tracking-[0.2em] text-primary opacity-80">
            System Overseer
          </p>
          <h1 className="text-[32px] md:text-[40px] font-bold text-on-surface leading-tight tracking-tight">
            Platform <span className="text-primary">Administration</span>
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-md">
            Holistic management of the DireSkill marketplace ecosystem.
          </p>
        </div>
      </header>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: "groups", color: "text-primary", bg: "bg-primary/10" },
          { label: "Total Workers", value: stats.totalWorkers, icon: "engineering", color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Pending Gigs", value: stats.pendingGigs, icon: "request_quote", color: "text-primary", bg: "bg-primary/10" },
          { label: "Volume (ETB)", value: stats.platformVolume.toLocaleString(), icon: "account_balance_wallet", color: "text-secondary", bg: "bg-secondary/10" },
        ].map((kpi, i) => (
          <div key={i} className="bg-surface-container-lowest border border-surface-container-highest p-6 rounded-[2rem] shadow-sm group hover:border-primary/20 transition-all">
             <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center ${kpi.color}`}>
                   <span className="material-symbols-outlined">{kpi.icon}</span>
                </div>
             </div>
             <p className="text-[28px] font-bold text-on-surface tracking-tighter">{kpi.value}</p>
             <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-widest opacity-60 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Pending Verifications */}
         <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
               <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant opacity-60">Identity Audits</h2>
               <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-label-sm font-bold">{unverifiedWorkers.length} Pending</span>
            </div>
            <div className="bg-surface-container-lowest border border-surface-container-highest rounded-[2.5rem] overflow-hidden shadow-sm">
               {unverifiedWorkers.length > 0 ? (
                  <div className="divide-y divide-surface-container">
                     {unverifiedWorkers.map((w) => (
                        <div key={w.user_id} className="p-5 flex items-center justify-between hover:bg-surface-container-low transition-all group">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center text-on-surface-variant font-bold">
                                 {w.full_name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                 <p className="text-label-md font-bold text-on-surface group-hover:text-primary transition-colors">{w.full_name}</p>
                                 <p className="text-body-sm text-on-surface-variant opacity-60">{w.email}</p>
                              </div>
                           </div>
                           <Link 
                             href={`/admin/verify/${w.user_id}`}
                             className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-xl text-on-surface-variant hover:bg-on-surface hover:text-surface-container-lowest transition-all"
                           >
                              <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
                           </Link>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="py-16 text-center text-on-surface-variant opacity-40">
                     <span className="material-symbols-outlined text-[48px] mb-2">verified</span>
                     <p className="text-body-md italic">No pending identity audits.</p>
                  </div>
               )}
            </div>
         </section>

         {/* Platform Alerts & Disputes */}
         <section className="space-y-4">
            <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant opacity-60 px-1">Platform Resolution</h2>
            <div className="bg-surface-container-low border border-dashed border-surface-container-highest rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center gap-4 h-[300px]">
               <span className="material-symbols-outlined text-on-surface-variant/20 text-[64px]">gavel</span>
               <p className="text-body-md text-on-surface-variant opacity-60 max-w-[200px]">
                  No active disputes or system alerts requiring intervention.
               </p>
            </div>
         </section>
      </div>
    </div>
  );
}
