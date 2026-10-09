"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

// ── Core sections ──────────────────────────────────────────────────────────────
import Navbar               from "./landing/Navbar";
import Hero                 from "./landing/Hero";
import TrustIndicators      from "./landing/TrustIndicators";
import ProblemsSolutions    from "./landing/ProblemsSolutions";
import Process              from "./landing/Process";
import Categories           from "./landing/Categories";
import FeaturesMatrix       from "./landing/FeaturesMatrix";
import VerificationFlow     from "./landing/VerificationFlow";
import ContractPaymentVisual from "./landing/ContractPaymentVisual";
import StatsBento           from "./landing/StatsBento";
import Testimonials         from "./landing/Testimonials";
import FaqAccordion         from "./landing/FaqAccordion";
import Footer               from "./landing/Footer";

export default function LandingPageContent({ userRole }) {
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [tookTooLong, setTookTooLong] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#090b0e]" />;
  }

  return (
    <div
      className="min-h-screen bg-[#09090b] text-white overflow-x-hidden selection:bg-green-400/30"
      style={{ maxWidth: "100vw" }}
    >
      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <Navbar
        userRole={userRole}
        language={language}
        setLanguage={setLanguage}
        t={t}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      <main id="main-content">

        {/* 1. Hero — value proposition + product UI preview */}
        <Hero userRole={userRole} t={t} />

        {/* 2. Trust Indicators — build immediate credibility */}
        <TrustIndicators t={t} />

        {/* 3. Service Categories — immediate trade exploration */}
        <Categories t={t} />

        {/* 4. Social Proof / Stats Bento */}
        <StatsBento t={t} />

        {/* 5. Problems & Solutions — address pain points first */}
        <ProblemsSolutions t={t} />

        {/* 6. How It Works — 7-step visual process */}
        <Process t={t} />

        {/* 7. Features Matrix — tabbed by audience */}
        <FeaturesMatrix t={t} />

        {/* 8. Worker Verification — Fayda ID flow */}
        <VerificationFlow t={t} />

        {/* 9. Digital Contracts & Chapa Payments */}
        <ContractPaymentVisual t={t} />

        {/* 10. Reviews / Testimonials */}
        <Testimonials />

        {/* 11. FAQ Accordion */}
        <FaqAccordion t={t} />

        {/* 12. Final CTA */}
        <section className="py-10 sm:py-20 md:py-24 px-3 sm:px-4 md:px-8 lg:px-16 bg-zinc-950">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-[3rem] border border-white/8 bg-[#0c0c0e]">
              {/* Server-rendered trade blueprint background (zero external image requests, never fails) */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <svg viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
                  <defs>
                    <radialGradient id="ctaGlow" cx="80%" cy="30%" r="60%">
                      <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#0c0c0e" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#ctaGlow)" />
                  <g stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.08" fill="none">
                    <circle cx="900" cy="300" r="300" strokeDasharray="8 6" />
                    <circle cx="900" cy="300" r="200" stroke="#4ade80" strokeOpacity="0.15" />
                    <line x1="600" y1="300" x2="1200" y2="300" />
                    <line x1="900" y1="0" x2="900" y2="600" />
                  </g>
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0e] via-[#0c0c0e]/85 to-transparent" />
              </div>

              <div className="relative z-10 px-5 py-8 sm:px-12 sm:py-16 xl:px-24 max-w-2xl text-left">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-2xl sm:text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9] mb-2 sm:mb-4"
                >
                  {t("cta.title").split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="text-green-400 italic">{t("cta.title").split(" ").slice(-1)[0]}</span>
                </motion.h2>
                <p className="text-zinc-400 text-xs sm:text-base font-medium leading-relaxed mb-6 sm:mb-8 max-w-md">
                  {t("hero.subheadline")}
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="/client/search"
                    className="w-full sm:w-auto bg-green-400 text-black px-6 sm:px-10 h-11 sm:h-14 flex items-center justify-center rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-300 transition-all shadow-[0_8px_32px_rgba(74,222,128,0.3)] active:scale-95 text-center"
                  >
                    {t("cta.find")}
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="/register/worker"
                    className="w-full sm:w-auto bg-white/8 border border-white/10 text-white px-6 sm:px-10 h-11 sm:h-14 flex items-center justify-center rounded-xl sm:rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/15 transition-all backdrop-blur-xl active:scale-95 text-center"
                  >
                    {t("cta.join")}
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <Footer language={language} setLanguage={setLanguage} t={t} />
    </div>
  );
}
