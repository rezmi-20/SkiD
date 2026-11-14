"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import DireSkillLogo from "@/components/shell/DireSkillLogo";

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
      
      <div className="absolute top-12 left-12 z-20">
        <DireSkillLogo variant="light" iconSize={42} showWordmark={true} />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="w-24 h-24 bg-white/10 border border-white/20 flex items-center justify-center rounded-3xl backdrop-blur-xl mb-8 shadow-2xl p-4">
           <img src="/direskill_icon.png" alt="DireSkill Emblem" className="w-full h-full object-contain filter drop-shadow" />
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
