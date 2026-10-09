"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function StatsBento({ t: propT }) {
  const { t: contextT } = useLanguage();
  const t = propT || contextT;

  return (
    <section className="py-20 md:py-28 px-4 md:px-12 lg:px-20 bg-[#09090b] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#4ade80_0%,transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-5 h-auto">

          {/* CARD 1: MODERNIZING SKILLS - Server-side rendered inline SVG trade blueprint graphic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, borderColor: "rgba(74, 222, 128, 0.35)" }}
            viewport={{ once: true }}
            className="col-span-2 md:col-span-2 lg:col-span-3 lg:row-span-2 p-5 sm:p-8 md:p-10 xl:p-12 rounded-3xl sm:rounded-[2.5rem] bg-zinc-900/60 border border-white/10 backdrop-blur-3xl flex flex-col justify-center space-y-4 sm:space-y-6 relative overflow-hidden group text-left min-h-[270px] sm:min-h-[360px]"
          >
            {/* SERVER-SIDE RENDERED BACKGROUND GRAPHIC: Dire Dawa Skilled Labor Blueprint */}
            <div className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-700">
              <svg
                viewBox="0 0 800 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full object-cover"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id="cardGlow1" cx="30%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#10b981" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#090b0e" stopOpacity="0" />
                  </radialGradient>
                  <pattern id="cardGrid1" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.05" />
                    <circle cx="40" cy="40" r="1.2" fill="#4ade80" fillOpacity="0.2" />
                  </pattern>
                </defs>

                {/* Base Grid & Light */}
                <rect width="100%" height="100%" fill="url(#cardGlow1)" />
                <rect width="100%" height="100%" fill="url(#cardGrid1)" />

                {/* Trade Engineering Graphic: Compass, Circuits & Architectural Rulers */}
                <g opacity="0.4" transform="translate(480, 220)">
                  <circle cx="0" cy="0" r="180" stroke="#4ade80" strokeWidth="1" strokeDasharray="8 6" strokeOpacity="0.4" />
                  <circle cx="0" cy="0" r="120" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.3" />
                  <circle cx="0" cy="0" r="60" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 4" />
                  <line x1="-200" y1="0" x2="200" y2="0" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.2" />
                  <line x1="0" y1="-200" x2="0" y2="200" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.2" />
                </g>

                {/* Electrical Wiring Bus Lines */}
                <g opacity="0.35">
                  <path d="M 50 100 L 220 100 L 290 170 L 520 170 L 580 110 L 750 110" stroke="#4ade80" strokeWidth="1.5" fill="none" />
                  <circle cx="220" cy="100" r="3.5" fill="#4ade80" />
                  <circle cx="290" cy="170" r="3.5" fill="#38bdf8" />
                  <circle cx="520" cy="170" r="3.5" fill="#4ade80" />
                  <path d="M 120 450 L 300 450 L 360 390 L 650 390" stroke="#ffffff" strokeWidth="1" strokeDasharray="6 4" fill="none" opacity="0.3" />
                  <circle cx="360" cy="390" r="3" fill="#ffffff" />
                </g>

                {/* Architectural Framing Hatch */}
                <g opacity="0.2" transform="translate(60, 320)">
                  <rect x="0" y="0" width="180" height="120" rx="6" stroke="#4ade80" strokeWidth="1.2" />
                  <line x1="0" y1="40" x2="180" y2="40" stroke="#ffffff" strokeWidth="0.8" />
                  <line x1="0" y1="80" x2="180" y2="80" stroke="#ffffff" strokeWidth="0.8" />
                  <line x1="90" y1="0" x2="90" y2="120" stroke="#4ade80" strokeWidth="0.8" />
                </g>
              </svg>
            </div>

            {/* Dark Obsidian Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-[#090b0e]/75 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 space-y-3 sm:space-y-4">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-green-400">
                Dire Dawa Labor Modernization
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                {t("bento.modernizing")}
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-md">
                {t("bento.modernizing.desc")}
              </p>
              <div className="pt-1 sm:pt-2">
                <a
                  href="/register/worker"
                  className="inline-flex items-center gap-2.5 sm:gap-3 text-green-400 font-black uppercase tracking-[0.18em] text-[11px] sm:text-xs hover:gap-5 transition-all group"
                >
                  <span>{t("bento.cta.empower")}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>

          {/* CARD 2: FAYDA VERIFIED (100% Safety Integration) - Side-by-side widget on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4, borderColor: "rgba(74, 222, 128, 0.4)" }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-2 lg:col-span-1.5 p-4 sm:p-7 xl:p-8 rounded-2xl sm:rounded-[2rem] bg-zinc-900/50 border border-white/10 backdrop-blur-2xl flex flex-col justify-between hover:border-green-400/30 transition-all text-left min-h-[150px] sm:min-h-[190px] relative overflow-hidden group"
          >
            {/* SERVER-SIDE RENDERED BACKGROUND GRAPHIC: Fayda Biometric & National ID Shield */}
            <div className="absolute -right-4 -bottom-4 w-28 sm:w-36 h-28 sm:h-36 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500">
              <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="80" cy="80" r="70" stroke="#4ade80" strokeWidth="1" strokeDasharray="6 4" />
                <circle cx="80" cy="80" r="50" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" />
                <path d="M80 30 L120 50 V85 C120 110 80 130 80 130 C80 130 40 110 40 85 V50 Z" stroke="#4ade80" strokeWidth="2.5" fill="none" />
                <polyline points="65 80 75 90 95 68" stroke="#4ade80" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-400/10 border border-green-400/20 rounded-lg sm:rounded-xl flex items-center justify-center text-green-400 flex-shrink-0 relative z-10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 11 11 13 15 9" />
              </svg>
            </div>
            <div className="mt-4 sm:mt-6 relative z-10">
              <p className="text-[9px] sm:text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">
                {t("bento.fayda")}
              </p>
              <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-white mb-0.5 sm:mb-1">100%</p>
              <p className="text-zinc-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                {t("bento.fayda.desc")}
              </p>
            </div>
          </motion.div>

          {/* CARD 3: SATISFACTION (99.9% Proven Track Record) - Side-by-side widget on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4, borderColor: "rgba(56, 189, 248, 0.4)" }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="col-span-1 md:col-span-2 lg:col-span-1.5 p-4 sm:p-7 xl:p-8 rounded-2xl sm:rounded-[2rem] bg-zinc-900/50 border border-white/10 backdrop-blur-2xl flex flex-col justify-between hover:border-blue-400/30 transition-all text-left min-h-[150px] sm:min-h-[190px] relative overflow-hidden group"
          >
            {/* SERVER-SIDE RENDERED BACKGROUND GRAPHIC: High-Precision Dial & Gauge */}
            <div className="absolute -right-4 -bottom-4 w-28 sm:w-36 h-28 sm:h-36 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500">
              <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="80" cy="80" r="68" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M 30 110 A 60 60 0 1 1 130 110" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle cx="80" cy="80" r="10" fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="80" y1="80" x2="115" y2="55" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg sm:rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0 relative z-10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="mt-4 sm:mt-6 relative z-10">
              <p className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                {t("bento.satisfaction")}
              </p>
              <p className="text-2xl sm:text-3xl xl:text-4xl font-black text-white mb-0.5 sm:mb-1">99.9%</p>
              <p className="text-zinc-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                {t("bento.satisfaction.desc")}
              </p>
            </div>
          </motion.div>

          {/* CARD 4: "QUALITY IS OUR CURRENCY." (Quote text clean on mobile, secondary desc hidden on mobile) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            whileHover={{ y: -4, borderColor: "rgba(74, 222, 128, 0.35)" }}
            viewport={{ once: true }}
            className="col-span-2 md:col-span-4 lg:col-span-3 lg:row-span-1 rounded-3xl sm:rounded-[2.5rem] relative overflow-hidden border border-white/10 bg-zinc-900/60 p-5 sm:p-7 xl:p-8 flex flex-col justify-between text-left min-h-[130px] sm:min-h-[190px] group"
          >
            {/* SERVER-SIDE RENDERED BACKGROUND GRAPHIC: Guilloche Security Lattice */}
            <div className="absolute inset-0 pointer-events-none opacity-25 group-hover:opacity-40 transition-opacity duration-700">
              <svg
                viewBox="0 0 700 240"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full object-cover"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="quoteGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#090b0e" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#quoteGrad1)" />

                {/* Guilloche Waves */}
                <g stroke="#4ade80" strokeWidth="0.75" strokeOpacity="0.3" fill="none">
                  <path d="M 0 40 Q 175 0 350 40 T 700 40" />
                  <path d="M 0 60 Q 175 20 350 60 T 700 60" />
                  <path d="M 0 80 Q 175 40 350 80 T 700 80" />
                  <path d="M 0 100 Q 175 60 350 100 T 700 100" />
                  <path d="M 0 120 Q 175 80 350 120 T 700 120" />
                  <path d="M 0 140 Q 175 100 350 140 T 700 140" />
                  <path d="M 0 160 Q 175 120 350 160 T 700 160" />
                  <path d="M 0 180 Q 175 140 350 180 T 700 180" />
                  <path d="M 0 200 Q 175 160 350 200 T 700 200" />
                </g>

                {/* Official DireSkill Stamp Emblem Geometry */}
                <g transform="translate(540, 120)" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.15" fill="none">
                  <circle cx="0" cy="0" r="75" strokeDasharray="6 4" />
                  <circle cx="0" cy="0" r="62" stroke="#4ade80" strokeOpacity="0.25" />
                  <circle cx="0" cy="0" r="48" />
                  <polygon points="0,-36 28,-18 28,18 0,36 -28,18 -28,-18" stroke="#4ade80" strokeOpacity="0.3" />
                </g>
              </svg>
            </div>

            {/* Dark gradient for high contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-1.5 sm:space-y-2">
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] text-green-400">
                Institutional Standard
              </span>
              <p className="text-lg sm:text-xl xl:text-2xl font-black tracking-tight text-white uppercase">
                {t("bento.quote")}
              </p>
              <p className="hidden sm:block text-zinc-400 text-xs font-medium leading-relaxed max-w-md">
                {t("bento.quote.desc")}
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
