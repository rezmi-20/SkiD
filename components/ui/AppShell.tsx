"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import MobileNav from "./MobileNav";
import { useLanguage } from "@/context/LanguageContext";
import { TranslationKey } from "@/lib/translations";

interface AppShellProps {
  children: React.ReactNode;
  role: "client" | "worker";
  userEmail?: string | null;
}

const CLIENT_NAV: { key: TranslationKey, href: string }[] = [
  { key: "nav.discover", href: "/client/search" },
  { key: "nav.myjobs", href: "/client/dashboard" },
  { key: "nav.chat", href: "/client/messages" },
  { key: "nav.profile", href: "/client/profile" },
];

const WORKER_NAV: { key: TranslationKey, href: string }[] = [
  { key: "nav.dashboard", href: "/worker/dashboard" },
  { key: "nav.mygigs", href: "/worker/gigs" },
  { key: "nav.earnings", href: "/worker/earnings" },
  { key: "nav.profile", href: "/worker/profile" },
];

export default function AppShell({ children, role, userEmail }: AppShellProps) {
  const pathname = usePathname();
  const navItems = role === "client" ? CLIENT_NAV : WORKER_NAV;
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-high selection:bg-green-400/30 font-inter">
      {/* Desktop Navigation */}
      <nav className="hidden md:block border-b border-border/10 bg-surface/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3 group">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-white/5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                    <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
                    <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
                  </svg>
               </div>
               <div className="text-xl font-bold tracking-tight text-white uppercase">
                 Dire<span className="text-green-400 italic">Skill</span>
               </div>
            </Link>

            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      isActive 
                        ? "bg-green-400/10 text-green-400" 
                        : "text-text-med hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 shrink-0 bg-surface border border-border rounded-xl p-1">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${language === 'en' ? 'bg-green-400 text-black shadow-lg shadow-green-400/10' : 'text-text-med hover:text-white'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('am')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${language === 'am' ? 'bg-green-400 text-black shadow-lg shadow-green-400/10' : 'text-text-med hover:text-white'}`}
                >
                  አማ
                </button>
            </div>

            <div className="h-6 w-px bg-border/20" />

            <div className="flex items-center gap-8">
              <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{role === 'client' ? 'Client' : 'Worker'}</span>
                  <span className="text-[13px] font-bold text-text-high">{userEmail?.split('@')[0]}</span>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-10 h-10 flex items-center justify-center border border-border rounded-xl text-text-med hover:text-green-400 hover:border-green-400/50 transition-all group"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-6 pt-8 pb-4 bg-background sticky top-0 z-40 border-b border-border/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-white/5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                  <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
                  <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
                </svg>
            </div>
            <span className="text-sm font-black tracking-tight text-white uppercase">DIRE<span className="text-green-400">SKILL</span></span>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="px-3 h-10 flex items-center justify-center bg-surface border border-border rounded-xl text-text-med font-black text-[10px] active:scale-95 transition-all"
              >
                {language === 'en' ? 'EN' : 'አማ'}
              </button>

            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-xl text-text-med hover:text-green-400 active:scale-95 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-10 pb-32 md:pb-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav role={role} />
    </div>
  );
}
