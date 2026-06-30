"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

// Modular Sub-components
import Navbar from "./landing/Navbar";
import Hero from "./landing/Hero";
import Process from "./landing/Process";
import Categories from "./landing/Categories";
import StatsBento from "./landing/StatsBento";
import WhyChooseUs from "./landing/WhyChooseUs";
import Testimonials from "./landing/Testimonials";
import Footer from "./landing/Footer";

export default function Home({ userRole }) {
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [tookTooLong, setTookTooLong] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      if (!mounted) setTookTooLong(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-10 text-center gap-6">
        <div className="w-12 h-12 border-2 border-green-400/20 border-t-green-400 rounded-full animate-spin"></div>
        {tookTooLong && (
          <div className="space-y-4">
             <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Initializing taking too long...</p>
             <button onClick={() => window.location.reload()} className="bg-green-400 text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110">Force Reload</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-inter overflow-x-hidden selection:bg-green-400/30" style={{ maxWidth: "100vw" }}>
      
      {/* ── NAVBAR ── */}
      <Navbar 
        userRole={userRole} 
        language={language} 
        setLanguage={setLanguage} 
        t={t} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />

      <main>
        {/* Editorial Hero */}
        <Hero userRole={userRole} t={t} />

        {/* Process Section */}
        <Process t={t} />

        {/* Categories Section */}
        <Categories t={t} />

        {/* Stats Bento Section */}
        <StatsBento t={t} />

        {/* Why Choose Us Section */}
        <WhyChooseUs t={t} />

        {/* ── TRUST INDICATORS ── */}
        <section className="py-16 border-y border-white/5 bg-[#09090b]">
          <div className="max-w-[95%] mx-auto px-6 flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 hover:opacity-100 transition-all duration-700">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-black text-[10px] shadow-sm">FAYDA</div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white">{t("trust.fayda")}</span>
            </div>
            <div className="flex items-center gap-4">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                 <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
               </svg>
               <span className="text-[10px] font-black uppercase tracking-widest text-white">Proclamation 1156/2019</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-black text-[8px] shadow-sm">CHAPA</div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white">{t("trust.chapa")}</span>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* ── FINAL CTA ── */}
        <section className="py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
           <div className="max-w-[95%] mx-auto relative z-10 overflow-hidden rounded-[3.5rem] border border-white/10 bg-[#0c0c0e]">
              <div className="absolute inset-0 pointer-events-none">
                 {/* Grayscale filter removed from CTA background image */}
                 <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-30" alt="CTA BG" />
                 <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />
              </div>
              
              <div className="relative z-10 px-8 py-20 md:px-16 xl:px-24 space-y-12 text-left">
                <motion.h2 
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter text-white uppercase leading-[0.85] max-w-4xl"
                >
                  {t("cta.title").split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="text-green-400 italic">
                    {t("cta.title").split(" ").slice(-1)[0]}
                  </span>
                </motion.h2>
                <div className="flex flex-wrap gap-4 pt-2">
                  <motion.a 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="/client/search" 
                    className="bg-green-400 text-black px-12 h-16 flex items-center justify-center rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-green-300 transition-all shadow-[0_15px_40px_rgba(74,222,128,0.25)]"
                  >
                    {t("cta.find")}
                  </motion.a>
                  <motion.a 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="/register/worker" 
                    className="bg-white/10 border border-white/10 text-white px-12 h-16 flex items-center justify-center rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-xl"
                  >
                    {t("cta.join")}
                  </motion.a>
                </div>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <Footer language={language} setLanguage={setLanguage} t={t} />
      
    </div>
  );
}
