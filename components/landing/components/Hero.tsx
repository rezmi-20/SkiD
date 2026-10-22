"use client";
import React, { useState, useRef } from 'react';
import { Search, ArrowRight, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  onSearch: (query: string) => void;
  onExploreStudio: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onExploreStudio }) => {
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState('');
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001
  });

  const imageY = useTransform(smoothProgress, [0, 1], [0, 50]);
  const imageScale = useTransform(smoothProgress, [0, 1], [1, 1.04]);
  const textOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0.4]);
  const textY = useTransform(smoothProgress, [0, 0.5], [0, -18]);

  const popularTrades = [
    t.hero.trades.electrician,
    t.hero.trades.plumber,
    t.hero.trades.painter,
    t.hero.trades.carpenter,
    t.hero.trades.finishing
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <section
      ref={heroRef}
      id="hero"
      className="pt-[110px] sm:pt-[130px] md:pt-[140px] px-4 md:px-10 max-w-[1728px] mx-auto flex flex-col items-center text-center relative overflow-visible bg-[#FAF9F5] pb-[60px] sm:pb-[90px] md:pb-[110px]"
    >
      {/* Top Text Content with Scroll-Driven Subtle Lift & Fade */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="flex flex-col items-center w-full"
      >
        {/* Main Display Headline with smooth entrance animation */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-[44px] sm:text-[62px] md:text-[76px] lg:text-[82px] font-bold text-balance max-w-5xl mb-6 md:mb-8 text-[#1B1B1B] tracking-[-0.04em] leading-[1.05]"
        >
          {t.hero.title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-base sm:text-lg md:text-xl text-[#8C8880] max-w-2xl mb-10 md:mb-12 leading-relaxed font-normal text-balance"
        >
          {t.hero.subtitle}
        </motion.p>

        {/* Interactive Search Bar & Popular Trades */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl mb-12 relative z-20"
        >
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-full p-2 border border-[#D9D7D0] shadow-lg flex items-center gap-2 focus-within:ring-2 focus-within:ring-black/15 transition-all"
          >
            <div className="flex items-center gap-2.5 px-3.5 flex-1">
              <Search size={18} className="text-[#8C8880]" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={t.hero.searchPlaceholder}
                className="w-full text-xs sm:text-sm text-[#1B1B1B] placeholder:text-[#8C8880] bg-transparent focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-black hover:bg-[#181818] text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
            >
              {t.hero.searchButton}
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
            <span className="text-[#8C8880] font-medium mr-1">{t.hero.popularLabel}</span>
            {popularTrades.map(trade => (
              <button
                key={trade}
                onClick={() => onSearch(trade)}
                className="px-3 py-1 rounded-full bg-white/80 hover:bg-white text-[#1B1B1B] border border-[#D9D7D0]/60 font-medium transition-all shadow-2xs cursor-pointer"
              >
                {trade}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Hero Big Rounded Image Container with Parallax Scroll Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.95, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[1492px] bg-[#F0EFEB] overflow-hidden shadow-2xl relative z-10 rounded-[28px] sm:rounded-[36px] md:rounded-[40px] h-[450px] sm:h-[600px] md:h-[780px] border border-[#D9D7D0]/40 group"
      >
        <motion.img
          style={{ y: imageY, scale: imageScale }}
          alt="Historic Dire Dawa Railway Station · Dire Dawa, Ethiopia"
          className="w-full h-full object-cover will-change-transform"
          src="/images/diredawa_station.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none"></div>

        {/* Ambient Overlay Badges on Hero */}
        <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
          <div className="max-w-full bg-white/85 backdrop-blur-xl border border-white/60 px-4 sm:px-5 py-3 rounded-full shadow-lg flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-pulse"></span>
            <span className="text-xs font-semibold text-[#1B1B1B] tracking-wide">
              {t.trustCollage.cards.fayda.badge}
            </span>
            <span className="text-xs text-[#8C8880] hidden md:inline">· Dire Dawa, Ethiopia</span>
          </div>

          <div className="max-w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => onSearch('')}
              className="bg-white/90 hover:bg-white text-[#1B1B1B] backdrop-blur-xl border border-white/60 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <span>{t.hero.exploreStudio}</span>
              <ArrowRight size={13} />
            </button>
            <button
              onClick={onExploreStudio}
              className="bg-black hover:bg-[#151515] text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
            >
              {t.hero.hireDirectly}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Floating Scroll Indicator to guide user downwards */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-8 flex flex-col items-center gap-1.5 text-[#8C8880] select-none"
      >
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-medium">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown size={14} className="text-[#8C8880]" />
        </motion.div>
      </motion.div>
    </section>
  );
};

