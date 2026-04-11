"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Home({ userRole }) {
  const workspacePath = userRole === "admin" ? "/admin/dashboard" : 
                        userRole === "worker" ? "/worker/dashboard" : 
                        "/client/search";
  const [theme, setTheme] = useState('theme-img');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('direskill-theme');
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('direskill-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    const modes = ['theme-img', 'dark', 'light'];
    const next = modes[(modes.indexOf(theme) + 1) % modes.length];
    setTheme(next);
  };

  if (!mounted) return <div className="min-h-screen bg-background" />;

  const fadeUpAnim = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const testimonials = [
    { name: "Amanuel T.", role: "Client from Kezira", text: "I found a reliable plumber in 5 minutes using the location filter for Kezira. The digital contract gave me peace of mind.", icon: "A" },
    { name: "Sami Mohammed", role: "House Finishing Expert", text: "Before DireSkill, I had to travel and pay for posters everywhere. Now I accept requests from across the city on my phone.", img: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=200" },
    { name: "Tarik Tesfaye", role: "Master Electrician", text: "The Fayda verification means clients trust me instantly. My income has grown by 40% since I joined the platform.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" },
    { name: "Betelhem Y.", role: "Client from Megala", text: "I sent a video of my leaking pipe to the plumber right away. He knew exactly what parts to bring before arriving.", icon: "B" }
  ];

  return (
    <div className="min-h-screen bg-background text-text-high font-body overflow-x-hidden relative">
      <div className="grain-overlay"></div>

      {/* ── NAVBAR ── */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 md:py-5 bg-background/60 border-b border-border/10 backdrop-blur-2xl">
        <div className="flex items-center gap-3 text-xl md:text-2xl font-black text-text-high tracking-tighter">

          DIRESKILL
        </div>
 
        {/* Desktop nav */}
        <div className="hidden lg:flex items-center bg-surface backdrop-blur-2xl border border-border rounded-2xl h-11 px-1">
          <a href="#" className="px-6 h-9 flex items-center hover:bg-white/10 hover:text-text-high transition-all rounded-xl text-xs font-bold uppercase tracking-widest text-text-med">Home</a>
          <a href="#how-it-works" className="px-6 h-9 flex items-center hover:bg-white/10 hover:text-text-high transition-all rounded-xl text-xs font-bold uppercase tracking-widest text-text-med">Process</a>
          <a href="#categories" className="px-6 h-9 flex items-center hover:bg-white/10 hover:text-text-high transition-all rounded-xl text-xs font-bold uppercase tracking-widest text-text-med">Services</a>
          <a href="#about" className="px-6 h-9 flex items-center hover:bg-white/10 hover:text-text-high transition-all rounded-xl text-xs font-bold uppercase tracking-widest text-text-med">About</a>
        </div>
 
        <div className="flex items-center justify-end gap-2 md:gap-4 flex-wrap sm:flex-nowrap">
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl bg-surface border border-border hover:bg-white/10 transition-all text-text-high group shrink-0"
            title="Toggle Theme"
          >
            <span className="material-symbols-outlined text-lg md:text-xl group-hover:rotate-12 transition-transform">
              {theme === 'theme-img' ? 'contrast' : theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
          
          <div className="flex items-center gap-1.5 md:gap-4 mr-0 md:mr-4 shrink-0">
            <button className="text-text-med hover:text-text-high text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors">EN</button>
            <div className="h-3 w-px bg-border"></div>
            <button className="text-text-med hover:text-text-high text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-colors">አማ</button>
          </div>
          {userRole ? (
            <a href={workspacePath} className="flex bg-primary text-black px-6 md:px-8 h-8 md:h-10 items-center justify-center rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-primary/80 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] whitespace-nowrap shrink-0">
              Workspace
            </a>
          ) : (
            <>
              <a href="/login" className="flex h-8 md:h-10 px-3 md:px-6 items-center rounded-xl text-text-med text-[10px] md:text-xs font-black uppercase tracking-widest border border-border hover:bg-surface transition-all whitespace-nowrap shrink-0">Login</a>
              <a href="/register/client" className="flex bg-primary text-black px-4 md:px-8 h-8 md:h-10 items-center justify-center rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-primary/80 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] whitespace-nowrap shrink-0">Join</a>
            </>
          )}
        </div>
      </nav>

      <main className="overflow-hidden">

        {/* ── HERO ── */}
        <section className="relative w-full min-h-screen flex items-center px-4 md:px-8 lg:px-16">
          {/* Background — person at PC, more visible */}
          <div className="absolute inset-0 z-0 bg-background">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=85"
              alt="Professional using digital platform"
              className="w-full h-full object-cover opacity-90 theme-img"
            />
            <div className="hero-overlay-r absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-background/5"></div>
            <div className="hero-overlay-t absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/10"></div>
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center pt-24 pb-16 md:pt-32 md:pb-20">

            {/* LEFT — Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9 }}
              className="hero-text flex flex-col items-center text-center lg:items-start lg:text-left"
            >
              <span className="text-text-med text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-4 md:mb-6">Dire Dawa's Trusted Platform</span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-text-high mb-5 md:mb-8 leading-[1.0] text-gradient">
                Find Trusted Workers in<br />Dire Dawa
              </h1>
              <p className="text-base md:text-xl text-text-med leading-relaxed mb-8 md:mb-12 max-w-lg">
                Hire electricians, plumbers & more with the speed of digital curation and the trust of community roots.
              </p>

              {/* Stats */}
              <div className="flex gap-6 md:gap-10">
                <div>
                  <p className="text-2xl md:text-4xl font-black text-text-high">350+</p>
                  <p className="text-text-med text-[10px] md:text-sm mt-1 uppercase tracking-widest">Verified Workers</p>
                </div>
                <div className="border-l border-border pl-6 md:pl-10">
                  <p className="text-2xl md:text-4xl font-black text-text-high">1.2k</p>
                  <p className="text-text-med text-[10px] md:text-sm mt-1 uppercase tracking-widest">Jobs Completed</p>
                </div>
                <div className="border-l border-border pl-6 md:pl-10">
                  <p className="text-2xl md:text-4xl font-black text-text-high">4.9★</p>
                  <p className="text-text-med text-[10px] md:text-sm mt-1 uppercase tracking-widest">Avg Rating</p>
                </div>
              </div>
            </motion.div>

            {/* RIGHT — Worker Card + Search */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="flex flex-col gap-4"
            >
              {/* Demo Worker Profile Card */}
              <motion.div 
                whileHover={{ y: -5, scale: 1.01 }}
                className="hidden lg:block bg-surface backdrop-blur-3xl border border-border rounded-[2rem] p-6 md:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.7)] relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] overflow-hidden border-2 border-border shadow-2xl relative">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover theme-img group-hover:grayscale-0 transition-all duration-700" alt="Tarik Tesfaye" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <h4 className="text-text-high font-black text-xl md:text-2xl truncate tracking-tight">Tarik Tesfaye</h4>
                      <span className="material-symbols-outlined text-brand-accent text-xl animate-pulse" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
                    </div>
                    <p className="text-text-med text-xs md:text-sm font-bold tracking-[0.1em] uppercase mb-4">Master Electrician · Kezira</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex gap-0.5 text-text-high/90">
                        {[1,2,3,4,5].map(i => <span key={i} className="material-symbols-outlined text-xs" style={{fontVariationSettings:"'FILL' 1"}}>star</span>)}
                      </div>
                      <span className="text-text-med text-[10px] font-black uppercase tracking-widest whitespace-nowrap">5.0 · 38 jobs</span>
                      <div className="px-3 py-1 bg-surface text-text-high/90 text-[10px] font-black uppercase tracking-widest rounded-full border border-border shadow-inner">Fayda ID ✓</div>
                    </div>
                  </div>
                </div>

                {/* Action buttons on card */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 bg-surface hover:bg-black/5 border border-border text-text-high text-xs md:text-sm font-black py-4 rounded-2xl transition-all active:scale-95">
                    <span className="material-symbols-outlined text-xl">forum</span>
                    Message
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-primary text-black text-xs md:text-sm font-black py-4 rounded-2xl hover:bg-primary/80 active:scale-95 transition-all shadow-[0_15px_30px_rgba(255,255,255,0.1)]">
                    <span className="material-symbols-outlined text-xl">contact_emergency</span>
                    Hire Now
                  </button>
                </div>
              </motion.div>

              {/* Search Experience */}
              <div className="flex flex-col gap-3 bg-surface backdrop-blur-3xl border border-border rounded-[2.5rem] p-4 shadow-2xl relative group">
                <div className="light-input-row flex items-center bg-background/40 rounded-3xl px-6 py-5 border border-border/50 focus-within:border-primary/50 transition-all hover:bg-background/60">
                  <span className="material-symbols-outlined text-text-med mr-4 text-2xl group-search:text-primary transition-colors">travel_explore</span>
                  <input type="text" placeholder="What service do you need?" className="bg-transparent border-none text-text-high w-full outline-none focus:ring-0 placeholder:text-text-med text-base md:text-lg font-medium" />
                </div>
                <div className="light-input-row flex items-center bg-background/60 rounded-xl px-4 py-3 border border-border/50 focus-within:border-primary/50 transition-all">
                  <span className="material-symbols-outlined text-text-med mr-3 text-xl">my_location</span>
                  <select className="bg-transparent border-none text-text-high w-full outline-none focus:ring-0 appearance-none text-sm md:text-base cursor-pointer">
                    <option value="" className="bg-background text-text-high">All Neighborhoods</option>
                    <option value="kezira" className="bg-background text-text-high">Kezira</option>
                    <option value="gende_korem" className="bg-background text-text-high">Gende Korem</option>
                    <option value="megala" className="bg-background text-text-high">Megala</option>
                  </select>
                  <span className="material-symbols-outlined text-text-med ml-2">expand_more</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={userRole ? workspacePath : "/register/client"} className="flex-1 bg-primary text-black px-6 py-4 rounded-2xl font-black tracking-wide hover:bg-primary/80 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm md:text-base">
                  {userRole ? "Enter Workspace" : "Find a Worker Now"}
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </a>
                {!userRole && (
                  <a href="/register/worker" className="flex-1 bg-surface border border-border hover:bg-black/5 text-text-high px-6 py-4 rounded-2xl font-bold tracking-wide transition-all text-center text-sm md:text-base">
                    Join as a Skilled Worker
                  </a>
                )}
              </div>
            </motion.div>

          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-20 md:py-32 px-4 md:px-8 lg:px-16 bg-background border-y border-border/10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-text-high mb-4 md:mb-6 tracking-tight">How It Works</h2>
              <p className="text-base md:text-xl text-text-med max-w-2xl mx-auto px-4">Simple steps to get your project done accurately and safely.</p>
            </div>

            {/* How It Works — 2×2 two-column masonry, no gaps */}
            <div className="flex gap-3 md:gap-4">

              {/* Left column: tall then short */}
              <div className="flex flex-col gap-3 md:gap-4 flex-1">
                {/* Card 1 — TALL */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, translateY: -5 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative overflow-hidden group bg-black rounded-2xl md:rounded-3xl border border-white/10 h-64 md:h-80 cursor-pointer shadow-2xl"
                >
                  <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover theme-img opacity-75 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700" alt="Search" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end">
                    <div className="text-7xl font-black text-white/5 absolute top-2 right-4 leading-none group-hover:text-white/10 transition-colors pointer-events-none">1</div>
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/15 text-white group-hover:bg-white group-hover:text-black transition-all">
                      <span className="material-symbols-outlined text-xl">travel_explore</span>
                    </div>
                    <h3 className="text-base md:text-lg font-black text-white mb-2">Search & Browse</h3>
                    <p className="text-text-med text-xs md:text-sm leading-relaxed max-w-[200px]">Find verified workers using map locators and smart filters across Dire Dawa.</p>
                  </div>
                </motion.div>

                {/* Card 3 — SHORT */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, translateY: -5 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                  className="relative overflow-hidden group bg-black rounded-2xl md:rounded-3xl border border-white/10 h-44 md:h-56 cursor-pointer shadow-2xl"
                >
                  <img src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover theme-img opacity-75 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700" alt="Contract" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end">
                    <div className="text-7xl font-black text-white/5 absolute top-2 right-4 leading-none group-hover:text-white/10 transition-colors pointer-events-none">3</div>
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/15 text-white group-hover:bg-white group-hover:text-black transition-all">
                      <span className="material-symbols-outlined text-xl">contract</span>
                    </div>
                    <h3 className="text-base md:text-lg font-black text-white mb-2">Digital Agreement</h3>
                    <p className="text-text-med text-xs md:text-sm leading-relaxed">Create a downloadable PDF contract to protect both scope and timeline.</p>
                  </div>
                </motion.div>
              </div>

              {/* Right column: short then tall */}
              <div className="flex flex-col gap-3 md:gap-4 flex-1">
                {/* Card 2 — SHORT */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, translateY: -5 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
                  className="relative overflow-hidden group bg-black rounded-2xl md:rounded-3xl border border-white/10 h-44 md:h-56 cursor-pointer shadow-2xl"
                >
                  <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover theme-img opacity-75 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700" alt="Share Media" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end">
                    <div className="text-7xl font-black text-white/5 absolute top-2 right-4 leading-none group-hover:text-white/10 transition-colors pointer-events-none">2</div>
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/15 text-white group-hover:bg-white group-hover:text-black transition-all">
                      <span className="material-symbols-outlined text-xl">mms</span>
                    </div>
                    <h3 className="text-base md:text-lg font-black text-white mb-2">Share Media</h3>
                    <p className="text-text-med text-xs md:text-sm leading-relaxed">Communicate with photos and videos to solve problems before travel occurs.</p>
                  </div>
                </motion.div>

                {/* Card 4 — TALL */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, translateY: -5 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: 0.22, ease: "easeOut" }}
                  className="relative overflow-hidden group bg-black rounded-2xl md:rounded-3xl border border-white/10 h-64 md:h-80 cursor-pointer shadow-2xl"
                >
                  <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover theme-img opacity-75 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700" alt="Complete Rate" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end">
                    <div className="text-7xl font-black text-white/5 absolute top-2 right-4 leading-none group-hover:text-white/10 transition-colors pointer-events-none">4</div>
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/15 text-white group-hover:bg-white group-hover:text-black transition-all">
                      <span className="material-symbols-outlined text-xl">thumb_up</span>
                    </div>
                    <h3 className="text-base md:text-lg font-black text-white mb-2">Complete & Rate</h3>
                    <p className="text-text-med text-xs md:text-sm leading-relaxed max-w-[200px]">Pay securely and build mutual trust via bidirectional ratings.</p>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* ── SERVICE CATEGORIES ── */}
        <section id="categories" className="py-20 md:py-32 px-4 md:px-8 lg:px-16 bg-background border-b border-border/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-4">
              <div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-text-high mb-3 md:mb-4 tracking-tight">Popular Service Categories</h2>
                <p className="text-base md:text-xl text-text-med">Explore our most requested expert categories.</p>
              </div>
              <button className="group flex items-center gap-2 bg-surface border border-border/50 px-5 py-2.5 rounded-full text-text-high font-black text-xs md:text-sm tracking-wide hover:border-primary hover:bg-primary/5 transition-all shrink-0">
                View all 
                <span className="material-symbols-outlined text-base md:text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>

            {/* Categories — 3-column two-col-flex masonry, no gaps */}
            <div className="flex gap-3 md:gap-4">

              {/* Column A: tall → short */}
              <div className="flex flex-col gap-3 md:gap-4 flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}
                  viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, ease: "easeOut" }}
                  className="relative group bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 cursor-pointer h-64 md:h-80"
                >
                  <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover theme-img opacity-80 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700" alt="Electrician" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 text-white group-hover:bg-white group-hover:text-black transition-all"><span className="material-symbols-outlined text-lg">electrical_services</span></div>
                    <div><h4 className="text-sm md:text-base font-black text-white mb-1">Electrician</h4><div className="h-0.5 w-full bg-white/20 mb-1.5"></div><div className="flex items-center gap-1 text-[10px] font-black text-white transition-all">Find Workers <span className="material-symbols-outlined text-xs">arrow_forward</span></div></div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}
                  viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay: 0.18, ease: "easeOut" }}
                  className="relative group bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 cursor-pointer h-44 md:h-56"
                >
                  <img src="https://images.unsplash.com/photo-1508344928928-7137b67de192?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover theme-img opacity-80 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700" alt="Satellite Dish" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 text-white group-hover:bg-white group-hover:text-black transition-all"><span className="material-symbols-outlined text-lg">satellite_alt</span></div>
                    <div><h4 className="text-sm md:text-base font-black text-white mb-1">Satellite Dish</h4><div className="h-0.5 w-full bg-white/20 mb-1.5"></div><div className="flex items-center gap-1 text-[10px] font-black text-white transition-all">Find Workers <span className="material-symbols-outlined text-xs">arrow_forward</span></div></div>
                  </div>
                </motion.div>
              </div>

              {/* Column B: short → medium */}
              <div className="flex flex-col gap-3 md:gap-4 flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}
                  viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
                  className="relative group bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 cursor-pointer h-48 md:h-60"
                >
                  <img src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover theme-img opacity-80 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700" alt="Plumber" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 text-white group-hover:bg-white group-hover:text-black transition-all"><span className="material-symbols-outlined text-lg">plumbing</span></div>
                    <div><h4 className="text-sm md:text-base font-black text-white mb-1">Plumber</h4><div className="h-0.5 w-full bg-white/20 mb-1.5"></div><div className="flex items-center gap-1 text-[10px] font-black text-white transition-all">Find Workers <span className="material-symbols-outlined text-xs">arrow_forward</span></div></div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}
                  viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay: 0.22, ease: "easeOut" }}
                  className="relative group bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 cursor-pointer h-56 md:h-72"
                >
                  <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover theme-img opacity-80 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700" alt="House Finishing" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 text-white group-hover:bg-white group-hover:text-black transition-all"><span className="material-symbols-outlined text-lg">roofing</span></div>
                    <div><h4 className="text-sm md:text-base font-black text-white mb-1">House Finishing</h4><div className="h-0.5 w-full bg-white/20 mb-1.5"></div><div className="flex items-center gap-1 text-[10px] font-black text-white transition-all">Find Workers <span className="material-symbols-outlined text-xs">arrow_forward</span></div></div>
                  </div>
                </motion.div>
              </div>

              {/* Column C: medium → tall (Other Services) */}
              <div className="flex flex-col gap-3 md:gap-4 flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}
                  viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay: 0.14, ease: "easeOut" }}
                  className="relative group bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 cursor-pointer h-56 md:h-68"
                >
                  <img src="https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover theme-img opacity-80 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700" alt="Painter" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 text-white group-hover:bg-white group-hover:text-black transition-all"><span className="material-symbols-outlined text-lg">format_paint</span></div>
                    <div><h4 className="text-sm md:text-base font-black text-white mb-1">Painter</h4><div className="h-0.5 w-full bg-white/20 mb-1.5"></div><div className="flex items-center gap-1 text-[10px] font-black text-white transition-all">Find Workers <span className="material-symbols-outlined text-xs">arrow_forward</span></div></div>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}
                  viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay: 0.28, ease: "easeOut" }}
                  className="relative group bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 cursor-pointer h-52 md:h-64"
                >
                  <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover theme-img opacity-80 group-hover:opacity-95 group-hover:scale-110 transition-all duration-700" alt="Other Services" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                  <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15 text-white group-hover:bg-white group-hover:text-black transition-all"><span className="material-symbols-outlined text-lg">grid_view</span></div>
                    <div><h4 className="text-sm md:text-base font-black text-white mb-1">Other Services</h4><div className="h-0.5 w-full bg-white/20 mb-1.5"></div><span className="text-[10px] text-white transition-colors font-black">See more</span></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BENEFITS ── */}
        <section id="about" className="py-24 md:py-32 px-4 md:px-8 lg:px-16 bg-background border-y border-border/10 relative overflow-hidden">
          <div className="light-hide absolute top-0 right-0 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 md:gap-24 items-center">
            <motion.div className="flex-1 w-full" {...fadeUpAnim}>
              <h2 className="text-4xl md:text-6xl font-black text-text-high mb-6 md:mb-8 tracking-tighter leading-[1.1]">The smart way to hire in Dire Dawa.</h2>
              <p className="text-lg md:text-xl text-text-med mb-10 md:mb-14 max-w-2xl leading-relaxed">
                We are replacing the chaotic poster-hunting system with a transparent, legally compliant digital platform designed for our community.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                {[
                  { icon: "savings", title: "Save Money", desc: "Workers save up to ETB 1,000 monthly on printing costs." },
                  { icon: "fingerprint", title: "Fayda ID", desc: "Total safety through identity verification for absolute trust." },
                  { icon: "gavel", title: "Contracts", desc: "Prevent disputes with transparent agreed digital terms upfront." },
                  { icon: "mms", title: "Multimedia", desc: "Send photos and videos to solve problems before travel." },
                  { icon: "star_rate", title: "Reputation", desc: "Grow business through honest bidirectional ratings." },
                  { icon: "map", title: "Anywhere", desc: "Accept jobs from anywhere in Dire Dawa instantly." },
                ].map((feat, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 5 }}
                    className="flex gap-4 p-5 rounded-2xl bg-surface border border-border hover:bg-white/10 transition-all group cursor-default"
                  >
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-surface border border-border flex items-center justify-center text-text-high group-hover:bg-primary group-hover:text-black transition-all duration-300">
                      <span className="material-symbols-outlined text-xl">{feat.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-text-high text-base mb-1">{feat.title}</h4>
                      <p className="text-text-med text-xs leading-relaxed">{feat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div className="flex-1 w-full max-w-md" {...fadeUpAnim} transition={{ delay: 0.2 }}>
              <div className="relative flex flex-col items-center lg:items-stretch gap-4 lg:gap-6 transform lg:rotate-2">
                <div className="light-hide absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                {/* Visual 1 */}
                <motion.div 
                  initial={{ x: 20, opacity: 0 }} 
                  whileInView={{ x: 0, opacity: 1 }} 
                  className="animate-float bg-surface backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-2xl relative z-20"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)]"><span className="material-symbols-outlined text-black text-2xl">verified_user</span></div>
                    <div>
                      <p className="text-text-high font-black text-base">Fayda Verified</p>
                      <p className="text-text-med text-[10px] tracking-widest uppercase font-bold">Authenticated Profile</p>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  </div>
                  <div className="h-1.5 w-full bg-background/20 rounded-full overflow-hidden">
                    <div className="h-full w-[90%] bg-primary rounded-full"></div>
                  </div>
                </motion.div>

                {/* Visual 2 */}
                <motion.div 
                  initial={{ x: -20, opacity: 0 }} 
                  whileInView={{ x: 0, opacity: 1 }} 
                  transition={{ delay: 0.15 }} 
                  style={{ animationDelay: '1s' }}
                  className="animate-float w-full bg-primary p-7 rounded-[2rem] shadow-2xl lg:ml-8 lg:-translate-y-4 relative z-30"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-11 h-11 bg-black rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-base">done_all</span>
                    </div>
                    <div>
                      <p className="text-black font-black text-base">Contract Signed</p>
                      <p className="text-black/50 text-xs font-medium italic">Satellite Installation #8023</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="px-4 py-1.5 bg-black/[0.03] rounded-full text-[10px] font-black text-black/60 border border-black/5 tracking-wider uppercase">PDF Generated</div>
                    <div className="px-4 py-1.5 bg-black/[0.03] rounded-full text-[10px] font-black text-black/60 border border-black/5 tracking-wider uppercase">Vault Secured</div>
                  </div>
                </motion.div>

                {/* Visual 3 */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }} 
                  whileInView={{ y: 0, opacity: 1 }} 
                  transition={{ delay: 0.3 }} 
                  style={{ animationDelay: '2s' }}
                  className="animate-float w-full bg-background border border-border p-6 rounded-[2rem] shadow-2xl lg:translate-x-4 lg:-translate-y-8 relative z-10 hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex -space-x-3">
                      <div className="w-11 h-11 rounded-full bg-surface border-4 border-background overflow-hidden shadow-xl">
                        <img src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover theme-img" alt="Reviewer" />
                      </div>
                      <div className="w-11 h-11 rounded-full bg-surface border-4 border-background flex items-center justify-center font-black text-xs text-text-high shadow-xl">AT</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-text-high font-black text-sm">Bidirectional Ratings</p>
                      <p className="text-text-med text-[10px] uppercase font-black">Mutual Trust Built</p>
                    </div>
                  </div>
                  <div className="flex gap-1 text-primary">
                    {[1,2,3,4,5].map(i => <span key={i} className="material-symbols-outlined text-xs" style={{fontVariationSettings:"'FILL' 1"}}>star</span>)}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── TESTIMONIALS MARQUEE ── */}
        <section className="py-20 md:py-32 bg-background overflow-hidden border-b border-border/10">
          <div className="text-center mb-12 md:mb-20 px-4">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-text-high mb-4 md:mb-6 tracking-tight">Trusted by Dire Dawa</h2>
            <p className="text-base md:text-xl text-text-med">Hear from our pilot users who have experienced the difference.</p>
          </div>

          <div className="pause-marquee relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10"></div>

            <div className="animate-marquee flex gap-4 md:gap-8 py-3">
              {[1, 2].map((loop) => (
                <div key={loop} className="flex gap-4 md:gap-8">
                  {testimonials.map((testimony, idx) => (
                    <div key={idx} className="w-[300px] md:w-[420px] bg-surface border border-border p-6 md:p-8 rounded-2xl md:rounded-3xl shrink-0 hover:border-primary transition-colors relative">
                      <span className="material-symbols-outlined text-5xl text-text-high/5 absolute top-4 right-5 pointer-events-none">format_quote</span>
                      <p className="text-sm md:text-base text-text-high/70 leading-relaxed mb-6 italic">"{testimony.text}"</p>
                      <div className="flex items-center gap-3">
                        {testimony.img ? (
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-border bg-background shrink-0">
                            <img src={testimony.img} className="w-full h-full object-cover theme-img" alt={testimony.name} />
                          </div>
                        ) : (
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface flex items-center justify-center text-text-high font-black border border-border shrink-0 text-sm">{testimony.icon}</div>
                        )}
                        <div>
                          <h4 className="text-text-high font-black text-sm">{testimony.name}</h4>
                          <p className="text-text-med text-[10px] tracking-wide uppercase">{testimony.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SEPARATION SECTION ── */}
        <section className="relative py-20 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000" 
              className="w-full h-full object-cover theme-img opacity-70 scale-105" 
              alt="Professional architecture"
            />
            <div className="section-overlay absolute inset-0 bg-background/90"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <motion.div 
              {...fadeUpAnim} 
              whileHover={{ y: -5 }}
              className="group relative bg-black p-10 md:p-16 rounded-[2rem] md:rounded-[3.5rem] flex flex-col items-center text-center border border-white/10 hover:border-primary transition-all duration-500 cursor-pointer overflow-hidden"
            >
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-all duration-500 theme-img" alt="Professional working at table" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
              
              <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                <span className="material-symbols-outlined text-white text-4xl md:text-5xl group-hover:text-black transition-colors">search</span>
              </div>
              
              <h3 className="relative z-10 text-2xl md:text-4xl font-black text-white mb-4 tracking-tight">I am looking for a professional</h3>
              <p className="relative z-10 text-base md:text-xl mb-10 text-white/80 leading-relaxed max-w-md">Hire verified experts with digital contracts and guaranteed satisfaction.</p>
              
              <a href="/register/client" className="relative z-10 bg-primary text-black px-10 py-5 rounded-2xl font-black text-base md:text-lg hover:bg-primary/80 active:scale-95 transition-all shadow-[0_10px_30px_rgba(204,255,0,0.2)]">
                Start Hiring
              </a>
            </motion.div>

            <motion.div 
              {...fadeUpAnim} 
              transition={{ delay: 0.15 }} 
              whileHover={{ y: -5 }}
              className="group relative bg-surface backdrop-blur-2xl border border-border p-10 md:p-16 rounded-[2rem] md:rounded-[3.5rem] flex flex-col items-center text-center hover:border-primary transition-all duration-500 cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="w-20 h-20 md:w-24 md:h-24 bg-surface border border-border rounded-3xl flex items-center justify-center mb-8 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                <span className="material-symbols-outlined text-text-high text-4xl md:text-5xl group-hover:text-black transition-colors">engineering</span>
              </div>
              
              <h3 className="text-2xl md:text-4xl font-black text-text-high mb-4 tracking-tight">I am a skilled professional</h3>
              <p className="text-base md:text-xl mb-10 text-text-med leading-relaxed max-w-md">Join the elite network of Fayda-verified experts and grow your business.</p>
              
              <a href="/register/worker" className="bg-primary text-black px-10 py-5 rounded-2xl font-black text-base md:text-lg hover:bg-primary/80 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
                Join as Member
              </a>
            </motion.div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="relative border-t border-border/10 bg-background pt-20 pb-10 px-4 md:px-8 lg:px-16 overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-primary/3 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 mb-20">
          <div className="flex flex-col gap-6 max-w-sm">
            <div className="text-2xl font-black text-text-high tracking-tighter flex items-center gap-2.5">

              DIRESKILL
            </div>
            <p className="text-text-med text-sm md:text-base leading-relaxed">
              The digital hub connecting Dire Dawa's verified skilled labor with immediate opportunity. Empowering locals through digital infrastructure.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                <span className="material-symbols-outlined text-xl">forum</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                <span className="material-symbols-outlined text-xl">share</span>
              </a>
            </div>
          </div>
 
          <div className="grid grid-cols-2 md:grid-cols-2 gap-12 sm:gap-24">
            <div className="flex flex-col gap-5">
              <span className="text-text-high font-black text-xs uppercase tracking-[0.2em] opacity-30">Platform</span>
              <div className="flex flex-col gap-3">
                <a className="hover:text-primary text-text-med text-sm md:text-base transition-colors font-medium" href="#how-it-works">How it Works</a>
                <a className="hover:text-primary text-text-med text-sm md:text-base transition-colors font-medium" href="#categories">Services</a>
                <a className="hover:text-primary text-text-med text-sm md:text-base transition-colors font-medium" href="#about">About</a>
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <span className="text-text-high font-black text-xs uppercase tracking-[0.2em] opacity-30">Support</span>
              <div className="flex flex-col gap-3">
                <a className="hover:text-primary text-text-med text-sm md:text-base transition-colors font-medium" href="#">Help Center</a>
                <a className="hover:text-primary text-text-med text-sm md:text-base transition-colors font-medium" href="#">Contact Us</a>
                <div className="relative mt-2">
                  <select className="appearance-none bg-surface border border-border text-text-med text-xs px-4 py-2.5 pr-10 rounded-xl outline-none w-full hover:border-primary transition-all cursor-pointer">
                    <option className="bg-background">English (US)</option>
                    <option className="bg-background">አማርኛ (Amharic)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-med/30 pointer-events-none text-sm">unfold_more</span>
                </div>
              </div>
            </div>
          </div>
        </div>
 
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-[11px] font-bold text-text-med/40 tracking-widest pt-10 border-t border-border/10 max-w-7xl mx-auto">
          <div className="uppercase">© {new Date().getFullYear()} DIRESKILL. A DIRE DAWA UNIVERSITY INITIATIVE.</div>
          <div className="flex gap-8 uppercase">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

