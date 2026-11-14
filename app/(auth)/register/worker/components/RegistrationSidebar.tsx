"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function RegistrationSidebar() {
  const { t } = useLanguage();

  return (
    <div className="hidden lg:flex w-1/2 relative bg-[#09090b] border-r border-zinc-800/50 overflow-hidden items-center justify-center p-12 select-none">
      {/* Background Image: Highly Visible 3D Artisan on Construction Site */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/images/artisan-register-hero.jpg" 
          alt="Professional Workspace" 
          className="w-full h-full object-cover object-top opacity-90 scale-100 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/30 to-[#09090b]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/30 via-transparent to-[#09090b]/40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-green-500/10 blur-[140px] pointer-events-none rounded-full mix-blend-screen" />
      </div>
      
      <div className="absolute top-12 left-12 flex items-center gap-3 z-20">
        <div className="w-12 h-12 bg-white/95 backdrop-blur-md flex items-center justify-center rounded-2xl shadow-xl shadow-black/40">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#09090b]">
            <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
            <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
          </svg>
        </div>
        <span className="text-2xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Dire<span className="text-green-400">Skill</span>
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="w-24 h-24 bg-white/5 border border-white/10 flex items-center justify-center rounded-3xl backdrop-blur-xl mb-8 shadow-2xl">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h2 className="text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
          {t("register.worker.title").split(' ')[0]} <br/>
          <span className="text-green-400">{t("register.worker.title").split(' ').slice(1).join(' ')}</span>
        </h2>
      </div>
      
      <div className="absolute bottom-12 left-12 flex items-center gap-4 text-sm font-medium text-zinc-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] z-20">
        <Link href="/privacy" className="hover:text-green-400 transition-colors">{t("auth.privacy")}</Link>
        <span>&bull;</span>
        <Link href="/terms" className="hover:text-green-400 transition-colors">{t("auth.terms")}</Link>
      </div>
    </div>
  );
}
