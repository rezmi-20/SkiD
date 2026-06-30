"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function Hero({ userRole, t }) {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const workers = [
    { name: "Samuel T.", skill: "Electrician", rating: 4.9, image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400" },
    { name: "Lydia K.", skill: "Painter", rating: 4.8, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400" },
    { name: "Dawit M.", skill: "Plumber", rating: 5.0, image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400" },
  ];

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
      className="relative w-full min-h-[100dvh] flex items-center bg-[#09090b]"
      style={{ paddingTop: "72px" }}
    >
      {/* ── Full-height Background Image ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {/* The image itself — covers the FULL section height */}
        <img
          src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=85&w=2000"
          className="w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.4)" }}
          alt="Workers background"
        />
        {/* Subtle left vignette for text readability — does NOT darken bottom */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/85 via-[#09090b]/40 to-transparent" />
        {/* Very light top fade for navbar blending */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#09090b]/60 to-transparent" />
        {/* On mobile: slight bottom fade so it doesn't look cut off */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#09090b]/50 to-transparent" />
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-5 sm:px-8 lg:px-12 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-center">

          {/* ── Left: Text Content ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-5 sm:gap-6 text-left"
          >
            {/* Live badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-400/10 border border-green-400/25 self-start"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
              <span className="text-[10px] font-black text-green-400 uppercase tracking-widest whitespace-nowrap">
                Live in Dire Dawa
              </span>
            </motion.div>

            {/* Main headline */}
            <div className="space-y-1">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-[clamp(1.75rem,5vw,3.75rem)] font-black tracking-tighter text-white leading-[1.08] uppercase"
              >
                {t("hero.headline")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-[clamp(1.4rem,4vw,3rem)] font-black tracking-tighter leading-[1.1] uppercase text-green-400 italic"
              >
                {t("hero.tagline")}
              </motion.p>
            </div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-zinc-300 text-sm sm:text-base font-medium max-w-lg leading-relaxed"
            >
              {t("hero.subheadline")}
            </motion.p>

            {/* Search bar */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl"
            >
              <div className="flex-1 flex items-center gap-3 px-4 py-3.5 bg-zinc-900/60 rounded-xl border border-white/5">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400 flex-shrink-0">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("hero.search.placeholder")}
                  className="bg-transparent border-none outline-none text-white text-sm font-semibold w-full placeholder:text-zinc-500"
                />
              </div>
              <button
                type="submit"
                className="bg-green-400 text-black px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-green-300 transition-all shadow-[0_8px_24px_rgba(74,222,128,0.25)] flex-shrink-0"
              >
                {t("common.search")}
              </button>
            </motion.form>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-row flex-wrap gap-3"
            >
              <a
                href="/client/search"
                className="flex-1 sm:flex-none px-6 h-12 flex items-center justify-center rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-100 transition-all active:scale-95 min-w-[130px]"
              >
                {t("hero.cta.find")}
              </a>
              <a
                href="/register/worker"
                className="flex-1 sm:flex-none px-6 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/15 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 min-w-[130px]"
              >
                {t("hero.cta.join")}
              </a>
            </motion.div>
          </motion.div>

          {/* ── Right: Floating Worker Cards (desktop only) ── */}
          <div className="hidden lg:block relative h-[460px] xl:h-[520px] overflow-hidden">
            {workers.map((worker, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, i % 2 === 0 ? -10 : 10, 0],
                  rotate: [0, i % 2 === 0 ? 0.4 : -0.4, 0],
                }}
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
                transition={{
                  opacity: { duration: 0.7, delay: 0.3 + i * 0.2 },
                  scale: { duration: 0.7, delay: 0.3 + i * 0.2 },
                  y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
                }}
                className={`absolute w-56 xl:w-64 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 shadow-2xl cursor-pointer
                  ${i === 0 ? "top-6 left-6" : i === 1 ? "bottom-8 right-6" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"}`}
                style={{ zIndex: i === 2 ? 20 : 10 }}
              >
                <div className="absolute top-4 right-4 bg-green-400/20 border border-green-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="text-[7px] font-black text-green-400 uppercase tracking-widest">{t("worker.verified")}</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/10 flex-shrink-0">
                    <img src={worker.image} className="w-full h-full object-cover" alt={worker.name} />
                  </div>
                  <div>
                    <h4 className="text-white font-black uppercase tracking-tight text-sm leading-tight">{worker.name}</h4>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                      {worker.skill === "Electrician" ? t("categories.electrician") : worker.skill === "Painter" ? t("categories.painter") : t("categories.plumber")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-3 mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-center flex-1">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">{t("worker.rating")}</p>
                    <p className="text-white font-black text-xs">{worker.rating} <span className="text-green-400">★</span></p>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="text-center flex-1">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">{t("worker.status")}</p>
                    <p className="text-green-400 font-black text-xs">{t("worker.online")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a href="/client/search" className="h-9 rounded-lg bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center">{t("worker.hire")}</a>
                  <a href="/client/search" className="h-9 rounded-lg bg-white/10 text-white text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center">{t("worker.message")}</a>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
