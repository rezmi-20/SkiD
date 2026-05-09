"use client";

import { useLanguage } from "@/context/LanguageContext";
import { authClient } from "@/lib/auth/client";
import Link from "next/link";

interface ProfileContentProps {
  user: {
    name: string;
    email: string;
    role: "client" | "worker";
    initials: string;
  };
  stats: {
    label: string;
    value: string;
  }[];
  menuGroups: {
    group: string;
    items: {
      label: string;
      subtitle: string;
      icon: string;
      link?: string;
      onClick?: () => void;
      isLoading?: boolean;
      isSuccess?: boolean;
    }[];
  }[];
  skills?: string[];
}

export default function ProfileContent({ user, stats, menuGroups, skills }: ProfileContentProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-full">
      {/* ── Profile Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-1">
        <div className="flex items-center gap-6">
          <div className="relative shrink-0">
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] bg-surface-container-high border-4 border-surface shadow-xl flex items-center justify-center">
                <span className="text-4xl md:text-5xl font-bold text-primary tracking-tighter">{user.initials}</span>
             </div>
             <div className="absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-primary text-on-primary rounded-full border-4 border-surface-container-lowest flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-[18px] md:text-[22px] filled">verified</span>
             </div>
          </div>
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-3">
                <h1 className="text-[28px] md:text-[36px] font-bold text-on-surface leading-tight tracking-tight">
                   {user.name}
                </h1>
                {(user as any).is_verified && (
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-primary text-on-primary rounded-full shadow-lg shadow-primary/20 scale-90 md:scale-100">
                      <span className="material-symbols-outlined text-[16px] filled">verified</span>
                      <span className="text-[9px] font-black uppercase tracking-widest">Verified Identity</span>
                   </div>
                )}
             </div>
             <p className="text-body-md text-on-surface-variant opacity-60 font-medium">{user.email}</p>
             <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-4 py-1.5 bg-surface-container-high text-on-surface-variant border border-surface-container-highest rounded-full text-label-sm font-bold uppercase tracking-widest">
                   {user.role} Account
                </span>
                {(user as any).is_verified && (
                   <span className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-label-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">shield_person</span>
                      Official Fayda Profile
                   </span>
                )}
             </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
           <button 
             onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => window.location.href = "/login" } })}
             className="h-12 px-8 flex items-center justify-center bg-error-container text-on-error-container rounded-2xl text-label-md font-bold uppercase tracking-widest hover:bg-error hover:text-on-error transition-all"
           >
              Sign Out
           </button>
        </div>
      </header>

      {/* ── Key Performance Metrics ── */}
      <div className="grid grid-cols-3 gap-4 md:gap-8 mx-1">
         {stats.map((stat, i) => (
           <div key={i} className="flex flex-col items-center justify-center gap-1 p-6 bg-surface-container-lowest border border-surface-container-highest rounded-[2rem] shadow-sm group hover:border-primary/20 transition-all">
              <span className="text-2xl md:text-3xl font-bold text-on-surface group-hover:text-primary transition-colors">{stat.value}</span>
              <span className="text-[10px] md:text-label-sm font-bold text-on-surface-variant uppercase tracking-widest opacity-40 text-center">{stat.label}</span>
           </div>
         ))}
      </div>

      {/* ── Skills (Optional for Workers) ── */}
      {skills && skills.length > 0 && (
         <div className="space-y-4 px-1">
            <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant opacity-60 ml-4">Professional Skills</h2>
            <div className="flex flex-wrap gap-2">
               {skills.map((skill, i) => (
                  <span key={i} className="px-5 py-2.5 bg-surface-container-low border border-surface-container-highest rounded-2xl text-label-md text-on-surface-variant font-bold uppercase tracking-widest">
                     {skill}
                  </span>
               ))}
            </div>
         </div>
      )}

      {/* ── Settings Sections ── */}
      <div className="flex flex-col gap-8 mx-1">
         {menuGroups.map((group, i) => (
            <div key={i} className="space-y-4">
               <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant opacity-60 ml-4">{group.group}</h2>
               <div className="flex flex-col gap-3">
                  {group.items.map((item, j) => {
                     const Component = item.link ? Link : 'button';
                     const props = item.link ? { href: item.link } : { onClick: item.onClick, disabled: item.isLoading };

                     return (
                        <Component 
                          key={j} 
                          {...(props as any)}
                          className={`group flex items-center gap-4 p-5 rounded-[2rem] border transition-all hover:shadow-sm ${item.isSuccess ? 'bg-primary/5 border-primary/20' : 'bg-surface-container-lowest border-surface-container-highest hover:border-primary/20'}`}
                        >
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${item.isSuccess ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary'}`}>
                              {item.isLoading ? (
                                 <span className="material-symbols-outlined animate-spin">sync</span>
                              ) : item.isSuccess ? (
                                 <span className="material-symbols-outlined filled">check_circle</span>
                              ) : (
                                 <span className="material-symbols-outlined">{item.icon}</span>
                              )}
                           </div>
                           <div className="flex-1 text-left">
                              <p className={`text-label-md font-bold transition-colors ${item.isSuccess ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>
                                 {item.isSuccess ? 'Updated Successfully' : item.label}
                              </p>
                              <p className="text-body-sm text-on-surface-variant opacity-60">{item.subtitle}</p>
                           </div>
                           {!item.isLoading && !item.isSuccess && (
                              <span className="material-symbols-outlined text-on-surface-variant/20 group-hover:text-primary transition-all">chevron_right</span>
                           )}
                        </Component>
                     );
                  })}
               </div>
            </div>
         ))}
      </div>

      {/* ── Mobile Logout ── */}
      <div className="md:hidden mx-1">
         <button 
           onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => window.location.href = "/login" } })}
           className="w-full flex items-center gap-4 p-5 bg-error-container/20 border border-error/20 rounded-[2rem] text-error group hover:bg-error hover:text-on-error transition-all"
         >
            <div className="w-12 h-12 bg-error-container rounded-2xl flex items-center justify-center">
               <span className="material-symbols-outlined">logout</span>
            </div>
            <div className="flex-1 text-left">
               <p className="text-label-md font-bold">Sign Out</p>
               <p className="text-body-sm opacity-60">End your session</p>
            </div>
            <span className="material-symbols-outlined">chevron_right</span>
         </button>
      </div>

      {/* ── App Version ── */}
      <footer className="text-center py-4">
         <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">
            DireSkill v1.0 · Integrated Management Platform
         </p>
      </footer>
    </div>
  );
}
