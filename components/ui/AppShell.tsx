"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";
import { useLanguage } from "@/context/LanguageContext";

interface AppShellProps {
  children: React.ReactNode;
  role: "client" | "worker";
  userEmail?: string | null;
}

export default function AppShell({ children, role, userEmail }: AppShellProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
  }, []);

  if (!mounted) return null;

  const isMessagesPage = /^\/(client\/worker\/|client\/messages\/|worker\/messages\/|contracts\/)/.test(pathname);

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body transition-colors duration-300">
      {/* ── Desktop Sidebar ── */}
      <Sidebar role={role} userEmail={userEmail} />

      <div className="flex flex-col flex-grow min-w-0">
        {/* ── Top App Bar (Justified) ── */}
        <header className="sticky top-0 z-40 w-full bg-surface-container-lowest/80 backdrop-blur-xl border-b border-surface-container-highest shadow-sm">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
            
            {/* Left: Mobile Logo & Desktop Breadcrumbs/Page Title */}
            <div className="flex items-center gap-4">
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-on-surface rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-surface-container-lowest">
                    <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
                    <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
                  </svg>
                </div>
                <span className="text-sm font-bold uppercase tracking-tight text-on-surface">DireSkill</span>
              </div>
              
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Dashboard</p>
                <h2 className="text-sm font-bold text-on-surface capitalize">{pathname.split('/').pop()?.replace('-', ' ')}</h2>
              </div>
            </div>

            {/* Right: Controls (Theme, Language, Profile) */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Language Switcher */}
              <div className="hidden sm:flex bg-surface-container rounded-full p-1 border border-surface-container-highest">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${language === 'en' ? 'bg-on-surface text-surface-container-lowest shadow-sm' : 'text-on-surface-variant'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('am')}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${language === 'am' ? 'bg-on-surface text-surface-container-lowest shadow-sm' : 'text-on-surface-variant'}`}
                >
                  አማ
                </button>
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95 border border-surface-container-highest"
                title="Toggle Theme"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {/* Mobile Profile Trigger (or simple indicator) */}
              <div className="flex lg:hidden items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center border border-surface-container-highest overflow-hidden">
                   <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main Content Area ── */}
        <main className="flex-grow w-full overflow-x-hidden">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10">
            {children}
          </div>
        </main>

        {/* ── Mobile Navigation ── */}
        {!isMessagesPage && <MobileNav role={role} />}
      </div>
    </div>
  );
}
