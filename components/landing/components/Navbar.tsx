"use client";
import React, { useState } from 'react';
import { Menu, X, ArrowUpRight, LogIn } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Language } from '../types';

interface NavbarProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onFindWorker: () => void;
  onLogin?: () => void;
  onGetStarted?: () => void;
  userRole?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onSelectLanguage,
  onFindWorker,
  onLogin,
  onGetStarted,
  userRole
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authenticated user navigation logic (Staff authentication gated separately at /admin/login)
  const userRoleTarget = userRole === "worker" ? "/worker/dashboard" : userRole === "client" ? "/client/search" : "/admin/login";
  const isLoggedIn = Boolean(userRole);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLabels = {
    EN: {
      home: 'Home',
      findWorkers: 'Find Workers',
      howItWorks: 'How It Works',
      features: 'Features',
      reviews: 'Reviews',
      faq: 'FAQ',
      login: isLoggedIn ? 'Dashboard' : 'Login',
      getStarted: isLoggedIn ? 'Dashboard' : 'Get Started'
    },
    'አማ': {
      home: 'መነሻ',
      findWorkers: 'ባለሙያዎች',
      howItWorks: 'እንዴት ይሰራል',
      features: 'ባህሪያት',
      reviews: 'አስተያየቶች',
      faq: 'ጥያቄዎች',
      login: isLoggedIn ? 'ዳሽቦርድ' : 'ይግቡ',
      getStarted: isLoggedIn ? 'ዳሽቦርድ' : 'ይጀምሩ'
    },
    ORO: {
      home: 'Mana',
      findWorkers: 'Ogeessota',
      howItWorks: 'Akkaataa Hojii',
      features: 'Amaloota',
      reviews: 'Yaada',
      faq: 'Gaaffiilee',
      login: isLoggedIn ? 'Daashboordii' : 'Seeni',
      getStarted: isLoggedIn ? 'Daashboordii' : 'Jalqabi'
    }
  }[language];

  const handleLoginClick = () => {
    setMobileMenuOpen(false);
    if (isLoggedIn) {
      window.location.href = userRoleTarget;
      return;
    }
    if (onLogin) onLogin();
    else window.location.href = "/login";
  };

  const handleGetStartedClick = () => {
    setMobileMenuOpen(false);
    if (isLoggedIn) {
      window.location.href = userRoleTarget;
      return;
    }
    if (onGetStarted) onGetStarted();
    else onFindWorker();
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      {/* Scroll Progress Bar at very top of screen */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#FF416C] via-[#00E575] to-[#FF416C] origin-left z-[100] pointer-events-none"
        style={{ scaleX }}
      />

      {/* 1. Floating Nav */}
      <header className="fixed top-[20px] md:top-[24px] left-0 right-0 z-50 flex items-center justify-center px-4 w-full pointer-events-none">
        <div className="pointer-events-auto w-full max-w-[1060px] flex items-center justify-between bg-[#000000] backdrop-blur-xl rounded-full px-4 py-1.5 shadow-2xl border border-white/10 h-[58px] transition-all">
          <div className="flex items-center gap-6 lg:gap-8 pl-1">
            {/* Monogram Brand Mark */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-[34px] h-[34px] rounded-full border border-[#FAF9F5]/80 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform"
              title="DireSkill - Dire Dawa"
              aria-label="DireSkill Home"
            >
              <span className="text-[#FAF9F5] font-bold text-sm leading-none font-sans">D</span>
            </button>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              <button
                onClick={() => scrollTo('hero')}
                className="text-[11px] lg:text-xs font-semibold text-[#FAF9F5]/80 hover:text-[#FAF9F5] transition-colors tracking-wide uppercase font-sans whitespace-nowrap cursor-pointer"
              >
                {navLabels.home}
              </button>
              <button
                onClick={onFindWorker}
                className="text-[11px] lg:text-xs font-semibold text-[#FAF9F5]/80 hover:text-[#FAF9F5] transition-colors tracking-wide uppercase font-sans whitespace-nowrap cursor-pointer"
              >
                {navLabels.findWorkers}
              </button>
              <button
                onClick={() => scrollTo('how-it-works')}
                className="text-[11px] lg:text-xs font-semibold text-[#FAF9F5]/80 hover:text-[#FAF9F5] transition-colors tracking-wide uppercase font-sans whitespace-nowrap cursor-pointer"
              >
                {navLabels.howItWorks}
              </button>
              <button
                onClick={() => scrollTo('features')}
                className="text-[11px] lg:text-xs font-semibold text-[#FAF9F5]/80 hover:text-[#FAF9F5] transition-colors tracking-wide uppercase font-sans whitespace-nowrap cursor-pointer"
              >
                {navLabels.features}
              </button>
              <button
                onClick={() => scrollTo('reviews')}
                className="text-[11px] lg:text-xs font-semibold text-[#FAF9F5]/80 hover:text-[#FAF9F5] transition-colors tracking-wide uppercase font-sans whitespace-nowrap cursor-pointer"
              >
                {navLabels.reviews}
              </button>
              <button
                onClick={() => scrollTo('faq')}
                className="text-[11px] lg:text-xs font-semibold text-[#FAF9F5]/80 hover:text-[#FAF9F5] transition-colors tracking-wide uppercase font-sans whitespace-nowrap cursor-pointer"
              >
                {navLabels.faq}
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Pill Switcher */}
            <div className="flex items-center bg-white/10 rounded-full p-0.5 border border-white/10 text-[10px] font-semibold">
              <button
                onClick={() => onSelectLanguage('EN')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  language === 'EN' ? 'bg-white text-black font-bold' : 'text-white/70 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onSelectLanguage('አማ')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  language === 'አማ' ? 'bg-white text-black font-bold' : 'text-white/70 hover:text-white'
                }`}
              >
                አማ
              </button>
              <button
                onClick={() => onSelectLanguage('ORO')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  language === 'ORO' ? 'bg-white text-black font-bold' : 'text-white/70 hover:text-white'
                }`}
              >
                ORO
              </button>
            </div>

            {/* Login Link */}
            <button
              onClick={handleLoginClick}
              className="hidden sm:inline-flex text-xs font-semibold text-white/80 hover:text-white px-2 py-1 transition-colors cursor-pointer"
            >
              {navLabels.login}
            </button>

            {/* Primary Action Button: Get Started */}
            <button
              onClick={handleGetStartedClick}
              className="border border-[#FAF9F5]/30 text-[#FAF9F5] font-sans rounded-full hover:bg-[#FAF9F5] hover:text-black transition-all duration-300 shrink-0 flex items-center px-4 text-[10px] sm:text-xs h-[32px] font-semibold uppercase tracking-wider cursor-pointer"
            >
              {navLabels.getStarted}
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white/80 hover:text-white p-1 rounded-full ml-1"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl md:hidden flex flex-col justify-center items-center p-6 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center text-white font-bold text-xl mb-6">
            D
          </div>

          <div className="flex flex-col space-y-5 mb-8">
            <button
              onClick={() => scrollTo('hero')}
              className="text-lg font-bold text-white uppercase tracking-wider"
            >
              {navLabels.home}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onFindWorker();
              }}
              className="text-lg font-bold text-white uppercase tracking-wider"
            >
              {navLabels.findWorkers}
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="text-lg font-bold text-white uppercase tracking-wider"
            >
              {navLabels.howItWorks}
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="text-lg font-bold text-white uppercase tracking-wider"
            >
              {navLabels.features}
            </button>
            <button
              onClick={() => scrollTo('reviews')}
              className="text-lg font-bold text-white uppercase tracking-wider"
            >
              {navLabels.reviews}
            </button>
            <button
              onClick={() => scrollTo('faq')}
              className="text-lg font-bold text-white uppercase tracking-wider"
            >
              {navLabels.faq}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => onSelectLanguage('EN')}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                language === 'EN' ? 'bg-white text-black' : 'text-white/60'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onSelectLanguage('አማ')}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                language === 'አማ' ? 'bg-white text-black' : 'text-white/60'
              }`}
            >
              አማ
            </button>
            <button
              onClick={() => onSelectLanguage('ORO')}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                language === 'ORO' ? 'bg-white text-black' : 'text-white/60'
              }`}
            >
              ORO
            </button>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={handleGetStartedClick}
              className="w-full py-3 rounded-full bg-white text-black font-bold uppercase tracking-wider text-xs shadow-lg"
            >
              {navLabels.getStarted}
            </button>
            <button
              onClick={handleLoginClick}
              className="w-full py-2.5 rounded-full border border-white/20 text-white font-medium text-xs"
            >
              {navLabels.login}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

