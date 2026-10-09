"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORY_KEYS = [
  { id: "electrician", key: "categories.electrician" },
  { id: "plumber", key: "categories.plumber" },
  { id: "painter", key: "categories.painter" },
  { id: "carpenter", key: "categories.carpenter" },
  { id: "house_finishing", key: "categories.house_finishing" },
];

export default function Hero({ userRole, t }) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/client/search?query=${encodeURIComponent(searchQuery)}`;
    } else {
      window.location.href = "/client/search";
    }
  };

  return (
    <section
      id="home"
      className="relative w-full min-h-[85vh] flex items-center bg-[#090b0e] overflow-hidden pt-16 pb-10 sm:pt-20 sm:pb-16 lg:pt-28 lg:pb-20"
    >
      {/* ── 1. REAL SKILLED INFORMAL WORKERS BACKGROUND IMAGE (LOCAL ASSET, ZERO EXTERNAL NETWORK REQUESTS) ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Real photo of Ethiopian informal skilled trade workers (electrician, carpenter, precision technician) */}
        <div className="absolute inset-0">
          <img
            src="/landing/skilled-workers-hero.jpg"
            alt="Dire Dawa Skilled Informal Workers"
            className="w-full h-full object-cover object-center opacity-30 md:opacity-35"
            style={{ filter: "contrast(1.05) brightness(0.85)" }}
          />
          {/* Subtle architectural grid overlay for high-tech digital labor look */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
          {/* Deep obsidian gradient overlays for perfect contrast and readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#090b0e] via-[#090b0e]/80 to-[#090b0e]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-transparent to-[#090b0e]/85" />
        </div>

        {/* Ambient Radial Spotlight Blooms */}
        <div className="absolute top-1/4 -right-1/4 w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-green-500/15 via-emerald-500/5 to-transparent blur-[130px]" />
        <div className="absolute -bottom-10 -left-10 w-[45vw] h-[45vw] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      {/* ── 2. MAIN HERO CONTENT CONTAINER ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* ── LEFT COLUMN (7 COLS): HEADLINE, SEARCH, TEXT CATEGORIES, CTAS, GUARANTEES ── */}
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5 text-left">

            {/* Main Headline */}
            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.05]"
              >
                {t("hero.headline")}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6 }}
                className="text-zinc-400 text-base md:text-lg font-medium leading-relaxed max-w-xl"
              >
                {t("hero.subheadline")}
              </motion.p>
            </div>

            {/* Search Input & Text-Only Category Links (Zero Emojis, Zero Icons) */}
            <div className="space-y-3 pt-1">
              <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl w-full max-w-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] focus-within:border-green-400/50 transition-colors"
              >
                <div className="flex-1 flex items-center px-4 py-3 bg-black/50 rounded-[14px] border border-white/5">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("hero.search.placeholder")}
                    className="bg-transparent border-none outline-none text-white text-sm font-medium w-full placeholder:text-zinc-600 focus:ring-0"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-400 text-black hover:bg-green-300 px-6 py-3 rounded-[14px] font-black uppercase tracking-widest text-[11px] transition-all flex-shrink-0 active:scale-95 shadow-[0_4px_16px_rgba(74,222,128,0.25)]"
                >
                  {t("common.search")}
                </button>
              </motion.form>

              {/* Text-Only Categories without Emojis or Icons (Swipeable on Mobile) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap text-left"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mr-1 flex-shrink-0">
                  {t("hero.popular_categories")}
                </span>
                {CATEGORY_KEYS.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/client/search?category=${cat.id}`}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-900/60 border border-white/10 text-[11px] sm:text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 hover:border-green-400/40 transition-all uppercase tracking-wide flex-shrink-0"
                  >
                    {t(cat.key)}
                  </a>
                ))}
              </motion.div>
            </div>

            {/* Action Buttons (Full-Width Touch Targets on Mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex items-stretch sm:items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2"
            >
              <a
                href="/client/search"
                className="flex-1 sm:flex-initial h-11 sm:h-12 px-5 sm:px-7 flex items-center justify-center rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-md active:scale-95 text-center"
              >
                {t("hero.cta.find")}
              </a>
              <a
                href="/register/worker"
                className="flex-1 sm:flex-initial h-11 sm:h-12 px-5 sm:px-7 flex items-center justify-center rounded-xl bg-transparent border border-white/20 text-white text-xs font-black uppercase tracking-widest hover:bg-white/5 hover:border-white/40 transition-all active:scale-95 text-center"
              >
                {t("hero.cta.join")}
              </a>
            </motion.div>

            {/* Institutional Platform Guarantees (Compact on Mobile, Full on Desktop) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-white/10 max-w-xl"
            >
              <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs font-black text-white truncate">{t("hero.fayda_guarantee")}</p>
                </div>
                <p className="hidden sm:block text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{t("hero.fayda_guarantee_desc")}</p>
              </div>

              <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs font-black text-white truncate">{t("hero.contract_guarantee")}</p>
                </div>
                <p className="hidden sm:block text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{t("hero.contract_guarantee_desc")}</p>
              </div>

              <div className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs font-black text-white truncate">{t("hero.payment_guarantee")}</p>
                </div>
                <p className="hidden sm:block text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{t("hero.payment_guarantee_desc")}</p>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN (5 COLS): LIVING VERIFIED ARTISAN CONSOLE ── */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="relative w-full max-w-md space-y-4 text-left"
            >
              {/* PRIMARY CARD: VERIFIED ARTISAN IDENTITY CONSOLE */}
              <div className="rounded-2xl sm:rounded-3xl border border-white/15 bg-zinc-900/85 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.7)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400/20 via-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                      Dire Dawa Master Trade
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      Ahmed Kedir
                    </h3>
                    <p className="text-[11px] sm:text-xs font-semibold text-green-400 uppercase tracking-wide">
                      {t("categories.electrician")} · Kazira, Dire Dawa
                    </p>
                  </div>

                  <span className="px-2.5 sm:px-3 py-1 rounded-full bg-green-400/15 border border-green-400/30 text-[9px] sm:text-[10px] font-black text-green-400 uppercase tracking-wider">
                    {t("hero.card.status_verified")}
                  </span>
                </div>

                {/* Trade Skill Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mt-3.5 sm:mt-4">
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-bold text-zinc-300 uppercase">
                    Circuit Diagnostics
                  </span>
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-bold text-zinc-300 uppercase">
                    Breaker Panels
                  </span>
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-300 uppercase">
                    Solar Inverter
                  </span>
                </div>

                {/* Institutional Checks */}
                <div className="mt-4 sm:mt-5 space-y-2 sm:space-y-2.5 pt-3.5 sm:pt-4 border-t border-white/10">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] sm:text-xs font-black text-white">{t("hero.fayda_guarantee")}</p>
                      <p className="text-[9px] sm:text-[10px] text-zinc-400 font-medium">{t("hero.fayda_guarantee_desc")}</p>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-green-400 uppercase tracking-widest">
                      100% ID Match
                    </span>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-black/50 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] sm:text-xs font-black text-white">{t("hero.contract_guarantee")}</p>
                      <p className="text-[9px] sm:text-[10px] text-zinc-400 font-medium">{t("hero.card.terms_locked")}</p>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest font-mono">
                      PIN SECURE
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/5 flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-zinc-400">
                  <span>{t("hero.card.law_compliance")}</span>
                  <span className="text-green-400 uppercase tracking-wider font-mono">Kebele 02</span>
                </div>
              </div>

              {/* SECONDARY CARD: DIGITAL CONTRACT & PIN COMPLETION PREVIEW (HIDDEN ON MOBILE SCREEN TO PREVENT DEAD SCROLLING) */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="hidden sm:flex rounded-2xl border border-white/15 bg-zinc-950/90 backdrop-blur-xl p-4 shadow-[0_16px_36px_rgba(0,0,0,0.6)] items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-white">{t("hero.card.contract_title")}</p>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
                      Chapa Direct
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-zinc-400">ETB 4,500 · Release upon 4-digit PIN</p>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px] font-black">
                  <span className="w-6 h-7 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white">4</span>
                  <span className="w-6 h-7 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white">9</span>
                  <span className="w-6 h-7 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white">2</span>
                  <span className="w-6 h-7 rounded bg-white/10 border border-white/20 flex items-center justify-center text-green-400">0</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
