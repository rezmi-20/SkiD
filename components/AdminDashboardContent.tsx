"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useTransition } from "react";
import { toggleWorkerVerification } from "@/lib/actions/admin";
import { authClient } from "@/lib/auth/client";

interface AdminDashboardContentProps {
  adminName: string;
  stats: {
    totalWorkers: number;
    pendingVerifications: number;
    activeContracts: number;
    completedJobsThisMonth: number;
    totalDisputes: number;
  };
  unverifiedWorkers: any[];
  activityFeed: any[];
}

export default function AdminDashboardContent({ 
  adminName, 
  stats, 
  unverifiedWorkers: initialWorkers, 
  activityFeed 
}: AdminDashboardContentProps) {
  const { t } = useLanguage();
  const [workers, setWorkers] = useState(initialWorkers);
  const [isPending, startTransition] = useTransition();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  const handleAction = async (userId: string, approve: boolean) => {
    startTransition(async () => {
      const result = await toggleWorkerVerification(userId, approve);
      if (result.success) {
        setWorkers(prev => prev.filter(w => w.user_id !== userId));
      } else {
        alert("Failed to update status");
      }
    });
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-full pb-20">
      
      {/* ── Top Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 px-3 py-1 rounded-full">
                Command Center
             </span>
             <span className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">
                {currentDate}
             </span>
          </div>
          <h1 className="text-[32px] md:text-[48px] font-black text-on-surface leading-tight tracking-tighter">
            Welcome, <span className="text-primary italic">{adminName}</span>
          </h1>
        </div>

        <button 
          onClick={async () => {
            try {
              // 1. Ask Neon to revoke the session server-side
              await authClient.signOut();
            } catch (_) {}
            // 2. Force-clear all cookies via our server route
            await fetch("/api/auth/sign-out", { method: "POST", credentials: "include" });
            // 3. Hard-navigate to login with logout flag to skip session re-check
            window.location.href = "/login?logout=1";
          }}
          className="flex items-center gap-3 px-6 py-3 bg-surface-container-high border border-surface-container-highest rounded-2xl text-secondary hover:bg-secondary hover:text-on-secondary transition-all group active:scale-95"
        >
          <span className="text-xs font-black uppercase tracking-[0.2em]">Exit System</span>
          <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">logout</span>
        </button>
      </header>

      {/* ── Overview Statistics Cards (Top Row) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Workers", value: stats.totalWorkers, icon: "engineering", color: "text-primary", bg: "bg-primary/10" },
          { label: "Pending Fayda", value: stats.pendingVerifications, icon: "fingerprint", color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Active Contracts", value: stats.activeContracts, icon: "description", color: "text-primary", bg: "bg-primary/10" },
          { label: "Jobs This Month", value: stats.completedJobsThisMonth, icon: "task_alt", color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Total Disputes", value: stats.totalDisputes, icon: "gavel", color: "text-error", bg: "bg-error/10" },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface-container-lowest border border-surface-container-highest/50 p-6 rounded-[2rem] shadow-sm group hover:border-primary/30 transition-all relative overflow-hidden"
          >
             <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${kpi.color}`}>
                <span className="material-symbols-outlined text-[48px]">{kpi.icon}</span>
             </div>
             <p className="text-[32px] font-black text-on-surface tracking-tighter relative z-10">{kpi.value}</p>
             <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em] opacity-50 mt-1 relative z-10">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         
         {/* ── Pending Worker Verifications (Main Column) ── */}
         <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-1">
               <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">verified_user</span>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface">Identity Audit Queue</h2>
               </div>
               <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {workers.length} Pending
               </span>
            </div>

            <div className="bg-surface-container-lowest border border-surface-container-highest rounded-[2.5rem] overflow-hidden shadow-xl border-opacity-50">
               {workers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low/50">
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Worker</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Contact / Skills</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Fayda ID</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container">
                        <AnimatePresence mode="popLayout">
                          {workers.map((w) => (
                            <motion.tr 
                              key={w.user_id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="group hover:bg-surface-container-low transition-colors"
                            >
                              <td className="p-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-surface-container-highest flex items-center justify-center text-primary font-black shadow-inner overflow-hidden">
                                    {w.avatar_url ? (
                                      <img src={w.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      w.full_name.charAt(0)
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <p className="font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">
                                      {w.full_name}
                                    </p>
                                    <p className="text-[10px] font-bold text-on-surface-variant opacity-60 uppercase tracking-widest">
                                      ID: {w.user_id.slice(0, 8)}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-6">
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-[16px]">call</span>
                                    <span className="text-xs font-bold">{w.phone || "No Phone"}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {w.skills?.slice(0, 2).map((s: string) => (
                                      <span key={s} className="px-2 py-0.5 bg-surface-container-highest rounded text-[9px] font-black uppercase tracking-tighter opacity-70">
                                        {s}
                                      </span>
                                    ))}
                                    {w.skills?.length > 2 && <span className="text-[9px] font-black opacity-30">+{w.skills.length - 2}</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="p-6">
                                <button 
                                  onClick={() => setPreviewImage(w.fayda_doc_url)}
                                  className="w-20 h-12 bg-black rounded-xl border border-white/5 overflow-hidden relative group/id active:scale-95 transition-transform"
                                >
                                  {w.fayda_doc_url ? (
                                    <>
                                      <img src={w.fayda_doc_url} alt="ID" className="w-full h-full object-cover opacity-50 group-hover/id:opacity-80 transition-opacity grayscale group-hover/id:grayscale-0" />
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/id:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-white text-[18px]">zoom_in</span>
                                      </div>
                                    </>
                                  ) : (
                                    <span className="material-symbols-outlined text-on-surface-variant opacity-20">no_photography</span>
                                  )}
                                </button>
                              </td>
                              <td className="p-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => handleAction(w.user_id, true)}
                                    disabled={isPending}
                                    className="w-10 h-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center shadow-lg shadow-primary/5 active:scale-90 disabled:opacity-50"
                                    title="Approve Worker"
                                  >
                                    <span className="material-symbols-outlined text-[20px] font-bold">check_circle</span>
                                  </button>
                                  <button 
                                    onClick={() => handleAction(w.user_id, false)}
                                    disabled={isPending}
                                    className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-on-secondary transition-all flex items-center justify-center shadow-lg shadow-secondary/5 active:scale-90 disabled:opacity-50"
                                    title="Reject Worker"
                                  >
                                    <span className="material-symbols-outlined text-[20px] font-bold">cancel</span>
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
               ) : (
                  <div className="py-24 text-center space-y-4">
                     <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                        <span className="material-symbols-outlined text-primary text-[40px] animate-pulse">verified</span>
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-black text-on-surface uppercase tracking-widest">Queue Clear</p>
                        <p className="text-xs text-on-surface-variant opacity-40">All pending identities have been audited.</p>
                     </div>
                  </div>
               )}
            </div>
         </section>

         {/* ── Side Actions & Activity ── */}
         <aside className="space-y-8">
            
            {/* Quick Actions */}
            <section className="space-y-4">
               <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 px-1">Quick Actions</h2>
               <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Verify Workers", icon: "how_to_reg", color: "bg-primary text-on-primary" },
                    { label: "Disputes", icon: "gavel", color: "bg-surface-container-high text-on-surface" },
                    { label: "Reports", icon: "bar_chart", color: "bg-surface-container-high text-on-surface" },
                    { label: "Settings", icon: "settings", color: "bg-surface-container-high text-on-surface" },
                  ].map((btn, i) => (
                    <button 
                      key={i}
                      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-[2rem] border border-surface-container-highest transition-all hover:scale-105 active:scale-95 ${btn.color}`}
                    >
                      <span className="material-symbols-outlined text-[24px]">{btn.icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-center">{btn.label}</span>
                    </button>
                  ))}
               </div>
            </section>

            {/* Activity Feed */}
            <section className="space-y-4">
               <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 px-1">Recent Activity</h2>
               <div className="bg-surface-container-low border border-surface-container-highest rounded-[2.5rem] p-6 space-y-6">
                  {activityFeed.length > 0 ? (
                    <div className="space-y-6 relative">
                       {/* Timeline Line */}
                       <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-surface-container-highest" />
                       
                       {activityFeed.map((item, i) => (
                         <div key={i} className="flex gap-4 relative z-10">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-surface-container-low ${
                              item.type === 'user_signup' ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary'
                            }`}>
                               <span className="material-symbols-outlined text-[14px]">
                                 {item.type === 'user_signup' ? 'person_add' : 'work'}
                               </span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                               <p className="text-[11px] font-black text-on-surface tracking-tight leading-tight">
                                  {item.type === 'user_signup' ? 'New Registration' : 'Job Posted'}
                               </p>
                               <p className="text-[10px] text-on-surface-variant opacity-60 font-medium truncate max-w-[150px]">
                                  {item.title}
                               </p>
                               <p className="text-[9px] text-on-surface-variant opacity-30 font-black uppercase tracking-tighter mt-0.5">
                                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </p>
                            </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <p className="text-[10px] italic text-on-surface-variant opacity-40 text-center py-4">No recent activity detected.</p>
                  )}
                  <button className="w-full py-3 rounded-xl border border-surface-container-highest text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high transition-colors">
                     View All logs
                  </button>
               </div>
            </section>
         </aside>
      </div>

      {/* ── Image Preview Modal ── */}
      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-20 bg-black/90 backdrop-blur-xl"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-5xl w-full h-full flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">fingerprint</span>
                    <h3 className="text-xl font-black text-white uppercase tracking-[0.2em]">Credential Audit</h3>
                 </div>
                 <button 
                  onClick={() => setPreviewImage(null)}
                  className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                 >
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>
              <div className="flex-grow bg-white/5 rounded-[3rem] overflow-hidden border border-white/10 relative shadow-2xl group">
                 <img src={previewImage} alt="Identity Document" className="w-full h-full object-contain" />
                 <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/80 to-transparent flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Confidential Platform Data • Encrypted Access</p>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
