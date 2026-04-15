"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import MobileNav from "./MobileNav";
import { useTheme } from "next-themes";
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
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const toggleTheme = () => {
    const modes = ['grayscale', 'dark', 'light'];
    const currentTheme = theme || 'grayscale';
    const next = modes[(modes.indexOf(currentTheme) + 1) % modes.length];
    setTheme(next);
  };

  // Resolved icon only after mount to avoid SSR/client mismatch
  const themeIcon = !mounted ? 'contrast'
    : theme === 'grayscale' ? 'contrast'
    : theme === 'dark' ? 'dark_mode'
    : 'light_mode';

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/30">
      {/* Desktop Navigation (Hidden on Mobile) */}
      <nav className="hidden md:block border-b border-white/5 bg-surface backdrop-blur-xl sticky top-0 z-40 text-text-high">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center gap-3 group">
               <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-black group-hover:rotate-12 transition-transform">
                  <span className="material-symbols-outlined text-sm">bolt</span>
               </div>
               <div className="font-headline font-black text-text-high tracking-tighter uppercase">
                 Dire <span className="text-primary italic">{role}</span>
               </div>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-text-med hover:text-text-high hover:bg-black/5"
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleTheme}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-background border border-border hover:bg-black/5 transition-all text-text-high group shrink-0"
                title="Toggle Theme"
              >
                <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">
                  {themeIcon}
                </span>
              </button>
              
              <div className="flex items-center gap-1.5 shrink-0 bg-background border border-border rounded-xl p-1">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${language === 'en' ? 'bg-primary text-black' : 'text-text-med hover:text-text-high'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('am')}
                  className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${language === 'am' ? 'bg-primary text-black' : 'text-text-med hover:text-text-high'}`}
                >
                  አማ
                </button>
              </div>
            </div>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-8">
              <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-med">{t("common.authenticatedAs")}</span>
                  <span className="text-xs font-bold text-text-high">{userEmail}</span>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="px-4 py-2 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-text-med hover:text-primary transition-colors hover:bg-black/5"
              >
                {t("common.signout")}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Header (Minimal & App-like) */}
      <div className="md:hidden flex items-center justify-between px-6 pt-8 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center font-black text-black">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
            </div>
            <span className="text-xs font-black tracking-widest uppercase">{t("app.title")}</span>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-xl text-text-high active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {themeIcon}
                </span>
              </button>

             <button 
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-xl text-text-high font-black text-[10px] active:scale-95 transition-all"
              >
                {language === 'en' ? 'EN' : 'አማ'}
              </button>

            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-10 h-10 flex items-center justify-center bg-surface border border-border rounded-xl text-text-med hover:text-primary active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-10 pb-32 md:pb-10 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Navigation */}
      <MobileNav role={role} />
    </div>
  );
}
