"use client";
import React from 'react';
import Link from 'next/link';
import { Share2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onFindWorker: () => void;
  onJoinPro: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onSelectLanguage,
  onFindWorker,
  onJoinPro
}) => {
  const { t } = useLanguage();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-black text-white pt-24 md:pt-[128px] pb-12 md:pb-[64px] px-6 md:px-12 rounded-t-[48px] md:rounded-t-[64px] relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1, margin: "-40px" }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1728px] mx-auto will-change-transform"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-16 md:mb-24">
          {/* Brand Column */}
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg leading-none font-sans">D</span>
            </div>
            <p className="text-[15px] text-white/50 max-w-xs leading-relaxed font-normal">
              {t.footer.tagline}
            </p>
            <div className="text-xs text-white/40">
              A Dire Dawa University Project<br />
              <strong className="text-white/70">ICT Department Innovation Lab</strong>
            </div>

            <div className="flex gap-4">
              <a
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                href="#share"
                onClick={e => { 
                  e.preventDefault(); 
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                title="Share"
                aria-label="Share"
              >
                <Share2 size={18} />
              </a>
              <a
                className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                href="#network"
                onClick={e => e.preventDefault()}
                title="Ethiopian Labor Modernization"
                aria-label="Ethiopian Labor Modernization"
              >
                <Globe size={18} />
              </a>
            </div>
          </div>

          {/* Navigation Column 1: Resources */}
          <div>
            <h4 className="font-sans text-white mb-6 uppercase tracking-widest text-[10px] font-bold">
              {t.footer.forClients}
            </h4>
            <ul className="flex flex-col gap-4">
              <li>
                <button onClick={onFindWorker} className="text-[15px] text-white/60 hover:text-white transition-colors text-left cursor-pointer">
                  {t.nav.findWorkers}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('how-it-works')} className="text-[15px] text-white/60 hover:text-white transition-colors text-left cursor-pointer">
                  {t.nav.howItWorks}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('skill-os')} className="text-[15px] text-white/60 hover:text-white transition-colors text-left cursor-pointer">
                  {t.nav.features}
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('reviews')} className="text-[15px] text-white/60 hover:text-white transition-colors text-left cursor-pointer">
                  {t.nav.reviews}
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Legal & Institutional */}
          <div>
            <h4 className="font-sans text-white mb-6 uppercase tracking-widest text-[10px] font-bold">
              {t.footer.forArtisans}
            </h4>
            <ul className="flex flex-col gap-4">
              <li>
                <button onClick={onJoinPro} className="text-[15px] text-white/60 hover:text-white transition-colors text-left cursor-pointer">
                  {t.footer.registerTrade}
                </button>
              </li>
              <li>
                <span className="text-[15px] text-white/60 cursor-default">
                  Fayda National ID Integration
                </span>
              </li>
              <li>
                <span className="text-[15px] text-white/60 cursor-default">
                  Chapa Payment Gateway
                </span>
              </li>
              <li>
                <span className="text-[15px] text-white/60 cursor-default">
                  Proclamation 1156/2019
                </span>
              </li>
            </ul>
          </div>

          {/* Language Selection Column */}
          <div>
            <h4 className="font-sans text-white mb-6 uppercase tracking-widest text-[10px] font-bold">
              Language
            </h4>
            <ul className="flex flex-col gap-4 text-[15px]">
              <li>
                <button
                  onClick={() => onSelectLanguage('EN')}
                  className={`hover:text-white transition-colors flex items-center gap-2 ${
                    language === 'EN' ? 'text-white font-bold' : 'text-white/60'
                  }`}
                >
                  <span>English</span>
                  {language === 'EN' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF416C]"></span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectLanguage('አማ')}
                  className={`hover:text-white transition-colors flex items-center gap-2 ${
                    language === 'አማ' ? 'text-white font-bold' : 'text-white/60'
                  }`}
                >
                  <span>አማርኛ</span>
                  {language === 'አማ' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF416C]"></span>}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectLanguage('ORO')}
                  className={`hover:text-white transition-colors flex items-center gap-2 ${
                    language === 'ORO' ? 'text-white font-bold' : 'text-white/60'
                  }`}
                >
                  <span>Afaan Oromoo</span>
                  {language === 'ORO' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF416C]"></span>}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar matching exact layout */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-[11px] text-white/40 text-center md:text-left">
            © 2026 DireSkill. A Dire Dawa University Project. Compliant with Ethiopian Labour Proclamation 1156/2019.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            <Link
              href="/privacy"
              className="font-sans text-[11px] text-white/40 hover:text-white cursor-pointer transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-sans text-[11px] text-white/40 hover:text-white cursor-pointer transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="font-sans text-[11px] text-white/40 hover:text-white cursor-pointer transition-colors"
            >
              Cookie Policy
            </Link>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("skid-open-cookie-preferences"));
                }
              }}
              className="font-sans text-[11px] text-white/40 hover:text-white cursor-pointer transition-colors"
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

