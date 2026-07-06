"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";
import Hero from "./landing/Hero";
import Categories from "./landing/Categories";
import Testimonials from "./landing/Testimonials";

export default function Home({ userRole }) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [tookTooLong, setTookTooLong] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      if (!mounted) setTookTooLong(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [mounted]);

  const toggleTheme = () => {
    const modes = ['grayscale', 'dark', 'light'];
    const currentTheme = theme || 'grayscale';
    const next = modes[(modes.indexOf(currentTheme) + 1) % modes.length];
    setTheme(next);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-10 text-center gap-6">
        <div className="w-12 h-12 border-2 border-green-400/20 border-t-green-400 rounded-full animate-spin"></div>
        {tookTooLong && (
          <div className="space-y-4">
             <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Initializing taking too long...</p>
             <button onClick={() => window.location.reload()} className="bg-green-400 text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Force Reload</button>
          </div>
        )}
      </div>
    );
  }

  const NAV_LINKS = [
    { name: t("nav.home"), href: "#home" },
    { name: t("nav.process"), href: "#process" },
    { name: t("nav.services"), href: "#services" },
    { name: t("nav.about"), href: "#about" },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-inter overflow-x-hidden selection:bg-green-400/30">
      
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 py-4">
        <div className="max-w-[95%] mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
                <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase">DIRE<span className="text-green-400">SKILL</span></span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-10 px-10 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            {NAV_LINKS.map(link => (
              <a key={link.name} href={link.href} className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-green-400 transition-all duration-300">
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1 bg-zinc-900 border border-white/5 rounded-xl p-1">
              <button onClick={() => setLanguage('en')} className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all ${language === 'en' ? 'bg-green-400 text-black' : 'text-zinc-500'}`}>EN</button>
              <button onClick={() => setLanguage('am')} className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all ${language === 'am' ? 'bg-green-400 text-black' : 'text-zinc-500'}`}>አማ</button>
            </div>

            {!userRole ? (
              <div className="hidden md:flex items-center gap-2">
                <a href="/login" className="px-5 h-10 flex items-center text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Login</a>
                <a href="/register/worker" className="bg-green-400 text-black px-6 h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-300 transition-all shadow-[0_10px_30px_rgba(74,222,128,0.2)]">
                  Join
                </a>
              </div>
            ) : (
              <a href={userRole === "admin" ? "/admin/dashboard" : userRole === "worker" ? "/worker/dashboard" : "/client/search"} className="hidden md:flex bg-white/10 border border-white/10 text-white px-6 h-10 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                Dashboard
              </a>
            )}

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1 bg-white/5 border border-white/10 rounded-xl">
              <div className={`w-5 h-0.5 bg-white transition-all ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <div className={`w-5 h-0.5 bg-white transition-all ${isMenuOpen ? "opacity-0" : ""}`} />
              <div className={`w-5 h-0.5 bg-white transition-all ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Editorial Hero */}
        <Hero userRole={userRole} t={t} />

        {/* Process Section */}
        <section id="process" className="py-32 px-6 md:px-12 lg:px-20 bg-[#09090b]">
          <div className="max-w-[95%] mx-auto">
            <div className="text-center mb-24 space-y-4">
               <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                  HOW IT <span className="text-green-400 italic">WORKS</span>
               </h2>
               <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                  We've built the most efficient way to find and hire professionals in Dire Dawa. Simple, fast, and entirely digital.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Search", desc: "Find experts based on skill, rating, and district proximity.", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800", icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                )},
                { step: "02", title: "Connect", desc: "Chat directly with professionals and discuss your requirements.", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800", icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                )},
                { step: "03", title: "Confirm", desc: "Secure the job with a digital contract and complete payment easily.", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800", icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                )},
                { step: "04", title: "Complete", desc: "Complete work, pay securely via Chapa, and rate each other.", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800", icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/></svg>
                )}
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className={`relative h-[300px] lg:h-[450px] p-10 rounded-[3rem] bg-[#0c0c0e] border border-white/5 hover:border-green-400/30 transition-all group overflow-hidden ${
                    i % 2 !== 0 ? 'lg:mt-16' : 'lg:mb-16'
                  }`}
                >
                   <img src={item.image} className="absolute inset-0 w-full h-full object-cover grayscale opacity-20 group-hover:opacity-40 transition-all duration-700" alt={item.title} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                   
                   <div className="absolute -top-12 -right-12 text-[15rem] font-black text-white/5 pointer-events-none group-hover:text-green-400/5 transition-colors leading-none">
                      {item.step}
                   </div>
                   <div className="relative z-10 flex flex-col h-full justify-end">
                      <div className="w-14 h-14 bg-green-400/10 rounded-2xl flex items-center justify-center text-green-400 mb-8 shadow-[0_0_40px_rgba(74,222,128,0.1)] group-hover:bg-green-400 group-hover:text-black transition-all duration-500">
                        {item.icon}
                      </div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">{item.title}</h3>
                      <p className="text-zinc-400 font-medium leading-relaxed text-sm max-w-[200px]">{item.desc}</p>
                   </div>
                   <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <Categories t={t} />

        {/* Modernizing Skills Section - Dashboard Bento Grid */}
        <section className="py-40 px-6 md:px-12 lg:px-20 bg-[#09090b] relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#4ade80_0%,transparent_50%)]" />
           </div>
           
           <div className="max-w-[95%] mx-auto relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 h-auto lg:h-[650px]">
                 
                 {/* Main Content Card */}
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="md:col-span-2 lg:col-span-3 lg:row-span-2 p-10 rounded-[2.5rem] bg-zinc-900/50 border border-white/10 backdrop-blur-3xl flex flex-col justify-center space-y-6 relative overflow-hidden group"
                 >
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 group-hover:opacity-20 transition-opacity">
                       <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="BG" />
                    </div>
                    <div className="relative z-10 space-y-6">
                       <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.85]">
                          MODERNIZING <br/><span className="text-green-400 italic">SKILLS.</span>
                       </h2>
                       <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-md">
                          Bringing the best of Dire Dawa's talent to your doorstep with digital trust and quality assurance.
                       </p>
                       <div className="pt-4">
                          <a href="/register/worker" className="inline-flex items-center gap-4 text-green-400 font-black uppercase tracking-[0.2em] text-[10px] hover:gap-6 transition-all">
                             Empower Your Career <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                          </a>
                       </div>
                    </div>
                 </motion.div>

                 {/* Stat Card 1 */}
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="md:col-span-1 p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl flex flex-col justify-between hover:border-green-400/30 transition-all group"
                 >
                    <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center text-green-400">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-2">FAYDA VERIFIED</p>
                       <p className="text-4xl font-black text-white mb-1">100%</p>
                       <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Safety integration</p>
                    </div>
                 </motion.div>

                 {/* Stat Card 2 */}
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="md:col-span-1 lg:col-span-2 p-8 rounded-[2rem] bg-zinc-900 border border-white/5 flex flex-col justify-between hover:border-green-400/30 transition-all group"
                 >
                    <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center text-green-400">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/></svg>
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-2">SATISFACTION</p>
                       <p className="text-4xl font-black text-white mb-1">99.9%</p>
                       <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Proven track record</p>
                    </div>
                 </motion.div>

                 {/* Image/Quote Card */}
                 <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="md:col-span-2 lg:col-span-3 lg:row-span-1 rounded-[2.5rem] relative overflow-hidden border border-white/10 group"
                 >
                    <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200" className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt="Work" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem]">
                       <p className="text-xl font-black tracking-tighter text-white mb-1 uppercase">"QUALITY IS OUR CURRENCY."</p>
                       <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest">Every professional on DireSkill passes a rigorous verification process.</p>
                    </div>
                 </motion.div>

              </div>
           </div>
        </section>

        {/* ── WHY CHOOSE US ── */}
        <section id="about" className="py-40 px-6 md:px-12 lg:px-20 bg-zinc-950">
          <div className="max-w-[95%] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Left: Portrait Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "SAVE ETB 500+", desc: "No more posters.", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400", tag: "ETB" },
                { title: "FAYDA SYNC", desc: "Identity verified.", image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=400", tag: "ID" },
                { title: "DIGITAL CONTRACT", desc: "No more disputes.", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=400", tag: "DOC" },
                { title: "MULTIMEDIA CHAT", desc: "Share & solve.", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400", tag: "CHAT" }
              ].map((benefit, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative h-[250px] md:h-[350px] rounded-[2.5rem] overflow-hidden border border-white/5 group"
                >
                   <img src={benefit.image} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" alt={benefit.title} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                   <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-xl border border-white/10 px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest">{benefit.tag}</div>
                   <div className="absolute bottom-6 left-6 right-6">
                      <h4 className="text-lg font-black text-white uppercase tracking-tight mb-1">{benefit.title}</h4>
                      <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{benefit.desc}</p>
                   </div>
                </motion.div>
              ))}
            </div>

            {/* Right: City-Wide Trust Component */}
            <motion.div 
               initial={{ opacity: 0, x: 40 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="space-y-10"
            >
               <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase leading-[0.85]">
                  WHY CHOOSE <br/><span className="text-green-400 italic">DIRESKILL?</span>
               </h2>
               <div className="space-y-6 max-w-lg">
                  <p className="text-zinc-500 text-xl font-medium leading-relaxed">
                     DireSkill is the first platform in Dire Dawa to synchronize identity with National ID (Fayda) for city-wide safety.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                     {[
                        { title: "Bidirectional Ratings", desc: "Build a real reputation.", icon: "STAR" },
                        { title: "City-Wide Reach", desc: "Work anywhere in Dire.", icon: "MAP" }
                     ].map((item, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                           <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2">{item.icon}</p>
                           <h5 className="text-white font-black text-sm uppercase tracking-tight mb-1">{item.title}</h5>
                           <p className="text-zinc-500 text-[10px] font-bold uppercase">{item.desc}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>

          </div>
        </section>

        {/* ── TRUST INDICATORS ── */}
        <section className="py-24 border-y border-white/5 bg-[#09090b]">
          <div className="max-w-[95%] mx-auto px-6 flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-black text-[10px]">FAYDA</div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white">National ID Integration</span>
            </div>
            <div className="flex items-center gap-4">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                 <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
               </svg>
               <span className="text-[10px] font-black uppercase tracking-widest text-white">Proclamation 1156/2019</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-black text-[8px]">CHAPA</div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white">Secure Payments</span>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials />

        {/* ── FINAL CTA ── */}
        <section className="py-40 px-6 md:px-12 lg:px-20 relative overflow-hidden">
           <div className="max-w-[95%] mx-auto relative z-10 overflow-hidden rounded-[4rem] border border-white/10">
              <div className="absolute inset-0">
                 <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover grayscale opacity-30" alt="CTA BG" />
                 <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />
              </div>
              
              <div className="relative z-10 px-12 py-32 md:px-24 space-y-16 text-left">
                <motion.h2 
                   initial={{ opacity: 0, y: 40 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase leading-[0.85] max-w-4xl"
                >
                  READY TO <span className="text-green-400 italic">TRANSFORM</span> YOUR WORK?
                </motion.h2>
                <div className="flex flex-wrap gap-8">
                  <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/register/client" 
                    className="bg-green-400 text-black px-16 h-20 flex items-center justify-center rounded-[2.5rem] text-sm font-black uppercase tracking-widest hover:bg-green-300 transition-all shadow-[0_20px_50px_rgba(74,222,128,0.3)]"
                  >
                    FIND A WORKER
                  </motion.a>
                  <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/register/worker" 
                    className="bg-white/10 border border-white/10 text-white px-16 h-20 flex items-center justify-center rounded-[2.5rem] text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-all backdrop-blur-xl"
                  >
                    JOIN AS PRO
                  </motion.a>
                </div>
              </div>
           </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="py-20 px-6 md:px-12 lg:px-24 bg-zinc-950 border-t border-white/5">
        <div className="max-w-[95%] mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                  <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
                  <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
                </svg>
              </div>
              <span className="text-xl font-black text-white uppercase tracking-tighter">DIRE<span className="text-green-400">SKILL</span></span>
            </div>
            <p className="text-zinc-500 text-xs font-black leading-relaxed uppercase tracking-[0.2em]">
              A Dire Dawa University Project<br/>
              ICT Department Innovation Lab
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Resources</h4>
            <div className="flex flex-col gap-4">
              <a href="#about" className="text-xs font-bold text-zinc-500 hover:text-green-400 transition-colors uppercase tracking-widest">About Us</a>
              <a href="#process" className="text-xs font-bold text-zinc-500 hover:text-green-400 transition-colors uppercase tracking-widest">How it Works</a>
              <a href="#services" className="text-xs font-bold text-zinc-500 hover:text-green-400 transition-colors uppercase tracking-widest">Services</a>
              <a href="#" className="text-xs font-bold text-zinc-500 hover:text-green-400 transition-colors uppercase tracking-widest">FAQ</a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Language</h4>
            <div className="flex flex-col gap-4">
               <button onClick={() => setLanguage('en')} className={`text-xs font-black uppercase tracking-widest text-left ${language === 'en' ? 'text-green-400' : 'text-zinc-500 hover:text-white'}`}>English</button>
               <button onClick={() => setLanguage('am')} className={`text-xs font-black uppercase tracking-widest text-left ${language === 'am' ? 'text-green-400' : 'text-zinc-500 hover:text-white'}`}>አማርኛ (Amharic)</button>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-green-400 transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-green-400 transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="max-w-[95%] mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            © 2026 DireSkill. Compliant with Ethiopian Labour Proclamation 1156/2019.
          </p>
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            Developed by DDU ICT Dept. Pilot Phase v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
