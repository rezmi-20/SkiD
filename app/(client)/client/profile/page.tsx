"use client";

import { signOut } from "next-auth/react";

export default function ProfilePage() {
  return (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center justify-center text-center space-y-6 bg-surface-container-low p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="relative">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined text-primary text-5xl">person</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-black rounded-full" title="Identity Verified" />
        </div>
        
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-black text-on-surface tracking-tighter">Your Identity</h1>
          <p className="text-on-surface-variant text-sm font-medium">Digital ID Index: 8829-DIRE</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 px-6">System Controls</div>
        <div className="bg-surface-container-low rounded-[2rem] border border-white/5 overflow-hidden">
           <button className="w-full px-8 py-5 flex items-center justify-between hover:bg-white/5 transition-all group">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">settings</span>
                <span className="text-sm font-bold">Workspace Settings</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
           </button>
           <button className="w-full px-8 py-5 flex items-center justify-between hover:bg-white/5 transition-all group border-t border-white/5">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">shield</span>
                <span className="text-sm font-bold">Privacy Ledger</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-sm">chevron_right</span>
           </button>
           <button 
             onClick={() => signOut({ callbackUrl: "/login" })}
             className="w-full px-8 py-6 flex items-center gap-4 hover:bg-red-500/5 transition-all group border-t border-white/5"
           >
              <span className="material-symbols-outlined text-red-500/50 group-hover:text-red-500 transition-colors">logout</span>
              <span className="text-sm font-black uppercase tracking-widest text-red-500">Sign Out of Marketplace</span>
           </button>
        </div>
      </div>
    </div>
  );
}
