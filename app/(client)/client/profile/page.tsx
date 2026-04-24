"use client";

import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-md mx-auto min-h-[100dvh] text-text-high pb-32 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Header / Avatar Section */}
      <div className="flex flex-col items-center pt-16 pb-10 px-6 relative">
        <div className="relative mb-6">
          {/* Avatar Container with Premium Glow */}
          <div className="w-32 h-32 rounded-full p-[3.5px] bg-gradient-to-tr from-green-400 via-green-400/20 to-surface shadow-[0_0_60px_rgba(74,222,128,0.2)] relative">
            <div className="absolute inset-0 rounded-full bg-green-400/10 blur-xl animate-pulse"></div>
            <div className="w-full h-full bg-background rounded-full flex items-center justify-center border-[4px] border-background overflow-hidden relative z-10">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-700">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          {/* Verified Badge */}
          <div className="absolute bottom-1 right-1 w-9 h-9 bg-green-400 border-[4px] border-background rounded-full flex items-center justify-center shadow-lg z-20">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-black tracking-tighter text-text-high mb-1">
          {session?.user?.name || "Professional"}
        </h1>
        <p className="text-text-med text-sm font-medium">
           {session?.user?.email || "loading@identity.com"}
        </p>
      </div>

      {/* Stats Section */}
      <div className="px-6 mb-10">
        <div className="bg-surface/50 backdrop-blur-xl border border-border rounded-[2.5rem] p-6 flex items-center justify-between shadow-2xl">
           <div className="flex flex-col items-center gap-2 flex-1">
              <div className="relative">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-med">
                    <path d="M21 8V21H3V8"></path>
                    <path d="M1 3H23V8H1V3Z"></path>
                    <path d="M10 12H14"></path>
                 </svg>
                 <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-400 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background">3</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-med">Active</span>
           </div>
           
           <div className="w-px h-10 bg-border/20"></div>
           
           <div className="flex flex-col items-center gap-2 flex-1">
              <div className="relative">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-med">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                 </svg>
                 <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-400 text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background">1</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-med">History</span>
           </div>

           <div className="w-px h-10 bg-border/20"></div>

           <div className="flex flex-col items-center gap-2 flex-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-med">
                 <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-med">Ratings</span>
           </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="px-6 space-y-4">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-text-med/40 ml-4 mb-2">General Controls</h2>
        
        {[
          { label: "Wishlist", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
          { label: "Security", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
          { label: "Contact Us", icon: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" },
        ].map((item, idx) => (
          <div key={idx} className="bg-surface border border-border rounded-3xl p-4 flex items-center justify-between group hover:bg-white/5 transition-all duration-300">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-background border border-border rounded-2xl flex items-center justify-center text-text-med group-hover:bg-green-400 group-hover:text-black transition-all">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon}></path>
                   </svg>
                </div>
                <span className="text-[15px] font-bold text-text-high">{item.label}</span>
             </div>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600">
                <path d="M9 18l6-6-6-6"></path>
             </svg>
          </div>
        ))}

        {/* Logout */}
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full mt-6 bg-surface border border-border rounded-3xl p-4 flex items-center justify-between group hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300"
        >
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                 </svg>
              </div>
              <span className="text-[15px] font-bold text-red-500">Logout</span>
           </div>
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-red-500/50">
              <path d="M9 18l6-6-6-6"></path>
           </svg>
        </button>
      </div>
    </div>
  );
}
