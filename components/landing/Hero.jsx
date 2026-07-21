"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

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
      className="relative w-full min-h-screen flex items-center bg-[#090b0e] overflow-hidden py-24 lg:py-32"
    >
      {/* Background Graphic Elements - Concentric Circles and Glows matching the image */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Large green/blue radial glow on the right */}
        <div className="absolute top-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent blur-[120px] pointer-events-none" />
        
        {/* Large abstract concentric circles (like the vector hand waves/radar lines in the image) */}
        <div className="absolute top-[10%] -right-[10%] w-[65vw] h-[65vw] border border-white/[0.03] rounded-full flex items-center justify-center pointer-events-none">
          <div className="w-[50vw] h-[50vw] border border-white/[0.02] rounded-full flex items-center justify-center">
            <div className="w-[35vw] h-[35vw] border border-white/[0.015] rounded-full flex items-center justify-center">
              <div className="w-[20vw] h-[20vw] border border-white/[0.01] rounded-full" />
            </div>
          </div>
        </div>

        {/* Floating cards graphics - mimicking the PayCard credit cards in the image */}
        <div className="hidden lg:block absolute right-[12%] top-[25%] w-[450px] h-[450px] pointer-events-none">
          {/* Circular radar background */}
          <div className="absolute inset-0 border border-white/[0.03] rounded-full animate-[spin_120s_linear_infinite]" />
          
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -15 }}
            animate={{ opacity: 1, y: 0, rotate: -25 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-[10%] right-[15%] w-[190px] h-[300px] rounded-2xl bg-[#13161c]/90 backdrop-blur-2xl border border-white/20 shadow-[0_30px_60px_rgba(74,222,128,0.18)] p-6 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 via-transparent to-transparent pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[9px] font-black text-white/80 tracking-widest uppercase">DireSkill</span>
              <div className="w-5 h-5 rounded-full bg-white/20" />
            </div>
            <div className="space-y-4 relative z-10">
              <div className="w-8 h-6 rounded bg-white/10" />
              <p className="text-[10px] font-mono text-white tracking-wider">**** **** **** 4892</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[7px] text-zinc-400 uppercase tracking-widest">Worker ID</p>
                  <p className="text-[9px] text-white font-black">Samuel T.</p>
                </div>
                <span className="text-[8px] font-black text-green-400 uppercase bg-green-400/20 px-2 py-0.5 rounded border border-green-400/30">Fayda</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotate: 15 }}
            animate={{ opacity: 1, y: 80, rotate: 15 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute top-[10%] right-[32%] w-[190px] h-[300px] rounded-2xl bg-[#13161c]/95 backdrop-blur-2xl border border-white/20 shadow-[0_30px_60px_rgba(59,130,246,0.18)] p-6 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-transparent pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[9px] font-black text-white/80 tracking-widest uppercase">Digital Contract</span>
              <div className="w-5 h-5 rounded-full bg-white/30" />
            </div>
            <div className="space-y-4 relative z-10">
              <div className="w-8 h-6 rounded bg-white/10" />
              <p className="text-[10px] font-mono text-white tracking-wider">SECURE DIGITAL ESCROW</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[7px] text-zinc-400 uppercase tracking-widest">Amount Paid</p>
                  <p className="text-[9px] text-white font-black">ETB 1,200</p>
                </div>
                <span className="text-[8px] font-black text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">Chapa</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom backdrop gradient */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#090b0e] to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* ── Left Content: Headline + Search ── */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left">
            {/* Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.7 }}
                className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-3xl"
              >
                {t("hero.headline")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-400 tracking-tight leading-snug max-w-2xl"
              >
                {t("hero.tagline")}
              </motion.p>
            </div>

            {/* Sub-headline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-zinc-400 text-base md:text-lg font-medium max-w-xl leading-relaxed"
            >
              Get Fayda-verified professionals with digital contracts and real ratings. All secure, seamless, and compliant in Dire Dawa.
            </motion.p>

            {/* Search and Action Bar */}
            <div className="space-y-4">
              <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl"
              >
                <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-black/40 rounded-[14px] border border-white/5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-500 flex-shrink-0">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("hero.search.placeholder")}
                    className="bg-transparent border-none outline-none text-white text-sm font-medium w-full placeholder:text-zinc-600"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-[14px] font-black uppercase tracking-widest text-[10px] transition-all flex-shrink-0 active:scale-95 shadow-lg"
                >
                  {t("common.search")}
                </button>
              </motion.form>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex items-center gap-4 flex-wrap"
              >
                <a
                  href="/client/search"
                  className="h-12 px-8 flex items-center justify-center rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-md"
                >
                  {t("hero.cta.find")}
                </a>
                <a
                  href="/register/worker"
                  className="h-12 px-8 flex items-center justify-center rounded-xl bg-transparent border border-white/20 text-white text-xs font-black uppercase tracking-widest hover:bg-white/5 hover:border-white/40 transition-all"
                >
                  {t("hero.cta.join")}
                </a>
              </motion.div>
            </div>

            {/* Horizontal Stats List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center gap-8 md:gap-12 pt-4 border-t border-white/5"
            >
              {[
                { value: "200+", label: "Verified Workers" },
                { value: "4.8★", label: "Avg. Rating" },
                { value: "1,100+", label: "Contracts Signed" },
              ].map((stat, i) => (
                <div key={i} className="text-left">
                  <p className="text-2xl md:text-3xl font-black text-white leading-tight">{stat.value}</p>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
