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

        {/* 3. Social Proof / Stats Bento */}
        <StatsBento t={t} />

        {/* 4. Problems & Solutions — address pain points first */}
        <ProblemsSolutions t={t} />

        {/* 5. How It Works — 7-step visual process */}
        <Process t={t} />

        {/* 6. Service Categories */}
        <Categories t={t} />

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
        <section className="py-24 px-4 md:px-8 lg:px-16 bg-zinc-950">
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-[3rem] border border-white/8 bg-[#0c0c0e]">
              {/* Background image */}
              <div className="absolute inset-0 pointer-events-none">
                <img
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=2000"
                  className="w-full h-full object-cover opacity-20"
                  alt=""
                  aria-hidden="true"
                  style={{ filter: "saturate(0.4)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0e] via-[#0c0c0e]/85 to-transparent" />
              </div>

              <div className="relative z-10 px-8 py-20 md:px-16 xl:px-24 max-w-2xl">
                <motion.h2
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9] mb-4"
                >
                  {t("cta.title").split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="text-green-400 italic">{t("cta.title").split(" ").slice(-1)[0]}</span>
                </motion.h2>
                <p className="text-zinc-400 text-base font-medium leading-relaxed mb-8 max-w-md">
                  {t("hero.subheadline")}
                </p>
                <div className="flex flex-wrap gap-3">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="/client/search"
                    className="bg-green-400 text-black px-10 h-14 flex items-center justify-center rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-300 transition-all shadow-[0_8px_32px_rgba(74,222,128,0.3)]"
                  >
                    {t("cta.find")}
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="/register/worker"
                    className="bg-white/8 border border-white/10 text-white px-10 h-14 flex items-center justify-center rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/15 transition-all backdrop-blur-xl"
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
