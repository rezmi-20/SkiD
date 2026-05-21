"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";

export default function RegistrationSidebar() {
  const { t } = useLanguage();

  return (
    <div className="hidden lg:flex w-1/2 relative bg-[#09090b] border-r border-zinc-800/50 overflow-hidden items-center justify-center p-12">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format&fit=crop" 
          alt="Professional Workspace" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[#09090b]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/30"></div>
      </div>

      {/* Subtle Ambient Green Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/15 blur-[120px] pointer-events-none rounded-full z-0 mix-blend-screen" />
      
      <div className="absolute top-12 left-12 flex items-center gap-3 z-20">
        <div className="w-12 h-12 bg-white flex items-center justify-center rounded-2xl shadow-lg shadow-white/5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#09090b]">
            <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
            <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
          </svg>
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">
          Dire<span className="text-green-400">Skill</span>
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-white/5 border border-white/10 flex items-center justify-center rounded-3xl backdrop-blur-xl mb-8 shadow-2xl">
           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h2 className="text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
          {t("register.worker.title").split(' ')[0]} <br/>
          <span className="text-green-400">{t("register.worker.title").split(' ').slice(1).join(' ')}</span>
        </h2>
        <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
          {t("register.worker.subtitle")}
        </p>
      </div>
      
      <div className="absolute bottom-12 left-12 flex items-center gap-4 text-sm font-medium text-zinc-500">
        <Link href="#" className="hover:text-green-400 transition-colors">Privacy Policy</Link>
        <span>&bull;</span>
        <Link href="#" className="hover:text-green-400 transition-colors">Terms of Service</Link>
      </div>
    </div>
  );
}
