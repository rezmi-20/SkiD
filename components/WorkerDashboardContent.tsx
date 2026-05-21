"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { motion } from "framer-motion";

interface WorkerDashboardContentProps {
  worker: {
    fullName: string;
    firstName: string;
    isVerified: boolean;
    district: string;
    skills: string[];
  };
  stats: {
    activeJobs: number;
    completedJobs: number;
    revenue: number;
  };
  recentJobs: any[];
  greeting: string;
}

export default function WorkerDashboardContent({ worker, stats, recentJobs, greeting }: WorkerDashboardContentProps) {
  const { t } = useLanguage();

  const quickActions = [
    { label: "Update Profile", icon: "person_edit", href: "/worker/profile" },
    { label: "Browse Gigs", icon: "explore", href: "/worker/gigs" },
    { label: "Contracts", icon: "description", href: "/worker/contracts" },
    { label: "Reviews", icon: "star", href: "/worker/reviews" },
    { label: "Community", icon: "forum", href: "/community" },
  ];

  const performance = [
    { label: "Completion Rate", value: "98%", icon: "verified" },
    { label: "Response Time", value: "< 2 hrs", icon: "timer" },
    { label: "Top Skill", value: worker.skills[0] || "General", icon: "bolt" },
  ];

  return (
    <div className="flex flex-col gap-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-xl mx-auto">
      
      {/* 1. Top Header */}
      <header className="flex items-center justify-between px-1">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-on-surface tracking-tight">
              {greeting}, <span className="text-primary">{worker.firstName}</span>
            </h1>
            {worker.isVerified && (
              <span className="material-symbols-outlined text-primary text-[20px] filled">verified</span>
            )}
          </div>
          <p className="text-body-sm text-on-surface-variant font-medium opacity-60">
            Professional • {worker.district}
          </p>
        </div>
        <button className="relative w-12 h-12 bg-surface-container border border-surface-container-highest rounded-2xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-[24px]">notifications</span>
          <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-surface-container shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"></span>
        </button>
      </header>

      {/* 2. Earnings Summary Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden bg-surface-container border border-surface-container-highest rounded-[2.5rem] p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40">Monthly Earnings</p>
              <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-black text-on-surface tracking-tighter">
                   {stats.revenue.toLocaleString()}
                 </span>
                 <span className="text-lg font-black text-on-surface-variant opacity-30">ETB</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
               <div className="flex items-center gap-1 text-primary font-black text-[11px] uppercase tracking-widest">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  +12%
               </div>
               <p className="text-[9px] text-on-surface-variant font-bold opacity-30 uppercase">Vs Last Month</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-surface-container-highest/50">
             <div className="space-y-0.5">
                <p className="text-[10px] font-black text-on-surface-variant opacity-30 uppercase tracking-widest">Completed Jobs</p>
                <p className="text-xl font-black text-on-surface">{stats.completedJobs}</p>
             </div>
             <div className="space-y-0.5 text-right">
                <p className="text-[10px] font-black text-on-surface-variant opacity-30 uppercase tracking-widest">Average Rating</p>
                <div className="flex items-center justify-end gap-1">
                   <span className="text-xl font-black text-on-surface">4.9</span>
                   <span className="material-symbols-outlined text-primary text-[18px] filled">star</span>
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Active & Pending Contracts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant opacity-60">Ongoing Engagements</h2>
          <Link href="/worker/contracts" className="text-label-sm text-primary font-black uppercase tracking-widest hover:underline">Full Hub</Link>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 px-1 no-scrollbar snap-x">
          {recentJobs.filter(j => j.status === 'active').length > 0 ? (
            recentJobs.filter(j => j.status === 'active').map((job) => (
              <div key={job.id} className="min-w-[280px] bg-[#1a1c1e] border border-zinc-800 p-6 rounded-[2.5rem] snap-center flex flex-col justify-between h-[180px] shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-green-400/10 text-green-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-400/20">Ongoing</span>
                    <p className="text-headline-md font-bold text-white">5k <span className="text-[10px] opacity-40">ETB</span></p>
                  </div>
                  <h3 className="text-headline-md font-bold text-white line-clamp-1 mt-3">{job.title}</h3>
                  <p className="text-body-sm text-zinc-500 font-medium">Abebe K. • Kezira</p>
                </div>
                <button className="w-full h-11 bg-green-400 text-black rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-green-400/20">
                  Manage Contract
                </button>
              </div>
            ))
          ) : (
            <div className="w-full py-12 bg-surface-container-low border border-dashed border-surface-container-highest rounded-[2.5rem] flex flex-col items-center justify-center text-center px-6">
               <span className="material-symbols-outlined text-on-surface-variant opacity-20 text-[32px] mb-2">pending_actions</span>
               <p className="text-body-sm text-on-surface-variant font-medium opacity-40">No active engagements indexed.</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. New Job Requests */}
      <section className="space-y-4">
        <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant opacity-60 px-1">Market Opportunities</h2>
        <div className="space-y-3">
          {recentJobs.filter(j => j.status === 'pending').map((job) => (
            <div key={job.id} className="bg-surface-container-lowest border border-surface-container-highest/40 rounded-3xl p-5 flex flex-col gap-4 hover:border-primary/20 transition-all shadow-sm">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-body-md font-bold text-on-surface">{job.title}</h3>
                    <div className="flex items-center gap-2 text-label-sm text-on-surface-variant opacity-60">
                       <span className="material-symbols-outlined text-[14px]">location_on</span>
                       Sabian • 2km away
                    </div>
                  </div>
                  <p className="text-headline-md font-black text-primary">800 <span className="text-[10px] opacity-60">ETB</span></p>
               </div>
               <div className="flex gap-2 mt-1">
                  <button className="flex-1 h-11 bg-primary text-on-primary rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all">Accept Offer</button>
                  <button className="px-5 h-11 bg-surface-container-highest text-on-surface-variant rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all">Details</button>
               </div>
            </div>
          ))}
          {recentJobs.filter(j => j.status === 'pending').length === 0 && (
             <p className="text-center py-6 text-body-sm text-on-surface-variant opacity-40 font-medium italic">Scanning for new district requests...</p>
          )}
        </div>
      </section>

      {/* 5. Quick Actions */}
      <section className="space-y-4">
         <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant opacity-60 px-1">Navigation Grid</h2>
         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => (
               <Link 
                key={action.label} 
                href={action.href}
                className="flex flex-col items-center justify-center gap-3 p-5 bg-surface-container-low border border-surface-container-highest/40 rounded-[2rem] hover:bg-surface-container-high transition-all group"
               >
                  <div className="w-12 h-12 bg-surface-container-highest rounded-2xl flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-all">
                     <span className="material-symbols-outlined text-[24px]">{action.icon}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60 text-center">{action.label}</span>
               </Link>
            ))}
         </div>
      </section>

      {/* 6. Performance Stats */}
      <section className="space-y-4">
         <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant opacity-60 px-1">Analytical Overview</h2>
         <div className="grid grid-cols-3 gap-3">
            {performance.map((p) => (
               <div key={p.label} className="bg-surface-container border border-surface-container-highest/50 p-5 rounded-[2rem] flex flex-col items-center gap-3 shadow-inner">
                  <span className="material-symbols-outlined text-primary text-[20px] opacity-60">{p.icon}</span>
                  <div className="text-center">
                    <p className="text-xl font-black text-on-surface tracking-tight">{p.value}</p>
                    <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-30 mt-0.5">{p.label}</p>
                  </div>
               </div>
            ))}
         </div>
      </section>

    </div>
  );
}
