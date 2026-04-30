"use client";
import { motion } from "framer-motion";

export default function Hero({ userRole, t }) {
  const wp = userRole === "worker" ? "/worker/dashboard" : userRole === "admin" ? "/admin/dashboard" : "/client/search";

  const workers = [
    { name: "Samuel T.", skill: "Electrician", rating: 4.9, image: "/worker_profile_1_electrician_1777407356903.png" },
    { name: "Lydia K.", skill: "Painter", rating: 4.8, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400" },
    { name: "Dawit M.", skill: "Plumber", rating: 5.0, image: "/worker_profile_2_plumber_1777407389080.png" },
  ];

  return (
    <section id="home" className="relative w-full min-h-screen flex items-center bg-[#09090b] overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full opacity-50 pointer-events-none">
         <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-transparent to-[#09090b] z-10" />
         <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/80 via-transparent to-[#09090b]/80 z-10" />
         <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=85&w=2000" className="w-full h-full object-cover grayscale brightness-75" />
      </div>

      <div className="relative z-10 w-full max-w-[95%] mx-auto px-6 md:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-32 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="space-y-4">
               <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-400/10 border border-green-400/20"
               >
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Live in Dire Dawa</span>
               </motion.div>
               
               <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white leading-[1.1] uppercase max-w-xl">
                  Find Verified <span className="text-green-400 italic">Skilled Workers</span> in Dire Dawa
               </h1>
               <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-lg leading-relaxed">
                  Fast, Safe & Contract-Backed. Get Fayda-verified professionals with digital contracts and real ratings.
               </p>
            </div>

            {/* Hero Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch gap-3 p-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl max-w-2xl shadow-2xl">
              <div className="flex-1 flex items-center gap-3 px-5 py-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-green-400">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="What service do you need?" 
                  className="bg-transparent border-none outline-none text-white text-sm font-bold w-full placeholder:text-zinc-600"
                />
              </div>
              <button className="bg-green-400 text-black px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-green-300 transition-all shadow-[0_10px_30px_rgba(74,222,128,0.2)] py-4">
                SEARCH
              </button>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <a href="/client/search" className="px-8 h-14 flex items-center justify-center rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">
                Find a Worker
              </a>
              <a href="/register/worker" className="px-8 h-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Join as Professional
              </a>
            </div>
          </motion.div>

          {/* Right Content - Worker Cards */}
          <div className="hidden lg:flex relative h-[600px] items-center justify-center">
             {workers.map((worker, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: [0, i % 2 === 0 ? -15 : 15, 0],
                    rotate: [0, i % 2 === 0 ? 1 : -1, 0]
                  }}
                  transition={{ 
                    opacity: { duration: 0.8, delay: 0.4 + (i * 0.2) },
                    scale: { duration: 0.8, delay: 0.4 + (i * 0.2) },
                    y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className={`absolute w-72 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden group
                    ${i === 0 ? "top-10 -left-10" : i === 1 ? "bottom-20 -right-10" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"}`}
                  style={{ zIndex: i === 2 ? 20 : 10 }}
                >
                   <div className="absolute top-4 right-4 bg-green-400/20 border border-green-400/30 px-3 py-1 rounded-full flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Verified</span>
                   </div>
                   
                   <div className="flex items-center gap-5 mb-6">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10">
                         <img src={worker.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={worker.name} />
                      </div>
                      <div>
                         <h4 className="text-white font-black uppercase tracking-tight text-lg leading-tight">{worker.name}</h4>
                         <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{worker.skill}</p>
                      </div>
                   </div>

                   <div className="flex justify-between items-center gap-3 mb-6 bg-white/5 p-4 rounded-2xl">
                      <div className="text-center">
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Rating</p>
                         <p className="text-white font-black">{worker.rating} <span className="text-green-400">★</span></p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                         <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                         <p className="text-green-400 font-black">Online</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <button className="h-12 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">Hire</button>
                      <button className="h-12 rounded-xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Message</button>
                   </div>
                </motion.div>
             ))}
          </div>

        </div>
      </div>
    </section>
  );
}
