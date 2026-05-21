"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useState } from "react";

interface ClientDashboardContentProps {
  userData: {
    fullName: string;
    firstName: string;
    avatarUrl: string | null;
    greeting: string;
  };
  activeContracts: any[];
  recentJobs: any[];
}

export default function ClientDashboardContent({ userData, activeContracts, recentJobs }: ClientDashboardContentProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-full">
      {/* ── Personalized Header ── */}
      <header className="flex items-start justify-between w-full px-1">
        <div className="flex flex-col gap-1">
          <p className="text-label-md uppercase tracking-[0.2em] text-primary opacity-80">
            {userData.greeting || (new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening')}
          </p>
          <h1 className="text-[32px] md:text-[40px] font-bold text-on-surface leading-tight tracking-tight">
            Welcome back, <br />
            <span className="text-primary truncate block">{userData.firstName || userData.fullName?.split(' ')[0]}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button className="w-11 h-11 flex items-center justify-center bg-surface-container rounded-full text-on-surface-variant hover:bg-surface-container-high transition-all border border-surface-container-highest shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
          </button>
          <Link href="/client/profile" className="w-11 h-11 rounded-full border border-surface-container-highest overflow-hidden active:scale-95 transition-all shadow-sm">
             {userData.avatarUrl ? (
               <img src={userData.avatarUrl} alt="" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                 <span className="material-symbols-outlined text-[22px]">person</span>
               </div>
             )}
          </Link>
        </div>
      </header>

      {/* ── Smart Search ── */}
      <div className="flex flex-col gap-4 w-full">
         <div className="relative group w-full">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-primary text-[22px]">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What service do you need today?"
              className="w-full h-16 pl-14 pr-32 bg-surface-container-low border border-surface-container-highest rounded-2xl text-on-surface text-body-lg placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
            />
            <button className="absolute right-2.5 top-2.5 bottom-2.5 px-6 bg-on-surface text-surface-container-lowest rounded-xl text-label-md uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-lg">
              Find Pros
            </button>
          </div>
      </div>

      {/* ── Quick Action Bento ── */}
      <div className="space-y-4">
        <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant opacity-60 ml-1">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "nav.discover", icon: "manage_search", href: "/client/search", label: "Discover" },
            { key: "nav.contracts", icon: "description", href: "/client/contracts", label: "Contracts" },
            { key: "nav.chat", icon: "chat_bubble", href: "/client/messages", label: "Chat" },
            { key: "nav.profile", icon: "person", href: "/client/profile", label: "Profile" },
          ].map((action) => (
            <Link 
              key={action.key}
              href={action.href}
              className="group flex flex-col items-start gap-4 p-5 bg-surface-container-lowest rounded-3xl border border-surface-container-highest hover:bg-surface-container transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-surface-container-low border border-surface-container-highest group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <span className="material-symbols-outlined text-[24px] text-primary">
                  {action.icon}
                </span>
              </div>
              <p className="text-label-md font-bold text-on-surface group-hover:text-primary transition-colors uppercase tracking-widest">
                {action.label}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Active Contracts ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant opacity-60">Active Contracts</h2>
          <Link href="/client/contracts" className="text-label-md text-primary uppercase tracking-widest hover:underline">All</Link>
        </div>
        
        {activeContracts.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar -mx-4 px-4">
            {activeContracts.map((contract) => (
              <Link 
                key={contract.id || contract.contract_id}
                href={`/contracts/${contract.id || contract.contract_id}`}
                className="flex-shrink-0 w-80 p-6 bg-surface-container-lowest rounded-[2rem] border border-surface-container-highest snap-start hover:border-primary/30 transition-colors shadow-sm group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-surface-container-high border border-surface-container-highest">
                    {contract.worker_avatar || contract.partner_avatar ? (
                      <img src={contract.worker_avatar || contract.partner_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                        {contract.worker_name?.[0] || contract.partner_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-label-sm uppercase tracking-widest">
                    Active
                  </div>
                </div>
                <h3 className="text-headline-md text-on-surface group-hover:text-primary transition-colors mb-1 line-clamp-1">{contract.job_title}</h3>
                <p className="text-body-md text-on-surface-variant mb-4">{contract.worker_name || contract.partner_name}</p>
                <div className="pt-4 border-t border-surface-container-highest flex items-center justify-between">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Budget</span>
                  <span className="text-headline-md text-on-surface">{contract.budget} ETB</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mx-1 p-10 rounded-[2rem] bg-surface-container-lowest border border-dashed border-surface-container-highest text-center shadow-sm">
            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
               <span className="material-symbols-outlined text-on-surface-variant/40">description</span>
            </div>
            <p className="text-body-md italic text-on-surface-variant opacity-60 max-w-xs mx-auto">
               You don't have any service agreements yet. Start by finding a professional.
            </p>
          </div>
        )}
      </div>

      {/* ── Recent Activity ── */}
      <div className="space-y-4">
        <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant opacity-60 ml-1">Recent Activity</h2>
        <div className="rounded-[2rem] bg-surface-container-lowest border border-surface-container-highest p-6 shadow-sm">
          {recentJobs.length > 0 ? (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-5 group last:mb-0">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-low flex items-center justify-center shrink-0 border border-surface-container-highest group-hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-[20px]">history</span>
                  </div>
                  <div className="flex-grow min-w-0 border-b border-surface-container-highest pb-4 group-last:border-0 group-last:pb-0">
                    <p className="text-body-lg font-bold text-on-surface line-clamp-1">{job.title}</p>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">{new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-label-md italic text-on-surface-variant opacity-50 uppercase tracking-widest">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
