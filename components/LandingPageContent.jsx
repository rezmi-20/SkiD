"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";

export default function Home({ userRole }) {
  const workspacePath = userRole === "admin" ? "/admin/dashboard" : 
                        userRole === "worker" ? "/worker/dashboard" : 
                        "/client/search";
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const modes = ['grayscale', 'dark', 'light'];
    const currentTheme = theme || 'grayscale';
    const next = modes[(modes.indexOf(currentTheme) + 1) % modes.length];
    setTheme(next);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-2 border-green-400/20 border-t-green-400 rounded-full animate-spin shadow-[0_0_20px_rgba(74,222,128,0.1)]"></div>
        <div className="text-green-400 text-[10px] font-black uppercase tracking-[0.3em] opacity-50">
          Initializing DireSkill...
        </div>
      </div>
    );
  }

  const fadeUpAnim = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-inter overflow-x-hidden relative selection:bg-green-400/30 selection:text-white">
      <div className="grain-overlay"></div>

      {/* ── NAVBAR ── */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
                <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
              </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase">DIRE<span className="text-green-400">SKILL</span></span>
        </div>
 
        <div className="flex items-center justify-end gap-3 md:gap-6">
          <div className="hidden lg:flex items-center gap-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1">
             {["home", "process", "services", "about"].map((key) => (
                <a key={key} href={`#${key}`} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                  {t(`nav.${key}`)}
                </a>
             ))}
          </div>

          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white group shrink-0"
            title="Toggle Theme"
          >
             {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
             ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
             )}
          </button>
          
          <div className="flex items-center gap-1.5 shrink-0 bg-white/5 border border-white/10 rounded-xl p-1">
            <button
               onClick={() => setLanguage('en')}
               className={`text-[10px] font-black uppercase tracking-widest transition-colors px-3 py-1.5 rounded-lg ${language === 'en' ? 'bg-green-400 text-black shadow-lg shadow-green-400/10' : 'text-zinc-500 hover:text-white'}`}>EN</button>
            <button 
               onClick={() => setLanguage('am')}
               className={`text-[10px] font-black uppercase tracking-widest transition-colors px-3 py-1.5 rounded-lg ${language === 'am' ? 'bg-green-400 text-black shadow-lg shadow-green-400/10' : 'text-zinc-500 hover:text-white'}`}>አማ</button>
          </div>

          {userRole ? (
            <a href={workspacePath} className="bg-green-400 text-black px-8 h-12 flex items-center justify-center rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-green-300 active:scale-95 transition-all shadow-[0_10px_40px_rgba(74,222,128,0.2)]">
              {t("common.workspace")}
            </a>
          ) : (
            <div className="flex items-center gap-3">
              <a href="/login" className="hidden sm:flex px-6 h-12 items-center text-zinc-400 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">{t("common.login")}</a>
              <a href="/register/client" className="bg-green-400 text-black px-8 h-12 flex items-center justify-center rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-green-300 active:scale-95 transition-all shadow-[0_10px_40px_rgba(74,222,128,0.2)]">{t("common.join")}</a>
            </div>
          )}
        </div>
      </nav>

      <main className="overflow-hidden">

        {/* ── HERO ── */}
        <section id="home" className="relative w-full min-h-screen flex items-center px-6 md:px-12 lg:px-24 overflow-hidden pt-32 pb-24">
          {/* Background */}
          <div className="absolute inset-0 z-0 bg-[#09090b]">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=85&w=2000"
              alt="Professional using digital platform"
              className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent"></div>
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-400/10 border border-green-400/20 rounded-full mb-8">
                 <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Dire Dawa's Official Service Network</span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                FIND TRUSTED <br />
                <span className="text-green-400 italic">EXPERTS</span> IN <br />
                DIRE DAWA
              </h1>
              <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-lg">
                The modern standard for hiring in the city. Verified workers, digital contracts, and absolute security for every job.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/register/client" className="bg-green-400 text-black px-10 h-16 flex items-center justify-center rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-green-300 active:scale-95 transition-all shadow-[0_20px_50px_rgba(74,222,128,0.25)]">
                  Hire a Worker Now
                </a>
                <a href="/register/worker" className="bg-zinc-900 border border-white/5 text-white px-10 h-16 flex items-center justify-center rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">
                  Join as Professional
                </a>
              </div>

              <div className="mt-16 flex items-center gap-12">
                 <div className="space-y-1">
                    <p className="text-3xl font-black tracking-tighter">450+</p>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Experts</p>
                 </div>
                 <div className="w-px h-10 bg-zinc-800"></div>
                 <div className="space-y-1">
                    <p className="text-3xl font-black tracking-tighter">1.5K</p>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Completed</p>
                 </div>
                 <div className="w-px h-10 bg-zinc-800"></div>
                 <div className="space-y-1">
                    <p className="text-3xl font-black tracking-tighter">4.9★</p>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rating</p>
                 </div>
              </div>
            </motion.div>

            {/* Right Content - Visual Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="hidden lg:block relative"
            >
               <div className="relative bg-zinc-900 border border-white/5 rounded-[3rem] p-8 shadow-2xl overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-green-400/10 transition-colors"></div>
                  
                  <div className="flex items-center gap-6 mb-12">
                     <div className="relative w-24 h-24 rounded-3xl overflow-hidden border-2 border-white/5 shadow-2xl">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300" className="w-full h-full object-cover" alt="Pro" />
                        <div className="absolute top-2 right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-black border-2 border-zinc-900">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                     </div>
                     <div>
                        <h3 className="text-2xl font-black tracking-tight mb-1">Tarik Tesfaye</h3>
                        <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-4">Master Electrician · Kezira</p>
                        <div className="flex items-center gap-1.5">
                           {[1,2,3,4,5].map(i => (
                              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-green-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                           ))}
                           <span className="text-zinc-500 text-[10px] font-bold ml-2">(124 Jobs)</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4 mb-12">
                     <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                           </div>
                           <p className="text-sm font-bold">Fayda ID Verified</p>
                        </div>
                        <span className="text-green-400 text-[10px] font-black uppercase">Active</span>
                     </div>
                     <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                           </div>
                           <p className="text-sm font-bold">Digital Contract</p>
                        </div>
                        <span className="text-green-400 text-[10px] font-black uppercase">Ready</span>
                     </div>
                  </div>

                  <button className="w-full bg-green-400 text-black h-16 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-green-300 transition-all shadow-xl shadow-green-400/10">
                    Hire This Worker
                  </button>
               </div>

               {/* Floating Badges */}
               <motion.div 
                 animate={{ y: [0, -10, 0] }} 
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute -top-6 -right-6 bg-zinc-800 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl z-20"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center text-black">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                     </div>
                     <p className="text-xs font-black uppercase tracking-wider">Trusted</p>
                  </div>
               </motion.div>
            </motion.div>

          </div>
        </section>

        {/* ── PROCESS SECTION ── */}
        <section id="process" className="py-32 px-6 md:px-12 lg:px-24 bg-zinc-950/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">SIMPLE <span className="text-green-400 italic">STEPS</span></h2>
                <p className="text-zinc-400 text-lg md:text-xl font-medium">Built specifically for the Dire Dawa community, making professional help accessible and safe.</p>
              </div>
              <div className="hidden md:block h-px flex-1 bg-zinc-800 mb-4 mx-12"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 { step: "01", title: t("process.step1.title"), desc: t("process.step1.desc"), icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
                 { step: "02", title: t("process.step2.title"), desc: t("process.step2.desc"), icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                 { step: "03", title: t("process.step3.title"), desc: t("process.step3.desc"), icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> }
               ].map((item, i) => (
                 <motion.div key={i} {...fadeUpAnim} transition={{ delay: i * 0.1 }} className="group space-y-8">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-green-400 group-hover:bg-green-400/5 transition-all duration-500 shadow-2xl">
                       <div className="text-green-400">{item.icon}</div>
                    </div>
                    <div className="space-y-4">
                       <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">{item.step}</span>
                       <h3 className="text-2xl font-black tracking-tight">{item.title}</h3>
                       <p className="text-zinc-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>

        {/* ── SERVICES INDEX ── */}
        <section id="services" className="py-32 px-6 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
             <div className="text-center max-w-3xl mx-auto mb-24">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8">SERVICE <span className="text-green-400 italic">INDEX</span></h2>
                <p className="text-zinc-400 text-lg md:text-xl font-medium">Everything from home repairs to specialized industrial maintenance, all in one place.</p>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {[
                  { id: 'electrician', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
                  { id: 'plumber', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                  { id: 'painter', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg> },
                  { id: 'satellite', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
                  { id: 'cleaning', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                  { id: 'carpenter', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg> }
                ].map((cat) => (
                  <a key={cat.id} href={`/client/search?category=${cat.id}`} className="group p-10 rounded-3xl bg-zinc-900 border border-white/5 hover:border-green-400 transition-all text-center flex flex-col items-center gap-6 shadow-2xl">
                     <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-green-400 group-hover:bg-green-400/10 transition-all duration-500">
                        {cat.icon}
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-white transition-colors">{t(`categories.${cat.id}`)}</span>
                  </a>
                ))}
             </div>
          </div>
        </section>

        {/* ── ABOUT / VALUE PROP ── */}
        <section id="about" className="py-32 px-6 md:px-12 lg:px-24 bg-zinc-950/50 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-400/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
           
           <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24 items-center relative z-10">
              <motion.div {...fadeUpAnim} className="flex-1">
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-8">THE FUTURE OF <br /> WORK IN DIRE DAWA.</h2>
                 <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed mb-12">
                   We are building the digital bridge that connects the city's talent with those who need it most. No more searching for posters—just pure professional connection.
                 </p>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                      { title: "Identity First", desc: "Every worker is Fayda-verified for your peace of mind." },
                      { title: "Fair Pricing", desc: "Transparent quotes and digital receipts for every job." },
                      { title: "Legal Safety", desc: "Automated digital contracts to protect your property." },
                      { title: "Local Pride", desc: "Designed and built for the Dire Dawa community." }
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                         <h4 className="text-white font-black uppercase text-xs tracking-widest">{item.title}</h4>
                         <p className="text-zinc-500 text-sm">{item.desc}</p>
                      </div>
                    ))}
                 </div>
              </motion.div>

              <motion.div {...fadeUpAnim} transition={{ delay: 0.2 }} className="flex-1 w-full max-w-lg">
                 <div className="bg-zinc-900 border border-white/5 p-1 rounded-[3.5rem] shadow-2xl relative">
                    <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800" className="w-full h-[600px] object-cover rounded-[3.2rem]" alt="Quality Work" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent rounded-[3.2rem]"></div>
                    <div className="absolute bottom-12 left-12 right-12">
                       <p className="text-3xl font-black tracking-tight mb-4">"DireSkill transformed my business."</p>
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center font-black text-black">S</div>
                          <div>
                             <p className="text-xs font-black uppercase">Sami Mohammed</p>
                             <p className="text-[10px] text-zinc-500 uppercase font-bold">Carpenter</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
           </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="py-24 px-6 md:px-12 lg:px-24 bg-[#09090b] border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
             <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                        <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
                        <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
                      </svg>
                  </div>
                  <span className="text-lg font-bold tracking-tight text-white uppercase">DIRE<span className="text-green-400">SKILL</span></span>
                </div>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed">The leading platform for verified skilled professionals in Dire Dawa, Ethiopia.</p>
                <div className="flex gap-4">
                   {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-center text-zinc-500 hover:text-green-400 hover:border-green-400/30 transition-all cursor-pointer">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>
                      </div>
                   ))}
                </div>
             </div>

             <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Platform</h4>
                <ul className="space-y-4">
                   {["home", "process", "services", "about"].map(key => (
                      <li key={key}><a href={`#${key}`} className="text-zinc-500 hover:text-green-400 transition-colors text-sm font-medium">{t(`nav.${key}`)}</a></li>
                   ))}
                </ul>
             </div>

             <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Support</h4>
                <ul className="space-y-4">
                   <li><a href="#" className="text-zinc-500 hover:text-green-400 transition-colors text-sm font-medium">Help Center</a></li>
                   <li><a href="#" className="text-zinc-500 hover:text-green-400 transition-colors text-sm font-medium">Safety Guidelines</a></li>
                   <li><a href="#" className="text-zinc-500 hover:text-green-400 transition-colors text-sm font-medium">Terms of Service</a></li>
                </ul>
             </div>

             <div className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Contact</h4>
                <p className="text-zinc-500 text-sm font-medium">Dire Dawa University <br /> Dire Dawa, Ethiopia</p>
                <p className="text-zinc-400 text-sm font-black">support@direskill.com</p>
             </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
             <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">© {new Date().getFullYear()} DIRESKILL. ALL RIGHTS RESERVED.</p>
             <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">BUILT BY DDU INNOVATION LAB</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
